<script setup lang="ts">
import { ref, toValue } from 'vue'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import Button from '@/shared/ui/button/Button.vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useRegister } from '../composables/use-register'
import { registerSchema } from 'z-limit/auth'

const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)
const { mutate, error } = useRegister()
const parseError = ref<Zod.ZodError | null>(null)

const register = () => {
  const reg = registerSchema.safeParse(registerForm.value)
  if (reg.error) {
    parseError.value = reg.error
    console.log(parseError.value);
    
  }

  mutate(toValue(registerForm), {

  })
}

const registerForm = ref({
  name: '',
  password: '',
  confirmPassword: ''
})
</script>

<template>
  <div class="grid gap-1">
    <div>
      <Label>Имя</Label>
      <Input v-model="registerForm.name"> </Input>
    </div>
    <div class="relative">
      <Label>Пароль</Label>
      <Input v-model="registerForm.password" :type="passwordVisible ? 'text' : 'password'"> </Input>
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
      >
      </Input>
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
