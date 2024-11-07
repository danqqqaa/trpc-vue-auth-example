import { authProcedure, router } from "../../trpc/trpc";
import { userService } from "./service";

export const userRouter = router({
  getUsers: authProcedure.query(async (op) => {
    const { ctx } = op;
        
    return await userService.getUsers(ctx.userId);
  }),
});