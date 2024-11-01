import { createRouter, createWebHistory } from 'vue-router'
import { router as authRouter } from '@/modules/auth/router'
import { router as userRouter } from '@/modules/users/router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRouter,
    ...userRouter,
    { path: '/:pathMatch(.*)*', redirect: '/auth' },

  ]
})

export default router
