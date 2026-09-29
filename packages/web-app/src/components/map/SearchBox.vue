<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Loader2, MapPin } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { loadGeoJSON, extractAdcode, extractName } from '@/composables/useGeoJSON'
import type { AdminLevel } from '@/types'

const router = useRouter()
const query = ref('')
const isOpen = ref(false)
const isLoading = ref(true)

interface SearchItem {
  adcode: string
  name: string
  nameEn: string
  level: AdminLevel
  searchText: string
}

const searchIndex = ref<SearchItem[]>([])

onMounted(async () => {
  try {
    // Load country, province and city data
    const [countries, provinces, cities] = await Promise.all([
      loadGeoJSON('country'),
      loadGeoJSON('province'),
      loadGeoJSON('city')
    ])

    const items: SearchItem[] = []

    const provinceNameMap = new Map<string, string>()
    provinces.features.forEach(f => {
      const code = extractAdcode(f)
      const name = extractName(f)
      if (code && name) provinceNameMap.set(code, name)
    })

    countries.features.forEach(f => {
      const name = extractName(f)
      const nameEn = String(f.properties?.name_en || '')
      const adcode = extractAdcode(f)
      if (name && adcode) {
        items.push({
          adcode,
          name,
          nameEn,
          level: 'country',
          searchText: `${name} ${nameEn}`.toLowerCase()
        })
      }
    })

    provinces.features.forEach(f => {
      const name = extractName(f)
      const nameEn = String(f.properties?.name_en || '')
      const adcode = extractAdcode(f)
      const country = String(f.properties?.country || '')
      if (name && adcode) {
        items.push({
          adcode,
          name: country ? `${name} (${country})` : name,
          nameEn,
          level: 'province',
          searchText: `${name} ${nameEn} ${country}`.toLowerCase()
        })
      }
    })

    cities.features.forEach(f => {
      const name = extractName(f)
      const nameEn = String(f.properties?.name_en || '')
      const adcode = extractAdcode(f)
      const parentCode = String(f.properties?.parent?.adcode || '')
      const parentProvince = parentCode ? provinceNameMap.get(parentCode) : ''
      const isDirectAdmin = ['110000', '120000', '310000', '500000', '810000', '820000', '710000'].includes(adcode)
      const isSelfParent = isDirectAdmin || !parentProvince || parentProvince === name || name.startsWith(parentProvince)
      if (name && adcode) {
        items.push({
          adcode,
          name: isSelfParent ? name : `${name} (${parentProvince})`,
          nameEn,
          level: 'city',
          searchText: `${name} ${nameEn} ${parentProvince}`.toLowerCase()
        })
      }
    })

    searchIndex.value = items
  } catch (e) {
    console.error('Failed to build search index', e)
  } finally {
    isLoading.value = false
  }
})

// Simple fuzzy matching (checks if all characters in query exist in text in order)
function fuzzyMatch(pattern: string, text: string): boolean {
  if (!pattern) return true
  let pIdx = 0
  let tIdx = 0
  const p = pattern.toLowerCase().replace(/\s/g, '')
  const t = text.toLowerCase()
  
  while (pIdx < p.length && tIdx < t.length) {
    if (p[pIdx] === t[tIdx]) {
      pIdx++
    }
    tIdx++
  }
  return pIdx === p.length
}

const results = computed(() => {
  if (!query.value.trim()) return []
  const searchTerm = query.value.trim()
  
  // First try direct includes match for better relevance
  let matches = searchIndex.value.filter(item => item.searchText.includes(searchTerm.toLowerCase()))
  
  // If too few direct matches, fallback to fuzzy
  if (matches.length < 5) {
    const fuzzyMatches = searchIndex.value.filter(item => 
      !matches.includes(item) && fuzzyMatch(searchTerm, item.searchText)
    )
    matches = [...matches, ...fuzzyMatches]
  }

  return matches.slice(0, 10)
})

function onSelect(item: SearchItem) {
  isOpen.value = false
  query.value = ''
  // Push path '/' and adcode + level to route, which will trigger MapView to load and fly to the place, and hide the plan overlay
  router.push({ path: '/', query: { adcode: item.adcode, level: item.level } })
}
</script>

<template>
  <div class="relative z-30 w-full font-sans">
    <div class="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-300 flex items-center px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/50">
      <Search v-if="!isLoading" class="w-5 h-5 text-slate-400 flex-shrink-0" />
      <Loader2 v-else class="w-5 h-5 text-slate-400 animate-spin flex-shrink-0" />
      <input 
        v-model="query"
        @focus="isOpen = true"
        type="text" 
        placeholder="搜索国家、省份或城市..."
        class="flex-1 bg-transparent border-none outline-none px-3 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400"
      />
    </div>

    <!-- Dropdown Results -->
    <div 
      v-if="isOpen && query.trim() && results.length > 0"
      class="absolute top-full mt-2 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-h-80 overflow-y-auto py-2"
    >
      <div 
        v-for="item in results" 
        :key="item.adcode"
        @click="onSelect(item)"
        class="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col gap-0.5 transition-colors"
      >
        <div class="flex items-center gap-2">
          <MapPin class="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span class="text-sm font-black text-slate-900 dark:text-slate-50 truncate">{{ item.name }}</span>
          <span class="ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 flex-shrink-0">
            {{ item.level === 'country' ? '国家' : (item.level === 'province' ? '省级' : '城市') }}
          </span>
        </div>
        <div class="flex items-center gap-2 pl-5">
          <span class="text-[10px] font-bold text-slate-500">{{ item.adcode }}</span>
          <span v-if="item.nameEn" class="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">{{ item.nameEn }}</span>
        </div>
      </div>
    </div>
    
    <!-- No Results -->
    <div 
      v-else-if="isOpen && query.trim() && results.length === 0 && !isLoading"
      class="absolute top-full mt-2 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl px-4 py-6 text-center"
    >
      <p class="text-xs font-semibold text-slate-500">未找到相关结果</p>
    </div>
  </div>

  <!-- Click outside overlay -->
  <div v-if="isOpen" class="fixed inset-0 z-20" @click="isOpen = false"></div>
</template>
