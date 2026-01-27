# DOM 解析器使用指南

## 为什么不使用 metascraper？

**metascraper** 是一个优秀的 Node.js 库，但它依赖 Node.js 环境的特性（如 `process` 对象），无法在浏览器扩展中直接使用。

### 问题

```
ReferenceError: process is not defined
```

这是因为：
1. metascraper 依赖 Node.js 的 `process.env`
2. 浏览器环境没有 `process` 对象
3. 即使使用 polyfill，也会引入大量不必要的代码

### 解决方案

使用浏览器原生的 **DOMParser** API 来解析 HTML 和提取元数据。

## DOMParser 基础

### 创建解析器

```typescript
const parser = new DOMParser()
const doc = parser.parseFromString(htmlString, 'text/html')
```

### 查询元素

```typescript
// 单个元素
const title = doc.querySelector('h1')
const content = doc.querySelector('.article-content')

// 多个元素
const paragraphs = doc.querySelectorAll('p')

// 属性
const metaDescription = doc.querySelector('meta[name="description"]')
  ?.getAttribute('content')
```

## 提取元数据的最佳实践

### 1. 标题提取

优先级顺序：
1. 页面特定的标题元素（如 `.header h1`）
2. 第一个 `<h1>` 标签
3. `<title>` 标签
4. meta 标签中的 og:title

```typescript
function extractTitle(doc: Document): string {
  // 1. 特定选择器
  const specificTitle = doc.querySelector('.header h1, .article-title h1')
  if (specificTitle?.textContent) {
    return specificTitle.textContent.trim()
  }

  // 2. 第一个 h1
  const h1 = doc.querySelector('h1')
  if (h1?.textContent) {
    return h1.textContent.trim()
  }

  // 3. title 标签
  if (doc.title) {
    return doc.title.trim()
  }

  // 4. og:title
  const ogTitle = doc.querySelector('meta[property="og:title"]')
    ?.getAttribute('content')
  if (ogTitle) {
    return ogTitle.trim()
  }

  return '未知标题'
}
```

### 2. 作者提取

```typescript
function extractAuthor(doc: Document): string | undefined {
  // 1. 特定选择器
  const authorEl = doc.querySelector('.author, .byline, [rel="author"]')
  if (authorEl?.textContent) {
    return authorEl.textContent.trim()
  }

  // 2. meta 标签
  const metaAuthor = doc.querySelector('meta[name="author"]')
    ?.getAttribute('content')
  if (metaAuthor) {
    return metaAuthor.trim()
  }

  // 3. JSON-LD
  const jsonLd = doc.querySelector('script[type="application/ld+json"]')
  if (jsonLd?.textContent) {
    try {
      const data = JSON.parse(jsonLd.textContent)
      if (data.author?.name) {
        return data.author.name
      }
    } catch (e) {
      // 忽略解析错误
    }
  }

  return undefined
}
```

### 3. 日期提取

```typescript
function extractDate(doc: Document): string | undefined {
  // 1. time 标签
  const timeEl = doc.querySelector('time[datetime]')
  const datetime = timeEl?.getAttribute('datetime')
  if (datetime) {
    return datetime
  }

  // 2. meta 标签
  const metaDate = doc.querySelector(
    'meta[property="article:published_time"], meta[name="date"]'
  )?.getAttribute('content')
  if (metaDate) {
    return metaDate
  }

  // 3. 从文本中提取
  const dateText = doc.querySelector('.date, .published, .timestamp')?.textContent
  if (dateText) {
    // 匹配常见日期格式
    const dateMatch = dateText.match(/\d{4}-\d{2}-\d{2}|\d+\s+(分钟|小时|天)前/)
    if (dateMatch) {
      return dateMatch[0]
    }
  }

  return undefined
}
```

### 4. 描述提取

```typescript
function extractDescription(doc: Document, contentEl?: Element): string {
  // 1. meta description
  const metaDesc = doc.querySelector('meta[name="description"]')
    ?.getAttribute('content')
  if (metaDesc) {
    return metaDesc.trim()
  }

  // 2. og:description
  const ogDesc = doc.querySelector('meta[property="og:description"]')
    ?.getAttribute('content')
  if (ogDesc) {
    return ogDesc.trim()
  }

  // 3. 正文前 200 字符
  if (contentEl) {
    const text = contentEl.textContent?.trim() || ''
    return text.substring(0, 200) + (text.length > 200 ? '...' : '')
  }

  return ''
}
```

### 5. 正文内容提取

```typescript
function extractContent(doc: Document): string | null {
  // 定义可能的内容选择器（按优先级）
  const selectors = [
    '.article-content',
    '.post-content',
    '.entry-content',
    'article',
    '.content',
    'main'
  ]

  for (const selector of selectors) {
    const element = doc.querySelector(selector)
    if (element) {
      return element.innerHTML
    }
  }

  return null
}
```

## V2EX 处理器示例

```typescript
export async function extractArticle(
  html?: string,
  url?: string
): Promise<ArticleContent | null> {
  const doc = html 
    ? new DOMParser().parseFromString(html, 'text/html') 
    : document

  // 提取正文
  const contentEl = doc.querySelector('.topic_content')
  if (!contentEl) return null

  // 提取元数据
  const titleEl = doc.querySelector('.header h1, h1')
  const authorEl = doc.querySelector('.header .gray a:first-child')
  const nodeEl = doc.querySelector('.header .gray a[href^="/go/"]')
  const dateEl = doc.querySelector('.header .gray')

  // 解析日期
  let date: string | undefined
  if (dateEl) {
    const dateText = dateEl.textContent || ''
    const dateMatch = dateText.match(/\d{4}-\d{2}-\d{2}|\d+\s+(分钟|小时|天)前/)
    date = dateMatch ? dateMatch[0] : undefined
  }

  // 提取描述
  let description = doc.querySelector('meta[name="description"]')
    ?.getAttribute('content')
  if (!description) {
    const textContent = contentEl.textContent?.trim() || ''
    description = textContent.substring(0, 200) + 
      (textContent.length > 200 ? '...' : '')
  }

  return {
    title: titleEl?.textContent?.trim() || doc.title || '',
    author: authorEl?.textContent?.trim(),
    date,
    content: contentEl.innerHTML || '',
    tags: nodeEl ? [nodeEl.textContent?.trim() || ''] : [],
    meta: {
      node: nodeEl?.textContent?.trim(),
      description,
      url: url || window.location.href
    }
  }
}
```

## 性能优化

### 1. 缓存选择器结果

```typescript
const cache = new Map<string, Element | null>()

function querySelector(doc: Document, selector: string): Element | null {
  if (cache.has(selector)) {
    return cache.get(selector)!
  }
  const element = doc.querySelector(selector)
  cache.set(selector, element)
  return element
}
```

### 2. 使用 XPath（更快）

```typescript
function getElementByXPath(doc: Document, xpath: string): Element | null {
  const result = doc.evaluate(
    xpath,
    doc,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  )
  return result.singleNodeValue as Element | null
}

// 示例
const title = getElementByXPath(doc, '//h1[@class="title"]')
```

### 3. 避免重复解析

```typescript
const parsedDocs = new WeakMap<string, Document>()

function parseHTML(html: string): Document {
  const cached = parsedDocs.get(html)
  if (cached) return cached

  const doc = new DOMParser().parseFromString(html, 'text/html')
  parsedDocs.set(html, doc)
  return doc
}
```

## 错误处理

```typescript
function safeExtract<T>(
  extractor: () => T,
  fallback: T
): T {
  try {
    return extractor()
  } catch (error) {
    console.warn('提取失败:', error)
    return fallback
  }
}

// 使用
const title = safeExtract(
  () => doc.querySelector('h1')!.textContent!.trim(),
  '未知标题'
)
```

## 调试技巧

### 1. 在控制台测试选择器

```javascript
// 测试当前页面
document.querySelector('.article-content')

// 测试 HTML 字符串
const parser = new DOMParser()
const doc = parser.parseFromString(htmlString, 'text/html')
doc.querySelector('.article-content')
```

### 2. 查看解析后的 DOM 结构

```javascript
console.log(doc.documentElement.outerHTML)
```

### 3. 检查元素是否存在

```javascript
const element = doc.querySelector('.content')
console.log('存在:', !!element)
console.log('内容:', element?.textContent)
```

## 常见问题

### Q: DOMParser 支持哪些格式？

A: 支持 `text/html`、`text/xml`、`application/xml`、`application/xhtml+xml`、`image/svg+xml`

### Q: 如何处理格式错误的 HTML？

A: DOMParser 会尽力解析，但可能产生意外结果。建议先验证 HTML 格式。

### Q: 性能如何？

A: DOMParser 是浏览器原生 API，性能优秀。对于大型 HTML（>1MB），考虑使用流式解析。

### Q: 如何提取 JavaScript 渲染的内容？

A: DOMParser 只能解析静态 HTML。对于 SPA，需要在实际页面中执行 JavaScript 后再提取。

## 相关资源

- [MDN: DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser)
- [MDN: querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)
- [MDN: XPath](https://developer.mozilla.org/en-US/docs/Web/XPath)
