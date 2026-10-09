import { useTravelStore } from '@/stores/travel'
import { loadGeoJSON, extractCenter } from '@/composables/useGeoJSON'
import type { TravelPlace } from '@/types'

// Mapping of province codes to names
const PROVINCE_NAMES: Record<string, string> = {
  '11': '北京', '12': '天津', '13': '河北', '14': '山西', '15': '内蒙古',
  '21': '辽宁', '22': '吉林', '23': '黑龙江', '31': '上海', '32': '江苏',
  '33': '浙江', '34': '安徽', '35': '福建', '36': '江西', '37': '山东',
  '41': '河南', '42': '湖北', '43': '湖南', '44': '广东', '45': '广西',
  '46': '海南', '50': '重庆', '51': '四川', '52': '贵州', '53': '云南',
  '54': '西藏', '61': '陕西', '62': '甘肃', '63': '青海', '64': '宁夏',
  '65': '新疆', '71': '台湾', '81': '香港', '82': '澳门',
}

function mercatorX(lon: number): number {
  return (lon + 180) / 360
}

function mercatorY(lat: number): number {
  const clamped = Math.max(-85, Math.min(85, lat))
  const rad = clamped * (Math.PI / 180)
  return (1 - Math.log(Math.tan(Math.PI / 4 + rad / 2)) / Math.PI) / 2
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function isCityVisited(feature: GeoJSON.Feature, visitedPlaces: TravelPlace[]): boolean {
  const fCode = String(feature.properties?.adcode || '')
  if (!fCode) return false

  // Direct adcode match
  if (visitedPlaces.some(p => String(p.adcode || '') === fCode)) return true

  const prov = fCode.substring(0, 2)
  const isDirectAdmin = ['11', '12', '31', '50', '81', '82', '71'].includes(prov)
  const isProvDirectCounty = fCode.length >= 4 && fCode.substring(2, 4) === '90'
  const prefix = isDirectAdmin ? prov : (isProvDirectCounty ? fCode : fCode.substring(0, 4))

  return visitedPlaces.some(p => {
    const pCode = String(p.adcode || '')
    return !pCode.includes('-') && (pCode === fCode || pCode.startsWith(prefix))
  })
}

function drawGeometry(
  ctx: CanvasRenderingContext2D,
  geometry: GeoJSON.Geometry,
  project: (lon: number, lat: number) => [number, number]
) {
  if (geometry.type === 'Polygon') {
    const coords = (geometry as GeoJSON.Polygon).coordinates
    for (const ring of coords) {
      if (!ring || ring.length < 3) continue
      const [startLon, startLat] = ring[0]
      const [sx, sy] = project(startLon, startLat)
      ctx.moveTo(sx, sy)
      for (let i = 1; i < ring.length; i++) {
        const [lon, lat] = ring[i]
        const [px, py] = project(lon, lat)
        ctx.lineTo(px, py)
      }
      ctx.closePath()
    }
  } else if (geometry.type === 'MultiPolygon') {
    const coords = (geometry as GeoJSON.MultiPolygon).coordinates
    for (const poly of coords) {
      for (const ring of poly) {
        if (!ring || ring.length < 3) continue
        const [startLon, startLat] = ring[0]
        const [sx, sy] = project(startLon, startLat)
        ctx.moveTo(sx, sy)
        for (let i = 1; i < ring.length; i++) {
          const [lon, lat] = ring[i]
          const [px, py] = project(lon, lat)
          ctx.lineTo(px, py)
        }
        ctx.closePath()
      }
    }
  }
}

export async function generateFootprintImage(): Promise<Blob> {
  const travelStore = useTravelStore()

  // 1. Strictly filter for VISITED places only (exclude wishlist)
  const visitedPlaces = travelStore.places.filter(p => p.type === 'visited')
  if (visitedPlaces.length === 0) {
    throw new Error('暂未检测到已去过的足迹标记，请先标记去过的城市或地点')
  }

  // 2. Load city-level GeoJSON boundaries
  const cityGeoJSON = await loadGeoJSON('city')

  // Identify visited city features in all-cities.json
  const visitedCityFeatures = cityGeoJSON.features.filter(f => isCityVisited(f, visitedPlaces))

  // 3. Canvas setup with high-DPI retina rendering
  const width = 1000
  const height = 1400
  const dpr = Math.min(window.devicePixelRatio || 2, 2.5)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  // 4. Calculate Bounding Box of visited places / cities
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity

  function updateBounds(coords: any) {
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const lon = coords[0]
      const lat = coords[1]
      if (lon < minLon) minLon = lon
      if (lon > maxLon) maxLon = lon
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
    } else if (Array.isArray(coords)) {
      for (const c of coords) updateBounds(c)
    }
  }

  if (visitedCityFeatures.length > 0) {
    for (const f of visitedCityFeatures) {
      if (f.geometry) updateBounds((f.geometry as any).coordinates)
    }
  } else {
    for (const p of visitedPlaces) {
      if (p.coordinates && p.coordinates.length >= 2) updateBounds(p.coordinates)
    }
  }

  // Fallback if coordinates missing
  if (!isFinite(minLon)) {
    minLon = 73.5
    maxLon = 135.0
    minLat = 18.0
    maxLat = 53.5
  }

  // Mercator viewport calculation
  let minX = mercatorX(minLon)
  let maxX = mercatorX(maxLon)
  let minY = mercatorY(maxLat)
  let maxY = mercatorY(minLat)

  let spanX = maxX - minX
  let spanY = maxY - minY

  // Minimum span to avoid over-zooming on a single isolated point
  const minSpan = 0.014
  if (spanX < minSpan) {
    const d = (minSpan - spanX) / 2
    minX -= d
    maxX += d
    spanX = minSpan
  }
  if (spanY < minSpan) {
    const d = (minSpan - spanY) / 2
    minY -= d
    maxY += d
    spanY = minSpan
  }

  // Add 14% aesthetic padding around the bounding box
  const padRatio = 0.14
  const padX = spanX * padRatio
  const padY = spanY * padRatio
  const viewMinX = minX - padX
  const viewMaxX = maxX + padX
  const viewMinY = minY - padY
  const viewMaxY = maxY + padY

  // Map container placement on canvas
  const mapX = 45
  const mapY = 285
  const mapW = 910
  const mapH = 755
  const mapRadius = 24

  const viewW = viewMaxX - viewMinX
  const viewH = viewMaxY - viewMinY
  const scale = Math.min(mapW / viewW, mapH / viewH)
  const scaledW = viewW * scale
  const scaledH = viewH * scale
  const offsetX = mapX + (mapW - scaledW) / 2
  const offsetY = mapY + (mapH - scaledH) / 2

  function project(lon: number, lat: number): [number, number] {
    const x = offsetX + (mercatorX(lon) - viewMinX) * scale
    const y = offsetY + (mercatorY(lat) - viewMinY) * scale
    return [x, y]
  }

  // ==========================================
  // 5. Draw Canvas Background & Ambient Glow
  // ==========================================
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  bgGrad.addColorStop(0, '#0B0F19')
  bgGrad.addColorStop(0.5, '#080C15')
  bgGrad.addColorStop(1, '#05070D')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // Soft atmospheric radial glows
  const ambientGlow = ctx.createRadialGradient(
    width / 2, mapY + mapH / 2, 80,
    width / 2, mapY + mapH / 2, 520
  )
  ambientGlow.addColorStop(0, 'rgba(16, 185, 129, 0.08)')
  ambientGlow.addColorStop(0.6, 'rgba(16, 185, 129, 0.02)')
  ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = ambientGlow
  ctx.fillRect(0, 0, width, height)

  // Outer delicate card border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  roundRect(ctx, 16, 16, width - 32, height - 32, 28)
  ctx.stroke()

  // ==========================================
  // 6. Header Section
  // ==========================================
  // Eyebrow Brand Badge
  const badgeText = 'VOYAGER · TRAVEL FOOTPRINT'
  ctx.font = '700 11px -apple-system, BlinkMacSystemFont, sans-serif'
  const badgeWidth = ctx.measureText(badgeText).width + 24
  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)'
  roundRect(ctx, 45, 45, badgeWidth, 24, 12)
  ctx.fill()
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = '#34D399'
  ctx.textAlign = 'left'
  ctx.fillText(badgeText, 57, 61)

  // Main Headline
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '800 40px -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
  ctx.fillText('我的旅行足迹', 45, 115)

  // Subtitle & Metadata
  ctx.font = '400 14px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif'
  ctx.fillStyle = '#94A3B8'
  ctx.fillText('用脚步丈量世界 · 记录每一次探索', 45, 144)

  const dateStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  ctx.textAlign = 'right'
  ctx.fillStyle = '#64748B'
  ctx.font = '500 12px -apple-system, sans-serif'
  ctx.fillText(`生成于 ${dateStr} · 市级行政边界呈现`, width - 45, 144)

  // ==========================================
  // 7. Statistics Cards Bar (Strictly Visited Only!)
  // ==========================================
  const statY = 168
  const statH = 92
  const statW = (mapW - 24) / 3
  const stats = [
    {
      label: '已探索省份 / 直辖市',
      value: travelStore.visitedByLevel.province,
      unit: '个',
      color: '#60A5FA',
      accent: 'rgba(96, 165, 250, 0.12)'
    },
    {
      label: '已点亮国内城市',
      value: visitedCityFeatures.length || travelStore.visitedByLevel.city,
      unit: '座',
      color: '#34D399',
      accent: 'rgba(52, 211, 153, 0.14)'
    },
    {
      label: '累计足迹记录点',
      value: visitedPlaces.length,
      unit: '处',
      color: '#F59E0B',
      accent: 'rgba(245, 158, 11, 0.12)'
    }
  ]

  stats.forEach((st, i) => {
    const sx = mapX + i * (statW + 12)
    // Card background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)'
    roundRect(ctx, sx, statY, statW, statH, 18)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Top indicator pill
    ctx.fillStyle = st.accent
    roundRect(ctx, sx + 16, statY + 16, 8, 8, 4)
    ctx.fill()

    // Number + Unit
    ctx.textAlign = 'left'
    ctx.font = '800 34px -apple-system, sans-serif'
    ctx.fillStyle = st.color
    ctx.fillText(String(st.value), sx + 32, statY + 46)

    const numWidth = ctx.measureText(String(st.value)).width
    ctx.font = '500 14px -apple-system, "PingFang SC", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillText(st.unit, sx + 32 + numWidth + 5, statY + 46)

    // Subtitle label
    ctx.font = '500 12px -apple-system, "PingFang SC", sans-serif'
    ctx.fillStyle = '#94A3B8'
    ctx.fillText(st.label, sx + 16, statY + 74)
  })

  // ==========================================
  // 8. Map Container & Map Content
  // ==========================================
  // Container Background & Border
  ctx.fillStyle = 'rgba(12, 18, 32, 0.85)'
  roundRect(ctx, mapX, mapY, mapW, mapH, mapRadius)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)'
  ctx.lineWidth = 1.2
  ctx.stroke()

  // Clip all subsequent drawing inside the map container
  ctx.save()
  roundRect(ctx, mapX, mapY, mapW, mapH, mapRadius)
  ctx.clip()

  // Draw Faint Coordinates Graticule Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)'
  ctx.lineWidth = 0.8
  ctx.setLineDash([4, 6])
  const gridStep = spanX > 0.05 ? 4 : (spanX > 0.02 ? 2 : 1)
  const startLonGrid = Math.floor(minLon / gridStep) * gridStep
  const endLonGrid = Math.ceil(maxLon / gridStep) * gridStep
  for (let gLon = startLonGrid; gLon <= endLonGrid; gLon += gridStep) {
    const [gx1, gy1] = project(gLon, minLat - 5)
    const [gx2, gy2] = project(gLon, maxLat + 5)
    ctx.beginPath()
    ctx.moveTo(gx1, gy1)
    ctx.lineTo(gx2, gy2)
    ctx.stroke()
  }
  const startLatGrid = Math.floor(minLat / gridStep) * gridStep
  const endLatGrid = Math.ceil(maxLat / gridStep) * gridStep
  for (let gLat = startLatGrid; gLat <= endLatGrid; gLat += gridStep) {
    const [gx1, gy1] = project(minLon - 5, gLat)
    const [gx2, gy2] = project(maxLon + 5, gLat)
    ctx.beginPath()
    ctx.moveTo(gx1, gy1)
    ctx.lineTo(gx2, gy2)
    ctx.stroke()
  }
  ctx.setLineDash([])

  // Draw Unvisited Cities within the framed viewport (subtle contextual background)
  const visitedSet = new Set(visitedCityFeatures.map(f => f.properties?.adcode).filter(Boolean))

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)'
  ctx.lineWidth = 0.8

  for (const f of cityGeoJSON.features) {
    if (visitedSet.has(f.properties?.adcode)) continue
    if (!f.geometry) continue

    ctx.beginPath()
    drawGeometry(ctx, f.geometry, project)
    ctx.fill()
    ctx.stroke()
  }

  // Draw Visited Cities with Radiant Glowing Emerald Style
  for (const f of visitedCityFeatures) {
    if (!f.geometry) continue

    // Layer 1: Radiant Fill
    ctx.save()
    ctx.shadowColor = 'rgba(16, 185, 129, 0.45)'
    ctx.shadowBlur = 12
    ctx.fillStyle = 'rgba(16, 185, 129, 0.72)'
    ctx.beginPath()
    drawGeometry(ctx, f.geometry, project)
    ctx.fill()
    ctx.restore()

    // Layer 2: Glowing Crisp Border
    ctx.strokeStyle = '#34D399'
    ctx.lineWidth = 1.8
    ctx.stroke()
  }

  // Draw Visited City Markers and Typography Labels
  interface Box { x1: number; y1: number; x2: number; y2: number }
  const placedBoxes: Box[] = []

  function isOverlap(b1: Box, b2: Box) {
    return !(b1.x2 < b2.x1 || b1.x1 > b2.x2 || b1.y2 < b2.y1 || b1.y1 > b2.y2)
  }

  for (const f of visitedCityFeatures) {
    const center = extractCenter(f)
    const [cx, cy] = project(center[0], center[1])

    // Skip if marker is out of visible container bounds
    if (cx < mapX + 15 || cx > mapX + mapW - 15 || cy < mapY + 15 || cy > mapY + mapH - 15) {
      continue
    }

    // Glowing Pin Dot
    ctx.fillStyle = 'rgba(52, 211, 153, 0.35)'
    ctx.beginPath()
    ctx.arc(cx, cy, 5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(cx, cy, 2, 0, Math.PI * 2)
    ctx.fill()

    // Label Placement with Collision Avoidance
    const cityName = String(f.properties?.name || '')
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif'
    const tw = ctx.measureText(cityName).width
    const targetBox: Box = {
      x1: cx - tw / 2 - 4,
      y1: cy - 22,
      x2: cx + tw / 2 + 4,
      y2: cy - 4
    }

    const collision = placedBoxes.some(b => isOverlap(b, targetBox))
    if (!collision) {
      placedBoxes.push(targetBox)

      ctx.save()
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'
      ctx.shadowBlur = 5
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(cityName, cx, cy - 8)
      ctx.restore()
    }
  }

  // Draw Minimalist Compass Rose in Top-Right
  const compassX = mapX + mapW - 42
  const compassY = mapY + 42
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(compassX, compassY, 18, 0, Math.PI * 2)
  ctx.stroke()

  // North needle
  ctx.fillStyle = '#34D399'
  ctx.beginPath()
  ctx.moveTo(compassX, compassY - 14)
  ctx.lineTo(compassX + 4, compassY)
  ctx.lineTo(compassX, compassY - 2)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.beginPath()
  ctx.moveTo(compassX, compassY - 14)
  ctx.lineTo(compassX - 4, compassY)
  ctx.lineTo(compassX, compassY - 2)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 9px -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('N', compassX, compassY - 18)

  // Dynamic Region Scope Badge in Top-Left
  const provCodes = new Set(visitedCityFeatures.map(f => String(f.properties?.adcode || '').substring(0, 2)).filter(Boolean))
  let regionTitle = '全国多地市级足迹图'
  if (provCodes.size === 1) {
    const singleCode = Array.from(provCodes)[0]
    const provName = PROVINCE_NAMES[singleCode] || '本省'
    regionTitle = `${provName}市级足迹地图`
  } else if (provCodes.size > 1 && provCodes.size <= 3) {
    const names = Array.from(provCodes).map(c => PROVINCE_NAMES[c]).filter(Boolean)
    regionTitle = `${names.join('·')}市级足迹`
  } else {
    regionTitle = `全国足迹地图 · 覆盖 ${provCodes.size} 个省市`
  }

  ctx.font = '600 12px -apple-system, "PingFang SC", sans-serif'
  const regWidth = ctx.measureText(regionTitle).width + 28
  ctx.fillStyle = 'rgba(10, 15, 28, 0.75)'
  roundRect(ctx, mapX + 16, mapY + 16, regWidth, 28, 14)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = '#10B981'
  ctx.beginPath()
  ctx.arc(mapX + 28, mapY + 30, 3.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#E2E8F0'
  ctx.textAlign = 'left'
  ctx.fillText(regionTitle, mapX + 38, mapY + 34)

  ctx.restore() // End of map container clipping

  // ==========================================
  // 9. Visited Cities Tag Cloud Section
  // ==========================================
  const tagStartY = 1065
  const tagMaxY = 1320

  ctx.textAlign = 'left'
  ctx.font = '700 14px -apple-system, "PingFang SC", sans-serif'
  ctx.fillStyle = '#E2E8F0'
  ctx.fillText(`已点亮城市清单 (${visitedCityFeatures.length})`, mapX, tagStartY)

  // Green indicator dot
  ctx.fillStyle = '#10B981'
  ctx.beginPath()
  ctx.arc(mapX + ctx.measureText(`已点亮城市清单 (${visitedCityFeatures.length})`).width + 10, tagStartY - 4, 3, 0, Math.PI * 2)
  ctx.fill()

  // Flow tags layout
  let curX = mapX
  let curY = tagStartY + 16
  const tagH = 26
  const tagGapX = 8
  const tagGapY = 8
  const maxTagRight = width - mapX

  const cityNames = visitedCityFeatures.map(f => String(f.properties?.name || ''))
  const maxShowCount = 28

  cityNames.forEach((name, idx) => {
    if (idx >= maxShowCount) return
    ctx.font = '500 12px -apple-system, "PingFang SC", sans-serif'
    const nw = ctx.measureText(name).width
    const itemW = nw + 24

    if (curX + itemW > maxTagRight) {
      curX = mapX
      curY += tagH + tagGapY
    }

    if (curY + tagH > tagMaxY) return

    // Draw pill
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)'
    roundRect(ctx, curX, curY, itemW, tagH, tagH / 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#34D399'
    ctx.beginPath()
    ctx.arc(curX + 10, curY + tagH / 2, 2.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#E2E8F0'
    ctx.fillText(name, curX + 17, curY + 17)

    curX += itemW + tagGapX
  })

  if (cityNames.length > maxShowCount) {
    const moreText = `+${cityNames.length - maxShowCount} 更多城市`
    ctx.font = '500 12px -apple-system, "PingFang SC", sans-serif'
    const mw = ctx.measureText(moreText).width + 20
    if (curX + mw > maxTagRight) {
      curX = mapX
      curY += tagH + tagGapY
    }
    if (curY + tagH <= tagMaxY) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      roundRect(ctx, curX, curY, mw, tagH, tagH / 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = '#94A3B8'
      ctx.fillText(moreText, curX + 10, curY + 17)
    }
  }

  // ==========================================
  // 10. Footer Section
  // ==========================================
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(mapX, 1345)
  ctx.lineTo(width - mapX, 1345)
  ctx.stroke()

  ctx.font = '500 12px -apple-system, sans-serif'
  ctx.fillStyle = '#64748B'
  ctx.textAlign = 'left'
  ctx.fillText('VOYAGER · 探索山海，步履不停', mapX, 1370)

  ctx.textAlign = 'right'
  ctx.fillText('KEEP EXPLORING · EVERY STEP COUNTS', width - mapX, 1370)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('生成图片失败，请稍后重试')),
      'image/png',
      1.0
    )
  })
}

export async function downloadFootprintImage(blob?: Blob): Promise<void> {
  const imageBlob = blob || await generateFootprintImage()
  const url = URL.createObjectURL(imageBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `voyager-footprint-${new Date().toISOString().slice(0, 10)}.png`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyFootprintImage(blob?: Blob): Promise<void> {
  const imageBlob = blob || await generateFootprintImage()
  if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': imageBlob })
    ])
  } else {
    throw new Error('当前浏览器不支持直接复制图片到剪贴板，请点击下载保存')
  }
}

export async function shareFootprint(blob?: Blob): Promise<void> {
  const imageBlob = blob || await generateFootprintImage()
  const file = new File([imageBlob], 'voyager-footprint.png', { type: 'image/png' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: '我的旅行足迹 - Voyager',
        text: '看看我去过哪些地方！',
        files: [file],
      })
      return
    } catch {
      // User cancelled or share failed, fallback to download
    }
  }

  await downloadFootprintImage(imageBlob)
}
