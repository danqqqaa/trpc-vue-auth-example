import { authService } from "../modules/auth/service";
import { inferAsyncReturnType } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";

const createContext = async ({ req }: CreateHTTPContextOptions) => {
  if (!req.headers.authorization) {
    return { userId: undefined };
  }
  const token = req.headers.authorization.split(" ")[1];
  try {
    const payload = await authService.verifyAccess(token);
    return {
      userId: payload.sub,
    };
  } catch {
    return {
      userId: undefined,
    };
  }
};

export type Context = inferAsyncReturnType<typeof createContext>;

export default createContext;
