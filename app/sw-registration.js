if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed with error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error instanceof TypeError) {
          console.error('Network error - check if sw.js is accessible');
        }
      });
  });
}
