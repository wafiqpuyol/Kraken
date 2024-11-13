import { RedisClientType, createClient } from "redis";
import { WINDOW_SIZE, ACCOUNT_LOCK_EXPIRY_TIME, WALLET_LOCK_EXPIRY_TIME } from "./constant"
import { IAccountLock } from "./type"
import { user } from "@repo/db/type"
import { prisma } from "@repo/db/client"

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

    async notification(key: string, value: string) {
        const data = await this.getCache(key)
        if (data) {
            value = JSON.parse(value);
            if (Array.isArray(value)) {
                data.push(...value)
            } else {
                data.unshift(value)
            }
            return await this.client.set(key, JSON.stringify(data))
        } else {
            value = JSON.parse(value);
            if (Array.isArray(value)) {
                return await this.client.set(key, JSON.stringify(value));
            } else {
                return await this.client.set(key, JSON.stringify([value]));
            }
        }
    }

    async setCache(key: string, value: any) {
        let data = await this.getCache(key)
        if (data) {
            data.push(value)
            await this.client.set(key, JSON.stringify(data))
        } else {
            data = (data === null) ? [] : data
            if (Array.isArray(value)) {
                data = [...value]
            } else {
                data.push(value)
            }
            await this.client.set(key, JSON.stringify(data))
        }
    }

    async getCache(key: string): Promise<any | null> {
        const data = await this.client.get(key)
        return data ? JSON.parse(data) : null
    }

    async accountLocked(key: string) {
        const data: IAccountLock | null = await this.getCache(key)
        if (data) {
            const now = Date.now();
            if ((now - data.windowStart) < data.windowSize) {
                const failedAttemptIncrement = Number(data.failedAttempt) + 1
                if (data.failedAttempt >= 2) {
                    if (data.lockExpiresAt === null) {
                        await this.client.set(key, JSON.stringify({
                            ...data, failedAttempt: failedAttemptIncrement,
                            lockExpiresAt: new Date(Date.now() + 1000 * (key.includes("accountLocked") ? ACCOUNT_LOCK_EXPIRY_TIME : WALLET_LOCK_EXPIRY_TIME))
                        }))
                        await this.client.expire(key, (key.includes("accountLocked") ? ACCOUNT_LOCK_EXPIRY_TIME : WALLET_LOCK_EXPIRY_TIME))
                    }
                    return this.getCache(key)
                }
                await this.client.set(key, JSON.stringify({ ...data, failedAttempt: failedAttemptIncrement }))
                return this.getCache(key)
            }
            await this.client.set(key, JSON.stringify({ ...data, windowStart: now, failedAttempt: 1, lockExpiresAt: null }))
            return this.getCache(key)
        }

        const value: IAccountLock = {
            failedAttempt: 1,
            lockExpiresAt: null,
            windowStart: Date.now(),
            windowSize: WINDOW_SIZE
        };
        await this.client.set(key, JSON.stringify(value))
        return this.getCache(key)
    }

    async deleteCache(key: string) {
        await this.client.del(key)
    }

    async deleteUser(userId: string) {
        const user = await prisma.user.findFirst({
            where: { id: parseInt(userId) },
            select: { number: true }
        }) as user

        ["user", "preference", "account", "balance"].forEach(async (field) => {
            await this.client.hDel(`+${parseInt(user.number)}_userCred`, field)
        })
    }

    async addUser(userCred: user) {
        return await this.client.hSet(`${userCred.number}_userCred`, {
            user: JSON.stringify(userCred),
            preference: "",
            account: "",
            balance: ""
        })
    }

    async updateUserCred(userId: string, field: string, value: any) {
        await this.client.hSet(`${userId}_userCred`, field, value)
    }

    async getUserField(key: string, field: string) {
        const data = await this.client.hGet(key, field)
        return data ? JSON.parse(data) : null
    }
}
export const redisManager = () => RedisManager.getInstance()