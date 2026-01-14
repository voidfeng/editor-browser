# VS Code 暗黑主题配色架构指南

## 📋 概述

本项目采用 **CSS 变量 + UnoCSS** 的架构来实现 VS Code 暗黑主题，提供了完整的颜色系统和组件样式。

## 🎨 颜色系统架构

### 1. CSS 变量层（`src/styles/vscode-theme.css`）

所有颜色定义在 CSS 变量中，支持暗色和亮色两种主题：

```css
:root {
  --vscode-bg-primary: #1e1e1e;
  --vscode-sidebar-bg: #252526;
  /* ... 更多变量 */
}

:root[data-theme='light'] {
  --vscode-bg-primary: #ffffff;
  /* ... 亮色主题变量 */
}
```

### 2. UnoCSS 映射层（`uno.config.ts`）

将 CSS 变量映射到 UnoCSS 的颜色系统，可以直接在类名中使用：

```typescript
theme: {
  colors: {
    vscode: {
      'bg-primary': 'var(--vscode-bg-primary)',
      'sidebar-bg': 'var(--vscode-sidebar-bg)',
      // ...
    }
  }
}
```

### 3. 快捷方式层（Shortcuts）

预定义常用组件样式，简化开发：

```typescript
shortcuts: {
  'vscode-sidebar': 'bg-vscode-sidebar-bg border-r border-vscode-sidebar-border text-vscode-text-primary',
  'vscode-tab': 'px-3 py-2 bg-vscode-tab-inactive border-r border-vscode-tab-border cursor-pointer',
  // ...
}
```

## 🏗️ 组件区域配色方案

### 1. 左侧侧边栏（Sidebar）

**颜色变量：**

- `--vscode-sidebar-bg: #252526` - 侧边栏背景
- `--vscode-sidebar-border: #1e1e1e` - 侧边栏边框
- `--vscode-sidebar-header-bg: #252526` - 标题背景
- `--vscode-sidebar-item-hover: #2a2d2e` - 项目悬停
- `--vscode-sidebar-item-active: #37373d` - 项目激活

**UnoCSS 使用：**

```html
<!-- 方式1: 使用快捷方式 -->
<div class="vscode-sidebar">
  <div class="vscode-sidebar-item">文件项</div>
  <div class="vscode-sidebar-item vscode-sidebar-item-active">激活项</div>
</div>

<!-- 方式2: 使用颜色类 -->
<div class="bg-vscode-sidebar-bg border-r border-vscode-sidebar-border">
  <div class="hover:bg-vscode-sidebar-hover">文件项</div>
</div>
```

### 2. 活动栏（Activity Bar）- 最左侧图标栏

**颜色变量：**

- `--vscode-activitybar-bg: #333333` - 活动栏背景
- `--vscode-activitybar-border: #1e1e1e` - 边框
- `--vscode-activitybar-item-hover: #505050` - 悬停
- `--vscode-activitybar-item-active: #007acc` - 激活（蓝色高亮）

**UnoCSS 使用：**

```html
<div class="vscode-activitybar">
  <button class="vscode-activitybar-item">📁</button>
  <button class="vscode-activitybar-item vscode-activitybar-item-active">🔍</button>
</div>
```

### 3. 编辑器区域（Editor）

**颜色变量：**

- `--vscode-editor-bg: #1e1e1e` - 编辑器背景
- `--vscode-editor-line-number: #858585` - 行号颜色
- `--vscode-editor-selection: #264f78` - 选中文本背景
- `--vscode-editor-cursor: #aeafad` - 光标颜色

**UnoCSS 使用：**

```html
<div class="vscode-editor h-full">
  <!-- 编辑器内容 -->
</div>
```

### 4. 标签栏（Tabs）

**颜色变量：**

- `--vscode-tab-bg: #2d2d2d` - 标签背景
- `--vscode-tab-active-bg: #1e1e1e` - 激活标签背景
- `--vscode-tab-inactive-bg: #2d2d2d` - 非激活标签
- `--vscode-tab-border: #252526` - 标签边框
- `--vscode-tab-active-border: #007acc` - 激活标签底部蓝色边框
- `--vscode-tab-hover-bg: #323233` - 悬停背景

**UnoCSS 使用：**

```html
<div class="flex bg-vscode-tab-bg border-b border-vscode-tab-border">
  <div class="vscode-tab">未激活标签</div>
  <div class="vscode-tab vscode-tab-active">激活标签</div>
</div>
```

### 5. 顶部标题栏（Title Bar）

**颜色变量：**

- `--vscode-titlebar-bg: #3c3c3c` - 标题栏背景
- `--vscode-titlebar-active-bg: #3c3c3c` - 激活状态
- `--vscode-titlebar-inactive-bg: #2d2d2d` - 非激活状态
- `--vscode-titlebar-border: #1e1e1e` - 边框

**UnoCSS 使用：**

```html
<div class="vscode-titlebar">
  <span>🚀 Editor Browser</span>
</div>
```

### 6. 状态栏（Status Bar）- 底部

**颜色变量：**

- `--vscode-statusbar-bg: #007acc` - 状态栏背景（蓝色）
- `--vscode-statusbar-no-folder-bg: #68217a` - 无文件夹时（紫色）
- `--vscode-statusbar-debug-bg: #cc6633` - 调试模式（橙色）
- `--vscode-statusbar-border: #1e1e1e` - 边框
- `--vscode-statusbar-item-hover: #005a9e` - 项目悬停

**UnoCSS 使用：**

```html
<div class="vscode-statusbar">
  <div class="vscode-statusbar-item">JavaScript</div>
  <div class="vscode-statusbar-item">UTF-8</div>
</div>
```

### 7. 工具栏（Toolbar）

**颜色变量：**

- `--vscode-toolbar-bg: #2d2d2d` - 工具栏背景
- `--vscode-toolbar-border: #1e1e1e` - 边框

**UnoCSS 使用：**

```html
<div class="vscode-toolbar flex justify-between items-center">
  <div>文件信息</div>
  <div class="flex gap-2">
    <button class="vscode-button-secondary">主题</button>
    <button class="vscode-button">运行</button>
  </div>
</div>
```

### 8. 面板区域（Panel）- 底部终端/输出

**颜色变量：**

- `--vscode-panel-bg: #1e1e1e` - 面板背景
- `--vscode-panel-border: #2d2d2d` - 面板边框
- `--vscode-panel-header-bg: #252526` - 面板标题背景

**UnoCSS 使用：**

```html
<div class="vscode-panel">
  <div class="vscode-panel-header">输出</div>
  <div class="p-3 text-vscode-text-primary">
    <!-- 输出内容 -->
  </div>
</div>
```

## 🎯 常用组件样式

### 按钮

```html
<!-- 主要按钮 -->
<button class="vscode-button">运行代码</button>

<!-- 次要按钮 -->
<button class="vscode-button-secondary">取消</button>

<!-- 自定义按钮 -->
<button class="bg-vscode-button-bg text-white px-4 py-2 rounded hover:bg-vscode-button-hover">
  自定义
</button>
```

### 输入框

```html
<input type="text" class="vscode-input w-full" placeholder="搜索文件..." />
```

### 下拉菜单

```html
<select class="vscode-dropdown">
  <option>JavaScript</option>
  <option>TypeScript</option>
</select>
```

### 滚动条

```html
<div class="overflow-auto vscode-scrollbar">
  <!-- 内容 -->
</div>
```

## 🔄 主题切换

### 切换到亮色主题

```javascript
document.documentElement.setAttribute('data-theme', 'light')
```

### 切换到暗色主题

```javascript
document.documentElement.removeAttribute('data-theme')
// 或
document.documentElement.setAttribute('data-theme', 'dark')
```

### Vue 组件中使用

```vue
<script setup>
import { ref } from 'vue'

const isDarkTheme = ref(true)

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value
  if (isDarkTheme.value) {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
  }
}
</script>

<template>
  <button @click="toggleTheme" class="vscode-button-secondary">
    {{ isDarkTheme ? '☀️ 亮色' : '🌙 暗色' }}
  </button>
</template>
```

## 📦 完整示例

### 编辑器布局示例

```vue
<template>
  <div class="h-screen flex flex-col bg-vscode-bg-primary">
    <!-- 标题栏 -->
    <div class="vscode-titlebar">
      <span>🚀 Editor Browser</span>
    </div>

    <!-- 主内容区 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 活动栏 -->
      <div class="vscode-activitybar flex flex-col">
        <button class="vscode-activitybar-item vscode-activitybar-item-active">📁</button>
        <button class="vscode-activitybar-item">🔍</button>
        <button class="vscode-activitybar-item">⚙️</button>
      </div>

      <!-- 侧边栏 -->
      <div class="vscode-sidebar w-64 flex flex-col">
        <div class="vscode-panel-header">资源管理器</div>
        <div class="flex-1 overflow-auto vscode-scrollbar">
          <div class="vscode-sidebar-item">📄 index.html</div>
          <div class="vscode-sidebar-item vscode-sidebar-item-active">📄 main.js</div>
          <div class="vscode-sidebar-item">📄 style.css</div>
        </div>
      </div>

      <!-- 编辑器区域 -->
      <div class="flex-1 flex flex-col">
        <!-- 标签栏 -->
        <div class="flex bg-vscode-tab-bg border-b border-vscode-tab-border">
          <div class="vscode-tab">index.html</div>
          <div class="vscode-tab vscode-tab-active">main.js</div>
        </div>

        <!-- 工具栏 -->
        <div class="vscode-toolbar flex justify-between items-center">
          <span class="text-vscode-text-secondary text-sm">main.js</span>
          <div class="flex gap-2">
            <select class="vscode-dropdown text-xs">
              <option>JavaScript</option>
            </select>
            <button class="vscode-button text-xs">▶️ 运行</button>
          </div>
        </div>

        <!-- 编辑器 -->
        <div class="vscode-editor flex-1 overflow-auto vscode-scrollbar">
          <!-- CodeMirror 或其他编辑器组件 -->
        </div>

        <!-- 输出面板 -->
        <div class="vscode-panel h-32">
          <div class="vscode-panel-header">输出</div>
          <div
            class="p-3 text-vscode-text-primary font-mono text-sm overflow-auto vscode-scrollbar"
          >
            Hello World!
          </div>
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="vscode-statusbar flex justify-between items-center">
      <div class="flex">
        <div class="vscode-statusbar-item">🔵 main.js</div>
        <div class="vscode-statusbar-item">UTF-8</div>
      </div>
      <div class="flex">
        <div class="vscode-statusbar-item">Ln 1, Col 1</div>
      </div>
    </div>
  </div>
</template>
```

## 🎨 颜色参考表

### 背景色系列

| 变量名                  | 暗色值    | 用途               |
| ----------------------- | --------- | ------------------ |
| `--vscode-bg-primary`   | `#1e1e1e` | 主背景（编辑器）   |
| `--vscode-bg-secondary` | `#252526` | 次要背景（侧边栏） |
| `--vscode-bg-tertiary`  | `#2d2d30` | 第三级背景         |

### 文本色系列

| 变量名                    | 暗色值    | 用途     |
| ------------------------- | --------- | -------- |
| `--vscode-text-primary`   | `#cccccc` | 主要文本 |
| `--vscode-text-secondary` | `#969696` | 次要文本 |
| `--vscode-text-muted`     | `#6a6a6a` | 弱化文本 |
| `--vscode-text-active`    | `#ffffff` | 激活文本 |

### 强调色系列

| 变量名                  | 暗色值    | 用途             |
| ----------------------- | --------- | ---------------- |
| `--vscode-focus-border` | `#007acc` | 焦点边框（蓝色） |
| `--vscode-success`      | `#89d185` | 成功状态（绿色） |
| `--vscode-warning`      | `#cca700` | 警告状态（黄色） |
| `--vscode-error`        | `#f48771` | 错误状态（红色） |

## 💡 最佳实践

1. **优先使用快捷方式**：对于常见组件，使用预定义的快捷方式类名
2. **组合使用**：快捷方式可以与其他 UnoCSS 类组合使用
3. **保持一致性**：在整个应用中使用相同的颜色变量
4. **响应式设计**：结合 UnoCSS 的响应式前缀（如 `md:`, `lg:`）
5. **主题切换**：通过 `data-theme` 属性轻松切换主题

## 🔧 自定义扩展

如需添加新的颜色变量：

1. 在 `src/styles/vscode-theme.css` 中添加 CSS 变量
2. 在 `uno.config.ts` 的 `theme.colors.vscode` 中映射
3. 可选：在 `shortcuts` 中创建快捷方式

```css
/* vscode-theme.css */
:root {
  --vscode-custom-color: #ff6b6b;
}
```

```typescript
// uno.config.ts
theme: {
  colors: {
    vscode: {
      'custom': 'var(--vscode-custom-color)',
    }
  }
}
```

```html
<!-- 使用 -->
<div class="bg-vscode-custom text-white">自定义颜色</div>
```
