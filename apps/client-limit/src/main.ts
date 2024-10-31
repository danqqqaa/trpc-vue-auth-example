import './styles/global.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/shared/router'
import { useProvideAuthService } from '@/shared/composables/use-auth-service'

const app = createApp(App) 

app.provide('AUTH_SERVICE', useProvideAuthService())


app.use(VueQueryPlugin).use(router)

app.mount('#app')
