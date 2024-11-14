import env from "env-var"

export const jwtConfig = {
    algorithm: env.get('JWT_ALGORITHM').required().asString(),

    refreshPublicKey: env.get('JWT_REFRESH_PUBLIC_KEY').required().asString(),
    refreshPrivateKey: env.get('JWT_REFRESH_PRIVATE_KEY').required().asString(),
    refreshExpiresTime: env.get('JWT_REFRESH_EXPIRES_TIME').required().asString(),

    accessPublicKey: env.get('JWT_ACCESS_PUBLIC_KEY').required().asString(),
    accessPrivateKey: env.get('JWT_ACCESS_PRIVATE_KEY').required().asString(),
    accessExpiresTime: env.get('JWT_ACCESS_EXPIRES_TIME').required().asString(),

}