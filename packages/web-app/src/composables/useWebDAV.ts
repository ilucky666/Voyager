import { createClient } from 'webdav'
import type { WebDAVClient } from 'webdav'

export interface WebDAVConfig {
  url: string
  user: string
  pass: string
  path: string
}

export function normalizeWebDAVConfig(config: WebDAVConfig): { baseUrl: string; path: string; isJianguo: boolean } {
  const isJianguo = (config.url || '').includes('jianguoyun')
  let cleanUrl = (config.url || '').trim()
  let cleanPath = (config.path || '').trim()

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

  // If user entered a subfolder in the URL (e.g. https://dav.jianguoyun.com/dav/我的坚果云/),
  // extract it into the path
  if (subfolderFromUrl) {
    if (!cleanPath.startsWith(subfolderFromUrl)) {
      cleanPath = subfolderFromUrl + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath)
    }
  }

  if (!cleanPath) {
    cleanPath = isJianguo ? '/我的坚果云/voyager-sync.json' : '/voyager-sync.json'
  }
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath
  }

  // Deduplicate repeated /我的坚果云 to prevent 409 Conflict
  cleanPath = cleanPath.replace(/\/+我的坚果云\/+我的坚果云\//g, '/我的坚果云/')
  cleanPath = cleanPath.replace(/\/+/g, '/')

  let baseUrl = cleanUrl
  if (isJianguo && cleanUrl.includes('dav.jianguoyun.com')) {
    baseUrl = '/webdav-proxy/dav/'
  } else if (!baseUrl.endsWith('/')) {
    baseUrl += '/'
  }

  return { baseUrl, path: cleanPath, isJianguo }
}

export function getWebDAVClient(config: WebDAVConfig): WebDAVClient {
  const norm = normalizeWebDAVConfig(config)

  return createClient(norm.baseUrl, {
    username: config.user,
    password: config.pass,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    }
  })
}

export async function testWebDAVConnection(config: WebDAVConfig): Promise<boolean | string> {
  const norm = normalizeWebDAVConfig(config)
  const client = getWebDAVClient(config)
  const isJianguo = norm.isJianguo
  const defaultPath = isJianguo ? '/我的坚果云/voyager-sync.json' : '/voyager-sync.json'
  const targetPath = (norm.path || defaultPath).trim()

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

  // 2. Try HEAD on target file path
  try {
    await client.customRequest(targetPath, { method: 'HEAD' })
    return true
  } catch (err: any) {
    const status = err?.status || err?.response?.status
    if (status === 401) {
      return `认证失败 (401)：请检查用户名与应用密码`
    }
    if (status === 404 || status === 403 || status === 409) {
      // For Jianguoyun, test /我的坚果云 path if root was checked
      if (isJianguo && !targetPath.includes('我的坚果云')) {
        try {
          await client.customRequest('/我的坚果云/voyager-sync.json', { method: 'HEAD' })
          return true
        } catch (subErr: any) {
          const subStatus = subErr?.status || subErr?.response?.status
          if (subStatus === 404 || subStatus === 409) return true
        }
      }
      if (status === 404 || status === 409) return true
    }
  }

  // 3. Fallback to getDirectoryContents (for standard WebDAV servers)
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
  const isJianguo = norm.isJianguo

  let primaryPath = norm.path
  if (!primaryPath || primaryPath === '/') {
    primaryPath = isJianguo ? '/我的坚果云/voyager-sync.json' : '/voyager-sync.json'
  }

  const uploadCandidates: string[] = [primaryPath]

  if (isJianguo) {
    if (!primaryPath.includes('我的坚果云')) {
      uploadCandidates.push('/我的坚果云' + (primaryPath.startsWith('/') ? primaryPath : '/' + primaryPath))
    } else {
      uploadCandidates.push(primaryPath.replace('/我的坚果云', ''))
    }
    uploadCandidates.push('/我的坚果云/voyager-sync.json')
    uploadCandidates.push('/voyager-sync.json')
  } else {
    uploadCandidates.push('/voyager-sync.json')
  }

  const uniqueCandidates = Array.from(new Set(uploadCandidates.map(p => p.replace(/\/+/g, '/'))))

  let lastError: any = null

  for (const candidatePath of uniqueCandidates) {
    try {
      await client.putFileContents(candidatePath, data, {
        overwrite: true,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      })
      return candidatePath
    } catch (err: any) {
      lastError = err
      const status = err?.status || err?.response?.status

      // 409 Conflict: parent collection doesn't exist, or 403 Forbidden: root not allowed
      if (status === 409 || status === 403) {
        // Attempt to create parent directory if candidatePath has subdirectories
        const lastSlash = candidatePath.lastIndexOf('/')
        if (lastSlash > 0) {
          const parentDir = candidatePath.substring(0, lastSlash)
          try {
            await client.createDirectory(parentDir)
            // Retry upload to this path
            await client.putFileContents(candidatePath, data, {
              overwrite: true,
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
              }
            })
            return candidatePath
          } catch (createDirErr: any) {
            console.warn(`[WebDAV] Could not auto-create directory ${parentDir}:`, createDirErr)
          }
        }
      }
      console.warn(`[WebDAV] Upload candidate ${candidatePath} failed (status ${status}):`, err)
    }
  }

  const status = lastError?.status || lastError?.response?.status
  if (status === 409) {
    throw new Error(`WebDAV 路径冲突 (409)：坚果云上级文件夹可能不存在或路径格式冲突，已尝试自动建夹及备用路径`)
  }
  if (status === 403) {
    throw new Error(`WebDAV 访问被拒绝 (403)：坚果云禁止直接保存在根目录，请确保云端存在 /我的坚果云/ 或指定文件夹`)
  }
  if (status === 401) {
    throw new Error(`WebDAV 认证失败 (401)：请检查坚果云用户名与应用密码`)
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
  const isJianguo = norm.isJianguo

  const candidatePaths: string[] = []
  if (norm.path && norm.path !== '/') {
    candidatePaths.push(norm.path)
    if (isJianguo) {
      if (!norm.path.includes('我的坚果云')) {
        candidatePaths.push('/我的坚果云' + (norm.path.startsWith('/') ? norm.path : '/' + norm.path))
      } else {
        candidatePaths.push(norm.path.replace('/我的坚果云', ''))
      }
    }
  }

  if (isJianguo) {
    candidatePaths.push('/我的坚果云/voyager-sync.json')
    candidatePaths.push('/我的坚果云/voyager.json')
    candidatePaths.push('/voyager-sync.json')
    candidatePaths.push('/voyager.json')
  } else {
    candidatePaths.push('/voyager-sync.json')
    candidatePaths.push('/voyager.json')
    candidatePaths.push('/我的坚果云/voyager-sync.json')
  }

  const uniquePaths = Array.from(new Set(candidatePaths.map(p => p.replace(/\/+/g, '/'))))

  let lastAuthError: Error | null = null
  let lastNetworkError: Error | null = null
  let all404 = true

  for (const path of uniquePaths) {
    try {
      const content = await client.getFileContents(path, {
        format: 'text',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Requested-At': Date.now().toString(),
        }
      })
      if (typeof content === 'string' && content.trim().length > 0) {
        return {
          data: content,
          foundPath: path
        }
      }
    } catch (error: any) {
      const status = error?.status || error?.response?.status
      if (status === 401) {
        lastAuthError = new Error(`WebDAV 认证失败 (401)，请检查账号和应用密码`)
        break
      }
      if (status === 403) {
        lastAuthError = new Error(`WebDAV 访问被拒绝 (403)，请检查坚果云权限及路径`)
        continue
      }
      if (status === 404) {
        continue
      }
      if (status === 409) {
        // 409 on download typically means parent collection does not exist
        continue
      }
      all404 = false
      lastNetworkError = error
      console.warn(`[WebDAV] Error checking path ${path}:`, error)
    }
  }

  if (lastAuthError) {
    throw lastAuthError
  }

  if (lastNetworkError && !all404) {
    throw new Error(`连接云端服务异常 (${lastNetworkError.message || lastNetworkError})，为保护数据已中止`)
  }

  return null
}
