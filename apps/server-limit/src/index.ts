
import appRouter from "./router";
import  createContext from '../src/trpc/context'
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';



async function startServer() {
  try {
    
    const httpServer = createHTTPServer({
      router: appRouter,
      middleware: cors(),
      createContext: () => createContext,
    });

    httpServer.listen(4000)


    console.log(`🚀 обманываем ракетку`);
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();


