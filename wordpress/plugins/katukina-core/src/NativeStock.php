<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** One ledger after first receipt; WooCommerce quantities are its physical-stock projection. */
final class NativeStock {
    public static bool $syncing = false;
    public static bool $preparing = false;
    private static array $touched = array();
    public static function rollback_caches(): void {
        foreach ( array_keys(self::$touched) as $id ) { clean_post_cache($id); wp_cache_delete($id,'post_meta'); wc_delete_product_transients($id); }
    }
    public static function register(): void {
        // WooCommerce supports decimal inventory via this filter. Packaged units
        // remain integral in NativeCatalog::guard and Inventory::move.
        add_action('woocommerce_init',static function(){
            remove_filter('woocommerce_stock_amount','intval');
            add_filter('woocommerce_stock_amount','floatval');
        });
        add_filter( 'woocommerce_data_stores', static function ( $stores ) {
            require_once __DIR__ . '/StockDataStores.php';
            foreach ( array( 'product' => array( 'WC_Product_Data_Store_CPT', StockProductStore::class ), 'product-variation' => array( 'WC_Product_Variation_Data_Store_CPT', StockVariationStore::class ), 'product-variable' => array( 'WC_Product_Variable_Data_Store_CPT', StockVariableStore::class ) ) as $key => $classes ) {
                if ( ( $stores[$key] ?? '' ) === $classes[0] ) { $stores[$key] = $classes[1]; }
            }
            return $stores;
        } );
    }
    public static function lots( int $product_id ): array {
        global $wpdb; $form = (int) get_post_meta( $product_id, '_kat_form_record_id', true );
        return $form ? $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'lots' ) . ' WHERE form_id=%d ORDER BY id', $form ), ARRAY_A ) : array();
    }
    public static function physical( int $product_id ): int { return array_sum( array_map( static fn($lot) => (int) $lot['balance'], self::lots( $product_id ) ) ); }
    public static function reconcile(): array {
        global $wpdb; $errors=array();
        foreach($wpdb->get_col('SELECT DISTINCT form_id FROM '.Database::table('lots')) as $form_id){
            $form=Registry::get((int)$form_id,'form',false);$id=(int)($form['data']['product_id']??0);$product=$id?wc_get_product($id):false;
            if(!$product){continue;}
            $native=(int)round((float)$product->get_stock_quantity('edit')*1000);$physical=self::physical($id);
            if($native!==$physical){$errors[]=array('id'=>'product:'.$id,'code'=>'SKU '.$product->get_sku(),'balance'=>$native,'reserved'=>null,'ledger_balance'=>$physical,'ledger_reserved'=>null,'active_reserved'=>null);}
        }
        return $errors;
    }
    public static function amount( mixed $quantity ): int {
        if ( is_numeric( $quantity ) && (float) $quantity === 0.0 ) { return 0; }
        return Database::quantity( (string) $quantity );
    }
    /** Called under the inventory command mutex, before the first physical receipt. */
    public static function prepare_receipt( array $input ): void {
        $form = Registry::get( Registry::positive_id( $input['form_id'] ?? 0 ), 'form' );
        $product = wc_get_product( $form['data']['product_id'] );
        if ( self::$preparing || ! $product || self::lots( $product->get_id() ) ) { return; }
        $owner = wc_get_product( $product->get_stock_managed_by_id() );
        if ( $owner->get_id() !== $product->get_id() && count( $owner->get_children() ) !== 1 ) {
            throw new DomainError( 'This parent shares stock across multiple variations. Allocate its existing stock to individual variations in Products before receiving lots.', 409 );
        }
        if ( function_exists( 'wc_get_held_stock_quantity' ) && wc_get_held_stock_quantity( $owner ) > 0 ) { throw new DomainError( 'This product has pending native stock reservations. Resolve them before the first lot receipt.', 409 ); }
        $opening = $owner->managing_stock() ? self::amount( $owner->get_stock_quantity( 'edit' ) ?? 0 ) : 0;
        if ( $opening && ! filter_var($input['import_native_stock'] ?? false,FILTER_VALIDATE_BOOLEAN) ) { throw new DomainError( 'Confirm transfer of existing WooCommerce stock to an opening lot in the selected warehouse. The received quantity will be added to that balance.', 409 ); }
        if ( $owner->get_id() !== $product->get_id() ) {
            self::$touched[$owner->get_id()] = true;
            self::$syncing = true;
            try { $owner->set_manage_stock( false ); $owner->set_stock_quantity( null ); $owner->save(); } finally { self::$syncing = false; }
        }
        if ( $opening ) {
            self::$preparing = true;
            try {
            $lot = Inventory::create_lot( array( 'form_id' => $form['id'], 'warehouse_id' => $input['warehouse_id'], 'code' => 'OPENING-' . $product->get_id() . '-' . wp_generate_uuid4() ) );
            Inventory::move( (int) $lot['id'], $opening, 0, 'native_opening', 'native-opening:' . $product->get_id(), 'Confirmed transfer of existing WooCommerce physical stock; not a new delivery.' );
            } finally { self::$preparing = false; }
        }
    }
    public static function sync( int $product_id ): void {
        self::$touched[$product_id] = true;
        $product = wc_get_product( $product_id );
        if ( ! $product ) { return; }
        self::$syncing = true;
        try {
            $quantity = self::physical( $product_id ) / 1000;
            $product->set_manage_stock( true ); $product->set_stock_quantity( $quantity ); $product->set_stock_status( $quantity > 0 ? 'instock' : 'outofstock' ); $product->save();
            if ( $product->get_parent_id() ) { self::$touched[$product->get_parent_id()] = true; \WC_Product_Variable::sync( $product->get_parent_id() ); }
            wc_delete_product_transients( $product_id );
        } finally { self::$syncing = false; }
    }
    /** Native total edits must identify one lot; never distribute a difference arbitrarily. */
    public static function set_total( int $product_id, int $target, ?int $expected = null, int $selected_lot = 0 ): void {
        $lots = self::lots( $product_id ); $current = self::physical( $product_id );
        if ( null !== $expected && $expected !== $current ) { throw new DomainError( 'Stock changed while this editor was open. Reload the product and try again.', 409 ); }
        $delta = $target - $current; if ( ! $delta ) { return; }
        if ( $selected_lot ) { $lots = array_values(array_filter($lots,static fn($lot)=>(int)$lot['id']===$selected_lot)); }
        if ( count( $lots ) !== 1 ) { throw new DomainError( 'Choose the affected stock lot in Origin and packaging, or use Products > Lots and repacking > Adjust stock. WooCommerce will update automatically.', 409 ); }
        Inventory::move( (int) $lots[0]['id'], $delta, 0, 'native_adjustment', 'native:' . wp_generate_uuid4(), 'Physical stock adjusted through the native WooCommerce product editor or stock API.' );
    }
}
