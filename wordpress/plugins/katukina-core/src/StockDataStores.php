<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

trait StockStoreBridge {
    public function update( &$product ) {
        if ( NativeStock::$syncing || ! NativeStock::lots( $product->get_id() ) ) { parent::update( $product ); return; }
        $changes = $product->get_changes();
        $target = array_key_exists( 'stock_quantity', $changes ) ? NativeStock::amount( $changes['stock_quantity'] ) : null;
        // Native editors carry a baseline to reject changes made from a stale screen.
        $expected = isset( $_POST['kat_stock_expected'][ $product->get_id() ] ) ? NativeStock::amount( wp_unslash( $_POST['kat_stock_expected'][ $product->get_id() ] ) ) : null;
        $selected_lot = absint( $_POST['kat_stock_lot'][ $product->get_id() ] ?? 0 );
        Database::command( 'native-stock.save', array( 'key' => wp_generate_uuid4(), 'product_id' => $product->get_id(), 'target' => $target, 'expected' => $expected, 'lot_id' => $selected_lot ), function () use ( &$product, $target, $expected, $selected_lot ) {
            if ( null !== $target ) { NativeStock::set_total( $product->get_id(), $target, $expected, $selected_lot ); }
            $product->set_manage_stock( true ); $product->set_stock_quantity( NativeStock::physical( $product->get_id() ) / 1000 );
            parent::update( $product );
            return array( 'id' => $product->get_id() );
        } );
    }
    public function update_product_stock( $product_id_with_stock, $stock_quantity = null, $operation = 'set' ) {
        if ( NativeStock::$syncing || ! NativeStock::lots( (int) $product_id_with_stock ) ) { return parent::update_product_stock( $product_id_with_stock, $stock_quantity, $operation ); }
        $result = Database::command( 'native-stock.update', array( 'key' => wp_generate_uuid4(), 'product_id' => $product_id_with_stock, 'quantity' => $stock_quantity, 'operation' => $operation ), static function () use ( $product_id_with_stock, $stock_quantity, $operation ) {
            if ( ! in_array( $operation, array( 'set', 'increase', 'decrease' ), true ) ) { throw new DomainError( 'Unknown stock operation.' ); }
            $amount = NativeStock::amount( $stock_quantity ); $current = NativeStock::physical( (int) $product_id_with_stock );
            $target = match ( $operation ) { 'increase' => $current + $amount, 'decrease' => $current - $amount, default => $amount };
            NativeStock::set_total( (int) $product_id_with_stock, $target );
            return array( 'id' => $product_id_with_stock, 'quantity' => $target / 1000 );
        } );
        return $result['quantity'];
    }
}
class StockProductStore extends \WC_Product_Data_Store_CPT { use StockStoreBridge; }
class StockVariationStore extends \WC_Product_Variation_Data_Store_CPT { use StockStoreBridge; }
class StockVariableStore extends \WC_Product_Variable_Data_Store_CPT { use StockStoreBridge; }
