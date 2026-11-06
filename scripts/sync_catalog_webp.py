"""Refresh private catalogue package inputs only after WordPress verification."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import re

from prepare_catalog_webp import image_index, resolve_primary


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--batch', default='catalog-webp-2026-11-06')
    args = cli.parse_args()
    if not re.fullmatch(r'catalog-webp-[a-z0-9-]+', args.batch):
        raise ValueError('Invalid batch name.')
    batch = Path('wordpress/tools/.imports') / args.batch
    verification = json.loads((batch / 'verification.json').read_text())
    plan = json.loads((batch / 'manifest.json').read_text())
    if verification['errors'] or not verification['non_image_data_unchanged'] or verification['checked'] != len(plan['attachments']):
        raise ValueError('WordPress verification must pass before syncing package inputs.')
    catalog = Path('wordpress/tools/.imports/sacred-incense-uk')
    media_path = catalog / 'media.json'
    backup = batch / 'media-before.json'
    if not backup.exists():
        shutil.copy2(media_path, backup)
    media = json.loads(backup.read_text())
    source = Path(plan['source'])
    index, files, invalid = image_index(source)
    resolve_primary(index, files, media, source)
    if invalid:
        raise ValueError('Invalid source image dimensions/format.')
    replacements = {}
    new_files = {}
    for name, info in media['files'].items():
        choices = index.get(Path(name).stem, {})
        if len(choices) != 1:
            raise ValueError('Missing or ambiguous cache source: ' + name)
        digest, original = next(iter(choices.items()))
        destination = catalog / 'images' / (Path(name).stem + '.webp')
        if destination.exists() and hashlib.sha256(destination.read_bytes()).hexdigest() != digest:
            raise ValueError('Refusing to overwrite a different existing WebP: ' + destination.name)
        if not destination.exists():
            shutil.copy2(original, destination)
        if hashlib.sha256(destination.read_bytes()).hexdigest() != digest:
            raise ValueError('Cache copy hash mismatch.')
        replacements[name] = destination.name
        new_files[destination.name] = {**info, 'sha256': digest, 'edited_source': 'Fotos/Editadas',
                                      'edited_relative_path': str(original.relative_to(source)),
                                      'webp_batch': args.batch, 'width': 900, 'height': 900, 'mime': 'image/webp'}
    media['files'] = new_files
    for group in ('items', 'unmatched'):
        for item in media[group].values():
            item['image_files'] = list(dict.fromkeys(replacements[name] for name in item['image_files']))
            for sku, names in item.get('forms', {}).items():
                item['forms'][sku] = list(dict.fromkeys(replacements[name] for name in names))
    temporary = media_path.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(media, indent=2), encoding='utf8')
    temporary.replace(media_path)
    report = {'images': len(new_files), 'old_cache_files_retained': True, 'source': str(source)}
    (batch / 'cache-sync.json').write_text(json.dumps(report, indent=2), encoding='utf8')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
