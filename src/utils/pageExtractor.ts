import metascraper from 'metascraper'
import metascraperAuthor from 'metascraper-author'
import metascraperDate from 'metascraper-date'
import metascraperDescription from 'metascraper-description'
import metascraperImage from 'metascraper-image'
import metascraperLogo from 'metascraper-logo'
import metascraperPublisher from 'metascraper-publisher'
import metascraperTitle from 'metascraper-title'
import metascraperUrl from 'metascraper-url'

// 初始化 metascraper
const scraper = metascraper([
  metascraperAuthor(),
  metascraperDate(),
  metascraperDescription(),
  metascraperImage(),
  metascraperLogo(),
  metascraperPublisher(),
  metascraperTitle(),
  metascraperUrl()
])

export interface PageMetadata {
  title?: string
  description?: string
  author?: string
  date?: string
  image?: string
  logo?: string
  publisher?: string
  url?: string
  lang?: string
  charset?: string
  viewport?: string
  keywords?: string[]
  ogType?: string
  twitterCard?: string
  canonical?: string
  robots?: string
}

export interface PageContent {
  metadata: PageMetadata
  headings: Array<{
    level: number
    text: string
    id?: string
  }>
  links: Array<{
    href: string
    text: string
    title?: string
    target?: string
  }>
  images: Array<{
    src: string
    alt?: string
    title?: string
    width?: string
    height?: string
  }>
  forms: Array<{
    action?: string
    method?: string
    inputs: Array<{
      type: string
      name?: string
      placeholder?: string
      required?: boolean
    }>
  }>
  scripts: Array<{
    src?: string
    type?: string
    inline?: boolean
  }>
  styles: Array<{
    href?: string
    inline?: boolean
  }>
  textContent: string
  wordCount: number
  readingTime: number // 预估阅读时间（分钟）
}

// 提取页面元数据
export async function extractPageMetadata(html: string, url: string): Promise<PageMetadata> {
  try {
    const metadata = await scraper({ html, url })

    // 补充一些额外的元数据
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const additionalMeta: Partial<PageMetadata> = {
      lang: doc.documentElement.lang || undefined,
      charset: doc.querySelector('meta[charset]')?.getAttribute('charset') || undefined,
      viewport: doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || undefined,
      keywords:
        doc
          .querySelector('meta[name="keywords"]')
          ?.getAttribute('content')
          ?.split(',')
          .map((k) => k.trim()) || [],
      ogType: doc.querySelector('meta[property="og:type"]')?.getAttribute('content') || undefined,
      twitterCard:
        doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || undefined,
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || undefined,
      robots: doc.querySelector('meta[name="robots"]')?.getAttribute('content') || undefined
    }

    return { ...metadata, ...additionalMeta }
  } catch (error) {
    console.error('Error extracting metadata:', error)
    return {}
  }
}

// 提取页面结构化内容
export function extractPageContent(html: string, url: string): PageContent {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // 提取标题
  const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((heading) => ({
    level: parseInt(heading.tagName.charAt(1)),
    text: heading.textContent?.trim() || '',
    id: heading.id || undefined
  }))

  // 提取链接
  const links = Array.from(doc.querySelectorAll('a[href]')).map((link) => ({
    href: link.getAttribute('href') || '',
    text: link.textContent?.trim() || '',
    title: link.getAttribute('title') || undefined,
    target: link.getAttribute('target') || undefined
  }))

  // 提取图片
  const images = Array.from(doc.querySelectorAll('img')).map((img) => ({
    src: img.getAttribute('src') || '',
    alt: img.getAttribute('alt') || undefined,
    title: img.getAttribute('title') || undefined,
    width: img.getAttribute('width') || undefined,
    height: img.getAttribute('height') || undefined
  }))

  // 提取表单
  const forms = Array.from(doc.querySelectorAll('form')).map((form) => ({
    action: form.getAttribute('action') || undefined,
    method: form.getAttribute('method') || undefined,
    inputs: Array.from(form.querySelectorAll('input, textarea, select')).map((input) => ({
      type: input.getAttribute('type') || input.tagName.toLowerCase(),
      name: input.getAttribute('name') || undefined,
      placeholder: input.getAttribute('placeholder') || undefined,
      required: input.hasAttribute('required')
    }))
  }))

  // 提取脚本
  const scripts = Array.from(doc.querySelectorAll('script')).map((script) => ({
    src: script.getAttribute('src') || undefined,
    type: script.getAttribute('type') || undefined,
    inline: !script.getAttribute('src')
  }))

  // 提取样式
  const styles = Array.from(doc.querySelectorAll('link[rel="stylesheet"], style')).map((style) => ({
    href: style.getAttribute('href') || undefined,
    inline: style.tagName.toLowerCase() === 'style'
  }))

  // 提取文本内容
  const textContent = doc.body?.textContent?.trim() || ''
  const wordCount = textContent.split(/\s+/).filter((word) => word.length > 0).length
  const readingTime = Math.ceil(wordCount / 200) // 假设每分钟阅读200词

  return {
    metadata: {} as PageMetadata, // 这里会在调用时填充
    headings,
    links,
    images,
    forms,
    scripts,
    styles,
    textContent,
    wordCount,
    readingTime
  }
}

// 完整的页面分析函数
export async function analyzePage(url?: string): Promise<PageContent> {
  const currentUrl = url || window.location.href
  const html = document.documentElement.outerHTML

  // 提取元数据和内容
  const [metadata, content] = await Promise.all([
    extractPageMetadata(html, currentUrl),
    Promise.resolve(extractPageContent(html, currentUrl))
  ])

  return {
    ...content,
    metadata
  }
}
