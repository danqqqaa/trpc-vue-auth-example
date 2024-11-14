import { router, publicProcedure } from "../../trpc/trpc";
import { authService } from "./service";
import { registerSchema, loginSchema, refreshTokenSchema } from "z-limit";

export const authRouter = router({
  register: publicProcedure.input(registerSchema).mutation(async (opts) => {
    return await authService.register(opts.input);
  }),

  login: publicProcedure.input(loginSchema).mutation(async (opts) => {
    return await authService.login(opts.input);
  }),
  refreshTokens: publicProcedure.input(refreshTokenSchema).mutation(async (opts) => {
    return await authService.refreshTokens(opts.input);
  })
});
