import type { DefaultSession } from 'next-auth'
import { NextAuthOptions, getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
export const MAX_AGE = 1 * 24 * 60 * 60
import { sign } from 'jsonwebtoken'
import { loginPayload, LoginSchema } from "@repo/forms/loginSchema"
import { prisma } from "@repo/db/client"
import { User } from "@repo/db/type"
import bcrypt from "bcryptjs";


declare module 'next-auth' {
    interface Session {
        user?: DefaultSession['user'] & { number: string }
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                phone_number: { label: "Phone number", type: "text", placeholder: "1231231231", required: true },
                password: { label: "Password", type: "password", required: true }
            },
            // @ts-ignore
            async authorize(credentials: loginPayload) {
                const validatedFields = LoginSchema.safeParse(credentials);
                if (!validatedFields.success) {
                    throw new Error('Invalid credentials')
                }
                const { phone_number, password } = validatedFields.data
                const isUserExist = await prisma.user.findUnique({ where: { number: phone_number } })
                if (!isUserExist) {
                    throw new Error('User not found. Please signup first')
                }
                const isPasswordMatch = await bcrypt.compare(password, isUserExist.password);
                if (!isPasswordMatch) {
                    throw new Error('Email or Password is incorrect')
                }
                const jwtToken = sign(
                    { uid: isUserExist.id, email: isUserExist.email, number: isUserExist.number },
                    process.env.AUTH_SECRET || 'wafiqsuperSecret',
                )
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
    pages: {
        signIn: '/login',
    },
    callbacks: {
        // async signIn({ user, account, }) {
        //     console.log("ggggggggggggggggggg", user);
        //     if (account?.provider === 'google') {
        //         const { id, name, image } = user
        //         const existingUser = await trpc.auth.user.query({
        //             uid: id,
        //         })

        //         if (!existingUser) {
        //             const user = await trpc.auth.registerWithProvider.mutate({
        //                 type: AuthProviderType.GOOGLE,
        //                 uid: id,
        //                 image: image || '',
        //                 name: name || '',
        //             })
        //         }
        //     }
        //     return true
        // },
        async session({ token, session, newSession, user }) {
            let existUser: User | undefined | null = undefined;
            if (token.email) {
                existUser = await prisma.user.findUnique({
                    where: {
                        email: token.email
                    }
                })
            }
            console.log("Session ---->", token, session, newSession, user);
            session.user = {
                name: token.name,
                email: token.email,
                image: token.picture,
                number: existUser?.number || ""
            }
            return session
        }
    },
}

export const getAuth = () => getServerSession(authOptions)
