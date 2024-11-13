"use server"

import { prisma } from "@repo/db/client"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server"
import type { VerifiedRegistrationResponse } from "@simplewebauthn/server"
import { redisManager } from "@repo/cache/redisManager"

import {
    AuthenticationResponseJSON, AuthenticatorTransportFuture,
    PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON
} from "@simplewebauthn/types"


export const verifyMasterKeyOTP = async (): Promise<{ masterKeyOTPVerified?: boolean } | undefined> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return
        }
        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }

        if (!isUserExist) {
            return
        }
        if (!isUserExist.isVerified) {
            return
        }
        let isMasterTableExist = await prisma.masterkey.findUnique({ where: { userId: session.user.uid } })
        if (!isMasterTableExist) {
            isMasterTableExist = await prisma.masterkey.create({ data: { userId: session.user.uid } })
        }
        return { masterKeyOTPVerified: isMasterTableExist.otpVerified }
    } catch (error) {
        console.log("verifyMasterKeyOTP ===>", error);
    }
}

export const createMasterKey = async (step: "generateRegistration" | "verifyRegistration",
    regCred?: { challenge: PublicKeyCredentialCreationOptionsJSON, regResponseJSON: RegistrationResponseJSON }
    // @ts-ignore
): Promise<{ message: string; status: number; challenge?: PublicKeyCredentialCreationOptionsJSON }> => {

    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401, }
        }

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist) {
            return { message: "Unauthorized User Not Found", status: 401 }
        }
        if (!isUserExist.isVerified) {
            return { message: "Please verify your account first before creating your Master key.", status: 401 }
        }
        if (!isUserExist.twoFactorActivated) {
            return { message: "signin 2FA is not active. Please active your signin 2FA first", status: 401 }
        }
        if (!isUserExist.otpVerified) {
            return { message: "signin 2FA is not active. Please active your signin 2FA first", status: 401 }
        }

        const isPasskeyExist = await prisma.masterkey.findUnique({ where: { userId: session.user.uid } })
        if (!isPasskeyExist?.otpVerified) {
            return { message: "Your are not verified to create passkey.", status: 401 }
        }
        if (isPasskeyExist.passkeys !== null) {
            return { message: "Passkey already available.", status: 400 }
        }

        if (step == "generateRegistration") {
            const challengePayload = await generateRegistrationOptions({
                rpID: 'localhost',
                rpName: 'My Localhost Machine',
                attestationType: 'none',
                userName: isUserExist.name!,
                userID: (isUserExist.id!).toString(),
                timeout: 30_000
            })
            return { message: "Master Key created successfully", status: 200, challenge: challengePayload }
        }

        if (step === "verifyRegistration") {
            const result = await verifyRegistrationResponse({
                expectedChallenge: regCred!.challenge.challenge,
                expectedOrigin: 'http://localhost:3000',
                expectedRPID: 'localhost',
                response: regCred!.regResponseJSON,
                requireUserVerification: false,
            })
            if (!result.verified) return { message: "Failed to create the passkey", status: 401 };
            await prisma.masterkey.update({
                where: { userId: session.user.uid }, data: {
                    passkeys: { [isUserExist.id]: { userId: isUserExist.id, regInfo: JSON.stringify(result.registrationInfo) } },
                    transports: JSON.stringify(regCred!.regResponseJSON.response.transports),
                    passKeyActivated: true,
                    passKeyID: JSON.stringify(result.registrationInfo?.credentialID)
                }
            })
            return { message: "Passkey created Successfully ", status: 200 }
        }

    } catch (error) {
        console.log("createMasterKey ===>", error);
        return { message: "Something went wrong while creating master key", status: 500 }
    }
}

export const verifyPasskey = async (step: "generateAuthentication" | "verifyAuthentication",
    regCred?: { challenge: PublicKeyCredentialRequestOptionsJSON, authResponseJSON: AuthenticationResponseJSON }) => {

    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401, }
        }

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist) {
            return { message: "Unauthorized User Not Found", status: 401 }
        }
        if (!isUserExist.isVerified) {
            return { message: "Please verify your account first before creating your Master key.", status: 401 }
        }
        if (!isUserExist.twoFactorActivated) {
            return { message: "signin 2FA is not active. Please active your signin 2FA first", status: 401 }
        }
        const isPasskeyExist = await prisma.masterkey.findUnique({ where: { userId: session.user.uid } })
        if (!isPasskeyExist?.passKeyActivated) {
            return { message: "Passkey is not activated. Please activate your passkey first", status: 401 }
        }

        if (step === "generateAuthentication") {
            const res = await generateAuthenticationOptions({
                rpID: 'localhost',
                allowCredentials: [{
                    // @ts-ignore
                    id: Uint8Array.from(Object.values((JSON.parse(isPasskeyExist.passKeyID!)))),
                    type: "public-key",
                    // @ts-ignore
                    transports: JSON.parse(isPasskeyExist.transports) as AuthenticatorTransportFuture[],
                }],
                userVerification: "preferred"
            })
            return { message: "generate Auth", status: 200, challenge: res }
        }

        if (step === "verifyAuthentication") {
            const passkey = {
                fmt: JSON.parse(isPasskeyExist!.passkeys![isUserExist.id].regInfo).fmt,
                counter: JSON.parse(isPasskeyExist!.passkeys[isUserExist.id!].regInfo).counter,
                aaguid: JSON.parse(isPasskeyExist!.passkeys[isUserExist.id!].regInfo).aaguid,
                credentialPublicKey: Uint8Array.from(Object.values(JSON.parse(isPasskeyExist!.passkeys[isUserExist.id!].regInfo).credentialPublicKey)),
                credentialType: JSON.parse(isPasskeyExist!.passkeys[isUserExist.id!].regInfo).credentialType,
                attestationObject: Uint8Array.from(Object.values(JSON.parse(isPasskeyExist!.passkeys[isUserExist.id!].regInfo).attestationObject)),
                userVerified: JSON.parse(isPasskeyExist!.passkeys[isUserExist.id!].regInfo).userVerified,
                credentialDeviceType: JSON.parse(isPasskeyExist!.passkeys[isUserExist.id!].regInfo).credentialDeviceType,
                credentialBackedUp: JSON.parse(isPasskeyExist!.passkeys[isUserExist.id!].regInfo).credentialBackedUp,
                origin: JSON.parse(isPasskeyExist!.passkeys[isUserExist.id!].regInfo).origin,
                rpID: JSON.parse(isPasskeyExist!.passkeys[isUserExist.id!].regInfo).rpID
            } as VerifiedRegistrationResponse["registrationInfo"]

            const result = await verifyAuthenticationResponse({
                expectedChallenge: regCred!.challenge.challenge,
                expectedOrigin: 'http://localhost:3000',
                expectedRPID: 'localhost',
                response: regCred!.authResponseJSON,
                authenticator: {
                    ...passkey,
                    credentialID: Uint8Array.from(Object.values((JSON.parse(isPasskeyExist.passKeyID!)))),
                    transports: JSON.parse(isPasskeyExist.transports) as unknown as AuthenticatorTransportFuture[],
                }
            })

            if (!result.verified) return { message: "Passkey verification failed. Invalid Passkey", status: 401 };
            await prisma.masterkey.update({
                where: { userId: session.user.uid }, data: { passkeyVerified: true }
            })
            return { message: "Passkey verification successful", status: 200 }
        }
    } catch (error) {

        console.log("verifyMasterKey ===>", error);
        return { message: "Something went wrong while verifying master key", status: 500 }
    }
}

export const isMasterKeyActiveAndVerified = async () => {
    const res = { activate: false, verified: false }
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) return res

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist) return res
        const isMasterKeyExist = await prisma.masterkey.findUnique({ where: { userId: session.user.uid } })
        if (!isMasterKeyExist) {
            return res
        }
        res.activate = isMasterKeyExist.passKeyActivated
        res.verified = isMasterKeyExist.passkeyVerified
        return res
    } catch (error: any) {
        console.log("isMasterKeyActiveAndVerified  ===>", error.message);
        return res
    }
}

export const disableMasterKey = async (uid?: number) => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid && !uid) return;

        let isUserExist = await redisManager().getUserField(`${session?.user?.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: uid || session?.user?.uid } })
        }
        if (!isUserExist) return;
        const isMasterKeyExist = await prisma.masterkey.findUnique({ where: { userId: isUserExist.id } })
        if (!isMasterKeyExist) return;
        await prisma.masterkey.update({ where: { userId: isUserExist.id }, data: { passkeyVerified: false } })

    } catch (error) {
        console.log("disableMasterKey ===>", error);
    }
}