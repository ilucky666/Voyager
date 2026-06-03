<script setup lang="ts">
import type { TravelPlace, AdminLevel } from '@/types'

import { ref, watch } from 'vue'
import { useTravelStore } from '@/stores/travel'

const props = defineProps<{
  name: string
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
  province: '省级',
  city: '市级',
  county: '县级',
}

const editMode = ref(false)
const formData = ref({
  visitDate: '',
  note: ''
})

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

async function saveDetails() {
  if (props.existingPlace) {
    await travelStore.updatePlace(props.existingPlace.id, {
      visitDate: formData.value.visitDate,
      note: formData.value.note
    })
    editMode.value = false
  }
}
</script>

<template>
  <div class="popup-overlay" @click.self="emit('close')">
    <div class="popup-card">
      <div class="popup-header">
        <div>
          <h3 class="popup-title">{{ name }}</h3>
          <span class="popup-meta">{{ levelLabels[currentLevel] }} · {{ adcode }}</span>
        </div>
        <button class="popup-close" @click="emit('close')">✕</button>
      </div>

      <div v-if="existingPlace" class="popup-status">
        <span :class="['badge', existingPlace.type === 'visited' ? 'badge-visited' : 'badge-wishlist']">
          {{ existingPlace.type === 'visited' ? '✓ 已去过' : '★ 想去' }}
        </span>
      </div>

      <div v-if="!isCountyLevel" class="popup-hint">
        切换到县级后可标记此区域
      </div>

      <template v-if="existingPlace && editMode">
        <div class="edit-form">
          <div class="form-group">
            <label>游玩日期</label>
            <input type="date" v-model="formData.visitDate" />
          </div>
          <div class="form-group">
            <label>旅行笔记</label>
            <textarea v-model="formData.note" rows="3" placeholder="记录下你的感受..."></textarea>
          </div>
          <div class="popup-actions" style="margin-top: 12px">
            <button class="btn btn-primary" @click="saveDetails">保存</button>
            <button class="btn btn-ghost" @click="editMode = false">取消</button>
          </div>
        </div>
      </template>

      <template v-else-if="existingPlace && !editMode">
        <div class="details-view" v-if="existingPlace.visitDate || existingPlace.note">
          <div class="detail-item" v-if="existingPlace.visitDate">
            <span class="detail-icon">📅</span> {{ existingPlace.visitDate }}
          </div>
          <div class="detail-item note-text" v-if="existingPlace.note">
            <span class="detail-icon">📝</span> {{ existingPlace.note }}
          </div>
        </div>
        
        <div class="popup-actions">
          <button class="btn btn-ghost" @click="editMode = true">
            ✏️ 编辑详情
          </button>
          <button class="btn btn-ghost" @click="emit('toggleType')">
            {{ existingPlace.type === 'visited' ? '★ 改为想去' : '✓ 改为已去' }}
          </button>
          <button class="btn btn-danger" @click="emit('remove')">
            🗑 删除
          </button>
        </div>
      </template>

      <div class="popup-actions" v-if="!existingPlace && isCountyLevel">
        <button class="btn btn-primary" style="background: var(--color-visited)" @click="emit('addVisited')">
          ✓ 标记为已去
        </button>
        <button class="btn btn-primary" style="background: var(--color-wishlist); color: #fff" @click="emit('addWishlist')">
          ★ 标记为想去
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 15;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}

@media (min-width: 768px) {
  .popup-overlay {
    align-items: center;
    bottom: auto;
    top: 50%;
    transform: translateY(-50%);
  }
}

.popup-card {
  background: var(--color-bg);
  border-radius: 16px 16px 0 0;
  padding: 20px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.15);
  pointer-events: auto;
}

@media (min-width: 768px) {
  .popup-card {
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.popup-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.popup-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.popup-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 4px;
  line-height: 1;
}

.popup-status {
  margin-bottom: 12px;
}

.popup-hint {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border-radius: 8px;
}

.popup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.edit-form {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.details-view {
  margin-bottom: 16px;
  background: rgba(142, 142, 147, 0.08);
  border-radius: 12px;
  padding: 12px;
}

.detail-item {
  font-size: 14px;
  color: var(--color-text);
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.detail-item:last-child {
  margin-bottom: 0;
}

.note-text {
  white-space: pre-wrap;
  line-height: 1.5;
}
</style>
