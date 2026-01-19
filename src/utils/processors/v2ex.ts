/**
 * V2EX 网站页面处理器
 */

import metascraper from 'metascraper'
import metascraperAuthor from 'metascraper-author'
import metascraperDate from 'metascraper-date'
import metascraperDescription from 'metascraper-description'
import metascraperTitle from 'metascraper-title'
import metascraperUrl from 'metascraper-url'
import type { ListItem, ArticleContent } from './types'

// 初始化 metascraper
const scraper = metascraper([
  metascraperAuthor(),
  metascraperDate(),
  metascraperDescription(),
  metascraperTitle(),
  metascraperUrl()
])

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
 * 提取文章内容（使用 metascraper）
 */
export async function extractArticle(html?: string, url?: string): Promise<ArticleContent | null> {
  const pageHtml = html || document.documentElement.outerHTML
  const pageUrl = url || window.location.href

  // 使用 metascraper 提取元数据
  const metadata = await scraper({ html: pageHtml, url: pageUrl })

  // 提取正文内容
  const doc = html ? new DOMParser().parseFromString(html, 'text/html') : document
  const contentEl = doc.querySelector(config.contentSelector)
  const nodeEl = doc.querySelector('.header .gray a[href^="/go/"]')

  if (!contentEl) return null

  return {
    title: metadata.title || '',
    author: metadata.author,
    date: metadata.date,
    content: contentEl.innerHTML || '',
    tags: nodeEl ? [nodeEl.textContent?.trim() || ''] : [],
    meta: {
      node: nodeEl?.textContent?.trim(),
      description: metadata.description,
      url: metadata.url
    }
  }
}

export default config
