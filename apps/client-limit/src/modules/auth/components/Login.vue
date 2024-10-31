<script setup lang="ts">
  import { Input } from '@/shared/ui/input'
  import { Label } from '@/shared/ui/label'
  import { ref, toValue } from 'vue'
  import Button from '@/shared/ui/button/Button.vue'
  import { Eye, EyeOff } from 'lucide-vue-next'
  import { useLogin } from '../composables/use-login'
  import { useAuthService } from '@/shared/composables/use-auth-service'
  const passwordVisible = ref(false)

  const useAuthServiceInject = useAuthService()

  const loginForm = ref({
    login: '',
    password: ''
  })

  const login = async () => await useLogin(toValue(loginForm), useAuthServiceInject)
</script>

<template>
  <div class="grid gap-1">
    <div>
      <Label>Логин</Label>
      <Input v-model="loginForm.login"></Input>
    </div>
    <div class="relative">
      <Label>Пароль</Label>
      <Input v-model="loginForm.password" :type="passwordVisible ? 'text' : 'password'"></Input>
      <Button
        variant="ghost"
        size="icon"
        class="absolute mt-6 right-0 top-0 text-muted-foreground bg-transparent hover:bg-transparent"
        @click="passwordVisible = !passwordVisible"
      >
        <Eye v-if="!passwordVisible" />
        <EyeOff v-else />
      </Button>
    </div>
    <Button class="mt-6 w-full" @click="login">Регистрация</Button>
  </div>
</template>
