<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import Toaster from '@/shared/ui/toast/Toaster.vue'
  import Layout from './layouts/Layout.vue'
</script>

<template>
  <Layout>
    <Toaster />
    <RouterView />
  </Layout>
</template>

<style scoped></style>
