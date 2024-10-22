import env from 'env-var';

export const dbConfig = {
  database: env.get('PG_DATABASE').default('limit').asString(),
  host: env.get('PG_HOST').default('localhost').asString(),
  port: env.get('PG_PORT').default(5432).asPortNumber(),
  user: env.get('PG_USER').default('postgres').asString(),
  password: env.get('PG_PASSWORD').default('root').asString(),
  ssl: env.get('PG_SSL').default(0).asBool(),
};


 