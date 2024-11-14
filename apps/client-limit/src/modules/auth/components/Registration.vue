<script setup lang="ts">
  import { ref, toValue } from 'vue'
  import { Input } from '@/shared/ui/input'
  import { Label } from '@/shared/ui/label'
  import Button from '@/shared/ui/button/Button.vue'
  import { Eye, EyeOff } from 'lucide-vue-next'
  import { useRegister } from '../composables/use-register'
  import { registerSchema } from 'z-limit/auth'
  import { useToast } from '@/shared/ui/toast/use-toast'

  const passwordVisible = ref(false)
  const confirmPasswordVisible = ref(false)

  const { toast } = useToast()
  const { mutate, isError } = useRegister()

  const registerForm = ref({
    login: '',
    password: '',
    confirmPassword: ''
  })

  const register = () => {
    const reg = registerSchema.safeParse(toValue(registerForm))
    if (!reg.success) {
      const errorMessages = reg.error.issues
      for (let _error of errorMessages) {
        toast({
          title: 'Ошибка регистрации',
          description: _error.message,
          variant: 'destructive',
          duration: 3000
        })
      }
    } else mutate(toValue(registerForm))
    console.log(isError);
  }
</script>

<template>
  <div class="grid gap-1">
    <div>
      <Label>Имя</Label>
      <Input v-model="registerForm.login"></Input>
    </div>
    <div class="relative">
      <Label>Пароль</Label>
      <Input v-model="registerForm.password" :type="passwordVisible ? 'text' : 'password'"></Input>
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
    <div class="relative">
      <Label>Подтвердите пароль</Label>
      <Input
        v-model="registerForm.confirmPassword"
        :type="confirmPasswordVisible ? 'text' : 'password'"
      ></Input>
      <Button
        variant="ghost"
        size="icon"
        class="absolute mt-6 right-0 top-0 text-muted-foreground bg-transparent hover:bg-transparent"
        @click="confirmPasswordVisible = !confirmPasswordVisible"
      >
        <Eye v-if="!confirmPasswordVisible" />
        <EyeOff v-else />
      </Button>
    </div>
    <Button class="mt-6 w-full" @click="register">Регистрация</Button>
  </div>
</template>
