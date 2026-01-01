const CACHE_PREFIX = "quizzera_cache_";
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const cache = {
  set: <T>(key: string, data: T): void => {
    try {
      const item: CacheItem<T> = { data, timestamp: Date.now() };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
      console.warn("Cache set failed:", e);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;

      const parsed: CacheItem<T> = JSON.parse(item);
      if (Date.now() - parsed.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  },

  clear: (key?: string): void => {
    if (key) {
      localStorage.removeItem(CACHE_PREFIX + key);
    } else {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    }
  },
};
