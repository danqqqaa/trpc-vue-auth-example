import { privateProcedure, router } from "../../trpc/trpc";
import { userService } from "./service";

export const userRouter = router({
  getUsers: privateProcedure.query(async (op) => {
    const { ctx } = op;
        
    return await userService.getUsers(ctx.userId);
  }),

  getCurrentUser: privateProcedure.query(async (op) => {
    const { ctx } = op;
        
    return await userService.getCurrentUser(ctx.userId);
  }),
});