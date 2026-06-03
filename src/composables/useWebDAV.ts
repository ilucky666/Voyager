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
  try {
    const client = getWebDAVClient(config)
    await client.getDirectoryContents('/')
    return true
  } catch (error: any) {
    console.error('WebDAV connection failed:', error)
    return error.message || String(error)
  }
}

export async function uploadToWebDAV(config: WebDAVConfig, data: string): Promise<void> {
  const client = getWebDAVClient(config)
  await client.putFileContents(config.path || '/voyager-sync.json', data, { overwrite: true })
}

export async function downloadFromWebDAV(config: WebDAVConfig): Promise<string | null> {
  const client = getWebDAVClient(config)
  try {
    if (await client.exists(config.path || '/voyager-sync.json')) {
      const data = await client.getFileContents(config.path || '/voyager-sync.json', { format: 'text' })
      return data as string
    }
    return null
  } catch (error) {
    console.error('WebDAV download failed:', error)
    return null
  }
}
