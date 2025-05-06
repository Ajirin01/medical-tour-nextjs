self.addEventListener('push', event => {
    let data = {};
    
    try {
      // Ensure that event.data is valid JSON
      console.log(event)
      data = event.data ? event.data.json() : {};
    } catch (error) {
      console.error('Invalid push message data', error);
      data = {}; // Set default value if parsing fails
    }
    
    const title = data.title || 'You have a new notification';
    const body = data.body || 'Click to view more details';
    const icon = data.icon || '/images/logo/log.png'; // Optional icon
    const url = data.url || '/'; // Optional URL to navigate when clicked
  
    // Default notification options
    const options = {
      body: body,
      icon: icon,
      badge: '/images/logo/log.png', // Optional badge
      data: {
        url: url, // You can store the URL to navigate to when clicked
      },
    };
  
    // Display the notification with default sound
    event.waitUntil(self.registration.showNotification(title, options));
  });
  
  // When the user clicks the notification
  self.addEventListener('notificationclick', event => {
    event.notification.close(); // Close the notification when clicked
  
    const url = event.notification.data.url || '/'; // Fallback to homepage if URL is not set
  
    // Open the URL in the browser
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Check if there's an open window for the same URL
        const client = clientList.find(client => client.url === url && client.focus);
        
        if (client) {
          client.focus();
        } else {
          // If no open window, open a new one
          clients.openWindow(url);
        }
      })
    );
  });
  