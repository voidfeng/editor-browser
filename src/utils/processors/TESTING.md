# 处理器测试指南

## 快速测试

### 1. 在 V2EX 上测试

1. 访问 https://www.v2ex.com/
2. 打开浏览器控制台
3. 运行以下代码：

```javascript
// 测试列表提取
import { extractCurrentList } from '@/utils/processors'
const list = await extractCurrentList()
console.log('列表项数量:', list.length)
console.table(list)

// 测试是否支持当前网站
import { isProcessorAvailable } from '@/utils/processors'
const isSupported = await isProcessorAvailable()
console.log('是否支持:', isSupported)
```

4. 打开编辑器（Ctrl+E）
5. 查看左侧文件树，应该看到 `📋 pages` 文件夹
6. 点击任意列表项

### 2. 在详情页测试

1. 访问 https://www.v2ex.com/t/123456（任意帖子）
2. 打开控制台
3. 运行：

```javascript
import { extractCurrentArticle } from '@/utils/processors'
const article = await extractCurrentArticle()
console.log('文章标题:', article.title)
console.log('文章作者:', article.author)
console.log('文章内容长度:', article.content.length)
```

## 在编辑器中测试

### 测试列表加载

1. 打开编辑器
2. 查看文件树是否显示 `📋 pages`
3. 展开文件夹，查看列表项
4. 控制台应该显示：`✅ 已加载 X 个列表项`

### 测试文章加载

1. 点击列表项
2. 编辑器应该显示文章内容
3. 顶部应该显示文章元数据（标题、作者、日期等）
4. 语言模式应该切换为 HTML

### 测试刷新功能

1. 点击文件树顶部的 🔄 按钮
2. 列表应该重新加载
3. 控制台显示加载日志

## 添加新网站处理器的测试流程

### 1. 创建处理器文件

例如 `zhihu.ts`：

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
  // 实现列表提取逻辑
  return []
}

export async function extractArticle(html?: string, url?: string): Promise<ArticleContent | null> {
  // 实现文章提取逻辑
  return null
}

export default config
```

### 2. 注册域名

在 `index.ts` 中添加：

```typescript
const domainMap: Record<string, string> = {
  'v2ex.com': 'v2ex',
  'www.v2ex.com': 'v2ex',
  'zhihu.com': 'zhihu',
  'www.zhihu.com': 'zhihu'
}
```

### 3. 测试选择器

在目标网站的控制台测试：

```javascript
// 测试列表项选择器
const items = document.querySelectorAll('.List-item')
console.log('找到列表项:', items.length)

// 测试内容选择器
const content = document.querySelector('.Post-RichTextContainer')
console.log('找到内容:', content ? '是' : '否')
```

### 4. 测试提取函数

```javascript
// 测试列表提取
import { extractList } from '@/utils/processors/zhihu'
const list = extractList()
console.table(list)

// 测试文章提取
import { extractArticle } from '@/utils/processors/zhihu'
const article = await extractArticle()
console.log(article)
```

### 5. 集成测试

1. 访问目标网站
2. 打开编辑器
3. 验证列表是否正确显示
4. 点击列表项验证文章加载

## 常见问题

### Q: 列表没有加载

**检查项：**

- 域名是否正确注册
- 选择器是否正确
- 控制台是否有错误

**调试：**

```javascript
import { getSupportedDomains } from '@/utils/processors'
console.log('支持的域名:', getSupportedDomains())
```

### Q: 文章内容为空

**检查项：**

- 内容选择器是否正确
- metascraper 是否正确提取元数据
- 网页结构是否发生变化

**调试：**

```javascript
const content = document.querySelector('.content-selector')
console.log('内容元素:', content)
console.log('内容 HTML:', content?.innerHTML)
```

### Q: 性能问题

**优化建议：**

- 限制列表项数量
- 使用虚拟滚动
- 缓存已加载的文章
- 延迟加载文章内容

## 性能测试

### 测量列表加载时间

```javascript
console.time('列表加载')
const list = await extractCurrentList()
console.timeEnd('列表加载')
console.log('列表项数量:', list.length)
```

### 测量文章加载时间

```javascript
console.time('文章加载')
const article = await extractCurrentArticle()
console.timeEnd('文章加载')
console.log('内容长度:', article?.content.length)
```

## 自动化测试建议

可以使用 Vitest 编写单元测试：

```typescript
import { describe, it, expect } from 'vitest'
import { convertListToFileTree, insertListIntoFileTree } from '@/utils/listToFileTree'

describe('listToFileTree', () => {
  it('应该正确转换列表项', () => {
    const listItems = [{ title: '测试标题', url: 'https://example.com' }]
    const fileTree = convertListToFileTree(listItems)
    expect(fileTree).toHaveLength(1)
    expect(fileTree[0].name).toBe('测试标题')
  })

  it('应该正确插入到文件树', () => {
    const fileTree = [{ name: 'src', path: 'src', type: 'folder' }]
    const listItems = [{ title: '测试', url: 'https://example.com' }]
    const result = insertListIntoFileTree(fileTree, listItems)
    expect(result).toHaveLength(2)
    expect(result[1].name).toBe('📋 pages')
  })
})
```
