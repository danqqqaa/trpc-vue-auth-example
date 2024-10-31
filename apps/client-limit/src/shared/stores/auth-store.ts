import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: "",
        refreshToken: ""
    }),
    actions: {
        setTokens(refresh: string, access: string) {
            console.log(refresh, access);
            
            this.accessToken = access
            this.refreshToken = refresh
        },
        getToken() {
            return this.accessToken
        }
    }   
})