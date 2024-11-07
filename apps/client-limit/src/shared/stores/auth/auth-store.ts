import { defineStore } from 'pinia'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { useAuthService } from '@/shared/composables/use-auth-service'

const TOKENS = {
  access: 'LIMIT_ACCESS_TOKEN',
  refresh: 'LIMIT_REFRESH_TOKEN'
} as const

const getExpiresTime = (exp: number) => {
  return exp * 1000 - Date.now()
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: undefined as string | undefined,
    refreshToken: undefined as string | undefined,
    refreshPayload: undefined as JwtPayload | undefined,
    accessPayload: undefined as JwtPayload | undefined
  }),

  actions: {
    getToken() {
      this.loadTokens()
      if (!this.accessPayload) return undefined

      const expireTime = getExpiresTime(this.accessPayload.exp!)

      if (expireTime < 0) {
        this.refreshTokens()
      }
      return this.accessToken
    },
    async refreshTokens() {
      const trpc = useAuthService()
      const { access, refresh } = await trpc.auth.refreshTokens.mutate(this.refreshToken!)
      this.setTokens(refresh, access)
    },
    setTokens(refresh: string, access: string) {
      this.accessToken = access
      this.refreshToken = refresh
      this.saveTokens()
    },

    saveTokens() {
      if (this.refreshToken && this.accessToken) {
        localStorage.setItem(TOKENS.refresh, this.refreshToken)
        localStorage.setItem(TOKENS.access, this.accessToken)
        this.loadTokens()
      } else {
        this.clearTokens()
      }
    },
    clearTokens() {
      localStorage.removeItem(TOKENS.refresh)
      localStorage.removeItem(TOKENS.access)
    },
    loadTokens() {
      this.refreshToken = localStorage.getItem(TOKENS.refresh) || undefined
      this.accessToken = localStorage.getItem(TOKENS.access) || undefined
      this.refreshPayload = this.refreshToken ? jwtDecode(this.refreshToken) : undefined
      this.accessPayload = this.accessToken ? jwtDecode(this.accessToken) : undefined
    }
  }
})
