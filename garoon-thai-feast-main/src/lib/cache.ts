/**
 * Caching utility for frontend data
 * Implements multi-layer caching: Memory cache with TTL + LocalStorage fallback
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

interface CacheConfig {
  ttl?: number; // Default: 5 minutes
  useLocalStorage?: boolean; // Default: true
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private storagePrefix = 'garoon_cache_';

  /**
   * Get cached data by key
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem) {
      if (this.isValid(memoryItem)) {
        return memoryItem.data;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(this.storagePrefix + key);
      if (stored) {
        const item: CacheItem<T> = JSON.parse(stored);
        if (this.isValid(item)) {
          // Restore to memory cache
          this.memoryCache.set(key, item);
          return item.data;
        } else {
          localStorage.removeItem(this.storagePrefix + key);
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }

    return null;
  }

  /**
   * Set cached data by key
   */
  set<T>(key: string, data: T, config: CacheConfig = {}): void {
    const ttl = config.ttl ?? this.defaultTTL;
    const useLocalStorage = config.useLocalStorage ?? true;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Store in memory
    this.memoryCache.set(key, cacheItem);

    // Store in localStorage
    if (useLocalStorage) {
      try {
        localStorage.setItem(
          this.storagePrefix + key,
          JSON.stringify(cacheItem)
        );
      } catch (error) {
        console.warn('Failed to store in localStorage:', error);
      }
    }
  }

  /**
   * Remove cached data by key
   */
  remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(this.storagePrefix + key);
    } catch (error) {
      console.warn('Failed to remove from cache:', error);
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * Get cache keys by pattern
   */
  getKeys(pattern: string | RegExp): string[] {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const keys: string[] = [];

    // Check memory cache
    this.memoryCache.forEach((_, key) => {
      if (regex.test(key)) {
        keys.push(key);
      }
    });

    // Check localStorage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          const cacheKey = key.replace(this.storagePrefix, '');
          if (regex.test(cacheKey) && !keys.includes(cacheKey)) {
            keys.push(cacheKey);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to read localStorage keys:', error);
    }

    return keys;
  }

  /**
   * Invalidate cache by pattern
   */
  invalidate(pattern: string | RegExp): void {
    const keys = this.getKeys(pattern);
    keys.forEach(key => this.remove(key));
  }

  /**
   * Check if cache item is still valid
   */
  private isValid(item: CacheItem<any>): boolean {
    const age = Date.now() - item.timestamp;
    return age < item.ttl;
  }

  /**
   * Get cache size information
   */
  getInfo() {
    return {
      memorySize: this.memoryCache.size,
      storageSize: (() => {
        try {
          return Object.keys(localStorage).filter(k =>
            k.startsWith(this.storagePrefix)
          ).length;
        } catch {
          return 0;
        }
      })(),
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

/**
 * Cache TTL constants (milliseconds)
 */
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes (default)
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  MENU_ITEMS: 'menu_items',
  MENU_CATEGORIES: 'menu_categories',
  ARTICLES: 'articles',
  ARTICLES_PUBLISHED: 'articles_published',
  CONTACT_INFO: 'contact_info',
  MEMBER_SUBSCRIPTIONS: 'member_subscriptions',
  PROFILES: 'profiles',
  TESTIMONIALS: 'testimonials',
  STATS: 'stats',
} as const;
