<?php
use Katukina\Core\Database as D;
use Katukina\Core\Registry as R;
if ( ! defined('WP_CLI') || ! WP_CLI || 'local' !== wp_get_environment_type() ) { throw new RuntimeException('Local CLI only.'); }
global $wpdb;
$root=__DIR__.'/.imports/sacred-incense-uk';
$source=json_decode(file_get_contents($root.'/usd-prices.json'),true,512,JSON_THROW_ON_ERROR);
$manifest=json_decode(file_get_contents($root.'/manifest.json'),true,512,JSON_THROW_ON_ERROR);
if ('USD'!==$source['currency'] || $source['missing'] || count($source['prices'])!==908) { WP_CLI::error('Resolve missing USD prices before changing the store currency.'); }
$expected=[]; foreach($manifest['items'] as $item) { foreach($item['forms'] as $form) { $expected[$form['sku']]=$form['sale_quantity']; } }
$products=[]; $parents=[]; $seen=[];
foreach($source['prices'] as $row) {
    if(isset($seen[$row['sku']]) || !isset($expected[$row['sku']]) || $row['quantity']!==$expected[$row['sku']] || !preg_match('/^\d+\.\d{2}$/D',$row['price']) || !str_starts_with($row['source_url'],'https://katukina.com/')) { WP_CLI::error('Invalid source price identity.'); }
    $seen[$row['sku']]=true; $product=wc_get_product(wc_get_product_id_by_sku($row['sku']));
    if(!$product || !$product->is_type('variation') || $product->get_meta('_kat_workbook_key')!=='sacred-incense-uk:form:'.$row['sku']) { WP_CLI::error('SKU mismatch: '.$row['sku']); }
    $products[$row['sku']]=$product; $parents[$product->get_parent_id()]=true;
}
$allowed=array_merge(array_map(static fn($p)=>$p->get_id(),$products),array_keys($parents));
$priced=$wpdb->get_col("SELECT DISTINCT p.ID FROM {$wpdb->posts} p JOIN {$wpdb->postmeta} m ON m.post_id=p.ID WHERE p.post_type IN ('product','product_variation') AND p.post_status NOT IN ('trash','auto-draft') AND m.meta_key='_price' AND m.meta_value<>''");
if(array_diff(array_map('intval',$priced),$allowed)) { WP_CLI::error('Unrelated priced products require reconciliation before switching currency.'); }
$snapshot=static function() use($wpdb) {
    $result=[];
    foreach(['lots','movements','reservations','production','money','orders'] as $table) { $result[$table]=hash('sha256',wp_json_encode($wpdb->get_results('SELECT * FROM '.D::table($table).' ORDER BY 1',ARRAY_A))); }
    $orders=[];foreach(wc_get_orders(['limit'=>-1]) as $order) { $orders[]=[$order->get_id(),$order->get_currency(),$order->get_total(),$order->get_status()]; }
    $result['woocommerce_orders']=hash('sha256',wp_json_encode($orders)); return $result;
};
$verify=static function() use($source,$snapshot) {
    $errors=[];
    foreach($source['prices'] as $row) {
        $p=wc_get_product(wc_get_product_id_by_sku($row['sku']));
        if(wc_format_decimal($p->get_regular_price(),2)!==$row['price'] || wc_format_decimal($p->get_price(),2)!==$row['price']) { $errors[]=$row['sku']; }
    }
    if(get_woocommerce_currency()!=='USD' || (Katukina\Core\Commerce::channel()['data']['currency']??'')!=='USD') { $errors[]='currency'; }
    return ['prices_checked'=>count($source['prices']),'currency'=>get_woocommerce_currency(),'errors'=>$errors,'history'=>$snapshot()];
};
if(($args[0]??'inspect')==='verify') {
    $report=$verify();
    WP_CLI::line(wp_json_encode($report,JSON_PRETTY_PRINT));
    if($report['errors']) { WP_CLI::error('USD price verification failed.'); }
    return;
}
if(($args[0]??'inspect')!=='apply') { WP_CLI::line(wp_json_encode(['prices'=>count($products),'parents'=>count($parents),'currency_before'=>get_woocommerce_currency()])); return; }
if(1!==(int)$wpdb->get_var("SELECT GET_LOCK('katukina-workbook-import',0)")) { WP_CLI::error('Another import is running.'); }
try {
    $before=['currency'=>get_woocommerce_currency(),'channel'=>get_option('katukina_storefront_channel'),'history'=>$snapshot(),'prices'=>[]];
    foreach($products as $sku=>$p) { $before['prices'][$sku]=['regular'=>$p->get_regular_price(),'sale'=>$p->get_sale_price()]; }
    if(!file_exists($root.'/before-usd.json')) { file_put_contents($root.'/before-usd.json',wp_json_encode($before,JSON_PRETTY_PRINT)); }
    $channel=null;foreach(R::all('channel') as $candidate) { if($candidate['code']==='LOCAL-DEMO' && $candidate['data']['currency']==='USD' && $candidate['data']['active']) { $channel=$candidate; } }
    if(!$channel) { throw new RuntimeException('USD local demo channel is unavailable.'); }
    $current=Katukina\Core\Commerce::channel();if(!in_array($current['code']??'',['LOCAL-DEMO','LOCAL-DEMO-GBP'],true)) { throw new RuntimeException('Unexpected active channel.'); }
    D::query('START TRANSACTION'); $changed=0;
    foreach($source['prices'] as $row) {
        $p=$products[$row['sku']];
        if(wc_format_decimal($p->get_regular_price(),2)===$row['price'] && $p->get_meta('_kat_usd_source_price')===$row['price'] && !$p->get_sale_price()) { continue; }
        $p->set_regular_price($row['price']);$p->set_sale_price('');$p->set_price($row['price']);
        $p->update_meta_data('_kat_usd_source_price',$row['price']);$p->update_meta_data('_kat_usd_source_url',$row['source_url']);$p->update_meta_data('_kat_usd_source_quantity',$row['quantity']);$p->update_meta_data('_kat_usd_captured_at',$source['captured_at']);$p->save();++$changed;
        if($changed%100===0) { WP_CLI::log('Updated '.$changed.' USD prices.'); }
    }
    update_option('woocommerce_currency','USD');update_option('katukina_storefront_channel',(int)$channel['id']);update_option('katukina_usd_catalog_prices',$source['captured_at']);
    foreach(array_keys($parents) as $id) { WC_Product_Variable::sync($id);wc_delete_product_transients($id); }
    $report=$verify();if($report['errors'] || $report['history']!==$before['history']) { throw new RuntimeException('Price or history reconciliation failed.'); }
    D::query('COMMIT');$report['changed']=$changed;$report['source_captured_at']=$source['captured_at'];
    file_put_contents($root.'/usd-verification.json',wp_json_encode($report,JSON_PRETTY_PRINT));WP_CLI::line(wp_json_encode($report,JSON_PRETTY_PRINT));
} catch(Throwable $e) { $wpdb->query('ROLLBACK');wp_cache_flush();$failure=$e; }
finally { $wpdb->get_var("SELECT RELEASE_LOCK('katukina-workbook-import')"); }
if(isset($failure)) { WP_CLI::error($failure->getMessage()); }
