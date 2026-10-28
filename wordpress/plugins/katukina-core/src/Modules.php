<?php
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;
final class Modules {
    public static function all(): array {
        $module = static fn( $label, $status, $description, $path ) => compact( 'label', 'status', 'description', 'path' );
        return array(
            'catalog' => $module( 'Products', 'WooCommerce', 'Products, variations, prices, images, categories and CSV import in WooCommerce, with origin and packaging in the same editor.', 'edit.php?post_type=product' ),
            'orders' => $module( 'Orders', 'WooCommerce with extensions', 'SHORT NOTE, operational stage, tracking and picking in HPOS orders. Transition rules require configuration.', 'admin.php?page=wc-orders' ),
            'content' => $module( 'Content', 'WordPress', 'Posts, pages and media consumed by Next.js.', 'edit.php' ),
            'channels' => $module( 'Channels and companies', 'Settings extension', 'Separate companies, warehouses and channels; one local storefront.', 'admin.php?page=wc-settings&tab=katukina&section=channel' ),
            'inventory' => $module( 'Lots and repacking', 'Products extension', 'Lots, reservations, repacking and reconciliation. Simple stock uses WooCommerce.', 'edit.php?post_type=product&page=katukina-lots' ),
            'suppliers' => $module( 'Suppliers', 'Products extension', 'Suppliers linked to products and lots.', 'edit.php?post_type=product&page=katukina-suppliers' ),
            'shipping' => $module( 'Shipping', 'WooCommerce shipping zones and methods', 'Rates from enabled shipping zone methods. Carrier integrations are pending.', 'admin.php?page=wc-settings&tab=shipping' ),
            'payments' => $module( 'Payments', 'Gateways WooCommerce', 'Local testing without payment. External gateway documentation is pending.', 'admin.php?page=wc-settings&tab=checkout' ),
            'tax' => $module( 'Taxes', 'WooCommerce tax engine', 'Enable taxes in General before configuring Tax. No tax rates are assumed.', 'admin.php?page=wc-settings&tab=general' ),
            'customers' => $module( 'Customers', 'WordPress users and WooCommerce customers', 'Credit and permissions in the WordPress profile.', 'users.php' ),
            'crm' => $module( 'Contacts and unified inbox', 'Users extension', 'Async inbox/outbox, consent and campaign history. Live providers require verified configuration.', 'users.php?page=katukina-inbox' ),
            'reports' => $module( 'Reports', 'WooCommerce Analytics', 'WooCommerce business reports; operational audit in Tools.', 'admin.php?page=wc-admin&path=/analytics/overview' ),
        );
    }
}
