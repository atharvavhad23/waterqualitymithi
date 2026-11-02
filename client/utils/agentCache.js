// Simple in-memory cache with TTL, no external deps
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes - longer cache
const MAX_ENTRIES = 200; // More cache entries

const store = new Map();

function makeKey(prompt) {
  try {
    return btoa(unescape(encodeURIComponent(prompt))).slice(0, 60);
  } catch {
    return String(prompt).slice(0, 60);
  }
}

export function getCachedResponse(prompt) {
  const key = makeKey(prompt);
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCachedResponse(prompt, response) {
  const key = makeKey(prompt);
  // evict if too large
  if (store.size >= MAX_ENTRIES) {
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }
  store.set(key, { value: response, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function clearAgentCache() {
  store.clear();
}
