import { router } from "./trpc/trpc";
import { userRouter } from "./modules/users/router";
import { authRouter } from "./modules/auth/router";

const appRouter = router({
  user: userRouter,
  auth: authRouter
});

export type AppRouter = typeof appRouter;
export default appRouter;
