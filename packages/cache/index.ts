import { RedisClientType, createClient } from "redis";


class RedisManager {
    private static redisInstance: RedisManager
    private client: RedisClientType
    private constructor() {
        this.client = createClient()
        this.client
            .on("error", err => console.warn("Redis Client Error, ", err))
            .connect()
    }

    static getInstance() {
        if (!this.redisInstance) {
            this.redisInstance = new RedisManager()
        }
        return this.redisInstance
    }

    async setCache(key: string, value: any) {
        let data = await this.getCache(key)
        if (data) {
            data.push(value)
            await this.client.set(key, JSON.stringify(data))
        } else {
            data = data === null ? [] : data
            if (Array.isArray(value)) {
                data = [...value]
            } else {
                data.push(value)
            }
            await this.client.set(key, JSON.stringify(data))
        }
    }

    async getCache(key: string): Promise<any | null> {
        console.log("Hit redis ====>", key);
        const data = await this.client.get(key)
        return data ? JSON.parse(data) : null
    }
}
export const redisManager = () => RedisManager.getInstance()