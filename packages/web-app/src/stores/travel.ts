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
        } else if (p.adcode.length >= 4 && p.adcode.substring(2, 4) === '90') {
          citySet.add(p.adcode)
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
        } else if (p.adcode.length >= 4 && p.adcode.substring(2, 4) === '90') {
          citySet.add(p.adcode)
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

  function getSubordinatePlaces(
    featureAdcode: string,
    featureLevel: AdminLevel
  ): TravelPlace[] {
    const fCode = String(featureAdcode || '')
    if (!fCode) return []

    // 1. Country subordinate places
    if (featureLevel === 'country') {
      return places.value.filter(place => {
        const pCode = String(place.adcode || '')
        if (pCode === fCode) return false
        return place.countryCode === fCode || (fCode === 'CN' && !pCode.includes('-') && place.level !== 'country')
      })
    }

    // 2. Province subordinate places (cities and counties in this province)
    if (featureLevel === 'province') {
      const prefix = fCode.substring(0, 2)
      return places.value.filter(place => {
        const pCode = String(place.adcode || '')
        if (pCode === fCode) return false
        if (pCode.includes('-')) return false
        return pCode.startsWith(prefix) && (place.level === 'city' || place.level === 'county' || pCode.substring(2, 6) !== '0000')
      })
    }

    // 3. City subordinate places (counties in this city)
    if (featureLevel === 'city') {
      const prov = fCode.substring(0, 2)
      const isDirectAdmin = ['11', '12', '31', '50', '81', '82', '71'].includes(prov)
      const isProvDirectCounty = fCode.length >= 4 && fCode.substring(2, 4) === '90'
      const prefix = isDirectAdmin ? prov : (isProvDirectCounty ? fCode : fCode.substring(0, 4))
      return places.value.filter(place => {
        const pCode = String(place.adcode || '')
        if (pCode === fCode) return false
        if (pCode.includes('-')) return false
        if (!pCode.startsWith(prefix)) return false
        return place.level === 'county' || (pCode.length === 6 && !pCode.endsWith('00'))
      })
    }

    return []
  }

  function getAggregatedPlaceType(
    featureAdcode: string,
    featureLevel: AdminLevel
  ): PlaceType | 'none' {
    const fCode = String(featureAdcode || '')

    // 1. Direct match first
    const directPlace = getPlaceByAdcode(fCode)
    if (directPlace) return directPlace.type

    // 2. Subordinate aggregation
    const subs = getSubordinatePlaces(fCode, featureLevel)
    if (subs.length > 0) {
      if (subs.some(p => p.type === 'visited')) return 'visited'
      if (subs.some(p => p.type === 'wishlist')) return 'wishlist'
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
    const localPlaces = await db.places.toArray()
    const placeMap = new Map<string, TravelPlace>()
    for (const p of localPlaces) {
      placeMap.set(`${String(p.adcode)}_${p.type}`, p)
    }

    for (const place of data.places) {
      if (!place || !place.adcode) continue
      const targetAdcode = String(place.adcode)
      const key = `${targetAdcode}_${place.type}`
      const existing = placeMap.get(key)

      if (!existing) {
        const record: TravelPlace = {
          ...place,
          adcode: targetAdcode,
          id: place.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36)),
          createdAt: place.createdAt || new Date().toISOString(),
          updatedAt: place.updatedAt || new Date().toISOString()
        }
        // Verify no ID collision with another adcode in Dexie
        const idCollision = await db.places.get(record.id)
        if (idCollision && (String(idCollision.adcode) !== targetAdcode || idCollision.type !== record.type)) {
          record.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
        }
        await db.places.put(record)
        placeMap.set(key, record)
        count++
      } else {
        const hasNewNote = Boolean(place.note && place.note !== existing.note)
        const hasNewDate = Boolean(place.visitDate && place.visitDate !== existing.visitDate)
        const isNewer = Boolean(place.updatedAt && (!existing.updatedAt || new Date(place.updatedAt) > new Date(existing.updatedAt)))
        if (hasNewNote || hasNewDate || isNewer) {
          const updatedRecord = { ...existing, ...place, id: existing.id }
          await db.places.put(updatedRecord)
          placeMap.set(key, updatedRecord)
          count++
        }
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
    getSubordinatePlaces,
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
