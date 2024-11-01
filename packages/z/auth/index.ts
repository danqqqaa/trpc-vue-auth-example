import {
  schema as registerSchema,
  schemaType as registerSchemaType,
} from "./register-schema";
import {
  schema as loginSchema,
  schemaType as loginSchemaType,
} from "./login-schema";
import { schema as refreshTokenSchema } from "./refresh-token";

export {
  registerSchema,
  type registerSchemaType,
  loginSchema,
  type loginSchemaType,
  refreshTokenSchema,
};
