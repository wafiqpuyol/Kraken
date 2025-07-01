import { Worker, Job } from 'bullmq';
import { redisConfig } from "../config"
import { paymentScheduleQueueConfig } from "./config"
import { SchedulerMap } from "./schedulerMap"
import { sendMoneyAction } from "../sendMoney"
import { IScheduleDetails } from "@repo/ui/types"
import { SEND_MOANEY_TYPE } from "@repo/ui/constants"
import { gracefullShutdown } from "./config"
import { prisma } from "@repo/db/client"
import { senderAmountWithFee } from "@repo/ui/utils"
import { ATTEMPT_VALUE } from "@repo/ui/constants"
import { redisManager } from "@repo/cache/redisManager"
import { RedisClient } from "../config"
import { updateSenderBalance, updateSchedulePayment } from "./scheduler"

export const startSchedulePaymentWorker = () => {
  const paymentWorker = new Worker(
    paymentScheduleQueueConfig.queuename,
    async (job: Job) => {
      try {
        const { scheduleId, ...scheduleDetails } = job.data as IScheduleDetails;
        console.log('Schedule Details:', scheduleDetails.formData.amount, SEND_MOANEY_TYPE.SCHEDULED);

        const res = await sendMoneyAction(scheduleDetails as IScheduleDetails, {
          sendMoneyType: SEND_MOANEY_TYPE.SCHEDULED,
          jobId: job.id!
        })
        if (res.status.toString().startsWith("4") || res.status.toString().startsWith("5")) {
          throw res;
        }

        // This job is considered "handled" (either success or app-level failure).
        await SchedulerMap.getInstance().removeJobMapping(scheduleId);
        console.log(`Cleaned up job mapping for processed scheduleId: ${scheduleId}`);

        // // Return a value to indicate success to BullMQ (even if payment failed at app level)
        // return { scheduleId, status: paymentResult.success ? 'PROCESSED_SUCCESS' : `PROCESSED_FAILURE_${paymentResult.reason}` };
        return { ...res }

      } catch (error: any) {
        // **STEP 4: Handle Unexpected Worker/Infrastructure Errors**
        // This block catches errors like network issues calling paymentProcessor,
        // or other unexpected errors within the worker logic.
        // BullMQ will automatically retry the job based on queue's defaultJobOptions.
        console.error(`CRITICAL WORKER ERROR processing job ${job.id} (scheduleId: ${job.data.scheduleId}):`, error.message);

        // Optionally, update DB to a temporary error state or log to an incident system


        // Re-throw the error to let BullMQ handle retries or move to failed queue
        throw error;
      }

    },
    {
      connection: { host: redisConfig.host, port: Number(redisConfig.port) },
      limiter: {
        max: 2,
        duration: 1000
      }
    }
  );

  console.log(`Payment worker started for queue: ${paymentWorker.id}. Waiting for jobs...`);

  gracefullShutdown(paymentWorker)

  paymentWorker.on('completed', async (job: Job, result) => {
    console.log(`Job ${job.id} (scheduleId: ${job.data.scheduleId}) completed successfully. Result:`, result);
    /* Bellow code is the part of SSE
      RedisClient.getInstance().redisClient.publish("schedule_payment", JSON.stringify(result))
    */
    const updatedColumn = {
      isLocked: false,
      status: "Completed",
      editCount: 0
    }
    await updateSchedulePayment(job.id!, updatedColumn)
  });

  // --- This event will call in each failed re-attempt ---
  paymentWorker.on('failed', async (job: Job, err: Error) => {
    console.error(`Job ${job.id} (ATTEMPT NO.: ${job.attemptsMade} attempts with error: ${err.message}`);
    // This is after all BullMQ retries have been exhausted.
    // Update your main application DB to reflect permanent failure.

    if (job.attemptsMade === ATTEMPT_VALUE) {
      const senderAmountWithFeeArg = {
        amount: job.data.formData.amount,
        transactionType: job.data.additionalData.trxn_type,
        walletCurrency: job.data.formData.currency,
        selectedCurrency: job.data.additionalData?.international_trxn_currency
      }

      const senderTotalAmount = senderAmountWithFee(senderAmountWithFeeArg) as number
      console.log("AMOUTN ++++++++++++>", senderTotalAmount, job.attemptsMade)

      try {
        await prisma.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT * FROM Balance WHERE "userId" = ${job.data.userId} FOR UPDATE`;
          const updatedSenderBalanceColumn = {
            amount: {
              increment: senderTotalAmount
            },
            locked: {
              decrement: senderTotalAmount
            }
          }
          const updatedSchedulePaymentColumn = {
            isLocked: false,
            status: "Failed",
            editCount: 0
          }

          await updateSchedulePayment(job.id!, updatedSchedulePaymentColumn)
          const updatedSenderBalance = await updateSenderBalance(job.data.userId, updatedSenderBalanceColumn)
          await redisManager().updateUserCred(job.data.additionalData.sender_number, "balance", JSON.stringify(updatedSenderBalance))
        })
      } catch (error) {
        console.error("BullMQ RETRY ERROR ==>", error)
      }
    }

    // Send a critical alert to admin/dev team.
    // Clean up job mapping as it's terminally failed.
    await SchedulerMap.getInstance().removeJobMapping(job.data.scheduleId);
  });

  paymentWorker.on('error', (error) => {
    // Generic worker errors (e.g., Redis connection issue)
    console.error(`BullMQ Worker Error (${paymentScheduleQueueConfig.queuename}):`, error);
  });

  paymentWorker.on('stalled', (jobId) => {
    console.warn(`Job ${jobId} has stalled. This should be investigated.`);
    // A job is stalled if it was picked by a worker but not completed within a timeout.
  });
  return `Payment worker started for queue: ${paymentWorker.id}. Waiting for jobs...`
}