/**
 * Request Cache & Deduplication Layer
 * Prevents duplicate API calls and caches responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class RequestCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from URL and options
   */
  private getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || "GET";
    const body = options?.body ? JSON.stringify(options.body) : "";
    return `${method}:${url}:${body}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  /**
   * Fetch with automatic deduplication and caching
   */
  async fetch<T = any>(
    url: string,
    options?: RequestInit & { skipCache?: boolean; cacheDuration?: number }
  ): Promise<T> {
    const { skipCache = false, cacheDuration, ...fetchOptions } = options || {};
    const cacheKey = this.getCacheKey(url, fetchOptions);

    // Skip cache if requested
    if (skipCache) {
      this.cache.delete(cacheKey);
      this.pendingRequests.delete(cacheKey);
    }

    // Return cached data if valid
    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      console.log(`[Cache HIT] ${url}`);
      return cachedEntry.data;
    }

    // Return pending request if exists (deduplication)
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      console.log(`[Dedup] Waiting for pending request: ${url}`);
      return pendingRequest;
    }

    // Create new request
    console.log(`[Cache MISS] Fetching: ${url}`);
    const requestPromise = fetch(url, fetchOptions)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        // Cache the response
        const duration = cacheDuration || this.CACHE_DURATION;
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });

        // Remove from pending
        this.pendingRequests.delete(cacheKey);

        return data;
      })
      .catch((error) => {
        // Remove from pending on error
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  /**
   * Invalidate cache for specific URL pattern
   */
  invalidate(urlPattern: string | RegExp): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      const url = key.split(":")[1];
      const matches =
        typeof urlPattern === "string"
          ? url.includes(urlPattern)
          : urlPattern.test(url);

      if (matches) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    });

    console.log(`[Cache] Invalidated ${keysToDelete.length} entries`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    console.log("[Cache] Cleared all entries");
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    cacheSize: number;
    pendingRequests: number;
    entries: Array<{ url: string; age: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      url: key.split(":")[1],
      age: Date.now() - entry.timestamp,
    }));

    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries,
    };
  }
}

// Export singleton instance
export const requestCache = new RequestCache();

// Export wrapped fetch function
export const cachedFetch = <T = any>(
  url: string,
  options?: RequestInit & { skipCache?: boolean; cacheDuration?: number }
): Promise<T> => {
  return requestCache.fetch<T>(url, options);
};

// Helper to invalidate cache
export const invalidateCache = (urlPattern: string | RegExp) => {
  requestCache.invalidate(urlPattern);
};

// Helper to clear all cache
export const clearCache = () => {
  requestCache.clear();
};
