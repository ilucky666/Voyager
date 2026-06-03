import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GEO_DIR = path.join(__dirname, '..', 'public', 'geo')

function main() {
  const citiesDir = path.join(GEO_DIR, 'cities')
  const files = fs.readdirSync(citiesDir).filter(f => f.endsWith('.json'))

  const allCities = []
  const allDistricts = []

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(citiesDir, file), 'utf-8'))
    for (const f of data.features) {
      if (f.properties?.level === 'city') {
        allCities.push(f)
      } else if (f.properties?.level === 'district') {
        allDistricts.push(f)
      }
    }
  }

  const citiesCollection = { type: 'FeatureCollection', features: allCities }
  fs.writeFileSync(path.join(GEO_DIR, 'all-cities.json'), JSON.stringify(citiesCollection))
  console.log(`✓ all-cities.json: ${allCities.length} cities`)

  const districtsCollection = { type: 'FeatureCollection', features: allDistricts }
  fs.writeFileSync(path.join(GEO_DIR, 'all-districts.json'), JSON.stringify(districtsCollection))
  console.log(`✓ all-districts.json: ${allDistricts.length} districts`)

  const citiesSize = fs.statSync(path.join(GEO_DIR, 'all-cities.json')).size
  const districtsSize = fs.statSync(path.join(GEO_DIR, 'all-districts.json')).size
  console.log(`  cities: ${(citiesSize / 1024 / 1024).toFixed(1)} MB`)
  console.log(`  districts: ${(districtsSize / 1024 / 1024).toFixed(1)} MB`)
}

main()
