<script setup lang="ts">
import { ref } from 'vue'
import { useMapStore } from '@/stores/map'
import { useTravelStore } from '@/stores/travel'
import { shareFootprint } from '@/composables/useExport'
import { exportToFile, importFromFile, exportToClipboard, importFromClipboard, exportToJSON, generateCompressedSyncURL } from '@/composables/useSync'
import { testWebDAVConnection, uploadToWebDAV, downloadFromWebDAV, type WebDAVConfig } from '@/composables/useWebDAV'
import QrcodeVue from 'qrcode.vue'
import { SunMoon, Cloud, CloudDownload, CloudUpload, Link, Settings, Database, Share, Image as ImageIcon, MapPin, Map, Star, Smartphone, RefreshCw, Trash2, Globe } from 'lucide-vue-next'

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
    }
  } catch (err: any) {
    webdavTesting.value = false
    showMessage(`WebDAV 连接异常: ${err.message}`, 'error')
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
  <div class="flex flex-col h-full pt-[env(safe-area-inset-top,0px)]">
    <div class="px-5 py-4 flex items-center justify-between flex-shrink-0">
      <h1 class="text-[28px] font-bold tracking-tight">我的大盘</h1>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-24 scroll-smooth">
      
      <!-- Stats Dashboard -->
      <section class="mb-8">
        <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-1">全球足迹概览</h2>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
            <div class="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
            <Globe class="w-6 h-6 text-purple-500 mb-2" />
            <div class="text-3xl font-black text-purple-500">{{ travelStore.visitedByLevel.country }}</div>
            <div class="text-xs font-medium text-gray-500 mt-1">已去国家/地区</div>
          </div>
          <div class="bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
            <div class="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
            <Map class="w-6 h-6 text-blue-500 mb-2" />
            <div class="text-3xl font-black text-blue-500">{{ travelStore.visitedByLevel.province }}</div>
            <div class="text-xs font-medium text-gray-500 mt-1">已去省/州</div>
          </div>
          <div class="bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
            <div class="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
            <MapPin class="w-6 h-6 text-green-500 mb-2" />
            <div class="text-3xl font-black text-green-500">{{ travelStore.visitedByLevel.city }}</div>
            <div class="text-xs font-medium text-gray-500 mt-1">已去国内城市</div>
          </div>
          <div class="bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
            <div class="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors"></div>
            <Star class="w-6 h-6 text-orange-500 mb-2" />
            <div class="text-3xl font-black text-orange-500">{{ travelStore.wishlistPlaces.length }}</div>
            <div class="text-xs font-medium text-gray-500 mt-1">想去地点</div>
          </div>
        </div>
      </section>

      <!-- Appearance -->
      <section class="mb-6">
        <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pl-1">外观</h2>
        <div class="bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl overflow-hidden">
          <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" @click="mapStore.toggleDarkMode()">
            <div class="flex items-center gap-3">
              <SunMoon class="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span class="text-[15px] font-medium">暗色模式</span>
            </div>
            <div :class="['w-11 h-[26px] rounded-full relative transition-colors duration-300', mapStore.darkMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600']">
              <div :class="['w-5 h-5 rounded-full bg-white absolute top-[3px] left-[3px] transition-transform duration-300 shadow-sm', mapStore.darkMode ? 'translate-x-[18px]' : '']"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Share & Sync -->
      <section class="mb-6">
        <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pl-1">云端与分享</h2>
        <div class="bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl overflow-hidden flex flex-col">
          <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-gray-700/50" @click="handleShareFootprint">
            <div class="flex items-center gap-3">
              <ImageIcon class="w-5 h-5 text-purple-500" />
              <div class="flex flex-col">
                <span class="text-[15px] font-medium">生成足迹图</span>
                <span class="text-[11px] text-gray-500">生成高清图片并保存分享</span>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-gray-700/50" @click="showWebdavSettings = !showWebdavSettings">
            <div class="flex items-center gap-3">
              <Cloud class="w-5 h-5 text-blue-500" />
              <div class="flex flex-col">
                <span class="text-[15px] font-medium">WebDAV 配置</span>
                <span class="text-[11px] text-gray-500">{{ webdavConfig.url ? '已配置' : '使用坚果云等服务自动同步' }}</span>
              </div>
            </div>
          </div>

          <div v-if="showWebdavSettings" class="px-4 py-4 bg-black/5 dark:bg-black/20 border-b border-gray-200 dark:border-gray-700/50 flex flex-col gap-3">
            <input type="text" v-model="webdavConfig.url" placeholder="服务器地址 (如 https://dav.jianguoyun.com/dav/)" />
            <input type="text" v-model="webdavConfig.user" placeholder="用户名/账号" />
            <input type="password" v-model="webdavConfig.pass" placeholder="应用密码/授权码" />
            <input type="text" v-model="webdavConfig.path" placeholder="同步路径 (默认 /voyager.json)" />
            <button class="btn btn-primary self-end mt-1 text-sm" :disabled="webdavTesting" @click="handleWebdavTest">
              {{ webdavTesting ? '连接中...' : '测试并保存' }}
            </button>
          </div>

          <template v-if="webdavConfig.url">
            <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-gray-700/50" @click="handleWebdavSyncToCloud">
              <div class="flex items-center gap-3">
                <CloudUpload class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span class="text-[15px] font-medium">上传数据至云端</span>
              </div>
            </div>
            <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" @click="handleWebdavSyncFromCloud">
              <div class="flex items-center gap-3">
                <CloudDownload class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span class="text-[15px] font-medium">从云端拉取数据</span>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- Local Transfer -->
      <section class="mb-6">
        <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pl-1">跨设备迁移</h2>
        <div class="bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl overflow-hidden flex flex-col">
          <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-gray-700/50" @click="handleGenSyncLink">
            <div class="flex items-center gap-3">
              <Smartphone class="w-5 h-5 text-green-500" />
              <div class="flex flex-col">
                <span class="text-[15px] font-medium">扫码极速同步</span>
                <span class="text-[11px] text-gray-500">使用另一台设备的相机扫码即可迁移</span>
              </div>
            </div>
          </div>
          <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-gray-700/50" @click="handleCopyData">
            <div class="flex items-center gap-3">
              <Link class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span class="text-[15px] font-medium">复制数据</span>
            </div>
          </div>
          <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" @click="handlePasteData">
            <div class="flex items-center gap-3">
              <RefreshCw class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span class="text-[15px] font-medium">粘贴数据</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Advanced -->
      <section class="mb-6">
        <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pl-1">高级</h2>
        <div class="bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl overflow-hidden flex flex-col">
          <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-gray-700/50" @click="handleExportFile">
            <div class="flex items-center gap-3">
              <span class="text-[15px] font-medium">导出 JSON 文件</span>
            </div>
          </div>
          <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-gray-700/50" @click="handleImportFile">
            <div class="flex items-center gap-3">
              <span class="text-[15px] font-medium">导入 JSON 文件</span>
            </div>
          </div>
          <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" @click="handleClear">
            <div class="flex items-center gap-3 text-red-500">
              <Trash2 class="w-5 h-5" />
              <span class="text-[15px] font-medium">清空所有数据</span>
            </div>
          </div>
        </div>
      </section>
      
      <div class="text-center text-xs text-gray-400 mt-8 mb-4">
        Voyager Local-first Footprint Tracker
      </div>

    </div>

    <!-- Modals & Toasts -->
    <Transition name="fade">
      <div v-if="showQrModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-5" @click.self="showQrModal = false">
        <div class="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] w-full max-w-sm shadow-2xl flex flex-col items-center">
          <h3 class="text-lg font-bold mb-4">扫码极速迁移</h3>
          <div class="bg-white p-3 rounded-2xl shadow-sm mb-4">
            <qrcode-vue :value="qrCodeUrl" :size="200" level="M" />
          </div>
          <p class="text-sm text-gray-500 text-center mb-5 leading-relaxed">使用 iPhone 相机扫描二维码<br/>即可在新设备中极速导入所有数据。</p>
          
          <div class="flex gap-2 w-full mb-4">
            <input class="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 text-xs" :value="syncLink" readonly @click="($event.target as HTMLInputElement).select()" />
            <button class="btn btn-primary !py-2 !text-xs" @click="copySyncLink">复制链接</button>
          </div>
          
          <button class="btn btn-ghost w-full" @click="showQrModal = false">完成</button>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="message" :class="['fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl shadow-lg z-50 text-[15px] font-medium whitespace-nowrap', messageType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white']">
        {{ message }}
      </div>
    </Transition>
  </div>
</template>
