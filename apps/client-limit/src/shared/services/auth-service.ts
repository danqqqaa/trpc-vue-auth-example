import { AppRouter } from "@server/router";
import { createTRPCProxyClient } from '@trpc/client';
const TOKENS = {
    access: "LIMIT_ACCESS_TOKEN",
    refresh: "LIMIT_REFRESH_TOKEN"
} as const 

export class AuthService {
    private refreshToken: string | undefined;
    private accessToken: string | undefined;
    constructor(public trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>>) {}

    public setTokens(refresh: typeof this.refreshToken, access: typeof this.accessToken) {
        console.log(refresh, access);
        
        this.refreshToken = refresh
        this.accessToken = access
        this.saveTokens()
    }

    private saveTokens(){
        if (this.refreshToken && this.accessToken) {
            localStorage.setItem(TOKENS.refresh, this.refreshToken)
            localStorage.setItem(TOKENS.access, this.accessToken)
        } else {
            this.clearTokens()
        }
    }

    private clearTokens(){
        localStorage.removeItem(TOKENS.refresh)
        localStorage.removeItem(TOKENS.access)
    }
}