import { createRouter, createWebHistory } from 'vue-router'
import { RouteRecordRaw } from 'vue-router'
import { router as authRouter } from '@/modules/auth/router'
import { router as userRouter } from '@/modules/users/router'
import Layout from '@/layouts/Layout.vue'
import { Component } from 'vue'
import { Bug } from 'lucide-vue-next'

type _RouteRecord = RouteRecordRaw & {
  componentIcon?: Component
  redirect?: string
}

const testRoute = {
  path: '',
  componentIcon: Bug,
  name: 'Информация'
}

const routes = [
  ...authRouter,
  {
    path: '/',
    component: Layout,
    children: [...userRouter, testRoute]
  }
] as _RouteRecord[]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...routes, { path: '/:pathMatch(.*)*', redirect: '/' }]
})

export const pageRoutes = routes.flatMap(
  (route: _RouteRecord) => route.children || []
) as _RouteRecord[]
