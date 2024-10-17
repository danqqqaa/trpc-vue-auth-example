import {
    pgTable,
    serial,
    timestamp,
    varchar,
  } from 'drizzle-orm/pg-core';


export const user = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }),
    password: varchar('password', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    passwordChangedAt: timestamp('updated_at').defaultNow(),
})