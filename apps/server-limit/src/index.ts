import appRouter from "./router";
import createContext from "../src/trpc/context";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { appConfig } from "./config";
import { redis } from "./services/redis";

async function startServer() {
  try {
    await redis.init();

    const httpServer = createHTTPServer({
      router: appRouter,
      middleware: cors(),
      createContext,
    });

    httpServer.listen(appConfig.port);

    console.log(`🚀 обманываем ракетку на порту ${appConfig.port}`);
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
