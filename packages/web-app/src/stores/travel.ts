import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TravelPlace, PlaceType, AdminLevel } from '@/types'
import { db } from '@/db'

export const useTravelStore = defineStore('travel', () => {
  const places = ref<TravelPlace[]>([])
  const loaded = ref(false)

  const visitedPlaces = computed(() => places.value.filter(p => p.type === 'visited'))
  const wishlistPlaces = computed(() => places.value.filter(p => p.type === 'wishlist'))

  const visitedByLevel = computed(() => {
    const countrySet = new Set<string>()
    const provinceSet = new Set<string>()
    const citySet = new Set<string>()
    let countyCount = 0
    visitedPlaces.value.forEach(p => {
      if (p.countryCode) {
        countrySet.add(p.countryCode)
      } else if (p.level === 'country') {
        countrySet.add(p.adcode)
      } else {
        countrySet.add('CN')
      }

      provinceSet.add(p.adcode.includes('-') ? p.adcode : p.adcode.substring(0, 2))
      if (p.adcode.length >= 4 && !p.adcode.includes('-')) {
        const prov = p.adcode.substring(0, 2)
        if (['11', '12', '31', '50', '81', '82', '71'].includes(prov)) {
          citySet.add(prov + '00')
        } else {
          citySet.add(p.adcode.substring(0, 4))
        }
      }
      countyCount++
    })
    return { country: countrySet.size, province: provinceSet.size, city: citySet.size, county: countyCount }
  })

  const wishlistByLevel = computed(() => {
    const countrySet = new Set<string>()
    const provinceSet = new Set<string>()
    const citySet = new Set<string>()
    let countyCount = 0
    wishlistPlaces.value.forEach(p => {
      if (p.countryCode) {
        countrySet.add(p.countryCode)
      } else if (p.level === 'country') {
        countrySet.add(p.adcode)
      } else {
        countrySet.add('CN')
      }

      provinceSet.add(p.adcode.includes('-') ? p.adcode : p.adcode.substring(0, 2))
      if (p.adcode.length >= 4 && !p.adcode.includes('-')) {
        const prov = p.adcode.substring(0, 2)
        if (['11', '12', '31', '50', '81', '82', '71'].includes(prov)) {
          citySet.add(prov + '00')
        } else {
          citySet.add(p.adcode.substring(0, 4))
        }
      }
      countyCount++
    })
    return { country: countrySet.size, province: provinceSet.size, city: citySet.size, county: countyCount }
  })

  function getPlaceByAdcode(adcode: string): TravelPlace | undefined {
    const codeStr = String(adcode || '')
    return places.value.find(p => String(p.adcode || '') === codeStr)
  }

  function getPlaceTypeByAdcode(adcode: string): PlaceType | 'none' {
    const place = getPlaceByAdcode(adcode)
    return place ? place.type : 'none'
  }

  function getAggregatedPlaceType(
    featureAdcode: string,
    featureLevel: AdminLevel
  ): PlaceType | 'none' {
    const fCode = String(featureAdcode || '')

    // 1. Direct match first
    const directPlace = getPlaceByAdcode(fCode)
    if (directPlace) return directPlace.type

    // 2. Country aggregation
    if (featureLevel === 'country') {
      let hasVisited = false
      let hasWishlist = false
      for (const place of places.value) {
        const pCode = String(place.adcode || '')
        const isMatch = place.countryCode === fCode || pCode === fCode || (fCode === 'CN' && !pCode.includes('-') && place.level !== 'country')
        if (isMatch) {
          if (place.type === 'visited') hasVisited = true
          else if (place.type === 'wishlist') hasWishlist = true
        }
        if (hasVisited) break
      }
      if (hasVisited) return 'visited'
      if (hasWishlist) return 'wishlist'
      return 'none'
    }

    // 3. Province / City / County aggregation for sub-regions
    if (featureLevel === 'province') {
      let hasVisited = false
      let hasWishlist = false
      const prefix = fCode.substring(0, 2)
      for (const place of places.value) {
        const pCode = String(place.adcode || '')
        if (pCode === fCode || (!pCode.includes('-') && pCode.startsWith(prefix))) {
          if (place.type === 'visited') hasVisited = true
          else if (place.type === 'wishlist') hasWishlist = true
        }
        if (hasVisited) break
      }
      if (hasVisited) return 'visited'
      if (hasWishlist) return 'wishlist'
      return 'none'
    }

    // 4. City aggregation for sub-regions (counties)
    if (featureLevel === 'city') {
      let hasVisited = false
      let hasWishlist = false
      const prov = fCode.substring(0, 2)
      const isDirectAdmin = ['11', '12', '31', '50', '81', '82', '71'].includes(prov)
      const prefix = isDirectAdmin ? prov : fCode.substring(0, 4)
      for (const place of places.value) {
        const pCode = String(place.adcode || '')
        if (pCode === fCode || (!pCode.includes('-') && pCode.startsWith(prefix))) {
          if (place.type === 'visited') hasVisited = true
          else if (place.type === 'wishlist') hasWishlist = true
        }
        if (hasVisited) break
      }
      if (hasVisited) return 'visited'
      if (hasWishlist) return 'wishlist'
      return 'none'
    }

    return getPlaceTypeByAdcode(fCode)
  }

  async function loadPlaces() {
    if (loaded.value && places.value.length > 0) return
    try {
      places.value = await db.places.toArray()
      loaded.value = true
    } catch (err) {
      console.error('Failed to load places from IndexedDB:', err)
      places.value = []
    }
  }

  async function addPlace(place: Omit<TravelPlace, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
      }
      return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    }

    const newPlace: TravelPlace = {
      ...place,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    await db.places.add(newPlace)
    places.value.push(newPlace)
    return newPlace
  }

  async function updatePlace(id: string, updates: Partial<TravelPlace>) {
    const now = new Date().toISOString()
    await db.places.update(id, { ...updates, updatedAt: now })
    const idx = places.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      places.value[idx] = { ...places.value[idx], ...updates, updatedAt: now }
    }
  }

  async function removePlace(id: string) {
    await db.places.delete(id)
    places.value = places.value.filter(p => p.id !== id)
  }

  async function togglePlaceType(id: string) {
    const place = places.value.find(p => p.id === id)
    if (!place) return
    const newType: PlaceType = place.type === 'visited' ? 'wishlist' : 'visited'
    await updatePlace(id, { type: newType })
  }

  async function exportData(): Promise<string> {
    const allPlaces = await db.places.toArray()
    const allRoutes = await db.routes.toArray()
    return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), places: allPlaces, routes: allRoutes }, null, 2)
  }

  async function importData(jsonStr: string): Promise<number> {
    const data = JSON.parse(jsonStr)
    if (!data.places || !Array.isArray(data.places)) {
      throw new Error('无效的数据格式')
    }
    let count = 0
    for (const place of data.places) {
      const existing = places.value.find(p => p.adcode === place.adcode && p.type === place.type)
      if (!existing) {
        await db.places.put(place)
        count++
      }
    }
    if (data.routes && Array.isArray(data.routes)) {
      for (const route of data.routes) {
        await db.routes.put(route)
      }
    }
    places.value = await db.places.toArray()
    return count
  }

  async function clearAll() {
    await db.places.clear()
    await db.routes.clear()
    places.value = []
  }

  return {
    places,
    loaded,
    visitedPlaces,
    wishlistPlaces,
    visitedByLevel,
    wishlistByLevel,
    getPlaceByAdcode,
    getPlaceTypeByAdcode,
    getAggregatedPlaceType,
    loadPlaces,
    addPlace,
    updatePlace,
    removePlace,
    togglePlaceType,
    exportData,
    importData,
    clearAll,
  }
})
