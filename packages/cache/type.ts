export interface IAccountLock {
    failedAttempt: number,
    lockExpiresAt: Date | null,
    windowStart: number,
    windowSize: number,
}