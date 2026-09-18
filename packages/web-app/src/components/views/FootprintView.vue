<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useTravelStore } from '@/stores/travel'
import type { TravelPlace } from '@/types'
import { buildHierarchy } from '@/utils/hierarchy'
import { MapPin, CalendarDays, Navigation, ChevronDown, ChevronRight, X, Footprints, Globe } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const travelStore = useTravelStore()
const router = useRouter()
const expandedCountries = ref(new Set<string>())
const expandedProvinces = ref(new Set<string>())
const expandedCities = ref(new Set<string>())
const showTimeline = ref(false)

onMounted(() => {
  travelStore.loadPlaces()
})

const hierarchy = computed(() => {
  return buildHierarchy(travelStore.visitedPlaces)
})

const timelinePlaces = computed(() => {
  return travelStore.visitedPlaces
    .filter(p => p.visitDate)
    .sort((a, b) => b.visitDate!.localeCompare(a.visitDate!))
})

function toggleCountry(code: string) {
  if (expandedCountries.value.has(code)) {
    expandedCountries.value.delete(code)
  } else {
    expandedCountries.value.add(code)
  }
}

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

function flyToPlace(adcode: string) {
  router.push({ path: '/', query: { adcode } })
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-5 py-4 flex items-center justify-between flex-shrink-0">
      <h1 class="text-[28px] font-bold tracking-tight">我的足迹</h1>
      <div class="flex gap-1.5 flex-wrap">
        <span class="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400">{{ travelStore.visitedByLevel.country }} 国</span>
        <span class="px-2.5 py-1 bg-gray-200 dark:bg-gray-800 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300">{{ travelStore.visitedByLevel.province }} 省/州</span>
        <span class="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-xs font-semibold text-green-600 dark:text-green-400">{{ travelStore.visitedPlaces.length }} 地</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="px-4 pb-3 flex gap-2 flex-shrink-0">
      <button class="flex-1 py-2 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-2"
        :class="!showTimeline ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'bg-transparent text-gray-500 hover:bg-black/5'"
        @click="showTimeline = false">
        <Globe class="w-4 h-4" />
        按国家地区
      </button>
      <button class="flex-1 py-2 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-2"
        :class="showTimeline ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'bg-transparent text-gray-500 hover:bg-black/5'"
        @click="showTimeline = true">
        <CalendarDays class="w-4 h-4" />
        时间线
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-[calc(80px+env(safe-area-inset-bottom,0px))] md:pb-6 scroll-smooth iOS-scroll">
      <div v-if="travelStore.visitedPlaces.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
        <Footprints class="w-16 h-16 mb-4 opacity-50" />
        <p class="font-medium text-[15px]">暂无足迹</p>
        <p class="text-xs mt-2 opacity-70">在地图上标记你去过的地方吧</p>
      </div>

      <template v-else-if="!showTimeline">
        <div v-for="country in hierarchy" :key="country.code" class="mb-3">
          <!-- Country Row -->
          <div class="flex items-center gap-2 px-3 py-3 bg-gray-100 dark:bg-[#2c2c2e] rounded-xl cursor-pointer hover:shadow-sm transition-all" @click="toggleCountry(country.code)">
            <component :is="expandedCountries.has(country.code) ? ChevronDown : ChevronRight" class="w-4 h-4 text-gray-400" />
            <Globe class="w-4 h-4 text-blue-500" />
            <span class="flex-1 font-bold text-[16px]">{{ country.name }}</span>
            <button class="p-1 hover:text-blue-500 rounded transition-colors" title="定位国家" @click.stop="flyToPlace(country.code)">
              <Navigation class="w-3.5 h-3.5 text-gray-400" />
            </button>
            <span class="text-xs font-bold bg-blue-500/10 px-2.5 py-0.5 rounded-full text-blue-500">{{ country.totalCount }}</span>
          </div>

          <!-- Country Children (Provinces/States & Direct Places) -->
          <div v-show="expandedCountries.has(country.code)" class="pl-3 ml-3 border-l-2 border-blue-500/20 mt-1 mb-2">
            
            <!-- Direct Country-level Places -->
            <template v-for="place in country.directPlaces" :key="place.id">
              <div class="group flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" @click="flyToPlace(place.adcode)">
                <div class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                <span class="flex-1 text-[14px] font-semibold">{{ place.name }}</span>
                <button class="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all" @click.stop="removePlace(place.id)">
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </template>

            <!-- Provinces/States -->
            <div v-for="prov in country.provinces" :key="prov.prefix" class="mb-1 mt-1">
              <div class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-black/20 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" @click="toggleProvince(prov.prefix)">
                <component :is="expandedProvinces.has(prov.prefix) ? ChevronDown : ChevronRight" class="w-3.5 h-3.5 text-gray-400" />
                <span class="flex-1 font-medium text-[14px]">{{ prov.name }}</span>
                <button class="p-1 hover:text-blue-500 rounded transition-colors" title="定位省/州" @click.stop="flyToPlace(prov.prefix)">
                  <Navigation class="w-3 h-3 text-gray-400" />
                </button>
                <span class="text-[11px] text-gray-400">{{ prov.totalCount }}</span>
              </div>

              <!-- Cities/Counties under Province -->
              <div v-show="expandedProvinces.has(prov.prefix)" class="pl-4 border-l border-gray-200 dark:border-gray-800 ml-3.5 mt-1 mb-2">
                
                <!-- City Groups -->
                <div v-for="city in prov.cities" :key="city.prefix" class="mb-1">
                  <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" @click="toggleCity(city.prefix)">
                    <component :is="expandedCities.has(city.prefix) ? ChevronDown : ChevronRight" class="w-3 h-3 text-gray-400" />
                    <span class="flex-1 text-[13px]">{{ city.name }}</span>
                    <span class="text-[10px] text-gray-400">{{ city.places.length }}</span>
                  </div>

                  <div v-show="expandedCities.has(city.prefix)" class="pl-4 border-l border-gray-100 dark:border-gray-800 ml-3 mt-1 mb-1">
                    <template v-for="place in city.places" :key="place.id">
                      <div class="group flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" @click="flyToPlace(place.adcode)">
                        <div class="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                        <span class="flex-1 text-[13px]">{{ place.name }}</span>
                        <span v-if="place.visitDate" class="text-[10px] text-gray-400">{{ formatDate(place.visitDate) }}</span>
                        <button class="w-5 h-5 flex items-center justify-center rounded text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all" @click.stop="removePlace(place.id)">
                          <X class="w-3 h-3" />
                        </button>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Direct Province Places -->
                <template v-for="place in prov.directPlaces" :key="place.id">
                  <div class="group flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" @click="flyToPlace(place.adcode)">
                    <div class="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span class="flex-1 text-[13px]">{{ place.name }}</span>
                    <span v-if="place.visitDate" class="text-[10px] text-gray-400">{{ formatDate(place.visitDate) }}</span>
                    <button class="w-5 h-5 flex items-center justify-center rounded text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all" @click.stop="removePlace(place.id)">
                      <X class="w-3 h-3" />
                    </button>
                  </div>
                </template>

              </div>
            </div>

          </div>
        </div>
      </template>

      <!-- Timeline View -->
      <template v-else>
        <div v-if="timelinePlaces.length === 0" class="text-center py-10 text-[13px] text-gray-400">
          暂无标注日期的足迹，前往地图添加吧
        </div>
        <div v-else class="relative pl-3 mt-2 border-l-2 border-gray-200 dark:border-gray-700/50">
          <template v-for="place in timelinePlaces" :key="place.id">
            <div class="group relative flex items-center gap-3 py-3 pl-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-r-xl transition-colors cursor-pointer -ml-[2px]" @click="flyToPlace(place.adcode)">
              <div class="absolute left-[-5px] w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-[#1c1c1e]"></div>
              
              <div class="flex-1 flex flex-col justify-center">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-[15px]">{{ place.name }}</span>
                  <span v-if="place.country" class="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-300 font-normal">{{ place.country }}</span>
                </div>
                <span class="text-[11px] text-gray-400 mt-0.5">{{ formatDate(place.visitDate!) }}</span>
              </div>
              <button class="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all mr-2" @click.stop="removePlace(place.id)">
                <X class="w-4 h-4" />
              </button>
            </div>
            <div v-if="place.note" class="ml-4 mb-4 mt-1 px-3 py-2 bg-gray-50 dark:bg-black/20 rounded-xl text-xs text-gray-500 max-w-sm">
              {{ place.note }}
            </div>
          </template>
        </div>
      </template>

    </div>
  </div>
</template>
