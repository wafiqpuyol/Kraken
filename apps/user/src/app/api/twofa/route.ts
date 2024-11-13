import { disable2fa } from "../../../lib/twoFA"
import { disableMasterKey } from "../../../lib/masterkey"
import { redisManager } from "@repo/cache/redisManager"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        await disable2fa("signInTwoFA", parseInt(body.sessionData?.sub))
        await disableMasterKey(parseInt(body.sessionData?.sub))
        await redisManager().deleteUser(body.sessionData?.sub)
        return new Response("Two disable successfully", { status: 201 })
    } catch (error) {
        console.log(error);
        return new Response(
            'Could not post to subreddit at this time. Please try later',
            { status: 500 }
        )
    }
}