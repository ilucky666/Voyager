<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useTravelStore } from '@/stores/travel'
import { buildHierarchy } from '@/utils/hierarchy'
import { db } from '@/db'
import type { TravelPlace, RoutePlan } from '@/types'
import { Plane, MapPin, Check, Plus, X, Trash2, Map, Navigation, Globe, ChevronDown, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import SearchBox from '../map/SearchBox.vue'

const travelStore = useTravelStore()
const router = useRouter()
const editingRoute = ref<string | null>(null)
const newRouteName = ref('')
const routes = ref<RoutePlan[]>([])
const routeInputVisible = ref(false)
const routesLoaded = ref(false)

onMounted(async () => {
  await travelStore.loadPlaces()
  await loadRoutes()
})

async function loadRoutes() {
  if (routesLoaded.value && routes.value.length > 0) return
  try {
    routes.value = await db.routes.toArray()
    routesLoaded.value = true
  } catch {
    routes.value = []
  }
}

async function saveRoute(route: RoutePlan) {
  await db.routes.put(route)
}

async function createRoute() {
  if (!newRouteName.value.trim()) return
  const route: RoutePlan = {
    id: crypto.randomUUID(),
    name: newRouteName.value.trim(),
    placeIds: [],
    createdAt: new Date().toISOString(),
  }
  routes.value.push(route)
  await saveRoute(route)
  newRouteName.value = ''
  routeInputVisible.value = false
}

async function deleteRoute(id: string) {
  routes.value = routes.value.filter(r => r.id !== id)
  await db.routes.delete(id)
}

async function addToRoute(routeId: string, placeId: string) {
  const route = routes.value.find(r => r.id === routeId)
  if (!route || route.placeIds.includes(placeId)) return
  route.placeIds.push(placeId)
  await saveRoute(route)
}

async function removeFromRoute(routeId: string, placeId: string) {
  const route = routes.value.find(r => r.id === routeId)
  if (!route) return
  route.placeIds = route.placeIds.filter(id => id !== placeId)
  await saveRoute(route)
}

function getPlaceById(id: string): TravelPlace | undefined {
  return travelStore.places.find(p => p.id === id)
}

const wishlistPlaces = computed(() => travelStore.wishlistPlaces)

const expandedCountries = ref(new Set<string>())
const expandedProvinces = ref(new Set<string>())
const expandedCities = ref(new Set<string>())

function toggleCountry(code: string) {
  if (expandedCountries.value.has(code)) expandedCountries.value.delete(code)
  else expandedCountries.value.add(code)
}
function toggleProvince(prefix: string) {
  if (expandedProvinces.value.has(prefix)) expandedProvinces.value.delete(prefix)
  else expandedProvinces.value.add(prefix)
}
function toggleCity(prefix: string) {
  if (expandedCities.value.has(prefix)) expandedCities.value.delete(prefix)
  else expandedCities.value.add(prefix)
}

const wishlistHierarchy = computed(() => buildHierarchy(travelStore.wishlistPlaces))


async function removePlace(id: string) {
  await travelStore.removePlace(id)
  for (const route of routes.value) {
    const newPlaceIds = route.placeIds.filter(pid => pid !== id)
    if (newPlaceIds.length !== route.placeIds.length) {
      route.placeIds = newPlaceIds
      await saveRoute(route)
    }
  }
}

async function toggleType(id: string) {
  await travelStore.togglePlaceType(id)
}

function flyToPlace(adcode: string) {
  router.push({ path: '/', query: { adcode } })
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="px-5 py-4 flex items-center justify-between flex-shrink-0">
      <h1 class="text-[28px] font-bold tracking-tight">旅行规划</h1>
      <span class="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs font-semibold text-orange-600 dark:text-orange-400">{{ wishlistPlaces.length }} 想去</span>
    </div>

    <div class="px-4 pb-4 flex-shrink-0">
      <SearchBox />
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-[calc(80px+env(safe-area-inset-bottom,0px))] md:pb-6 scroll-smooth iOS-scroll">
      <div v-if="wishlistPlaces.length === 0 && routes.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
        <Plane class="w-16 h-16 mb-4 opacity-50" />
        <p class="font-medium text-[15px]">暂无规划</p>
        <p class="text-xs mt-2 opacity-70">在地图上标记你想去的地方</p>
      </div>

      <template v-else>
        <!-- Wishlist -->
        <section v-if="wishlistPlaces.length > 0" class="mb-8">
          <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-1">心愿单</h2>
          
          <div v-for="country in wishlistHierarchy" :key="country.code" class="mb-3">
            <!-- Country Row -->
            <div class="flex items-center gap-2 px-3 py-3 bg-white dark:bg-[#2c2c2e] rounded-xl cursor-pointer hover:shadow-sm shadow-sm transition-all" @click="toggleCountry(country.code)">
              <component :is="expandedCountries.has(country.code) ? ChevronDown : ChevronRight" class="w-4 h-4 text-gray-400" />
              <Globe class="w-4 h-4 text-orange-500" />
              <span class="flex-1 font-bold text-[16px]">{{ country.name }}</span>
              <button class="p-1 hover:text-orange-500 rounded transition-colors" title="定位国家" @click.stop="flyToPlace(country.code)">
                <Navigation class="w-3.5 h-3.5 text-gray-400" />
              </button>
              <span class="text-xs font-bold bg-orange-500/10 px-2.5 py-0.5 rounded-full text-orange-500">{{ country.totalCount }}</span>
            </div>

            <!-- Country Children -->
            <div v-show="expandedCountries.has(country.code)" class="pl-3 ml-3 border-l-2 border-orange-500/20 mt-1 mb-2">
              
              <!-- Direct Country-level Places -->
              <template v-for="place in country.directPlaces" :key="place.id">
                <div class="group flex flex-wrap items-center gap-2 px-3 py-2 mt-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm bg-white dark:bg-[#2c2c2e]">
                  <div class="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                  
                  <div class="flex-1 min-w-0 flex flex-col cursor-pointer" @click="flyToPlace(place.adcode)">
                    <span class="font-semibold text-[14px] truncate">{{ place.name }}</span>
                    <span class="text-[10px] text-gray-400 truncate mt-0.5">{{ place.adcode }}</span>
                  </div>
                  
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <button class="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-green-100 hover:text-green-500 transition-all" @click="toggleType(place.id)" title="标记为已去">
                      <Check class="w-3.5 h-3.5" />
                    </button>
                    <button v-if="routes.length > 0" class="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-blue-100 hover:text-blue-500 transition-all" @click="editingRoute = editingRoute === place.id ? null : place.id" title="添加到路线">
                      <Plus class="w-3.5 h-3.5" />
                    </button>
                    <button class="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-red-100 hover:text-red-500 transition-all" @click="removePlace(place.id)" title="删除">
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <Transition name="fade">
                    <div v-if="editingRoute === place.id" class="w-full mt-1 pt-1 border-t border-gray-100 dark:border-gray-700/50 flex flex-col gap-1">
                      <div v-for="route in routes" :key="route.id" class="flex items-center justify-between py-1 px-1">
                        <span class="text-[12px] font-medium">{{ route.name }}</span>
                        <button v-if="!route.placeIds.includes(place.id)" class="px-2 py-0.5 bg-blue-50 text-blue-500 rounded text-[10px] font-bold" @click="addToRoute(route.id, place.id); editingRoute = null">添加</button>
                        <span v-else class="text-[10px] font-bold text-green-500 px-1">已添加</span>
                      </div>
                    </div>
                  </Transition>
                </div>
              </template>

              <!-- Provinces/States -->
              <div v-for="prov in country.provinces" :key="prov.prefix" class="mb-1 mt-1">
                <div class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#2c2c2e] rounded-lg cursor-pointer hover:shadow-sm shadow-sm transition-all" @click="toggleProvince(prov.prefix)">
                  <component :is="expandedProvinces.has(prov.prefix) ? ChevronDown : ChevronRight" class="w-3.5 h-3.5 text-gray-400" />
                  <span class="flex-1 font-medium text-[14px]">{{ prov.name }}</span>
                  <button class="p-1 hover:text-orange-500 rounded transition-colors" title="定位省/州" @click.stop="flyToPlace(prov.prefix)">
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
                        <div class="group flex flex-wrap items-center gap-2 px-3 py-1.5 mt-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors bg-gray-50 dark:bg-black/20">
                          <div class="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                          
                          <div class="flex-1 min-w-0 flex flex-col cursor-pointer" @click="flyToPlace(place.adcode)">
                            <span class="font-medium text-[13px] truncate">{{ place.name }}</span>
                          </div>
                          
                          <div class="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="w-6 h-6 flex items-center justify-center rounded hover:bg-green-100 hover:text-green-500 text-gray-400 transition-all" @click="toggleType(place.id)" title="标记为已去">
                              <Check class="w-3 h-3" />
                            </button>
                            <button v-if="routes.length > 0" class="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-100 hover:text-blue-500 text-gray-400 transition-all" @click="editingRoute = editingRoute === place.id ? null : place.id" title="添加到路线">
                              <Plus class="w-3 h-3" />
                            </button>
                            <button class="w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 hover:text-red-500 text-gray-400 transition-all" @click="removePlace(place.id)" title="删除">
                              <X class="w-3 h-3" />
                            </button>
                          </div>
                          
                          <Transition name="fade">
                            <div v-if="editingRoute === place.id" class="w-full mt-1 pt-1 border-t border-gray-200 dark:border-gray-700/50 flex flex-col gap-1">
                              <div v-for="route in routes" :key="route.id" class="flex items-center justify-between py-1 px-1">
                                <span class="text-[11px] font-medium">{{ route.name }}</span>
                                <button v-if="!route.placeIds.includes(place.id)" class="px-2 py-0.5 bg-blue-50 text-blue-500 rounded text-[9px] font-bold" @click="addToRoute(route.id, place.id); editingRoute = null">添加</button>
                                <span v-else class="text-[9px] font-bold text-green-500 px-1">已添加</span>
                              </div>
                            </div>
                          </Transition>
                        </div>
                      </template>
                    </div>
                  </div>

                  <!-- Direct Province Places -->
                  <template v-for="place in prov.directPlaces" :key="place.id">
                    <div class="group flex flex-wrap items-center gap-2 px-3 py-1.5 mt-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors bg-gray-50 dark:bg-black/20">
                      <div class="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                      
                      <div class="flex-1 min-w-0 flex flex-col cursor-pointer" @click="flyToPlace(place.adcode)">
                        <span class="font-medium text-[13px] truncate">{{ place.name }}</span>
                      </div>
                      
                      <div class="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="w-6 h-6 flex items-center justify-center rounded hover:bg-green-100 hover:text-green-500 text-gray-400 transition-all" @click="toggleType(place.id)" title="标记为已去">
                          <Check class="w-3 h-3" />
                        </button>
                        <button v-if="routes.length > 0" class="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-100 hover:text-blue-500 text-gray-400 transition-all" @click="editingRoute = editingRoute === place.id ? null : place.id" title="添加到路线">
                          <Plus class="w-3 h-3" />
                        </button>
                        <button class="w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 hover:text-red-500 text-gray-400 transition-all" @click="removePlace(place.id)" title="删除">
                          <X class="w-3 h-3" />
                        </button>
                      </div>
                      
                      <Transition name="fade">
                        <div v-if="editingRoute === place.id" class="w-full mt-1 pt-1 border-t border-gray-200 dark:border-gray-700/50 flex flex-col gap-1">
                          <div v-for="route in routes" :key="route.id" class="flex items-center justify-between py-1 px-1">
                            <span class="text-[11px] font-medium">{{ route.name }}</span>
                            <button v-if="!route.placeIds.includes(place.id)" class="px-2 py-0.5 bg-blue-50 text-blue-500 rounded text-[9px] font-bold" @click="addToRoute(route.id, place.id); editingRoute = null">添加</button>
                            <span v-else class="text-[9px] font-bold text-green-500 px-1">已添加</span>
                          </div>
                        </div>
                      </Transition>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Routes -->
        <section class="mb-8">
          <div class="flex items-center justify-between mb-3 pl-1 pr-1">
            <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider">我的路线</h2>
            <button class="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1" @click="routeInputVisible = !routeInputVisible">
              <component :is="routeInputVisible ? X : Plus" class="w-3.5 h-3.5" />
              {{ routeInputVisible ? '取消' : '新路线' }}
            </button>
          </div>

          <Transition name="fade">
            <div v-if="routeInputVisible" class="flex items-center gap-2 mb-4 bg-white dark:bg-[#2c2c2e] p-2 rounded-xl shadow-sm">
              <input v-model="newRouteName" type="text" placeholder="路线名称..." class="flex-1 bg-transparent border-none text-[14px] px-2 py-1 focus:ring-0 shadow-none !bg-transparent" @keyup.enter="createRoute" />
              <button class="px-4 py-2 bg-blue-500 text-white rounded-lg text-[13px] font-semibold flex-shrink-0 shadow-sm" @click="createRoute">创建</button>
            </div>
          </Transition>

          <div v-if="routes.length === 0 && !routeInputVisible" class="text-center py-6 text-gray-400 text-[13px]">
            点击右上角创建新路线
          </div>

          <div class="flex flex-col gap-4">
            <div v-for="route in routes" :key="route.id" class="bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl p-4 shadow-sm relative group">
              <div class="flex items-center justify-between mb-3">
                <span class="font-bold text-[16px]">{{ route.name }}</span>
                <button class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100" @click="deleteRoute(route.id)">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>

              <div v-if="route.placeIds.length === 0" class="text-[12px] text-gray-500 italic py-2">
                还没有地点，从心愿单添加吧
              </div>

              <div v-else class="flex flex-col pl-2 mt-2">
                <div v-for="(pid, idx) in route.placeIds" :key="pid" class="flex items-start gap-3 relative pb-3 group/stop cursor-pointer" @click="flyToPlace(getPlaceById(pid)?.adcode || '')">
                  <!-- Connector Line -->
                  <div class="flex flex-col items-center justify-center w-5 flex-shrink-0 z-10 pt-1.5">
                    <div class="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-[#2c2c2e]"></div>
                    <div v-if="idx < route.placeIds.length - 1" class="w-[2px] h-full bg-gray-200 dark:bg-gray-700 mt-1 absolute top-3 bottom-[-4px]"></div>
                  </div>
                  
                  <!-- Info -->
                  <div class="flex-1 flex items-center justify-between bg-white dark:bg-black/20 p-2.5 rounded-xl shadow-sm group-hover/stop:shadow-md transition-shadow">
                    <div class="flex flex-col min-w-0">
                      <span class="font-semibold text-[14px] truncate">{{ getPlaceById(pid)?.name || '未知地点' }}</span>
                      <span class="text-[10px] font-bold text-blue-500 mt-0.5">第 {{ idx + 1 }} 站</span>
                    </div>
                    <button class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-500 transition-all opacity-0 group-hover/stop:opacity-100" @click.stop="removeFromRoute(route.id, pid)">
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
