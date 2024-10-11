import { defineConfig } from "drizzle-kit";
import { dbConfig } from "../config/db.config";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    user: dbConfig.user,
    port: dbConfig.port,
    password: dbConfig.password,
    host: dbConfig.host,
    database: dbConfig.database,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
