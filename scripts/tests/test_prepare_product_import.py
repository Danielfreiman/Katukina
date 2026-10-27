import hashlib
import importlib.util
from pathlib import Path
import tempfile
import unittest
from xml.sax.saxutils import escape
from zipfile import ZipFile


SPEC = importlib.util.spec_from_file_location(
    "product_import", Path(__file__).resolve().parents[1] / "prepare_product_import.py"
)
product_import = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(product_import)


def column(index):
    result = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        result = chr(65 + remainder) + result
    return result


def fixture_row(**changes):
    data = dict.fromkeys(product_import.FIELDS, "")
    data.update(item_id="470", item_name="Test item", item_sku="0470",
                form_id="753", form_sku="0470-0753", form_label="Bottle",
                quantity_label="1 pc", retail_active="1", retail_price_gbp="12.50",
                stock_snapshot="7", stock_unit="pcs", origin_country="GB", location="01 A",
                active_category_count="99", active_site_count="8",
                urls="https://katukina.com/products/floral-waters/test-item")
    data.update(changes)
    return data


def workbook(path, rows, unmatched=(), headers=None):
    shared = []

    def cell(address, value):
        if isinstance(value, tuple):
            kind, text = value
            if kind == "shared":
                shared.append(text)
                return f'<c r="{address}" t="s"><v>{len(shared)-1}</v></c>'
            if kind == "formula":
                return f'<c r="{address}"><f>{escape(text)}</f><v>1</v></c>'
            return f'<c r="{address}"><v>{escape(text)}</v></c>'
        return f'<c r="{address}" t="inlineStr"><is><t>{escape(value)}</t></is></c>'

    def sheet(data):
        body = "".join(f'<row r="{number}">' + "".join(
            cell(f"{column(index)}{number}", value) for index, value in enumerate(values, 1)
        ) + "</row>" for number, values in enumerate(data, 1))
        return f'<worksheet xmlns="{product_import.NS["s"]}"><sheetData>{body}</sheetData></worksheet>'

    first = sheet([headers or product_import.HEADERS] + [
        [row[field] for field in product_import.FIELDS] for row in rows
    ])
    second = sheet([["SKU no Katukina", "URL"], *unmatched])
    with ZipFile(path, "w") as archive:
        archive.writestr("xl/workbook.xml", f'''<workbook xmlns="{product_import.NS['s']}" xmlns:r="{product_import.REL_NS}"><sheets><sheet name="Produtos no Katukina" sheetId="1" r:id="rId1"/><sheet name="Katukina sem par" sheetId="2" r:id="rId2"/></sheets></workbook>''')
        archive.writestr("xl/_rels/workbook.xml.rels", '''<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Target="worksheets/catalogue.xml"/><Relationship Id="rId2" Target="/xl/worksheets/unmatched.xml"/></Relationships>''')
        archive.writestr("xl/worksheets/catalogue.xml", first)
        archive.writestr("xl/worksheets/unmatched.xml", second)
        archive.writestr("xl/sharedStrings.xml", f'<sst xmlns="{product_import.NS["s"]}">' + "".join(
            f"<si><t>{escape(text)}</t></si>" for text in shared
        ) + "</sst>")


class ProductImportTests(unittest.TestCase):
    def test_grouping_preserves_textual_ids_price_tiers_and_source(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "catalogue.xlsx"
            workbook(path, [
                fixture_row(item_sku=("shared", "0470"), form_sku=("shared", "0470-0753"),
                            quantity_label="2 pc", retail_price_gbp="20"),
                fixture_row(retail_price_gbp=("numeric", "12.50")),
                fixture_row(form_id="754", form_sku="0470-0754", retail_price_gbp="9"),
            ])
            before = path.read_bytes()
            result = product_import.prepare_manifest(path)
            item = result["items"][0]
            self.assertEqual(result["summary"]["source_rows"], 3)
            self.assertEqual(result["summary"]["items"], 1)
            self.assertEqual(result["summary"]["forms"], 2)
            self.assertEqual(item["sku"], "0470")
            form = item["forms"][0]
            self.assertEqual(form["sku"], "0470-0753")
            self.assertEqual(form["retail_price_gbp"], "12.50")
            self.assertEqual(form["sale_quantity"], "1 pc")
            self.assertEqual(form["stock_snapshot"], "7")
            self.assertEqual([row["source_row"] for row in form["source_rows"]], [2, 3])
            self.assertEqual(len(form["source_rows"][0]["data"]), 40)
            self.assertEqual(item["categories"], [{"slug": "floral-waters", "name": "Floral Waters"}])
            self.assertEqual(result["currency"], "GBP")
            self.assertFalse(result["summary"]["stock_imported"])
            self.assertEqual(path.read_bytes(), before)
            self.assertEqual(result["source"]["sha256"], hashlib.sha256(before).hexdigest())

    def test_single_non_unit_tier_has_no_price_or_stock_conversion(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "catalogue.xlsx"
            workbook(path, [fixture_row(quantity_label="5 pc", form_label=""),
                            fixture_row(retail_active="0", retail_price_gbp="")])
            result = product_import.prepare_manifest(path)
            form = result["items"][0]["forms"][0]
            self.assertEqual(form["label"], "Form 0470-0753")
            self.assertEqual(form["sale_quantity"], "5 pc")
            self.assertEqual(form["retail_price_gbp"], "12.50")
            self.assertEqual(form["stock_snapshot"], "7")
            self.assertEqual(result["summary"]["non_unit_retail_forms"], 1)

    def test_colliding_quantity_rows_remain_distinct(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "catalogue.xlsx"
            workbook(path, [fixture_row(), fixture_row(retail_active="0", retail_price_gbp="")])
            result = product_import.prepare_manifest(path)
            form = result["items"][0]["forms"][0]
            self.assertEqual(len(form["source_rows"]), 2)
            self.assertEqual(form["retail_price_gbp"], "12.50")
            self.assertEqual(form["stock_snapshot"], "7")
            self.assertEqual(result["summary"]["conflicting_sku_quantity_groups"], 1)
            self.assertEqual(form["issues"][0]["source_rows"], [2, 3])

    def test_ambiguous_active_prices_are_not_guessed(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "catalogue.xlsx"
            workbook(path, [fixture_row(), fixture_row(retail_price_gbp="15")])
            result = product_import.prepare_manifest(path)
            form = result["items"][0]["forms"][0]
            self.assertEqual(form["retail_price_gbp"], "")
            self.assertEqual(result["summary"]["retail_prices_selected"], 0)
            self.assertIn("ambiguous_retail_selection", [entry["code"] for entry in form["issues"]])

    def test_gbp_headers_and_formula_rejection(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "catalogue.xlsx"
            headers = list(product_import.HEADERS)
            headers[9] = "Preço varejo EUR"
            workbook(path, [fixture_row()], headers=headers)
            with self.assertRaisesRegex(ValueError, "GBP currency"):
                product_import.prepare_manifest(path)
            workbook(path, [fixture_row(retail_price_gbp=("formula", "SUM(1,2)"))])
            with self.assertRaisesRegex(ValueError, "Formula cells"):
                product_import.prepare_manifest(path)

    def test_unmatched_groups_by_slug_instead_of_shared_sku(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "catalogue.xlsx"
            workbook(path, [fixture_row()], unmatched=[
                ["119-128", "https://katukina.com/products/tea/first-tea"],
                ["119-128", "https://katukina.com/products/sale/first-tea"],
                ["119-128", "https://katukina.com/products/tea/second-tea"],
                ["0001-0002", "https://katukina.com/products/tea/first-tea"],
            ])
            result = product_import.prepare_manifest(path)
            self.assertEqual(result["summary"]["unmatched_products"], 2)
            first = result["unmatched"][0]
            self.assertEqual(first["name"], "First Tea")
            self.assertEqual(first["source_skus"], ["119-128", "0001-0002"])
            self.assertEqual(len(first["urls"]), 2)
            self.assertIn("unmatched_sku_collision", [entry["code"] for entry in result["issues"]])


if __name__ == "__main__":
    unittest.main()
