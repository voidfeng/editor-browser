# Background Service Worker 指南

## 概述

为了解决 Content Script 的跨域限制问题，我们使用 Chrome Extension 的 Background Service Worker 来处理需要特殊权限的操作。

## 架构设计

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│  Content Script │ ──msg──> │ Background Worker│ ──http─> │ 目标网站    │
│  (网页上下文)    │ <─res──  │  (扩展上下文)     │ <─html─  │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
```

## 为什么需要 Background Worker？

### Content Script 的限制

Content Script 运行在网页的上下文中，受到以下限制：

1. **同源策略 (CORS)**：无法直接 fetch 其他域名的内容
2. **权限限制**：无法访问某些 Chrome API
3. **安全沙箱**：与扩展的其他部分隔离

### Background Worker 的优势

1. **跨域请求**：不受 CORS 限制，可以访问任意 URL
2. **完整权限**：可以使用所有 Chrome Extension API
3. **持久运行**：在后台持续运行，处理各种任务

## 实现细节

### 1. Background Worker (`src/background.ts`)

```typescript
// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_URL') {
    fetchUrl(request.url)
      .then((html) => sendResponse({ success: true, html }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true // 异步响应
  }
})
```

### 2. 工具函数 (`src/utils/fetchUrl.ts`)

```typescript
export async function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'FETCH_URL', url },
      (response) => {
        if (response.success) {
          resolve(response.html)
        } else {
          reject(new Error(response.error))
        }
      }
    )
  })
}
```

### 3. 在组件中使用

```typescript
import { fetchUrl } from '@/utils/fetchUrl'

// 获取远程页面内容
const html = await fetchUrl('https://example.com/article')
```

## Manifest 配置

```typescript
{
  manifest_version: 3,
  permissions: ['activeTab', 'storage'],
  host_permissions: ['<all_urls>'], // 允许访问所有网站
  background: {
    service_worker: 'src/background.ts',
    type: 'module'
  }
}
```

## 消息传递协议

### 请求格式

```typescript
{
  type: 'FETCH_URL',
  url: string
}
```

### 响应格式

```typescript
// 成功
{
  success: true,
  html: string
}

// 失败
{
  success: false,
  error: string
}
```

## 扩展功能

### 添加新的消息类型

在 `background.ts` 中添加新的消息处理：

```typescript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'FETCH_URL':
      // 处理 URL 获取
      break
    
    case 'SAVE_DATA':
      // 处理数据保存
      break
    
    case 'GET_STORAGE':
      // 处理存储读取
      break
  }
  return true
})
```

### 添加缓存机制

```typescript
const cache = new Map<string, { html: string; timestamp: number }>()

async function fetchUrl(url: string): Promise<string> {
  // 检查缓存
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.html
  }

  // 发起请求
  const response = await fetch(url)
  const html = await response.text()

  // 更新缓存
  cache.set(url, { html, timestamp: Date.now() })

  return html
}
```

## 调试技巧

### 查看 Background Worker 日志

1. 打开 Chrome 扩展管理页面：`chrome://extensions/`
2. 找到你的扩展，点击"检查视图"下的"service worker"
3. 在打开的 DevTools 中查看日志

### 测试消息传递

在 Content Script 的控制台中测试：

```javascript
chrome.runtime.sendMessage(
  { type: 'FETCH_URL', url: 'https://www.v2ex.com/t/123456' },
  (response) => console.log(response)
)
```

## 安全考虑

1. **验证 URL**：在发起请求前验证 URL 格式
2. **限制域名**：可以添加白名单，只允许特定域名
3. **内容过滤**：对返回的 HTML 进行安全检查
4. **错误处理**：妥善处理网络错误和超时

## 性能优化

1. **请求缓存**：避免重复请求相同的 URL
2. **并发控制**：限制同时进行的请求数量
3. **超时设置**：为请求设置合理的超时时间
4. **内容压缩**：使用 gzip 等压缩算法

## 常见问题

### Q: 为什么不直接在 Content Script 中使用 fetch？

A: Content Script 受到同源策略限制，无法跨域请求。Background Worker 不受此限制。

### Q: Service Worker 会一直运行吗？

A: Manifest V3 的 Service Worker 是事件驱动的，空闲时会自动休眠，有消息时自动唤醒。

### Q: 如何处理大文件下载？

A: 可以使用流式传输或分块下载，避免一次性加载大量数据到内存。

### Q: 支持哪些 HTTP 方法？

A: 支持所有标准 HTTP 方法（GET、POST、PUT、DELETE 等），可以在 fetch 中配置。

## 相关文档

- [Chrome Extension Messaging](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [Service Workers](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Host Permissions](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/)
