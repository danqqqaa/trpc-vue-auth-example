import { AppRouter } from "@server/router";
import { createTRPCProxyClient } from '@trpc/client';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

const TOKENS = {
    access: "LIMIT_ACCESS_TOKEN",
    refresh: "LIMIT_REFRESH_TOKEN"
} as const 

export class AuthService {
    private refreshToken: string | undefined;
    private accessToken: string | undefined;
    private refreshPayload: JwtPayload | undefined;
    private accessPayload: JwtPayload | undefined;
    constructor(public trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>>) {}

    public setTokens(refresh: typeof this.refreshToken, access: typeof this.accessToken) {
        console.log({ refresh, access} );
        
        this.refreshToken = refresh
        this.accessToken = access
        this.saveTokens()
    }

    public getToken() {
        console.log('here3');
        
    if (!this.accessPayload) return undefined;
        return this.accessToken
    }

    private saveTokens(){
        if (this.refreshToken && this.accessToken) {
            localStorage.setItem(TOKENS.refresh, this.refreshToken)
            localStorage.setItem(TOKENS.access, this.accessToken)
            this.loadTokens()
        } else {
            this.clearTokens()
        }
    }

    private clearTokens(){
        localStorage.removeItem(TOKENS.refresh)
        localStorage.removeItem(TOKENS.access)
    }

    private loadTokens(){
        this.refreshToken = localStorage.getItem(TOKENS.refresh) || undefined
        this.accessToken = localStorage.getItem(TOKENS.access) || undefined
        this.refreshPayload = this.refreshToken ? jwtDecode(this.refreshToken) : undefined
        this.accessPayload = this.accessToken ? jwtDecode(this.accessToken) : undefined
        console.log(this.refreshPayload, this.accessPayload); 
    }
}