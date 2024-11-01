import { config } from '@/config/config'
import { AppRouter } from '@server/router'
import { createTRPCProxyClient, httpLink } from '@trpc/client'
// import { AuthService } from '../services/auth-service'
// import { inject } from 'vue'

// export function useProvideAuthService() {
//   const trpc = createTRPCProxyClient<AppRouter>({
//     links: [
//       httpLink({
//         url: config.trpc_limit_server_url
//       })
//     ]
//   })

//   return new AuthService(trpc)
// }

// export function useAuthService() {
//   return inject('AUTH_SERVICE')! as AuthService
// }

export function useAuthService() {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: config.trpc_limit_server_url
      })
    ]
  })
}
