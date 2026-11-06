"""Build a portable photos-only updater, without source machine attachment IDs."""
import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from PIL import Image


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--output', type=Path, default=Path('wordpress/backups/katukina-atualizacao-fotos-webp-2026-11-06.zip'))
    args = cli.parse_args()
    catalog = Path('wordpress/tools/.imports/sacred-incense-uk')
    batch = Path('wordpress/tools/.imports/catalog-webp-2026-11-06')
    verified = json.loads((batch / 'verification.json').read_text())
    if verified['errors'] or not verified['non_image_data_unchanged']:
        raise ValueError('Verify source WordPress image update first.')
    media = json.loads((catalog / 'media.json').read_text())
    previous = json.loads((batch / 'media-before.json').read_text())
    applied = json.loads((batch / 'manifest.json').read_text())
    legacy = {}
    for name, row in previous['files'].items():
        legacy.setdefault(Path(name).stem, set()).add(row['sha256'])
    for row in applied['attachments']:
        legacy.setdefault(Path(row['name']).stem, set()).add(row['old_sha256'])
    transfer_batch = 'catalog-webp-transfer-2026-11-06'
    engine = Path('wordpress/tools/update-catalog-webp.php').read_text(encoding='utf8')
    old_root = "$root = __DIR__ . '/.imports/' . $batch;"
    if engine.count(old_root) != 1:
        raise ValueError('Unexpected engine layout.')
    engine = engine.replace(old_root, '$root = __DIR__;')
    backup = Path('wordpress/scripts/backup-local.mjs').read_text(encoding='utf8')
    backup = backup.replace("'./local-runtime.mjs'", f"'./{transfer_batch}-runtime.mjs'")
    payload = {
        'instalar-fotos.mjs': Path('wordpress/scripts/install-photo-update.mjs').read_bytes(),
        'photo-update-plan.mjs': Path('wordpress/scripts/photo-update-plan.mjs').read_bytes(),
        'engine/update-media.php': engine.encode('utf8'),
        'engine/runtime.mjs': Path('wordpress/scripts/local-runtime.mjs').read_bytes(),
        'engine/backup.mjs': backup.encode('utf8'),
        'LEIA-ME.txt': Path('docs/katukina/templates/PHOTO-UPDATE-README.txt').read_bytes(),
    }
    photos = []
    for name, info in sorted(media['files'].items()):
        if Path(name).name != name or '\\' in name or Path(name).suffix != '.webp':
            raise ValueError('Invalid image filename.')
        path = catalog / 'images' / name
        data = path.read_bytes()
        if sha(data) != info['sha256']:
            raise ValueError('Image hash mismatch: ' + name)
        with Image.open(path) as image:
            if image.format != 'WEBP' or image.size != (900, 900):
                raise ValueError('Invalid image format or size: ' + name)
            image.verify()
        photos.append({'name': name, 'file': 'images/' + name, 'sha256': info['sha256'],
                       'legacy_sha256': sorted(legacy.get(Path(name).stem, set()))})
    payload['photos.json'] = json.dumps({'format_version': 1, 'batch': transfer_batch, 'photos': photos}, indent=2).encode('utf8')
    hashes = {name: sha(data) for name, data in payload.items()}
    hashes.update({row['file']: row['sha256'] for row in photos})
    payload['integridade.json'] = json.dumps({'algorithm': 'sha256', 'files': hashes}, indent=2).encode('utf8')
    prefix = 'katukina-atualizacao-fotos-webp-2026-11-06/'
    args.output.parent.mkdir(parents=True, exist_ok=True)
    if args.output.exists():
        raise ValueError('Output already exists; preserve it or choose a new output path.')
    temporary = args.output.with_suffix('.zip.tmp')
    with ZipFile(temporary, 'w', ZIP_DEFLATED, compresslevel=1) as archive:
        for name, data in payload.items():
            archive.writestr(prefix + name, data)
        for photo in photos:
            archive.write(catalog / photo['file'], prefix + photo['file'])
    with ZipFile(temporary) as archive:
        if archive.testzip() is not None:
            raise ValueError('Corrupt ZIP.')
        for name, expected in hashes.items():
            if sha(archive.read(prefix + name)) != expected:
                raise ValueError('ZIP entry hash mismatch.')
        count = len(archive.namelist())
    temporary.replace(args.output)
    receipt = {'file': args.output.name, 'photos': len(photos), 'files': count, 'bytes': args.output.stat().st_size,
               'sha256': sha(args.output.read_bytes()), 'purpose': 'photos-only local update; no credentials, SQL or sender attachment IDs'}
    args.output.with_suffix('.zip.json').write_text(json.dumps(receipt, indent=2), encoding='utf8')
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
