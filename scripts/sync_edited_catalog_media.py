"""Preserve the user-edited photos in the private, reproducible catalogue package."""
import hashlib
import json
import shutil
from pathlib import Path


def main():
    edited = Path('wordpress/tools/.imports/edited-images-2026-10-27')
    catalog = Path('wordpress/tools/.imports/sacred-incense-uk')
    manifest = json.loads((edited / 'manifest.json').read_text(encoding='utf8'))
    verification = json.loads((edited / 'verification.json').read_text(encoding='utf8'))
    if verification['errors'] or not verification['non_image_data_unchanged'] or verification['images_checked'] != len(manifest['files']):
        raise ValueError('Verify the WordPress image replacement before updating the package inputs')
    media_path = catalog / 'media.json'
    media = json.loads(media_path.read_text(encoding='utf8'))
    groups = {}
    for row in manifest['files']:
        source = (edited / row['file']).resolve()
        if not source.is_relative_to(edited.resolve()) or hashlib.sha256(source.read_bytes()).hexdigest() != row['sha256']:
            raise ValueError('Invalid source image')
        groups.setdefault(row['item'], []).append(row)
    backup = edited / 'original-cache'
    backup.mkdir(exist_ok=True)
    if not (edited / 'media-before.json').exists():
        shutil.copy2(media_path, edited / 'media-before.json')
    for row in manifest['files']:
        name = Path(row['file']).name
        destination = catalog / 'images' / name
        if destination.exists() and not (backup / name).exists():
            shutil.copy2(destination, backup / name)
        shutil.copy2(edited / row['file'], destination)
        media['files'][name] = {
            **media['files'].get(name, {'source_url': ''}),
            'sha256': row['sha256'],
            'edited_source': 'Editadas.rar',
            'edited_archive_sha256': manifest['source_sha256'],
        }
    for key, rows in groups.items():
        entry = manifest['items'][key]
        if entry['key'].startswith('sacred-incense-uk:unmatched:'):
            item = media['unmatched'][entry['key'].split(':', 2)[2]]
        else:
            item = media['items'][key]
        names = [Path(row['file']).name for row in rows]
        item['image_files'] = list(dict.fromkeys([key + '.jpg'] + item['image_files'] + names))
        for sku, old_files in item.get('forms', {}).items():
            replacements = [Path(row['file']).name for row in rows if row['sku'] == sku]
            if replacements:
                item['forms'][sku] = list(dict.fromkeys(sorted(replacements) + [name for name in old_files if name.startswith(sku + '_')]))
        item['edited_archive_sha256'] = manifest['source_sha256']
    media_path.write_text(json.dumps(media, indent=2), encoding='utf8')
    print(json.dumps({'updated_images': len(manifest['files']), 'updated_products': len(groups)}))


if __name__ == '__main__':
    main()
