import { createClient } from 'webdav'
import type { WebDAVClient } from 'webdav'

export interface WebDAVConfig {
  url: string
  user: string
  pass: string
  path: string
}

export function normalizeWebDAVConfig(config: WebDAVConfig): {
  baseUrl: string
  primaryPath: string
  candidatePaths: string[]
  isJianguo: boolean
} {
  const isJianguo = (config.url || '').includes('jianguoyun')
  const cleanUrl = (config.url || '').trim()
  let rawPath = (config.path || '').trim()

  let subfolderFromUrl = ''
  if (isJianguo && cleanUrl.includes('dav.jianguoyun.com')) {
    try {
      const u = new URL(cleanUrl)
      let p = decodeURIComponent(u.pathname)
      p = p.replace(/^\/webdav-proxy/, '')
      if (p.startsWith('/dav')) {
        p = p.substring(4)
      }
      p = p.replace(/\/+$/, '')
      if (p && p !== '/') {
        subfolderFromUrl = p.startsWith('/') ? p : '/' + p
      }
    } catch {}
  }

  let baseUrl = cleanUrl
  if (isJianguo && cleanUrl.includes('dav.jianguoyun.com')) {
    baseUrl = '/webdav-proxy/dav/'
  } else if (baseUrl && !baseUrl.endsWith('/')) {
    baseUrl += '/'
  }

  if (!rawPath || rawPath === '/') {
    rawPath = '/voyager-sync.json'
  }
  if (!rawPath.startsWith('/')) {
    rawPath = '/' + rawPath
  }
  if (rawPath.endsWith('/')) {
    rawPath += 'voyager-sync.json'
  }

  // Collapse duplicate slashes and repeated folder prefixes
  rawPath = rawPath.replace(/\/+/g, '/')
  rawPath = rawPath.replace(/^(\/[^/]+)\1\//, '$1/')

  let primaryPath = rawPath
  if (isJianguo) {
    if (subfolderFromUrl) {
      // Heal paths where '/我的坚果云' was previously prepended onto a different URL subfolder (e.g. /data)
      if (subfolderFromUrl !== '/我的坚果云' && primaryPath.startsWith('/我的坚果云/')) {
        primaryPath = primaryPath.substring('/我的坚果云'.length)
      }
      if (!primaryPath.startsWith(subfolderFromUrl + '/')) {
        primaryPath = subfolderFromUrl + (primaryPath.startsWith('/') ? primaryPath : '/' + primaryPath)
      }
    } else {
      // No subfolder in URL (e.g. https://dav.jianguoyun.com/dav/)
      // Jianguoyun prohibits files directly in /dav/ root (returns 403/409)
      if (primaryPath === '/voyager-sync.json' || primaryPath === '/voyager.json') {
        primaryPath = '/data/voyager-sync.json'
      }
    }
  }

  primaryPath = primaryPath.replace(/\/+/g, '/')
  primaryPath = primaryPath.replace(/^(\/[^/]+)\1\//, '$1/')

  const candidates: string[] = []
  if (isJianguo) {
    if (subfolderFromUrl) {
      candidates.push(primaryPath)
      candidates.push(`${subfolderFromUrl}/voyager-sync.json`)
      candidates.push(`${subfolderFromUrl}/voyager.json`)
      candidates.push('/data/voyager-sync.json')
      candidates.push('/我的坚果云/voyager-sync.json')
    } else {
      candidates.push('/data/voyager-sync.json')
      candidates.push(primaryPath)
      candidates.push('/我的坚果云/voyager-sync.json')
      candidates.push('/data/voyager.json')
      candidates.push('/我的坚果云/voyager.json')
    }
  } else {
    candidates.push(primaryPath)
    candidates.push('/voyager-sync.json')
    candidates.push('/voyager.json')
  }

  const candidatePaths = Array.from(
    new Set(candidates.map(p => p.replace(/\/+/g, '/').replace(/^(\/[^/]+)\1\//, '$1/')))
  )

  return {
    baseUrl,
    primaryPath: candidatePaths[0] || primaryPath,
    candidatePaths,
    isJianguo,
  }
}

export function getWebDAVClient(config: WebDAVConfig): WebDAVClient {
  const norm = normalizeWebDAVConfig(config)

  return createClient(norm.baseUrl, {
    username: config.user,
    password: config.pass,
  })
}

export async function testWebDAVConnection(config: WebDAVConfig): Promise<boolean | string> {
  const norm = normalizeWebDAVConfig(config)
  const client = getWebDAVClient(config)

  // 1. Try OPTIONS on root (standard HTTP method supported by reverse proxies)
  try {
    await client.customRequest('/', { method: 'OPTIONS' })
    return true
  } catch (err: any) {
    const status = err?.status || err?.response?.status
    if (status === 401) {
      return `认证失败 (401)：请检查用户名与应用密码`
    }
  }

  // 2. Try HEAD on candidate paths
  for (const path of norm.candidatePaths) {
    try {
      await client.customRequest(path, { method: 'HEAD' })
      return true
    } catch (err: any) {
      const status = err?.status || err?.response?.status
      if (status === 401) {
        return `认证失败 (401)：请检查用户名与应用密码`
      }
      if (status === 404) {
        // 404 means server reached and authenticated, file simply not created yet
        return true
      }
    }
  }

  // 3. Fallback to getDirectoryContents (for non-proxy standard WebDAV servers)
  try {
    await client.getDirectoryContents('/')
    return true
  } catch (error: any) {
    const status = error?.status || error?.response?.status
    if (status === 401) {
      return `认证失败 (401)：请检查用户名与应用密码`
    }
    console.error('WebDAV connection failed:', error)
    return error.message || String(error)
  }
}

export async function uploadToWebDAV(config: WebDAVConfig, data: string): Promise<string> {
  const norm = normalizeWebDAVConfig(config)
  const client = getWebDAVClient(config)

  let lastError: any = null

  for (const candidatePath of norm.candidatePaths) {
    // Only try uploading to .json paths (prefer voyager-sync.json)
    if (candidatePath.endsWith('/voyager.json') && norm.candidatePaths.length > 1) {
      continue
    }
    try {
      await client.putFileContents(candidatePath, data, { overwrite: true })
      return candidatePath
    } catch (err: any) {
      lastError = err
      const status = err?.status || err?.response?.status
      if (status === 401) {
        throw new Error(`WebDAV 认证失败 (401)：请检查坚果云用户名与应用密码`)
      }
      // On 403 or 409, continue to the next candidate folder path (e.g. /data/voyager-sync.json or /我的坚果云/voyager-sync.json)
      if (status === 403 || status === 409 || status === 404) {
        console.warn(`[WebDAV] Upload candidate ${candidatePath} returned ${status}, trying next candidate...`)
        continue
      }
      throw err
    }
  }

  const status = lastError?.status || lastError?.response?.status
  if (status === 409) {
    throw new Error(`WebDAV 路径冲突 (409)：请确认坚果云中已存在对应的同步文件夹（如 data 或 我的坚果云）`)
  }
  if (status === 403) {
    throw new Error(`WebDAV 访问被拒绝 (403)：坚果云禁止直接保存在根目录，请使用子文件夹路径`)
  }

  throw lastError
}

export interface WebDAVDownloadResult {
  data: string
  foundPath: string
}

export async function downloadFromWebDAV(config: WebDAVConfig): Promise<WebDAVDownloadResult | null> {
  const norm = normalizeWebDAVConfig(config)
  const client = getWebDAVClient(config)

  for (const path of norm.candidatePaths) {
    try {
      // Direct GET without PROPFIND to ensure full compatibility with Netlify proxy
      const content = await client.getFileContents(path, { format: 'text' })
      if (typeof content === 'string' && content.trim().length > 0) {
        return {
          data: content,
          foundPath: path,
        }
      }
    } catch (error: any) {
      const status = error?.status || error?.response?.status
      if (status === 401) {
        throw new Error(`WebDAV 认证失败 (401)，请检查账号和应用密码`)
      }
      if (status === 403 || status === 404 || status === 409) {
        // Candidate path does not exist or root forbidden; continue checking next candidate
        continue
      }
      console.warn(`[WebDAV] Error checking path ${path}:`, error)
    }
  }

  return null
}
