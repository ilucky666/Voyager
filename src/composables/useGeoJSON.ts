import type { AdminLevel } from '@/types'

const GEO_BASE = '/geo'

const geoCache = new Map<string, GeoJSON.FeatureCollection>()

const LEVEL_FILES: Record<AdminLevel, string> = {
  country: 'world-countries.json',
  province: 'world-provinces.json',
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
  return String(feature.properties?.adcode || feature.properties?.iso_3166_2 || feature.id || '')
}

export function extractName(feature: GeoJSON.Feature): string {
  return String(feature.properties?.name || feature.properties?.name_zh || feature.properties?.name_en || '')
}

export function getBoundsFromGeometry(geometry: GeoJSON.Geometry): [[number, number], [number, number]] | null {
  if (!geometry) return null
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity

  function processCoords(coords: any) {
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const x = coords[0]
      const y = coords[1]
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    } else if (Array.isArray(coords)) {
      for (const item of coords) {
        processCoords(item)
      }
    }
  }

  processCoords((geometry as any).coordinates)

  if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
    return [[minX, minY], [maxX, maxY]]
  }
  return null
}

export function getCenterFromGeometry(geometry: GeoJSON.Geometry): [number, number] | null {
  const bounds = getBoundsFromGeometry(geometry)
  if (bounds) {
    return [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]
  }
  return null
}

export function extractCenter(feature: GeoJSON.Feature): [number, number] {
  if (feature.properties?.center) {
    const c = feature.properties.center as number[]
    if (Array.isArray(c) && c.length >= 2) return [c[0], c[1]]
  }
  if (feature.properties?.centroid) {
    const c = feature.properties.centroid as number[]
    if (Array.isArray(c) && c.length >= 2) return [c[0], c[1]]
  }
  const geoCenter = feature.geometry ? getCenterFromGeometry(feature.geometry) : null
  if (geoCenter) return geoCenter
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
