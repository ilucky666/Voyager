import Dexie, { type Table } from 'dexie'
import type { TravelPlace, RoutePlan } from '@/types'

class VoyagerDB extends Dexie {
  places!: Table<TravelPlace, string>
  routes!: Table<RoutePlan, string>

  constructor() {
    super('VoyagerDB')
    this.version(1).stores({
      places: 'id, adcode, type, level, name, visitDate, createdAt',
    })
    this.version(2).stores({
      places: 'id, adcode, type, level, name, visitDate, createdAt',
      routes: 'id, name, createdAt',
    })
  }
}

export const db = new VoyagerDB()
