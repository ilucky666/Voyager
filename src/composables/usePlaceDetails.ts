import { ref } from 'vue'

export interface UNESCOHeritageItem {
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
}

const detailsCache = ref<Record<string, PlaceDetailInfo> | null>(null)
const loadingDetails = ref(false)

export async function loadPlaceDetails(): Promise<Record<string, PlaceDetailInfo>> {
  if (detailsCache.value) return detailsCache.value

  loadingDetails.value = true
  try {
    const resp = await fetch(`/geo/province-details.json?v=${Date.now()}`)
    if (resp.ok) {
      detailsCache.value = await resp.json()
    } else {
      detailsCache.value = {}
    }
  } catch (err) {
    console.error('Failed to load province-details.json:', err)
    detailsCache.value = {}
  } finally {
    loadingDetails.value = false
  }

  return detailsCache.value || {}
}

export function getPlaceDetail(adcode: string): PlaceDetailInfo | undefined {
  if (!detailsCache.value) return undefined
  return detailsCache.value[adcode]
}
