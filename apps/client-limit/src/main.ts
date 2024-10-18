import './styles/global.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/shared/router'

const app = createApp(App)

app.use(VueQueryPlugin).use(router)

app.mount('#app')
