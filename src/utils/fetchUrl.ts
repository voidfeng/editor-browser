/**
 * 通过 background service worker 发起跨域请求
 */

interface FetchResponse {
  success: boolean
  html?: string
  error?: string
}

/**
 * 获取指定 URL 的 HTML 内容
 * 通过 background script 发起请求以绕过 CORS 限制
 */
export async function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'FETCH_URL',
        url
      },
      (response: FetchResponse) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }

        if (response.success && response.html) {
          resolve(response.html)
        } else {
          reject(new Error(response.error || '获取内容失败'))
        }
      }
    )
  })
}
