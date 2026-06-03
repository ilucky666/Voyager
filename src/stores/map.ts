import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdminLevel } from '@/types'

export const useMapStore = defineStore('map', () => {
  const currentLevel = ref<AdminLevel>('province')
  const darkMode = ref(false)

  function setLevel(level: AdminLevel) {
    currentLevel.value = level
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    document.documentElement.classList.toggle('dark', darkMode.value)
  }

  return {
    currentLevel,
    darkMode,
    setLevel,
    toggleDarkMode,
  }
})
