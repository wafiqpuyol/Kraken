import type { DefaultSession } from 'next-auth'
import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MAX_AGE, DEFAULT_AUTH_ERROR_MESSAGE, DEFAULT_AUTH_ERROR_STATUS_CODE } from "./constants"
import { sign } from 'jsonwebtoken'
import { loginPayload, LoginSchema } from "@repo/forms/loginSchema"
import { prisma } from "@repo/db/client"
import bcrypt from "bcryptjs";
import { redisManager } from "@repo/cache/redisManager"
import { ACCOUNT_LOCK_EXPIRY_TIME } from "@repo/cache/constant"
import { WRONG_PASSWORD_ATTEMPTS } from "./constants"
import { cookies } from 'next/headers'

declare module 'next-auth' {
    interface Session {
        user?: DefaultSession['user'] & {
            number: string, uid: number, isTwoFAActive: boolean,
            isOtpVerified: boolean,
            isVerified: boolean,
            wallet_currency: string
            preference: any
            country: string
            total_balance: number
            isWithDrawTwoFAActivated: boolean
            isWithDrawOTPVerified: boolean
            isMasterKeyActivated: boolean
            isMasterKeyVerified: boolean
        }
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                phone_number: { label: "Phone number", type: "text", placeholder: "1231231231", required: true },
                password: { label: "Password", type: "password", required: true }
            },
            // @ts-ignore
            async authorize(credentials: loginPayload) {
                console.log("credentials --------->", credentials);
                let errObj: Record<string, any> = {
                    message: DEFAULT_AUTH_ERROR_MESSAGE,
                    status: DEFAULT_AUTH_ERROR_STATUS_CODE,
                    ok: false,
                }
                const accountStatus = await redisManager().getCache(`${credentials.phone_number}_accountLocked`)
                console.log(accountStatus);
                if (accountStatus) {
                    console.log("-------func");
                    if (accountStatus.failedAttempt === WRONG_PASSWORD_ATTEMPTS) {
                        console.log("func-------");
                        errObj = {
                            ...errObj,
                            message: `Your account has been locked.`,
                            status: 403,
                            failedAttempt: accountStatus.failedAttempt,
                            lockExpiresAt: accountStatus.lockExpiresAt
                        }
                        "use server"
                        const cookieStore = await cookies()
                        cookieStore.set("account_status", JSON.stringify({
                            isAccountLocked: accountStatus.failedAttempt === WRONG_PASSWORD_ATTEMPTS,
                            lockedAccountExpiresAt: accountStatus.lockExpiresAt
                        }), { expires: new Date(accountStatus.lockExpiresAt) });
                        console.log("Running")

                        console.log(cookieStore.get("account_status"));

                        throw new Error(JSON.stringify(errObj))
                    }
                }
                console.log("Ranm")
                const validatedFields = LoginSchema.safeParse(credentials);
                if (!validatedFields.success) {
                    throw new Error('Invalid credentials')
                }

                const { phone_number, password } = validatedFields.data
                let isUserExist = await redisManager().getUserField(`${credentials.phone_number}_userCred`, "user")
                console.log("redis user ________>", typeof isUserExist);
                if (!isUserExist) {
                    console.log("calling db user");
                    try {
                        isUserExist = (await prisma.user.findUnique({
                            where: { number: phone_number },
                            include: {
                                account: true,
                                preference: true,
                                balance: true,
                            }
                        }))
                        console.log("DB user ________>", isUserExist);
    
                        if (isUserExist) {
                            await redisManager().updateUserCred(phone_number.toString(), "preference", JSON.stringify(isUserExist.preference))
                            await redisManager().updateUserCred(phone_number.toString(), "balance", JSON.stringify(isUserExist.balance))
                            await redisManager().updateUserCred(phone_number.toString(), "account", JSON.stringify(isUserExist.account))
                            delete isUserExist.account
                            delete isUserExist.preference
                            delete isUserExist.balance
                            await redisManager().updateUserCred(phone_number.toString(), "user", JSON.stringify(isUserExist))
                            await redisManager().setExpiry({ key: `${phone_number.toString()}_userCred`, ttl: MAX_AGE })
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
                console.log("user ________>", isUserExist);
                if (!isUserExist) {
                    errObj = {
                        ...errObj,
                        message: 'User not found. Please signup first',
                        status: 404
                    }
                    throw new Error(JSON.stringify(errObj))
                }
                const isPasswordMatch = await bcrypt.compare(password, isUserExist.password);
                if (!isPasswordMatch) {
                    const updatedAccountStatusCache = await redisManager().accountLocked(`${credentials.phone_number}_accountLocked`)
                    console.log("updated ===>", updatedAccountStatusCache)
                    errObj = {
                        ...errObj,
                        ...(updatedAccountStatusCache)
                    }
                    if (updatedAccountStatusCache.failedAttempt === WRONG_PASSWORD_ATTEMPTS) {
                        "use server"
                        const cookieStore = await cookies()
                        console.log("Running")
                        cookieStore.set("account_status", JSON.stringify({
                            isAccountLocked: updatedAccountStatusCache.failedAttempt === WRONG_PASSWORD_ATTEMPTS,
                            lockedAccountExpiresAt: updatedAccountStatusCache.lockExpiresAt
                        }), { expires: new Date(accountStatus.lockExpiresAt) })
                        console.log(cookieStore.get("account_status"));
                    }
                    throw new Error(JSON.stringify(errObj))
                }
                const jwtToken = sign(
                    { uid: isUserExist.id, email: isUserExist.email, number: isUserExist.number },
                    process.env.NEXTAUTH_SECRET || 'wafiq123',
                )

                if (await redisManager().getCache(`${credentials.phone_number}_accountLocked`)) {
                    await redisManager().deleteCache(`${credentials.phone_number}_accountLocked`)
                }
                return {
                    ...isUserExist,
                    jwtToken,
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET || "wafiq123",
    debug: true,
    session: {
        strategy: 'jwt',
        maxAge: MAX_AGE,
    },
    events: {

        async signOut({ token }) {
            await redisManager().setExpiry({ userId: token.sub!, ttl: 0 })
        },
        async session({ session }) {
            const cachedUserData = await redisManager().getUserField(`${session.user?.number}_userCred`, "user")
            if (cachedUserData) {
                await redisManager().setExpiry({ key: `${session.user?.number}_userCred`, ttl: MAX_AGE })
            }
        }
    },
    callbacks: {
        async session({ token, session }) {
            let existUser: any = null;
            if (token.email) {
                existUser = await prisma.user.findUnique({
                    where: {
                        email: token.email!
                    },
                    include: {
                        preference: true,
                        balance: {
                            select: {
                                currency: true,
                                amount: true,
                            }
                        },
                        wallet: {
                            select: {
                                withDrawOTPVerified: true,
                                withDrawTwoFAActivated: true
                            }
                        },
                        masterkey: {
                            select: {
                                passKeyActivated: true,
                                passkeyVerified: true
                            }
                        }
                    }
                })
            }
            if (!existUser) return session;
            session.user = {
                name: token?.name,
                email: token?.email,
                image: token?.picture,
                number: existUser?.number,
                uid: existUser?.id,
                country: existUser?.country!,
                isTwoFAActive: existUser?.twoFactorActivated,
                isOtpVerified: existUser?.otpVerified,
                isVerified: existUser?.isVerified,
                wallet_currency: existUser?.balance?.currency!,
                total_balance: existUser?.balance?.amount!,
                isWithDrawTwoFAActivated: existUser?.wallet?.withDrawTwoFAActivated || false,
                isWithDrawOTPVerified: existUser?.wallet?.withDrawOTPVerified || false,
                isMasterKeyActivated: existUser?.masterkey?.passKeyActivated || false,
                isMasterKeyVerified: existUser?.masterkey?.passkeyVerified || false,
                preference: {
                    notification_status: existUser?.preference.notification_status,
                    language: existUser?.preference?.language,
                    timezone: existUser?.preference?.timezone,
                    selected_currency: existUser?.preference?.currency,
                }
            }
            return session
        }
    },
}

export const getAuth = () => getServerSession(authOptions)