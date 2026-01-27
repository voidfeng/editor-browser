<template>
  <div class="floating-editor-wrapper">
    <!-- 浮动按钮 -->
    <div
      v-if="!isEditorVisible"
      class="floating-button fixed top-5 right-5 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer text-xl shadow-lg transition-all hover:scale-110 pointer-events-auto select-none"
      style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      @click="toggleEditor"
      title="打开代码编辑器 (Ctrl+E)"
    >
      📝
    </div>

    <!-- 编辑器面板 -->
    <div
      v-if="isEditorVisible"
      class="editor-panel fixed rounded-xl overflow-hidden transition-all flex flex-col pointer-events-auto"
      :class="{ minimized: isMinimized, fullscreen: isFullscreen }"
      :style="
        isFullscreen
          ? {
              top: '0',
              left: '0',
              width: '100vw',
              height: '100vh',
              borderRadius: '0',
              boxShadow: 'none'
            }
          : {
              top: panelPosition.y + 'px',
              left: panelPosition.x + 'px',
              width: '900px',
              height: isMinimized ? '50px' : '600px',
              boxShadow: 'var(--vscode-shadow-lg)'
            }
      "
      @mousedown="startDrag"
    >
      <!-- 1. 顶部标题区域 -->
      <EditorHeader
        :current-file="currentFile"
        :language="currentLanguage"
        :is-dark-theme="isDarkTheme"
        :is-minimized="isMinimized"
        :is-fullscreen="isFullscreen"
        @update:language="
          (val) => (currentLanguage = val as 'javascript' | 'html' | 'css' | 'json' | 'markdown')
        "
        @toggle-theme="toggleTheme"
        @toggle-sidebar="toggleSidebar"
        @run-code="runCode"
        @toggle-minimize="toggleMinimize"
        @toggle-fullscreen="toggleFullscreen"
        @close="toggleEditor"
      />

      <!-- 主内容区 -->
      <div v-if="!isMinimized" class="flex-1 flex overflow-hidden bg-vscode-bg-primary">
        <!-- 2. 左侧树形列表 -->
        <EditorSidebar v-if="isSidebarVisible" @file-select="onFileSelect" />

        <!-- 3. 右侧富文本编辑器区域 -->
        <EditorContent
          :open-files="openFiles"
          :current-file="currentFile"
          :code="code"
          @update:code="code = $event"
          :language="currentLanguage"
          :theme="isDarkTheme ? 'dark' : 'light'"
          :output="output"
          @switch-file="switchToFile"
          @close-file="closeFile"
          @clear-output="output = ''"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import EditorHeader from './EditorHeader.vue'
import EditorSidebar from './EditorSidebar.vue'
import EditorContent from './EditorContent.vue'
import { extractArticleFromHtml } from '@/utils/processors'
import { fetchUrl } from '@/utils/fetchUrl'
import { htmlToText } from '@/utils/htmlToText'
import type { FileItem } from './FileExplorer.vue'

// 编辑器状态
const isEditorVisible = ref(false)
const isMinimized = ref(false)
const isFullscreen = ref(false)
const isDarkTheme = ref(true)
const isSidebarVisible = ref(true)

// 文件管理
const openFiles = ref<FileItem[]>([])
const currentFile = ref<FileItem | null>(null)
const currentLanguage = ref<'javascript' | 'html' | 'css' | 'json' | 'markdown'>('javascript')

// 代码和输出
const code = ref(`// 欢迎使用 Editor Browser!
// 这是一个注入到网页中的代码编辑器

function greet(name) {
  return \`Hello, \${name}! 🎉\`;
}

console.log(greet('World'));

// 快捷键：
// Ctrl+E - 打开/关闭编辑器
// Ctrl+Enter - 运行代码`)

const output = ref('')

// 拖拽相关
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const panelPosition = ref({ x: 100, y: 100 })

// ========== 编辑器控制 ==========
function toggleEditor() {
  isEditorVisible.value = !isEditorVisible.value
  if (isEditorVisible.value) {
    isMinimized.value = false
  }
}

function toggleMinimize() {
  isMinimized.value = !isMinimized.value
  if (isMinimized.value) {
    isFullscreen.value = false
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    isMinimized.value = false
  }
}

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value
  if (isDarkTheme.value) {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
  }
}

function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value
}

// ========== 文件管理 ==========
async function onFileSelect(file: FileItem) {
  if (file.type === 'file') {
    // 检查文件是否已打开
    const existingFile = openFiles.value.find((f) => f.path === file.path)
    if (!existingFile) {
      openFiles.value.push(file)
    }

    // 切换到该文件
    switchToFile(file)

    // 检查是否是列表文件
    if (file.path.startsWith('list/') && file.meta?.url) {
      // 列表文件，加载文章内容
      await loadArticleFromUrl(file)
      currentLanguage.value = 'markdown'
    } else {
      // 普通文件，根据扩展名设置语言
      const ext = file.name.split('.').pop()?.toLowerCase()
      switch (ext) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
          currentLanguage.value = 'javascript'
          break
        case 'html':
          currentLanguage.value = 'html'
          break
        case 'css':
        case 'scss':
        case 'sass':
          currentLanguage.value = 'css'
          break
        case 'json':
          currentLanguage.value = 'json'
          break
        case 'md':
        case 'markdown':
          currentLanguage.value = 'markdown'
          break
        default:
          currentLanguage.value = 'javascript'
      }

      // 加载文件内容
      loadFileContent(file)
    }
  }
}

async function loadArticleFromUrl(file: FileItem) {
  try {
    code.value = '// 正在加载文章内容...'

    // 获取文章 URL
    const articleUrl = file.meta?.url

    if (!articleUrl) {
      code.value = '// 错误：无法获取文章 URL'
      return
    }

    // 通过 background script 发起跨域请求
    const html = await fetchUrl(articleUrl)

    // 使用处理器提取文章内容
    const article = await extractArticleFromHtml(html, articleUrl)

    if (article) {
      // 将 HTML 转换为格式化的文本
      const textContent = htmlToText(article.content)

      // 显示文章内容
      code.value = `标题: ${article.title}
作者: ${article.author || '未知'}
日期: ${article.date || '未知'}
标签: ${article.tags?.join(', ') || '无'}
URL: ${file.meta?.url}

${'='.repeat(60)}

${textContent}

${'='.repeat(60)}

原文链接: ${file.meta?.url}`
    } else {
      code.value = `标题: ${file.name}
URL: ${file.meta?.url}
作者: ${file.meta?.author || '未知'}
摘要: ${file.meta?.excerpt || '无'}

${'='.repeat(60)}

无法提取文章内容，请访问原网页查看

原文链接: ${file.meta?.url}`
    }
  } catch (error) {
    code.value = `// 加载文章失败: ${error}
//
// 可能的原因：
// 1. 网络连接问题
// 2. 目标网站拒绝访问
// 3. URL 格式不正确
//
// 原始 URL: ${file.meta?.url}`
    console.error('加载文章失败:', error)
  }
}

function switchToFile(file: FileItem) {
  currentFile.value = file
  loadFileContent(file)
}

function closeFile(file: FileItem) {
  const index = openFiles.value.findIndex((f) => f.path === file.path)
  if (index > -1) {
    openFiles.value.splice(index, 1)

    // 如果关闭的是当前文件，切换到其他文件
    if (currentFile.value?.path === file.path) {
      if (openFiles.value.length > 0) {
        const newIndex = Math.min(index, openFiles.value.length - 1)
        const nextFile = openFiles.value[newIndex]
        if (nextFile) {
          switchToFile(nextFile)
        }
      } else {
        // 没有打开的文件了，显示欢迎信息
        currentFile.value = null
        code.value = `// 欢迎使用 Editor Browser!
// 从左侧文件树选择一个文件开始编辑

function greet(name) {
  return \`Hello, \${name}! 🎉\`;
}

console.log(greet('World'));`
      }
    }
  }
}

function loadFileContent(file: FileItem) {
  code.value = getMockFileContent(file)
}

function getMockFileContent(file: FileItem): string {
  const ext = file.name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'vue':
      return `<template>
  <div class="component">
    <h1>{{ title }}</h1>
    <p>这是 ${file.name} 组件</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('${file.name}')
<\/script>

<style scoped>
.component {
  padding: 20px;
  background: var(--vscode-bg-secondary);
}
<\/style>`
    case 'ts':
    case 'tsx':
      return `// ${file.name}
export interface User {
  id: number
  name: string
  email: string
}

export function createUser(name: string, email: string): User {
  return {
    id: Math.floor(Math.random() * 10000),
    name,
    email
  }
}

// 使用示例
const user = createUser('张三', 'zhangsan@example.com')
console.log(user)`
    case 'js':
    case 'jsx':
      return `// ${file.name}
function greet(name) {
  return \`Hello, \${name}!\`
}

function calculate(a, b) {
  return {
    sum: a + b,
    product: a * b,
    difference: a - b
  }
}

export { greet, calculate }`
    case 'html':
      return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <h1>欢迎使用 Editor Browser</h1>
  <p>这是一个示例 HTML 文件。</p>
</body>
</html>`
    case 'css':
    case 'scss':
      return `/* ${file.name} */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.button {
  background: #007acc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.button:hover {
  background: #005a9e;
}`
    case 'json':
      return `{
  "name": "${file.name}",
  "version": "1.0.0",
  "description": "示例 JSON 文件",
  "author": "Editor Browser",
  "dependencies": {
    "vue": "^3.5.0",
    "typescript": "^5.0.0"
  }
}`
    case 'md':
      return `# ${file.name}

这是一个 Markdown 文件示例。

## 功能特性

- 支持多种编程语言
- 实时代码编辑
- 文件树导航
- 主题切换

## 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello World!')
}

hello()
\`\`\`

## 列表

1. 第一项
2. 第二项
3. 第三项`
    default:
      return `// ${file.name}
// 这是一个示例文件

console.log('Hello from ${file.name}!')

// 你可以在这里编写代码`
  }
}

// ========== 代码执行 ==========
function runCode() {
  if (currentLanguage.value === 'javascript') {
    try {
      // 捕获 console.log 输出
      const originalLog = console.log
      const logs: string[] = []

      console.log = (...args) => {
        logs.push(args.map((arg) => String(arg)).join(' '))
        originalLog(...args)
      }

      // 执行代码
      const result = new Function(code.value)()

      // 恢复 console.log
      console.log = originalLog

      // 显示输出
      if (logs.length > 0) {
        output.value = logs.join('\n')
      } else if (result !== undefined) {
        output.value = String(result)
      } else {
        output.value = '✅ 代码执行完成'
      }
    } catch (error) {
      output.value = `❌ 错误: ${error}`
    }
  } else {
    output.value = `📄 ${currentLanguage.value.toUpperCase()} 代码预览:\n\n${code.value}`
  }
}

// ========== 拖拽功能 ==========
function startDrag(event: MouseEvent) {
  // 全屏模式下不允许拖拽
  if (isFullscreen.value) return

  // 只有点击标题栏才能拖拽
  const target = event.target as HTMLElement
  if (!target.closest('.vscode-titlebar')) return

  isDragging.value = true
  dragOffset.value = {
    x: event.clientX - panelPosition.value.x,
    y: event.clientY - panelPosition.value.y
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  event.preventDefault()
}

function onDrag(event: MouseEvent) {
  if (!isDragging.value) return

  panelPosition.value = {
    x: event.clientX - dragOffset.value.x,
    y: event.clientY - dragOffset.value.y
  }
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// ========== 键盘快捷键 ==========
function handleKeydown(event: KeyboardEvent) {
  // Ctrl+E 或 Cmd+E: 打开/关闭编辑器
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault()
    toggleEditor()
  }

  // Ctrl+Enter 或 Cmd+Enter: 运行代码
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && isEditorVisible.value) {
    event.preventDefault()
    runCode()
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped lang="scss">
.floating-editor-wrapper {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.editor-panel {
  cursor: default;

  &.minimized {
    cursor: move;
  }
}
</style>
