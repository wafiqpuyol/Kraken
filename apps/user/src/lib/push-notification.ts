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
    console.log("=====================================================================")
    console.log(subscriptionInfo)
    console.log("public ===================>", VAPID_PUBLIC_KEY)
    console.log("private===============>", VAPID_PRIVATE_KEY)
    try {
        // Ensure VAPID keys are set
        if (!VAPID_PRIVATE_KEY || VAPID_PRIVATE_KEY === 'Y3untW9c7_e7Gh7PVLZk-m6M3di0r6n9tovtxaSBGjc') {
            console.error("VAPID private key is not configured. Cannot send push notification.");
            return false;
        }

        // Set VAPID details for the web-push library
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
            // In a real app, you'd mark this subscription for removal from your DB.
        }
        return false;
    }
}

export const addPushSubscription = async (subscriptionObj: PushSubscription) => {
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

        const updatedUserTable = await prisma.user.update({
            where: { id: session.user.uid },
            data: { push_subscription: JSON.stringify(subscriptionObj) }
        })
        console.log("updated ----------->", updatedUserTable)
        await redisManager().updateUserCred(isUserExist.number.toString(), "user", JSON.stringify(updatedUserTable))
        return { message: "Push subscription added successfully", status: 200 }
    } catch (error) {
        console.log("addPushSubscription ===>", error instanceof Error && error.message || "Something went wrong while adding push subscription")
        return { message: "Something went wrong while adding push subscription", status: 500 }

    }
}