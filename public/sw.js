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

// ─── TEMP DIAGNOSTIC (bug-457 follow-up) ──────────────────────────────────────
// Question: does the browser actually have real file bytes for a share_target
// POST *before* any network transmission, or is the file already missing at the
// source (Android intent -> Chrome), independent of our server?
// This reads the file locally (in-process, no network) then forwards the
// UNMODIFIED original request to the real network exactly as it already works
// today, and just tags the resulting redirect with sw_diag=found_<bytes>|empty
// so search/page.tsx can show what was seen. Doesn't change real behavior.
// Remove this whole block once the investigation concludes.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (url.pathname === '/api/share-target' && event.request.method === 'POST') {
    event.respondWith((async () => {
      let diag = 'sw_error'
      try {
        const probe = event.request.clone()
        const formData = await probe.formData()
        let file = formData.get('image')
        if (!(file instanceof File) || file.size === 0) {
          for (const v of formData.values()) {
            if (v instanceof File && v.size > 0) { file = v; break }
          }
        }
        diag = (file instanceof File && file.size > 0) ? `found_${file.size}` : 'empty'
      } catch (err) {
        diag = 'sw_error'
      }

      let response
      try {
        response = await fetch(event.request)
      } catch (err) {
        return Response.redirect('/search?share=1&ocr_error=1&sw_diag=' + diag, 303)
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (location) {
          const redirectUrl = new URL(location, self.location.origin)
          redirectUrl.searchParams.set('sw_diag', diag)
          return Response.redirect(redirectUrl.toString(), 303)
        }
      }
      return response
    })())
  }
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
