import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// UnoCSS
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'

// VS Code Theme
import './styles/vscode-theme.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
