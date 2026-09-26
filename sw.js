/* MSFPS Diary service worker — caches the app shell for offline launch.
   Firebase/Google requests always go to the network (their own offline layer handles data). */
const C='msfps-diary-v1';
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
  if(/gstatic\.com|googleapis\.com|firebaseio|cloudfunctions|identitytoolkit|firestore|firebaseinstallations|firebase/.test(u))return; // network for Firebase
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
      if(resp&&resp.status===200&&resp.type==='basic'){const cp=resp.clone();caches.open(C).then(c=>c.put(e.request,cp));}
      return resp;
    }).catch(()=>caches.match('./index.html')))
  );
});
