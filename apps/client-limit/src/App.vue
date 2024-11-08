<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import Toaster from '@/shared/ui/toast/Toaster.vue'
  import { useAuthStore } from '@/shared/stores/auth/auth-store'
  import { router } from '@/shared/router'

  const { currentUser, getCurrentUser } = useAuthStore()

  getCurrentUser()

  router.beforeEach((to, _, next) => {
    if (to.name !== 'Авторизация' && !currentUser) next({ name: 'Авторизация' })
    else next()
  })
</script>

<template>
  <Toaster />
  <RouterView />
</template>

<style scoped></style>
