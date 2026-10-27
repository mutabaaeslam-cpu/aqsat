// يخلي التطبيق يفتح أوفلاين
const CACHE = "aqsat-v4";
const CORE = ["./", "./index.html", "./manifest.json", "./icon.svg", "./icon-192.png", "./icon-512.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.hostname.endsWith("supabase.co")) return;
  if (u.origin === location.origin) {
    // الصفحة: من النت الأول، ولو مفيش نت من الكاش
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request, {ignoreSearch:true}).then(r => r || caches.match("./index.html"))));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return res; })));
  }
});

// إشعارات الأقساط
self.addEventListener("push", e => {
  let m = {title:"أقساطي", body:"عندك قسط قرب ميعاده"};
  try { m = Object.assign(m, e.data.json()); } catch(_) {}
  e.waitUntil(self.registration.showNotification(m.title, {body:m.body, tag:m.tag || "aqsat", renotify:true, icon:"icon-192.png", badge:"icon-192.png", dir:"rtl", lang:"ar", data:{url:"./"}}));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window", includeUncontrolled:true}).then(cs => {
    for (const c of cs) if ("focus" in c) return c.focus();
    return self.clients.openWindow(e.notification.data?.url || "./");
  }));
});
