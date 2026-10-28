<?php
/** Integration assertions against real local WooCommerce, SQL transactions and REST dispatch. */
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() ) { throw new RuntimeException( 'Local CLI only.' ); }
use Katukina\Core\Database as D;
use Katukina\Core\Registry as R;
use Katukina\Core\Inventory as I;
use Katukina\Core\Production as P;
use Katukina\Core\Channels as C;
use Katukina\Core\Customs as H;
use Katukina\Core\Workflow as W;
use Katukina\Core\NativeCatalog as N;
use Katukina\Core\DomainError;
use Katukina\Core\Finance as F;
use Katukina\Core\Payments;
use Katukina\Core\PaymentProvider;
use Katukina\Core\Reports;
use Katukina\Core\CarrierShipping;

final class KatukinaTestPaymentProvider implements PaymentProvider {
    public function gateway_id(): string { return 'synthetic_provider'; }
    public function verify_event( string $body, array $headers ): array {
        if ( ! hash_equals( hash_hmac( 'sha256', $body, 'local-test-only' ), (string) ( $headers['signature'] ?? '' ) ) ) { throw new DomainError( 'Invalid test signature.', 403 ); }
        return json_decode( $body, true, 512, JSON_THROW_ON_ERROR );
    }
}

global $wpdb;
$prefix = 'expansion-' . bin2hex( random_bytes( 5 ) ); $serial = 0; $checks = 0;
$records = array(); $products = array(); $lots = array(); $jobs = array(); $orders = array(); $customer = 0;
$assert = static function ( $condition, $label ) use ( &$checks ) { if ( ! $condition ) { throw new RuntimeException( $label ); } ++$checks; };
$reject = static function ( $callback, $label ) use ( $assert ) { try { $callback(); } catch ( DomainError $error ) { $assert( true, $label ); return; } throw new RuntimeException( 'Expected rejection: ' . $label ); };
$command = static function ( $name, $input, $callback, $key = null ) use ( $prefix, &$serial ) { return D::command( $name, $input + array( 'key' => $key ?: $prefix . '-' . ++$serial ), $callback ); };
$record = static function ( $kind, $data ) use ( $command, &$records, $prefix, &$serial ) { $row = $command( 'record.save', array( 'kind' => $kind, 'code' => $prefix . '-' . ++$serial, 'data' => $data + array( 'active' => true ) ), array( R::class, 'save' ) ); $records[] = (int) $row['id']; return $row; };
$product = static function ( $suffix, $metadata = array() ) use ( $prefix, &$products ) { $p = new WC_Product_Simple(); $p->set_name( $prefix . '-' . $suffix ); $p->set_sku( $prefix . '-' . $suffix ); $p->set_status( 'publish' ); $p->set_regular_price( '10' ); foreach ( $metadata as $key => $value ) { $p->update_meta_data( '_kat_' . $key, $value ); } $p->save(); $products[] = $p->get_id(); return $p; };
$receive = static function ( $p, $quantity, $cost, $warehouse ) use ( $command, &$lots, $prefix, &$serial ) { $lot = $command( 'receive', array( 'code' => $prefix . '-' . ++$serial, 'form_id' => (int) get_post_meta( $p->get_id(), '_kat_form_record_id', true ), 'warehouse_id' => $warehouse, 'quantity' => $quantity, 'cost_minor' => $cost, 'currency' => 'USD', 'reason' => 'Synthetic integration receipt' ), array( I::class, 'receive' ) ); $lots[] = (int) $lot['id']; return $lot; };

try {
    $default = C::resolve( '' );
    $channel = $record( 'channel', array_merge( $default['data'], array( 'name' => 'Synthetic second channel', 'url' => '', 'currencies' => 'GBP,EUR' ) ) );
    $a = $product( '10g', array( 'content_unit' => 'g', 'content_quantity' => '10' ) );
    $b = $product( '20g', array( 'content_unit' => 'g', 'content_quantity' => '20', 'origin_product_id' => $a->get_id() ) );
    $exclusive = $product( 'exclusive', array( 'channel_ids' => (string) $channel['id'] ) );
    $assert( C::listed( $a, (int) $default['id'] ) && ! C::listed( $a, (int) $channel['id'] ), 'legacy catalog stays on default channel' );
    $assert( C::listed( $exclusive, (int) $channel['id'] ) && ! C::listed( $exclusive, (int) $default['id'] ), 'explicit channel isolation' );
    $request = new WP_REST_Request( 'GET', '/wc/store/v1/products' ); $request->set_header( 'X-Katukina-Channel', $channel['code'] ); $request->set_param( 'include', array( $a->get_id(), $exclusive->get_id() ) );
    $response = rest_do_request( $request );
    $assert( 200 === $response->get_status() && array_column( $response->get_data(), 'id' ) === array( $exclusive->get_id() ), 'Store API query filters before pagination' );
    $request = new WP_REST_Request( 'GET', '/wc/store/v1/products/' . $a->get_id() ); $request->set_header( 'X-Katukina-Channel', $channel['code'] );
    $assert( 404 === rest_do_request( $request )->get_status(), 'hidden product direct endpoint denied' );
    $request = new WP_REST_Request( 'GET', '/wc/store/v1/products' ); $request->set_header( 'X-Katukina-Channel', 'unknown-' . $prefix );
    $assert( 404 === rest_do_request( $request )->get_status(), 'unknown channel fails closed' );

    $raw = $product( 'bulk', array( 'type' => 'bulk', 'unit' => 'g', 'content_unit' => 'g', 'content_quantity' => '1', 'origin_product_id' => $a->get_id() ) );
    $packaging = $product( 'containers' );
    $source1 = $receive( $raw, '300', '300', $default['data']['warehouse_id'] );
    $source2 = $receive( $raw, '200', '200', $default['data']['warehouse_id'] );
    $boxes = $receive( $packaging, '30', '30', $default['data']['warehouse_id'] );
    $plan = array( 'inputs' => array( array( 'lot_id' => $source1['id'], 'quantity' => '300' ), array( 'lot_id' => $source2['id'], 'quantity' => '200' ), array( 'lot_id' => $boxes['id'], 'quantity' => '30', 'role' => 'packaging' ) ), 'outputs' => array( array( 'form_id' => (int) get_post_meta( $a->get_id(), '_kat_form_record_id', true ), 'quantity' => '20', 'code' => $prefix . '-output-a' ), array( 'form_id' => (int) get_post_meta( $b->get_id(), '_kat_form_record_id', true ), 'quantity' => '10', 'code' => $prefix . '-output-b' ) ), 'loss' => '100', 'reason' => 'Synthetic production conservation test' );
    $reject( fn() => $command( 'plan-production', array_merge( $plan, array( 'loss' => '0' ) ), array( P::class, 'plan' ) ), 'material cannot disappear silently' );
    $job = $command( 'plan-production', $plan, array( P::class, 'plan' ) ); $jobs[] = (int) $job['id'];
    $args = array( 'job_id' => $job['id'], 'reason' => 'Synthetic production lifecycle' );
    $reject( fn() => $command( 'complete-production', $args, array( P::class, 'complete' ) ), 'completion needs reservation' );
    $command( 'reserve-production', $args, array( P::class, 'reserve' ) );
    $assert( (int) I::lot( (int) $source1['id'] )['reserved'] === 300000, 'material reserved without deduction' );
    $assert( ! I::reconcile(), 'production reservations reconcile' );
    $done = $command( 'complete-production', $args, array( P::class, 'complete' ) );
    $lots = array_merge( $lots, $done['result']['output_lot_ids'] );
    $again = $command( 'complete-production', $args, array( P::class, 'complete' ) );
    $assert( $again === $done, 'completion with a new key cannot double-post' );
    $assert( 530 === $done['result']['cost_minor'], 'material and packaging costs calculated' );
    $assert( 0 === (int) I::lot( (int) $source1['id'] )['balance'] && 20000 === (int) I::lot( $lots[count( $lots ) - 2] )['balance'], 'physical input/output conservation' );
    $assert( P::prorate( 999999999999, 500000000000, 999999999999 ) === 500000000000, 'cost arithmetic avoids overflow' );
    $assert( ! I::reconcile(), 'completed production reconciles' );

    $order = wc_create_order(); $orders[] = $order->get_id(); $order->set_currency( 'USD' ); $line = $order->add_product( $a, 1 ); $order->save();
    $command( 'assign-order', array( 'order_id' => $order->get_id(), 'channel_id' => $default['id'], 'reason' => 'Synthetic order' ), array( W::class, 'initialize' ) );
    $reserve = array( 'lot_id' => $done['result']['output_lot_ids'][0], 'order_id' => $order->get_id(), 'line_id' => $line, 'quantity' => '1', 'expires_at' => gmdate( 'Y-m-d H:i:s', time() + 3600 ), 'reason' => 'Synthetic cancellation reservation' );
    $command( 'reserve', $reserve, array( I::class, 'reserve' ) );
    $order->update_status( 'cancelled' );
    $assert( 0 === (int) I::lot( $reserve['lot_id'] )['reserved'] && 20000 === (int) I::lot( $reserve['lot_id'] )['balance'], 'native cancellation releases without restocking physical balance' );
    $reject( fn() => $command( 'reserve', $reserve, array( I::class, 'reserve' ) ), 'cancelled order cannot acquire new stock' );
    $return_order = wc_create_order(); $orders[] = $return_order->get_id(); $return_order->set_currency( 'USD' ); $return_line = $return_order->add_product( $a, 2 ); $return_order->save();
    $command( 'assign-order', array( 'order_id' => $return_order->get_id(), 'channel_id' => $default['id'], 'reason' => 'Synthetic return fixture' ), array( W::class, 'initialize' ) );
    $reservation = $command( 'reserve', array_merge( $reserve, array( 'order_id' => $return_order->get_id(), 'line_id' => $return_line, 'quantity' => '2' ) ), array( I::class, 'reserve' ) );
    $return_order->payment_complete( $prefix . '-paid-return' );
    $wpdb->update( D::table( 'reservations' ), array( 'expires_at' => '2020-01-01 00:00:00' ), array( 'id' => $reservation['id'] ) );
    $command( 'expire', array(), array( I::class, 'expire' ) );
    $assert( 2000 === (int) I::lot( $reserve['lot_id'] )['reserved'], 'paid order reservations survive the unpaid checkout timeout' );
    $command( 'test-pack', array(), static function () use ( $return_order ) { I::pack( $return_order->get_id(), 'Synthetic packing' ); return array( 'packed' => true ); } );
    $return = array( 'reservation_id' => $reservation['id'], 'quantity' => '1', 'inspected' => true, 'reference' => $prefix . '-returned', 'reason' => 'Inspected synthetic return' );
    $reject( fn() => $command( 'return-stock', array_merge( $return, array( 'inspected' => false ) ), array( I::class, 'receive_return' ) ), 'uninspected return cannot restore physical stock' );
    $receipt = $command( 'return-stock', $return, array( I::class, 'receive_return' ), $prefix . '-return-key' );
    $assert( $receipt === $command( 'return-stock', $return, array( I::class, 'receive_return' ), $prefix . '-return-key' ), 'return retry has no duplicate receipt' );
    $reject( fn() => $command( 'return-stock', array_merge( $return, array( 'quantity' => '2', 'reference' => $prefix . '-excess-return' ) ), array( I::class, 'receive_return' ) ), 'return cannot exceed original physical debit' );
    $contact = $record( 'contact', array( 'name' => 'Synthetic sample recipient' ) );
    $sample = $command( 'issue-sample', array( 'lot_id' => $reserve['lot_id'], 'contact_id' => $contact['id'], 'quantity' => '1', 'reference' => $prefix . '-sample', 'reason' => 'Synthetic sample' ), array( I::class, 'issue_sample' ) ); $records[] = $sample['id'];
    $assert( 18000 === (int) I::lot( $reserve['lot_id'] )['balance'], 'sample and inspected return reconcile physical balance' );
    $supplier = $record( 'supplier', array( 'name' => 'Synthetic supplier' ) );
    $incoming = $record( 'incoming', array( 'name' => 'Synthetic incoming', 'form_id' => get_post_meta( $a->get_id(), '_kat_form_record_id', true ), 'warehouse_id' => $default['data']['warehouse_id'], 'supplier_id' => $supplier['id'], 'quantity' => '5', 'expected_at' => '2026-11-01' ) );
    $incoming_receipt = array( 'code' => $prefix . '-incoming', 'incoming_id' => $incoming['id'], 'form_id' => $incoming['data']['form_id'], 'warehouse_id' => $incoming['data']['warehouse_id'], 'supplier_id' => $supplier['id'], 'quantity' => '3', 'reason' => 'Synthetic partial incoming receipt' );
    $command( 'receive', $incoming_receipt, array( I::class, 'receive' ) );
    $assert( 3000 === I::incoming_received( $incoming['id'] ), 'partial expected receipt recorded independently of available stock' );
    $stock = Katukina\Core\OperationsApi::report( 'stock_levels' ); $matching = array_values( array_filter( $stock['rows'], static fn( $row ) => (int) $row['form_id'] === (int) $incoming['data']['form_id'] && (int) $row['warehouse_id'] === (int) $incoming['data']['warehouse_id'] ) );
    $assert( '2.000' === $matching[0]['expected'], 'replenishment report counts only outstanding expected stock' );
    $reject( fn() => $command( 'receive', array_merge( $incoming_receipt, array( 'code' => $prefix . '-over-receive' ) ), array( I::class, 'receive' ) ), 'expected receipt cannot be over-received' );
    $a->update_meta_data( '_kat_blocked_countries', 'FR' ); $a->save();
    $assert( ! C::destination_allowed( $a, 'FR' ) && C::destination_allowed( $a, 'GB' ), 'forbidden destinations are product restrictions' );
    $a->delete_meta_data( '_kat_blocked_countries' ); $a->save();
    wp_set_current_user( 0 );
    $assert( 401 === rest_do_request( new WP_REST_Request( 'GET', '/katukina/v1/report/money' ) )->get_status(), 'anonymous users cannot access financial reports' );

    $group = $prefix . '-synthetic';
    $rule = array( 'name' => 'Synthetic fixture — not a legal classification', 'group' => $group, 'country' => 'EU', 'hs_code' => '123456', 'valid_from' => '2020-01-01', 'verification' => 'Automated test only; removed after execution' );
    $eu = $record( 'hs', $rule );
    $fr = $record( 'hs', array_merge( $rule, array( 'country' => 'FR', 'hs_code' => '654321' ) ) );
    $assert( '654321' === H::resolve( $group, 'FR', '2026-10-26' )['hs_code'], 'exact jurisdiction overrides regional classification' );
    $assert( '123456' === H::resolve( $group, 'DE', '2026-10-26' )['hs_code'], 'EU destination resolves regional classification' );
    $reject( fn() => H::resolve( $group, 'GB', '2026-10-26' ), 'UK is not treated as EU' );
    $reject( fn() => $record( 'hs', $rule ), 'overlapping rules rejected' );
    $a->update_meta_data( '_kat_hs_group', $group ); $a->update_meta_data( '_kat_origin_country', 'BR' ); $a->update_meta_data( '_kat_customs_description', 'Synthetic test material' ); $a->save();
    $customs_order = wc_create_order(); $orders[] = $customs_order->get_id(); $customs_order->set_shipping_country( 'FR' ); $customs_order->add_product( $a, 1 );
    H::snapshot( $customs_order ); $customs_order->save();
    $assert( '654321' === H::manifest( wc_get_order( $customs_order->get_id() ) )['items'][0]['hs_code'], 'customs snapshot reaches shipping manifest' );

    $before = (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . D::table( 'records' ) );
    $reject( function () use ( $command, $record ) { $command( 'outer-test', array(), function () use ( $record ) { $record( 'supplier', array( 'name' => 'Nested rollback fixture' ) ); throw new DomainError( 'Rollback outer command' ); } ); }, 'nested commands respect outer rollback' );
    $assert( $before === (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . D::table( 'records' ) ), 'nested transaction did not commit outer work' );
    $assert( F::to_minor( '12.34', 2 ) === 1234 && F::from_minor( 1234, 2 ) === '12.34', 'exact money conversion' );
    $reject( fn() => F::to_minor( '1.001', 2 ), 'currency precision cannot silently round' );
    $paid = wc_create_order(); $orders[] = $paid->get_id(); $paid->set_currency( 'EUR' ); $paid->set_payment_method( 'synthetic_provider' ); $paid->set_total( '10.00' ); $paid->save();
    $provider = new KatukinaTestPaymentProvider();
    $event = array( 'event_id' => $prefix . '-paid', 'type' => 'paid', 'order_id' => $paid->get_id(), 'transaction_id' => $prefix . '-transaction', 'amount' => '1000', 'currency' => 'EUR', 'minor_unit' => 2 );
    $send = static function ( $data ) use ( $provider ) { $body = wp_json_encode( $data ); return Payments::process( 'synthetic', $provider, $body, array( 'signature' => hash_hmac( 'sha256', $body, 'local-test-only' ) ) ); };
    $reject( fn() => Payments::process( 'synthetic', $provider, wp_json_encode( $event ), array() ), 'unsigned webhook rejected' );
    $reject( fn() => $send( array_merge( $event, array( 'currency' => 'GBP' ) ) ), 'payment currency mismatch' );
    $one = $send( $event ); $assert( $one === $send( $event ), 'payment callback duplicate returns original result' );
    $assert( wc_get_order( $paid->get_id() )->is_paid(), 'authenticated payment updates native order' );
    $reject( fn() => $send( array_merge( $event, array( 'amount' => '999' ) ) ), 'same event with changed data rejected' );
    $refund = array_merge( $event, array( 'event_id' => $prefix . '-refund', 'type' => 'refunded', 'transaction_id' => $prefix . '-refund-txn', 'amount' => '400' ) );
    $send( $refund ); $send( $refund );
    $send( array_merge( $refund, array( 'event_id' => $prefix . '-refund-second-delivery' ) ) );
    $assert( F::to_minor( (string) wc_get_order( $paid->get_id() )->get_total_refunded(), 2 ) === 400, 'native partial refund is not duplicated' );
    $row = Reports::accounting_row( wc_get_order( $paid->get_id() ) );
    $assert( '6.00' === $row['net_after_refunds'] && 'EUR' === $row['currency'], 'accounting export reconciles refund in its currency' );
    $assert( Reports::cell( '=FORMULA()' ) === "'=FORMULA()", 'CSV formula injection neutralized' );
    $customer = wp_create_user( $prefix, wp_generate_password( 40 ), $prefix . '@example.invalid' );
    if ( is_wp_error( $customer ) ) { throw new RuntimeException( 'Customer fixture creation failed.' ); }
    $credit = $command( 'money', array( 'kind' => 'credit', 'customer_id' => $customer, 'currency' => 'GBP', 'minor_unit' => 2, 'amount' => '1500', 'reference' => $prefix . '-credit', 'reason' => 'Synthetic credit issuance' ), array( F::class, 'record' ) );
    $credit_order = wc_create_order(); $orders[] = $credit_order->get_id(); $credit_order->set_currency( 'GBP' ); $credit_order->set_customer_id( $customer ); $credit_order->set_payment_method( 'katukina_credit' ); $credit_order->set_total( '10.00' ); $credit_order->save();
    $redeemed = F::redeem( $credit_order->get_id(), $customer );
    $assert( $redeemed === F::redeem( $credit_order->get_id(), $customer ) && F::credit_balance( $customer, 'GBP', 2 ) === 500, 'store credit redemption and retry debit exactly once' );
    $assert( F::credit_balance( $customer, 'EUR', 2 ) === 0, 'credit currencies remain isolated' );
    $settings = array( 'contract_reference' => 'Synthetic contract', 'service_code' => 'TEST', 'currency' => 'GBP', 'cost' => '5.00', 'insurance' => 'optional', 'insured_limit' => '100.00', 'insurance_cost' => '2.00' );
    $quotes = CarrierShipping::quotes( $settings, 'GBP', '50.00', 2 );
    $assert( count( $quotes ) === 2 && 700 === $quotes[1]['amount'] && $quotes[1]['insured'], 'optional insurance produces separate verified tariff' );
    $assert( count( CarrierShipping::quotes( $settings, 'GBP', '150.00', 2 ) ) === 1, 'insured limit does not overpromise coverage' );
    $assert( ! CarrierShipping::quotes( $settings, 'EUR', '50.00', 2 ), 'shipping does not reinterpret tariff currency' );
    $exclusive->update_meta_data( '_kat_channel_prices', $channel['id'] . '/GBP=9.50;' . $channel['id'] . '/EUR=11.25' ); $exclusive->save();
    foreach ( array( 'GBP' => '950', 'EUR' => '1125' ) as $currency => $price ) {
        $request = new WP_REST_Request( 'GET', '/wc/store/v1/products/' . $exclusive->get_id() ); $request->set_header( 'X-Katukina-Channel', $channel['code'] ); $request->set_header( 'X-Katukina-Currency', $currency );
        $response = rest_do_request( $request ); $data = json_decode( wp_json_encode( $response->get_data() ), true );
        $assert( 200 === $response->get_status() && $currency === $data['prices']['currency_code'] && $price === $data['prices']['price'], 'explicit ' . $currency . ' price reaches Store API' );
        apply_filters( 'rest_post_dispatch', $response, rest_get_server(), $request );
    }
    $assert( '10' === $exclusive->get_regular_price( 'edit' ), 'price lists preserve native base price' );
    $reject( fn() => Katukina\Core\PriceLists::parse( $channel['id'] . '/GBP=1.999' ), 'fixed prices reject excess precision' );
    $reject( fn() => Katukina\Core\PriceLists::select( $channel, 'JPY' ), 'disabled currency selection rejected' );
    $taxes = WC_Tax::calc_tax( 100, array( 999 => array( 'rate' => '20', 'label' => 'Synthetic test tax', 'shipping' => 'yes', 'compound' => 'no' ) ), false );
    $assert( 20.0 === (float) array_sum( $taxes ), 'native VAT calculation uses explicit synthetic rate' );
    WP_CLI::success( $checks . ' native expansion assertions passed.' );
} finally {
    Katukina\Core\PriceLists::reset();
    foreach ( $orders as $id ) { $wpdb->delete( D::table( 'returns' ), array( 'order_id' => $id ) ); }
    foreach ( $orders as $id ) { $wpdb->delete( D::table( 'money' ), array( 'order_id' => $id ) ); $wpdb->delete( D::table( 'reservations' ), array( 'order_id' => $id ) ); $wpdb->delete( D::table( 'orders' ), array( 'order_id' => $id ) ); wc_get_order( $id )?->delete( true ); }
    if ( $customer && ! is_wp_error( $customer ) ) { $wpdb->delete( D::table( 'money' ), array( 'customer_id' => $customer ) ); require_once ABSPATH . 'wp-admin/includes/user.php'; wp_delete_user( $customer ); }
    foreach ( $jobs as $id ) { $wpdb->delete( D::table( 'production_allocations' ), array( 'job_id' => $id ) ); $wpdb->delete( D::table( 'production_jobs' ), array( 'id' => $id ) ); }
    // Include outputs created just before a failed assertion, but never other users' lots.
    $fixture_lots = $wpdb->get_col( $wpdb->prepare( 'SELECT id FROM ' . D::table( 'lots' ) . ' WHERE code LIKE %s', $wpdb->esc_like( $prefix ) . '%' ) );
    foreach ( $fixture_lots as $id ) { $wpdb->delete( D::table( 'movements' ), array( 'lot_id' => $id ) ); $wpdb->delete( D::table( 'lots' ), array( 'id' => $id ) ); }
    foreach ( $products as $id ) { foreach ( array( 'item', 'form' ) as $kind ) { $record_id = (int) get_post_meta( $id, '_kat_' . $kind . '_record_id', true ); if ( $record_id ) { $records[] = $record_id; } } wc_get_product( $id )?->delete( true ); }
    foreach ( array_unique( $records ) as $id ) { $wpdb->delete( D::table( 'records' ), array( 'id' => $id ) ); }
    $wpdb->query( $wpdb->prepare( 'DELETE FROM ' . D::table( 'commands' ) . ' WHERE idempotency_key LIKE %s', $wpdb->esc_like( $prefix ) . '%' ) );
}
