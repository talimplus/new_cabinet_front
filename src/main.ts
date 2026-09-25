import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/jetbrains-mono'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n, { currentLocale } from './locales'
import { useTheme } from '@/shared/composables/use-theme'

useTheme().initTheme()
document.documentElement.setAttribute('lang', currentLocale())

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.use(router)

// The auth guard rehydrates the session from the stored token during the first
// navigation; awaiting isReady() ensures that resolves before we render (§3.3).
router.isReady().then(() => app.mount('#app'))
