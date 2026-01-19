# 列表与编辑器集成指南

## 功能概述

编辑器现在可以自动从当前网页提取列表数据，并将其显示在文件树的 `src` 文件夹下方。点击列表项可以加载对应的文章内容。

## 工作流程

### 1. 自动加载列表

当打开编辑器时，系统会：

1. 检查当前网站是否有对应的处理器
2. 如果有，自动提取页面列表数据
3. 将列表项转换为文件树节点
4. 插入到 `src` 文件夹下方，显示为 `📋 网页列表` 文件夹

### 2. 查看文章内容

点击列表项文件时：

1. 系统会使用处理器提取文章内容
2. 使用 metascraper 获取元数据（标题、作者、日期等）
3. 在编辑器中显示完整的文章 HTML 内容
4. 语言模式自动切换为 HTML

## 使用示例

### 在 V2EX 网站上使用

1. 访问 https://www.v2ex.com/
2. 打开编辑器（点击浮动按钮或按 `Ctrl+E`）
3. 在左侧文件树中，你会看到：

```
📁 src
📁 📋 网页列表
  📄 帖子标题 1
  📄 帖子标题 2
  📄 帖子标题 3
  ...
📁 public
📄 package.json
```

4. 点击任意帖子标题
5. 编辑器会加载并显示该帖子的完整内容

### 刷新列表

点击文件树顶部的 🔄 按钮可以重新加载列表数据。

## 数据结构

### 列表项转换

列表项 (`ListItem`) 会被转换为文件树节点 (`FileItem`)：

```typescript
// 原始列表项
{
  title: "帖子标题",
  url: "https://www.v2ex.com/t/123456",
  author: "用户名",
  excerpt: "帖子摘要",
  tags: ["技术"],
  meta: { replies: "10", node: "技术" }
}

// 转换后的文件树节点
{
  name: "帖子标题",
  path: "list/0",
  type: "file",
  size: 100,
  lastModified: new Date(),
  meta: {
    url: "https://www.v2ex.com/t/123456",
    author: "用户名",
    excerpt: "帖子摘要",
    tags: ["技术"],
    replies: "10",
    node: "技术"
  }
}
```

### 文章内容显示

点击列表项后，编辑器会显示：

```html
<!--
标题: 帖子标题
作者: 用户名
日期: 2026-01-19
标签: 技术
URL: https://www.v2ex.com/t/123456
-->

<div class="topic_content">
  <!-- 文章的 HTML 内容 -->
  <p>这是文章的正文内容...</p>
</div>
```

## 核心文件

### 1. `src/utils/listToFileTree.ts`

提供列表到文件树的转换功能：

- `convertListToFileTree()` - 将列表项转换为文件树节点
- `insertListIntoFileTree()` - 将列表插入到文件树中
- `removeListFromFileTree()` - 从文件树中移除列表

### 2. `src/components/FileExplorer.vue`

文件资源管理器组件：

- 在 `loadFiles()` 中自动加载列表数据
- 使用 `isProcessorAvailable()` 检查是否支持当前网站
- 使用 `extractCurrentList()` 提取列表数据

### 3. `src/components/FloatingEditor.vue`

浮动编辑器组件：

- 在 `onFileSelect()` 中处理列表文件点击
- 使用 `loadArticleFromUrl()` 加载文章内容
- 使用 `extractCurrentArticle()` 提取文章数据

## API 参考

### convertListToFileTree()

将列表项数组转换为文件树节点数组。

```typescript
function convertListToFileTree(listItems: ListItem[]): FileItem[]
```

### insertListIntoFileTree()

将列表文件夹插入到文件树的 src 下方。

```typescript
function insertListIntoFileTree(fileTree: FileItem[], listItems: ListItem[]): FileItem[]
```

**特性：**

- 自动移除旧的列表文件夹
- 在 src 文件夹下方插入新的列表文件夹
- 如果没有 src 文件夹，插入到开头

### removeListFromFileTree()

从文件树中移除列表文件夹。

```typescript
function removeListFromFileTree(fileTree: FileItem[]): FileItem[]
```

## 扩展功能

### 添加列表操作

可以在列表项上添加右键菜单，提供以下操作：

- 在新标签页打开
- 复制链接
- 标记为已读
- 添加到收藏

### 列表过滤和搜索

可以添加搜索框，根据标题、作者、标签过滤列表项。

### 列表分组

可以根据标签、作者、日期等对列表项进行分组显示。

### 离线缓存

可以将提取的文章内容缓存到本地存储，支持离线阅读。

## 调试技巧

### 查看加载的列表

打开浏览器控制台，查看日志：

```
✅ 已加载 20 个列表项
```

### 测试列表提取

在控制台手动测试：

```javascript
import { extractCurrentList } from '@/utils/processors'
const list = await extractCurrentList()
console.table(list)
```

### 测试文章提取

```javascript
import { extractCurrentArticle } from '@/utils/processors'
const article = await extractCurrentArticle()
console.log(article)
```

## 最佳实践

1. **错误处理**：列表加载失败不应影响编辑器的正常使用
2. **性能优化**：大量列表项时考虑虚拟滚动
3. **用户体验**：显示加载状态，提供刷新按钮
4. **数据验证**：确保列表项包含必需的字段（title、url）
5. **缓存策略**：避免重复加载相同的文章内容

## 支持的网站

当前支持的网站：

- ✅ V2EX - 列表和文章内容提取
- 🔜 知乎 - 待添加
- 🔜 掘金 - 待添加
- 🔜 GitHub - 待添加

## 故障排除

### 列表没有显示

1. 检查当前网站是否有对应的处理器
2. 查看控制台是否有错误信息
3. 尝试点击刷新按钮重新加载

### 文章内容加载失败

1. 检查网络连接
2. 确认处理器的 `extractArticle()` 方法正确实现
3. 查看控制台错误日志

### 列表项显示不正确

1. 检查处理器的 CSS 选择器是否正确
2. 确认网站结构是否发生变化
3. 更新处理器的选择器配置
