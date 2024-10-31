import { useTRPC } from '@/shared/composables/use-trpc'
import { loginSchema, loginSchemaType } from 'z-limit'
import { ValidateSchemas } from '@/shared/validate-schemas'
import { AuthService } from '@/shared/services/auth-service'

export async function useLogin(props: loginSchemaType, useAuthService: AuthService) {
  ValidateSchemas(loginSchema, props)
  const trpc = useTRPC()

  try {

    const login = await trpc.auth.login.mutate(props)
    if (login) {
      useAuthService.setTokens(login.refresh, login.access)
    }
  } catch (error) {
    console.log(error)
  }
}
