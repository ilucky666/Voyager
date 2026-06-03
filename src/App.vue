<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MapView from './components/views/MapView.vue'
import FootprintView from './components/views/FootprintView.vue'
import PlanView from './components/views/PlanView.vue'
import SettingsView from './components/views/SettingsView.vue'
import { useTravelStore } from './stores/travel'
import { checkURLImport, importFromJSON, clearURLImport } from './composables/useSync'

type PanelType = 'none' | 'footprint' | 'plan' | 'settings'

const activePanel = ref<PanelType>('none')
const travelStore = useTravelStore()
const syncMessage = ref('')

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

function togglePanel(panel: PanelType) {
  activePanel.value = activePanel.value === panel ? 'none' : panel
}

const tabs: Array<{ key: PanelType; label: string; icon: string }> = [
  { key: 'none', label: '地图', icon: '🗺️' },
  { key: 'footprint', label: '足迹', icon: '📍' },
  { key: 'plan', label: '规划', icon: '✈️' },
  { key: 'settings', label: '设置', icon: '⚙️' },
]
</script>

<template>
  <div class="app-container">
    <MapView class="map-layer" />

    <Transition name="fade">
      <div v-if="syncMessage" class="sync-toast">{{ syncMessage }}</div>
    </Transition>

    <Transition name="slide">
      <div v-if="activePanel !== 'none'" class="panel-overlay">
        <div class="panel-backdrop" @click="activePanel = 'none'"></div>
        <div class="panel-content">
          <FootprintView v-if="activePanel === 'footprint'" />
          <PlanView v-else-if="activePanel === 'plan'" />
          <SettingsView v-else-if="activePanel === 'settings'" />
        </div>
      </div>
    </Transition>

    <nav class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: (tab.key === 'none' && activePanel === 'none') || activePanel === tab.key }"
        @click="tab.key === 'none' ? (activePanel = 'none') : togglePanel(tab.key)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.map-layer {
  position: absolute;
  inset: 0;
  bottom: 56px;
}

.panel-overlay {
  position: absolute;
  inset: 0;
  bottom: 56px;
  z-index: 30;
  display: flex;
  pointer-events: none;
}

.panel-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}

@media (min-width: 768px) {
  .panel-backdrop {
    display: none;
  }
}

.panel-content {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--panel-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  pointer-events: auto;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border-right: 1px solid var(--panel-border);
}

@media (max-width: 767px) {
  .panel-content {
    max-width: 100%;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.tab-bar {
  position: absolute;
  bottom: calc(16px + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  width: calc(100% - 32px);
  max-width: 400px;
  background: var(--panel-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--panel-border);
  border-radius: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
  z-index: 40;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 60px;
  height: 100%;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
}

.tab-item.active {
  color: var(--color-primary);
  transform: scale(1.05);
}

.tab-icon {
  font-size: 22px;
  line-height: 1;
}

.tab-label {
  font-weight: 500;
}

.sync-toast {
  position: absolute;
  top: calc(16px + var(--safe-top));
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  white-space: nowrap;
}
</style>
