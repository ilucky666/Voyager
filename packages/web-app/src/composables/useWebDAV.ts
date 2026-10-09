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
    // If we have a path like https://dav.jianguoyun.com/dav/, we extract the pathname and append it to our proxy
    try {
      const urlObj = new URL(finalUrl)
      finalUrl = '/webdav-proxy' + urlObj.pathname
    } catch (e) {
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
  const targetPath = (config.path || '/voyager-sync.json').trim()

  // 1. Try OPTIONS on root (standard HTTP method supported by all reverse proxies)
  try {
    await client.customRequest('/', { method: 'OPTIONS' })
    return true
  } catch (err: any) {
    const status = err?.status || err?.response?.status
    if (status === 401 || status === 403) {
      return `认证失败 (${status})：请检查用户名与应用密码`
    }
  }

  // 2. Try HEAD on target file path
  try {
    await client.customRequest(targetPath, { method: 'HEAD' })
    return true
  } catch (err: any) {
    const status = err?.status || err?.response?.status
    if (status === 401 || status === 403) {
      return `认证失败 (${status})：请检查用户名与应用密码`
    }
    if (status === 404) {
      // 404 means server reached and authenticated, file simply not created yet
      return true
    }
  }

  // 3. Fallback to getDirectoryContents (in non-proxy or standard WebDAV server)
  try {
    await client.getDirectoryContents('/')
    return true
  } catch (error: any) {
    const status = error?.status || error?.response?.status
    if (status === 401 || status === 403) {
      return `认证失败 (${status})：请检查用户名与应用密码`
    }
    console.error('WebDAV connection failed:', error)
    return error.message || String(error)
  }
}

export async function uploadToWebDAV(config: WebDAVConfig, data: string): Promise<string> {
  const client = getWebDAVClient(config)
  let targetPath = (config.path || '/voyager-sync.json').trim()
  if (!targetPath.startsWith('/')) {
    targetPath = '/' + targetPath
  }

  try {
    await client.putFileContents(targetPath, data, { overwrite: true })
    return targetPath
  } catch (err: any) {
    const status = err?.status || err?.response?.status
    // Jianguoyun root folder restriction (403 forbidden to create files directly in /dav/)
    if (status === 403 && !targetPath.includes('我的坚果云') && config.url.includes('jianguoyun')) {
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

  const userPath = (config.path || '').trim()
  const candidatePaths: string[] = []

  if (userPath) {
    candidatePaths.push(userPath.startsWith('/') ? userPath : '/' + userPath)
  }
  candidatePaths.push('/voyager-sync.json')
  candidatePaths.push('/voyager.json')
  candidatePaths.push('/我的坚果云/voyager-sync.json')
  candidatePaths.push('/我的坚果云/voyager.json')

  // Deduplicate candidate paths
  const uniquePaths = Array.from(new Set(candidatePaths))

  let lastAuthError: Error | null = null

  for (const path of uniquePaths) {
    try {
      // Direct GET without PROPFIND / exists to ensure full compatibility with Netlify proxy
      const content = await client.getFileContents(path, { format: 'text' })
      if (typeof content === 'string' && content.trim().length > 0) {
        return {
          data: content,
          foundPath: path
        }
      }
    } catch (error: any) {
      const status = error?.status || error?.response?.status
      if (status === 401 || status === 403) {
        lastAuthError = new Error(`WebDAV 认证失败 (${status})，请检查账号和应用密码`)
        break
      }
      if (status === 404) {
        // Continue checking other candidates
        continue
      }
      console.warn(`[WebDAV] Error checking path ${path}:`, error)
    }
  }

  if (lastAuthError) {
    throw lastAuthError
  }

  return null
}
