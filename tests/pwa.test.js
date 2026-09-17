import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('all offline assets exist and manifest icons have correct PNG dimensions',async()=>{
 const root=new URL('../',import.meta.url),sw=await readFile(new URL('sw.js',root),'utf8');
 const assets=sw.match(/const ASSETS=\[(.*?)\]/)[1].match(/'([^']+)'/g).map(s=>s.slice(1,-1));
 for(const asset of assets){const clean=asset.split('?')[0];assert.ok((await readFile(new URL(clean==='./'?'index.html':clean,root))).length>0,asset);}
 const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',root),'utf8'));
 assert.equal(manifest.display,'standalone');assert.ok(manifest.icons.some(i=>i.purpose==='maskable'));
 for(const icon of manifest.icons){const png=await readFile(new URL(icon.src,root));assert.equal(png.subarray(1,4).toString(),'PNG');const size=Number(icon.sizes.split('x')[0]);assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);}
 const html=await readFile(new URL('index.html',root),'utf8');assert.ok(assets.includes(html.match(/href="(\.\/styles.css[^"]*)"/)[1]));
});
