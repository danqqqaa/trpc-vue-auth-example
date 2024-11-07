import { createTRPCProxyClient, httpLink } from '@trpc/client'
import { type AppRouter } from '@server/router'
import { config } from '@/config/config'
import { useAuthStore } from '../stores/auth/auth-store'

export function useTRPC() {
  const { getToken } = useAuthStore()

  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: config.trpc_limit_server_url,
        async headers() {
          const headers: Record<string, string> = {}
          const token = getToken()
          console.log(token);
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
          return headers
        },
      })
    ]
  })
}
