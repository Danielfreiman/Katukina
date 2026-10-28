<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class Reports {
    public static function register(): void {
        add_action( 'admin_menu', static function () { add_submenu_page( 'woocommerce', 'Accounting exports', 'Accounting exports', 'katukina_finance', 'katukina-accounting', array( self::class, 'page' ) ); } );
        add_action( 'admin_post_katukina_accounting', array( self::class, 'download' ) );
    }
    public static function page(): void {
        if ( ! current_user_can( 'katukina_finance' ) ) { wp_die( 'Finance permission required.', '', array( 'response' => 403 ) ); }
        echo '<div class="wrap"><h1>Accounting exports</h1><p>Native order totals, taxes and refunds, separated by currency and channel. This operational export does not replace the accountant’s approved filing format.</p><form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="katukina_accounting">';
        wp_nonce_field( 'katukina_accounting' );
        echo '<p><label>From (UTC) <input type="date" name="from" required></label> <label>Until (UTC) <input type="date" name="to" required></label></p><p><label><input type="checkbox" name="include_tests" value="1"> Include local test orders</label></p>'; submit_button( 'Download CSV' ); echo '</form></div>';
    }
    public static function cell( mixed $value ): string {
        $value = (string) $value;
        return preg_match( '/^[\s]*[=+@\-]/u', $value ) ? "'" . $value : $value;
    }
    public static function accounting_row( \WC_Order $order ): array {
        $precision = Finance::precision( $order ); $channel = (int) $order->get_meta( '_katukina_channel_id' );
        try { $channel = (int) Workflow::get( $order->get_id() )['channel_id']; } catch ( DomainError $error ) {}
        $total = Finance::to_minor( $order->get_total(), $precision ); $refund = Finance::to_minor( (string) $order->get_total_refunded(), $precision );
        $created = $order->get_date_created();
        if ( $created ) { $created = clone $created; $created->setTimezone( new \DateTimeZone( 'UTC' ) ); }
        return array( 'order_id' => $order->get_id(), 'created_utc' => $created?->format( 'Y-m-d H:i:s' ), 'channel_id' => $channel, 'status' => $order->get_status(), 'currency' => $order->get_currency(), 'total' => $order->get_total(), 'tax' => $order->get_total_tax(), 'shipping' => $order->get_shipping_total(), 'discount' => $order->get_discount_total(), 'refunded' => Finance::from_minor( $refund, $precision ), 'net_after_refunds' => Finance::from_minor( $total - $refund, $precision ), 'gateway' => $order->get_payment_method(), 'transaction_id' => $order->get_transaction_id(), 'test_order' => $order->get_meta( '_katukina_test_order' ) === 'yes' ? 'yes' : 'no' );
    }
    public static function download(): void {
        if ( ! current_user_can( 'katukina_finance' ) ) { wp_die( 'Finance permission required.', '', array( 'response' => 403 ) ); } check_admin_referer( 'katukina_accounting' );
        $from = sanitize_text_field( wp_unslash( $_POST['from'] ?? '' ) ); $to = sanitize_text_field( wp_unslash( $_POST['to'] ?? '' ) );
        foreach ( array( $from, $to ) as $date ) { $valid = \DateTimeImmutable::createFromFormat( '!Y-m-d', $date, new \DateTimeZone( 'UTC' ) ); if ( ! $valid || $valid->format( 'Y-m-d' ) !== $date ) { wp_die( 'Invalid date range.' ); } }
        if ( $to < $from ) { wp_die( 'End date precedes start date.' ); }
        nocache_headers(); header( 'Content-Type: text/csv; charset=utf-8' ); header( 'Content-Disposition: attachment; filename="katukina-orders-' . $from . '-' . $to . '.csv"' );
        $stream = fopen( 'php://output', 'w' ); $heading = false; $page = 1;
        do {
            $query = wc_get_orders( array( 'limit' => 100, 'page' => $page++, 'paginate' => true, 'type' => 'shop_order', 'orderby' => 'ID', 'order' => 'ASC', 'date_created' => strtotime( $from . ' UTC' ) . '...' . ( strtotime( $to . ' UTC' ) + DAY_IN_SECONDS - 1 ) ) );
            foreach ( $query->orders as $order ) {
                if ( empty( $_POST['include_tests'] ) && 'yes' === $order->get_meta( '_katukina_test_order' ) ) { continue; }
                $row = self::accounting_row( $order ); if ( ! $heading ) { fputcsv( $stream, array_keys( $row ), ',', '"', '' ); $heading = true; }
                fputcsv( $stream, array_map( array( self::class, 'cell' ), $row ), ',', '"', '' );
            }
        } while ( $page <= $query->max_num_pages );
        fclose( $stream ); exit;
    }
}
