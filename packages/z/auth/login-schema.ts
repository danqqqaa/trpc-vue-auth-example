import { z } from "zod";

export const schema = z.object({
  name: z.string(),
  password: z.string(),
});

export type schemaType = z.infer<typeof schema>;
