/**
 * Background Service Worker
 * 处理跨域请求等需要特殊权限的操作
 */

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_URL') {
    // 发起跨域请求
    fetchUrl(request.url)
      .then((html) => {
        sendResponse({ success: true, html })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })

    // 返回 true 表示异步响应
    return true
  }
})

/**
 * 使用 fetch API 获取 URL 内容
 */
async function fetchUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.text()
  } catch (error) {
    console.error('Background fetch error:', error)
    throw error
  }
}

console.log('Background service worker loaded')
