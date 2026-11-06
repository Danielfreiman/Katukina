"""Prepare a private, hash-checked plan; never modify the supplied photo tree."""
import argparse
from collections import defaultdict, Counter
import hashlib
import json
from pathlib import Path
import shutil
import re
import unicodedata
from urllib.parse import urlparse, unquote

def category_key(value):
    value = unicodedata.normalize('NFKD', value.replace('&', 'and').lower())
    return re.sub('[^a-z0-9]', '', value)


def resolve_primary(index, files, catalog, source):
    categories = defaultdict(set)
    for group in ('items', 'unmatched'):
        for item in catalog[group].values():
            parts = urlparse(item['source_url']).path.strip('/').split('/')
            if len(parts) < 3:
                continue
            names = list(item['image_files'])
            names.extend(name for form in item.get('forms', {}).values() for name in form)
            for name in names:
                categories[Path(name).stem].add(category_key(parts[-2]))
    resolved = []
    paths = defaultdict(list)
    for path in files:
        paths[path.stem].append(path)
    for stem, variants in list(index.items()):
        if len(variants) < 2:
            continue
        # Gallery files live directly under Category/Product. Description-image
        # collisions were intentionally archived in a separate nested folder.
        eligible = [p for p in paths[stem] if len(p.relative_to(source).parts) == 3 and category_key(p.relative_to(source).parts[0]) in categories[stem]]
        choices = {hashlib.sha256(p.read_bytes()).hexdigest(): p for p in eligible}
        if len(choices) == 1:
            index[stem] = choices
            resolved.append({'name': stem, 'chosen': str(next(iter(choices.values())).relative_to(source)), 'criterion': 'catalogue source category'})
    return resolved


def image_index(source):
    from PIL import Image
    by_stem = defaultdict(dict)
    invalid = []
    files = sorted(source.rglob('*.webp'))
    for path in files:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        with Image.open(path) as image:
            if image.format != 'WEBP' or image.size != (900, 900):
                invalid.append(str(path.relative_to(source)))
            image.verify()
        by_stem[path.stem][digest] = path
    return by_stem, files, invalid


def match_attachment(row, index, aliases):
    # Explicit original names take precedence over content aliases from deduplication.
    candidates = []
    for key in ('edited_name', 'source_url', 'sample_url'):
        value = row.get(key)
        if value:
            candidates.append(Path(unquote(urlparse(value).path)).stem)
    for stem in dict.fromkeys(candidates):
        if stem in index:
            if len(index[stem]) != 1:
                raise ValueError(f'Conflicting edited copies: {stem}')
            digest, path = next(iter(index[stem].items()))
            return stem, digest, path
    # File basenames are only used literally, never by guessing a numeric suffix.
    stem = Path(row['file']).stem
    if stem in index:
        if len(index[stem]) != 1:
            raise ValueError(f'Conflicting edited copies: {stem}')
        digest, path = next(iter(index[stem].items()))
        return stem, digest, path
    choices = {}
    for name in aliases.get(row['sha256'], []):
        for digest, path in index.get(Path(name).stem, {}).items():
            choices[digest] = path
    if len(choices) > 1:
        raise ValueError(f'Ambiguous deduplicated attachment: {row["id"]}')
    if choices:
        digest, path = next(iter(choices.items()))
        return path.stem, digest, path
    return None


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--source', type=Path, required=True)
    cli.add_argument('--batch', default='catalog-webp-2026-11-06')
    cli.add_argument('--prefer-primary-category', action='store_true', help='Use only after the owner approves this conflict rule.')
    args = cli.parse_args()
    if not re.fullmatch(r'catalog-webp-[a-z0-9-]+', args.batch):
        raise ValueError('Invalid batch name.')
    root = Path('wordpress/tools/.imports') / args.batch
    root.mkdir(parents=True, exist_ok=True)
    if (root / 'before.json').exists():
        raise ValueError('Batch already applied; use a new batch instead of replacing its manifest.')
    inventory = json.loads((root / 'wordpress-inventory.json').read_text())
    catalog = json.loads(Path('wordpress/tools/.imports/sacred-incense-uk/media.json').read_text())
    aliases = defaultdict(list)
    for name, info in catalog['files'].items():
        aliases[info['sha256']].append(name)
    index, files, invalid = image_index(args.source)
    unique_contents = len({h for variants in index.values() for h in variants})
    conflicting_names = [n for n, v in index.items() if len(v) > 1]
    resolved = resolve_primary(index, files, catalog, args.source) if args.prefer_primary_category else []
    plan, missing, conflicts = [], [], []
    for row in inventory['attachments']:
        try:
            match = match_attachment(row, index, aliases)
        except ValueError as error:
            conflicts.append(str(error))
            continue
        if not match:
            missing.append({'id': row['id'], 'file': row['file'], 'source_url': row['source_url']})
            continue
        stem, digest, path = match
        destination = root / 'images' / f'{digest}-{stem}.webp'
        plan.append({'id': row['id'], 'name': stem + '.webp', 'file': destination.relative_to(root).as_posix(),
                     'sha256': digest, 'old_sha256': row['sha256'], 'source': str(path.relative_to(args.source)),
                     'bytes': path.stat().st_size})
    referenced = {r['cover'] for r in inventory['references'] if r['cover']}
    referenced.update(i for r in inventory['references'] for i in r['gallery'])
    planned = {r['id'] for r in plan}
    missing_refs = sorted(referenced - planned)
    report = {'source_files': len(files), 'unique_names': len(index), 'unique_contents': unique_contents,
              'invalid_dimensions_or_format': invalid, 'conflicting_names': conflicting_names,
              'resolved_by_primary_category': resolved,
              'mapping_conflicts': conflicts, 'attachments_to_update': len(plan), 'unmatched_attachments': missing,
              'referenced_attachments': len(referenced), 'unmatched_referenced_ids': missing_refs,
              'product_records': Counter(r['type'] for r in inventory['references']),
              'source_bytes': sum(p.stat().st_size for p in files)}
    (root / 'preflight.json').write_text(json.dumps(report, indent=2), encoding='utf8')
    print(json.dumps({k: v for k, v in report.items() if k not in ('conflicting_names', 'resolved_by_primary_category')}, indent=2))
    print('Conflicting names:', len(conflicting_names), '; resolved by category:', len(resolved))
    if invalid or conflicts or missing_refs:
        raise ValueError('Invalid or ambiguous source images; no update manifest written.')
    (root / 'images').mkdir(exist_ok=True)
    for row in plan:
        original = args.source / row['source']
        target = root / row['file']
        if not target.exists():
            shutil.copy2(original, target)
        if hashlib.sha256(target.read_bytes()).hexdigest() != row['sha256']:
            raise ValueError('Staged source hash mismatch')
    (root / 'manifest.json').write_text(json.dumps({'source': str(args.source), 'attachments': plan}, indent=2), encoding='utf8')


if __name__ == '__main__':
    main()
