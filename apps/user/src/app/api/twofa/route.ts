import { disable2fa } from "../../../lib/twoFA"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        console.log("body ===>", body);
        await disable2fa("signInTwoFA", parseInt(body.sessionData?.sub))
        return new Response("Two disable successfully", { status: 201 })
    } catch (error) {
        console.log(error);
        return new Response(
            'Could not post to subreddit at this time. Please try later',
            { status: 500 }
        )
    }
}