import { procedure, router } from "../../trpc/trpc";
import { userService } from "./service";

export const userRouter = router({
  getUsers: procedure.query(async (op) => {
    console.log(op);
        
    return await userService.getUsers();
  }),
});