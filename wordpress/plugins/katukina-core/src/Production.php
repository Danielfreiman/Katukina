<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** Immutable material plan, explicit reservation, atomic multi-output completion. */
final class Production {
    public static function get( int $id ): array {
        global $wpdb;
        $row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . Database::table( 'production_jobs' ) . ' WHERE id=%d FOR UPDATE', $id ), ARRAY_A );
        if ( ! $row ) { throw new DomainError( 'Production order not found.', 404 ); }
        $row['plan'] = json_decode( $row['plan'], true );
        $row['result'] = $row['result'] ? json_decode( $row['result'], true ) : null;
        return $row;
    }

    public static function plan( array $input ): array {
        $reason = Database::reason( $input );
        if ( ! is_array( $input['inputs'] ?? null ) || ! is_array( $input['outputs'] ?? null ) || count( $input['inputs'] ) < 1 || count( $input['inputs'] ) > 100 || count( $input['outputs'] ) < 1 || count( $input['outputs'] ) > 100 ) { throw new DomainError( 'Provide 1 to 100 inputs and outputs.' ); }
        $inputs = array(); $outputs = array(); $master = 0; $warehouse = 0; $unit = ''; $material = 0; $needed = 0; $seen = array();
        foreach ( $input['inputs'] as $entry ) {
            $lot = Inventory::lot( Registry::positive_id( $entry['lot_id'] ?? 0 ) );
            if ( isset( $seen[ $lot['id'] ] ) ) { throw new DomainError( 'Combine repeated input lots into one line.' ); } $seen[ $lot['id'] ] = true;
            if ( $warehouse && $warehouse !== (int) $lot['warehouse_id'] ) { throw new DomainError( 'Production inputs must share a warehouse and owner.' ); } $warehouse = (int) $lot['warehouse_id'];
            $form = Registry::get( (int) $lot['form_id'], 'form' )['data'];
            $quantity = Database::quantity( $entry['quantity'] ?? '' );
            if ( 'unit' === $form['unit'] && $quantity % 1000 ) { throw new DomainError( 'Packaging units must be whole.' ); }
            $role = $entry['role'] ?? 'material';
            if ( ! in_array( $role, array( 'material', 'packaging' ), true ) ) { throw new DomainError( 'Input role must be material or packaging.' ); }
            if ( 'material' === $role ) {
                if ( 'bulk' !== $form['type'] || ( $master && $master !== (int) $form['item_id'] ) || ( $unit && $unit !== $form['unit'] ) ) { throw new DomainError( 'Bulk inputs must share the same master item and base unit.' ); }
                $master = (int) $form['item_id']; $unit = $form['unit']; $material += $quantity;
            }
            $inputs[] = array( 'lot_id' => (int) $lot['id'], 'quantity' => $quantity, 'role' => $role );
        }
        if ( ! $master ) { throw new DomainError( 'At least one bulk material input is required.' ); }
        $seen = array();
        foreach ( $input['outputs'] as $entry ) {
            $form = Registry::get( Registry::positive_id( $entry['form_id'] ?? 0 ), 'form' );
            if ( 'packaged' !== $form['data']['type'] || $master !== (int) $form['data']['item_id'] || $unit !== $form['data']['content_unit'] ) { throw new DomainError( 'Outputs must package the same master material in its base unit.' ); }
            $quantity = Database::quantity( $entry['quantity'] ?? '' );
            if ( $quantity % 1000 ) { throw new DomainError( 'Production outputs must be whole packs.' ); }
            $consumed = intdiv( $quantity, 1000 ) * Database::quantity( $form['data']['content_quantity'] );
            if ( ! is_int( $consumed ) || $consumed > 999999999000 ) { throw new DomainError( 'Output exceeds the supported quantity.' ); }
            $code = (string) ( $entry['code'] ?? '' );
            if ( ! preg_match( '/^[\pL\pN_.:-]{1,100}$/uD', $code ) || isset( $seen[ $code ] ) ) { throw new DomainError( 'Use unique output lot codes.' ); } $seen[ $code ] = true;
            $needed += $consumed;
            $outputs[] = array( 'form_id' => (int) $form['id'], 'quantity' => $quantity, 'material' => $consumed, 'code' => $code, 'identity' => NativeCatalog::identity( wc_get_product( $form['data']['product_id'] ) ) );
        }
        $loss = empty( $input['loss'] ) || in_array( (string) $input['loss'], array( '0', '0.000' ), true ) ? 0 : Database::quantity( $input['loss'] );
        if ( $material !== $needed + $loss || $material > 999999999000 ) { throw new DomainError( 'Bulk consumption must equal output content plus explicit loss.' ); }
        $plan = compact( 'inputs', 'outputs', 'loss', 'warehouse', 'unit', 'reason' );
        $now = gmdate( 'Y-m-d H:i:s' );
        $id = Database::insert( 'production_jobs', array( 'state' => 'planned', 'plan' => wp_json_encode( $plan ), 'actor_id' => get_current_user_id(), 'created_at' => $now, 'updated_at' => $now ) );
        return self::get( $id );
    }

    public static function reserve( array $input ): array {
        $job = self::get( Registry::positive_id( $input['job_id'] ?? 0 ) ); $reason = Database::reason( $input );
        if ( 'reserved' === $job['state'] ) { return $job; }
        if ( 'planned' !== $job['state'] ) { throw new DomainError( 'Only planned production can be reserved.', 409 ); }
        foreach ( $job['plan']['inputs'] as $entry ) {
            $lot = Inventory::lot( $entry['lot_id'] ); self::check_expiry( $lot );
            Inventory::move( $entry['lot_id'], 0, $entry['quantity'], 'production_reserve', 'job:' . $job['id'], $reason );
            Database::insert( 'production_allocations', array( 'job_id' => $job['id'], 'lot_id' => $entry['lot_id'], 'quantity' => $entry['quantity'], 'state' => 'active' ) );
        }
        self::state( (int) $job['id'], 'reserved' ); return self::get( (int) $job['id'] );
    }

    private static function check_expiry( array $lot ): void {
        if ( ! empty( $lot['data']['expiry'] ) && $lot['data']['expiry'] < gmdate( 'Y-m-d' ) ) { throw new DomainError( 'Production input has expired.', 409 ); }
    }

    /** Exact rounded a*b/d without multiplying potentially large integer operands. */
    public static function prorate( int $a, int $b, int $d ): int {
        if ( $a < 0 || $b < 0 || $d < 1 || $b > $d ) { throw new DomainError( 'Invalid production cost basis.' ); }
        $q = 0; $r = 0; $aq = intdiv( $a, $d ); $ar = $a % $d;
        while ( $b > 0 ) {
            if ( $b % 2 ) { $q += $aq; $r += $ar; $q += intdiv( $r, $d ); $r %= $d; }
            $b = intdiv( $b, 2 );
            if ( $b ) { $aq *= 2; $ar *= 2; $aq += intdiv( $ar, $d ); $ar %= $d; }
        }
        return $q + ( $r >= intdiv( $d, 2 ) + $d % 2 ? 1 : 0 );
    }

    public static function complete( array $input ): array {
        global $wpdb;
        $job = self::get( Registry::positive_id( $input['job_id'] ?? 0 ) ); $reason = Database::reason( $input );
        if ( 'completed' === $job['state'] ) { return $job; }
        if ( 'reserved' !== $job['state'] ) { throw new DomainError( 'Reserve production inputs before completion.', 409 ); }
        $cost = 0; $known_cost = true; $currency = ''; $expiry = ''; $source_ids = array();
        foreach ( $job['plan']['inputs'] as $entry ) {
            $lot = Inventory::lot( $entry['lot_id'] ); self::check_expiry( $lot ); $source_ids[] = $entry['lot_id'];
            if ( ! empty( $lot['data']['expiry'] ) && ( ! $expiry || $lot['data']['expiry'] < $expiry ) ) { $expiry = $lot['data']['expiry']; }
            if ( '' === (string) $lot['data']['cost_minor'] ) { $known_cost = false; }
            else {
                if ( $currency && $currency !== $lot['data']['currency'] ) { throw new DomainError( 'Production cost inputs use different currencies; no conversion is inferred.' ); } $currency = $lot['data']['currency'];
                $basis = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COALESCE(SUM(quantity),0) FROM ' . Database::table( 'movements' ) . " WHERE lot_id=%d AND action IN ('receipt','production_output')", $entry['lot_id'] ) );
                $cost += self::prorate( (int) $lot['data']['cost_minor'], $entry['quantity'], $basis );
            }
        }
        $output_ids = array(); $total_material = array_sum( array_column( $job['plan']['outputs'], 'material' ) ); $assigned = 0;
        foreach ( $job['plan']['outputs'] as $index => $entry ) {
            $form = Registry::get( $entry['form_id'], 'form' );
            if ( NativeCatalog::identity( wc_get_product( $form['data']['product_id'] ) ) !== $entry['identity'] ) { throw new DomainError( 'Output packaging changed after production was planned.', 409 ); }
            // Allocate combined material/packaging/loss cost by output content; last output receives the rounding remainder.
            $share = $index === count( $job['plan']['outputs'] ) - 1 ? $cost - $assigned : intdiv( self::prorate( $cost * 1000, $entry['material'], $total_material ), 1000 );
            $assigned += $share;
            $lot = Inventory::create_lot( array( 'form_id' => $entry['form_id'], 'warehouse_id' => $job['plan']['warehouse'], 'code' => $entry['code'], 'expiry' => $expiry, 'source_lot_id' => $source_ids[0], 'cost_minor' => $known_cost ? (string) $share : '', 'currency' => $known_cost ? $currency : '' ) );
            Inventory::move( (int) $lot['id'], $entry['quantity'], 0, 'production_output', 'job:' . $job['id'], $reason ); $output_ids[] = (int) $lot['id'];
        }
        foreach ( $job['plan']['inputs'] as $entry ) { Inventory::move( $entry['lot_id'], -$entry['quantity'], -$entry['quantity'], 'production_input', 'job:' . $job['id'], $reason ); }
        Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'production_allocations' ) . " SET state='consumed' WHERE job_id=%d AND state='active'", $job['id'] ) );
        $result = array( 'output_lot_ids' => $output_ids, 'input_lot_ids' => $source_ids, 'cost_minor' => $known_cost ? $cost : null, 'currency' => $known_cost ? $currency : null, 'completed_by' => get_current_user_id(), 'completed_at' => gmdate( DATE_ATOM ) );
        Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'production_jobs' ) . ' SET result=%s WHERE id=%d', wp_json_encode( $result ), $job['id'] ) );
        self::state( (int) $job['id'], 'completed' ); return self::get( (int) $job['id'] );
    }

    public static function cancel( array $input ): array {
        global $wpdb; $job = self::get( Registry::positive_id( $input['job_id'] ?? 0 ) ); $reason = Database::reason( $input );
        if ( 'cancelled' === $job['state'] ) { return $job; }
        if ( 'completed' === $job['state'] ) { throw new DomainError( 'Completed production requires a supervised compensating adjustment.', 409 ); }
        if ( 'reserved' === $job['state'] ) {
            foreach ( $job['plan']['inputs'] as $entry ) { Inventory::move( $entry['lot_id'], 0, -$entry['quantity'], 'production_release', 'job:' . $job['id'], $reason ); }
            Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'production_allocations' ) . " SET state='released' WHERE job_id=%d", $job['id'] ) );
        }
        self::state( (int) $job['id'], 'cancelled' ); return self::get( (int) $job['id'] );
    }

    private static function state( int $id, string $state ): void {
        global $wpdb;
        Database::query( $wpdb->prepare( 'UPDATE ' . Database::table( 'production_jobs' ) . ' SET state=%s,version=version+1,updated_at=%s WHERE id=%d', $state, gmdate( 'Y-m-d H:i:s' ), $id ) );
        Database::audit( 'production.' . $state, 'job:' . $id, array() );
    }
}
