"use server"

import { SendMoneySchema } from "@repo/forms/sendMoneySchema"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"
import { prisma } from "@repo/db/client"
import { p2ptransfer, user, $Enums, preference, account, wallet } from "@repo/db/type"
import { generateTransactionId } from "./utils"
import { verify } from "jsonwebtoken"
import { ITransactionDetail } from "@repo/ui/types"
import { senderAmountWithFee } from "@repo/ui/utils"
import { ZodError } from "@repo/forms/types"
import { guessCountryByPartialPhoneNumber } from 'react-international-phone';
import { generateOTP } from "./utils"
import { sendOTP } from "./mail"
import { redisManager } from "@repo/cache/redisManager"
import axios from "axios"
import { v4 as uuidv4 } from 'uuid';
import { ZodSchemaValidator } from "./utils"
import { SendMoneyType } from "@repo/ui/types"

class SendMoney {
    static instance: SendMoney

    private p2pTransfer: p2ptransfer | [] = []
    private sender: user | null = null
    private receiver: user | null = null
    private wallet: wallet | null = null
    private currency: string | null = null
    private fee_currency: string | null = null

    private constructor() { }

    static getInstance() {
        this.instance = new SendMoney();
        return this.instance;
    }

    private async createP2PTransfer(transactionDetail: ITransactionDetail, currency: string, status: $Enums.p2p_transaction_status) {
        return prisma.p2ptransfer.create({
            data: {
                amount: parseFloat(transactionDetail.formData.amount) * 100,
                timestamp: new Date(),
                transactionType: "Send",
                transactionID: generateTransactionId(),
                // fromUserId: this.sender?.id,
                // toUserId: this.receiver?.id,
                currency,
                status,
                receiver_number: this.receiver?.number!,
                sender_number: this.sender?.number!,
                receiver_name: this.receiver?.name!,
                sender_name: this.sender?.name!,
                fee_currency: this?.fee_currency!,
                transactionCategory: transactionDetail.additionalData.trxn_type,
                domestic_trxn_fee: status === "Failed" ? "0" : transactionDetail.additionalData.domestic_trxn_fee,
                international_trxn_fee: status === "Failed" ? "0" : transactionDetail.additionalData.international_trxn_fee,
                user_p2ptransfer_fromUserIdTouser: {
                    connect: {
                        id: this.sender?.id
                    }
                },
                user_p2ptransfer_toUserIdTouser: {
                    connect: {
                        id: this.receiver?.id
                    }
                }
            },
            include: {
                user_p2ptransfer_fromUserIdTouser: {
                    select: {
                        name: true
                    }
                },
                user_p2ptransfer_toUserIdTouser: {
                    select: {
                        name: true
                    }
                }
            },
        })
    }
    private async validateSender(userId: number, sender_number: string) {
        return prisma.user.findFirst({
            where: {
                AND: [{ id: userId }, { number: sender_number }]
            },
            include: {
                preference: {
                    select: {
                        currency: true
                    }
                }
            }
        })
    }

    private async validateReceiver(receiver_number: string) {
        return prisma.user.findUnique({ where: { number: receiver_number } })
    }

    async start(transactionDetail: ITransactionDetail, opts?: { sendMoneyType: keyof SendMoneyType, jobId: string }) {
        console.log(transactionDetail.formData.amount, opts)

        try {
            const session = await getServerSession(authOptions)
            if (!session?.user?.uid) {
                return { message: "Unauthorized. Please login first", status: 401 }
            }

            // -------------- OLD CODE ---------------------
            // const validatedPayload = SendMoneySchema.safeParse(transactionDetail.formData)
            // if (!validatedPayload.success) {
            //     throw new Error(
            //         validatedPayload.error.format().phone_number?._errors[0] || 
            //     validatedPayload.error.format().amount?._errors[0] ||
            //      validatedPayload.error.format().pincode?._errors[0]
            //     )
            // }
            // --------------- REFACTORED CODE ----------------------
            opts ?? ZodSchemaValidator.getInstance().validateSendMoneySchema(SendMoneySchema, transactionDetail.formData)

            /* ------------------- Validate Sender -------------------*/
            const isUserExist = await this.validateSender(session.user.uid, transactionDetail.additionalData.sender_number)
            if (!isUserExist) {
                throw new Error("User not found")
            }
            if (!isUserExist.isVerified) {
                throw new Error("Please verify your account first to send money")
            }
            this.sender = isUserExist
            this.currency = (await prisma.preference.findFirst({ where: { userId: this?.sender?.id } }) as preference)?.currency

            /* ------------------- Check Account Lock status -------------------*/
            let account = await redisManager().getUserField(`${isUserExist.number}_userCred`, "account")
            if (!account) {
                account = await prisma.account.findFirst({ where: { userId: isUserExist.id } }) as account
                if (account) await redisManager().updateUserCred(isUserExist.number.toString(), "account", JSON.stringify(account))
            }
            if (!opts && account.isLock) {
                throw new Error("Your account is locked.")
            }

            /* ------------------- Validate wallet Pincode -------------------*/
            this.wallet = await prisma.wallet.findFirst({ where: { userId: isUserExist.id } })
            if (!this.wallet) {
                throw new Error("You're not verified to make a transaction.Please create a pincode or enter valid OTP sent to your mail")
            }
            if (!this.wallet.otpVerified) {
                throw new Error("OTP verification failed. Enter valid OTP sent to your mail")
            }
            if (!this.wallet.pincode) {
                throw new Error("Pincode not found. Pincode is required to send money")
            }

            const decodedPincode = verify(this.wallet.pincode, isUserExist.password)
            const isPincodeValid = decodedPincode === transactionDetail.formData.pincode
            if (!isPincodeValid) {
                const cachedData = await redisManager().accountLocked(`${session.user.uid}_walletLock`)
                this.wallet = await prisma.wallet.update({ where: { userId: isUserExist.id }, data: { wrongPincodeAttempts: cachedData.failedAttempt } })
                if (cachedData.lockExpiresAt) {
                    await prisma.account.update({ where: { userId: isUserExist.id }, data: { isLock: true, lock_expiresAt: cachedData.lockExpiresAt } })
                    throw new Error("Your account is locked.")
                }
                throw new Error("Wrong pincode. Please enter the correct pincode")
            }

            /* ------------------- Validate Receiver -------------------*/
            const isRecipientExist = await this.validateReceiver(transactionDetail.additionalData.receiver_number)
            if (!isRecipientExist) {
                throw new Error("Recipient number not found. Please enter a valid recipient number")
            }
            this.receiver = isRecipientExist;

            /* ------------------- Check their number is not same -------------------*/
            if (this.sender.number === this.receiver.number) {
                throw new Error("Both receiver & sender can not be same. Invalid recipient number")
            }

            /* ------------------- Validate Reciver Numbers ------------------- */
            if (transactionDetail.additionalData.trxn_type === "Domestic") {
                const recipientCountry = guessCountryByPartialPhoneNumber({ phone: transactionDetail.additionalData.receiver_number }).country?.name
                if (isUserExist.country !== recipientCountry) {
                    return { message: "Invalid recipient number", status: 400 }
                }
            }
            if (transactionDetail.additionalData.trxn_type === "International") {
                const recipientCountry = guessCountryByPartialPhoneNumber({ phone: transactionDetail.additionalData.receiver_number }).country?.name
                if (isUserExist.country === recipientCountry || isRecipientExist.country !== recipientCountry) {
                    return { message: "Invalid recipient number", status: 400 }
                }
            }

            /* ------------------- Validate Sender Amount with his Balance -------------------*/
            let senderBalance = await redisManager().getUserField(`${this.sender.number}_userCred`, "balance")
            if (!senderBalance) {
                senderBalance = await prisma.balance.findFirst({ where: { userId: this.sender.id } })
                if (senderBalance) await redisManager().updateUserCred(this.sender.number.toString(), "balance", JSON.stringify(senderBalance))
            }

            if (!senderBalance) {
                throw new Error("Balance not found")
            }


            this.fee_currency = senderBalance.currency;
            const senderAmountWithFeeArg = {
                amount: transactionDetail.formData.amount,
                transactionType: transactionDetail.additionalData.trxn_type,
                walletCurrency: senderBalance.currency || isUserExist.preference?.currency,
                selectedCurrency: transactionDetail.additionalData?.international_trxn_currency
            }
            const senderTotalAmount = senderAmountWithFee(senderAmountWithFeeArg) as number

            if (opts && opts.sendMoneyType === "SCHEDULED") {
                if (senderBalance?.locked < senderTotalAmount) {
                    console.log(senderBalance?.locked, senderTotalAmount)
                    throw new Error("You're wallet does not have sufficient balance to make this scheduled transfer.")
                }
            }
            if (!opts && senderBalance?.amount < senderTotalAmount) {
                throw new Error("You're wallet does not have sufficient balance to make this transfer.")
            }

            let deductedAmount = 0;
            if (!opts) {
                deductedAmount = (senderBalance?.amount - senderTotalAmount)
            } else {
                deductedAmount = senderBalance.locked - senderTotalAmount
            }

            // in this case deductedAmount is pointing to credited senderBalance?.amount amount
            if (!opts && senderBalance.locked !== 0 && deductedAmount <= senderBalance.locked) {
                throw new Error("The amount you're trying to send exceeds your locked amount. Please reduce the amount & try again")
            }
            // in this case deductedAmount is pointing to credited senderBalance?.locked amount
            if (opts && deductedAmount < 0) {
                throw new Error("You're wallet does not have sufficient balance to make this transfer.")
            }
            console.log("DEDUCTED ANMOUT ===>", deductedAmount, senderTotalAmount)
            /* ------------------- Create P2P Transfer -------------------*/
            await prisma.$transaction(async (tx) => {
                await tx.$queryRaw`SELECT * FROM Balance WHERE "userId" = ${isUserExist.id} FOR UPDATE`;
                const updatedSenderBalance = await tx.balance.update({
                    where: {
                        userId: this.sender?.id
                    },
                    data: opts ? { locked: deductedAmount } : { amount: deductedAmount }


                })
                const updatedRecieverBalance = await tx.balance.update({
                    where: {
                        userId: this.receiver?.id
                    },
                    data: {
                        amount: {
                            increment: parseFloat(transactionDetail.formData.amount) * 100
                        }
                    }
                })
                if (
                    transactionDetail.additionalData.trxn_type === "International"
                    &&
                    isUserExist.preference?.currency !== transactionDetail.additionalData.international_trxn_currency
                ) {
                    await prisma.preference.update({ where: { userId: this?.sender?.id }, data: { currency: transactionDetail.additionalData.international_trxn_currency } })
                }


                this.p2pTransfer = await this.createP2PTransfer(transactionDetail, this.currency as string, "Processing")
                /* ----------- Update all cache after successfull trxn -----------*/
                await redisManager().updateUserCred(transactionDetail.additionalData.sender_number, "balance", JSON.stringify(updatedSenderBalance))
                // await redisManager().updateUserCred(transactionDetail.additionalData.receiver_number, "balance", JSON.stringify(updatedRecieverBalance))
                await redisManager().setCache(`${this.sender?.id}_getAllP2PTransactions`, this.p2pTransfer)
                if (this.wallet && this.wallet.wrongPincodeAttempts > 0) {
                    this.wallet = await prisma.wallet.update({ where: { userId: this.sender?.id }, data: { wrongPincodeAttempts: 0 } })
                }
                if (await redisManager().getCache(`${this.sender?.id}_walletLock`)) {
                    await redisManager().deleteCache(`${this.sender?.id}_walletLock`)
                }

                if (this.p2pTransfer.status === "Processing") {
                    /* 
                        ============          ============
                        ============ OLD CODE ============
                        ============          ============ 
                    */
                    // const notificationTemplate = await prisma.notification.create({
                    //     data: {
                    //         userId: this.receiver?.id!,
                    //         message: JSON.stringify({
                    //             transactionID: this.p2pTransfer.transactionID,
                    //             amount: this.p2pTransfer.amount,
                    //             currency: this.p2pTransfer.currency,
                    //             sender_number: this.p2pTransfer.sender_number,
                    //             sender_name: this.p2pTransfer.sender_name,
                    //             timestamp: this.p2pTransfer.timestamp,
                    //         }),
                    //     }
                    // })
                    // await axios.post(`${process.env.NEXT_PUBLIC_PRODUCER_API_URL}/notifications`, { ...notificationTemplate, receiver_id: this.receiver?.id! })

                    /* 
                        ============          ============
                        ============ NEW CODE ============
                        ============          ============ 
                    */
                    console.log("-------- INIT ----------");
                    const res = await prisma.transaction.create({
                        data: {
                            id: uuidv4(),
                            amount: this.p2pTransfer.amount,
                            createdAt: new Date(),
                            userId: this.p2pTransfer.fromUserId,
                            location: "Bangladesh",
                            risk: 0,
                            status: "Pending",
                        }
                    })
                    await prisma.transaction_outbox.create({
                        data: {
                            transactionId: res.id,
                        }
                    })
                    console.log("-------- FINISH ----------");
                }
                if (opts && opts.jobId) {
                    const isSchedulePaymentJobExist = await prisma.schedulePayment.findFirst({
                        where: {
                            AND: [
                                { userId: this.sender?.id },
                                { jobId: opts.jobId }
                            ]
                        }
                    })
                    await prisma.schedulePayment.delete({
                        where: {
                            id: isSchedulePaymentJobExist?.id
                        }
                    })
                }
            })
            return { message: "Sending money successful", status: 200, transaction: this.p2pTransfer }

        } catch (error: any) {
            console.log("SendMoney --------------->", error);
            if (error.message === "Your account is locked.") {
                return { message: error.message, status: 403 }
            }
            if (error.message === "Pincode not found. Pincode is required to send money" ||
                error.message === "OTP verification failed. Enter valid OTP sent to your mail" ||
                error.message === "You're not verified to make a transaction.Please create a pincode or enter valid OTP sent to your mail" ||
                error.message === "You're wallet does not have sufficient balance to make this transfer." ||
                error.message === "You're wallet does not have sufficient balance to make this scheduled transfer." ||
                false
            ) {
                return { message: error.message, status: 422 }
            }
            if (error.message === "Cannot send money to yourself. Invalid recipient number" ||
                error.message === "Both receiver & sender can not be same. Invalid recipient    number"
                || false
            ) {
                return { message: error.message, status: 400 }
            }
            if (error instanceof ZodError) {
                return { message: error.message, status: 400 }
            }
            if (error.message === "Unauthorized. Please login first" ||
                error.message === "User not found" ||
                error.message === "Please verify your account first to send money" ||
                error.message === "Wrong pincode. Please enter the correct pincode" ||
                error.message === "Recipient number not found. Please enter a valid recipient number" ||
                error.message === "Balance not found"
            ) {
                return { message: error.message, status: 401 }
            }

            this.p2pTransfer = await this.createP2PTransfer(transactionDetail, this.currency as string, "Failed")
            await redisManager().setCache(`${this.sender?.id}_getAllP2PTransactions`, this.p2pTransfer)

            if (this.wallet && this.wallet.wrongPincodeAttempts > 0) {
                this.wallet = await prisma.wallet.update({ where: { userId: this.sender?.id }, data: { wrongPincodeAttempts: 0 } })
            }

            return { message: error.message || "Something went wrong on the bank server", status: 500 }
        }
    }

}

export const sendMoneyAction = async (transactionDetail: ITransactionDetail, opts?: { sendMoneyType: keyof SendMoneyType, jobId: string }) => SendMoney.getInstance().start(transactionDetail, opts)

export const getAllP2PTransactionHistories = async (): Promise<p2ptransfer[] | []> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return []
        }

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }

        if (!isUserExist) {
            return []
        }
        const p2pTransactionHistories = await prisma.p2ptransfer.findMany({
            where: {
                OR: [{ fromUserId: isUserExist.id }, { toUserId: isUserExist.id }],
            },
            include: {
                user_p2ptransfer_fromUserIdTouser: {
                    select: {
                        name: true
                    }
                },
                user_p2ptransfer_toUserIdTouser: {
                    select: {
                        name: true
                    }
                }
            },
            take: 12,
            orderBy: { timestamp: "desc" }
        })
        return p2pTransactionHistories.filter(t => !(t.toUserId === isUserExist.id && t.status === "Failed"))
    } catch (error) {
        console.log("getAllP2PTransactions =========>", error);
        return []
    }
}

export const getAllP2PTransactionByTrxnID = async (trxn_id: string) => {
    let res: p2ptransfer[] = []
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
        return res
    }
    try {
        let cachedP2pTransactionHistory = await redisManager().getCache(`${session.user.uid}_getAllP2PTransactions`) as p2ptransfer[] | null

        if (cachedP2pTransactionHistory) {
            res.push(...cachedP2pTransactionHistory.filter((t: p2ptransfer) => t.transactionID === trxn_id))
        }

        if (!cachedP2pTransactionHistory) {
            const data = await prisma.p2ptransfer.findFirst({ where: { transactionID: trxn_id } })
            if (data) res.push(data)
        }

        return res
    } catch (error) {
        console.log("getAllP2PTransactionByTrxnID =========>", error);
        return res
    }
}

export const sendOTPAction = async (email: string): Promise<{
    message: string;
    status: number;
}> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({
                where:
                {
                    AND: [
                        { id: session?.user?.uid },
                        { email }
                    ]
                }
            })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }

        if (!isUserExist) return { message: "User doesn't exist with this email. Please login first.", status: 401 }
        if (!isUserExist.isVerified) return { message: "Please verify your account first to send money", status: 401 }
        if (!isUserExist.twoFactorActivated) return { message: "Please enable your 2FA", status: 401 }
        if (!isUserExist.otpVerified) return { message: "Please enable your 2FA", status: 401 }

        const otp = generateOTP()
        const updatedData = {
            otp: otp,
            otpIssuer: email,
            otp_expiresAt: new Date(Date.now() + 1000 * 90),
        }
        const isWalletExist = await prisma.wallet.findFirst({ where: { userId: session.user.uid } })
        if (!isWalletExist) {
            await prisma.wallet.create({ data: { userId: session.user.uid, ...updatedData } })
        } else {
            await prisma.wallet.update({ where: { userId: session.user.uid }, data: updatedData })
        }

        return await sendOTP(email, otp)
    } catch (error: any) {
        console.log(error);
        return { message: error.message || "Something went wrong while sending your otp", status: 500 }
    }
}

export const verifyOTP = async (otp: string): Promise<{
    message: string;
    status: number;
}> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }

        let isUserExist = await redisManager().getUserField(`${session.user.number}_userCred`, "user")
        if (!isUserExist) {
            isUserExist = await prisma.user.findFirst({ where: { id: session?.user?.uid } })
            if (isUserExist) await redisManager().updateUserCred(session.user.number.toString(), "user", JSON.stringify(isUserExist))
        }

        if (!isUserExist) return { message: "User doesn't exist. Please login first.", status: 401 }
        if (!isUserExist.isVerified) return { message: "Please verify your account first to send money", status: 401 }
        if (!isUserExist.twoFactorActivated) return { message: "Please enable your 2FA", status: 401 }
        if (!isUserExist.otpVerified) return { message: "Please enable your 2FA", status: 401 }


        const isWalletExist = await prisma.wallet.findFirst({
            where:
                { AND: [{ userId: session.user.uid }, { otpIssuer: isUserExist.email }] }
        })
        if (!isWalletExist) {
            return { message: "Invalid OTP. Please try again", status: 401 }
        }
        if (isWalletExist.otp !== otp) {
            return { message: "Invalid OTP. Please try again", status: 401 }
        }
        if (isWalletExist.otp_expiresAt! < new Date()) {
            prisma.wallet.update({ where: { userId: session.user.uid }, data: { otpVerified: false, otp: null, otp_expiresAt: null } })
            return { message: "OTP has expired. Please try again", status: 400 }
        }

        await prisma.wallet.update({ where: { userId: session.user.uid }, data: { otpVerified: true, otp: null, otp_expiresAt: null } })
        return { message: "OTP has verified", status: 200 }
    } catch (error: any) {
        console.log(error);
        return { message: error.message || "Something went wrong while verifying your otp", status: 500 }
    }
}
