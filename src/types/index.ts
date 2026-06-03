export type AdminLevel = 'province' | 'city' | 'county'
export type PlaceType = 'visited' | 'wishlist'

export interface TravelPlace {
  id: string
  name: string
  adcode: string
  level: AdminLevel
  type: PlaceType
  coordinates: [number, number]
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
