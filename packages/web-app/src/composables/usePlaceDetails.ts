import { shallowRef, ref } from 'vue'

export interface UNESCOHeritageItem {
  id?: string
  nameZh: string
  nameEn: string
  category: 'Cultural' | 'Natural' | 'Mixed'
}

export interface PlaceDetailInfo {
  name?: string
  nameEn?: string
  country?: string
  countryCode?: string
  summary?: string
  attractions?: string[]
  heritage?: (string | UNESCOHeritageItem)[]
  experiences?: string[]
  scenic5A?: string[]
  cuisines?: string[]
}

const CACHE_KEY = 'voyager_province_details_v2.3'
const DETAILS_URL = '/geo/province-details.json?v=2.3'
const DB_NAME = 'voyager_geo_cache'
const STORE_NAME = 'keyval'

// Using shallowRef to avoid deep reactive proxy overhead on ~5000 records
export const detailsCache = shallowRef<Record<string, PlaceDetailInfo> | null>(null)
export const loadingDetails = ref(false)
export const detailsError = ref<string | null>(null)

let loadPromise: Promise<Record<string, PlaceDetailInfo>> | null = null

// Simple promise-based IndexedDB get/set helper
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'))
    }
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getFromIDB(key: string): Promise<any> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function saveToIDB(key: string, val: any): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put(val, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
  } catch {
    // Ignore IDB write failures (e.g. private browsing quota)
  }
}

async function fetchWithRetry(url: string, retries = 3): Promise<Record<string, PlaceDetailInfo>> {
  let lastError: any = null
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url)
      if (!resp.ok) {
        throw new Error(`HTTP error ${resp.status}`)
      }
      return await resp.json()
    } catch (err) {
      lastError = err
      console.warn(`[usePlaceDetails] Fetch attempt ${i + 1} failed:`, err)
      if (i < retries - 1) {
        // Exponential backoff: 800ms, 1800ms, etc.
        await new Promise(r => setTimeout(r, 800 * Math.pow(2, i)))
      }
    }
  }
  throw lastError
}

export async function loadPlaceDetails(forceRefresh = false): Promise<Record<string, PlaceDetailInfo>> {
  if (detailsCache.value && !forceRefresh) {
    return detailsCache.value
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = (async () => {
    loadingDetails.value = true
    detailsError.value = null

    // 1. Try loading from IndexedDB first for instant rendering
    if (!forceRefresh) {
      try {
        const cached = await getFromIDB(CACHE_KEY)
        if (cached && typeof cached === 'object' && Object.keys(cached).length > 0) {
          detailsCache.value = cached
          loadingDetails.value = false
          loadPromise = null
          return cached
        }
      } catch (err) {
        console.warn('[usePlaceDetails] Error reading IndexedDB cache:', err)
      }
    }

    // 2. Fetch from network with automatic retry
    try {
      const data = await fetchWithRetry(DETAILS_URL, 3)
      if (data && typeof data === 'object') {
        detailsCache.value = data
        // Asynchronously persist to IndexedDB for next visits
        saveToIDB(CACHE_KEY, data).catch(() => {})
        return data
      }
      throw new Error('Received invalid data format')
    } catch (err: any) {
      console.error('[usePlaceDetails] Failed to load province-details after retries:', err)
      detailsError.value = err?.message || 'Failed to load place details'
      // Try fallback to IDB cache if network failed
      const cached = await getFromIDB(CACHE_KEY)
      if (cached) {
        detailsCache.value = cached
        return cached
      }
      return detailsCache.value || {}
    } finally {
      loadingDetails.value = false
      loadPromise = null
    }
  })()

  return loadPromise
}

export function getPlaceDetail(adcode: string): PlaceDetailInfo | undefined {
  if (!detailsCache.value) return undefined
  return detailsCache.value[adcode]
}
