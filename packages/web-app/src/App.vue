<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTravelStore } from './stores/travel'
import { checkURLImport, importFromJSON, clearURLImport } from './composables/useSync'
import { Map, Footprints, Plane, Settings } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import MapView from './components/views/MapView.vue'

const travelStore = useTravelStore()
const syncMessage = ref('')
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  await travelStore.loadPlaces()

  const importData = checkURLImport()
  if (importData) {
    try {
      const result = await importFromJSON(importData)
      syncMessage.value = `同步成功：${result.places} 个地点，${result.routes} 条路线`
      await travelStore.loadPlaces()
      setTimeout(() => { syncMessage.value = '' }, 4000)
    } catch {
      syncMessage.value = '同步失败：数据格式无效'
      setTimeout(() => { syncMessage.value = '' }, 4000)
    }
    clearURLImport()
  }
})

const tabs = [
  { key: 'map', path: '/', label: '地图', icon: Map },
  { key: 'footprint', path: '/footprint', label: '足迹', icon: Footprints },
  { key: 'plan', path: '/plan', label: '规划', icon: Plane },
  { key: 'settings', path: '/settings', label: '设置', icon: Settings },
]

const showTabBar = computed(() => route.meta.showTabBar !== false)
</script>

<template>
  <div class="app-container font-sans text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-black w-full h-full relative overflow-hidden">
    
    <!-- Toast for Sync -->
    <Transition name="toast">
      <div v-if="syncMessage" class="absolute top-[env(safe-area-inset-top,16px)] left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded-xl shadow-lg z-50 text-sm whitespace-nowrap">
        {{ syncMessage }}
      </div>
    </Transition>

    <div class="map-layer absolute inset-0 z-0">
      <MapView />
    </div>

    <!-- Overlay panels via Router -->
    <div class="overlay-container absolute inset-0 z-10 pointer-events-none pb-[calc(16px+env(safe-area-inset-bottom,0px)+64px)] md:pb-0 md:pl-20">
      <router-view v-slot="{ Component }">
        <transition name="fast-fade" mode="out-in">
          <div v-if="Component && route.name !== 'map'" class="pointer-events-auto w-full h-full md:w-[420px] bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-2xl border-r border-white/20 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col absolute right-0 md:left-20 md:right-auto md:h-full rounded-t-3xl md:rounded-none pt-[env(safe-area-inset-top,0px)] md:pt-0">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </div>

    <!-- Glassmorphism Navigation (Tab Bar on Mobile / Sidebar on PC) -->
    <nav v-if="showTabBar" class="tab-bar absolute z-40 bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]
      bottom-[calc(16px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 flex flex-row justify-around items-center h-16 w-[calc(100%-32px)] max-w-[400px] rounded-full
      md:top-0 md:left-0 md:bottom-0 md:translate-x-0 md:flex-col md:justify-center md:h-full md:w-20 md:max-w-none md:rounded-none md:border-r md:border-t-0 md:border-l-0 md:border-b-0 md:py-8 md:gap-8">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="router.push(tab.path)"
        class="tab-item flex flex-col items-center justify-center gap-1 transition-all duration-300 ease-out md:w-full md:h-20 w-16 h-full"
        :class="{ 'active': route.path === tab.path }"
      >
        <component :is="tab.icon" class="w-6 h-6 transition-transform duration-300 ease-out" />
        <span class="text-[10px] font-medium">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.app-container {
  /* Using tailwind classes primarily, keep minimal scoped css */
}

.tab-item {
  color: var(--color-text-secondary);
  -webkit-tap-highlight-color: transparent;
}
.tab-item.active {
  color: var(--color-primary);
}
.tab-item.active svg {
  transform: scale(1.15) translateY(-2px);
  stroke-width: 2.5;
}

/* Animations */
.fast-fade-enter-active,
.fast-fade-leave-active {
  transition: opacity 0.15s cubic-bezier(0.32, 0.72, 0, 1);
}
.fast-fade-enter-from,
.fast-fade-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
