/* MSFPS Diary service worker.
   Network-first for the app page (so new versions always load when online),
   cache fallback for offline. Firebase requests always go to the network. */
const C='msfps-diary-v3';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest']).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=e.request.url;
  if(/gstatic\.com|googleapis\.com|firebaseio|cloudfunctions|identitytoolkit|firestore|firebaseinstallations|firebase/.test(u))return; // Firebase → network
  const isPage = e.request.mode==='navigate' || /\/(index\.html)?(\?.*)?$/.test(u);
  if(isPage){
    // network-first so the latest app always loads online
    e.respondWith(fetch(e.request).then(resp=>{const cp=resp.clone();caches.open(C).then(c=>c.put(e.request,cp));return resp;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
  }else{
    // other assets: cache-first
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(resp&&resp.status===200&&resp.type==='basic'){const cp=resp.clone();caches.open(C).then(c=>c.put(e.request,cp));}return resp;})));
  }
});
