"use server"

import { SchedulerMap } from "./schedulerMap";
import { paymentScheduleQueue } from "./config";
import { v4 as uuidv4 } from "uuid";
import { IScheduleDetails } from "@repo/ui/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@repo/network";
import { SchedulePaymentSchema } from "@repo/forms/schedulePaymentSchema";
import { JOB_NAME } from "@repo/ui/constants"
import { ZodError } from "@repo/forms/types"
import { ZodSchemaValidator } from "../utils"
import { prisma } from "@repo/db/client"
import { redisManager } from "@repo/cache/redisManager"
import { verify } from "jsonwebtoken"
import { account } from "@repo/db/type"
import { guessCountryByPartialPhoneNumber } from 'react-international-phone';
import { senderAmountWithFee } from "@repo/ui/utils"
import { generateRandomNumber } from "@repo/network"



export const addPaymentSchedule = async (scheduleDetails: IScheduleDetails) => {
  console.log("scheduleDetails --->", scheduleDetails);
  let bullJobId = null;
  let scheduleId = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return { message: "Unauthorized. Please login first", status: 401, job: null };
    }

    /* ---------------- VALIDATE PAYLOAD ---------------- */
    ZodSchemaValidator.getInstance().validateScheduleSchema(SchedulePaymentSchema, scheduleDetails.formData);

    if (scheduleDetails.additionalData.sender_number === scheduleDetails.additionalData.receiver_number) {
      return { message: "Both receiver & sender can not be same. Invalid recipient number", status: 400, job: null }
    }

    /* ------------ CHECK Sender EXISTENCE ----------- */
    const isUserExist = await prisma.user.findFirst({
      where: {
        AND: [{ id: session.user.uid }, { number: scheduleDetails.additionalData.sender_number }]
      },
      include: {
        preference: {
          select: {
            currency: true
          }
        }
      }
    })

    if (!isUserExist) {
      return { message: "User not found", status: 401, job: null }
    }
    if (!isUserExist.isVerified) {
      return { message: "Please verify your account first to send money", status: 401, job: null }
    }

    /* ------------------- Check Account Exists -------------------*/
    let account = await redisManager().getUserField(`${isUserExist.number}_userCred`, "account")
    if (!account) {
      account = await prisma.account.findFirst({ where: { userId: isUserExist.id } }) as account
      if (account) await redisManager().updateUserCred(isUserExist.number.toString(), "account", JSON.stringify(account))
    }

    /* ------------------- Check Receiver Existence -------------------*/
    const isRecipientExist = await prisma.user.findUnique({ where: { number: scheduleDetails.additionalData.receiver_number } })
    if (!isRecipientExist) {
      return { message: "Recipient number not found. Please enter a valid recipient number", status: 400, job: null }
    }

    /* ------------------- Validate Reciever Number ------------------- */
    if (scheduleDetails.additionalData.trxn_type === "Domestic") {
      const recipientCountry = guessCountryByPartialPhoneNumber({ phone: scheduleDetails.additionalData.receiver_number }).country?.name
      if (isUserExist.country !== recipientCountry) {
        return { message: "Invalid recipient number", status: 400, job: null }
      }
    }
    if (scheduleDetails.additionalData.trxn_type === "International") {
      const recipientCountry = guessCountryByPartialPhoneNumber({ phone: scheduleDetails.additionalData.receiver_number }).country?.name
      if (isUserExist.country === recipientCountry || isRecipientExist.country !== recipientCountry) {
        return { message: "Invalid recipient number", status: 400, job: null }
      }
    }

    /* ------------------- Validate wallet Pincode -------------------*/
    let isUserWalletExist = await prisma.wallet.findFirst({ where: { userId: isUserExist.id } })
    if (!isUserWalletExist) {
      return { message: "You're not verified to make a transaction.Please create a pincode or enter valid OTP sent to your mail", status: 422, job: null }
    }
    if (!isUserWalletExist.otpVerified) {
      return { message: "OTP verification failed. Enter valid OTP sent to your mail", status: 422, job: null }
    }
    if (!isUserWalletExist.pincode) {
      return { message: "Pincode not found. Pincode is required to send money", status: 422, job: null }
    }

    const decodedPincode = verify(isUserWalletExist.pincode, isUserExist.password)
    const isPincodeValid = decodedPincode === scheduleDetails.formData.pincode
    if (!isPincodeValid) {
      const cachedData = await redisManager().accountLocked(`${session.user.uid}_walletLock`)
      isUserWalletExist = await prisma.wallet.update({ where: { userId: isUserExist.id }, data: { wrongPincodeAttempts: cachedData.failedAttempt } })
      if (cachedData.lockExpiresAt) {
        await prisma.account.update({ where: { userId: isUserExist.id }, data: { isLock: true, lock_expiresAt: cachedData.lockExpiresAt } })
        return { message: "Your account is locked", status: 403, job: null }
      }
      return { message: "Wrong pincode. Please enter the correct pincode", status: 401, job: null }
    }

    /* ------------------- Validate Sender Amount with his Balance -------------------*/
    let senderBalanceExist = await redisManager().getUserField(`${isUserExist.number}_userCred`, "balance")
    if (!senderBalanceExist) {
      senderBalanceExist = await prisma.balance.findFirst({ where: { userId: isUserExist.id } })
      if (senderBalanceExist) await redisManager().updateUserCred(isUserExist.number.toString(), "balance", JSON.stringify(senderBalance))
    }

    if (!senderBalanceExist) {
      return { message: "Balance not found", status: 401, job: null }
    }

    const senderAmountWithFeeArg = {
      amount: scheduleDetails.formData.amount,
      transactionType: scheduleDetails.additionalData.trxn_type,
      walletCurrency: (scheduleDetails.formData.currency || isUserExist.preference?.currency)!,
      selectedCurrency: scheduleDetails.additionalData?.international_trxn_currency
    }

    const senderTotalAmount = senderAmountWithFee(senderAmountWithFeeArg) as number
    if (senderBalanceExist.amount < senderTotalAmount) {
      return { message: "You're wallet does not have sufficient balance to make this scheduled transfer", status: 422, job: null }
    }

    console.log("-------------------------------- START SCHEDULING ---------------------------------")

    //   /* ------------------- SCHEDULE the JOB to the QUEUE ----------------- */
    scheduleId = scheduleDetails.scheduleId ?? null
    if (!scheduleId) {
      return { message: "ScheduleId is required", status: 400, job: null }
    }
    if (!scheduleDetails.executionTime) {
      return { message: "ExecutionTime is required", status: 400, job: null };
    }

    const executionTimestamp = new Date(
      scheduleDetails.executionTime
    ).getTime();
    const currentTimestamp = Date.now();
    const delay = executionTimestamp - currentTimestamp;

    console.log("************************DELAY", delay)
    if (delay <= 0) {
      return { message: `Execution time for scheduleId ${scheduleId} is in the past.`, status: 422, job: null }
    }
    if (delay <= 60000) {
      return { message: `Execution time for scheduleId ${scheduleId} is in the past.`, status: 422, job: null }
    }

    //   // BullMQ uses job IDs that it generates. We'll use our scheduleId as part of the job data.
    //   // If you want to use your scheduleId as BullMQ's jobId, you can, but ensure it's unique.
    //   // BullMQ job IDs are strings.
    bullJobId = `schedule_${scheduleId}_${uuidv4()}`; // Ensure BullMQ jobId is unique even if scheduleId might be reused in some edge case or after deletion.
    const jobPayload = {
      ...scheduleDetails,
      formData: { ...scheduleDetails.formData, currency: isUserExist.preference?.currency, },
      userId: isUserExist.id,
      senderName: isUserExist.name,
      recieverName: isRecipientExist.name
    }

    const job = await paymentScheduleQueue.add(
      JOB_NAME, jobPayload,
      {
        jobId: bullJobId,
        delay: Math.max(0, delay),
        // ...(scheduleDetails.jobOptions || {}), // Allow overriding default job options
      },
    );

    if (job.id) {
      await SchedulerMap.getInstance().storeJobMapping(scheduleId, job.id);
    } else {
      throw new Error("Scheduled Job has invalid ID");
    }

    console.log("-------------------------------- START TRNANSACTION ---------------------------------")
    await prisma.$transaction(async (tx) => {
      const updatedSenderBalance = await prisma.balance.update({
        where: {
          userId: isUserExist.id
        },
        data: {
          locked: {
            increment: senderTotalAmount
          },
          amount: {
            decrement: senderTotalAmount
          }
        }
      })

      await prisma.schedulePayment.create({
        data: {
          amount: scheduleDetails.formData.amount,
          executionDate: scheduleDetails.executionTime,
          jobId: job.id as string,
          userId: isUserExist.id,
          id: generateRandomNumber()
        }
      })

      await redisManager().updateUserCred(scheduleDetails.additionalData.sender_number, "balance", JSON.stringify(updatedSenderBalance))
    })

    return { message: "payment scheduled successfully", status: 200, job: { ...job.data, id: bullJobId } };
  }
  catch (error: any) {
    console.error(`addPaymentSchedule`, error);

    if (error instanceof ZodError) {
      return { message: JSON.parse(error.message)[0].message as string, status: 400, job: null }
    }

    return { message: error.message as string, status: 500, job: null }
  }
};

export const cancelPaymentSchedule = async (jobId: string) => {
  let schedulePaymentJobId: null | number = null;
  let job: any;
  const scheduleId = jobId.split("_")[1]!

  if (!scheduleId) {
    return { message: "ScheduleId is required", status: 400, jobId: null };
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.uid) {
      return { message: "Unauthorized. Please login first", status: 401, jobId: null };
    }

    const isUserExist = await prisma.user.findFirst({
      where: { id: session.user.uid }
    })

    if (!isUserExist) {
      return { message: "User not found", status: 401, jobId: null }
    }
    if (!isUserExist.isVerified) {
      return { message: "Please verify your account first to send money", status: 401, jobId: null }
    }

    const isSchedulePaymentJobExist = await getSchedulePayment(jobId)
    if (!isSchedulePaymentJobExist) return { message: "Job not found or already processed.", status: 410, jobId };
    console.log(isSchedulePaymentJobExist)
    schedulePaymentJobId = isSchedulePaymentJobExist.id;

    const jobIdToCancel = await SchedulerMap.getInstance().getJobId(scheduleId);
    if (!jobIdToCancel) return { message: "Job not found or already processed.", status: 410, jobId };

    // Check if it's in a completed/failed state if you need more specific info
    job = await paymentScheduleQueue.getJob(isSchedulePaymentJobExist.jobId);
    if (job) {
      // if (!(await job.isDelayed()) && !(await job.isWaiting()) && !(await job.isActive())) {
      //   SchedulerMap.getInstance().removeJobMapping(jobIdToCancel)
      // }
      if (await job.isCompleted()) {
        await SchedulerMap.getInstance().removeJobMapping(scheduleId)
        deleteSchedulePayment(isSchedulePaymentJobExist.id, job.data)
        return { message: "Payment is already processed or failed", status: 422, jobId };
      }
      else if (await job.isFailed()) {
        await SchedulerMap.getInstance().removeJobMapping(scheduleId)
        deleteSchedulePayment(isSchedulePaymentJobExist.id, job.data)
        return { message: "Payment is already processed or failed", status: 422, jobId };
      }
    }

    // Check if job is in a state that can be removed (e.g., delayed, waiting)
    if (job) {
      const isDelayed = await job.isDelayed();
      const isWaiting = await job.isWaiting();
      const isWaitingChildren = await job.isWaitingChildren();

      if (isDelayed || isWaiting || isWaitingChildren) {
        await job.remove();
        await SchedulerMap.getInstance().removeJobMapping(scheduleId);
        deleteSchedulePayment(isSchedulePaymentJobExist.id, job.data)
      }
      else {
        const state = await job.getState();
        return {
          message: `Cannot cancel job in state '${state}'`,
          status: 409, jobId: null
        };
      }
    }

    else {
      await SchedulerMap.getInstance().removeJobMapping(scheduleId)
      deleteSchedulePayment(isSchedulePaymentJobExist.id, job.data)
      return { message: "Payment not found. Payment cancalation failed", status: 404, jobId };
    }
    return { message: "Successfully cancelled payment", status: 204, jobId };
  } catch (error: any) {
    console.error(
      `Error cancelling payment schedule (scheduleId: ${scheduleId}):`,
      error
    );
    // If error is because job doesn't exist, BullMQ might throw specific error handling for "job not found".
    if (
      error instanceof Error &&
      error.message &&
      error.message.toLowerCase().includes("job not found")
    ) {
      await SchedulerMap.getInstance().removeJobMapping(scheduleId);
      deleteSchedulePayment(schedulePaymentJobId!, job.data)
      return {
        message: "Job not found in BullMQ, mapping removed.",
        status: 410, jobId
      };
    }

    return { message: "Something went wrong while cancelling schedule payment", status: 500, jobId: null }
  }
};

const deleteSchedulePayment = async (id: number, jobData: any) => {
  const senderAmountWithFeeArg = {
    amount: jobData.formData.amount,
    transactionType: jobData.additionalData.trxn_type,
    walletCurrency: jobData.formData.currency,
    selectedCurrency: jobData .additionalData?.international_trxn_currency
  }

  const senderTotalAmount = senderAmountWithFee(senderAmountWithFeeArg) as number

  await prisma.$transaction(async () => {
    await prisma.schedulePayment.delete({
      where: { id }
    })
    const updatedSenderBalance = await prisma.balance.update({
      where: { userId: jobData.userId },
      data: {
        locked: {
          decrement: senderTotalAmount
        },
        amount: {
          increment: senderTotalAmount
        }
      }
    })
    await redisManager().updateUserCred(jobData.additionalData.sender_number, "balance", JSON.stringify(updatedSenderBalance))
  })

}
const getSchedulePayment = async (id: string) => {
  return await prisma.schedulePayment.findUnique({
    where: { jobId: id }
  })
}