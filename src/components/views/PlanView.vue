<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useTravelStore } from '@/stores/travel'
import { db } from '@/db'
import type { TravelPlace, RoutePlan } from '@/types'

const travelStore = useTravelStore()
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
</script>

<template>
  <div class="plan-view">
    <div class="plan-header">
      <h1 class="plan-title">旅行规划</h1>
      <span class="plan-count">{{ wishlistPlaces.length }} 个想去</span>
    </div>

    <div class="plan-content">
      <div v-if="wishlistPlaces.length === 0 && routes.length === 0" class="empty-state">
        <div class="empty-icon">✈️</div>
        <p>暂无规划</p>
        <p class="empty-hint">在地图上标记你想去的地方</p>
      </div>

      <template v-else>
        <section v-if="wishlistPlaces.length > 0" class="plan-section">
          <h2 class="section-title">想去的地方</h2>
          <div class="wish-list">
            <div v-for="place in wishlistPlaces" :key="place.id" class="wish-card">
              <div class="wish-color"></div>
              <div class="wish-info">
                <span class="wish-name">{{ place.name }}</span>
                <span class="wish-code">{{ place.adcode }}</span>
              </div>
              <div class="wish-actions">
                <button class="wish-btn" @click="toggleType(place.id)" title="标记为已去">✓</button>
                <button
                  v-if="routes.length > 0"
                  class="wish-btn"
                  @click="editingRoute = editingRoute === place.id ? null : place.id"
                  title="添加到路线"
                >+</button>
                <button class="wish-btn danger" @click="removePlace(place.id)" title="删除">✕</button>
              </div>
              <div v-if="editingRoute === place.id" class="route-picker">
                <div v-for="route in routes" :key="route.id" class="route-pick-item">
                  <span class="route-pick-name">{{ route.name }}</span>
                  <button
                    v-if="!route.placeIds.includes(place.id)"
                    class="route-pick-btn"
                    @click="addToRoute(route.id, place.id); editingRoute = null"
                  >添加</button>
                  <span v-else class="route-pick-added">已添加</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="plan-section">
          <div class="section-header">
            <h2 class="section-title">路线规划</h2>
            <button class="add-route-btn" @click="routeInputVisible = !routeInputVisible">
              {{ routeInputVisible ? '取消' : '+ 新路线' }}
            </button>
          </div>

          <div v-if="routeInputVisible" class="route-input-row">
            <input
              v-model="newRouteName"
              type="text"
              placeholder="路线名称..."
              class="route-input"
              @keyup.enter="createRoute"
            />
            <button class="route-confirm-btn" @click="createRoute">创建</button>
          </div>

          <div v-if="routes.length === 0" class="route-empty">
            创建路线来规划你的旅行行程
          </div>

          <div v-for="route in routes" :key="route.id" class="route-card">
            <div class="route-header">
              <span class="route-name">{{ route.name }}</span>
              <button class="route-del-btn" @click="deleteRoute(route.id)">✕</button>
            </div>

            <div v-if="route.placeIds.length === 0" class="route-empty-hint">
              从上方"想去"列表添加地点
            </div>

            <div v-else class="route-stops">
              <div v-for="(pid, idx) in route.placeIds" :key="pid" class="route-stop">
                <div class="stop-connector">
                  <div class="stop-dot"></div>
                  <div v-if="idx < route.placeIds.length - 1" class="stop-line"></div>
                </div>
                <div class="stop-info">
                  <span class="stop-name">{{ getPlaceById(pid)?.name || '未知' }}</span>
                  <span class="stop-order">第{{ idx + 1 }}站</span>
                </div>
                <button class="stop-remove" @click="removeFromRoute(route.id, pid)">✕</button>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.plan-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: var(--safe-top);
}

.plan-header {
  padding: 16px 16px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-title {
  font-size: 22px;
  font-weight: 700;
}

.plan-count {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.plan-content {
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
}

.plan-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.add-route-btn {
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  font-size: 12px;
  color: var(--color-primary);
  cursor: pointer;
}

.wish-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wish-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  flex-wrap: wrap;
}

.wish-color {
  width: 4px;
  height: 28px;
  border-radius: 2px;
  background: var(--color-wishlist);
  flex-shrink: 0;
}

.wish-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.wish-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wish-code {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.wish-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.wish-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.wish-btn:hover {
  background: var(--color-border);
}

.wish-btn.danger:hover {
  background: rgba(234, 67, 53, 0.1);
  color: #ea4335;
}

.route-picker {
  width: 100%;
  padding: 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  margin-top: 4px;
}

.route-pick-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.route-pick-name {
  font-size: 13px;
}

.route-pick-btn {
  padding: 2px 10px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background: transparent;
  font-size: 12px;
  color: var(--color-primary);
  cursor: pointer;
}

.route-pick-added {
  font-size: 12px;
  color: var(--color-visited);
}

.route-input-row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.route-input {
  flex: 1;
}

.route-confirm-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  background: var(--color-primary);
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.route-empty {
  text-align: center;
  padding: 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.route-empty-hint {
  padding: 8px 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.route-card {
  background: var(--color-bg-secondary);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 8px;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.route-name {
  font-weight: 600;
  font-size: 15px;
}

.route-del-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 12px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.route-del-btn:hover {
  background: rgba(234, 67, 53, 0.1);
  color: #ea4335;
}

.route-stops {
  padding-left: 4px;
}

.route-stop {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.stop-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
  flex-shrink: 0;
}

.stop-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-wishlist);
  flex-shrink: 0;
}

.stop-line {
  width: 2px;
  height: 16px;
  background: var(--color-border);
}

.stop-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stop-name {
  font-size: 13px;
  font-weight: 500;
}

.stop-order {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.stop-remove {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 10px;
  cursor: pointer;
  color: var(--color-text-secondary);
  opacity: 0;
  transition: opacity 0.15s;
}

.route-stop:hover .stop-remove {
  opacity: 1;
}

.stop-remove:hover {
  color: #ea4335;
}
</style>
