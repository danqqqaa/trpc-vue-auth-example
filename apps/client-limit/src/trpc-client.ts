import { createTRPCProxyClient, httpLink } from '@trpc/client';
import { type AppRouter } from '@apps/server-limit/router';
import { config } from '@/config/config';

export function useTRPC() {
  console.log(config);
  
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: config.trpc_limit_server_url,
      }),
    ],
  });
}