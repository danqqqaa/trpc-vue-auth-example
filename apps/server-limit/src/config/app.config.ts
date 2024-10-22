import env from "env-var"

console.log(env.from(process.env).get());


export const appConfig = {
    port: env.get('PORT').asPortNumber(),
}