// Service Worker for Web Push Notifications + Web Share Target

// ─── IndexedDB helpers for share target ──────────────────────────────────────
function openShareDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('wheels-share', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending')
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = reject
  })
}

async function storePendingImage(file) {
  const db = await openShareDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite')
    tx.objectStore('pending').put(file, 'image')
    tx.oncomplete = resolve
    tx.onerror = reject
  })
}

// ─── Share Target: intercept POST to /search ─────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (url.pathname === '/search' && event.request.method === 'POST') {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData()
        const image = formData.get('image')
        if (image) await storePendingImage(image)
      } catch {}
      return Response.redirect('/search?shared=1', 303)
    })())
  }
})

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch (e) {
    data = {
      title: 'בקשה חדשה',
      body: event.data.text(),
      icon: '/icon-192.png',
      badge: '/badge-72.png'
    }
  }

  const bodyText = data.body || 'יש בקשות חדשות ממתינות לאישור'

  const options = {
    body: bodyText + '\n\nלחץ על ההודעה למעבר',
    icon: data.icon || '/favicon.png',
    badge: data.badge || '/favicon.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'equipment-request',
    requireInteraction: false,
    data: {
      url: data.url || '/',
      cityId: data.cityId
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'בקשה חדשה', options)
  )
})

// Notification click - open the target URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlPath = event.notification.data?.url || '/'
  const urlToOpen = new URL(urlPath, self.location.origin).href

  event.waitUntil(
    self.clients.openWindow(urlToOpen)
  )
})
