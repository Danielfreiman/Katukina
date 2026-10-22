<?php
/** Run with wp eval-file; creates and removes only uniquely identified local fixtures. */
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || wp_get_environment_type() !== 'local' ) { throw new RuntimeException( 'Local CLI only.' ); }
use Katukina\Core\Database as D;
use Katukina\Core\Registry as R;
use Katukina\Core\Inventory as I;
use Katukina\Core\Workflow as W;
use Katukina\Core\Finance as F;
use Katukina\Core\OperationsApi as A;
use Katukina\Core\DomainError;
use Katukina\Core\Commerce;
global $wpdb;
$prefix = 'testops-' . bin2hex( random_bytes( 6 ) ); $checks = 0; $serial = 0; $orders = array(); $products = array(); $actor = 0; $original_channel = get_option( 'katukina_storefront_channel' );
$assert = static function ( bool $condition, string $name ) use ( &$checks ) { if ( ! $condition ) { throw new RuntimeException( 'Assertion failed: ' . $name ); } $checks++; };
$reject = static function ( callable $fn, string $name ) use ( $assert ) { $failed = false; try { $fn(); } catch ( DomainError $e ) { $failed = true; } $assert( $failed, $name ); };
$command = static function ( string $action, array $input, callable $fn, ?string $key = null ) use ( $prefix, &$serial ) { return D::command( $action, $input + array( 'key' => $key ?? $prefix . '-' . ++$serial ), $fn ); };
$record = static function ( string $kind, string $code, array $data ) use ( $command, $prefix ) { return $command( 'record.save', array( 'kind' => $kind, 'code' => $prefix . '-' . $code, 'data' => $data + array( 'active' => true ) ), array( R::class, 'save' ) ); };
try {
    $actor = wp_insert_user( array( 'user_login' => $prefix, 'user_pass' => wp_generate_password( 40 ), 'role' => 'administrator', 'user_email' => $prefix . '@example.invalid' ) );
    if ( is_wp_error( $actor ) ) { throw new RuntimeException( 'Fixture user failed.' ); } wp_set_current_user( $actor );
    $company = $record( 'company', 'company', array( 'name' => 'Test owner', 'country' => 'GB', 'currency' => 'USD' ) );
    $warehouse = $record( 'warehouse', 'warehouse', array( 'name' => 'Test warehouse', 'company_id' => $company['id'] ) );
    $channel = $record( 'channel', 'channel', array( 'name' => 'Test channel', 'company_id' => $company['id'], 'warehouse_id' => $warehouse['id'], 'language' => 'en', 'currency' => 'USD', 'display_currency' => 'USD', 'countries' => 'GB' ) );
    $product = new WC_Product_Simple(); $product->set_name( $prefix ); $product->set_status( 'draft' ); $product->set_regular_price( '10' ); $product->set_low_stock_amount( 2 );
    $product->update_meta_data( '_kat_content_unit', 'g' ); $product->update_meta_data( '_kat_content_quantity', '25' ); $product->save(); $products[] = $product;
    $item = R::get( (int) get_post_meta( $product->get_id(), '_kat_item_record_id', true ), 'item' );
    $raw = new WC_Product_Simple(); $raw->set_name( $prefix . ' bulk' ); $raw->set_status( 'draft' );
    foreach ( array( 'type' => 'bulk', 'unit' => 'g', 'content_unit' => 'g', 'content_quantity' => '1', 'origin_product_id' => $product->get_id() ) as $key => $value ) { $raw->update_meta_data( '_kat_' . $key, $value ); } $raw->save(); $products[] = $raw;
    $bulk = R::get( (int) get_post_meta( $raw->get_id(), '_kat_form_record_id', true ), 'form' );
    $form = R::get( (int) get_post_meta( $product->get_id(), '_kat_form_record_id', true ), 'form' );
    $reject( fn() => $record( 'form', 'duplicate-product', $form['data'] ), 'duplicate product binding' );
    $reject( fn() => $command( 'record.save', array( 'id' => $company['id'], 'version' => 99, 'kind' => 'company', 'code' => $company['code'], 'data' => $company['data'] ), array( R::class, 'save' ) ), 'optimistic version' );
    $receive = array( 'code' => $prefix . '-raw', 'form_id' => $bulk['id'], 'warehouse_id' => $warehouse['id'], 'quantity' => '1000', 'reason' => 'Local integration fixture' );
    $lot = $command( 'receive', $receive, array( I::class, 'receive' ), $prefix . '-receipt' );
    $replay = $command( 'receive', $receive, array( I::class, 'receive' ), $prefix . '-receipt' );
    $assert( $lot['id'] === $replay['id'] && (int) $replay['balance'] === 1000000, 'receipt replay' );
    $reject( fn() => $command( 'receive', array_merge( $receive, array( 'quantity' => '2' ) ), array( I::class, 'receive' ), $prefix . '-receipt' ), 'idempotency mismatch' );
    $produce = array( 'input_lot_id' => $lot['id'], 'form_id' => $form['id'], 'code' => $prefix . '-packed', 'quantity' => '10', 'loss' => '5', 'reason' => 'Test split' );
    $batch = $command( 'produce', $produce, array( I::class, 'produce' ) );
    $assert( $batch['consumed'] === 255000 && $batch['remaining'] === 745000 && $batch['produced'] === 10000, 'conservation and loss' );
    $before = (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . D::table( 'lots' ) );
    $reject( fn() => $command( 'produce', array_merge( $produce, array( 'code' => $prefix . '-impossible', 'quantity' => '100' ) ), array( I::class, 'produce' ) ), 'insufficient bulk' );
    $assert( $before === (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . D::table( 'lots' ) ), 'failed production rollback' );
    $assert( (int) I::lot( (int) $lot['id'] )['balance'] === 745000, 'failed production leaves input' );
    $reject( static function () use ( $product ) { $changed = wc_get_product( $product->get_id() ); $changed->update_meta_data( '_kat_content_quantity', '50' ); $changed->save(); }, 'native product lot identity immutable' );
    $order = wc_create_order(); $orders[] = $order; $order->set_currency( 'USD' ); $order->set_customer_id( $actor ); $line_id = $order->add_product( $product, 10 ); $order->calculate_totals(); $order->save();
    $workflow = $command( 'assign-order', array( 'order_id' => $order->get_id(), 'channel_id' => $channel['id'], 'reason' => 'Test channel assignment' ), array( W::class, 'initialize' ) );
    $transition = array( 'order_id' => $order->get_id(), 'version' => 1, 'state' => 'packed_pending', 'reason' => 'Pack test', 'short_note' => 'Integration test' );
    $reject( fn() => $command( 'transition', $transition, array( W::class, 'transition' ) ), 'unconfigured transition denied' );
    $record( 'transition', 'pack-rule', array( 'name' => 'Test only', 'from' => 'ordered', 'to' => 'packed_pending', 'approval_reference' => 'Temporary integration fixture; removed after test' ) );
    $reject( fn() => $command( 'transition', $transition, array( W::class, 'transition' ) ), 'cannot pack unreserved order' );
    $reserve = array( 'lot_id' => $batch['output_lot_id'], 'order_id' => $order->get_id(), 'line_id' => $line_id, 'quantity' => '10', 'expires_at' => gmdate( 'Y-m-d H:i:s', time() + 3600 ), 'reason' => 'Test reservation' );
    $expiring = $command( 'reserve', $reserve, array( I::class, 'reserve' ) );
    $wpdb->update( D::table( 'reservations' ), array( 'expires_at' => gmdate( 'Y-m-d H:i:s', time() - 10 ) ), array( 'id' => $expiring['id'] ) );
    $expired = $command( 'expire', array(), array( I::class, 'expire' ) );
    $assert( $expired['expired'] >= 1 && (int) I::lot( $batch['output_lot_id'] )['reserved'] === 0, 'expiration restores availability' );
    $reservation = $command( 'reserve', $reserve, array( I::class, 'reserve' ) );
    $physical = I::lot( $batch['output_lot_id'] ); $assert( (int) $physical['balance'] === 10000 && (int) $physical['reserved'] === 10000, 'reservation preserves physical' );
    $reject( fn() => $command( 'reserve', $reserve, array( I::class, 'reserve' ) ), 'over reservation denied' );
    $reject( fn() => $command( 'adjust', array( 'lot_id' => $batch['output_lot_id'], 'quantity' => '-1', 'reason' => 'Cannot take reserved' ), array( I::class, 'adjust' ) ), 'cannot adjust reserved stock' );
    $packed = $command( 'transition', $transition, array( W::class, 'transition' ), $prefix . '-pack-once' );
    $command( 'transition', $transition, array( W::class, 'transition' ), $prefix . '-pack-once' );
    $physical = I::lot( $batch['output_lot_id'] ); $assert( (int) $physical['balance'] === 0 && (int) $physical['reserved'] === 0, 'pack debits once' );
    $assert( (bool) $packed['packed_at'] && $packed['short_note'] === 'Integration test', 'operational status and short note' );
    $reject( fn() => $command( 'reverse-production', array( 'production_id' => $batch['id'], 'reason' => 'Already shipped output' ), array( I::class, 'reverse_production' ) ), 'cannot reverse consumed output' );
    $second = $command( 'produce', array_merge( $produce, array( 'code' => $prefix . '-reverse' ) ), array( I::class, 'produce' ) );
    $command( 'reverse-production', array( 'production_id' => $second['id'], 'reason' => 'Reverse unused batch' ), array( I::class, 'reverse_production' ) );
    $assert( (int) I::lot( (int) $lot['id'] )['balance'] === 745000, 'compensating production reversal' );
    $assert( count( I::reconcile() ) === 0, 'ledger reconciliation' );
    $money = array( 'kind' => 'credit', 'customer_id' => $actor, 'currency' => 'USD', 'minor_unit' => 2, 'amount' => '1000', 'reference' => $prefix . '-credit', 'reason' => 'Test store credit' );
    $credit = $command( 'money', $money, array( F::class, 'record' ), $prefix . '-money-once' );
    $assert( $credit === $command( 'money', $money, array( F::class, 'record' ), $prefix . '-money-once' ), 'credit replay' );
    $reject( fn() => $command( 'money', array_merge( $money, array( 'amount' => '-1001', 'reference' => $prefix . '-overdraft' ) ), array( F::class, 'record' ) ), 'credit cannot overdraw' );
    $reject( fn() => $command( 'money', array_merge( $money, array( 'currency' => 'EUR', 'amount' => '-1', 'reference' => $prefix . '-other-currency' ) ), array( F::class, 'record' ) ), 'currency isolation' );
    $draft = A::import( array( 'kind' => 'supplier', 'rows' => array( array( 'code' => $prefix . '-import', 'data' => array( 'name' => 'Dry run', 'active' => true ) ) ) ), false );
    $assert( $draft['valid'] && ! $draft['committed'], 'dry run' );
    $assert( (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . D::table( 'records' ) . ' WHERE code=%s', $prefix . '-import' ) ) === 0, 'dry run writes nothing' );
    // Destination validation must run on the server, independently of the checkout UI.
    update_option( 'katukina_storefront_channel', (int) $channel['id'] );
    $order->set_shipping_country( 'FR' ); $order->set_billing_country( 'FR' );
    $checkout_request = new WP_REST_Request( 'POST', '/wc/store/v1/checkout' );
    $reject_checkout = static function ( callable $fn, string $name ) use ( $assert ) { $failed = false; try { $fn(); } catch ( \Automattic\WooCommerce\StoreApi\Exceptions\RouteException $error ) { $failed = true; } $assert( $failed, $name ); };
    $reject_checkout( fn() => Commerce::validate_destination( $order, $checkout_request ), 'country restriction server side' );
    $order->set_shipping_country( 'GB' ); $order->set_billing_country( 'GB' );
    $notice = $record( 'country', 'notice', array( 'name' => 'Test notice', 'country' => 'GB', 'channel_id' => $channel['id'], 'checkout_warning' => 'Test acceptance notice', 'backoffice_note' => 'PRIVATE-FIXTURE-NOTE', 'requires_acceptance' => true ) );
    $reject_checkout( fn() => Commerce::validate_destination( $order, $checkout_request ), 'destination acceptance required' );
    $checkout_request->set_param( 'extensions', array( 'katukina' => array( 'acceptance' => array( 'id' => $notice['id'], 'version' => $notice['version'], 'accepted' => true ) ) ) );
    Commerce::validate_destination( $order, $checkout_request );
    $assert( $order->get_meta( '_katukina_destination_acceptance' )['country'] === 'GB', 'contextual acceptance snapshot' );
    $assert( ! str_contains( wp_json_encode( Commerce::public_config() ), 'PRIVATE-FIXTURE-NOTE' ), 'internal country notes stay private' );
    $product->update_meta_data( '_kat_blocked_countries', 'GB' ); $product->save();
    $reject_checkout( fn() => Commerce::validate_destination( $order, $checkout_request ), 'acceptance never bypasses product restriction' );
    $product->update_meta_data( '_kat_blocked_countries', '' ); $product->save();
    $checkout_batch = $command( 'produce', array_merge( $produce, array( 'code' => $prefix . '-checkout', 'quantity' => '1', 'loss' => '0' ) ), array( I::class, 'produce' ) );
    $checkout_order = wc_create_order(); $orders[] = $checkout_order; $checkout_order->set_currency( 'USD' ); $checkout_order->add_product( $product, 1 ); $checkout_order->save();
    Commerce::allocate( $checkout_order ); Commerce::allocate( $checkout_order );
    $assert( (int) I::lot( $checkout_batch['output_lot_id'] )['reserved'] === 1000, 'checkout reserves once without physical debit' );
    $wpdb->update( D::table( 'reservations' ), array( 'expires_at' => gmdate( 'Y-m-d H:i:s', time() - 10 ) ), array( 'order_id' => $checkout_order->get_id() ) );
    $reject_checkout( fn() => Commerce::allocate( $checkout_order ), 'checkout retry cannot reuse expired allocation' );
    // Ordinary native inventory remains usable without any lot configuration.
    $native = new WC_Product_Simple(); $native->set_name( $prefix . '-native-stock' ); $native->set_status( 'draft' ); $native->set_regular_price( '3' ); $native->set_manage_stock( true ); $native->set_stock_quantity( 3 ); $native->save(); $products[] = $native;
    $native_order = wc_create_order(); $orders[] = $native_order; $native_order->set_currency( 'USD' ); $native_order->add_product( $native, 1 ); $native_order->calculate_totals(); $native_order->save();
    Commerce::allocate( $native_order );
    $assert( (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM ' . D::table( 'reservations' ) . ' WHERE order_id=%d', $native_order->get_id() ) ) === 0, 'native stock needs no lot reservations' );
    $native_order->update_status( 'on-hold' );
    $assert( (int) wc_get_product( $native->get_id() )->get_stock_quantity() === 2, 'WooCommerce reduces native stock' );
    $command( 'transition', array( 'order_id' => $native_order->get_id(), 'version' => 1, 'state' => 'packed_pending', 'reason' => 'Native order packing' ), array( W::class, 'transition' ) );
    wc_maybe_reduce_stock_levels( $native_order->get_id() );
    $assert( (int) wc_get_product( $native->get_id() )->get_stock_quantity() === 2, 'operational packing does not double debit native stock' );
    $role_user = get_user_by( 'id', $actor ); $role_user->set_role( 'customer' ); wp_set_current_user( 0 ); wp_set_current_user( $actor );
    $request = new WP_REST_Request( 'GET', '/katukina/v1/report/money' ); $assert( rest_do_request( $request )->get_status() === 403, 'customer finance permission denied' );
    wp_set_current_user( 0 ); $request = new WP_REST_Request( 'GET', '/katukina/v1/report/lots' ); $response = rest_do_request( $request ); $assert( $response->get_status() === 401, 'anonymous inventory denied' );
    wp_set_current_user( $actor );
    WP_CLI::success( $checks . ' operational assertions passed.' );
} finally {
    update_option( 'katukina_storefront_channel', $original_channel );
    // Only records created by this run; never truncate domain tables.
    $lot_ids = $wpdb->get_col( $wpdb->prepare( 'SELECT id FROM ' . D::table( 'lots' ) . ' WHERE code LIKE %s', $wpdb->esc_like( $prefix ) . '%' ) );
    if ( $lot_ids ) { $ids = implode( ',', array_map( 'intval', $lot_ids ) ); foreach ( array( 'movements', 'reservations' ) as $table ) { $wpdb->query( 'DELETE FROM ' . D::table( $table ) . " WHERE lot_id IN ($ids)" ); } $wpdb->query( 'DELETE FROM ' . D::table( 'production' ) . " WHERE input_lot_id IN ($ids)" ); $wpdb->query( 'DELETE FROM ' . D::table( 'lots' ) . " WHERE id IN ($ids)" ); }
    foreach ( $orders as $order ) { $wpdb->delete( D::table( 'orders' ), array( 'order_id' => $order->get_id() ) ); $wpdb->delete( D::table( 'commands' ), array( 'idempotency_key' => 'checkout-order-' . $order->get_id() ) ); $order->delete( true ); }
    $mapping_ids = array(); foreach ( $products as $product ) { foreach ( array( 'item', 'form' ) as $kind ) { $mapping_ids[] = (int) get_post_meta( $product->get_id(), '_kat_' . $kind . '_record_id', true ); } $product->delete( true ); }
    foreach ( array_filter( array_unique( $mapping_ids ) ) as $id ) { $wpdb->delete( D::table( 'records' ), array( 'id' => $id ) ); }
    $wpdb->query( $wpdb->prepare( 'DELETE FROM ' . D::table( 'records' ) . ' WHERE code LIKE %s', $wpdb->esc_like( $prefix ) . '%' ) );
    $wpdb->query( $wpdb->prepare( 'DELETE FROM ' . D::table( 'commands' ) . ' WHERE idempotency_key LIKE %s', $wpdb->esc_like( $prefix ) . '%' ) );
    if ( $actor && ! is_wp_error( $actor ) ) { foreach ( array( 'audit', 'money' ) as $table ) { $wpdb->delete( D::table( $table ), array( 'actor_id' => $actor ) ); } require_once ABSPATH . 'wp-admin/includes/user.php'; wp_delete_user( $actor ); }
}
