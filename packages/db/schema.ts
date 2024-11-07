import { integer, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("users", {
  id: serial("id").primaryKey(),
  login: varchar("login", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  surname: varchar("surname", { length: 255 }),
  middlename: varchar("middlename", { length: 255 }),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const typeCredentials = pgEnum('type', ['password'])

export const userCredentials = pgTable('userCredentials', {
  user_id: integer('user_id').notNull().references(() => user.id).primaryKey(),
  type: typeCredentials().default('password'),
  payload: varchar("payload", { length: 255 }).notNull(),
  updated_at: timestamp("updated_at").defaultNow(),
})
