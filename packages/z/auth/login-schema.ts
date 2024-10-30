import { z } from "zod";

export const schema = z.object({
  login: z.string().min(2, { message: "Введите логин" }),
  password: z.string().min(2, { message: "Введите Пароль" }),
});

export type schemaType = z.infer<typeof schema>;
