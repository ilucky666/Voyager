import type { AdminLevel } from '@/types'

const GEO_BASE = '/geo'

const geoCache = new Map<string, GeoJSON.FeatureCollection>()

const LEVEL_FILES: Record<AdminLevel, string> = {
  province: 'provinces.json',
  city: 'all-cities.json',
  county: 'all-districts.json',
}

export async function loadGeoJSON(level: AdminLevel): Promise<GeoJSON.FeatureCollection> {
  if (geoCache.has(level)) {
    return geoCache.get(level)!
  }

  const url = `${GEO_BASE}/${LEVEL_FILES[level]}`
  const resp = await fetch(url)
  if (!resp.ok) {
    throw new Error(`Failed to load GeoJSON: ${url} (${resp.status})`)
  }
  const data: GeoJSON.FeatureCollection = await resp.json()
  geoCache.set(level, data)
  return data
}

export function extractAdcode(feature: GeoJSON.Feature): string {
  return String(feature.properties?.adcode || feature.id || '')
}

export function extractName(feature: GeoJSON.Feature): string {
  return String(feature.properties?.name || '')
}

export function extractCenter(feature: GeoJSON.Feature): [number, number] {
  if (feature.properties?.center) {
    const c = feature.properties.center as number[]
    if (Array.isArray(c)) return [c[0], c[1]]
  }
  if (feature.properties?.centroid) {
    const c = feature.properties.centroid as number[]
    return [c[0], c[1]]
  }
  return [104.0, 35.0]
}

export function getParentAdcode(feature: GeoJSON.Feature): string {
  const parent = feature.properties?.parent
  if (typeof parent === 'object' && parent !== null) {
    return String(parent.adcode || '')
  }
  return ''
}

export function getAncestorAdcodes(feature: GeoJSON.Feature): string[] {
  const acroutes = feature.properties?.acroutes
  if (Array.isArray(acroutes)) {
    return acroutes.map(String)
  }
  return []
}

export function clearGeoCache() {
  geoCache.clear()
}
