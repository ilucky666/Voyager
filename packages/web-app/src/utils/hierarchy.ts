import type { TravelPlace, CityGroup, ProvinceGroup, CountryGroup } from '@/types'
import { adcodeMap } from './adcodeMap'

export function buildHierarchy(placesList: TravelPlace[]): CountryGroup[] {
  const countryMap = new Map<string, Map<string, Map<string, TravelPlace[]>>>()

  for (const place of placesList) {
    const countryCode = place.countryCode || (place.level === 'country' ? place.adcode : (place.country || 'CN'))
    const provPrefix = place.adcode.includes('-') ? place.adcode : place.adcode.substring(0, 2)
    const cityPrefix = place.adcode.length >= 4 && !place.adcode.includes('-') ? place.adcode.substring(0, 4) : provPrefix + '00'

    if (!countryMap.has(countryCode)) {
      countryMap.set(countryCode, new Map())
    }
    const provMap = countryMap.get(countryCode)!
    if (!provMap.has(provPrefix)) {
      provMap.set(provPrefix, new Map())
    }
    const cityMap = provMap.get(provPrefix)!
    if (!cityMap.has(cityPrefix)) {
      cityMap.set(cityPrefix, [])
    }
    cityMap.get(cityPrefix)!.push(place)
  }

  const result: CountryGroup[] = []

  for (const [countryCode, provMap] of countryMap) {
    let countryTotal = 0
    const provinceGroups: ProvinceGroup[] = []
    const countryDirectPlaces: TravelPlace[] = []

    for (const [provPrefix, cityMap] of provMap) {
      let provTotal = 0
      const cities: CityGroup[] = []
      const provDirectPlaces: TravelPlace[] = []

      for (const [cityPrefix, places] of cityMap) {
        provTotal += places.length
        if (cityPrefix === provPrefix + '00' || provPrefix.includes('-')) {
          provDirectPlaces.push(...places)
        } else {
          const sampleCityPlace = places[0]
          cities.push({
            prefix: cityPrefix,
            name: adcodeMap[cityPrefix] || sampleCityPlace?.city || sampleCityPlace?.name || cityPrefix,
            places: places.sort((a, b) => a.name.localeCompare(b.name)),
          })
        }
      }

      countryTotal += provTotal

      if (provPrefix === countryCode) {
        countryDirectPlaces.push(...provDirectPlaces)
      } else {
        const sampleProvPlace = provDirectPlaces[0] || (cities.length > 0 ? cities[0].places[0] : undefined)
        const provName = adcodeMap[provPrefix] || sampleProvPlace?.province || sampleProvPlace?.name || provPrefix
        provinceGroups.push({
          prefix: provPrefix,
          name: provName,
          cities: cities.sort((a, b) => a.prefix.localeCompare(b.prefix)),
          directPlaces: provDirectPlaces.sort((a, b) => a.name.localeCompare(b.name)),
          totalCount: provTotal,
        })
      }
    }

    const samplePlace = countryDirectPlaces[0] || (provinceGroups[0]?.directPlaces[0]) || (provinceGroups[0]?.cities[0]?.places[0])
    const countryName = samplePlace?.country || countryCode

    result.push({
      code: countryCode,
      name: countryName,
      provinces: provinceGroups.sort((a, b) => b.totalCount - a.totalCount),
      directPlaces: countryDirectPlaces,
      totalCount: countryTotal,
    })
  }

  return result.sort((a, b) => b.totalCount - a.totalCount)
}
