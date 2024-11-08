<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import Toaster from '@/shared/ui/toast/Toaster.vue'
  import { onMounted } from 'vue'
  import { useAuthStore } from '@/shared/stores/auth/auth-store'

  const { getCurrentUser } = useAuthStore()

  onMounted(() => {
    getCurrentUser()
  })
</script>

<template>
  <Toaster />
  <RouterView />
</template>

<style scoped></style>
