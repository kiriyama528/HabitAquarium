const CACHE='medaka-v3-elsa-1';
const FILES=['./','./index.html','./style.css','./app.js','./core.js','./aquarium.js','./assets/elsa.png','./assets/aquascape.png','./assets/icon.svg','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(url=>new Request(url,{cache:"reload"})))));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('medaka-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request,{cache:"no-cache"}).catch(()=>caches.match(event.request).then(r=>r||Response.error())));});
