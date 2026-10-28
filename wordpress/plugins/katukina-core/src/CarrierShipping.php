<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

/** Native zone instance; configured contract values, never inferred carrier tariffs. */
final class CarrierShipping extends \WC_Shipping_Method {
    public function __construct( $instance_id = 0 ) {
        $this->id = 'katukina_carrier'; $this->instance_id = absint( $instance_id );
        $this->method_title = 'Carrier service'; $this->method_description = 'Configure a verified manual carrier tariff in this native shipping zone. No label or shipment is purchased.';
        $this->supports = array( 'shipping-zones', 'instance-settings', 'instance-settings-modal' );
        $this->instance_form_fields = array(
            'title' => array( 'title' => 'Public service name', 'type' => 'text', 'default' => 'Delivery' ),
            'carrier' => array( 'title' => 'Carrier', 'type' => 'select', 'options' => array( 'postnl' => 'PostNL', 'dhl_express' => 'DHL Express', 'dhl_parcel' => 'DHL Parcel', 'other' => 'Other carrier' ) ),
            'service_code' => array( 'title' => 'Contract service code', 'type' => 'text' ),
            'currency' => array( 'title' => 'Tariff currency', 'type' => 'select', 'options' => get_woocommerce_currencies(), 'default' => get_option( 'woocommerce_currency' ) ),
            'cost' => array( 'title' => 'Shipping cost (before native shipping tax)', 'type' => 'price', 'default' => '' ),
            'days_min' => array( 'title' => 'Minimum business days', 'type' => 'number', 'default' => '', 'custom_attributes' => array( 'min' => '0', 'max' => '365' ) ),
            'days_max' => array( 'title' => 'Maximum business days', 'type' => 'number', 'default' => '', 'custom_attributes' => array( 'min' => '0', 'max' => '365' ) ),
            'insurance' => array( 'title' => 'Insurance', 'type' => 'select', 'default' => 'none', 'options' => array( 'none' => 'Not included', 'included' => 'Included under contract', 'optional' => 'Optional under contract' ) ),
            'insurance_cost' => array( 'title' => 'Optional insurance premium', 'type' => 'price', 'default' => '' ),
            'insured_limit' => array( 'title' => 'Maximum insured merchandise value', 'type' => 'price', 'default' => '' ),
            'contract_reference' => array( 'title' => 'Internal contract / validation reference', 'type' => 'text', 'default' => '' ),
            'tax_status' => array( 'title' => 'Tax status', 'type' => 'select', 'default' => 'taxable', 'options' => array( 'taxable' => 'Taxable under native tax settings', 'none' => 'None' ) ),
        );
        $this->init_instance_settings(); $this->title = $this->get_option( 'title', 'Delivery' ); $this->tax_status = $this->get_option( 'tax_status', 'taxable' );
        add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
    }
    public static function quotes( array $settings, string $currency, string $value, int $precision ): array {
        if ( empty( $settings['contract_reference'] ) || empty( $settings['service_code'] ) || $settings['currency'] !== $currency || '' === (string) $settings['cost'] ) { return array(); }
        $base = Finance::to_minor( (string) $settings['cost'], $precision ); $mode = $settings['insurance'] ?? 'none';
        $covered = false;
        if ( in_array( $mode, array( 'included', 'optional' ), true ) ) {
            if ( '' === (string) ( $settings['insured_limit'] ?? '' ) ) { return array(); }
            $covered = Finance::to_minor( $value, $precision ) <= Finance::to_minor( (string) $settings['insured_limit'], $precision );
        }
        if ( 'included' === $mode && ! $covered ) { return array(); }
        $rates = array( array( 'suffix' => 'standard', 'amount' => $base, 'insured' => 'included' === $mode ) );
        if ( 'optional' === $mode && $covered && '' !== (string) ( $settings['insurance_cost'] ?? '' ) ) { $rates[] = array( 'suffix' => 'insured', 'amount' => $base + Finance::to_minor( (string) $settings['insurance_cost'], $precision ), 'insured' => true ); }
        return $rates;
    }
    public function calculate_shipping( $package = array() ) {
        $settings = array(); foreach ( array_keys( $this->instance_form_fields ) as $key ) { $settings[ $key ] = $this->get_option( $key, '' ); }
        try { $rates = self::quotes( $settings, get_woocommerce_currency(), (string) ( $package['contents_cost'] ?? '0' ), wc_get_price_decimals() ); }
        catch ( DomainError $error ) { wc_get_logger()->warning( 'Carrier tariff configuration invalid for instance ' . $this->instance_id, array( 'source' => 'katukina' ) ); return; }
        foreach ( $rates as $rate ) {
            $estimate = '';
            if ( '' !== $settings['days_min'] && '' !== $settings['days_max'] && (int) $settings['days_min'] <= (int) $settings['days_max'] ) { $estimate = ' · ' . absint( $settings['days_min'] ) . '–' . absint( $settings['days_max'] ) . ' business days (estimate)'; }
            $this->add_rate( array( 'id' => $this->get_rate_id( $rate['suffix'] ), 'label' => $this->title . ( $rate['insured'] ? ' · insured' : '' ) . $estimate, 'cost' => Finance::from_minor( $rate['amount'], wc_get_price_decimals() ), 'package' => $package, 'meta_data' => array( 'carrier' => $settings['carrier'], 'service_code' => $settings['service_code'], 'insurance' => $rate['insured'] ? 'included' : 'none' ) ) );
        }
    }
}
