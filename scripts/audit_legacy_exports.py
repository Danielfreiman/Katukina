"""Read the supplied two-header-row XLSX exports without modifying source data.

Only structural metadata and aggregate counts leave memory. This is a discovery
tool, not an importer, accounting reconciliation or general-purpose XLSX reader.
Uses Python's standard library; does not evaluate formulas or infer currencies.
"""

import argparse
from collections import Counter, defaultdict
from decimal import Decimal, InvalidOperation
import hashlib
import json
from pathlib import Path
import re
from xml.etree import ElementTree as ET
from zipfile import ZipFile


NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def column_index(address):
    match = re.fullmatch(r"([A-Z]+)[1-9][0-9]*", address)
    if not match:
        raise ValueError("Invalid worksheet cell address")
    result = 0
    for char in match[1]:
        result = result * 26 + ord(char) - ord("A") + 1
    return result - 1


def cell_value(cell, strings, counters):
    kind = cell.get("t", "n")
    value = cell.find("s:v", NS)
    raw = value.text if value is not None and value.text is not None else ""
    if cell.find("s:f", NS) is not None:
        counters["formula_cells"] += 1
    if kind == "s":
        return strings[int(raw)]
    if kind == "inlineStr":
        return "".join(node.text or "" for node in cell.findall("s:is//s:t", NS))
    if kind == "e":
        counters["error_cells"] += 1
    if kind == "n" and raw:
        try:
            number = Decimal(raw)
            if not number.is_finite():
                raise InvalidOperation
            return format(number, "f")
        except InvalidOperation:
            counters["invalid_numeric_cells"] += 1
    return raw


def column_labels(groups, headers, width):
    labels = []
    group, parent = "Pedido", ""
    for index in range(width):
        if groups.get(index):
            group, parent = groups[index], ""
        header = headers.get(index, "")
        if header in ("Shipping", "Fees", "Insurance"):
            parent = header
        elif header not in ("% VAT", "VAT"):
            parent = ""
        parts = [group]
        if parent and header in ("% VAT", "VAT"):
            parts.append(parent)
        parts.append(header or "(sem título)")
        labels.append(" · ".join(parts))
    return labels


def audit_exports(paths):
    sources, records, source_labels = [], defaultdict(list), []
    all_dates, all_currencies = [], set()
    for path in sorted(map(Path, paths)):
        with ZipFile(path) as archive:
            strings = []
            if "xl/sharedStrings.xml" in archive.namelist():
                shared = ET.fromstring(archive.read("xl/sharedStrings.xml"))
                strings = [
                    "".join(node.text or "" for node in item.findall(".//s:t", NS))
                    for item in shared.findall("s:si", NS)
                ]
            sheets = sorted(name for name in archive.namelist()
                            if re.fullmatch(r"xl/worksheets/sheet\d+\.xml", name))
            if not sheets:
                raise ValueError("No supported worksheets in " + path.name)
            for sheet in sheets:
                xml = ET.fromstring(archive.read(sheet))
                rows = xml.findall("s:sheetData/s:row", NS)
                if len(rows) < 2:
                    raise ValueError("Expected two header rows in " + path.name)
                counters = Counter()

                def read_row(row):
                    return {column_index(cell.get("r", "")): cell_value(cell, strings, counters)
                            for cell in row.findall("s:c", NS)}

                groups, headers = read_row(rows[0]), read_row(rows[1])
                width = max([*groups, *headers], default=-1) + 1
                labels = column_labels(groups, headers, width)
                fields = {name: index for index, name in headers.items()
                          if index < next((i for i, v in groups.items() if v), width)}
                required = {"order id", "order date", "order currency"}
                if not required.issubset(fields):
                    raise ValueError("Unsupported export headers in " + path.name)
                order_ids, dates, currencies = Counter(), [], set()
                row_count = missing_ids = unparsed_dates = 0
                for row in rows[2:]:
                    values = read_row(row)
                    if not any(value != "" for value in values.values()):
                        continue
                    if max(values, default=-1) >= width:
                        raise ValueError("Data extends beyond headers in " + path.name)
                    row_count += 1
                    order_id = values.get(fields["order id"], "")
                    if order_id:
                        order_ids[order_id] += 1
                        # Qualified labels avoid comparing currency sections by position.
                        semantic = {label: values.get(i, "") for i, label in enumerate(labels)
                                    if not label.endswith("(sem título)")}
                        records[order_id].append(semantic)
                    else:
                        missing_ids += 1
                    date = values.get(fields["order date"], "")
                    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
                        dates.append(date)
                    elif date:
                        unparsed_dates += 1
                    currency = values.get(fields["order currency"], "")
                    if currency:
                        currencies.add(currency)
                all_dates.extend(dates)
                all_currencies.update(currencies)
                source_labels.append(set(labels))
                sources.append({
                    "file": path.name, "sheet_xml": sheet,
                    "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                    "rows": row_count, "columns": width,
                    "unique_order_ids": len(order_ids), "missing_order_ids": missing_ids,
                    "duplicate_order_ids_within_sheet": sum(n > 1 for n in order_ids.values()),
                    "date_min": min(dates, default=None), "date_max": max(dates, default=None),
                    "unparsed_nonempty_dates": unparsed_dates,
                    "order_currencies": sorted(currencies),
                    "invalid_numeric_cells": counters["invalid_numeric_cells"],
                    "formula_cells": counters["formula_cells"], "error_cells": counters["error_cells"],
                    "columns_without_title": sum(not headers.get(i) for i in range(width)),
                    "qualified_columns": labels,
                })
    if not sources:
        raise ValueError("No XLSX exports matched; nothing was audited")
    duplicates = [versions for versions in records.values() if len(versions) > 1]
    conflicting = 0
    conflicting_fields = Counter()
    for versions in duplicates:
        common = set.intersection(*(set(version) for version in versions))
        changed = [field for field in common if len({version[field] for version in versions}) > 1]
        conflicting += bool(changed)
        conflicting_fields.update(changed)
    common_labels = set.intersection(*source_labels)
    for source, labels in zip(sources, source_labels):
        source["columns_not_in_every_source"] = sorted(labels - common_labels)
    return {
        "format_version": 1,
        "scope": "Local accounting exports; counts by raw legacy order ID, global uniqueness unverified.",
        "privacy": "No customer values, order IDs, VAT identifiers or individual amounts included.",
        "sources": sources,
        "summary": {
            "rows": sum(source["rows"] for source in sources),
            "distinct_raw_order_ids": len(records),
            "missing_order_ids": sum(source["missing_order_ids"] for source in sources),
            "duplicate_order_ids": len(duplicates),
            "extra_rows_for_duplicate_ids": sum(len(v) - 1 for v in duplicates),
            "duplicate_ids_with_conflicting_common_fields": conflicting,
            "conflicting_field_counts": dict(sorted(conflicting_fields.items())),
            "date_min": min(all_dates, default=None), "date_max": max(all_dates, default=None),
            "order_currencies": sorted(all_currencies),
            "engine_currency_code": None,
            "invalid_numeric_cells": sum(source["invalid_numeric_cells"] for source in sources),
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--pattern", default="export 2026-10-05 *.xlsx")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    paths = list(args.root.glob(args.pattern))
    if args.output.resolve() in {path.resolve() for path in paths}:
        parser.error("Output must not overwrite a source workbook")
    result = audit_exports(paths)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(args.output), "summary": result["summary"]}, ensure_ascii=True))


if __name__ == "__main__":
    main()
