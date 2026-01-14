import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true
    })
  ],
  theme: {
    colors: {
      // VS Code 主题颜色映射到 UnoCSS
      vscode: {
        // 背景色
        'bg-primary': 'var(--vscode-bg-primary)',
        'bg-secondary': 'var(--vscode-bg-secondary)',
        'bg-tertiary': 'var(--vscode-bg-tertiary)',

        // 侧边栏
        'sidebar-bg': 'var(--vscode-sidebar-bg)',
        'sidebar-border': 'var(--vscode-sidebar-border)',
        'sidebar-header': 'var(--vscode-sidebar-header-bg)',
        'sidebar-hover': 'var(--vscode-sidebar-item-hover)',
        'sidebar-active': 'var(--vscode-sidebar-item-active)',

        // 活动栏
        'activitybar-bg': 'var(--vscode-activitybar-bg)',
        'activitybar-border': 'var(--vscode-activitybar-border)',
        'activitybar-hover': 'var(--vscode-activitybar-item-hover)',
        'activitybar-active': 'var(--vscode-activitybar-item-active)',

        // 编辑器
        'editor-bg': 'var(--vscode-editor-bg)',
        'editor-line-number': 'var(--vscode-editor-line-number)',
        'editor-selection': 'var(--vscode-editor-selection)',
        'editor-cursor': 'var(--vscode-editor-cursor)',

        // 标签栏
        'tab-bg': 'var(--vscode-tab-bg)',
        'tab-active': 'var(--vscode-tab-active-bg)',
        'tab-inactive': 'var(--vscode-tab-inactive-bg)',
        'tab-border': 'var(--vscode-tab-border)',
        'tab-active-border': 'var(--vscode-tab-active-border)',
        'tab-hover': 'var(--vscode-tab-hover-bg)',

        // 标题栏
        'titlebar-bg': 'var(--vscode-titlebar-bg)',
        'titlebar-active': 'var(--vscode-titlebar-active-bg)',
        'titlebar-inactive': 'var(--vscode-titlebar-inactive-bg)',
        'titlebar-border': 'var(--vscode-titlebar-border)',

        // 状态栏
        'statusbar-bg': 'var(--vscode-statusbar-bg)',
        'statusbar-no-folder': 'var(--vscode-statusbar-no-folder-bg)',
        'statusbar-debug': 'var(--vscode-statusbar-debug-bg)',
        'statusbar-border': 'var(--vscode-statusbar-border)',
        'statusbar-hover': 'var(--vscode-statusbar-item-hover)',

        // 工具栏
        'toolbar-bg': 'var(--vscode-toolbar-bg)',
        'toolbar-border': 'var(--vscode-toolbar-border)',

        // 文本
        'text-primary': 'var(--vscode-text-primary)',
        'text-secondary': 'var(--vscode-text-secondary)',
        'text-muted': 'var(--vscode-text-muted)',
        'text-link': 'var(--vscode-text-link)',
        'text-active': 'var(--vscode-text-active)',

        // 按钮
        'button-bg': 'var(--vscode-button-bg)',
        'button-hover': 'var(--vscode-button-hover-bg)',
        'button-active': 'var(--vscode-button-active-bg)',
        'button-secondary': 'var(--vscode-button-secondary-bg)',
        'button-secondary-hover': 'var(--vscode-button-secondary-hover)',

        // 输入框
        'input-bg': 'var(--vscode-input-bg)',
        'input-border': 'var(--vscode-input-border)',
        'input-focus': 'var(--vscode-input-focus-border)',
        'input-placeholder': 'var(--vscode-input-placeholder)',

        // 下拉菜单
        'dropdown-bg': 'var(--vscode-dropdown-bg)',
        'dropdown-border': 'var(--vscode-dropdown-border)',
        'dropdown-hover': 'var(--vscode-dropdown-hover-bg)',

        // 滚动条
        'scrollbar-bg': 'var(--vscode-scrollbar-bg)',
        'scrollbar-thumb': 'var(--vscode-scrollbar-thumb)',
        'scrollbar-thumb-hover': 'var(--vscode-scrollbar-thumb-hover)',

        // 边框
        'border-primary': 'var(--vscode-border-primary)',
        'border-secondary': 'var(--vscode-border-secondary)',
        divider: 'var(--vscode-divider)',

        // 高亮
        focus: 'var(--vscode-focus-border)',
        selection: 'var(--vscode-selection-bg)',
        hover: 'var(--vscode-hover-bg)',

        // 语义色
        success: 'var(--vscode-success)',
        warning: 'var(--vscode-warning)',
        error: 'var(--vscode-error)',
        info: 'var(--vscode-info)',

        // 面板
        'panel-bg': 'var(--vscode-panel-bg)',
        'panel-border': 'var(--vscode-panel-border)',
        'panel-header': 'var(--vscode-panel-header-bg)',

        // 列表
        'list-hover': 'var(--vscode-list-hover-bg)',
        'list-active': 'var(--vscode-list-active-bg)',
        'list-focus': 'var(--vscode-list-focus-bg)',
        'list-inactive': 'var(--vscode-list-inactive-selection)'
      }
    }
  },
  shortcuts: {
    // VS Code 风格组件快捷方式
    'vscode-sidebar':
      'bg-vscode-sidebar-bg border-r border-vscode-sidebar-border text-vscode-text-primary',
    'vscode-sidebar-item':
      'px-2 py-1 cursor-pointer transition-colors hover:bg-vscode-sidebar-hover',
    'vscode-sidebar-item-active': 'bg-vscode-sidebar-active',

    'vscode-activitybar': 'bg-vscode-activitybar-bg border-r border-vscode-activitybar-border',
    'vscode-activitybar-item':
      'p-3 cursor-pointer transition-colors hover:bg-vscode-activitybar-hover',
    'vscode-activitybar-item-active': 'bg-vscode-activitybar-active',

    'vscode-tab':
      'px-3 py-2 bg-vscode-tab-inactive border-r border-vscode-tab-border cursor-pointer transition-colors hover:bg-vscode-tab-hover text-vscode-text-secondary',
    'vscode-tab-active':
      'bg-vscode-tab-active text-vscode-text-active border-b-2 border-vscode-tab-active-border',

    'vscode-titlebar':
      'bg-vscode-titlebar-bg border-b border-vscode-titlebar-border text-vscode-text-primary px-4 py-2',

    'vscode-statusbar':
      'bg-vscode-statusbar-bg border-t border-vscode-statusbar-border text-white px-4 py-1 text-xs',
    'vscode-statusbar-item':
      'px-2 cursor-pointer transition-colors hover:bg-vscode-statusbar-hover',

    'vscode-toolbar': 'bg-vscode-toolbar-bg border-b border-vscode-toolbar-border px-3 py-2',

    'vscode-editor': 'bg-vscode-editor-bg text-vscode-text-primary',

    'vscode-button':
      'px-3 py-1.5 bg-vscode-button-bg text-white rounded cursor-pointer transition-colors hover:bg-vscode-button-hover active:bg-vscode-button-active',
    'vscode-button-secondary':
      'px-3 py-1.5 bg-vscode-button-secondary text-vscode-text-primary rounded cursor-pointer transition-colors hover:bg-vscode-button-secondary-hover',

    'vscode-input':
      'px-2 py-1 bg-vscode-input-bg border border-vscode-input-border text-vscode-text-primary rounded focus:outline-none focus:border-vscode-input-focus',

    'vscode-dropdown':
      'px-2 py-1 bg-vscode-dropdown-bg border border-vscode-dropdown-border text-vscode-text-primary rounded cursor-pointer',

    'vscode-panel': 'bg-vscode-panel-bg border-t border-vscode-panel-border',
    'vscode-panel-header':
      'bg-vscode-panel-header text-vscode-text-primary px-3 py-2 text-xs font-semibold uppercase tracking-wide',

    'vscode-scrollbar':
      '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-vscode-scrollbar-bg [&::-webkit-scrollbar-thumb]:bg-vscode-scrollbar-thumb [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-vscode-scrollbar-thumb-hover'
  }
})
