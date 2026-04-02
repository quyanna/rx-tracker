self.addEventListener('push', function (event) {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.ico',
    })
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/')
  )
})
