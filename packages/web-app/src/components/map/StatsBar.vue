<script setup lang="ts">
import { useTravelStore } from '@/stores/travel'

const travelStore = useTravelStore()
</script>

<template>
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-dot visited"></span>
      <span class="stat-text">已去 {{ travelStore.visitedPlaces.length }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-dot wishlist"></span>
      <span class="stat-text">想去 {{ travelStore.wishlistPlaces.length }}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-text">国 {{ travelStore.visitedByLevel.country }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-text">省 {{ travelStore.visitedByLevel.province }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-text">市 {{ travelStore.visitedByLevel.city }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-text">县 {{ travelStore.visitedByLevel.county }}</span>
    </div>
  </div>
</template>

<style scoped>
.stats-bar {
  position: absolute;
  top: calc(12px + var(--safe-top));
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-dot.visited {
  background: var(--color-visited);
}

.stat-dot.wishlist {
  background: var(--color-wishlist);
}

.stat-text {
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.stat-divider {
  width: 1px;
  height: 14px;
  background: var(--color-border);
}
</style>
