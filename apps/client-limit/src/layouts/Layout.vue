<script lang="ts" setup>
  import { pageRoutes } from '@/shared/router'

</script>

<template>
  <main>
    <nav
      class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="px-3 py-3 lg:px-5 lg:pl-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-start rtl:justify-end">
            <span
              class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white"
            >
              limit-atu
            </span>
          </div>
          <div class="flex items-center">
            <div class="flex items-center ms-3">
              <div>тут что-то будет</div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <aside
      id="logo-sidebar"
      class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
      aria-label="Sidebar"
    >
      <div class="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
        <ul class="space-y-2">
          <li v-for="route in pageRoutes" :key="route.name">
            <RouterLink
              :to="route.path"
              href="#"
              class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
             
                <component :is="route.componentIcon" class="mr-3" />
                <span class="ms-3">{{ route.name }}</span>
            
            </RouterLink>
          </li>
        </ul>
      </div>
    </aside>

    <router-view />
  </main>
</template>
