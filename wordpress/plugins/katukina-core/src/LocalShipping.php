<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;
final class LocalShipping extends \WC_Shipping_Method {
    public function __construct( $instance_id = 0 ) {
        $this->id = 'katukina_test'; $this->instance_id = absint( $instance_id ); $this->method_title = 'Katukina — local test delivery';
        $this->method_description = 'Available only in the local environment with test mode enabled. Does not dispatch shipments.';
        $this->title = 'Local test delivery — no dispatch'; $this->enabled = 'yes'; $this->supports = array( 'shipping-zones' );
    }
    public function is_available( $package ) { return Commerce::local_enabled() && parent::is_available( $package ); }
    public function calculate_shipping( $package = array() ) { if ( Commerce::local_enabled() ) { $this->add_rate( array( 'id' => $this->get_rate_id(), 'label' => $this->title, 'cost' => 0, 'taxes' => false, 'package' => $package ) ); } }
}
