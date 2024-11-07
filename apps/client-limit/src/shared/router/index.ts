import { createRouter, createWebHistory } from 'vue-router'
import { router as authRouter } from '@/modules/auth/router'
import { router as userRouter } from '@/modules/users/router'

const routes = [...authRouter, ...userRouter]

console.log(routes);


export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...routes, { path: '/:pathMatch(.*)*', redirect: '/auth' }]
})

export const routesNames = routes.filter((route) => route.onLayout)