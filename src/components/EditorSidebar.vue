<template>
  <div class="flex h-full">
    <!-- 活动栏 -->
    <div class="vscode-activitybar flex flex-col w-12">
      <button
        class="vscode-activitybar-item text-base"
        :class="{ 'vscode-activitybar-item-active': activeTab === 'explorer' }"
        @click="activeTab = 'explorer'"
        title="资源管理器"
      >
        📁
      </button>
      <button
        class="vscode-activitybar-item text-base"
        :class="{ 'vscode-activitybar-item-active': activeTab === 'search' }"
        @click="activeTab = 'search'"
        title="搜索"
      >
        🔍
      </button>
    </div>

    <!-- 侧边栏内容 -->
    <div class="w-60">
      <!-- 文件资源管理器 -->
      <FileExplorer v-if="activeTab === 'explorer'" @file-select="$emit('file-select', $event)" />

      <!-- 搜索面板 -->
      <div v-else-if="activeTab === 'search'" class="vscode-sidebar h-full flex flex-col">
        <div class="vscode-panel-header">搜索</div>
        <div class="p-3">
          <input
            type="text"
            placeholder="搜索文件..."
            class="vscode-input w-full text-xs"
            v-model="searchQuery"
          />
          <div class="mt-4 text-center text-vscode-text-muted text-xs">暂无搜索结果</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FileExplorer, { type FileItem } from './FileExplorer.vue'

const activeTab = ref<'explorer' | 'search'>('explorer')
const searchQuery = ref('')

defineEmits<{
  'file-select': [file: FileItem]
}>()
</script>
