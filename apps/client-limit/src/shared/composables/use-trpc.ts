import { createTRPCProxyClient, httpLink } from '@trpc/client';
import { type AppRouter } from '@server/router';
import { config } from '@/config/config';
import { useAuthStore } from '../stores/auth/auth-store';

export function useTRPC() {  

const { getToken, accessToken } = useAuthStore()

getToken()

console.log(accessToken);

  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: config.trpc_limit_server_url,
      }),
    ],
  });
}