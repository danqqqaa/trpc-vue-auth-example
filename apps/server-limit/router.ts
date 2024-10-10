import { router } from "./trpc/trpc";
import { userRouter } from "./modules/users/router";

const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;
