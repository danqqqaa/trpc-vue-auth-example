import { router } from "./trpc/trpc";
import { testRouter } from "./test/router";

const appRouter = router({
  test: testRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;
