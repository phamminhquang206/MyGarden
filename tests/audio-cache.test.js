import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
test('offline MP3 cache supports full playback, byte ranges and invalid ranges',async()=>{
 const events={},data=Uint8Array.from({length:100},(_,i)=>i);
 const self={location:{origin:'https://garden.test'},addEventListener:(name,fn)=>events[name]=fn};
 vm.runInNewContext(await readFile(new URL('../sw.js',import.meta.url),'utf8'),{self,caches:{match:async()=>new Response(data,{headers:{'Content-Type':'audio/mpeg'}})},Response,URL,fetch:()=>{throw Error('Network must not be used');}});
 async function request(range){let result;events.fetch({request:{method:'GET',url:'https://garden.test/sound/focus.mp3',headers:new Headers(range?{Range:range}:{})},respondWith:p=>result=p});return result;}
 const full=await request();assert.equal(full.status,200);assert.equal((await full.arrayBuffer()).byteLength,100);
 for(const [range,start,end] of [['bytes=10-19',10,19],['bytes=90-',90,99],['bytes=-5',95,99]]){
  const response=await request(range);assert.equal(response.status,206);assert.equal(response.headers.get('Content-Range'),'bytes '+start+'-'+end+'/100');assert.deepEqual(new Uint8Array(await response.arrayBuffer()),data.slice(start,end+1));
 }
 assert.equal((await request('bytes=100-')).status,416);
});
