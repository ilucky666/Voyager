import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GEO_DIR = path.join(__dirname, '..', 'public', 'geo')
const DATAV_BASE = 'https://geo.datav.aliyun.com/areas_v3/bound'

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject)
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error(`Invalid JSON from ${url}`)) }
      })
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function main() {
  ensureDir(GEO_DIR)
  ensureDir(path.join(GEO_DIR, 'cities'))
  ensureDir(path.join(GEO_DIR, 'counties'))

  console.log('Downloading China boundary...')
  const china = await fetchJSON(`${DATAV_BASE}/100000_full.json`)
  fs.writeFileSync(path.join(GEO_DIR, 'china.json'), JSON.stringify(china))
  console.log('  ✓ china.json')

  console.log('Downloading provinces...')
  const provinceFeatures = china.features.filter(f => {
    const adcode = String(f.properties.adcode)
    return adcode.endsWith('0000') && adcode !== '100000'
  })
  const provincesCollection = { type: 'FeatureCollection', features: provinceFeatures }
  fs.writeFileSync(path.join(GEO_DIR, 'provinces.json'), JSON.stringify(provincesCollection))
  console.log(`  ✓ provinces.json (${provinceFeatures.length} provinces)`)

  console.log('Downloading city-level data by province...')
  const allCityFeatures = []
  for (const prov of provinceFeatures) {
    const adcode = String(prov.properties.adcode)
    const name = prov.properties.name
    const filePath = path.join(GEO_DIR, 'cities', `${adcode}.json`)

    let data
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      console.log(`  ⊙ ${name} (${adcode}) - already exists (${data.features.length} features)`)
    } else {
      try {
        data = await fetchJSON(`${DATAV_BASE}/${adcode}_full.json`)
        const cityFeatures = data.features.filter(f => {
          const ac = String(f.properties.adcode)
          return ac !== adcode
        })
        data = { type: 'FeatureCollection', features: cityFeatures }
        fs.writeFileSync(filePath, JSON.stringify(data))
        console.log(`  ✓ ${name} (${adcode}) - ${cityFeatures.length} features`)
      } catch (e) {
        console.log(`  ✗ ${name} (${adcode}) - ${e.message}`)
        continue
      }
      await new Promise(r => setTimeout(r, 200))
    }

    for (const f of data.features) {
      if (f.properties.level === 'city') {
        allCityFeatures.push({ adcode: String(f.properties.adcode), name: f.properties.name, province: adcode })
      }
    }
  }

  console.log(`\nDownloading district-level data for ${allCityFeatures.length} cities...`)
  let successCount = 0
  let skipCount = 0
  let failCount = 0

  for (const city of allCityFeatures) {
    const filePath = path.join(GEO_DIR, 'counties', `${city.adcode}.json`)

    if (fs.existsSync(filePath)) {
      skipCount++
      continue
    }

    try {
      const data = await fetchJSON(`${DATAV_BASE}/${city.adcode}_full.json`)
      const districtFeatures = data.features.filter(f => {
        const ac = String(f.properties.adcode)
        return ac !== city.adcode
      })
      const collection = { type: 'FeatureCollection', features: districtFeatures }
      fs.writeFileSync(filePath, JSON.stringify(collection))
      successCount++
      if (successCount % 20 === 0) {
        console.log(`  ... ${successCount} downloaded, ${skipCount} skipped, ${failCount} failed`)
      }
    } catch (e) {
      failCount++
      console.log(`  ✗ ${city.name} (${city.adcode}) - ${e.message}`)
    }

    await new Promise(r => setTimeout(r, 150))
  }

  console.log(`\nDistrict download complete: ${successCount} downloaded, ${skipCount} skipped, ${failCount} failed`)

  console.log('\nRebuilding province files with full data (cities + districts)...')
  for (const prov of provinceFeatures) {
    const adcode = String(prov.properties.adcode)
    const filePath = path.join(GEO_DIR, 'cities', `${adcode}.json`)

    if (!fs.existsSync(filePath)) continue

    const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const allFeatures = [...existing.features]

    for (const f of existing.features) {
      if (f.properties.level === 'city') {
        const cityAdcode = String(f.properties.adcode)
        const countyPath = path.join(GEO_DIR, 'counties', `${cityAdcode}.json`)
        if (fs.existsSync(countyPath)) {
          const countyData = JSON.parse(fs.readFileSync(countyPath, 'utf-8'))
          allFeatures.push(...countyData.features)
        }
      }
    }

    const merged = { type: 'FeatureCollection', features: allFeatures }
    fs.writeFileSync(filePath, JSON.stringify(merged))
  }

  console.log('  ✓ Province files updated with district data')

  console.log('\nDone! All GeoJSON data downloaded to public/geo/')
}

main().catch(console.error)
