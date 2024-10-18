import { router, procedure } from "../../trpc/trpc";
import { authService } from "./service";
import { RegisterDtoSchema } from "./schemas/schema";

export const authRouter = router({
  register: procedure.input(RegisterDtoSchema).mutation(async (opts) => {
    console.log(opts);
    return await authService.register();
  }),
});
