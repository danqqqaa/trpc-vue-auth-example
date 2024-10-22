import env from "env-var"

export const jwtConfig = {
    algorithm: env.get('JWT_ALGORITHM').asString(),
}