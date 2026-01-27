/**
 * 将 HTML 转换为格式化的纯文本
 */

/**
 * 将 HTML 内容转换为可读的文本格式
 * 保留段落、换行和基本格式
 */
export function htmlToText(html: string): string {
  // 创建临时 DOM 元素
  const temp = document.createElement('div')
  temp.innerHTML = html

  // 移除 script 和 style 标签
  temp.querySelectorAll('script, style').forEach((el) => el.remove())

  // 处理特殊标签
  processElement(temp)

  // 获取文本内容
  let text = temp.textContent || ''

  // 清理多余的空白
  text = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n\n')

  return text
}

/**
 * 递归处理元素，添加适当的换行
 */
function processElement(element: Element) {
  const children = Array.from(element.childNodes)

  children.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      const tagName = el.tagName.toLowerCase()

      // 块级元素后添加换行
      if (isBlockElement(tagName)) {
        // 在元素后添加换行标记
        const lineBreak = document.createTextNode('\n')
        el.after(lineBreak)
      }

      // 列表项前添加标记
      if (tagName === 'li') {
        const bullet = document.createTextNode('• ')
        el.prepend(bullet)
      }

      // 链接添加 URL
      if (tagName === 'a') {
        const href = el.getAttribute('href')
        if (href && !href.startsWith('#')) {
          const url = document.createTextNode(` (${href})`)
          el.after(url)
        }
      }

      // 图片添加描述
      if (tagName === 'img') {
        const alt = el.getAttribute('alt') || '图片'
        const src = el.getAttribute('src') || ''
        const text = document.createTextNode(`[${alt}: ${src}]\n`)
        el.replaceWith(text)
      }

      // 代码块保留格式
      if (tagName === 'pre' || tagName === 'code') {
        const code = el.textContent || ''
        const text = document.createTextNode(`\n\`\`\`\n${code}\n\`\`\`\n`)
        el.replaceWith(text)
      }

      // 递归处理子元素
      processElement(el)
    }
  })
}

/**
 * 判断是否为块级元素
 */
function isBlockElement(tagName: string): boolean {
  const blockElements = [
    'p',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'hr',
    'table',
    'tr',
    'section',
    'article',
    'header',
    'footer',
    'nav',
    'aside'
  ]
  return blockElements.includes(tagName)
}

/**
 * 简化版：只提取纯文本并保留基本换行
 */
export function htmlToSimpleText(html: string): string {
  const temp = document.createElement('div')
  temp.innerHTML = html

  // 移除不需要的标签
  temp.querySelectorAll('script, style, iframe').forEach((el) => el.remove())

  // 将 br 和块级元素替换为换行
  temp.querySelectorAll('br, p, div, h1, h2, h3, h4, h5, h6, li').forEach((el) => {
    const lineBreak = document.createTextNode('\n')
    el.after(lineBreak)
  })

  // 获取文本
  let text = temp.textContent || ''

  // 清理空白
  text = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n\n')

  return text
}
