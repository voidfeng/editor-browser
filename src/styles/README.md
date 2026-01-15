# 样式文件说明

## 文件结构

- `variables.scss` - 全局 SCSS 变量（颜色、间距、字体等）
- `mixins.scss` - 可复用的 SCSS 混合（Flexbox、文本省略、滚动条等）
- `functions.scss` - SCSS 函数（单位转换、颜色计算等）
- `vscode-theme.css` - VS Code 主题 CSS 变量

## 使用方式

### 在 Vue 组件中使用 SCSS

```vue
<template>
  <div class="my-component">
    <h1 class="title">标题</h1>
    <p class="content">内容</p>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.my-component {
  padding: $spacing-md;

  .title {
    font-size: $font-size-xl;
    color: $primary-color;
    @include text-ellipsis(1);
  }

  .content {
    @include flex(column, flex-start, flex-start);
    margin-top: $spacing-sm;
  }
}
</style>
```

## 样式优先级

1. **UnoCSS 工具类** - 用于简单的布局和样式
2. **SCSS** - 用于复杂样式、动画、主题切换
3. **CSS 变量** - 用于主题和动态样式

## 最佳实践

- 保持 SCSS 嵌套层级不超过 3 层
- 使用变量管理设计令牌
- 利用混合复用常见样式模式
- 避免在 SCSS 中硬编码颜色和尺寸
