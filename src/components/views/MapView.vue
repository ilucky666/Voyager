<script setup lang="ts">
import { computed, watch } from 'vue'
import { useMap } from '@/composables/useMap'
import { useMapStore } from '@/stores/map'
import { useTravelStore } from '@/stores/travel'
import { loadGeoJSON, extractAdcode, extractName, extractCenter, getBoundsFromGeometry } from '@/composables/useGeoJSON'
import { loadPlaceDetails, getPlaceDetail } from '@/composables/usePlaceDetails'
import LevelSwitcher from '../map/LevelSwitcher.vue'
import PlacePopup from '../map/PlacePopup.vue'
import StatsBar from '../map/StatsBar.vue'
import type { AdminLevel } from '@/types'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'

const { mapReady, selectedFeature, loading, switchLevel, refreshLayer, map } = useMap('map-container')
const mapStore = useMapStore()
const travelStore = useTravelStore()
const route = useRoute()

onMounted(async () => {
  await loadPlaceDetails()
})

const selectedAdcode = computed(() => {
  if (!selectedFeature.value) return ''
  return extractAdcode(selectedFeature.value)
})

const selectedDetailInfo = computed(() => {
  if (!selectedAdcode.value) return undefined
  return getPlaceDetail(selectedAdcode.value)
})

const selectedName = computed(() => {
  if (!selectedFeature.value) return ''
  if (selectedDetailInfo.value?.name) return selectedDetailInfo.value.name
  return extractName(selectedFeature.value)
})

const selectedNameEn = computed(() => {
  if (!selectedFeature.value) return ''
  if (selectedDetailInfo.value?.nameEn) return selectedDetailInfo.value.nameEn
  const p = selectedFeature.value.properties
  return p?.name_en || p?.name_local || ''
})

const selectedCountry = computed(() => {
  if (!selectedFeature.value) return ''
  if (selectedDetailInfo.value?.country) return selectedDetailInfo.value.country
  const p = selectedFeature.value.properties
  return p?.country || ''
})

const selectedSummary = computed(() => {
  if (!selectedFeature.value) return ''
  if (selectedDetailInfo.value?.summary) return selectedDetailInfo.value.summary
  const p = selectedFeature.value.properties
  const countryName = p?.country ? `${p.country}` : ''
  const levelText = mapStore.currentLevel === 'country' ? '国家/地区' : (mapStore.currentLevel === 'province' ? '省/州级行政区' : '行政区域')
  return `位于 ${countryName} 的 ${levelText}，标识代码为 ${p?.adcode}。`
})

const selectedAttractions = computed(() => selectedDetailInfo.value?.attractions)
const selectedHeritage = computed(() => selectedDetailInfo.value?.heritage)
const selectedExperiences = computed(() => selectedDetailInfo.value?.experiences)

const selectedLevel = computed<AdminLevel>(() => {
  return mapStore.currentLevel
})

const existingPlace = computed(() => {
  if (!selectedAdcode.value) return null
  return travelStore.getPlaceByAdcode(selectedAdcode.value)
})

const isCountyLevel = computed(() => {
  const adcode = selectedAdcode.value
  const isDomestic = /^\d{6}$/.test(adcode)
  if (!isDomestic) {
    // Overseas regions can be marked at country or province level
    return mapStore.currentLevel === 'country' || mapStore.currentLevel === 'province'
  }
  return mapStore.currentLevel === 'county'
})

// Handle dynamic fitBounds framing when a feature is selected
watch(selectedFeature, (newFeature) => {
  if (newFeature && map() && mapReady.value) {
    const bounds = newFeature.geometry ? getBoundsFromGeometry(newFeature.geometry) : null
    if (bounds) {
      map()?.fitBounds(bounds, {
        padding: { top: 60, bottom: 200, left: 60, right: 60 },
        pitch: mapStore.currentLevel === 'country' ? 15 : 30,
        duration: 1300,
        maxZoom: 11,
      })
    } else {
      const center = extractCenter(newFeature)
      map()?.flyTo({
        center: center as [number, number],
        zoom: mapStore.currentLevel === 'country' ? 3.5 : (mapStore.currentLevel === 'province' ? 5.5 : 9),
        pitch: 30,
        duration: 1300,
      })
    }
  }
})

// Listen to route query to fly to a specific place if opened from footprint
watch(() => route.query.adcode, async (newAdcode) => {
  if (newAdcode && typeof newAdcode === 'string' && mapReady.value) {
    let place = travelStore.getPlaceByAdcode(newAdcode)
    let targetLevel: AdminLevel = place?.level || (newAdcode.length === 2 ? 'country' : (newAdcode.includes('-') ? 'province' : 'county'))

    if (mapStore.currentLevel !== targetLevel) {
      await switchLevel(targetLevel)
    }

    try {
      const geojson = await loadGeoJSON(targetLevel)
      const feature = geojson.features.find(f => extractAdcode(f) === newAdcode)
      if (feature) {
        selectedFeature.value = feature
        const bounds = feature.geometry ? getBoundsFromGeometry(feature.geometry) : null
        if (bounds) {
          map()?.fitBounds(bounds, {
            padding: { top: 60, bottom: 200, left: 60, right: 60 },
            pitch: targetLevel === 'country' ? 15 : 30,
            duration: 1400,
            maxZoom: 11,
          })
          return
        }
      }
    } catch (err) {
      console.error('Failed to fitBounds for adcode:', err)
    }
  }
}, { immediate: true })

async function addAsVisited() {
  if (!selectedFeature.value) return
  const f = selectedFeature.value
  const adcode = extractAdcode(f)
  const name = extractName(f)
  const center = extractCenter(f)

  await travelStore.addPlace({
    name,
    adcode,
    level: mapStore.currentLevel,
    type: 'visited',
    coordinates: center,
    country: f.properties?.country,
    countryCode: f.properties?.countryCode,
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
    level: mapStore.currentLevel,
    type: 'wishlist',
    coordinates: center,
    country: f.properties?.country,
    countryCode: f.properties?.countryCode,
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
  // Reset pitch when closed
  map()?.easeTo({ pitch: 0, duration: 1000 })
}

function handleSwitchLevel(level: AdminLevel) {
  switchLevel(level)
  map()?.easeTo({ pitch: 0, zoom: 4, duration: 1000 })
}
</script>

<template>
  <div class="map-view w-full h-full relative">
    <div id="map-container" class="w-full h-full"></div>

    <LevelSwitcher
      v-if="mapReady"
      @switch="handleSwitchLevel"
    />

    <StatsBar v-if="mapReady" />

    <div v-if="loading" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
      <div class="w-10 h-10 border-4 border-gray-300 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
    </div>

    <PlacePopup
      v-if="selectedFeature && mapReady"
      :name="selectedName"
      :name-en="selectedNameEn"
      :country="selectedCountry"
      :summary="selectedSummary"
      :attractions="selectedAttractions"
      :heritage="selectedHeritage"
      :experiences="selectedExperiences"
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
