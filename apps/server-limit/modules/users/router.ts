import { publicProcedure, router } from "../../trpc/trpc";
import { userService } from "./serice";

export const userRouter = router({
  getUsers: publicProcedure.query(async () => {
    console.log('here');
    
    return await userService.getUsers();
  }),
});