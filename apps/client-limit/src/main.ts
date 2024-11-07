import './styles/global.css'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from '@/shared/router'
import { createPinia } from 'pinia'

const app = createApp(App) 

const pinia = createPinia()

app.use(VueQueryPlugin).use(pinia).use(router)

app.mount('#app')
