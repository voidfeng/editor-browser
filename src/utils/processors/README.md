# 页面处理器系统

## 概述

页面处理器系统会根据当前网站的域名自动加载对应的处理器文件，无需手动注册。

## 工作原理

1. **域名映射**：`index.ts` 中的 `domainMap` 定义了域名到处理器文件的映射
2. **动态加载**：根据当前页面域名，动态导入对应的处理器模块
3. **模块缓存**：已加载的处理器会被缓存，避免重复加载

## 使用方法

### 在应用中使用

```typescript
import { extractCurrentList, extractCurrentArticle, isProcessorAvailable } from '@/utils/processors'

// 检查当前网站是否支持
const isSupported = await isProcessorAvailable()
if (!isSupported) {
  console.log('当前网站暂不支持')
  return
}

// 提取列表数据（异步）
const listItems = await extractCurrentList()
console.log('列表项:', listItems)

// 提取文章内容（异步）
const article = await extractCurrentArticle()
console.log('文章内容:', article)
```

### 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { extractCurrentList, extractCurrentArticle } from '@/utils/processors'
import type { ListItem, ArticleContent } from '@/utils/processors'

const listItems = ref<ListItem[]>([])
const article = ref<ArticleContent | null>(null)

onMounted(async () => {
  // 提取列表
  listItems.value = await extractCurrentList()

  // 提取文章
  article.value = await extractCurrentArticle()
})
</script>
```

## 添加新网站处理器

### 步骤 1：创建处理器文件

在 `src/utils/processors/` 目录下创建新文件，例如 `zhihu.ts`：

```typescript
import metascraper from 'metascraper'
import metascraperAuthor from 'metascraper-author'
import metascraperDate from 'metascraper-date'
import metascraperDescription from 'metascraper-description'
import metascraperTitle from 'metascraper-title'
import metascraperUrl from 'metascraper-url'
import type { ListItem, ArticleContent } from './types'

const scraper = metascraper([
  metascraperAuthor(),
  metascraperDate(),
  metascraperDescription(),
  metascraperTitle(),
  metascraperUrl()
])

const config = {
  name: '知乎',
  listItemSelector: '.List-item',
  contentSelector: '.Post-RichTextContainer'
}

export function extractList(doc: Document = document): ListItem[] {
  const items: ListItem[] = []
  const elements = doc.querySelectorAll(config.listItemSelector)

  elements.forEach((element) => {
    const titleEl = element.querySelector('.ContentItem-title a')
    if (!titleEl) return

    items.push({
      title: titleEl.textContent?.trim() || '',
      url: titleEl.getAttribute('href') || '',
      author: element.querySelector('.AuthorInfo-name')?.textContent?.trim(),
      excerpt: element.querySelector('.RichContent-inner')?.textContent?.trim()
    })
  })

  return items
}

export async function extractArticle(html?: string, url?: string): Promise<ArticleContent | null> {
  const pageHtml = html || document.documentElement.outerHTML
  const pageUrl = url || window.location.href

  const metadata = await scraper({ html: pageHtml, url: pageUrl })
  const doc = html ? new DOMParser().parseFromString(html, 'text/html') : document
  const contentEl = doc.querySelector(config.contentSelector)

  if (!contentEl) return null

  return {
    title: metadata.title || '',
    author: metadata.author,
    date: metadata.date,
    content: contentEl.innerHTML || '',
    meta: {
      description: metadata.description,
      url: metadata.url
    }
  }
}

export default config
```

### 步骤 2：注册域名映射

在 `src/utils/processors/index.ts` 的 `domainMap` 中添加映射：

```typescript
const domainMap: Record<string, string> = {
  'v2ex.com': 'v2ex',
  'www.v2ex.com': 'v2ex',
  'zhihu.com': 'zhihu', // 新增
  'www.zhihu.com': 'zhihu', // 新增
  'zhuanlan.zhihu.com': 'zhihu' // 新增
}
```

### 步骤 3：测试

访问对应网站，处理器会自动加载并工作。

## 处理器文件规范

每个处理器文件必须导出以下内容：

### 必需导出

```typescript
// 提取列表（同步或异步）
export function extractList(doc?: Document): ListItem[]

// 提取文章（异步，使用 metascraper）
export async function extractArticle(html?: string, url?: string): Promise<ArticleContent | null>
```

### 可选导出

```typescript
// 配置对象（用于调试和信息展示）
export default {
  name: '网站名称',
  listItemSelector: '.list-item',
  contentSelector: '.content'
}
```

## API 参考

### extractCurrentList()

提取当前页面的列表数据。

```typescript
async function extractCurrentList(): Promise<ListItem[]>
```

**返回值**：

- 成功：返回 `ListItem[]` 数组
- 失败或不支持：返回空数组 `[]`

### extractCurrentArticle()

提取当前页面的文章内容。

```typescript
async function extractCurrentArticle(): Promise<ArticleContent | null>
```

**返回值**：

- 成功：返回 `ArticleContent` 对象
- 失败或不支持：返回 `null`

### isProcessorAvailable()

检查当前页面是否有可用的处理器。

```typescript
async function isProcessorAvailable(): Promise<boolean>
```

### getSupportedDomains()

获取所有支持的域名列表。

```typescript
function getSupportedDomains(): string[]
```

## 数据类型

### ListItem

```typescript
interface ListItem {
  title: string // 标题（必需）
  url: string // 链接（必需）
  author?: string // 作者
  date?: string // 日期
  excerpt?: string // 摘要
  tags?: string[] // 标签
  meta?: Record<string, any> // 其他元数据
}
```

### ArticleContent

```typescript
interface ArticleContent {
  title: string // 标题（必需）
  author?: string // 作者
  date?: string // 日期
  content: string // 内容 HTML（必需）
  tags?: string[] // 标签
  meta?: Record<string, any> // 其他元数据
}
```

## 最佳实践

1. **使用 metascraper**：优先使用 metascraper 提取元数据，减少手动选择器
2. **错误处理**：处理器内部应该捕获错误，避免影响主程序
3. **选择器简洁**：使用最稳定的 CSS 选择器
4. **相对 URL 处理**：记得将相对 URL 转换为绝对 URL
5. **性能优化**：避免重复查询 DOM，缓存常用元素

## 支持的网站

当前支持的网站列表：

- ✅ V2EX (v2ex.com)
- 🔜 知乎 (zhihu.com) - 待添加
- 🔜 掘金 (juejin.cn) - 待添加
- 🔜 GitHub (github.com) - 待添加

## 调试技巧

### 在控制台测试

```javascript
// 测试列表提取
import { extractCurrentList } from '@/utils/processors'
const list = await extractCurrentList()
console.table(list)

// 测试文章提取
import { extractCurrentArticle } from '@/utils/processors'
const article = await extractCurrentArticle()
console.log(article)

// 检查支持的域名
import { getSupportedDomains } from '@/utils/processors'
console.log(getSupportedDomains())
```

### 查看加载的处理器

处理器加载失败时会在控制台输出警告信息，帮助调试。
