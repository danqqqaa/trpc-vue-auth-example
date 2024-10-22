import env from "env-var"

export const appConfig = {
    port: env.get('PORT').asPortNumber()
}

