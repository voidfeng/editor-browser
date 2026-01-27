/**
 * V2EX 网站页面处理器
 */

import type { ListItem, ArticleContent } from './types'

// 配置
const config = {
  name: 'V2EX',
  listUrlPattern: /^https?:\/\/(www\.)?v2ex\.com\/(\?tab=\w+)?$/,
  detailUrlPattern: /^https?:\/\/(www\.)?v2ex\.com\/t\/\d+/,
  listItemSelector: '.cell.item',
  contentSelector: '.topic_content'
}

/**
 * 提取列表数据
 */
export function extractList(doc: Document = document): ListItem[] {
  const items: ListItem[] = []
  const elements = doc.querySelectorAll(config.listItemSelector)

  elements.forEach((element) => {
    const titleEl = element.querySelector('.item_title a')
    if (!titleEl) return

    const authorEl = element.querySelector('.topic_info strong a')
    const nodeEl = element.querySelector('.node')
    const replyEl = element.querySelector('.count_livid, .count_orange')

    let url = titleEl.getAttribute('href') || ''
    if (url && !url.startsWith('http')) {
      url = `https://www.v2ex.com${url}`
    }

    items.push({
      title: titleEl.textContent?.trim() || '',
      url,
      author: authorEl?.textContent?.trim(),
      tags: nodeEl ? [nodeEl.textContent?.trim() || ''] : [],
      meta: {
        replies: replyEl?.textContent?.trim() || '0',
        node: nodeEl?.textContent?.trim()
      }
    })
  })

  return items
}

/**
 * 提取文章内容（使用 DOM 解析）
 */
export async function extractArticle(html?: string, url?: string): Promise<ArticleContent | null> {
  const pageHtml = html || document.documentElement.outerHTML
  const pageUrl = url || window.location.href

  // 解析 HTML
  const doc = html ? new DOMParser().parseFromString(html, 'text/html') : document

  // 提取正文内容
  const contentEl = doc.querySelector(config.contentSelector)
  if (!contentEl) return null

  // 提取元数据
  const titleEl = doc.querySelector('.header h1, h1')
  const authorEl = doc.querySelector('.header .gray a:first-child, .topic_info strong a')
  const nodeEl = doc.querySelector('.header .gray a[href^="/go/"]')
  const dateEl = doc.querySelector('.header .gray, .topic_info')

  // 提取日期（从文本中解析）
  let date: string | undefined
  if (dateEl) {
    const dateText = dateEl.textContent || ''
    const dateMatch = dateText.match(/\d{4}-\d{2}-\d{2}|\d+\s+(分钟|小时|天)前/)
    date = dateMatch ? dateMatch[0] : undefined
  }

  // 提取描述（使用 meta 标签或正文前 200 字符）
  let description = doc.querySelector('meta[name="description"]')?.getAttribute('content')
  if (!description) {
    const textContent = contentEl.textContent?.trim() || ''
    description = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '')
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
      url: pageUrl
    }
  }
}

export default config
