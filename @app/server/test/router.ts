import { publicProcedure, router } from "../trpc/trpc";

export const testRouter = router({
  getTest: publicProcedure.query(() => {
    return {
      test: 1231,
    };
  }),
});
