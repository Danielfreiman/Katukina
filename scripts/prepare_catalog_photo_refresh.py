"""Stage a photo refresh using exact attachment/source paths from a prior batch."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil

from PIL import Image


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--previous-manifest', type=Path, required=True)
    parser.add_argument('--batch', required=True)
    args = parser.parse_args()
    import re
    if not re.fullmatch(r'catalog-webp-[a-z0-9-]+', args.batch):
        raise ValueError('Invalid batch')
    root = Path('wordpress/tools/.imports') / args.batch
    if (root / 'before.json').exists():
        raise ValueError('Batch already applied')
    read = lambda path: json.loads(path.read_text(encoding='utf8'))
    inventory = read(root / 'wordpress-inventory.json')
    previous = read(args.previous_manifest)
    source = args.source.resolve()
    photos = sorted(source.rglob('*.webp'))
    hashes = {}
    for path in photos:
        with Image.open(path) as image:
            if image.format != 'WEBP' or image.size != (900, 900):
                raise ValueError(f'Invalid image: {path}')
            image.verify()
        hashes[path.resolve()] = hashlib.sha256(path.read_bytes()).hexdigest()
    current = {row['id']: row for row in inventory['attachments']}
    plan = []
    for old in previous['attachments']:
        row = current[old['id']]
        if row['edited_name'] != old['name']:
            raise ValueError(f'Attachment identity changed: {old["id"]}')
        path = (source / Path(old['source'].replace('\\', '/'))).resolve()
        if not path.is_relative_to(source) or path not in hashes or path.name != old['name']:
            raise ValueError(f'Missing exact source: {old["source"]}')
        digest = hashes[path]
        plan.append(dict(id=row['id'], name=path.name,
                         file=f'images/{digest}-{path.name}', sha256=digest,
                         old_sha256=row['sha256'], source=path.relative_to(source).as_posix(),
                         bytes=path.stat().st_size))
    referenced = {r['cover'] for r in inventory['references'] if r['cover']}
    referenced.update(i for r in inventory['references'] for i in r['gallery'])
    if referenced - {r['id'] for r in plan}:
        raise ValueError('Unmapped referenced attachments')
    if len({r['id'] for r in plan}) != len(plan):
        raise ValueError('Duplicate attachment mapping')
    (root / 'images').mkdir(exist_ok=True)
    for row in plan:
        target = root / row['file']
        shutil.copy2(source / row['source'], target)
        if hashlib.sha256(target.read_bytes()).hexdigest() != row['sha256']:
            raise ValueError('Staged hash mismatch')
    report = dict(source_files=len(photos), mapped=len(plan), referenced=len(referenced),
                  changed=sum(r['sha256'] != r['old_sha256'] for r in plan),
                  mapping='exact prior attachment ID and category/product/file path',
                  invalid_images=0, unmatched_referenced_ids=[])
    (root / 'manifest.json').write_text(json.dumps(dict(source=str(source), attachments=plan), indent=2), encoding='utf8')
    (root / 'preflight.json').write_text(json.dumps(report, indent=2), encoding='utf8')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
