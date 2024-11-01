import { z } from "zod";

export const schema = z.object({
  login: z.string().trim().min(1, { message: "Введите логин" }),
  password: z.string().trim().min(1, { message: "Введите Пароль" }),
});

export type schemaType = z.infer<typeof schema>;
