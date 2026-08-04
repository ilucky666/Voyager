export type AdminLevel = 'country' | 'province' | 'city' | 'county'
export type PlaceType = 'visited' | 'wishlist'

export interface TravelPlace {
  id: string
  name: string
  adcode: string
  level: AdminLevel
  type: PlaceType
  coordinates: [number, number]
  country?: string
  countryCode?: string
  province?: string
  city?: string
  visitDate?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export interface RoutePlan {
  id: string
  name: string
  placeIds: string[]
  createdAt: string
}

export interface CityGroup {
  prefix: string
  name: string
  places: TravelPlace[]
}

export interface ProvinceGroup {
  prefix: string
  name: string
  cities: CityGroup[]
  directPlaces: TravelPlace[]
  totalCount: number
}

export interface CountryGroup {
  code: string
  name: string
  provinces: ProvinceGroup[]
  directPlaces: TravelPlace[]
  totalCount: number
}
