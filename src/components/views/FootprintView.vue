<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useTravelStore } from '@/stores/travel'
import type { TravelPlace } from '@/types'

const travelStore = useTravelStore()
const expandedProvinces = ref(new Set<string>())
const expandedCities = ref(new Set<string>())
const showTimeline = ref(false)

onMounted(() => {
  travelStore.loadPlaces()
})

interface CityGroup {
  prefix: string
  name: string
  places: TravelPlace[]
}

interface ProvinceGroup {
  prefix: string
  name: string
  cities: CityGroup[]
  directPlaces: TravelPlace[]
  totalCount: number
}

const hierarchy = computed(() => {
  const visited = travelStore.visitedPlaces
  const provinceMap = new Map<string, Map<string, TravelPlace[]>>()

  for (const place of visited) {
    const provPrefix = place.adcode.substring(0, 2)
    const cityPrefix = place.adcode.substring(0, 4)

    if (!provinceMap.has(provPrefix)) {
      provinceMap.set(provPrefix, new Map())
    }
    const cityMap = provinceMap.get(provPrefix)!
    if (!cityMap.has(cityPrefix)) {
      cityMap.set(cityPrefix, [])
    }
    cityMap.get(cityPrefix)!.push(place)
  }

  const result: ProvinceGroup[] = []
  for (const [provPrefix, cityMap] of provinceMap) {
    let totalCount = 0
    const cities: CityGroup[] = []
    const directPlaces: TravelPlace[] = []

    for (const [cityPrefix, places] of cityMap) {
      totalCount += places.length
      if (cityPrefix === provPrefix + '00') {
        directPlaces.push(...places)
      } else {
        cities.push({
          prefix: cityPrefix,
          name: places[0]?.name || cityPrefix,
          places: places.sort((a, b) => a.name.localeCompare(b.name)),
        })
      }
    }

    const provName = cities.length > 0
      ? cities[0].places[0]?.name || provPrefix
      : directPlaces[0]?.name || provPrefix

    result.push({
      prefix: provPrefix,
      name: provName,
      cities: cities.sort((a, b) => a.prefix.localeCompare(b.prefix)),
      directPlaces: directPlaces.sort((a, b) => a.name.localeCompare(b.name)),
      totalCount,
    })
  }

  return result.sort((a, b) => b.totalCount - a.totalCount)
})

const timelinePlaces = computed(() => {
  return travelStore.visitedPlaces
    .filter(p => p.visitDate)
    .sort((a, b) => b.visitDate!.localeCompare(a.visitDate!))
})

function toggleProvince(prefix: string) {
  if (expandedProvinces.value.has(prefix)) {
    expandedProvinces.value.delete(prefix)
  } else {
    expandedProvinces.value.add(prefix)
  }
}

function toggleCity(prefix: string) {
  if (expandedCities.value.has(prefix)) {
    expandedCities.value.delete(prefix)
  } else {
    expandedCities.value.add(prefix)
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

async function removePlace(id: string) {
  await travelStore.removePlace(id)
}
</script>

<template>
  <div class="footprint-view">
    <div class="fp-header">
      <h1 class="fp-title">我的足迹</h1>
      <div class="fp-stats">
        <span class="stat-chip">{{ travelStore.visitedByLevel.province }} 省</span>
        <span class="stat-chip">{{ travelStore.visitedByLevel.city }} 市</span>
        <span class="stat-chip">{{ travelStore.visitedByLevel.county }} 县</span>
      </div>
    </div>

    <div class="fp-tabs">
      <button class="fp-tab" :class="{ active: !showTimeline }" @click="showTimeline = false">按地区</button>
      <button class="fp-tab" :class="{ active: showTimeline }" @click="showTimeline = true">时间线</button>
    </div>

    <div class="fp-content">
      <div v-if="travelStore.visitedPlaces.length === 0" class="empty-state">
        <div class="empty-icon">🗺️</div>
        <p>暂无足迹</p>
        <p class="empty-hint">在地图上标记你去过的地方吧</p>
      </div>

      <template v-else-if="!showTimeline">
        <div v-for="prov in hierarchy" :key="prov.prefix" class="province-block">
          <div class="province-row" @click="toggleProvince(prov.prefix)">
            <span class="expand-icon">{{ expandedProvinces.has(prov.prefix) ? '▼' : '▶' }}</span>
            <span class="province-name">{{ prov.prefix }}</span>
            <span class="province-count">{{ prov.totalCount }}</span>
          </div>

          <div v-if="expandedProvinces.has(prov.prefix)" class="province-children">
            <div v-for="city in prov.cities" :key="city.prefix" class="city-block">
              <div class="city-row" @click="toggleCity(city.prefix)">
                <span class="expand-icon small">{{ expandedCities.has(city.prefix) ? '▼' : '▶' }}</span>
                <span class="city-name">{{ city.prefix }}</span>
                <span class="city-count">{{ city.places.length }}</span>
              </div>

              <div v-if="expandedCities.has(city.prefix)" class="county-list">
                <template v-for="place in city.places" :key="place.id">
                  <div class="county-row">
                    <span class="county-dot visited"></span>
                    <span class="county-name">{{ place.name }}</span>
                    <span v-if="place.visitDate" class="county-date">{{ formatDate(place.visitDate) }}</span>
                    <button class="remove-btn" @click.stop="removePlace(place.id)">✕</button>
                  </div>
                  <div class="county-note" v-if="place.note">
                    {{ place.note }}
                  </div>
                </template>
              </div>
            </div>

            <template v-for="place in prov.directPlaces" :key="place.id">
              <div class="county-row direct">
                <span class="county-dot visited"></span>
                <span class="county-name">{{ place.name }}</span>
                <span v-if="place.visitDate" class="county-date">{{ formatDate(place.visitDate) }}</span>
                <button class="remove-btn" @click.stop="removePlace(place.id)">✕</button>
              </div>
              <div class="county-note direct" v-if="place.note">
                {{ place.note }}
              </div>
            </template>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-if="timelinePlaces.length === 0" class="empty-hint">暂无标注日期的足迹</div>
        <template v-for="place in timelinePlaces" :key="place.id">
          <div class="tl-row">
            <div class="tl-dot visited"></div>
            <div class="tl-info">
              <span class="tl-name">{{ place.name }}</span>
              <span class="tl-date">{{ formatDate(place.visitDate!) }}</span>
            </div>
            <button class="remove-btn" @click.stop="removePlace(place.id)">✕</button>
          </div>
          <div v-if="place.note" class="tl-note">
            {{ place.note }}
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.footprint-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: var(--safe-top);
}

.fp-header {
  padding: 16px 16px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fp-title {
  font-size: 22px;
  font-weight: 700;
}

.fp-stats {
  display: flex;
  gap: 6px;
}

.stat-chip {
  padding: 3px 8px;
  background: var(--color-bg-secondary);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
}

.fp-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
}

.fp-tab {
  flex: 1;
  padding: 7px 0;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.fp-tab.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.fp-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
  -webkit-overflow-scrolling: touch;
}

.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-hint {
  font-size: 13px;
  margin-top: 4px;
  text-align: center;
  color: var(--color-text-secondary);
  padding: 24px 0;
}

.province-block {
  margin-bottom: 4px;
}

.province-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.province-row:hover {
  background: var(--color-border);
}

.expand-icon {
  font-size: 10px;
  color: var(--color-text-secondary);
  width: 14px;
  text-align: center;
}

.expand-icon.small {
  font-size: 9px;
}

.province-name {
  flex: 1;
  font-weight: 600;
  font-size: 15px;
}

.province-count {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 600;
  background: rgba(26, 115, 232, 0.1);
  padding: 2px 8px;
  border-radius: 999px;
}

.province-children {
  padding-left: 12px;
  border-left: 2px solid var(--color-border);
  margin: 4px 0 4px 7px;
}

.city-block {
  margin-bottom: 2px;
}

.city-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.city-row:hover {
  background: var(--color-bg-secondary);
}

.city-name {
  flex: 1;
  font-weight: 500;
  font-size: 14px;
}

.city-count {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.county-list {
  padding-left: 10px;
  border-left: 2px solid var(--color-border);
  margin: 2px 0 4px 6px;
}

.county-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 4px;
}

.county-row:hover {
  background: var(--color-bg-secondary);
}

.county-row.direct {
  padding-left: 24px;
}

.county-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.county-dot.visited {
  background: var(--color-visited);
}

.county-name {
  flex: 1;
  font-size: 13px;
}

.county-date {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.remove-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 11px;
  cursor: pointer;
  color: var(--color-text-secondary);
  opacity: 0;
  transition: all 0.15s;
}

.county-row:hover .remove-btn,
.tl-row:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: rgba(234, 67, 53, 0.1);
  color: #ea4335;
}

.tl-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
}

.tl-row:hover {
  background: var(--color-bg-secondary);
}

.tl-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tl-dot.visited {
  background: var(--color-visited);
}

.tl-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.tl-name {
  font-weight: 500;
  font-size: 14px;
}

.tl-date {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.county-note {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: -2px 0 6px 20px;
  padding: 4px 8px;
  background: rgba(142, 142, 147, 0.08);
  border-radius: 6px;
}

.county-note.direct {
  margin-left: 36px;
}

.tl-note {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: -4px 0 8px 26px;
  padding: 6px 10px;
  background: rgba(142, 142, 147, 0.08);
  border-radius: 8px;
}
</style>
