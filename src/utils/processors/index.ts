/**
 * 页面处理器管理器
 * 根据当前网站域名匹配对应的处理器
 */

import type { ListItem, ArticleContent } from './types'
import * as v2exProcessor from './v2ex'

// 处理器接口
interface Processor {
  extractList: (doc?: Document) => ListItem[]
  extractArticle: (html?: string, url?: string) => Promise<ArticleContent | null>
  default?: any
}

// 静态导入所有处理器
const processors: Record<string, Processor> = {
  v2ex: v2exProcessor
  // 添加其他处理器时在这里导入
  // zhihu: zhihuProcessor,
  // juejin: juejinProcessor,
}

// 域名到处理器的映射
const domainMap: Record<string, string> = {
  'v2ex.com': 'v2ex',
  'www.v2ex.com': 'v2ex'
  // 添加其他网站的域名映射
  // 'zhihu.com': 'zhihu',
  // 'www.zhihu.com': 'zhihu',
}

/**
 * 从 URL 提取域名
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return ''
  }
}

/**
 * 获取当前页面的处理器
 */
function getCurrentProcessor(): Processor | null {
  const domain = extractDomain(window.location.href)
  const processorName = domainMap[domain]

  if (!processorName) {
    return null
  }

  return processors[processorName] || null
}

/**
 * 提取当前页面的列表数据
 */
export async function extractCurrentList(): Promise<ListItem[]> {
  const processor = getCurrentProcessor()
  if (!processor || !processor.extractList) {
    console.warn('No list extractor available for current page')
    return []
  }

  try {
    return processor.extractList()
  } catch (error) {
    console.error('Error extracting list:', error)
    return []
  }
}

/**
 * 提取当前页面的文章内容
 */
export async function extractCurrentArticle(): Promise<ArticleContent | null> {
  const processor = getCurrentProcessor()
  if (!processor || !processor.extractArticle) {
    console.warn('No article extractor available for current page')
    return null
  }

  try {
    return await processor.extractArticle()
  } catch (error) {
    console.error('Error extracting article:', error)
    return null
  }
}

/**
 * 检查当前页面是否支持处理器
 */
export function isProcessorAvailable(): boolean {
  const domain = extractDomain(window.location.href)
  return domain in domainMap
}

/**
 * 获取所有支持的域名列表
 */
export function getSupportedDomains(): string[] {
  return Object.keys(domainMap)
}

export * from './types'
