"""Read current public USD prices; never calculate an exchange rate."""
import json, re, hashlib
from pathlib import Path
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from download_product_import_media import fetch
from download_product_import_media import SafeRedirect, safe_url
from urllib.request import build_opener, HTTPCookieProcessor
from urllib.parse import urlencode
from http.cookiejar import CookieJar
import threading

ROOT = Path('wordpress/tools/.imports/sacred-incense-uk')
SESSION = threading.local()
REFRESH = False

def quantity_key(value):
    return re.sub(r'\bpcs$', 'pc', ' '.join(value.split()))

def usd_page(url):
    if not hasattr(SESSION,'opener'):
        SESSION.opener=build_opener(SafeRedirect(),HTTPCookieProcessor(CookieJar()))
        SESSION.opener.open('https://katukina.com/',timeout=25).read()
        SESSION.opener.open('https://katukina.com/app/lib/lojax.public.php',urlencode({'action':'set_currency','data[0]':'USD'}).encode(),timeout=25).read()
    with SESSION.opener.open(safe_url(url),timeout=25) as response:
        payload=response.read(3*1024*1024+1)
        if len(payload)>3*1024*1024: raise ValueError('HTML too large')
        return payload.decode(response.headers.get_content_charset() or 'utf8')

class Prices(HTMLParser):
    def __init__(self):
        super().__init__(); self.depth=0; self.grid=None; self.row=None; self.capture=None; self.rows=[]; self.usd=False
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); classes=a.get('class','').split()
        if tag=='option' and a.get('value')=='USD' and 'selected' in a: self.usd=True
        if tag=='div':
            self.depth+=1
            if a.get('id','').startswith('grid-form_') and a.get('data-ioid'):
                self.grid=(self.depth,a.get('data-iid'),a['data-ioid'])
        if self.grid and tag=='li' and 'form-grid-weight' in classes:
            self.row={'item_id':self.grid[1],'form_id':self.grid[2],'quantity':'','display_price':'','no_price':a.get('data-noprice'),'inquire':a.get('data-inquire')}
        if self.row and tag=='span':
            if 'form-grid-weight-quantity' in classes: self.capture='quantity'
            if 'form-grid-weight-price' in classes: self.capture='display_price'
    def handle_data(self, data):
        if self.row and self.capture: self.row[self.capture]+=data
    def handle_endtag(self, tag):
        if tag=='span': self.capture=None
        if (tag=='li' or tag.startswith('label<')) and self.row:
            for key in ('quantity','display_price'): self.row[key]=' '.join(self.row[key].split())
            self.rows.append(self.row); self.row=None; self.capture=None
        if tag=='div':
            if self.grid and self.depth==self.grid[0]: self.grid=None
            self.depth-=1

def collect(item):
    rows=[]; errors=[]; sources=[]
    cache=ROOT/'usd-pages'; cache.mkdir(exist_ok=True)
    for url in item['urls']:
        path=cache/(hashlib.sha256(url.encode()).hexdigest()+'.html')
        try:
            if REFRESH:
                html=usd_page(url);path.write_text(html,encoding='utf8')
            elif path.exists(): html=path.read_text(encoding='utf8')
            else:
                payload,final,charset=fetch(url,image=False,timeout=25,retries=1)
                html=payload.decode(charset); path.write_text(html,encoding='utf8')
            parser=Prices(); parser.feed(html)
            if not parser.usd:
                html=usd_page(url);parser=Prices();parser.feed(html)
                if parser.usd: path.write_text(html,encoding='utf8')
            if not parser.usd: raise ValueError('USD selection not verified')
            rows.extend(dict(r,source_url=url) for r in parser.rows); sources.append(url)
            wanted={str(int(f['key'])) for f in item['forms']}
            if wanted <= {str(int(r['form_id'])) for r in rows if r['item_id'] and int(r['item_id'])==int(item['key'])}: break
        except Exception as e: errors.append(str(e))
    found=[]; missing=[]
    for form in item['forms']:
        matches=[r for r in rows if r['item_id'] and int(r['item_id'])==int(item['key']) and int(r['form_id'])==int(form['key']) and quantity_key(r['quantity'])==quantity_key(form['sale_quantity'])]
        prices=set()
        for r in matches:
            match=re.fullmatch(r'\$\s*([0-9,]+\.\d{2})',r['display_price'])
            if match and r['no_price']!='1': prices.add(match[1].replace(',',''))
        if len(prices)==1:
            found.append({'sku':form['sku'],'price':next(iter(prices)),'quantity':form['sale_quantity'],'source_quantity':matches[0]['quantity'],'source_url':matches[0]['source_url'],'display_price':matches[0]['display_price']})
        else: missing.append({'sku':form['sku'],'quantity':form['sale_quantity'],'matches':matches,'errors':errors,'urls':item['urls']})
    return found,missing

if __name__=='__main__':
    import argparse
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--refresh',action='store_true',help='Fetch new public USD prices instead of reusing the captured pages.')
    REFRESH=cli.parse_args().refresh
    manifest=json.loads((ROOT/'manifest.json').read_text(encoding='utf8'))
    result={'currency':'USD','captured_at':datetime.now(timezone.utc).isoformat(),'prices':[],'missing':[]}
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures=[pool.submit(collect,i) for i in manifest['items']]
        for n,future in enumerate(as_completed(futures),1):
            found,missing=future.result();result['prices']+=found;result['missing']+=missing
            if n%25==0: print(json.dumps({'pages':n,'prices':len(result['prices']),'missing':len(result['missing'])}),flush=True)
    result['prices'].sort(key=lambda r:r['sku'])
    (ROOT/'usd-prices.json').write_text(json.dumps(result,indent=2),encoding='utf8')
    print(json.dumps({'prices':len(result['prices']),'missing':len(result['missing'])}))
