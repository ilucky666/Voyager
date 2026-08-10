<script setup lang="ts">
import type { TravelPlace, AdminLevel } from '@/types'
import type { UNESCOHeritageItem } from '@/composables/usePlaceDetails'

import { ref, watch, computed, onMounted, onUnmounted, type CSSProperties } from 'vue'
import { useTravelStore } from '@/stores/travel'
import { Sparkles, Landmark, Compass, Calendar, FileText, Check, Star, Trash2, Edit3, X } from 'lucide-vue-next'

const props = defineProps<{
  name: string
  nameEn?: string
  country?: string
  summary?: string
  attractions?: string[]
  heritage?: (string | UNESCOHeritageItem)[]
  experiences?: string[]
  adcode: string
  existingPlace: TravelPlace | null | undefined
  isCountyLevel: boolean
  currentLevel: AdminLevel
}>()

const emit = defineEmits<{
  addVisited: []
  addWishlist: []
  remove: []
  toggleType: []
  close: []
}>()

const travelStore = useTravelStore()

const levelLabels: Record<AdminLevel, string> = {
  country: '国家/地区',
  province: '省/州级',
  city: '市级',
  county: '县级',
}

const editMode = ref(false)
const formData = ref({
  visitDate: '',
  note: ''
})

const liveSummary = ref('')
const liveAttractions = ref<string[]>([])
const isLoadingWiki = ref(false)

watch(() => props.existingPlace, (place) => {
  if (place) {
    formData.value.visitDate = place.visitDate || ''
    formData.value.note = place.note || ''
  } else {
    formData.value.visitDate = ''
    formData.value.note = ''
  }
  editMode.value = false
}, { immediate: true })

watch(() => props.name, async (newName) => {
  liveSummary.value = ''
  liveAttractions.value = []
  isLoadingWiki.value = false
}, { immediate: true })

async function saveDetails() {
  if (props.existingPlace) {
    await travelStore.updatePlace(props.existingPlace.id, {
      visitDate: formData.value.visitDate,
      note: formData.value.note
    })
    editMode.value = false
  }
}

function getHeritageCategoryLabel(cat?: string) {
  if (cat === 'Natural') return { label: '🌿 自然遗产', cls: 'bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-500 dark:text-emerald-950 dark:border-emerald-400' }
  if (cat === 'Mixed') return { label: '⛰️ 双重遗产', cls: 'bg-indigo-600 text-white border-indigo-700 dark:bg-indigo-500 dark:text-indigo-950 dark:border-indigo-400' }
  return { label: '🏛️ 文化遗产', cls: 'bg-amber-500 text-amber-950 border-amber-600 dark:bg-amber-400 dark:text-amber-950 dark:border-amber-300' }
}

const isMobile = ref(false)
function handleResize() {
  isMobile.value = window.innerWidth < 768
}
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const isDragging = ref(false)
const position = ref({ x: 20, y: 80 })
const dragOffset = ref({ x: 0, y: 0 })

function onPointerDown(e: PointerEvent) {
  if (isMobile.value) return
  // Prevent drag if clicking on buttons or scrollable areas
  const target = e.target as HTMLElement
  if (target.closest('button') || target.closest('.popup-body')) return
  
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  document.body.style.userSelect = 'none'
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  position.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  }
}

function onPointerUp() {
  isDragging.value = false
  document.body.style.userSelect = ''
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

const cardStyle = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return { position: 'relative', margin: '0 auto' }
  }
  return {
    position: 'absolute',
    top: '0px',
    left: '0px',
    transform: `translate3d(${position.value.x}px, ${position.value.y}px, 0)`
  }
})
</script>

<template>
  <div class="popup-overlay" @click.self="emit('close')">
    <div 
      class="popup-card shadow-2xl transition-transform duration-75 font-sans md:cursor-grab"
      :class="{'md:cursor-grabbing': isDragging}"
      :style="cardStyle"
      @pointerdown="onPointerDown"
    >
      <!-- Drag handle for mobile -->
      <div class="w-12 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full mx-auto mb-3 md:hidden"></div>

      <!-- Header -->
      <div class="popup-header pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div class="flex-1 pr-3">
          <div class="flex items-baseline flex-wrap gap-x-2">
            <h3 class="text-xl font-black tracking-tight text-blue-700 dark:text-blue-400 drop-shadow-sm">
              {{ name }}
            </h3>
            <span v-if="nameEn && nameEn !== name" class="text-xs font-semibold text-slate-600 dark:text-slate-300">
              ({{ nameEn }})
            </span>
          </div>
          <div class="flex items-center gap-2 mt-1.5 flex-wrap">
            <span class="px-2.5 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md border border-blue-300 dark:border-blue-700">
              {{ levelLabels[currentLevel] }}
            </span>
            <span v-if="country" class="px-2.5 py-0.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-700">
              {{ country }}
            </span>
            <span class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{{ adcode }}</span>
          </div>
        </div>

        <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors" @click="emit('close')">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Scrollable Content Body -->
      <div class="popup-body max-h-[58vh] overflow-y-auto pr-1 my-2 scroll-smooth">
        <!-- 1. Summary Quote Box -->
        <div v-if="isLoadingWiki" class="p-3 bg-slate-50 dark:bg-slate-900 border-l-4 border-slate-400 rounded-r-xl text-xs font-semibold text-slate-500 animate-pulse mb-3 shadow-2xs">
          正在为您实时获取真实百科介绍...
        </div>
        <div v-else-if="liveSummary || summary" class="p-3 bg-blue-50/95 dark:bg-blue-950/80 border-l-4 border-blue-600 rounded-r-xl text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed mb-3 shadow-2xs">
          {{ liveSummary || summary }}
        </div>

        <!-- 2. Rich 4D Travel Highlights -->
        <div class="space-y-3 mb-3">
          
          <!-- Top Attractions -->
          <div v-if="isLoadingWiki" class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl animate-pulse shadow-2xs h-16"></div>
          <div v-else-if="(liveAttractions.length > 0 || attractions) && (liveAttractions.length > 0 || (attractions && attractions.length > 0 && !['老城广场', '历史中心', '自然公园', '皇家风景区', '地标', '中心广场', '传统集市', '行政中心'].some(p => attractions!.join('').includes(p))))" class="p-3 bg-amber-50/95 dark:bg-amber-950/70 border border-amber-300/80 dark:border-amber-800 rounded-xl shadow-2xs">
            <div class="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-200 mb-2">
              <Sparkles class="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>知名景点与打卡名胜</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="item in (liveAttractions.length > 0 ? liveAttractions : attractions)" :key="item" class="px-2.5 py-1 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 border border-amber-300 dark:border-amber-700 rounded-lg shadow-2xs">
                📍 {{ item }}
              </span>
            </div>
          </div>

          <!-- UNESCO World Heritage -->
          <div v-if="heritage && heritage.length > 0" class="p-3 bg-yellow-50 dark:bg-yellow-950/70 border border-yellow-300 dark:border-yellow-800 rounded-xl shadow-2xs">
            <div class="flex items-center gap-1.5 text-xs font-black text-yellow-900 dark:text-yellow-200 mb-2.5">
              <Landmark class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span>UNESCO 世界遗产</span>
            </div>
            <div class="space-y-2">
              <div v-for="(item, idx) in heritage" :key="idx" class="p-2 bg-white/90 dark:bg-slate-900/90 border border-yellow-200 dark:border-yellow-900/80 rounded-lg flex flex-col gap-1">
                <template v-if="typeof item === 'object'">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-black text-slate-900 dark:text-slate-50">
                      {{ item.nameZh }}
                    </span>
                    <!-- Category Bubble / Pill -->
                    <span :class="['px-2 py-0.5 text-[10px] font-black rounded-full border shadow-2xs flex-shrink-0', getHeritageCategoryLabel(item.category).cls]">
                      {{ getHeritageCategoryLabel(item.category).label }}
                    </span>
                  </div>
                  <div v-if="item.nameEn && item.nameEn !== item.nameZh" class="text-[11px] font-medium italic text-slate-600 dark:text-slate-300">
                    {{ item.nameEn }}
                  </div>
                </template>
                <template v-else>
                  <span class="text-xs font-bold text-slate-900 dark:text-slate-100">
                    🏛️ {{ item }}
                  </span>
                </template>
              </div>
            </div>
          </div>

          <!-- Rare Landscapes & Cultural Experiences -->
          <div v-if="isLoadingWiki" class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl animate-pulse shadow-2xs h-16"></div>
          <div v-else-if="experiences && experiences.length > 0 && !['体验原汁原味的当地生活', '深入了解'].some(p => experiences!.join('').includes(p))" class="p-3 bg-indigo-50/95 dark:bg-indigo-950/70 border border-indigo-300/80 dark:border-indigo-800 rounded-xl shadow-2xs">
            <div class="flex items-center gap-1.5 text-xs font-black text-indigo-900 dark:text-indigo-200 mb-2">
              <Compass class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>罕见自然景观与人文体验</span>
            </div>
            <div class="space-y-1.5">
              <div v-for="item in experiences" :key="item" class="text-xs font-bold text-slate-900 dark:text-indigo-100 flex items-start gap-1.5">
                <span class="text-indigo-600 dark:text-indigo-400 font-black">✨</span>
                <span>{{ item }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Visited / Wishlist Status Badge -->
        <div v-if="existingPlace" class="mb-3">
          <span :class="['inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full border', existingPlace.type === 'visited' ? 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-400 dark:border-green-700' : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-100 border-amber-400 dark:border-amber-700']">
            <Check v-if="existingPlace.type === 'visited'" class="w-3.5 h-3.5" />
            <Star v-else class="w-3.5 h-3.5" />
            {{ existingPlace.type === 'visited' ? '已标记去过' : '已标记想去' }}
          </span>
        </div>

        <div v-if="!isCountyLevel" class="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg mb-3 border border-slate-300 dark:border-slate-700">
          💡 国内区域需切换到【县级】后方可精准标记
        </div>

        <!-- Existing Place Details / Edit Mode -->
        <template v-if="existingPlace && editMode">
          <div class="space-y-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-300 dark:border-slate-700">
            <div>
              <label class="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">游玩日期</label>
              <input type="date" v-model="formData.visitDate" class="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">旅行笔记</label>
              <textarea v-model="formData.note" rows="3" placeholder="记录下你的旅途感受与回忆..." class="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div class="flex gap-2 pt-1">
              <button class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black transition-colors" @click="saveDetails">保存</button>
              <button class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-black transition-colors" @click="editMode = false">取消</button>
            </div>
          </div>
        </template>

        <template v-else-if="existingPlace && !editMode">
          <div class="details-view space-y-2 mb-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-300 dark:border-slate-700" v-if="existingPlace.visitDate || existingPlace.note">
            <div class="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5" v-if="existingPlace.visitDate">
              <Calendar class="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>游玩时间：{{ existingPlace.visitDate }}</span>
            </div>
            <div class="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-start gap-1.5 whitespace-pre-wrap leading-relaxed" v-if="existingPlace.note">
              <FileText class="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>{{ existingPlace.note }}</span>
            </div>
          </div>

          <div class="flex gap-2 flex-wrap pt-1">
            <button class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-black border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center gap-1" @click="editMode = true">
              <Edit3 class="w-3.5 h-3.5" />
              编辑详情
            </button>
            <button class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-black border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center gap-1" @click="emit('toggleType')">
              <Star class="w-3.5 h-3.5" />
              {{ existingPlace.type === 'visited' ? '改为想去' : '改为已去' }}
            </button>
            <button class="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-black border border-red-300 dark:border-red-900/50 transition-colors flex items-center justify-center" @click="emit('remove')" title="删除标记">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </div>

      <!-- Action Buttons for New Mark -->
      <div class="popup-actions flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800" v-if="!existingPlace && isCountyLevel">
        <button class="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5" @click="emit('addVisited')">
          <Check class="w-4 h-4" />
          标记为已去
        </button>
        <button class="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5" @click="emit('addWishlist')">
          <Star class="w-4 h-4" />
          标记为想去
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  pointer-events: none;
}

@media (max-width: 767px) {
  .popup-overlay {
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
}

.popup-card {
  background: var(--color-bg, rgba(255, 255, 255, 0.98));
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 20px 20px 0 0;
  padding: 18px 20px;
  width: 100%;
  max-width: 440px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  pointer-events: auto;
}

@media (min-width: 768px) {
  .popup-card {
    border-radius: 20px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
</style>
