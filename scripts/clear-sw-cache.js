// Script to clear service worker cache
// Run this in the browser console to clear all caches and reset the service worker

async function clearServiceWorkerCache() {
  console.log('🧹 Starting cache cleanup...');

  // Unregister all service workers
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (let registration of registrations) {
    const success = await registration.unregister();
    console.log(`✅ Service worker unregistered: ${success}`);
  }

  // Delete all caches
  const cacheNames = await caches.keys();
  console.log(`📦 Found ${cacheNames.length} caches:`, cacheNames);

  for (const cacheName of cacheNames) {
    const deleted = await caches.delete(cacheName);
    console.log(`🗑️ Cache deleted: ${cacheName} - ${deleted}`);
  }

  console.log('✨ All caches cleared!');
  console.log('🔄 Reloading page...');

  // Reload the page
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
}

// Instructions for use
console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   SERVICE WORKER CACHE CLEANER                 ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  To clear all service worker caches, run:                     ║
║                                                                ║
║  > clearServiceWorkerCache()                                  ║
║                                                                ║
║  This will:                                                   ║
║  1. Unregister all service workers                           ║
║  2. Delete all cached data                                   ║
║  3. Reload the page                                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

// Auto-export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = clearServiceWorkerCache;
}