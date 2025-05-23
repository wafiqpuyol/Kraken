import { WebSocket } from "../types/index"
import { SignalingManager } from "./signalingManager"

export class UserManager {
    private users: Map<string, { [key: string]: any }> = new Map()
    private static instance: UserManager

    private constructor() { }

    public static getInstance() {
        if (!this.instance) {
            console.log("calling User Manager instance");
            this.instance = new UserManager()
        }
        return this.instance
    }

    public startSignallingManager(ws: WebSocket) {
        new SignalingManager(ws)
    }

    public getUser(userId: string) {
        return this.users.get(userId)
    }

    public isUserExists(userId: string) {
        return this.users.has(userId)
    }

    public addUser(userId: string, obj: any) {
        this.users.set(userId, obj)
    }

    public removeUser(userId: string) {
        this.users.delete(userId)
    }

    public getAllUsers() {
        if (this.users.size > 0) {
            return Array.from(this.users.entries())
        }
        return []
    }

    public updateUser(userId: string, isAlive: boolean) {
        this.users.set(userId, { ...this.getUser(userId), isAlive })
    }
}