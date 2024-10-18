import { router, procedure } from "../../trpc/trpc";
import { authService } from "./service";
import { registerSchema } from "packages/z/auth";

export const authRouter = router({
  register: procedure.input(registerSchema).mutation(async (opts) => {
    console.log(opts);
    return await authService.register();
  }),
});
