<script setup lang="ts">
import { useMapStore } from '@/stores/map'
import type { AdminLevel } from '@/types'

const mapStore = useMapStore()

const emit = defineEmits<{
  switch: [level: AdminLevel]
}>()

const levels: Array<{ value: AdminLevel; label: string }> = [
  { value: 'country', label: '国' },
  { value: 'province', label: '省' },
  { value: 'city', label: '市' },
  { value: 'county', label: '县' },
]
</script>

<template>
  <div class="level-switcher">
    <button
      v-for="lv in levels"
      :key="lv.value"
      class="level-btn"
      :class="{ active: mapStore.currentLevel === lv.value }"
      @click="emit('switch', lv.value)"
    >
      {{ lv.label }}
    </button>
  </div>
</template>

<style scoped>
.level-switcher {
  position: absolute;
  top: calc(12px + var(--safe-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 3px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.level-btn {
  padding: 6px 20px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-secondary);
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.level-btn:hover {
  color: var(--color-text);
}

.level-btn.active {
  background: var(--color-primary);
  color: white;
}
</style>
