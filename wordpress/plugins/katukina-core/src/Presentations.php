<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

final class Presentations {
    public static function register(): void {
        add_action( 'rest_api_init', static function () {
            register_rest_route( 'katukina/v1', '/commerce/products/(?P<id>\d+)/presentations', array( 'methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => static fn( $r ) => OperationsApi::response( static function () use ( $r ) {
                $parent = wc_get_product( (int) $r['id'] ); $channel = Channels::current();
                if ( ! $parent || 'publish' !== $parent->get_status() || ! $channel || ! Channels::listed( $parent, (int) $channel['id'] ) ) { throw new DomainError( 'Product not found.', 404 ); }
                if ( ! $parent->is_type( 'variable' ) ) { return array(); }
                $result = array();
                foreach ( $parent->get_children() as $id ) {
                    $product = wc_get_product( $id );
                    if ( ! $product || 'publish' !== $product->get_status() || ! $product->is_purchasable() || ! Channels::listed( $product, (int) $channel['id'] ) || ! Channels::destination_allowed( $product, Channels::destination() ) ) { continue; }
                    $choices = array();
                    foreach ( $product->get_variation_attributes() as $attribute => $value ) {
                        if ( '' !== $value ) { continue; }
                        $key = str_replace( 'attribute_', '', $attribute ); $options = array();
                        foreach ( $parent->get_variation_attributes() as $name => $values ) { if ( sanitize_title( $name ) === $key ) { $options = $values; break; } }
                        $choices[] = array( 'attribute' => $attribute, 'label' => wc_attribute_label( $key, $parent ), 'options' => array_values( $options ) );
                    }
                    $result[] = array( 'id' => $id, 'label' => wp_strip_all_tags( wc_get_formatted_variation( $product, true, true, true ) ) ?: $product->get_name(), 'price' => (string) wc_get_price_to_display( $product ), 'currency' => get_woocommerce_currency(), 'available' => Commerce::tracked_form( $id ) ? Channels::available( $id, $channel ) > 0 : $product->is_in_stock(), 'choices' => $choices );
                }
                return $result;
            } ) ) );
        } );
    }
}
