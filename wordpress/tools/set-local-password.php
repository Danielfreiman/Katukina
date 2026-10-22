<?php
/** Set the local administrator password from stdin; never print credentials. */
defined( 'ABSPATH' ) || exit;
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || 'local' !== wp_get_environment_type() ) {
    return;
}

$mode = $args[0] ?? 'set';
$login = $args[1] ?? 'admin';
if ( ! in_array( $mode, array( 'set', 'check' ), true ) ) {
    WP_CLI::error( 'Use set or check for the local administrator password.' );
}
$password = trim( stream_get_contents( STDIN ) );
if ( strlen( $password ) < 20 ) {
    WP_CLI::error( 'Supply a local password of at least 20 characters through stdin.' );
}
$user = get_user_by( 'login', $login );
if ( ! $user || ! user_can( $user, 'manage_options' ) ) {
    WP_CLI::error( 'The expected local administrator was not found.' );
}
if ( 'check' === $mode ) {
    if ( ! wp_check_password( $password, $user->user_pass, $user->ID ) ) {
        WP_CLI::error( 'The local access file does not match the administrator password. No password was changed.' );
    }
    unset( $password );
    WP_CLI::success( 'Local administrator password verified; unchanged.' );
    return;
}
wp_set_password( $password, $user->ID );
unset( $password );
WP_CLI::success( 'Local administrator password configured.' );
