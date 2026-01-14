<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-vscode-editor-bg">
    <!-- 标签栏 -->
    <div
      v-if="openFiles.length > 0"
      class="flex bg-vscode-tab-bg border-b border-vscode-tab-border overflow-x-auto vscode-scrollbar"
    >
      <div
        v-for="file in openFiles"
        :key="file.path"
        class="vscode-tab flex items-center min-w-0 whitespace-nowrap text-xs group"
        :class="{ 'vscode-tab-active': currentFile?.path === file.path }"
        @click="$emit('switch-file', file)"
      >
        <span class="mr-1.5 flex-shrink-0">{{ getFileIcon(file) }}</span>
        <span class="flex-1 min-w-0 overflow-hidden text-ellipsis">{{ file.name }}</span>
        <button
          class="ml-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-vscode-hover rounded p-0.5 text-[10px] transition-opacity"
          @click.stop="$emit('close-file', file)"
          title="关闭文件"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <div class="flex-1 overflow-hidden">
      <CodeEditor
        :model-value="code"
        @update:model-value="$emit('update:code', $event)"
        :language="language"
        :theme="theme"
        class="h-full"
      />
    </div>

    <!-- 输出面板 -->
    <div
      v-if="output"
      class="vscode-panel max-h-32 flex flex-col border-t border-vscode-panel-border"
    >
      <div class="vscode-panel-header flex justify-between items-center">
        <span>输出</span>
        <button
          @click="$emit('clear-output')"
          class="text-[10px] px-2 py-0.5 hover:bg-vscode-hover rounded transition-colors"
          title="清除输出"
        >
          ✕
        </button>
      </div>
      <pre
        class="flex-1 overflow-auto vscode-scrollbar p-3 m-0 font-mono text-xs leading-relaxed whitespace-pre-wrap text-vscode-text-primary"
        >{{ output }}</pre
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import CodeEditor from './CodeEditor.vue'
import type { FileItem } from './FileExplorer.vue'

interface Props {
  openFiles: FileItem[]
  currentFile: FileItem | null
  code: string
  language: 'javascript' | 'html' | 'css' | 'json' | 'markdown'
  theme: 'light' | 'dark'
  output: string
}

defineProps<Props>()

defineEmits<{
  'update:code': [value: string]
  'switch-file': [file: FileItem]
  'close-file': [file: FileItem]
  'clear-output': []
}>()

function getFileIcon(file: FileItem): string {
  const ext = file.name.split('.').pop()?.toLowerCase()
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
    default:
      return '📄'
  }
}
</script>

<style scoped>
.vscode-tab:hover button {
  opacity: 1;
}
</style>
