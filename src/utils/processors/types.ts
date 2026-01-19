/**
 * 页面处理器类型定义
 */

// 列表项数据结构
export interface ListItem {
  title: string
  url: string
  author?: string
  date?: string
  excerpt?: string
  tags?: string[]
  meta?: Record<string, any>
}

// 文章内容数据结构
export interface ArticleContent {
  title: string
  author?: string
  date?: string
  content: string
  tags?: string[]
  meta?: Record<string, any>
}

// 页面处理器配置
export interface ProcessorConfig {
  // 网站名称
  name: string
  // 列表页 URL 匹配规则
  listUrlPattern: RegExp
  // 详情页 URL 匹配规则（可选）
  detailUrlPattern?: RegExp
  // 列表项选择器
  listItemSelector: string
  // 文章内容选择器
  contentSelector: string
  // 自定义提取函数
  extractListItem?: (element: Element) => ListItem | null
  extractContent?: (element: Element) => ArticleContent | null
}

// 页面处理器接口
export interface PageProcessor {
  config: ProcessorConfig
  // 检查是否匹配当前页面
  matchList(url: string): boolean
  matchDetail(url: string): boolean
  // 提取列表数据
  extractList(doc?: Document): ListItem[]
  // 提取文章内容
  extractArticle(doc?: Document): ArticleContent | null
}
