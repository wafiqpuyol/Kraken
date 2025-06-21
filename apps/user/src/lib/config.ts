  import { createClient, RedisClientType } from "redis";


  export const redisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || "6379"
    //   host: process.env.REDIS_HOST || '127.0.0.1',
    //   port: parseInt(process.env.REDIS_PORT || '6379', 10),
    // password: process.env.REDIS_PASSWORD || undefined, // Add if your Redis has a password
    // tls: process.env.REDIS_TLS_ENABLED ? {} : undefined,
  };

  const protocol = "redis"

  export class RedisClient {
    private static instance: RedisClient;
    public redisClient: RedisClientType;

    private constructor() {
      console.log(`${protocol}://${redisConfig.host}:${redisConfig.port}`)
      this.redisClient = createClient({
        // url: `${protocol}://${redisConfig.host}:${redisConfig.port}`,
        url: "redis://localhost:6379",
      });
      this.redisClient.on('ready', () => {
        console.log('Redis client is ready and connected!');
      }); this.redisClient.on("error", (err) =>
        console.error("Redis Connection Error:", err)
      );

      const start =async (r:RedisClientType)=> {
        await r.connect();
      }
      start(this.redisClient);
    }

    public static getInstance() {

      if (!this.instance) {
        this.instance = new RedisClient();
        return this.instance;
      }
      return this.instance;
    }
  }