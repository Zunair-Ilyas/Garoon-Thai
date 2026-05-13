/**
 * Image Service - Lazy loading and progressive loading optimization
 */

export const imageService = {
  /**
   * Preload a single image
   */
  preloadImage: async (src: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(''); // Return empty on error
      img.src = src;
    });
  },

  /**
   * Preload multiple images in parallel
   */
  preloadImages: async (imageUrls: string[]): Promise<string[]> => {
    return Promise.all(
      imageUrls.map(url => imageService.preloadImage(url))
    );
  },

  /**
   * Preload images with rate limiting to avoid blocking
   */
  preloadImagesRateLimited: async (
    imageUrls: string[],
    batchSize: number = 3,
    delayMs: number = 100
  ): Promise<void> => {
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);
      await imageService.preloadImages(batch);
      if (i + batchSize < imageUrls.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
};

/**
 * Progressive menu loading - Load items in batches for faster initial render
 */
export const progressiveMenuLoader = {
  /**
   * Split items into visible and background batches
   * First batch is shown immediately, rest loaded in background
   */
  splitItemsForProgressive: (
    items: any[],
    initialBatchSize: number = Math.ceil(items.length / 4) // Load 1/4 initially
  ) => {
    return {
      initial: items.slice(0, initialBatchSize),
      remaining: items.slice(initialBatchSize),
      initialCount: initialBatchSize,
      remainingCount: items.length - initialBatchSize
    };
  },

  /**
   * Load remaining items in background
   */
  loadRemaining: async (items: any[], delayMs: number = 500): Promise<any[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(items);
      }, delayMs);
    });
  }
};


