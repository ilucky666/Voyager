import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css'

// Plugins
import * as Sentry from '@sentry/vue'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

const app = createApp(App)

// i18n setup
const i18n = createI18n({
  legacy: false, // for Composition API
  locale: 'zh',
  fallbackLocale: 'en',
  messages: { en, zh }
})
app.use(i18n)

// Sentry setup
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}

app.use(createPinia())
app.use(router)
app.mount('#app')
