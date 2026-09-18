const CACHE='mygarden-v13';
const ASSETS=['./','./index.html','./styles.css?v=13','./scripts.js?v=11','./backup.js?v=11','./duration-dial.js?v=11','./garden-core.js?v=11','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./sound/liecio-calming-rain.mp3','./sound/alex_jauk-calm-zen-river-flowing-228223.mp3','./sound/focus.mp3'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).then(()=>self.skipWaiting()))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mygarden-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));return;}
 e.respondWith((async()=>{
  const cached=await caches.match(e.request);if(!cached)return fetch(e.request);
  const range=e.request.headers.get('range');if(!range)return cached;
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match)return cached;
  const blob=await cached.blob(),size=blob.size;
  const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
  const end=match[1]?(match[2]?Math.min(Number(match[2]),size-1):size-1):size-1;
  if(start>=size||start>end)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
  return new Response(blob.slice(start,end+1),{status:206,headers:{'Content-Type':cached.headers.get('Content-Type')||'audio/mpeg','Accept-Ranges':'bytes','Content-Length':String(end-start+1),'Content-Range':'bytes '+start+'-'+end+'/'+size}});
 })());
});
