import { createRouter, createWebHistory } from 'vue-router'
import { router as authRouter } from '@/modules/auth/router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRouter,
    { path: '/:pathMatch(.*)*', redirect: '/auth' },

  ]
})

export default router
