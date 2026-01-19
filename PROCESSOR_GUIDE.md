# 页面处理器使用指南

## 概述

页面处理器用于分析和提取特定网站的列表和内容数据。每个网站可以有自己的处理器，定义如何提取该网站的数据。

## 目录结构

```
src/utils/processors/
├── types.ts        # 类型定义
├── index.ts        # 处理器管理器
├── v2ex.ts         # V2EX 处理器示例
└── [网站名].ts     # 其他网站处理器
```

## 快速开始

### 1. 创建新的处理器

创建一个新文件 `src/utils/processors/example.ts`：

```typescript
import type { PageProcessor, ProcessorConfig, ListItem, ArticleContent } from './types'

const config: ProcessorConfig = {
  name: '网站名称',
  // 列表页 URL 匹配正则
  listUrlPattern: /^https?:\/\/(www\.)?example\.com\/list/,
  // 详情页 URL 匹配正则（可选）
  detailUrlPattern: /^https?:\/\/(www\.)?example\.com\/article\/\d+/,
  // 列表项 CSS 选择器
  listItemSelector: '.article-item',
  // 文章内容 CSS 选择器
  contentSelector: '.article-content'
}

class ExampleProcessor implements PageProcessor {
  config = config

  matchList(url: string): boolean {
    return this.config.listUrlPattern.test(url)
  }

  matchDetail(url: string): boolean {
    return this.config.detailUrlPattern?.test(url) || false
  }

  extractList(doc: Document = document): ListItem[] {
    const items: ListItem[] = []
    const elements = doc.querySelectorAll(this.config.listItemSelector)

    elements.forEach((element) => {
      const titleEl = element.querySelector('.title')
      const linkEl = element.querySelector('a')

      if (!titleEl || !linkEl) return

      items.push({
        title: titleEl.textContent?.trim() || '',
        url: linkEl.getAttribute('href') || '',
        author: element.querySelector('.author')?.textContent?.trim(),
        date: element.querySelector('.date')?.textContent?.trim(),
        excerpt: element.querySelector('.excerpt')?.textContent?.trim()
      })
    })

    return items
  }

  extractArticle(doc: Document = document): ArticleContent | null {
    const contentEl = doc.querySelector(this.config.contentSelector)
    const titleEl = doc.querySelector('h1.title')

    if (!contentEl || !titleEl) return null

    return {
      title: titleEl.textContent?.trim() || '',
      author: doc.querySelector('.author')?.textContent?.trim(),
      date: doc.querySelector('.date')?.textContent?.trim(),
      content: contentEl.innerHTML || ''
    }
  }
}

export default new ExampleProcessor()
```

### 2. 注册处理器

在 `src/utils/processors/index.ts` 中注册：

```typescript
import exampleProcessor from './example'

const processors: PageProcessor[] = [
  v2exProcessor,
  exampleProcessor // 添加新处理器
]
```

### 3. 使用处理器

```typescript
import { getCurrentProcessor, extractCurrentList, extractCurrentArticle } from '@/utils/processors'

// 获取当前页面的处理器
const processor = getCurrentProcessor()
if (processor) {
  console.log('当前网站:', processor.config.name)
}

// 提取列表数据
const listItems = extractCurrentList()
console.log('列表项:', listItems)

// 提取文章内容
const article = extractCurrentArticle()
console.log('文章内容:', article)
```

## V2EX 处理器示例

V2EX 处理器已经实现，可以作为参考：

- **列表页匹配**: `https://www.v2ex.com/` 或 `https://www.v2ex.com/?tab=tech`
- **详情页匹配**: `https://www.v2ex.com/t/123456`
- **列表项选择器**: `.cell.item`
- **内容选择器**: `.topic_content`

### 提取的数据结构

**列表项 (ListItem)**:

```typescript
{
  title: "帖子标题",
  url: "https://www.v2ex.com/t/123456",
  author: "用户名",
  tags: ["节点名称"],
  meta: {
    replies: "10",
    node: "技术"
  }
}
```

**文章内容 (ArticleContent)**:

```typescript
{
  title: "帖子标题",
  author: "用户名",
  content: "<div>HTML 内容</div>",
  tags: ["节点名称"],
  meta: {
    node: "技术"
  }
}
```

## 高级用法

### 自定义提取函数

如果默认的提取逻辑不够用，可以在配置中提供自定义函数：

```typescript
const config: ProcessorConfig = {
  name: '网站名称',
  listUrlPattern: /pattern/,
  listItemSelector: '.item',
  contentSelector: '.content',
  // 自定义列表项提取
  extractListItem: (element: Element) => {
    // 自定义提取逻辑
    return {
      title: element.querySelector('.custom-title')?.textContent || '',
      url: element.getAttribute('data-url') || ''
    }
  },
  // 自定义内容提取
  extractContent: (element: Element) => {
    // 自定义提取逻辑
    return {
      title: document.title,
      content: element.innerHTML
    }
  }
}
```

### 处理相对 URL

```typescript
extractList(doc: Document = document): ListItem[] {
  const items: ListItem[] = []
  // ... 提取逻辑

  // 补全相对 URL
  if (item.url && !item.url.startsWith('http')) {
    item.url = `https://example.com${item.url}`
  }

  return items
}
```

### 错误处理

```typescript
extractList(doc: Document = document): ListItem[] {
  const items: ListItem[] = []
  const elements = doc.querySelectorAll(this.config.listItemSelector)

  elements.forEach((element) => {
    try {
      // 提取逻辑
      items.push(item)
    } catch (error) {
      console.error('Error extracting item:', error)
      // 继续处理其他项
    }
  })

  return items
}
```

## 最佳实践

1. **选择器尽量具体**: 使用更具体的 CSS 选择器避免误匹配
2. **处理空值**: 使用可选链和空值合并运算符
3. **URL 规范化**: 统一处理相对 URL 和绝对 URL
4. **错误容错**: 单个项目提取失败不应影响其他项目
5. **性能优化**: 避免重复查询 DOM，缓存常用元素
6. **类型安全**: 充分利用 TypeScript 类型检查

## 调试技巧

在浏览器控制台测试选择器：

```javascript
// 测试列表项选择器
document.querySelectorAll('.cell.item')

// 测试内容选择器
document.querySelector('.topic_content')

// 测试 URL 匹配
/^https?:\/\/(www\.)?v2ex\.com\//.test(window.location.href)
```

## 扩展建议

可以为以下网站创建处理器：

- 知乎 (zhihu.com)
- 掘金 (juejin.cn)
- GitHub (github.com)
- Stack Overflow (stackoverflow.com)
- Medium (medium.com)
- 简书 (jianshu.com)
- CSDN (csdn.net)

每个网站的处理器都遵循相同的接口，便于统一管理和使用。
