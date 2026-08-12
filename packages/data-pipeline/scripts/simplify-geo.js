import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GEO_DIR = path.join(__dirname, '..', 'public', 'geo')

function simplifyRing(ring, tolerance) {
  if (ring.length <= 3) return ring
  const result = [ring[0]]
  for (let i = 1; i < ring.length - 1; i++) {
    const prev = result[result.length - 1]
    const dx = ring[i][0] - prev[0]
    const dy = ring[i][1] - prev[1]
    if (dx * dx + dy * dy >= tolerance * tolerance) {
      result.push(ring[i])
    }
  }
  result.push(ring[ring.length - 1])
  return result
}

function simplifyGeometry(geom, tolerance) {
  if (geom.type === 'Polygon') {
    return { ...geom, coordinates: geom.coordinates.map(c => simplifyRing(c, tolerance)) }
  }
  if (geom.type === 'MultiPolygon') {
    return { ...geom, coordinates: geom.coordinates.map(poly => poly.map(c => simplifyRing(c, tolerance))) }
  }
  return geom
}

function processFile(name, tolerance) {
  const filePath = path.join(GEO_DIR, name)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const simplified = {
    type: 'FeatureCollection',
    features: data.features.map(f => ({
      ...f,
      geometry: simplifyGeometry(f.geometry, tolerance),
    })),
  }
  fs.writeFileSync(filePath, JSON.stringify(simplified))
  const size = fs.statSync(filePath).size
  console.log(`✓ ${name}: ${data.features.length} features, ${(size / 1024 / 1024).toFixed(1)} MB (tolerance=${tolerance})`)
}

processFile('all-cities.json', 0.01)
processFile('all-districts.json', 0.02)
