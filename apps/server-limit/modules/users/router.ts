import { publicProcedure, router } from "../../trpc/trpc";
import { userService } from "./serice";

export const userRouter = router({
  getUsers: publicProcedure.query(async () => {    
    return await userService.getUsers();
  }),
});