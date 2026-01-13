<template>
  <div class="tree-node">
    <div
      class="node-content"
      :class="{
        'is-selected': isSelected,
        'is-folder': item.type === 'folder'
      }"
      :style="{ paddingLeft: `${level * 16 + 8}px` }"
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      <!-- 展开/折叠图标 -->
      <span
        v-if="item.type === 'folder'"
        class="expand-icon"
        :class="{ expanded: item.isExpanded }"
        @click.stop="handleToggle"
      >
        ▶
      </span>
      <span v-else class="file-indent"></span>

      <!-- 文件/文件夹图标 -->
      <span class="file-icon">
        {{ getFileIcon(item) }}
      </span>

      <!-- 文件名 -->
      <span class="file-name">{{ item.name }}</span>

      <!-- 文件大小（仅文件显示） -->
      <span v-if="item.type === 'file' && item.size" class="file-size">
        {{ formatFileSize(item.size) }}
      </span>
    </div>

    <!-- 子节点 -->
    <div v-if="item.type === 'folder' && item.isExpanded && item.children" class="children">
      <FileTreeNode
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :level="level + 1"
        :selected-path="selectedPath"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FileItem } from './FileExplorer.vue'

interface Props {
  item: FileItem
  level: number
  selectedPath?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [file: FileItem]
  toggle: [item: FileItem]
}>()

const isSelected = computed(() => props.selectedPath === props.item.path)

function handleClick() {
  emit('select', props.item)
}

function handleToggle() {
  if (props.item.type === 'folder') {
    emit('toggle', props.item)
  }
}

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  // 这里可以添加右键菜单功能
  console.log('Right click on:', props.item.name)
}

function getFileIcon(item: FileItem): string {
  if (item.type === 'folder') {
    return item.isExpanded ? '📂' : '📁'
  }

  // 根据文件扩展名返回不同图标
  const ext = item.name.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'vue':
      return '🟢'
    case 'ts':
    case 'tsx':
      return '🔷'
    case 'js':
    case 'jsx':
      return '🟨'
    case 'html':
      return '🌐'
    case 'css':
    case 'scss':
    case 'sass':
      return '🎨'
    case 'json':
      return '📋'
    case 'md':
      return '📝'
    case 'svg':
      return '🖼️'
    case 'ico':
      return '🖼️'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return '🖼️'
    default:
      return '📄'
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.tree-node {
  font-size: 13px;
}

.node-content {
  display: flex;
  align-items: center;
  height: 22px;
  cursor: pointer;
  color: #24292f;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-content:hover {
  background: #f1f3f4;
}

.node-content.is-selected {
  background: #0969da;
  color: white;
}

.node-content.is-folder {
  font-weight: 500;
}

.expand-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #656d76;
  transition: transform 0.15s ease;
  margin-right: 2px;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.file-indent {
  width: 16px;
  margin-right: 2px;
}

.file-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 6px;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 11px;
  color: #656d76;
  margin-left: 8px;
  flex-shrink: 0;
}

.node-content.is-selected .file-size {
  color: rgba(255, 255, 255, 0.8);
}

.children {
  margin-left: 0;
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .node-content {
    color: #f0f6fc;
  }

  .node-content:hover {
    background: #21262d;
  }

  .node-content.is-selected {
    background: #1f6feb;
  }

  .expand-icon {
    color: #8b949e;
  }

  .file-size {
    color: #8b949e;
  }
}
</style>
