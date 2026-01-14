import { createApp } from 'vue'
import FloatingEditor from './components/FloatingEditor.vue'

// UnoCSS
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'

// VS Code Theme
import './styles/vscode-theme.css'

// 创建编辑器容器
function createEditorContainer() {
  const container = document.createElement('div')
  container.id = 'editor-browser-container'
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483647;
  `
  document.body.appendChild(container)
  return container
}

// 初始化编辑器应用
function initEditorApp() {
  // 避免重复初始化
  if (document.getElementById('editor-browser-container')) {
    return
  }

  const container = createEditorContainer()
  const app = createApp(FloatingEditor)
  app.mount(container)
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEditorApp)
} else {
  initEditorApp()
}
