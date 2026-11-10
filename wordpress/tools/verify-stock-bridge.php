<?php
if (!defined('WP_CLI') || !WP_CLI || wp_get_environment_type() !== 'local') { throw new RuntimeException('Local only'); }
use Katukina\Core\{Database as D, Inventory as I, NativeStock as S, Registry as R, DomainError};
global $wpdb;
$prefix='stockbridge-'.bin2hex(random_bytes(5)); $products=[]; $checks=0;
$assert=static function($ok,$label)use(&$checks){if(!$ok)throw new RuntimeException($label);$checks++;};
$reject=static function($fn,$label)use($assert){$failed=false;try{$fn();}catch(DomainError $e){$failed=true;}$assert($failed,$label);};
$channel=R::get((int)get_option('katukina_storefront_channel'),'channel');
$create=static function($stock=null)use(&$products,$prefix){$p=new WC_Product_Simple();$p->set_name($prefix);$p->set_status('draft');$p->set_sku($prefix.'-'.count($products));$p->set_regular_price('1');if(null!==$stock){$p->set_manage_stock(true);$p->set_stock_quantity($stock);}$p->save();$products[]=$p->get_id();return $p;};
$receive=static function($p,$suffix,$qty,$extra=[])use($prefix,$channel){return ['key'=>$prefix.'-'.$suffix,'code'=>$prefix.'-'.$suffix,'form_id'=>get_post_meta($p->get_id(),'_kat_form_record_id',true),'warehouse_id'=>$channel['data']['warehouse_id'],'quantity'=>(string)$qty,'reason'=>'Isolated stock bridge test']+$extra;};
$run=static fn($input)=>D::command('receive',$input,[I::class,'receive']);
try{
 $p=$create();$input=$receive($p,'first',5);$lot=$run($input);
 $assert(S::physical($p->get_id())===5000 && (int)wc_get_product($p->get_id())->get_stock_quantity()===5,'receipt mirrors native stock');
 $changed=wc_get_product($p->get_id());$changed->set_stock_quantity(8);$changed->save();
 $assert(S::physical($p->get_id())===8000,'native CRUD adjusts lot');
 wc_update_product_stock($p->get_id(),2,'decrease');
 $assert(S::physical($p->get_id())===6000 && (int)wc_get_product($p->get_id())->get_stock_quantity()===6,'native stock API adjusts lot');
 $run($input);$assert(S::physical($p->get_id())===6000,'receipt replay does not duplicate or reset stock');
 $_POST['kat_stock_expected'][$p->get_id()]='5';
 $reject(static function()use($p){$c=wc_get_product($p->get_id());$c->set_stock_quantity(9);$c->save();},'stale editor rejected');unset($_POST['kat_stock_expected']);
 $assert(S::physical($p->get_id())===6000,'stale save leaves lot unchanged');
 $reject(static function()use($p){D::command('rollback-test',['key'=>wp_generate_uuid4()],static function()use($p){S::set_total($p->get_id(),9000);throw new DomainError('forced rollback');});},'forced rollback');
 $assert(S::physical($p->get_id())===6000 && (int)wc_get_product($p->get_id())->get_stock_quantity()===6,'ledger and native projection roll back together');
 // Reserve ledger quantity using an isolated order and the configured local channel.
 $order=wc_create_order();$order->set_currency($channel['data']['currency']);$line=$order->add_product(wc_get_product($p->get_id()),5);$order->save();
 D::command('assign-order',['key'=>wp_generate_uuid4(),'order_id'=>$order->get_id(),'channel_id'=>$channel['id'],'reason'=>'Bridge fixture'],[Katukina\Core\Workflow::class,'initialize']);
 D::command('reserve',['key'=>wp_generate_uuid4(),'lot_id'=>$lot['id'],'order_id'=>$order->get_id(),'line_id'=>$line,'quantity'=>'5','expires_at'=>gmdate('Y-m-d H:i:s',time()+600),'reason'=>'Bridge fixture'],[I::class,'reserve']);
 $reject(static function()use($p){$c=wc_get_product($p->get_id());$c->set_stock_quantity(4);$c->save();},'native edit cannot consume reserved stock');
 $assert(S::physical($p->get_id())===6000,'reserve is not a physical debit');
 $run($receive($p,'second',2));
 $reject(static function()use($p){$c=wc_get_product($p->get_id());$c->set_stock_quantity(7);$c->save();},'ambiguous multi-lot edit rejected');
 D::command('adjust',['key'=>wp_generate_uuid4(),'lot_id'=>$lot['id'],'quantity'=>'-1','reference'=>$prefix,'reason'=>'Bridge fixture'],[I::class,'adjust']);
 $assert((int)wc_get_product($p->get_id())->get_stock_quantity()===7,'selected lot adjustment updates aggregate');
 $lookup=$wpdb->get_var($wpdb->prepare("SELECT stock_quantity FROM {$wpdb->wc_product_meta_lookup} WHERE product_id=%d",$p->get_id()));
 $assert((int)$lookup===7,'WooCommerce stock lookup synchronized');
 $_POST['kat_stock_lot'][$p->get_id()]=$lot['id'];$changed=wc_get_product($p->get_id());$changed->set_stock_quantity(8);$changed->save();unset($_POST['kat_stock_lot']);
 $assert(S::physical($p->get_id())===8000 && (int)I::lot((int)$lot['id'])['balance']===6000,'native multi-lot edit uses explicitly selected lot');
 $opening=$create(3);$delivery=$receive($opening,'opening',2);
 $reject(fn()=>$run($delivery),'opening transfer requires explicit confirmation');
 $assert(!S::lots($opening->get_id()) && (int)wc_get_product($opening->get_id())->get_stock_quantity()===3,'unconfirmed transfer preserves native balance');
 $delivery['import_native_stock']='1';$run($delivery);$run($delivery);
 $assert(S::physical($opening->get_id())===5000 && count(S::lots($opening->get_id()))===2,'opening balance plus new receipt exactly once');
 $parent=new WC_Product_Variable();$parent->set_name($prefix.'-parent');$parent->set_status('draft');$parent->set_manage_stock(true);$parent->set_stock_quantity(4);$parent->save();$products[]=$parent->get_id();
 $child=new WC_Product_Variation();$child->set_parent_id($parent->get_id());$child->set_status('publish');$child->set_regular_price('1');$child->save();$products[]=$child->get_id();wc_delete_product_transients($parent->get_id());
 $run($receive($child,'variation',2,['import_native_stock'=>'1']));
 $assert(S::physical($child->get_id())===6000 && (int)wc_get_product($child->get_id())->get_stock_quantity()===6,'single variation adopts parent stock');
 $assert(!wc_get_product($parent->get_id())->get_manage_stock('edit'),'shared parent authority removed');
 $reject(static function()use($parent){$c=wc_get_product($parent->get_id());$c->set_manage_stock(true);$c->save();},'shared parent authority cannot be reenabled');
 $bulk=$create();$bulk->update_meta_data('_kat_type','bulk');$bulk->update_meta_data('_kat_unit','g');$bulk->update_meta_data('_kat_content_unit','g');$bulk->update_meta_data('_kat_content_quantity','1');$bulk->save();
 $run($receive($bulk,'fractional', '1.125'));$assert((float)wc_get_product($bulk->get_id())->get_stock_quantity()===1.125,'bulk fractional physical stock preserved');
 $changed=wc_get_product($bulk->get_id());$changed->set_stock_quantity(2.375);$changed->save();$assert(S::physical($bulk->get_id())===2375,'native fractional bulk edit preserved');
 $assert(I::reconcile()===[],'ledger reconciles');
 update_post_meta($bulk->get_id(),'_stock','99');$assert(count(S::reconcile())===1,'reconciliation detects native mirror drift');
 D::command('repair-test',['key'=>wp_generate_uuid4()],static function()use($bulk){S::sync($bulk->get_id());return ['id'=>$bulk->get_id()];});$assert(S::reconcile()===[],'projection repair reconciles');
 WP_CLI::success($checks.' stock bridge assertions passed.');
}finally{
 foreach($products as $id){$form=(int)get_post_meta($id,'_kat_form_record_id',true);$ids=$form?$wpdb->get_col($wpdb->prepare('SELECT id FROM '.D::table('lots').' WHERE form_id=%d',$form)):[];foreach($ids as $lot_id){foreach(['movements','reservations'] as $table)$wpdb->delete(D::table($table),['lot_id'=>$lot_id]);$wpdb->delete(D::table('lots'),['id'=>$lot_id]);}}
 if(isset($order)){$wpdb->delete(D::table('orders'),['order_id'=>$order->get_id()]);$order->delete(true);}
 foreach(array_reverse($products) as $id){$mapping=[];foreach(['form','item']as $kind)$mapping[]=(int)get_post_meta($id,'_kat_'.$kind.'_record_id',true);$p=wc_get_product($id);if($p)$p->delete(true);foreach(array_filter($mapping)as $mid)$wpdb->delete(D::table('records'),['id'=>$mid]);}
}
