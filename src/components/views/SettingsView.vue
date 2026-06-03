<script setup lang="ts">
import { ref } from 'vue'
import { useMapStore } from '@/stores/map'
import { useTravelStore } from '@/stores/travel'
import { shareFootprint } from '@/composables/useExport'
import { exportToFile, importFromFile, exportToClipboard, importFromClipboard, exportToJSON, generateCompressedSyncURL } from '@/composables/useSync'
import { testWebDAVConnection, uploadToWebDAV, downloadFromWebDAV, type WebDAVConfig } from '@/composables/useWebDAV'
import QrcodeVue from 'qrcode.vue'

const mapStore = useMapStore()
const travelStore = useTravelStore()

const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const syncLink = ref('')
const qrCodeUrl = ref('')
const showQrModal = ref(false)

const webdavConfig = ref<WebDAVConfig>({
  url: localStorage.getItem('webdav_url') || '',
  user: localStorage.getItem('webdav_user') || '',
  pass: localStorage.getItem('webdav_pass') || '',
  path: localStorage.getItem('webdav_path') || '/voyager-sync.json'
})
const webdavTesting = ref(false)
const showWebdavSettings = ref(false)

async function handleExportFile() {
  try {
    await exportToFile()
    showMessage('文件已导出', 'success')
  } catch (e: any) {
    showMessage('导出失败: ' + e.message, 'error')
  }
}

async function handleImportFile() {
  try {
    const result = await importFromFile()
    await travelStore.loadPlaces()
    showMessage(`导入成功：${result.places} 个地点，${result.routes} 条路线`, 'success')
  } catch (e: any) {
    showMessage('导入失败: ' + e.message, 'error')
  }
}

async function handleCopyData() {
  try {
    await exportToClipboard()
    showMessage('数据已复制到剪贴板', 'success')
  } catch (e: any) {
    showMessage('复制失败，请手动导出文件', 'error')
  }
}

async function handlePasteData() {
  try {
    const result = await importFromClipboard()
    await travelStore.loadPlaces()
    showMessage(`同步成功：${result.places} 个地点，${result.routes} 条路线`, 'success')
  } catch (e: any) {
    showMessage('粘贴失败: ' + e.message, 'error')
  }
}

async function handleGenSyncLink() {
  try {
    const url = await generateCompressedSyncURL()
    syncLink.value = url
    qrCodeUrl.value = url
    showQrModal.value = true
  } catch (e: any) {
    showMessage('生成失败: ' + e.message, 'error')
  }
}

async function handleWebdavTest() {
  webdavTesting.value = true
  try {
    const errorMsg = await testWebDAVConnection(webdavConfig.value)
    webdavTesting.value = false
    if (errorMsg === true) {
      localStorage.setItem('webdav_url', webdavConfig.value.url)
      localStorage.setItem('webdav_user', webdavConfig.value.user)
      localStorage.setItem('webdav_pass', webdavConfig.value.pass)
      localStorage.setItem('webdav_path', webdavConfig.value.path)
      showMessage('WebDAV 连接成功并已保存', 'success')
    } else {
      showMessage(`WebDAV 连接失败: ${errorMsg}`, 'error')
      // alert so user can copy it if it's long
      alert(`详细报错信息:\n${errorMsg}`)
    }
  } catch (err: any) {
    webdavTesting.value = false
    showMessage(`WebDAV 连接抛出异常: ${err.message}`, 'error')
    alert(`异常详情:\n${err.message}`)
  }
}

async function handleWebdavSyncToCloud() {
  try {
    const json = await exportToJSON()
    await uploadToWebDAV(webdavConfig.value, json)
    showMessage('已同步至 WebDAV 云端', 'success')
  } catch (e: any) {
    showMessage('云端同步失败: ' + e.message, 'error')
  }
}

async function handleWebdavSyncFromCloud() {
  try {
    const data = await downloadFromWebDAV(webdavConfig.value)
    if (data) {
      const count = await travelStore.importData(data)
      showMessage(`从云端导入成功，新增 ${count} 项`, 'success')
    } else {
      showMessage('云端无数据', 'success')
    }
  } catch (e: any) {
    showMessage('从云端导入失败: ' + e.message, 'error')
  }
}

async function copySyncLink() {
  try {
    await navigator.clipboard.writeText(syncLink.value)
    showMessage('同步链接已复制', 'success')
  } catch {
    showMessage('复制失败', 'error')
  }
}

async function handleClear() {
  if (!confirm('确定要清空所有数据吗？此操作不可撤销！')) return
  await travelStore.clearAll()
  showMessage('已清空所有数据', 'success')
}

async function handleShareFootprint() {
  try {
    await shareFootprint()
    showMessage('足迹图已生成', 'success')
  } catch (e: any) {
    showMessage('生成失败: ' + e.message, 'error')
  }
}

function showMessage(msg: string, type: 'success' | 'error') {
  message.value = msg
  messageType.value = type
  setTimeout(() => { message.value = '' }, 3000)
}
</script>

<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1 class="settings-title">设置</h1>
    </div>

    <div class="settings-content">
      <section class="settings-section">
        <h2 class="section-title">足迹统计</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ travelStore.visitedByLevel.province }}</div>
            <div class="stat-label">已去省份</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ travelStore.visitedByLevel.city }}</div>
            <div class="stat-label">已去城市</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ travelStore.visitedByLevel.county }}</div>
            <div class="stat-label">已去区县</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ travelStore.wishlistByLevel.county }}</div>
            <div class="stat-label">想去地点</div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">外观</h2>
        <div class="setting-item" @click="mapStore.toggleDarkMode()">
          <div class="setting-info">
            <span class="setting-label">🌙 暗色模式</span>
          </div>
          <div :class="['toggle', { active: mapStore.darkMode }]">
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">分享</h2>
        <div class="setting-item" @click="handleShareFootprint">
          <div class="setting-info">
            <span class="setting-label">🖼 生成足迹图</span>
            <span class="setting-desc">生成旅行足迹图片并分享或保存</span>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">WebDAV 云同步</h2>
        <p class="sync-hint">使用坚果云等 WebDAV 服务实现多设备自动同步</p>
        
        <div class="setting-item" @click="showWebdavSettings = !showWebdavSettings">
          <div class="setting-info">
            <span class="setting-label">☁️ WebDAV 配置</span>
            <span class="setting-desc">{{ webdavConfig.url ? '已配置' : '未配置' }}</span>
          </div>
        </div>

        <div v-if="showWebdavSettings" class="webdav-form glass-panel">
          <input type="text" v-model="webdavConfig.url" placeholder="服务器地址 (如 https://dav.jianguoyun.com/dav/)" />
          <input type="text" v-model="webdavConfig.user" placeholder="用户名/账号" />
          <input type="password" v-model="webdavConfig.pass" placeholder="应用密码/授权码" />
          <input type="text" v-model="webdavConfig.path" placeholder="同步文件路径 (默认 /voyager-sync.json)" />
          <div class="webdav-actions">
            <button class="btn btn-ghost" :disabled="webdavTesting" @click="handleWebdavTest">
              {{ webdavTesting ? '测试中...' : '测试并保存' }}
            </button>
          </div>
        </div>

        <template v-if="webdavConfig.url">
          <div class="setting-item" @click="handleWebdavSyncToCloud">
            <div class="setting-info">
              <span class="setting-label">⬆️ 上传数据至云端</span>
              <span class="setting-desc">将本地数据备份到 WebDAV</span>
            </div>
          </div>
          <div class="setting-item" @click="handleWebdavSyncFromCloud">
            <div class="setting-info">
              <span class="setting-label">⬇️ 从云端拉取数据</span>
              <span class="setting-desc">获取云端数据并合并到本地</span>
            </div>
          </div>
        </template>
      </section>

      <section class="settings-section">
        <h2 class="section-title">跨设备同步</h2>
        <p class="sync-hint">手机扫码即可直接导入数据到 iOS 手机</p>
        <div class="setting-item" @click="handleGenSyncLink">
          <div class="setting-info">
            <span class="setting-label">📱 生成手机同步二维码</span>
            <span class="setting-desc">iOS 手机扫码即可极速导入</span>
          </div>
        </div>
        <div class="setting-item" @click="handleCopyData">
          <div class="setting-info">
            <span class="setting-label">📋 复制数据到剪贴板</span>
            <span class="setting-desc">在另一台设备上粘贴导入</span>
          </div>
        </div>
        <div class="setting-item" @click="handlePasteData">
          <div class="setting-info">
            <span class="setting-label">📋 从剪贴板粘贴</span>
            <span class="setting-desc">导入从其他设备复制的数据</span>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">文件备份</h2>
        <div class="setting-item" @click="handleExportFile">
          <div class="setting-info">
            <span class="setting-label">📤 导出文件</span>
          </div>
        </div>
        <div class="setting-item" @click="handleImportFile">
          <div class="setting-info">
            <span class="setting-label">📥 导入文件</span>
          </div>
        </div>
        <div class="setting-item danger" @click="handleClear">
          <div class="setting-info">
            <span class="setting-label">🗑 清空数据</span>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">关于</h2>
        <div class="about-text">
          <p><strong>Voyager</strong> - 个人旅行足迹管理</p>
          <p>数据存储在本地浏览器中，无需注册账号。</p>
          <p>建议定期导出数据备份。</p>
        </div>
      </section>
    </div>

    <Transition name="fade">
      <div v-if="showQrModal" class="qr-modal-overlay" @click.self="showQrModal = false">
        <div class="qr-modal-content glass-panel">
          <h3 style="margin-bottom: 12px; text-align: center">手机扫码同步</h3>
          <div class="qr-wrapper">
            <qrcode-vue :value="qrCodeUrl" :size="200" level="M" />
          </div>
          <p class="qr-desc">请使用 iOS 手机相机扫描此二维码，即可自动打开并导入数据。</p>
          <div class="sync-link-box">
            <input class="sync-link-input" :value="syncLink" readonly @click="($event.target as HTMLInputElement).select()" />
            <button class="sync-link-copy" @click="copySyncLink">复制链接</button>
          </div>
          <button class="btn btn-primary" style="width: 100%; margin-top: 16px" @click="showQrModal = false">完成</button>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="message" :class="['toast', messageType]">
        {{ message }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: var(--safe-top);
}

.settings-header {
  padding: 16px 16px 8px;
}

.settings-title {
  font-size: 22px;
  font-weight: 700;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
  -webkit-overflow-scrolling: touch;
}

.settings-section {
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

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stat-card {
  text-align: center;
  padding: 14px 12px;
  background: var(--color-bg-secondary);
  border-radius: 10px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: var(--color-bg-secondary);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 4px;
}

.setting-item:hover {
  background: var(--color-border);
}

.setting-item.danger {
  color: #ea4335;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
}

.setting-desc {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.toggle {
  width: 44px;
  height: 26px;
  border-radius: 13px;
  background: var(--color-border);
  position: relative;
  transition: background 0.3s;
  flex-shrink: 0;
}

.toggle.active {
  background: var(--color-primary);
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle.active .toggle-thumb {
  transform: translateX(18px);
}

.about-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  padding: 12px 14px;
  background: var(--color-bg-secondary);
  border-radius: 10px;
}

.about-text p {
  margin-bottom: 2px;
}

.sync-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  line-height: 1.5;
}

.sync-link-box {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.sync-link-input {
  flex: 1;
  font-size: 11px;
  padding: 6px 8px;
}

.sync-link-copy {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: var(--color-primary);
  color: white;
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
}

.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.toast.success {
  background: var(--color-visited);
  color: white;
}

.toast.error {
  background: #ff3b30;
  color: white;
}

.webdav-form {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.webdav-actions {
  display: flex;
  justify-content: flex-end;
}

.qr-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.qr-modal-content {
  background: var(--color-bg);
  padding: 24px;
  border-radius: 20px;
  width: 100%;
  max-width: 320px;
}

.qr-wrapper {
  background: white;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.qr-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.5;
  margin-bottom: 16px;
}
</style>
