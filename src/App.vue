<script setup lang="ts">
import { ref } from 'vue'
import CodeEditor from './components/CodeEditor.vue'

const message = ref('Hello Chrome Extension!')
const currentUrl = ref('')
const code = ref(`// 欢迎使用 CodeMirror 编辑器
function hello() {
  console.log('Hello World!');
}

hello();`)

// 获取当前标签页URL
if (typeof chrome !== 'undefined' && chrome.tabs) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    if (tabs[0]?.url) {
      currentUrl.value = tabs[0].url
    }
  })
}
</script>

<template>
  <div class="popup-container">
    <header class="popup-header">
      <h1>Editor Browser</h1>
    </header>

    <main class="popup-content">
      <div class="greeting">
        <p>{{ message }}</p>
      </div>

      <div class="current-page" v-if="currentUrl">
        <h3>当前页面:</h3>
        <p class="url">{{ currentUrl }}</p>
      </div>

      <div class="editor-section">
        <h3>代码编辑器:</h3>
        <CodeEditor v-model="code" language="javascript" theme="light" style="height: 200px" />
      </div>

      <div class="actions">
        <button class="btn btn-primary" @click="message = 'Extension is working!'">测试按钮</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.popup-container {
  width: 500px;
  min-height: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.popup-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  text-align: center;
}

.popup-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.popup-content {
  padding: 16px;
}

.greeting {
  margin-bottom: 16px;
}

.current-page {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.editor-section {
  margin-bottom: 16px;
}

.editor-section h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #495057;
}

.current-page h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #495057;
}

.url {
  font-size: 12px;
  color: #6c757d;
  word-break: break-all;
  margin: 0;
}

.actions {
  text-align: center;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}
</style>
