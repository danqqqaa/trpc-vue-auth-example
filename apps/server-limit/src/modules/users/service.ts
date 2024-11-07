import { db, user } from "db-limit";

export class UserService {
  async getUsers(ctx: string | undefined): Promise<unknown> {
    try {

      const users = await db.select().from(user);



      return users;
    } catch (error) {
      // console.log(error.message);
    }
  }
}

export const userService = new UserService();
