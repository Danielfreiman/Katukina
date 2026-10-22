import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from xml.sax.saxutils import escape
from zipfile import ZipFile

SPEC = importlib.util.spec_from_file_location("audit", Path(__file__).resolve().parents[1] / "audit_legacy_exports.py")
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)


def workbook(path, rows, extra_header="0% VAT", extra_value="0"):
    def text(address, value):
        return f'<c r="{address}" t="inlineStr"><is><t>{escape(value)}</t></is></c>'

    header = ["order date", "order id", "order currency", "name", extra_header]
    body = '<row r="1">' + text("E1", "ENGINE CURRENCY") + '</row>'
    body += '<row r="2">' + ''.join(text(f'{chr(65+i)}2', value) for i, value in enumerate(header)) + '</row>'
    for index, order_id in enumerate(rows, 3):
        body += f'<row r="{index}">' + text(f'A{index}', '2026-10-05')
        body += f'<c r="B{index}"><v>{order_id}</v></c>' + text(f'C{index}', 'EUR')
        body += text(f'D{index}', 'PRIVATE CUSTOMER')
        body += f'<c r="E{index}"><v>{extra_value}</v></c></row>'
    with ZipFile(path, "w") as archive:
        archive.writestr('xl/worksheets/sheet1.xml', '<worksheet xmlns="' + audit.NS['s'] + '"><sheetData>' + body + '</sheetData></worksheet>')


class ExportAuditTests(unittest.TestCase):
    def test_different_schemas_and_duplicate_ids_preserve_source_files(self):
        with tempfile.TemporaryDirectory() as directory:
            first, second = Path(directory) / 'a.xlsx', Path(directory) / 'b.xlsx'
            workbook(first, ['1', '2'])
            workbook(second, ['2', '3'], extra_header='13% VAT')
            before = [p.read_bytes() for p in (first, second)]
            report = audit.audit_exports([first, second])
            self.assertEqual(report['summary']['rows'], 4)
            self.assertEqual(report['summary']['distinct_raw_order_ids'], 3)
            self.assertEqual(report['summary']['duplicate_order_ids'], 1)
            self.assertEqual(report['summary']['duplicate_ids_with_conflicting_common_fields'], 0)
            self.assertEqual(report['sources'][0]['columns_not_in_every_source'], ['ENGINE CURRENCY · 0% VAT'])
            self.assertEqual(before, [p.read_bytes() for p in (first, second)])
            self.assertNotIn('PRIVATE CUSTOMER', json.dumps(report))
            self.assertIsNone(report['summary']['engine_currency_code'])

    def test_invalid_number_is_counted_without_coercion(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'bad.xlsx'
            workbook(path, ['1'], extra_value='invalid-number')
            report = audit.audit_exports([path])
            self.assertEqual(report['summary']['invalid_numeric_cells'], 1)
            self.assertNotIn('invalid-number', json.dumps(report))

    def test_duplicates_with_changed_values_require_reconciliation(self):
        with tempfile.TemporaryDirectory() as directory:
            first, second = Path(directory) / 'a.xlsx', Path(directory) / 'b.xlsx'
            workbook(first, ['1'], extra_value='1')
            workbook(second, ['1'], extra_value='2')
            result = audit.audit_exports([first, second])['summary']
            self.assertEqual(result['duplicate_ids_with_conflicting_common_fields'], 1)
            self.assertEqual(result['conflicting_field_counts'], {'ENGINE CURRENCY · 0% VAT': 1})

    def test_no_input_is_an_error(self):
        with self.assertRaisesRegex(ValueError, 'No XLSX'):
            audit.audit_exports([])

    def test_column_addresses_and_nested_tax_labels(self):
        self.assertEqual(audit.column_index('AA15'), 26)
        with self.assertRaises(ValueError):
            audit.column_index('invalid')
        self.assertEqual(audit.column_labels({0: 'ENGINE CURRENCY'}, {0: 'Shipping', 1: '% VAT', 2: 'VAT', 3: 'Fees'}, 4), [
            'ENGINE CURRENCY · Shipping', 'ENGINE CURRENCY · Shipping · % VAT',
            'ENGINE CURRENCY · Shipping · VAT', 'ENGINE CURRENCY · Fees',
        ])


if __name__ == '__main__':
    unittest.main()
