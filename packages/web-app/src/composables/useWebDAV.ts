import { createClient } from 'webdav'
import type { WebDAVClient } from 'webdav'

export interface WebDAVConfig {
  url: string
  user: string
  pass: string
  path: string
}

export function getWebDAVClient(config: WebDAVConfig): WebDAVClient {
  let finalUrl = config.url
  // Use proxy for Jianguoyun to bypass CORS in both dev and prod
  if (finalUrl.includes('dav.jianguoyun.com')) {
    try {
      const urlObj = new URL(finalUrl)
      let pathname = urlObj.pathname
      if (!pathname.endsWith('/')) {
        pathname += '/'
      }
      finalUrl = '/webdav-proxy' + pathname
    } catch {
      finalUrl = finalUrl.replace('https://dav.jianguoyun.com', '/webdav-proxy')
    }
  }

  return createClient(finalUrl, {
    username: config.user,
    password: config.pass
  })
}

export async function testWebDAVConnection(config: WebDAVConfig): Promise<boolean | string> {
  const client = getWebDAVClient(config)
  const isJianguo = config.url.includes('jianguoyun')
  const defaultPath = isJianguo ? '/我的坚果云/voyager-sync.json' : '/voyager-sync.json'
  const targetPath = (config.path || defaultPath).trim()

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
    if (status === 404 || status === 403) {
      // For Jianguoyun, test /我的坚果云 path if root was checked
      if (isJianguo && !targetPath.includes('我的坚果云')) {
        try {
          await client.customRequest('/我的坚果云/voyager-sync.json', { method: 'HEAD' })
          return true
        } catch (subErr: any) {
          const subStatus = subErr?.status || subErr?.response?.status
          if (subStatus === 404) return true
        }
      }
      if (status === 404) return true
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
  const client = getWebDAVClient(config)
  const isJianguo = config.url.includes('jianguoyun')

  let targetPath = (config.path || '').trim()
  if (!targetPath) {
    targetPath = isJianguo ? '/我的坚果云/voyager-sync.json' : '/voyager-sync.json'
  }
  if (!targetPath.startsWith('/')) {
    targetPath = '/' + targetPath
  }
  // Jianguoyun does not allow creating files directly in /dav/ root; enforce /我的坚果云 prefix
  if (isJianguo && !targetPath.includes('我的坚果云')) {
    targetPath = '/我的坚果云' + targetPath
  }

  try {
    await client.putFileContents(targetPath, data, { overwrite: true })
    return targetPath
  } catch (err: any) {
    const status = err?.status || err?.response?.status
    if (status === 403 && !targetPath.includes('我的坚果云') && isJianguo) {
      const jiangguoPath = '/我的坚果云' + targetPath
      await client.putFileContents(jiangguoPath, data, { overwrite: true })
      return jiangguoPath
    }
    throw err
  }
}

export interface WebDAVDownloadResult {
  data: string
  foundPath: string
}

export async function downloadFromWebDAV(config: WebDAVConfig): Promise<WebDAVDownloadResult | null> {
  const client = getWebDAVClient(config)
  const isJianguo = config.url.includes('jianguoyun')

  const userPath = (config.path || '').trim()
  const candidatePaths: string[] = []

  if (userPath) {
    const norm = userPath.startsWith('/') ? userPath : '/' + userPath
    if (isJianguo && !norm.includes('我的坚果云')) {
      candidatePaths.push('/我的坚果云' + norm)
    }
    candidatePaths.push(norm)
  }

  // Prioritize Jianguoyun default folder if Jianguoyun
  if (isJianguo) {
    candidatePaths.push('/我的坚果云/voyager-sync.json')
    candidatePaths.push('/我的坚果云/voyager.json')
    candidatePaths.push('/voyager-sync.json')
    candidatePaths.push('/voyager.json')
  } else {
    candidatePaths.push('/voyager-sync.json')
    candidatePaths.push('/voyager.json')
    candidatePaths.push('/我的坚果云/voyager-sync.json')
    candidatePaths.push('/我的坚果云/voyager.json')
  }

  // Deduplicate candidate paths
  const uniquePaths = Array.from(new Set(candidatePaths))

  let lastAuthError: Error | null = null

  for (const path of uniquePaths) {
    try {
      // Direct GET without PROPFIND to bypass Netlify proxy 405 limitations
      const content = await client.getFileContents(path, { format: 'text' })
      if (typeof content === 'string' && content.trim().length > 0) {
        return {
          data: content,
          foundPath: path
        }
      }
    } catch (error: any) {
      const status = error?.status || error?.response?.status
      if (status === 401) {
        // 401 means invalid credentials across all endpoints
        lastAuthError = new Error(`WebDAV 认证失败 (401)，请检查账号和应用密码`)
        break
      }
      if (status === 403) {
        // 403 on Jianguoyun root folder is expected because /dav/ root cannot hold files.
        // DO NOT break! Continue to check /我的坚果云/ candidate paths!
        lastAuthError = new Error(`WebDAV 访问被拒绝 (403)，已尝试其他兼容路径`)
        continue
      }
      if (status === 404) {
        // Path does not exist, continue checking other candidate paths
        continue
      }
      console.warn(`[WebDAV] Error checking path ${path}:`, error)
    }
  }

  // Only throw if 401 authentication failed
  if (lastAuthError && lastAuthError.message.includes('401')) {
    throw lastAuthError
  }

  return null
}
