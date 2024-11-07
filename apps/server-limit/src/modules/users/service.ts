export class UserService {
  async getUsers(ctx: any): Promise<unknown> {
    try {

    //   const t = fetch("https://jsonplaceholder.typicode.com/todos/1")
    //     .then((response) => response.json())
    //     .then((json) => console.log(json));

      return ctx;
    } catch (error: any) {
      // console.log(error.message);
    }
  }
}

export const userService = new UserService();
