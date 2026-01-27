/**
 * 将列表数据转换为文件树结构
 */

import type { ListItem } from './processors'
import type { FileItem } from '@/components/FileExplorer.vue'

/**
 * 将列表项转换为文件树节点
 */
export function convertListToFileTree(listItems: ListItem[]): FileItem[] {
  return listItems.map((item, index) => ({
    name: item.title,
    path: `list/${index}`,
    type: 'file' as const,
    size: item.excerpt?.length || 0,
    lastModified: item.date ? new Date(item.date) : new Date(),
    // 将原始数据存储在 meta 中
    meta: {
      url: item.url,
      author: item.author,
      excerpt: item.excerpt,
      tags: item.tags,
      ...item.meta
    }
  }))
}

/**
 * 将列表文件插入到 src 文件夹下方
 */
export function insertListIntoFileTree(fileTree: FileItem[], listItems: ListItem[]): FileItem[] {
  const listFiles = convertListToFileTree(listItems)

  // 创建列表文件夹
  const listFolder: FileItem = {
    name: 'pages',
    path: 'list',
    type: 'folder',
    isExpanded: true,
    children: listFiles
  }

  // 找到 src 文件夹的索引
  const srcIndex = fileTree.findIndex((item) => item.name === 'src')

  // 复制文件树
  const newFileTree = [...fileTree]

  // 移除旧的列表文件夹（如果存在）
  const oldListIndex = newFileTree.findIndex((item) => item.name === '📋 pages')
  if (oldListIndex > -1) {
    newFileTree.splice(oldListIndex, 1)
  }

  // 在 src 下方插入列表文件夹
  if (srcIndex > -1) {
    newFileTree.splice(srcIndex + 1, 0, listFolder)
  } else {
    // 如果没有 src 文件夹，插入到开头
    newFileTree.unshift(listFolder)
  }

  return newFileTree
}

/**
 * 从文件树中移除列表文件夹
 */
export function removeListFromFileTree(fileTree: FileItem[]): FileItem[] {
  return fileTree.filter((item) => item.name !== '📋 pages')
}
