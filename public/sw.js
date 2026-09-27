// Service Worker for Web Push Notifications
// (Web Share Target for the OCR-from-photo flow is handled server-side by
// /api/share-target — not here — since depending on this SW still being alive
// when the OS share sheet fires proved unreliable; see .wolf/buglog.json.)

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
