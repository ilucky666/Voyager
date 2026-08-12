import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import zlib from 'zlib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons')

if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true })

function createPNG(size) {
  const width = size
  const height = size
  const centerX = width / 2
  const centerY = height / 2
  const radius = size * 0.38

  const rawData = Buffer.alloc((width * 3 + 1) * height)

  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 3 + 1)
    rawData[rowStart] = 0
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 3
      const dx = x - centerX
      const dy = y - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist <= radius) {
        const cornerRadius = size * 0.18
        const inRoundedRect = isInRoundedRect(x, y, width, height, cornerRadius)
        if (inRoundedRect) {
          rawData[px] = 26
          rawData[px + 1] = 115
          rawData[px + 2] = 232
        } else {
          rawData[px] = 0
          rawData[px + 1] = 0
          rawData[px + 2] = 0
          rawData[px + 3] = 0
        }
      } else {
        rawData[px] = 255
        rawData[px + 1] = 255
        rawData[px + 2] = 255
      }
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = createChunk('IHDR', (() => {
    const buf = Buffer.alloc(13)
    buf.writeUInt32BE(width, 0)
    buf.writeUInt32BE(height, 4)
    buf[8] = 8
    buf[9] = 2
    buf[10] = 0
    buf[11] = 0
    buf[12] = 0
    return buf
  })())

  const compressed = zlib.deflateSync(rawData)
  const idat = createChunk('IDAT', compressed)

  const iend = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

function isInRoundedRect(x, y, w, h, r) {
  const margin = w * 0.05
  const left = margin
  const right = w - margin
  const top = margin
  const bottom = h - margin

  if (x < left || x > right || y < top || y > bottom) return false

  const corners = [
    { cx: left + r, cy: top + r },
    { cx: right - r, cy: top + r },
    { cx: left + r, cy: bottom - r },
    { cx: right - r, cy: bottom - r },
  ]

  for (const c of corners) {
    const inCornerX = (x < c.cx && x > c.cx - r) || (x > c.cx && x < c.cx + r)
    const inCornerY = (y < c.cy && y > c.cy - r) || (y > c.cy && y < c.cy + r)
    if (inCornerX && inCornerY) {
      const dx = x - c.cx
      const dy = y - c.cy
      if (dx * dx + dy * dy > r * r) return false
    }
  }

  return true
}

function createChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)

  const typeBuffer = Buffer.from(type, 'ascii')
  const crcData = Buffer.concat([typeBuffer, data])
  const crc = crc32(crcData)
  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc, 0)

  return Buffer.concat([length, typeBuffer, data, crcBuffer])
}

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

for (const size of [192, 512]) {
  const png = createPNG(size)
  const filePath = path.join(ICONS_DIR, `icon-${size}.png`)
  fs.writeFileSync(filePath, png)
  console.log(`✓ icon-${size}.png (${png.length} bytes)`)
}

console.log('Done!')
