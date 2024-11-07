import { authProcedure, router } from "../../trpc/trpc";
import { userService } from "./service";

export const userRouter = router({
  getUsers: authProcedure.query(async ({ctx}) => {
      console.log(ctx);
      
        
    return await userService.getUsers(ctx);
  }),
});