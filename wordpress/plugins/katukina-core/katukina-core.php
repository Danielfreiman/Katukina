<?php
/**
 * Plugin Name: Katukina Core
 * Description: Headless commerce and audited Katukina operations.
 * Version: 0.3.0
 * Requires Plugins: woocommerce
 * Requires PHP: 8.3
 * License: GPL-2.0-or-later
 */
namespace Katukina\Core;
defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/src/Headless.php';
require_once __DIR__ . '/src/Modules.php';
require_once __DIR__ . '/src/NativeAdmin.php';
require_once __DIR__ . '/src/Database.php';
require_once __DIR__ . '/src/Registry.php';
require_once __DIR__ . '/src/NativeCatalog.php';
require_once __DIR__ . '/src/NativeOrders.php';
require_once __DIR__ . '/src/Inventory.php';
require_once __DIR__ . '/src/Workflow.php';
require_once __DIR__ . '/src/Finance.php';
require_once __DIR__ . '/src/OperationsApi.php';
require_once __DIR__ . '/src/Commerce.php';
require_once __DIR__ . '/src/CheckoutRequests.php';
require_once __DIR__ . '/src/CustomerAccount.php';
require_once __DIR__ . '/src/Permissions.php';

// All WooCommerce order access uses its CRUD APIs, including HPOS.
add_action( 'before_woocommerce_init', static function () {
    if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
    }
} );
Headless::register();
NativeAdmin::register();
NativeCatalog::register();
NativeOrders::register();
add_action( 'plugins_loaded', array( Database::class, 'install' ), 20 );
Workflow::register();
OperationsApi::register();
Commerce::register();
CheckoutRequests::register();
CustomerAccount::register();
Permissions::register();
