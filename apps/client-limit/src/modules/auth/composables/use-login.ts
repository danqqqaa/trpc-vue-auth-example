import { useTRPC } from '@/shared/composables/use-trpc'
import { loginSchemaType } from 'z-limit'
import { useAuthStore } from '@/shared/stores/auth/auth-store'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { showToast } from '@/shared/toast'

export function useLogin(props: loginSchemaType) {
  const router = useRouter()
  const trpc = useTRPC()
  const { setTokens } = useAuthStore()

  return useMutation({
    mutationKey: ['login'],
    mutationFn: () => trpc.auth.login.mutate(props),
    onSuccess: ({ refresh, access }) => {
      setTokens(refresh, access)
      router.push('/home')
    },
    onError: (err) => {
      showToast({
        title: 'Ошибка входа',
        description: err.message,
        variant: 'destructive',
        duration: 3000
      })
    }
  })
}
