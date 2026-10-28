<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class ProductionAdmin {
    public static function register(): void { add_action( 'admin_post_katukina_production', array( self::class, 'save' ) ); }
    private static function authorize(): void { if ( ! current_user_can( 'katukina_inventory' ) ) { wp_die( 'Inventory permission required.', '', array( 'response' => 403 ) ); } }
    private static function url(): string { return admin_url( 'edit.php?post_type=product&page=katukina-production' ); }
    public static function render(): void {
        self::authorize(); global $wpdb;
        echo '<div class="wrap"><h1>Production</h1><p>Plan the material and packaging to consume. Reserve it before completing production. Completion records all inputs, finished lots, losses and costs together.</p>';
        echo '<p><a class="page-title-action" href="' . esc_url( self::url() . '&new=1' ) . '">Plan production</a> <a href="' . esc_url( admin_url( 'edit.php?post_type=product&page=katukina-lots&operation=production' ) ) . '">Previous repacking runs</a></p>';
        if ( isset( $_GET['new'] ) ) { self::editor(); }
        elseif ( ! empty( $_GET['job_id'] ) ) {
            try { $job = Production::get( absint( $_GET['job_id'] ) ); } catch ( DomainError $error ) { wp_die( esc_html( $error->getMessage() ) ); }
            echo '<h2>Production #' . esc_html( $job['id'] ) . ' — ' . esc_html( $job['state'] ) . '</h2><h3>Inputs</h3><table class="widefat striped"><tr><th>Lot</th><th>Quantity (base units)</th><th>Use</th></tr>';
            foreach ( $job['plan']['inputs'] as $entry ) { $lot = Inventory::lot( $entry['lot_id'] ); echo '<tr><td>' . esc_html( $lot['code'] ) . '</td><td>' . esc_html( Database::number( $entry['quantity'] ) ) . '</td><td>' . esc_html( $entry['role'] ) . '</td></tr>'; }
            echo '</table><h3>Outputs</h3><table class="widefat striped"><tr><th>Product</th><th>Lot</th><th>Packs</th></tr>';
            foreach ( $job['plan']['outputs'] as $entry ) { $form = Registry::get( $entry['form_id'], 'form', false ); echo '<tr><td>' . esc_html( $form['data']['name'] ) . '</td><td>' . esc_html( $entry['code'] ) . '</td><td>' . esc_html( Database::number( $entry['quantity'] ) ) . '</td></tr>'; }
            echo '</table><p>Loss: ' . esc_html( Database::number( $job['plan']['loss'] ) . ' ' . $job['plan']['unit'] ) . '</p>';
            if ( $job['result'] ) { echo '<p>Completed: ' . esc_html( $job['result']['completed_at'] ) . '. Cost: ' . esc_html( null === $job['result']['cost_minor'] ? 'Incomplete input cost information' : $job['result']['cost_minor'] . ' minor units ' . $job['result']['currency'] ) . '</p>'; }
            if ( in_array( $job['state'], array( 'planned', 'reserved' ), true ) ) {
                self::form_start(); echo '<input type="hidden" name="job_id" value="' . esc_attr( $job['id'] ) . '"><p><label>Reason <input name="reason" required class="regular-text"></label></p>';
                echo '<button class="button button-primary" name="operation" value="' . ( 'planned' === $job['state'] ? 'reserve-production' : 'complete-production' ) . '">' . ( 'planned' === $job['state'] ? 'Reserve inputs' : 'Complete production' ) . '</button> <button class="button" name="operation" value="cancel-production">Cancel and release inputs</button></form>';
            }
        } else {
            $page = max( 1, absint( $_GET['paged'] ?? 1 ) );
            $rows = $wpdb->get_results( $wpdb->prepare( 'SELECT id,state,created_at,updated_at FROM ' . Database::table( 'production_jobs' ) . ' ORDER BY id DESC LIMIT 50 OFFSET %d', ( $page - 1 ) * 50 ), ARRAY_A );
            echo '<table class="wp-list-table widefat striped"><tr><th>Production order</th><th>Status</th><th>Created (UTC)</th><th>Updated (UTC)</th></tr>';
            foreach ( $rows as $row ) { echo '<tr><td><a href="' . esc_url( self::url() . '&job_id=' . $row['id'] ) . '">#' . esc_html( $row['id'] ) . '</a></td><td>' . esc_html( $row['state'] ) . '</td><td>' . esc_html( $row['created_at'] ) . '</td><td>' . esc_html( $row['updated_at'] ) . '</td></tr>'; }
            if ( ! $rows ) { echo '<tr><td colspan="4">No production orders.</td></tr>'; } echo '</table>';
            if ( $page > 1 ) { echo '<a href="' . esc_url( self::url() . '&paged=' . ( $page - 1 ) ) . '">Previous</a> '; }
            if ( count( $rows ) === 50 ) { echo '<a href="' . esc_url( self::url() . '&paged=' . ( $page + 1 ) ) . '">Next</a>'; }
        }
        echo '</div>';
    }
    private static function form_start(): void {
        echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="katukina_production"><input type="hidden" name="key" value="' . esc_attr( wp_generate_uuid4() ) . '">'; wp_nonce_field( 'katukina_production' );
    }
    private static function editor(): void {
        global $wpdb; self::form_start();
        echo '<h2>Inputs</h2><p>Enter quantities in each lot’s base unit (g, ml or units). Include packaging when tracked. Unused rows are ignored.</p><table class="widefat"><tr><th>Lot</th><th>Quantity to consume</th><th>Use</th></tr>';
        $lots = $wpdb->get_results( 'SELECT id,code,form_id,balance,reserved FROM ' . Database::table( 'lots' ) . ' WHERE balance>reserved ORDER BY id DESC LIMIT 1000', ARRAY_A );
        for ( $i = 0; $i < 10; $i++ ) {
            echo '<tr><td><select name="inputs[' . $i . '][lot_id]"><option value="">Select lot…</option>';
            foreach ( $lots as $lot ) { $form = Registry::get( (int) $lot['form_id'], 'form', false ); echo '<option value="' . esc_attr( $lot['id'] ) . '">' . esc_html( $lot['code'] . ' — ' . $form['data']['name'] . ' (' . Database::number( $lot['balance'] - $lot['reserved'] ) . ' ' . $form['data']['unit'] . ')' ) . '</option>'; }
            echo '</select></td><td><input name="inputs[' . $i . '][quantity]" inputmode="decimal"></td><td><select name="inputs[' . $i . '][role]"><option value="material">Bulk material</option><option value="packaging">Packaging</option></select></td></tr>';
        }
        echo '</table><h2>Outputs</h2><table class="widefat"><tr><th>Product / variation</th><th>Packs</th><th>New lot code</th></tr>';
        $forms = Registry::all( 'form' );
        for ( $i = 0; $i < 10; $i++ ) {
            echo '<tr><td><select name="outputs[' . $i . '][form_id]"><option value="">Select product…</option>';
            foreach ( $forms as $form ) { if ( $form['data']['active'] && 'packaged' === $form['data']['type'] ) { echo '<option value="' . esc_attr( $form['id'] ) . '">' . esc_html( $form['data']['name'] . ' (' . $form['code'] . ')' ) . '</option>'; } }
            echo '</select></td><td><input name="outputs[' . $i . '][quantity]" inputmode="numeric"></td><td><input name="outputs[' . $i . '][code]"></td></tr>';
        }
        echo '</table><p><label>Loss in bulk base units <input name="loss" value="0" required></label></p><p><label>Reason <input name="reason" class="regular-text" required></label></p><button class="button button-primary" name="operation" value="plan-production">Save production plan</button></form>';
    }
    public static function save(): void {
        self::authorize(); check_admin_referer( 'katukina_production' ); $id = 0;
        try {
            $action = sanitize_key( $_POST['operation'] ?? '' );
            if ( ! in_array( $action, array( 'plan-production', 'reserve-production', 'complete-production', 'cancel-production' ), true ) ) { throw new DomainError( 'Unknown production operation.' ); }
            $input = wp_unslash( array_intersect_key( $_POST, array_flip( array( 'key', 'reason', 'job_id', 'loss', 'inputs', 'outputs' ) ) ) );
            if ( 'plan-production' === $action ) { foreach ( array( 'inputs' => 'lot_id', 'outputs' => 'form_id' ) as $type => $field ) { $input[ $type ] = array_values( array_filter( $input[ $type ] ?? array(), static fn( $row ) => ! empty( $row[ $field ] ) ) ); } }
            $method = OperationsApi::ACTIONS[ $action ]; $result = Database::command( $action, $input, array( $method[1], $method[2] ) ); $id = $result['id']; NativeAdmin::notice( 'Production order saved.' );
        } catch ( \Throwable $error ) { NativeAdmin::notice( $error->getMessage(), 'error' ); }
        wp_safe_redirect( $id ? self::url() . '&job_id=' . $id : ( wp_get_referer() ?: self::url() ) ); exit;
    }
}
