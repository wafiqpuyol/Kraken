import { startSchedulePaymentWorker } from "../../../lib/scheduler/wroker"

export async function POST() {
    try {
        const res = startSchedulePaymentWorker()
        return new Response(res, { status: 201})
    } catch (error:any) {
        return new Response(`${error.message}`,{status:500})
    }
}