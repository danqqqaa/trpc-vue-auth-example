import { useTRPC } from '@/shared/composables/use-trpc'
import { loginSchema, loginSchemaType } from 'z-limit'
import { ValidateSchemas } from '@/shared/validate-schemas'
import { useAuthStore } from '@/shared/stores/auth-store'
export async function useLogin(props: loginSchemaType) {
  ValidateSchemas(loginSchema, props)
  const trpc = useTRPC()
  const authStore = useAuthStore()
  try {
    const login = await trpc.auth.login.mutate(props)
    if (login) {
      authStore.setTokens(login.refresh, login.access)
    }
  } catch (error) {
    console.log(error)
  }
}
