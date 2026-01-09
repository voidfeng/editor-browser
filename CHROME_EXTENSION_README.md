# Editor Browser Chrome Extension

这是一个使用 Vue 3 + CRXJS 开发的 Chrome 扩展项目。

## 开发环境设置

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 在Chrome中加载扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录下的 `dist` 文件夹

### 3. 测试扩展

- 扩展加载后，你会在浏览器工具栏看到扩展图标
- 点击图标打开popup界面
- popup界面会显示当前页面URL和测试按钮

## 项目结构

```
├── src/
│   ├── App.vue          # 主popup组件
│   ├── main.ts          # Vue应用入口
│   └── router/          # 路由配置
├── manifest.config.ts   # Chrome扩展manifest配置
├── vite.config.ts       # Vite配置(已集成CRXJS)
└── dist/                # 构建输出目录
```

## 功能特性

- ✅ Vue 3 + TypeScript
- ✅ CRXJS 热重载支持
- ✅ 获取当前标签页信息
- ✅ 现代化UI界面
- ✅ 开发者友好的配置

## 扩展权限

- `activeTab`: 获取当前活动标签页信息
- `storage`: 本地存储数据

## 开发提示

1. 修改代码后，扩展会自动重新加载
2. 如果popup界面有问题，可以右键扩展图标选择"检查弹出式窗口"来调试
3. 可以在 `manifest.config.ts` 中添加更多权限和配置
