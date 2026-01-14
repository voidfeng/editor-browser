<template>
  <div class="file-explorer vscode-sidebar h-full flex flex-col">
    <div
      class="explorer-header bg-vscode-sidebar-header border-b border-vscode-sidebar-border px-3 py-2"
    >
      <div class="flex justify-between items-center">
        <span class="text-xs font-semibold uppercase tracking-wide text-vscode-text-secondary">
          资源管理器
        </span>
        <div class="flex gap-1">
          <button
            class="action-btn p-1 rounded text-vscode-text-secondary hover:bg-vscode-sidebar-hover transition-colors"
            @click="refreshFiles"
            title="刷新"
          >
            🔄
          </button>
          <button
            class="action-btn p-1 rounded text-vscode-text-secondary hover:bg-vscode-sidebar-hover transition-colors"
            @click="toggleCollapse"
            title="折叠所有"
          >
            📁
          </button>
        </div>
      </div>
    </div>

    <div class="explorer-content flex-1 overflow-y-auto vscode-scrollbar py-1">
      <div class="file-tree select-none">
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.action-btn {
  font-size: 12px;
  border: none;
  background: none;
  cursor: pointer;
}
</style>
