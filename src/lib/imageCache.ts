class ImageCacheManager {
  constructor() {
    this.dbName = 'ImageCacheDB';
    this.storeName = 'images';
    this.version = 1;
    this.maxCacheSize = 100 * 1024 * 1024; // 100MB
    this.maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.dbPromise = null;
  }

  async openDB() {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        this.dbPromise = null; // Reset on error
        reject(request.error);
      };

      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  async getCachedImage(url) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(url);

        request.onsuccess = () => {
          const result = request.result;
          if (result && this.isImageValid(result)) {
            resolve(result.blob);
          } else {
            // If invalid, delete it
            if (result) {
              this.deleteImage(url).catch(console.warn);
            }
            resolve(null);
          }
        };

        request.onerror = () => {
          console.warn('Error getting cached image:', request.error);
          resolve(null); // Don't reject, just return null
        };

        // Handle transaction errors
        transaction.onerror = () => {
          console.warn('Transaction error getting cached image:', transaction.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.warn('Error getting cached image:', error);
      return null;
    }
  }

  async cacheImage(url, blob) {
    try {
      // Don't cache if blob is too large (> 10MB)
      if (blob.size > 10 * 1024 * 1024) {
        console.warn('Image too large to cache:', url);
        return;
      }

      const db = await this.openDB();

      // Use a fresh transaction for each operation
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const imageData = {
        url,
        blob,
        timestamp: Date.now(),
        size: blob.size
      };

      return new Promise((resolve, reject) => {
        const request = store.put(imageData);

        request.onsuccess = () => {
          resolve();
          // Cleanup in background
          this.cleanupIfNeeded().catch(console.warn);
        };

        request.onerror = () => {
          console.warn('Error caching image:', request.error);
          resolve(); // Don't reject, just resolve
        };

        transaction.onerror = () => {
          console.warn('Transaction error caching image:', transaction.error);
          resolve();
        };

        transaction.onabort = () => {
          console.warn('Transaction aborted caching image');
          resolve();
        };
      });
    } catch (error) {
      console.warn('Error caching image:', error);
    }
  }

  async deleteImage(url) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve) => {
        const request = store.delete(url);
        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.warn('Error deleting cached image:', request.error);
          resolve();
        };
      });
    } catch (error) {
      console.warn('Error deleting cached image:', error);
    }
  }

  isImageValid(imageData) {
    const now = Date.now();
    return (now - imageData.timestamp) < this.maxCacheAge;
  }

  async cleanupIfNeeded() {
    try {
      const db = await this.openDB();

      // Use separate transactions for read and write operations
      const readTransaction = db.transaction([this.storeName], 'readonly');
      const readStore = readTransaction.objectStore(this.storeName);

      // Get all cached images
      const allImages = await new Promise((resolve, reject) => {
        const request = readStore.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => {
          console.warn('Error reading cache for cleanup:', request.error);
          resolve([]);
        };
      });

      if (allImages.length === 0) return;

      // Calculate total size and find expired images
      const totalSize = allImages.reduce((sum, img) => sum + (img.size || 0), 0);
      const expiredImages = allImages.filter(img => !this.isImageValid(img));

      const imagesToDelete = [];

      // Add expired images to deletion list
      imagesToDelete.push(...expiredImages);

      // If still over size limit, add oldest images
      if (totalSize > this.maxCacheSize) {
        const validImages = allImages.filter(img => this.isImageValid(img));
        validImages.sort((a, b) => a.timestamp - b.timestamp);

        let currentSize = totalSize;
        for (const image of validImages) {
          if (currentSize <= this.maxCacheSize * 0.8) break;
          if (!imagesToDelete.includes(image)) {
            imagesToDelete.push(image);
            currentSize -= (image.size || 0);
          }
        }
      }

      // Delete images in batches
      if (imagesToDelete.length > 0) {
        const batchSize = 10;
        for (let i = 0; i < imagesToDelete.length; i += batchSize) {
          const batch = imagesToDelete.slice(i, i + batchSize);
          await this.deleteBatch(batch);
        }
      }
    } catch (error) {
      console.warn('Error during cache cleanup:', error);
    }
  }

  async deleteBatch(images) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve) => {
        let completed = 0;
        const total = images.length;

        if (total === 0) {
          resolve();
          return;
        }

        images.forEach(image => {
          const request = store.delete(image.url);
          request.onsuccess = request.onerror = () => {
            completed++;
            if (completed === total) {
              resolve();
            }
          };
        });

        // Fallback timeout
        setTimeout(() => {
          if (completed < total) {
            console.warn('Batch delete timeout, continuing...');
            resolve();
          }
        }, 5000);
      });
    } catch (error) {
      console.warn('Error deleting batch:', error);
    }
  }

  async clearCache() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.warn('Error clearing cache:', request.error);
          resolve(); // Don't reject
        };
      });
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }

  async getCacheStats() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const allImages = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => {
          console.warn('Error getting cache stats:', request.error);
          resolve([]);
        };
      });

      const totalSize = allImages.reduce((sum, img) => sum + (img.size || 0), 0);
      const validImages = allImages.filter(img => this.isImageValid(img));

      return {
        totalImages: allImages.length,
        validImages: validImages.length,
        totalSize: totalSize,
        formattedSize: this.formatBytes(totalSize)
      };
    } catch (error) {
      console.warn('Error getting cache stats:', error);
      return {
        totalImages: 0,
        validImages: 0,
        totalSize: 0,
        formattedSize: '0 Bytes'
      };
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const imageCacheManager = new ImageCacheManager();