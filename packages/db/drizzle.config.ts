import { defineConfig } from "drizzle-kit";
import { dbConfig } from "./db.config";

export default defineConfig({
  schema: "./schema.ts",
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
  migrations: {
    prefix: 'timestamp',
  },
});
