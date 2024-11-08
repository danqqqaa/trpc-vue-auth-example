import { db, eq, user } from "db-limit";

export class UserService {
  async getUsers(ctx: number): Promise<unknown> {
    try {
      const users = await db.select().from(user);

      return users;
    } catch (error) {
      // console.log(error.message);
    }
  }

  async getCurrentUser(ctx: number): Promise<unknown> {
    try {
      const [currentUser] = await db.select().from(user).where(eq(user.id, ctx));
      return currentUser;
    } catch (error) {
      // console.log(error.message);
    }
  }
}

export const userService = new UserService();
