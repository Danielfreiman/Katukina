#!/usr/bin/env python3
"""Download allowlisted public catalogue images, preserving Item/Form identities.

Remote HTML is data only. No scripts, descriptions, prices or instructions are executed
or imported. The cache and media.json are local import artifacts, not publications.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import quote, unquote, urljoin, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


HOST = "katukina.com"
ASSET = re.compile(r"^(\d+)(?:-(\d+))?(?:_[A-Za-z0-9_-]+)?\.(jpg|jpeg|png|webp)$", re.I)
ITEM_IMAGE_PATH = re.compile(r"^/(?:images/[A-Za-z0-9-]+/)?assets/images/items/[^/]+$")
MIME = {"image/jpeg": "jpg", "image/jpg": "jpg", "image/pjpeg": "jpg", "image/png": "png", "image/webp": "webp"}
PAGE_LIMIT = 3 * 1024 * 1024
IMAGE_LIMIT = 16 * 1024 * 1024


def identity(value: object) -> str:
    text = str(value).strip()
    return str(int(text)) if text.isdigit() else text


def safe_url(raw: str, base: str = "https://katukina.com/") -> str:
    """Only this public HTTPS host; credentials, alternate ports and control bytes fail."""
    if not isinstance(raw, str) or any(ord(char) < 32 for char in raw):
        raise ValueError("invalid_url")
    parsed = urlsplit(urljoin(base, raw.strip()))
    if parsed.scheme != "https" or parsed.hostname != HOST or parsed.username or parsed.password or parsed.port not in (None, 443):
        raise ValueError("url_outside_https_katukina_allowlist")
    return urlunsplit(("https", HOST, quote(parsed.path or "/", safe="/%:@!$&'()*+,;=-._~"), parsed.query, ""))


class SafeRedirect(HTTPRedirectHandler):
    max_repeats = 2
    max_redirections = 5

    def redirect_request(self, request, response, code, message, headers, new_url):
        destination = safe_url(new_url, request.full_url)
        return super().redirect_request(request, response, code, message, headers, destination)


def fetch(url: str, *, image: bool, timeout: float, retries: int) -> tuple[bytes, str, str]:
    url = safe_url(url)
    if image and not ITEM_IMAGE_PATH.fullmatch(unquote(urlsplit(url).path)):
        raise ValueError("not_an_item_image")
    limit = IMAGE_LIMIT if image else PAGE_LIMIT
    for attempt in range(retries + 1):
        try:
            request = Request(url, headers={
                "User-Agent": "Mozilla/5.0 (compatible; KatukinaLocalCatalogueImport/1.0)",
                "Accept": "image/jpeg,image/png,image/webp" if image else "text/html,application/xhtml+xml",
            })
            with build_opener(SafeRedirect()).open(request, timeout=timeout) as response:
                final = safe_url(response.geturl())
                if image and not ITEM_IMAGE_PATH.fullmatch(unquote(urlsplit(final).path)):
                    raise ValueError("redirect_not_an_item_image")
                content_type = response.headers.get_content_type().lower()
                if image and content_type not in MIME:
                    raise ValueError("unsupported_image_content_type:" + content_type)
                if not image and content_type not in ("text/html", "application/xhtml+xml"):
                    raise ValueError("not_html:" + content_type)
                if int(response.headers.get("Content-Length", "0")) > limit:
                    raise ValueError("response_too_large")
                payload = response.read(limit + 1)
                if len(payload) > limit:
                    raise ValueError("response_too_large")
                if image and image_format(payload) != MIME[content_type]:
                    raise ValueError("image_signature_content_type_mismatch")
                charset = response.headers.get_content_charset() or "utf-8"
                return payload, final, content_type if image else charset
        except (HTTPError, URLError, TimeoutError, OSError) as error:
            retry = not isinstance(error, HTTPError) or error.code in (408, 429, 500, 502, 503, 504)
            if attempt >= retries or not retry:
                raise
            time.sleep(0.4 * (attempt + 1))
    raise RuntimeError("request_failed")


def image_format(payload: bytes) -> str | None:
    if payload.startswith(b"\xff\xd8\xff") and payload.rstrip().endswith(b"\xff\xd9"):
        return "jpg"
    if payload.startswith(b"\x89PNG\r\n\x1a\n") and b"IEND" in payload[-20:]:
        return "png"
    if len(payload) >= 16 and payload[:4] == b"RIFF" and payload[8:12] == b"WEBP":
        return "webp"
    return None


class ProductPage(HTMLParser):
    def __init__(self, source_url: str):
        super().__init__(convert_charrefs=True)
        self.source_url = source_url
        self.candidates: list[dict] = []
        self.product_ids: list[str] = []
        self.headings: list[str] = []
        self.title_parts: list[str] = []
        self.heading_parts: list[str] | None = None
        self.in_title = False
        self.primary_link = False

    def candidate(self, raw: str, primary: bool = False):
        try:
            url = safe_url(raw, self.source_url)
        except (ValueError, TypeError):
            return
        path = unquote(urlsplit(url).path)
        if not ITEM_IMAGE_PATH.fullmatch(path):
            return
        basename = path.rsplit("/", 1)[-1]
        match = ASSET.fullmatch(basename)
        if not match:
            return
        dimensions = re.search(r"/images/w(\d+)(?:-h(\d+))?", path)
        # Prefer an actually linked full-size version; never invent a larger image URL.
        score = int(dimensions[1]) if dimensions else 10000
        self.candidates.append({"url": url, "basename": basename, "item_id": identity(match[1]),
                                "form_id": identity(match[2]) if match[2] else None,
                                "score": score, "primary": primary})

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]):
        values = dict(attrs)
        classes = (values.get("class") or "").split()
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.heading_parts = None if values.get("id") == "header_title" else []
        if tag == "div" and "forms-grid-col" in classes and (values.get("data-iid") or "").isdigit():
            self.product_ids.append(identity(values["data-iid"]))
        if tag == "a":
            self.primary_link = "item_foto" in classes
            if values.get("href"):
                self.candidate(values["href"], self.primary_link)
        elif tag == "link" and values.get("href"):
            self.candidate(values["href"])
        elif tag == "img":
            for attr in ("src", "data-src", "data-original"):
                if values.get(attr):
                    self.candidate(values[attr], self.primary_link)
            for entry in (values.get("srcset") or "").split(","):
                parts = entry.strip().split()
                if parts:
                    self.candidate(parts[0], self.primary_link)

    def handle_endtag(self, tag: str):
        if tag == "title":
            self.in_title = False
        if tag == "a":
            self.primary_link = False
        if tag == "h1" and self.heading_parts is not None:
            title = " ".join("".join(self.heading_parts).split())
            if title:
                self.headings.append(title[:200])
            self.heading_parts = None

    def handle_data(self, text: str):
        if self.in_title:
            self.title_parts.append(text)
        if self.heading_parts is not None:
            self.heading_parts.append(text)

    def result(self) -> dict:
        title = " ".join("".join(self.title_parts).split()).split(" at Katukina", 1)[0][:200]
        return {"source_url": self.source_url, "name": (self.headings or [title])[0],
                "product_ids": list(dict.fromkeys(self.product_ids)), "candidates": self.candidates}


def select_candidates(page: dict, record: dict, unmatched: bool) -> list[dict]:
    candidates = page["candidates"]
    if unmatched:
        # A source SKU may itself be the unresolved spreadsheet collision. The product's
        # main photo or form grid, never related-product thumbnails, establishes identity.
        primary_ids = list(dict.fromkeys(row["item_id"] for row in candidates if row["primary"]))
        allowed = primary_ids if len(primary_ids) == 1 else page["product_ids"]
        if len(allowed) != 1:
            return []
        allowed_items = set(allowed)
        allowed_forms = None
    else:
        allowed_items = {identity(record["key"])}
        allowed_forms = {identity(form["key"]) for form in record["forms"]}
    chosen: dict[str, dict] = {}
    for candidate in candidates:
        if candidate["item_id"] not in allowed_items:
            continue
        if allowed_forms is not None and candidate["form_id"] and candidate["form_id"] not in allowed_forms:
            continue
        key = candidate["basename"].lower()
        previous = chosen.get(key)
        if previous is None or candidate["score"] > previous["score"]:
            chosen[key] = {**candidate, "primary": candidate["primary"] or bool(previous and previous["primary"])}
        elif candidate["primary"]:
            previous["primary"] = True
    ordered = sorted(chosen.values(), key=lambda row: (not row["primary"], row["form_id"] is not None, row["basename"].lower()))
    limited = []
    counts: dict[str | None, int] = {}
    for candidate in ordered:
        form = candidate["form_id"]
        maximum = 6 if form is not None else 12
        if counts.get(form, 0) < maximum:
            limited.append(candidate)
            counts[form] = counts.get(form, 0) + 1
    return limited


def atomic_json(path: Path, value: object):
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


class MediaDownloader:
    def __init__(self, root: Path, timeout: float, retries: int):
        self.root, self.timeout, self.retries = root, timeout, retries
        self.images = root / "images"
        self.cache = root / ".cache"
        self.pages = self.cache / "pages"
        for directory in (self.images, self.pages):
            directory.mkdir(parents=True, exist_ok=True)
        self.lock = threading.Lock()
        self.url_locks: dict[str, threading.Lock] = {}
        self.files: dict[str, dict] = {}
        self.by_hash: dict[str, str] = {}
        self.by_url: dict[str, str] = {}
        self.downloaded = self.reused = 0
        index_file = self.cache / "images.json"
        if index_file.is_file():
            index = json.loads(index_file.read_text(encoding="utf-8"))
            for name, entry in index.get("files", {}).items():
                if Path(name).name != name:
                    continue
                image_path = self.images / name
                if not image_path.is_file():
                    continue
                payload = image_path.read_bytes()
                if image_format(payload) and hashlib.sha256(payload).hexdigest() == entry.get("sha256"):
                    self.files[name] = entry
                    self.by_hash[entry["sha256"]] = name
            self.by_url = {url: name for url, name in index.get("by_url", {}).items() if name in self.files}

    def page(self, url: str) -> dict:
        url = safe_url(url)
        with self.lock:
            mutex = self.url_locks.setdefault("page:" + url, threading.Lock())
        with mutex:
            return self._page(url)

    def _page(self, url: str) -> dict:
        cache_file = self.pages / (hashlib.sha256(url.encode()).hexdigest() + ".json")
        if cache_file.is_file():
            return json.loads(cache_file.read_text(encoding="utf-8"))
        payload, final, encoding = fetch(url, image=False, timeout=self.timeout, retries=self.retries)
        parser = ProductPage(final)
        try:
            parser.feed(payload.decode(encoding, errors="replace"))
        except LookupError:
            parser.feed(payload.decode("utf-8", errors="replace"))
        result = parser.result()
        atomic_json(cache_file, result)
        return result

    def save_cache(self):
        # Call while holding self.lock, or after all workers have finished.
        atomic_json(self.cache / "images.json", {"files": self.files, "by_url": self.by_url})

    def image(self, candidate: dict) -> str:
        url = safe_url(candidate["url"])
        with self.lock:
            mutex = self.url_locks.setdefault(url, threading.Lock())
        with mutex:
            with self.lock:
                if url in self.by_url:
                    self.reused += 1
                    return self.by_url[url]
            payload, final, content_type = fetch(url, image=True, timeout=self.timeout, retries=self.retries)
            digest = hashlib.sha256(payload).hexdigest()
            extension = MIME[content_type]
            stem = Path(candidate["basename"]).stem
            if not re.fullmatch(r"[A-Za-z0-9_-]+", stem):
                stem = digest[:20]
            with self.lock:
                if digest in self.by_hash:
                    name = self.by_hash[digest]
                else:
                    name = stem + "." + extension
                    if (self.images / name).exists():
                        if hashlib.sha256((self.images / name).read_bytes()).hexdigest() != digest:
                            name = stem + "-" + digest[:16] + "." + extension
                    temporary = self.images / (name + ".tmp")
                    temporary.write_bytes(payload)
                    temporary.replace(self.images / name)
                    self.files[name] = {"source_url": final, "sha256": digest}
                    self.by_hash[digest] = name
                    self.downloaded += 1
                self.by_url[url] = name
                if self.downloaded % 20 == 0:
                    self.save_cache()
                return name

    def record(self, record: dict, unmatched: bool) -> tuple[dict, list[dict]]:
        issues: list[str] = []
        errors: list[dict] = []
        selected: list[dict] = []
        source = ""
        page_name = ""
        for url in dict.fromkeys(record.get("urls", [])):
            try:
                page = self.page(url)
                selected = select_candidates(page, record, unmatched)
                source = page["source_url"]
                if selected:
                    page_name = page["name"]
                    break
                issues.append("no_matching_item_images:" + url)
            except Exception as error:
                errors.append({"key": str(record["key"]), "stage": "page", "source_url": url,
                               "error": error_text(error)})
        forms = record.get("forms", [])
        by_form = {str(form["sku"]): [row for row in selected if row["form_id"] == identity(form["key"])][:6] for form in forms}
        # Master images/cover act as explicit fallback for forms with no linked photograph.
        fallback = next((row for row in selected if row["form_id"] is None), None) or next((row for row in selected if row["primary"]), None)
        gallery = selected[:12]
        wanted = {row["url"]: row for row in gallery}
        for group in by_form.values():
            for row in group:
                wanted[row["url"]] = row
        if fallback:
            wanted[fallback["url"]] = fallback
        downloaded: dict[str, str] = {}
        for url, candidate in wanted.items():
            try:
                downloaded[url] = self.image(candidate)
            except Exception as error:
                errors.append({"key": str(record["key"]), "stage": "image", "source_url": url,
                               "error": error_text(error)})
        image_files = list(dict.fromkeys(downloaded[row["url"]] for row in gallery if row["url"] in downloaded))[:12]
        result = {"source_url": source, "image_files": image_files, "issues": issues}
        if unmatched:
            result["name"] = page_name or record.get("name", str(record["key"]))
        else:
            result["forms"] = {}
            cover = downloaded.get(fallback["url"]) if fallback else None
            cover = cover or (image_files[0] if image_files else None)
            for form in forms:
                sku = str(form["sku"])
                names = list(dict.fromkeys(downloaded[row["url"]] for row in by_form[sku] if row["url"] in downloaded))[:6]
                if not names and cover:
                    names = [cover]
                    issues.append("cover_fallback_for_form:" + sku)
                result["forms"][sku] = names
        if not image_files:
            issues.append("no_product_image_downloaded")
        return result, errors


def error_text(error: Exception) -> str:
    if isinstance(error, HTTPError):
        return "HTTP " + str(error.code)
    if isinstance(error, URLError):
        return "network_error:" + str(error.reason)[:160]
    return str(error)[:180] or type(error).__name__


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--output-root", required=True, type=Path)
    parser.add_argument("--workers", type=int, default=5, choices=range(1, 7))
    parser.add_argument("--timeout", type=float, default=18)
    parser.add_argument("--retries", type=int, default=1, choices=range(0, 3))
    parser.add_argument("--limit", type=int, default=0, help="Optional initial item limit for smoke checks; zero imports all.")
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text(encoding="utf-8-sig"))
    downloader = MediaDownloader(args.output_root.resolve(), args.timeout, args.retries)
    records = [(row, False) for row in manifest["items"]] + [(row, True) for row in manifest.get("unmatched", [])]
    if args.limit:
        records = records[:args.limit]
    result = {"items": {}, "unmatched": {}, "files": {}, "errors": []}
    print(json.dumps({"status": "started", "records": len(records), "workers": args.workers}), flush=True)
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(downloader.record, row, unmatched): (row, unmatched) for row, unmatched in records}
        for completed, future in enumerate(as_completed(futures), 1):
            record, unmatched = futures[future]
            try:
                entry, errors = future.result()
            except Exception as error:
                entry = {"source_url": "", "image_files": [], "issues": ["record_failed"]}
                errors = [{"key": str(record["key"]), "stage": "record", "error": error_text(error)}]
                if unmatched:
                    entry["name"] = record.get("name", str(record["key"]))
                else:
                    entry["forms"] = {str(form["sku"]): [] for form in record.get("forms", [])}
            result["unmatched" if unmatched else "items"][str(record["key"])] = entry
            result["errors"].extend(errors)
            if completed % 10 == 0 or completed == len(records):
                print(json.dumps({"status": "progress", "completed": completed, "total": len(records),
                                  "images_downloaded": downloader.downloaded, "cache_hits": downloader.reused,
                                  "errors": len(result["errors"])}), flush=True)
    downloader.save_cache()
    used = set()
    for entry in [*result["items"].values(), *result["unmatched"].values()]:
        used.update(entry["image_files"])
        for images in entry.get("forms", {}).values():
            used.update(images)
    result["files"] = {name: downloader.files[name] for name in sorted(used)}
    result["items"] = dict(sorted(result["items"].items()))
    result["unmatched"] = dict(sorted(result["unmatched"].items()))
    atomic_json(downloader.root / "media.json", result)
    print(json.dumps({"status": "complete", "items": len(result["items"]), "unmatched": len(result["unmatched"]),
                      "items_with_images": sum(bool(row["image_files"]) for row in result["items"].values()),
                      "unmatched_with_images": sum(bool(row["image_files"]) for row in result["unmatched"].values()),
                      "forms_with_images": sum(bool(images) for row in result["items"].values() for images in row["forms"].values()),
                      "unique_images": len(result["files"]), "errors": len(result["errors"]),
                      "output": str(downloader.root / "media.json")}), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
