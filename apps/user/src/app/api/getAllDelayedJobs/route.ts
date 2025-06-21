import { paymentScheduleQueue } from "../../../lib/scheduler/config"
export const GET = async () => {
    const pendingJobs = await Promise.all([
        paymentScheduleQueue.getDelayedCount(),
        paymentScheduleQueue.getJobs("delayed"),
    ])

    const fiteredPendingJobs = pendingJobs[1].filter(job => job)
        .sort((job1, job2)=> new Date(job1.data.formData.payment_date).getTime() - new Date(job2.data.formData.payment_date).getTime())
        .map(job => ({
            trxn_id: job?.id || "",
            amount: job?.data.formData.amount || 0,
            payee_number: job?.data.formData.payee_number || "N/A",
            execution_date: job?.data.formData.payment_date || null,
            remaining_time_of_execution: job?.delay || 0,
            payer_number: job?.data.additionalData.sender_number || "N/A",
            recieverName: job.data.recieverName,
            senderName: job.data.senderName
        }))
    return new Response(JSON.stringify([pendingJobs[0], fiteredPendingJobs]), { status: 200 })
}