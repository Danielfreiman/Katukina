"""Package catalogue import inputs for private transfer, without accounts or orders."""
import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--output',type=Path,default=Path('wordpress/backups/katukina-catalog.zip'))
    args=cli.parse_args()
    root=Path('wordpress/tools/.imports/sacred-incense-uk').resolve()
    names=['manifest.json','media.json','usd-prices.json']
    media=json.loads((root/'media.json').read_text(encoding='utf8'))
    prices=json.loads((root/'usd-prices.json').read_text(encoding='utf8'))
    if prices['missing'] or len(prices['prices'])!=908: raise ValueError('Incomplete USD snapshot')
    for name,info in media['files'].items():
        if Path(name).name!=name or '/' in name or '\\' in name: raise ValueError('Invalid image path')
        path=root/'images'/name
        if hashlib.sha256(path.read_bytes()).hexdigest()!=info['sha256']: raise ValueError('Image hash mismatch: '+name)
        names.append('images/'+name)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    with ZipFile(args.output,'w',ZIP_DEFLATED,compresslevel=1) as archive:
        for name in names: archive.write(root/name,name)
    with ZipFile(args.output) as archive:
        if archive.testzip() is not None: raise ValueError('Archive verification failed')
    report={'file':str(args.output.resolve()),'files':len(names),'bytes':args.output.stat().st_size,'sha256':hashlib.sha256(args.output.read_bytes()).hexdigest()}
    args.output.with_suffix('.zip.json').write_text(json.dumps(report,indent=2),encoding='utf8')
    print(json.dumps(report))

if __name__=='__main__': main()
