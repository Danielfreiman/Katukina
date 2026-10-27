"""Prepare a traceable GBP catalogue manifest from the supplied XLSX export.

Standard library only. No spreadsheet evaluation, HTTP requests or WordPress
writes. Source cells remain strings; quantity tiers do not create extra stock.
"""

import argparse
from collections import defaultdict
from decimal import Decimal, InvalidOperation
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree as ET
from zipfile import ZipFile


NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
FIELDS = (
    "item_id item_name item_sku active_category_count active_site_count form_id "
    "form_sku form_label quantity_label retail_price_gbp retail_active "
    "wholesale_price_gbp wholesale_active cost_gbp retail_profit_gbp "
    "wholesale_profit_gbp stock_snapshot stock_unit location last_restock "
    "origin_country vat_label supplier weight net_weight gross_weight volume "
    "max_per_order ordered_count promo_percent promo special_offer limited_stock "
    "rare featured one_off on_request no_price image_count urls"
).split()
HEADERS = [
    "Item ID", "Item", "Item SKU", "Categorias ativas", "Sites ativos", "Form ID",
    "SKU form", "Opção/forma", "Unidade/peso", "Preço varejo £", "RT ativo",
    "Preço atacado £", "WS ativo", "Custo £", "Lucro RT £", "Lucro WS £",
    "Estoque", "Un. estoque", "Localização", "Última reposição", "Origem", "IVA",
    "Fornecedor", "Peso", "Peso líquido", "Peso bruto", "Volume", "Máx. por pedido",
    "Vezes pedido", "% promo", "Promo", "Oferta especial", "Estoque limitado",
    "Raro", "Destaque", "One-off", "Sob consulta", "Sem preço", "Imagens",
    "URL no Katukina",
]


def column_index(address):
    match = re.fullmatch(r"([A-Z]+)[1-9][0-9]*", address)
    if not match:
        raise ValueError("Invalid cell address: " + address)
    result = 0
    for char in match[1]:
        result = result * 26 + ord(char) - ord("A") + 1
    return result - 1


def read_cell(cell, strings):
    if cell.find("s:f", NS) is not None:
        raise ValueError("Formula cells are unsupported: " + cell.get("r", ""))
    kind = cell.get("t", "n")
    value = cell.findtext("s:v", "", NS)
    if kind == "s":
        try:
            index = int(value)
            if index < 0:
                raise ValueError()
            return strings[index]
        except (ValueError, IndexError) as error:
            raise ValueError("Invalid shared string reference") from error
    if kind == "inlineStr":
        return "".join(node.text or "" for node in cell.findall("s:is//s:t", NS))
    if kind not in ("n", "b", "str", "d"):
        raise ValueError("Unsupported cell type: " + kind)
    return value


def read_workbook(path):
    with ZipFile(path) as archive:
        strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            strings = ["".join(node.text or "" for node in item.findall(".//s:t", NS))
                       for item in shared.findall("s:si", NS)]
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {node.get("Id"): node for node in relationships}
        sheets = {}
        for sheet in workbook.findall("s:sheets/s:sheet", NS):
            name = sheet.get("name")
            if name not in ("Produtos no Katukina", "Katukina sem par"):
                continue
            rel = targets.get(sheet.get("{" + REL_NS + "}id"))
            if rel is None or rel.get("TargetMode") == "External":
                raise ValueError("Missing or external worksheet: " + name)
            target = rel.get("Target", "")
            member = PurePosixPath(target.lstrip("/") if target.startswith("/")
                                   else "xl/" + target)
            if ".." in member.parts or not str(member).startswith("xl/worksheets/"):
                raise ValueError("Unsupported worksheet path")
            xml = ET.fromstring(archive.read(str(member)))
            rows = []
            for row in xml.findall("s:sheetData/s:row", NS):
                values = {}
                number = int(row.get("r", "0"))
                for cell in row.findall("s:c", NS):
                    index = column_index(cell.get("r", ""))
                    if index in values:
                        raise ValueError("Duplicate cell in row " + str(number))
                    values[index] = read_cell(cell, strings)
                if any(values.values()):
                    rows.append((number, values))
            if name in sheets:
                raise ValueError("Duplicate worksheet name")
            sheets[name] = rows
        if set(sheets) != {"Produtos no Katukina", "Katukina sem par"}:
            raise ValueError("Expected both catalogue worksheets")
        return sheets


def records(rows, headers):
    if not rows or [rows[0][1].get(i, "") for i in range(len(headers))] != headers:
        raise ValueError("Unexpected column headers; GBP currency and schema must be explicit")
    if any(index >= len(headers) and value for index, value in rows[0][1].items()):
        raise ValueError("Unexpected extra header columns")
    seen = set()
    result = []
    for number, values in rows[1:]:
        if number <= rows[0][0] or number in seen:
            raise ValueError("Duplicate or invalid source row")
        if any(index >= len(headers) and value for index, value in values.items()):
            raise ValueError("Unexpected extra data columns")
        seen.add(number)
        result.append((number, [values.get(i, "") for i in range(len(headers))]))
    return result


def urls(value):
    return list(dict.fromkeys(part.strip() for part in value.split("|") if part.strip()))


def product_path(url):
    try:
        parsed = urlsplit(url)
        if (parsed.scheme not in ("http", "https") or parsed.netloc.lower() != "katukina.com"
                or parsed.query or parsed.fragment):
            return None
        match = re.fullmatch(r"/products/([a-z0-9-]+)/([a-z0-9-]+)/?", parsed.path)
        return match.groups() if match else None
    except ValueError:
        return None


def title(slug):
    return unquote(slug).replace("-", " ").title()


def issue(code, message, rows, **detail):
    return {"code": code, "message": message, "source_rows": rows, **detail}


def prepare_manifest(path):
    path = Path(path)
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    sheets = read_workbook(path)
    raw = records(sheets["Produtos no Katukina"], HEADERS)
    unmatched_raw = records(sheets["Katukina sem par"], ["SKU no Katukina", "URL"])
    grouped = {}
    all_issues = []
    for number, values in raw:
        data = dict(zip(FIELDS, values))
        if not data["item_id"] or not data["form_id"] or not data["form_sku"]:
            raise ValueError("Missing item/Form identity in row " + str(number))
        item = grouped.setdefault(data["item_id"], {})
        item.setdefault(data["form_id"], []).append({"source_row": number, "data": data})

    items = []
    collisions = 0
    non_unit_retail = 0
    missing_labels = 0
    for item_id, forms in grouped.items():
        source_rows = [row for group in forms.values() for row in group]
        first = source_rows[0]["data"]
        item_urls = list(dict.fromkeys(url for row in source_rows for url in urls(row["data"]["urls"])))
        categories = {}
        for url in item_urls:
            parsed = product_path(url)
            if parsed:
                categories[parsed[0]] = {"slug": parsed[0], "name": title(parsed[0])}
            else:
                all_issues.append(issue("unrecognised_product_url", "URL retained without inferring a category.", [], item_id=item_id, url=url))
        for field in ("item_name", "item_sku"):
            distinct = list(dict.fromkeys(row["data"][field] for row in source_rows))
            if len(distinct) > 1:
                all_issues.append(issue("item_field_conflict", "Source item field differs between rows.", [row["source_row"] for row in source_rows], item_id=item_id, field=field, values=distinct))
        item = {"key": item_id, "name": first["item_name"], "sku": first["item_sku"],
                "urls": item_urls, "categories": list(categories.values()), "forms": []}
        for form_id, rows in forms.items():
            issues = []
            base = rows[0]["data"]
            by_quantity = defaultdict(list)
            for row in rows:
                by_quantity[(row["data"]["form_sku"], row["data"]["quantity_label"])].append(row)
            for (sku, quantity), repeated in by_quantity.items():
                if len(repeated) > 1:
                    different = len({json.dumps(row["data"], sort_keys=True) for row in repeated}) > 1
                    collisions += int(different)
                    issues.append(issue("conflicting_sku_quantity" if different else "repeated_source_row",
                                        "All rows retained; stock must not be summed across quantity tiers.",
                                        [row["source_row"] for row in repeated], sku=sku, quantity=quantity))
            active = [row for row in rows if row["data"]["retail_active"].strip() == "1"]
            one_pc = [row for row in active if re.fullmatch(r"1\s+pc", row["data"]["quantity_label"].strip(), re.I)]
            chosen = one_pc[0] if len(one_pc) == 1 else (active[0] if not one_pc and len(active) == 1 else None)
            price = ""
            if chosen:
                price = chosen["data"]["retail_price_gbp"]
                try:
                    amount = Decimal(price)
                    if not amount.is_finite() or amount < 0:
                        raise InvalidOperation
                except InvalidOperation:
                    issues.append(issue("invalid_retail_price", "Active retail price is not a finite non-negative GBP amount.", [chosen["source_row"]], value=price))
                    price = ""
                if not one_pc:
                    non_unit_retail += 1
                    issues.append(issue("non_unit_retail_quantity", "The sole active retail tier is used with its original quantity label; no unit-price conversion.", [chosen["source_row"]]))
            else:
                issues.append(issue("ambiguous_retail_selection", "No unique active retail tier can be selected; price left empty.", [row["source_row"] for row in active]))
            if len(active) > 1:
                issues.append(issue("multiple_active_retail_tiers", "All active retail tiers remain in source_rows; only an unambiguous 1 pc tier may take precedence.", [row["source_row"] for row in active]))
            form = {"key": form_id, "sku": base["form_sku"],
                    "label": base["form_label"] or "Form " + base["form_sku"],
                    "sale_quantity": chosen["data"]["quantity_label"] if chosen else "",
                    "retail_price_gbp": price, "source_rows": rows, "issues": issues}
            if not base["form_label"]:
                missing_labels += 1
                issues.append(issue("missing_form_label", "Neutral label uses the source SKU.", [rows[0]["source_row"]]))
            for field in ("stock_snapshot", "stock_unit", "origin_country", "location", "form_sku", "form_label"):
                distinct = list(dict.fromkeys(row["data"][field] for row in rows))
                if field not in ("form_sku", "form_label"):
                    form[field] = distinct[0] if len(distinct) == 1 else ""
                if len(distinct) > 1:
                    issues.append(issue("form_field_conflict", "Source field differs; original rows retained for review.", [row["source_row"] for row in rows], field=field, values=distinct))
            item["forms"].append(form)
        items.append(item)

    unmatched = {}
    sku_slugs = defaultdict(set)
    for number, (sku, url) in unmatched_raw:
        parsed = product_path(url)
        if not parsed:
            all_issues.append(issue("unrecognised_unmatched_url", "Cannot derive a product slug; source references retained in this issue.", [number], sku=sku, url=url))
            continue
        slug = parsed[1]
        entry = unmatched.setdefault(slug, {"key": slug, "name": title(slug), "urls": [], "source_skus": []})
        if url not in entry["urls"]:
            entry["urls"].append(url)
        if sku not in entry["source_skus"]:
            entry["source_skus"].append(sku)
        sku_slugs[sku].add(slug)
    for entry in unmatched.values():
        all_issues.append(issue("unmatched_product", "Unmatched slug requires a separate draft; SKU is not a unique product identity.", [], slug=entry["key"], source_skus=entry["source_skus"]))
    for sku, slugs in sku_slugs.items():
        if len(slugs) > 1:
            all_issues.append(issue("unmatched_sku_collision", "One source SKU references multiple unmatched slugs; do not merge them.", [], sku=sku, slugs=sorted(slugs)))
    if hashlib.sha256(path.read_bytes()).hexdigest() != digest:
        raise ValueError("Source workbook changed during preparation")
    return {"schema_version": 1, "source": {"file": path.name, "sha256": digest},
            "currency": "GBP", "summary": {
                "source_rows": len(raw), "items": len(items),
                "forms": sum(len(item["forms"]) for item in items),
                "retail_prices_selected": sum(bool(form["retail_price_gbp"]) for item in items for form in item["forms"]),
                "non_unit_retail_forms": non_unit_retail, "forms_without_label": missing_labels,
                "conflicting_sku_quantity_groups": collisions,
                "unmatched_source_rows": len(unmatched_raw), "unmatched_products": len(unmatched),
                "unmatched_distinct_urls": len({url for item in unmatched.values() for url in item["urls"]}),
                "form_issues": sum(len(form["issues"]) for item in items for form in item["forms"]),
                "global_issues": len(all_issues), "stock_imported": False,
            }, "items": items, "unmatched": list(unmatched.values()), "issues": all_issues}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    if args.output.suffix.lower() != ".json" or args.source.resolve() == args.output.resolve():
        parser.error("Output must be a JSON file separate from the source workbook")
    manifest = prepare_manifest(args.source)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "source_sha256": manifest["source"]["sha256"],
                      "currency": manifest["currency"], "summary": manifest["summary"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
