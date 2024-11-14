import { createClient } from "redis";

export class RedisClient {
  private client!: Awaited<ReturnType<typeof createClient>>;

  public async init() {
    this.client = await createClient().connect();
  }

  public async disconnect() {
    return await this.client.disconnect();
  }

  public async get(key: string) {
    return await this.client.get(key);
  }

  public async set(key: string, value: string) {
    return await this.client.set(key, value);
  }
}
