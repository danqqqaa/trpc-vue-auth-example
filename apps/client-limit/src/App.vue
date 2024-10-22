<script setup lang="ts">
import { RouterView } from 'vue-router'
import Layout from './layouts/Layout.vue'
import Toaster from '@/shared/ui/toast/Toaster.vue'
</script>

<template>
  <Toaster/>
  <RouterView />
</template>

<style scoped></style>
