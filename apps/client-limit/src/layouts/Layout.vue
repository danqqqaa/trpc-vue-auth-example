<script lang="ts" setup>
  import { routesNames } from '@/shared/router'

  console.log(routesNames)
</script>

<template>
  <main>
    <div class="w-full h-full">
        <router-view />
    </div>
  </main>
</template>
