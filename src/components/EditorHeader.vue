<template>
  <div class="vscode-titlebar flex justify-between items-center">
    <!-- 左侧：标题 -->
    <div class="flex items-center gap-3">
      <span class="font-semibold text-sm">🚀 Editor Browser</span>
      <span v-if="currentFile" class="text-xs text-vscode-text-secondary">
        {{ currentFile.name }}
      </span>
    </div>

    <!-- 右侧：工具栏 -->
    <div class="flex items-center gap-2">
      <!-- 语言选择 -->
      <select
        :value="language"
        @change="$emit('update:language', ($event.target as HTMLSelectElement).value)"
        class="vscode-dropdown text-xs"
      >
        <option value="javascript">JavaScript</option>
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="json">JSON</option>
        <option value="markdown">Markdown</option>
      </select>

      <!-- 主题切换 -->
      <button
        @click="$emit('toggle-theme')"
        class="vscode-button-secondary text-xs"
        title="切换主题"
      >
        {{ isDarkTheme ? '☀️' : '🌙' }}
      </button>

      <!-- 切换侧边栏 -->
      <button
        @click="$emit('toggle-sidebar')"
        class="vscode-button-secondary text-xs"
        title="切换侧边栏"
      >
        📁
      </button>

      <!-- 运行代码 -->
      <button
        @click="$emit('run-code')"
        class="px-2 py-1 text-xs rounded cursor-pointer transition-colors bg-vscode-success text-white hover:opacity-90"
        title="运行代码"
      >
        ▶️ 运行
      </button>

      <!-- 最小化 -->
      <button
        @click="$emit('toggle-minimize')"
        class="control-btn w-6 h-6 rounded flex items-center justify-center text-xs transition-colors"
        style="background: rgba(255, 255, 255, 0.2)"
        title="最小化"
      >
        {{ isMinimized ? '🔼' : '🔽' }}
      </button>

      <!-- 关闭 -->
      <button
        @click="$emit('close')"
        class="control-btn w-6 h-6 rounded flex items-center justify-center text-xs transition-colors"
        style="background: rgba(255, 255, 255, 0.2)"
        title="关闭"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from './FileExplorer.vue'

interface Props {
  currentFile?: FileItem | null
  language: 'javascript' | 'html' | 'css' | 'json' | 'markdown'
  isDarkTheme: boolean
  isMinimized: boolean
}

defineProps<Props>()

defineEmits<{
  'update:language': [value: string]
  'toggle-theme': []
  'toggle-sidebar': []
  'run-code': []
  'toggle-minimize': []
  close: []
}>()
</script>

<style scoped>
.control-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}
</style>
