<template>
  <div class="floating-editor-wrapper">
    <div
      v-if="!isEditorVisible"
      class="floating-button"
      @click="toggleEditor"
      title="打开代码编辑器"
    >
      📝
    </div>

    <div v-if="isEditorVisible" class="editor-panel" :class="{ minimized: isMinimized }">
      <div class="editor-header" @mousedown="startDrag">
        <div class="editor-title">
          <span>🚀 Editor Browser</span>
        </div>
        <div class="editor-controls">
          <button @click="toggleSidebar" class="control-btn" title="切换侧边栏">📁</button>
          <button @click="toggleMinimize" class="control-btn" title="最小化">
            {{ isMinimized ? '🔼' : '🔽' }}
          </button>
          <button @click="toggleEditor" class="control-btn" title="关闭">✕</button>
        </div>
      </div>

      <div v-if="!isMinimized" class="editor-content">
        <div class="editor-layout">
          <div v-if="isSidebarVisible" class="sidebar">
            <div class="sidebar-tabs">
              <button
                class="sidebar-tab"
                :class="{ active: activeTab === 'explorer' }"
                @click="activeTab = 'explorer'"
                title="资源管理器"
              >
                📁
              </button>
              <button
                class="sidebar-tab"
                :class="{ active: activeTab === 'search' }"
                @click="activeTab = 'search'"
                title="搜索"
              >
                🔍
              </button>
            </div>

            <div class="sidebar-content">
              <FileExplorer v-if="activeTab === 'explorer'" @file-select="onFileSelect" />
              <div v-else-if="activeTab === 'search'" class="search-panel">
                <div class="search-header">搜索</div>
                <input
                  type="text"
                  placeholder="搜索文件..."
                  class="search-input"
                  v-model="searchQuery"
                />
                <div class="search-results">
                  <div class="no-results">暂无搜索结果</div>
                </div>
              </div>
            </div>
          </div>

          <div class="main-editor">
            <div class="file-tabs" v-if="openFiles.length > 0">
              <div
                v-for="file in openFiles"
                :key="file.path"
                class="file-tab"
                :class="{ active: currentFile?.path === file.path }"
                @click="switchToFile(file)"
              >
                <span class="tab-icon">{{ getFileIcon(file) }}</span>
                <span class="tab-name">{{ file.name }}</span>
                <button class="tab-close" @click.stop="closeFile(file)" title="关闭文件">✕</button>
              </div>
            </div>

            <div class="editor-toolbar">
              <div class="toolbar-left">
                <span v-if="currentFile" class="current-file-info">
                  {{ currentFile.name }}
                </span>
              </div>
              <div class="toolbar-right">
                <select v-model="currentLanguage" class="language-select">
                  <option value="javascript">JavaScript</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                </select>
                <button @click="toggleTheme" class="theme-btn">
                  {{ isDarkTheme ? '☀️' : '🌙' }}
                </button>
                <button @click="analyzePage" class="analyze-btn" title="分析当前页面">
                  🔍 分析页面
                </button>
                <button @click="runCode" class="run-btn">▶️ 运行</button>
              </div>
            </div>

            <CodeEditor
              v-model="code"
              :language="currentLanguage"
              :theme="isDarkTheme ? 'dark' : 'light'"
              class="editor-instance"
            />

            <div v-if="output" class="output-area">
              <div class="output-header">输出:</div>
              <pre class="output-content">{{ output }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CodeEditor from './CodeEditor.vue'
import FileExplorer, { type FileItem } from './FileExplorer.vue'
import { analyzePage as analyzeCurrentPage, type PageContent } from '../utils/pageExtractor'

const isEditorVisible = ref(false)
const isMinimized = ref(false)
const isDarkTheme = ref(false)
const currentLanguage = ref<'javascript' | 'html' | 'css' | 'json'>('javascript')
const output = ref('')
const isAnalyzing = ref(false)
const isSidebarVisible = ref(true)
const activeTab = ref<'explorer' | 'search'>('explorer')
const searchQuery = ref('')
const openFiles = ref<FileItem[]>([])
const currentFile = ref<FileItem | null>(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const panelPosition = ref({ x: 100, y: 100 })

const code = ref(`// 欢迎使用 Editor Browser!
// 这是一个注入到网页中的代码编辑器

function greet(name) {
  return \`Hello, \${name}! 🎉\`;
}

console.log(greet('World'));

// 你可以在这里编写和测试代码
// 点击运行按钮来执行 JavaScript 代码`)

function toggleEditor() {
  isEditorVisible.value = !isEditorVisible.value
  if (isEditorVisible.value) {
    isMinimized.value = false
  }
}

function toggleMinimize() {
  isMinimized.value = !isMinimized.value
}

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value
}

function toggleSidebar() {
  isSidebarVisible.value = !isSidebarVisible.value
}

function onFileSelect(file: FileItem) {
  if (file.type === 'file') {
    const existingFile = openFiles.value.find((f) => f.path === file.path)
    if (!existingFile) {
      openFiles.value.push(file)
    }
    switchToFile(file)
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
      default:
        currentLanguage.value = 'javascript'
    }
    loadFileContent(file)
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
    if (currentFile.value?.path === file.path) {
      if (openFiles.value.length > 0) {
        const newIndex = Math.min(index, openFiles.value.length - 1)
        const nextFile = openFiles.value[newIndex]
        if (nextFile) {
          switchToFile(nextFile)
        }
      } else {
        currentFile.value = null
        code.value = `// 欢迎使用 Editor Browser!
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
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const title = ref('${file.name}')
<\/script>
<style scoped>
.component { padding: 20px; }
<\/style>`
    case 'ts':
    case 'tsx':
      return `// ${file.name}
export interface User {
  id: number
  name: string
}
export function createUser(name: string): User {
  return { id: Math.random(), name }
}`
    case 'js':
    case 'jsx':
      return `// ${file.name}
function greet(name) {
  return \`Hello, \${name}!\`
}
export { greet }`
    case 'html':
      return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${file.name}</title>
</head>
<body>
  <h1>欢迎使用 Editor Browser</h1>
</body>
</html>`
    case 'css':
      return `/* ${file.name} */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}`
    case 'json':
      return `{
  "name": "${file.name}",
  "version": "1.0.0"
}`
    case 'md':
      return `# ${file.name}

这是一个Markdown文件示例。

\`\`\`javascript
function hello() {
  console.log('Hello World!')
}
\`\`\``
    default:
      return `// ${file.name}
console.log('Hello from ${file.name}!')`
  }
}

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
      return '🎨'
    case 'json':
      return '📋'
    case 'md':
      return '📝'
    default:
      return '📄'
  }
}

function runCode() {
  if (currentLanguage.value === 'javascript') {
    try {
      const originalLog = console.log
      const logs: string[] = []
      console.log = (...args) => {
        logs.push(args.map((arg) => String(arg)).join(' '))
        originalLog(...args)
      }
      const result = new Function(code.value)()
      console.log = originalLog
      if (logs.length > 0) {
        output.value = logs.join('\n')
      } else if (result !== undefined) {
        output.value = String(result)
      } else {
        output.value = '代码执行完成'
      }
    } catch (error) {
      output.value = `错误: ${error}`
    }
  } else {
    output.value = `${currentLanguage.value} 代码预览:\n${code.value}`
  }
}

async function analyzePage() {
  if (isAnalyzing.value) return
  isAnalyzing.value = true
  output.value = '正在分析页面...'
  try {
    const pageData: PageContent = await analyzeCurrentPage()
    const formattedData = JSON.stringify(pageData, null, 2)
    code.value = formattedData
    currentLanguage.value = 'json'
    const summary = `页面分析完成！
标题: ${pageData.metadata.title || '未知'}
描述: ${pageData.metadata.description || '无'}
字数: ${pageData.wordCount}
预估阅读时间: ${pageData.readingTime} 分钟`
    output.value = summary
  } catch (error) {
    output.value = `分析页面时出错: ${error}`
    console.error('Page analysis error:', error)
  } finally {
    isAnalyzing.value = false
  }
}

function startDrag(event: MouseEvent) {
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

function handleKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault()
    toggleEditor()
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && isEditorVisible.value) {
    event.preventDefault()
    runCode()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.floating-editor-wrapper {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.floating-button {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  pointer-events: auto;
  user-select: none;
}
.floating-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}
.editor-panel {
  position: fixed;
  top: v-bind('panelPosition.y + "px"');
  left: v-bind('panelPosition.x + "px"');
  width: 900px;
  height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  overflow: hidden;
  transition: height 0.3s ease;
  display: flex;
  flex-direction: column;
}
.editor-panel.minimized {
  height: 50px;
}
.editor-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
}
.editor-title {
  font-weight: 600;
  font-size: 14px;
}
.editor-controls {
  display: flex;
  gap: 8px;
}
.control-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background 0.2s;
}
.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.editor-layout {
  display: flex;
  height: 100%;
}
.sidebar {
  width: 250px;
  background: #f8f9fa;
  border-right: 1px solid #e1e4e8;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-tabs {
  display: flex;
  background: #ffffff;
  border-bottom: 1px solid #e1e4e8;
}
.sidebar-tab {
  flex: 1;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #586069;
  transition: all 0.2s;
}
.sidebar-tab:hover {
  background: #f1f3f4;
}
.sidebar-tab.active {
  background: #f8f9fa;
  color: #0969da;
  border-bottom: 2px solid #0969da;
}
.sidebar-content {
  flex: 1;
  overflow: hidden;
}
.search-panel {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.search-header {
  font-size: 11px;
  font-weight: 600;
  color: #586069;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.search-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d9e0;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 12px;
}
.search-input:focus {
  outline: none;
  border-color: #0969da;
}
.search-results {
  flex: 1;
  overflow-y: auto;
}
.no-results {
  color: #656d76;
  font-size: 12px;
  text-align: center;
  padding: 20px;
}
.main-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.file-tabs {
  display: flex;
  background: #f6f8fa;
  border-bottom: 1px solid #d1d9e0;
  overflow-x: auto;
  flex-shrink: 0;
}
.file-tab {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f6f8fa;
  border-right: 1px solid #d1d9e0;
  cursor: pointer;
  font-size: 12px;
  color: #656d76;
  white-space: nowrap;
  transition: all 0.2s;
  min-width: 0;
}
.file-tab:hover {
  background: #f1f3f4;
}
.file-tab.active {
  background: white;
  color: #24292f;
  border-bottom: 2px solid #0969da;
}
.tab-icon {
  margin-right: 6px;
  flex-shrink: 0;
}
.tab-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tab-close {
  background: none;
  border: none;
  color: #656d76;
  cursor: pointer;
  padding: 2px;
  margin-left: 6px;
  border-radius: 2px;
  font-size: 10px;
  opacity: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}
.file-tab:hover .tab-close {
  opacity: 1;
}
.tab-close:hover {
  background: #f1f3f4;
  color: #24292f;
}
.editor-toolbar {
  padding: 8px 12px;
  background: #f6f8fa;
  border-bottom: 1px solid #d1d9e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.toolbar-left {
  display: flex;
  align-items: center;
}
.current-file-info {
  font-size: 12px;
  color: #656d76;
  font-weight: 500;
}
.toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
}
.language-select {
  padding: 4px 8px;
  border: 1px solid #d1d9e0;
  border-radius: 4px;
  font-size: 12px;
  background: white;
}
.theme-btn,
.run-btn,
.analyze-btn {
  padding: 4px 8px;
  border: 1px solid #d1d9e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.theme-btn:hover,
.run-btn:hover,
.analyze-btn:hover {
  background: #f1f3f4;
}
.analyze-btn {
  background: #17a2b8;
  color: white;
  border-color: #17a2b8;
}
.analyze-btn:hover {
  background: #138496;
}
.run-btn {
  background: #28a745;
  color: white;
  border-color: #28a745;
}
.run-btn:hover {
  background: #218838;
}
.editor-instance {
  flex: 1;
  margin: 0;
  overflow: hidden;
}
.output-area {
  margin: 12px;
  border: 1px solid #d1d9e0;
  border-radius: 4px;
  max-height: 120px;
  overflow-y: auto;
  flex-shrink: 0;
}
.output-header {
  background: #f6f8fa;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid #d1d9e0;
}
.output-content {
  padding: 12px;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
}
.file-tabs::-webkit-scrollbar,
.search-results::-webkit-scrollbar,
.output-area::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.file-tabs::-webkit-scrollbar-track,
.search-results::-webkit-scrollbar-track,
.output-area::-webkit-scrollbar-track {
  background: transparent;
}
.file-tabs::-webkit-scrollbar-thumb,
.search-results::-webkit-scrollbar-thumb,
.output-area::-webkit-scrollbar-thumb {
  background: #c1c7cd;
  border-radius: 3px;
}
.file-tabs::-webkit-scrollbar-thumb:hover,
.search-results::-webkit-scrollbar-thumb:hover,
.output-area::-webkit-scrollbar-thumb:hover {
  background: #a8b0b8;
}
</style>
