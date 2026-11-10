jQuery(function ($) {
  $('.kat-searchable, select[name^="outputs"][name$="[form_id]"], select[name^="inputs"][name$="[lot_id]"]').each(function () {
    const select = $(this);
    if (!select.hasClass('select2-hidden-accessible')) select.selectWoo({ width: 'resolve', minimumResultsForSearch: 0 });
  });
  $(document).on('select2:open', function () {
    const search = document.querySelector('.select2-container--open .select2-search__field');
    if (search) { search.setAttribute('aria-label', 'Search by name or SKU'); search.focus(); }
  });
});
jQuery(function ($) {
  const product = $('#kat-data-form_id');
  if (!product.length || typeof wpApiSettings === 'undefined') return;
  const status = $('<p class="description" role="status"></p>').appendTo(product.closest('td'));
  let sequence = 0;
  product.on('change', async function () {
    const current = ++sequence;
    if (!this.value) { status.text(''); return; }
    status.text('Checking stock…');
    try {
      const response = await fetch(wpApiSettings.root + 'katukina/v1/inventory/product/' + encodeURIComponent(this.value), {headers:{'X-WP-Nonce':wpApiSettings.nonce}});
      const data = await response.json();
      if (current !== sequence) return;
      if (!response.ok) throw new Error(data.message || 'Stock details unavailable.');
      let text = 'SKU ' + data.sku + ': ' + data.physical + ' ' + data.unit + ' physical stock; ' + data.lot_count + ' lot(s). ';
      if (data.shared_parent) text += 'Stock is shared by multiple variations. Allocate the parent balance to individual variations before receiving lots.';
      else if (!data.lot_count && data.native_managed && Number(data.physical) > 0) text += 'Confirm the opening-stock transfer below to preserve this balance. Enter only the NEW delivery in Quantity received.';
      else text += 'The receipt adds to this balance and updates WooCommerce automatically.';
      status.text(text);
    } catch (error) { if (current === sequence) status.text(error.message); }
  }).trigger('change');
});
