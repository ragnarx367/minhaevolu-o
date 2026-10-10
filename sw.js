/* Minha Evolução: funciona sem internet depois do primeiro acesso */
const VERSAO='me-v1';
const BASE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSAO).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // rede primeiro (pega atualizações); sem rede, usa o que está guardado
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSAO).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
  }else if(u.hostname.indexOf('fonts.g')===0){
    // fontes: usa a guardada e atualiza em segundo plano
    e.respondWith(caches.open('me-fontes').then(c=>c.match(r).then(m=>{const f=fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>m);return m||f})));
  }
});
