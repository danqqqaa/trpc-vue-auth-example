import { createRouter, createWebHistory } from 'vue-router'
import { RouteRecordRaw } from 'vue-router';

import { router as authRouter } from '@/modules/auth/router'
import { router as userRouter } from '@/modules/users/router'
import Layout from '@/layouts/Layout.vue'

const routes = [
  ...authRouter,
  {
    path: '/',
    component: Layout,
    children: [...userRouter]
  }
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...routes, { path: '/:pathMatch(.*)*', redirect: '/auth' }]
})

export const routesNames = routes.filter((route: RouteRecordRaw) => route.children)


