import webpush from 'web-push'; // For sending web push notifications
import { prisma } from "@repo/db/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { redisManager } from "@repo/cache/redisManager"
import crypto from "crypto"
import { generateShortCode } from "./utils"
import { sendMoneyPayload } from "@repo/forms/sendMoneySchema"


// Generate these securely in production (e.g., using web-push.generateVAPIDKeys()).
// Example: const vapidKeys = webpush.generateVAPIDKeys();


interface PushSubscription {
    endpoint: string;
    expirationTime?: number | null | undefined;
    keys: {
        p256dh: string;
        auth: string;
    };
}
interface TransactionCacheEntry {
    temp_code: string;
    receiver_id: string;
    payer_id: string;
}
interface ICreateRequestedPayment {
    trxnId: string,
    amount: string,
    currency: string
}

const VAPID_PUBLIC_KEY: string = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const VAPID_PRIVATE_KEY: string = process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
const VAPID_CLAIMS_SUBJECT: string = process.env.NEXT_PUBLIC_VAPID_CLAIMS_SUBJECT!

async function sendWebPushNotification(subscriptionInfo: PushSubscription, payload: object): Promise<boolean> {
    try {
        if (!VAPID_PRIVATE_KEY || VAPID_PRIVATE_KEY === 'Y3untW9c7_e7Gh7PVLZk-m6M3di0r6n9tovtxaSBGjc') {
            console.error("VAPID private key is not configured. Cannot send push notification.");
            return false;
        }

        webpush.setVapidDetails(
            VAPID_CLAIMS_SUBJECT,
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY
        );

        const res = await webpush.sendNotification(
            subscriptionInfo,
            JSON.stringify(payload)
        );
        console.log(`Successfully sent push notification to ${subscriptionInfo.endpoint}`);
        console.log(`Push notification result ${res}`);
        return true;
    } catch (error: any) {
        console.error(`Failed to send push notification: ${error.message}`);
        // Handle specific errors, e.g., subscription expired/invalid (status 410 Gone)
        if (error.statusCode === 410) {
            console.warn("Push subscription expired or invalid. Consider removing it from your database.");
            // Mark this subscription for removal from  DB.
        }
        return false;
    }
}

export const addPushSubscription = async (subscriptionObj: PushSubscription) => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) return { message: "Unauthorized. Please login first", status: 401, };

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }
        if (!isUserExist) return { message: "Unauthorized User Not Found", status: 401 };

        const updatedUserTable = await prisma.user.update({
            where: { id: session.user.uid },
            data: { push_subscription: JSON.stringify(subscriptionObj) }
        })
        await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(updatedUserTable))

        return { message: "Push subscription added successfully", status: 200 }
    } catch (error: any) {
        console.log("addPushSubscription ===>", error instanceof Error && error.message || "Something went wrong while adding push subscription")
        return { message: error.message || "Something went wrong while adding push subscription", status: 500 }
    }
}

export const sendPaymentConfirmation = async (trxnId: string, code: string) => {
    try {
        const cachedResult = await redisManager().getRequestPaymentTempCodeCache(trxnId)
        if (!cachedResult) return { message: "Invalid Code", status: 400, receiverDetails: null };

        const parsedCachedResult = JSON.parse(cachedResult) as TransactionCacheEntry
        if (parsedCachedResult.temp_code !== code) return { message: "Invalid Code", status: 400, receiverDetails: null };

        const isReceiverExist = await prisma.user.findFirst({
            where: { id: parseInt(parsedCachedResult.receiver_id) },
            select: { id: true, name: true, number: true }
        })
        if (!isReceiverExist) return { message: "Invalid Code", status: 400, receiverDetails: null };

        const isReceiverBalance = await prisma.balance.findFirst({
            where: { userId: isReceiverExist.id },
            select: { currency: true }
        })
        if (!isReceiverBalance) return { message: "Invalid Code", status: 400, receiverDetails: null };

        return { message: "Payment Verification Successfully", status: 200, receiverDetails: { ...isReceiverExist, currency: isReceiverBalance.currency } }

    } catch (error: any) {
        console.log(error instanceof Error && error.message || "Something went wrong while sending payment confirmation")
        return { message: (error instanceof Error && error.message) || "Something went wrong while sending payment confirmation", status: 500, receiverDetails: null }
    }
}

export const sendPushNotification = async (payer_number: string) => {
    const session = await getServerSession(authOptions)
    let notificationSent = false;

    if (!session?.user?.uid) return { message: "Unauthorized. Please login first", status: 401 };
    if (payer_number === session.user.number) return { message: "Invalid Payer Number", status: 400 };

    try {
        /* --------------- Receiver authentic or not ---------------- */
        let isReceiverExist = await redisManager().getUserField(`${payer_number}_userCred`, "user")
        if (!isReceiverExist) {
            isReceiverExist = await prisma.user.findUnique({ where: { number: payer_number } })
            if (isReceiverExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isReceiverExist))
        }
        if (!isReceiverExist) return { message: "Unauthorized User Not Found", status: 401 };

        if (!isReceiverExist.isVerified) {
            return { message: "Please verify your account first to make a payment request.", status: 401 }
        }
        if (!isReceiverExist.twoFactorActivated) {
            return { message: "signin 2FA is not active. Please active your signin 2FA first", status: 401 }
        }
        if (!isReceiverExist.otpVerified) {
            return { message: "signin 2FA is not active. Please active your signin 2FA first", status: 401 }
        }

        /* ---------------- Payer authentic or not ---------------- */
        const isPayerExist = await prisma.user.findUnique({
            where: { number: payer_number }
        })
        console.log(isPayerExist)
        if (!isPayerExist) return { message: "Payer does not exist", status: 400 };

        /* --------------- Generate Temp Code and store in redis -------------- */
        let transactionId = crypto.randomBytes(16).toString('hex');
        let response = await generateTempCodeSetToRedis(isPayerExist.id, isReceiverExist.id, transactionId)

        while (!response.result) {
            transactionId = crypto.randomBytes(16).toString('hex');
            response = await generateTempCodeSetToRedis(isPayerExist.id, isReceiverExist.id, transactionId)
        }

        /* ------------------------ Push notification logic ------------------------ */
        if (isPayerExist.push_subscription) {
            const payerPushSubscriptionObject = JSON.parse(isPayerExist.push_subscription as string) as PushSubscription
            console.log("=========> object", payerPushSubscriptionObject)

            const notificationPayload = {
                title: "Instant Receive Request!",
                body: `You have a pending payment request from ${isReceiverExist.name}.`,
                icon: "/path/to/your/app-icon.png",
                data: {
                    url: "/en/dashboard/portfolio",
                    transaction_id: transactionId,
                    payee_number: isReceiverExist.number
                }
            };

            notificationSent = await sendWebPushNotification(JSON.parse(isPayerExist.push_subscription as string) as PushSubscription, notificationPayload);
            if (!notificationSent) {
                console.warn(`Warning: Could not send push notification to ${isReceiverExist.name}.`);
                // TODO Send In App Notification
            }
        } else {
            console.error(`Payer ${isPayerExist.name} (${isPayerExist.number}) does not have a registered push subscriptionfirst`)
            // TODO Send In App Notification
        }
        return { message: "Push notification sent successfully", status: 200, code: response.tempCode }
    } catch (error) {
        console.log(error instanceof Error && error.message || "Something went wrong while sending push notification")
        // TODO Send In App Notification
        return { message: "Something went wrong while sending push notification", status: 500, code: null }
    }
}

/*
    If Redis set has used along with NX then set returns "OK", 
    if key already exists null will be returned. If null return generateTempCodeSetToRedis() run again
*/
const generateTempCodeSetToRedis = async (payerId: number, receiverId: number, transactionId: string) => {
    let temporaryCode = generateShortCode();
    let requestPaymentCachedObject: TransactionCacheEntry = {
        payer_id: payerId.toString(),
        receiver_id: receiverId.toString(),
        temp_code: temporaryCode
    };
    const isTempCacheSetSuccessfully = await redisManager().setRequestPaymentTempCodeCache(transactionId, JSON.stringify(requestPaymentCachedObject));
    return { result: isTempCacheSetSuccessfully, tempCode: temporaryCode }
}