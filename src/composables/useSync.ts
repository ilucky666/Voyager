import { db } from '@/db'
import type { TravelPlace, RoutePlan } from '@/types'
import LZString from 'lz-string'

export async function exportToJSON(): Promise<string> {
  const places = await db.places.toArray()
  const routes = await db.routes.toArray()
  return JSON.stringify({ version: 2, places, routes })
}

export async function importFromJSON(json: string): Promise<{ places: number; routes: number }> {
  const data = JSON.parse(json)
  let placeCount = 0
  let routeCount = 0

  if (data.places && Array.isArray(data.places)) {
    const existing = await db.places.toArray()
    const existingIds = new Set(existing.map(p => p.id))
    for (const place of data.places) {
      if (!existingIds.has(place.id)) {
        await db.places.put(place)
        placeCount++
      }
    }
  }

  if (data.routes && Array.isArray(data.routes)) {
    const existing = await db.routes.toArray()
    const existingIds = new Set(existing.map(r => r.id))
    for (const route of data.routes) {
      if (!existingIds.has(route.id)) {
        await db.routes.put(route)
        routeCount++
      }
    }
  }

  return { places: placeCount, routes: routeCount }
}

export async function exportToFile() {
  const json = await exportToJSON()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `voyager-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importFromFile(): Promise<{ places: number; routes: number }> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return reject(new Error('未选择文件'))
      try {
        const text = await file.text()
        const result = await importFromJSON(text)
        resolve(result)
      } catch (e) {
        reject(e)
      }
    }
    input.click()
  })
}

export async function exportToClipboard() {
  const json = await exportToJSON()
  await navigator.clipboard.writeText(json)
}

export async function importFromClipboard() {
  const text = await navigator.clipboard.readText()
  return importFromJSON(text)
}

export function checkURLImport(): string | null {
  const hash = location.hash
  const prefix = '#import='
  const compressedPrefix = '#import_lz='
  if (hash.startsWith(compressedPrefix)) {
    const compressed = decodeURIComponent(hash.substring(compressedPrefix.length))
    return LZString.decompressFromEncodedURIComponent(compressed)
  }
  if (hash.startsWith(prefix)) {
    return decodeURIComponent(hash.substring(prefix.length))
  }
  return null
}

export async function generateCompressedSyncURL(): Promise<string> {
  const json = await exportToJSON()
  const compressed = LZString.compressToEncodedURIComponent(json)
  return `${location.origin}${location.pathname}#import_lz=${compressed}`
}

export function clearURLImport() {
  if (location.hash.startsWith('#import=') || location.hash.startsWith('#import_lz=')) {
    history.replaceState(null, '', location.pathname + location.search)
  }
}
