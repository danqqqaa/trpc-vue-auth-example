import { z } from "zod";

export const schema = z
  .object({
    name: z.string(),
    password: z
      .string()
      .min(8, { message: 'Минимальная длина пароля 8 символов!' }),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Пароли должны совпадать!',
    path: ['confirmPassword'],
  });

export type schemaType = z.infer<typeof schema>