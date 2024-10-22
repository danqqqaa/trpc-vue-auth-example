import { createTRPCProxyClient, httpLink } from '@trpc/client';
import { type AppRouter } from '@server/router';
import { config } from '@/config/config';

export function useTRPC() {  
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: config.trpc_limit_server_url,
      }),
    ],
  });
}