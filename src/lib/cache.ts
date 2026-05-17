type CacheEntry = {
  value: any;
  expires: number;
};

const cache = new Map<string, CacheEntry>();

export function getCached(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached(key: string, value: any, ttlSeconds = 300) {
  cache.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

export function clearCache() {
  cache.clear();
}

export default { getCached, setCached, clearCache };
