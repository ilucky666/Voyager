<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { path: '/', label: '地图', icon: '🗺️' },
  { path: '/list', label: '列表', icon: '📋' },
  { path: '/timeline', label: '时间线', icon: '📅' },
  { path: '/settings', label: '设置', icon: '⚙️' },
]
</script>

<template>
  <nav class="tab-bar">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tab-item"
      :class="{ active: route.path === tab.path }"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding-bottom: var(--safe-bottom);
  flex-shrink: 0;
  z-index: 20;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 16px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 11px;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.tab-item.active {
  color: var(--color-primary);
}

.tab-icon {
  font-size: 20px;
  line-height: 1;
}

.tab-label {
  font-weight: 500;
}
</style>
