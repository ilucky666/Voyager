import { useTravelStore } from '@/stores/travel'

export async function generateFootprintImage(): Promise<Blob> {
  const travelStore = useTravelStore()
  const canvas = document.createElement('canvas')
  const dpr = 2
  const width = 800
  const height = 600
  canvas.width = width * dpr
  canvas.height = height * dpr
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, width, height)

  const grad = ctx.createLinearGradient(0, 0, width, height)
  grad.addColorStop(0, '#1a1a2e')
  grad.addColorStop(1, '#16213e')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const r = Math.random() * 2 + 0.5
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('我的旅行足迹', width / 2, 80)

  ctx.font = '14px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillText('Voyager', width / 2, 108)

  const stats = [
    { label: '已去省份', value: travelStore.visitedByLevel.province, color: '#34a853' },
    { label: '已去城市', value: travelStore.visitedByLevel.city, color: '#4a9af5' },
    { label: '已去区县', value: travelStore.visitedByLevel.county, color: '#8ab4f8' },
    { label: '想去地点', value: travelStore.wishlistPlaces.length, color: '#fbbc04' },
  ]

  const statWidth = 150
  const startX = (width - stats.length * statWidth) / 2
  stats.forEach((stat, i) => {
    const x = startX + i * statWidth + statWidth / 2
    const y = 180

    ctx.fillStyle = stat.color
    ctx.font = 'bold 42px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(stat.value), x, y)

    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '13px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillText(stat.label, x, y + 24)
  })

  const visited = travelStore.visitedPlaces
  const listStartY = 260
  const listMaxHeight = height - listStartY - 60

  ctx.font = '12px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
  const lineHeight = 22
  const maxItems = Math.floor(listMaxHeight / lineHeight)

  const placesToShow = visited.slice(0, maxItems)
  const cols = 3
  const colWidth = (width - 80) / cols

  placesToShow.forEach((place, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = 40 + col * colWidth
    const y = listStartY + row * lineHeight

    ctx.fillStyle = '#34a853'
    ctx.beginPath()
    ctx.arc(x + 4, y - 4, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.textAlign = 'left'
    ctx.fillText(place.name, x + 14, y)
  })

  if (visited.length > maxItems * cols) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.textAlign = 'center'
    ctx.fillText(`...还有 ${visited.length - maxItems * cols} 个地点`, width / 2, height - 40)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.font = '11px -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`生成于 ${new Date().toLocaleDateString('zh-CN')}`, width / 2, height - 16)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Failed to generate image')),
      'image/png',
      1.0
    )
  })
}

export async function shareFootprint() {
  const blob = await generateFootprintImage()
  const file = new File([blob], 'voyager-footprint.png', { type: 'image/png' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: '我的旅行足迹 - Voyager',
        text: '看看我去过哪些地方！',
        files: [file],
      })
      return
    } catch {
      // fall through to download
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `voyager-footprint-${new Date().toISOString().slice(0, 10)}.png`
  a.click()
  URL.revokeObjectURL(url)
}
