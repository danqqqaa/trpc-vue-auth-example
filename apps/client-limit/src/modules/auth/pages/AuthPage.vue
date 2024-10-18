<script setup lang="ts">
// components
import Registration from '@/modules/auth/components/Registration.vue'
import Login from '@/modules/auth/components/Login.vue'
// ui
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { ref } from 'vue'

const tabs = ref([
  {
    value: 'reg',
    desc: 'Регистрация'
  },
  {
    value: 'log',
    desc: 'Авторизация'
  }
])


</script>

<template>
  <div class="w-full h-screen flex items-center justify-center bg-primary">
    <Tabs class="w-1/3" default-value="reg">
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.desc }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
        <Card>
          <CardHeader>
            <CardTitle class="flex justify-center">{{ tab.desc }}</CardTitle>
          </CardHeader>
          <CardContent>
            <Registration v-if="tab.value === 'reg'"></Registration>
            <Login v-else></Login>
          </CardContent>
        </Card>
        
      </TabsContent>
    </Tabs>
  </div>
</template>
