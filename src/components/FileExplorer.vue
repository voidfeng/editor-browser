<template>
  <div class="file-explorer">
    <div class="explorer-header">
      <div class="explorer-title">
        <span class="title-text">资源管理器</span>
        <div class="header-actions">
          <button class="action-btn" @click="refreshFiles" title="刷新">🔄</button>
          <button class="action-btn" @click="toggleCollapse" title="折叠所有">📁</button>
        </div>
      </div>
    </div>

    <div class="explorer-content">
      <div class="file-tree">
        <FileTreeNode
          v-for="item in fileTree"
          :key="item.path"
          :item="item"
          :level="0"
          @select="onFileSelect"
          @toggle="onToggle"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FileTreeNode from './FileTreeNode.vue'

export interface FileItem {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileItem[]
  isExpanded?: boolean
  size?: number
  lastModified?: Date
}

const emit = defineEmits<{
  fileSelect: [file: FileItem]
}>()

const fileTree = ref<FileItem[]>([])
const isLoading = ref(false)

// 模拟文件系统数据 - 在实际应用中这应该从API获取
const mockFileSystem: FileItem[] = [
  {
    name: 'src',
    path: 'src',
    type: 'folder',
    isExpanded: true,
    children: [
      {
        name: 'components',
        path: 'src/components',
        type: 'folder',
        isExpanded: false,
        children: [
          {
            name: 'CodeEditor.vue',
            path: 'src/components/CodeEditor.vue',
            type: 'file',
            size: 3245,
            lastModified: new Date('2024-01-15')
          },
          {
            name: 'FloatingEditor.vue',
            path: 'src/components/FloatingEditor.vue',
            type: 'file',
            size: 8932,
            lastModified: new Date('2024-01-15')
          }
        ]
      },
      {
        name: 'utils',
        path: 'src/utils',
        type: 'folder',
        isExpanded: false,
        children: [
          {
            name: 'pageExtractor.ts',
            path: 'src/utils/pageExtractor.ts',
            type: 'file',
            size: 2156,
            lastModified: new Date('2024-01-14')
          }
        ]
      },
      {
        name: 'stores',
        path: 'src/stores',
        type: 'folder',
        isExpanded: false,
        children: [
          {
            name: 'counter.ts',
            path: 'src/stores/counter.ts',
            type: 'file',
            size: 456,
            lastModified: new Date('2024-01-10')
          }
        ]
      },
      {
        name: 'App.vue',
        path: 'src/App.vue',
        type: 'file',
        size: 2834,
        lastModified: new Date('2024-01-15')
      },
      {
        name: 'main.ts',
        path: 'src/main.ts',
        type: 'file',
        size: 234,
        lastModified: new Date('2024-01-12')
      }
    ]
  },
  {
    name: 'public',
    path: 'public',
    type: 'folder',
    isExpanded: false,
    children: [
      {
        name: 'icons',
        path: 'public/icons',
        type: 'folder',
        isExpanded: false,
        children: [
          {
            name: 'icon.svg',
            path: 'public/icons/icon.svg',
            type: 'file',
            size: 1024,
            lastModified: new Date('2024-01-08')
          }
        ]
      },
      {
        name: 'favicon.ico',
        path: 'public/favicon.ico',
        type: 'file',
        size: 15086,
        lastModified: new Date('2024-01-08')
      }
    ]
  },
  {
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    size: 1456,
    lastModified: new Date('2024-01-15')
  },
  {
    name: 'vite.config.ts',
    path: 'vite.config.ts',
    type: 'file',
    size: 678,
    lastModified: new Date('2024-01-12')
  },
  {
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    size: 2345,
    lastModified: new Date('2024-01-14')
  }
]

function loadFiles() {
  isLoading.value = true
  // 模拟异步加载
  setTimeout(() => {
    fileTree.value = mockFileSystem
    isLoading.value = false
  }, 300)
}

function refreshFiles() {
  loadFiles()
}

function toggleCollapse() {
  const collapseAll = (items: FileItem[]) => {
    items.forEach((item) => {
      if (item.type === 'folder') {
        item.isExpanded = false
        if (item.children) {
          collapseAll(item.children)
        }
      }
    })
  }
  collapseAll(fileTree.value)
}

function onFileSelect(file: FileItem) {
  emit('fileSelect', file)
}

function onToggle(item: FileItem) {
  item.isExpanded = !item.isExpanded
}

onMounted(() => {
  loadFiles()
})
</script>

<style scoped>
.file-explorer {
  height: 100%;
  background: #f8f9fa;
  border-right: 1px solid #e1e4e8;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.explorer-header {
  padding: 8px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e1e4e8;
  flex-shrink: 0;
}

.explorer-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-text {
  font-size: 11px;
  font-weight: 600;
  color: #586069;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  color: #586069;
  transition: background-color 0.15s ease;
}

.action-btn:hover {
  background: #f1f3f4;
}

.explorer-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.file-tree {
  user-select: none;
}

/* 滚动条样式 */
.explorer-content::-webkit-scrollbar {
  width: 8px;
}

.explorer-content::-webkit-scrollbar-track {
  background: transparent;
}

.explorer-content::-webkit-scrollbar-thumb {
  background: #c1c7cd;
  border-radius: 4px;
}

.explorer-content::-webkit-scrollbar-thumb:hover {
  background: #a8b0b8;
}
</style>
