import { disable2fa } from "../../../lib/twoFA"
import { disableMasterKey } from "../../../lib/masterkey"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        console.log("_________________", body);
        await disable2fa("signInTwoFA", parseInt(body.sessionData?.sub))
        await disableMasterKey(parseInt(body.sessionData?.sub))
        return new Response("Two disable successfully", { status: 200 })
    } catch (error) {
        console.log(error);
        return new Response(
            'Could not post to subreddit at this time. Please try later',
            { status: 500 }
        )
    }
}