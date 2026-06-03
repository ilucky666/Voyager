<script setup lang="ts">
import { computed } from 'vue'
import { useMap } from '@/composables/useMap'
import { useMapStore } from '@/stores/map'
import { useTravelStore } from '@/stores/travel'
import { extractAdcode, extractName, extractCenter } from '@/composables/useGeoJSON'
import LevelSwitcher from '../map/LevelSwitcher.vue'
import PlacePopup from '../map/PlacePopup.vue'
import StatsBar from '../map/StatsBar.vue'
import type { AdminLevel } from '@/types'

const { mapReady, selectedFeature, loading, switchLevel, refreshLayer } = useMap('map-container')
const mapStore = useMapStore()
const travelStore = useTravelStore()

const selectedAdcode = computed(() => {
  if (!selectedFeature.value) return ''
  return extractAdcode(selectedFeature.value)
})

const selectedName = computed(() => {
  if (!selectedFeature.value) return ''
  return extractName(selectedFeature.value)
})

const selectedLevel = computed<AdminLevel>(() => {
  return mapStore.currentLevel
})

const existingPlace = computed(() => {
  if (!selectedAdcode.value) return null
  return travelStore.getPlaceByAdcode(selectedAdcode.value)
})

const isCountyLevel = computed(() => mapStore.currentLevel === 'county')

async function addAsVisited() {
  if (!selectedFeature.value) return
  const f = selectedFeature.value
  const adcode = extractAdcode(f)
  const name = extractName(f)
  const center = extractCenter(f)

  await travelStore.addPlace({
    name,
    adcode,
    level: 'county',
    type: 'visited',
    coordinates: center,
  })
  await refreshLayer()
  selectedFeature.value = null
}

async function addAsWishlist() {
  if (!selectedFeature.value) return
  const f = selectedFeature.value
  const adcode = extractAdcode(f)
  const name = extractName(f)
  const center = extractCenter(f)

  await travelStore.addPlace({
    name,
    adcode,
    level: 'county',
    type: 'wishlist',
    coordinates: center,
  })
  await refreshLayer()
  selectedFeature.value = null
}

async function removePlace() {
  if (!existingPlace.value) return
  await travelStore.removePlace(existingPlace.value.id)
  await refreshLayer()
  selectedFeature.value = null
}

async function toggleType() {
  if (!existingPlace.value) return
  await travelStore.togglePlaceType(existingPlace.value.id)
  await refreshLayer()
}

function closePopup() {
  selectedFeature.value = null
}

function handleSwitchLevel(level: AdminLevel) {
  switchLevel(level)
}
</script>

<template>
  <div class="map-view">
    <div id="map-container" class="map-container"></div>

    <LevelSwitcher
      v-if="mapReady"
      @switch="handleSwitchLevel"
    />

    <StatsBar v-if="mapReady" />

    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
    </div>

    <PlacePopup
      v-if="selectedFeature && mapReady"
      :name="selectedName"
      :adcode="selectedAdcode"
      :existing-place="existingPlace"
      :is-county-level="isCountyLevel"
      :current-level="selectedLevel"
      @add-visited="addAsVisited"
      @add-wishlist="addAsWishlist"
      @remove="removePlace"
      @toggle-type="toggleType"
      @close="closePopup"
    />
  </div>
</template>

<style scoped>
.map-view {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
