self.addEventListener('push', function(event) {
  let data = { title: 'MOVIE HUB', body: 'New content available!', url: '/' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: 'https://ui-avatars.com/api/?name=M+H&background=e50914&color=fff',
    badge: 'https://ui-avatars.com/api/?name=M+H&background=e50914&color=fff',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MOVIE HUB', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});