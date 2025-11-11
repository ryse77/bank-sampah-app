/**
 * Utility functions untuk mengelola browser cache
 */

/**
 * Clear semua browser cache kecuali auth data
 */
export async function clearAllCache() {
  try {
    // 1. Clear service worker cache (PWA)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          // Jangan hapus auth cache
          if (!cacheName.includes('auth')) {
            console.log('Clearing cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }

    // 2. Clear sessionStorage kecuali auth
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const keysToPreserve = ['auth', 'token', 'user'];
      const allKeys = Object.keys(sessionStorage);

      allKeys.forEach(key => {
        if (!keysToPreserve.some(preserve => key.includes(preserve))) {
          sessionStorage.removeItem(key);
        }
      });
    }

    console.log('✅ Browser cache cleared successfully');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Force reload with cache bypass
 */
export function hardReload() {
  if (typeof window !== 'undefined') {
    // Force reload tanpa cache
    window.location.reload();
  }
}

/**
 * Clear all fetch cache dan reload
 */
export async function clearAndReload() {
  await clearAllCache();
  hardReload();
}
