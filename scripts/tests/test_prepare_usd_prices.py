import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from prepare_usd_prices import Prices, quantity_key

class PublicUsdPricesTests(unittest.TestCase):
    def test_public_grid_keeps_identity_and_quantity_with_malformed_closing_label(self):
        parser=Prices()
        parser.feed('''<select><option value="USD" selected>US Dollar</option></select>
        <div class="forms-grid-col" id="grid-form_2871" class="hoverable" data-iid="1474" data-ioid="2871">
        <li class="form-grid-weight" data-noprice="0" data-inquire="0"><label>
        <span class="form-grid-weight-quantity">5&nbsp;pcs</span>
        <span class="form-grid-weight-price">$&nbsp;5.01</span></label</li></div>''')
        self.assertTrue(parser.usd)
        self.assertEqual(len(parser.rows),1)
        self.assertEqual(parser.rows[0]['form_id'],'2871')
        self.assertEqual(parser.rows[0]['display_price'],'$ 5.01')
        self.assertEqual(quantity_key(parser.rows[0]['quantity']),'5 pc')
        self.assertNotEqual(quantity_key('5 pcs'),quantity_key('1 pc'))

    def test_gbp_is_not_treated_as_usd(self):
        parser=Prices();parser.feed('<option value="GBP" selected>GBP</option><option value="USD">USD</option>')
        self.assertFalse(parser.usd)

if __name__=='__main__': unittest.main()
