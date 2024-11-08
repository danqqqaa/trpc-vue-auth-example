import { TRPCError, initTRPC } from "@trpc/server";
import type { Context } from "./context";
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use((opts) => {
  const { ctx } = opts;
  
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  
  return opts.next({
    ctx: {
      userId: +ctx.userId,
    },
  });
});
