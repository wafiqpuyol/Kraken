"use server"

import { SendMoneySchema } from "@repo/forms/sendMoneySchema"
import { authOptions } from "@repo/network"
import { getServerSession } from "next-auth"
import { prisma } from "@repo/db/client"
import { p2ptransfer, user, $Enums, preference, wallet, account } from "@repo/db/type"
import { generateTransactionId } from "./utils"
import { verify } from "jsonwebtoken"
import { ITransactionDetail } from "@repo/ui/types"
import { senderAmountWithFee } from "@repo/ui/utils"
import { ZodError } from "@repo/forms/types"
import { guessCountryByPartialPhoneNumber } from 'react-international-phone';
import { generateOTP } from "./utils"
import { sendOTP } from "./mail"
import { WRONG_PINCODE_ATTEMPTS } from "@repo/ui/constants"
import { updateLockStatus } from "./account"

class SendMoney {
    static instance: Promise<{
        message: string;
        status: number;
        transaction?: p2ptransfer | {}
    }>

    private p2pTransfer: p2ptransfer | [] = []
    private sender: user | null = null
    private receiver: user | null = null
    private currency: string | null = null
    private fee_currency: string | null = null

    private constructor(transactionDetail: ITransactionDetail) {

        return this.start(transactionDetail)
    }


    private async createP2PTransfer(transactionDetail: ITransactionDetail, currency: string, status: $Enums.p2p_transaction_status) {
        return prisma.p2ptransfer.create({
            data: {
                amount: parseFloat(transactionDetail.formData.amount) * 100,
                timestamp: new Date(),
                transactionType: "Send",
                transactionID: generateTransactionId(),
                fromUserId: this.sender?.id,
                toUserId: this.receiver?.id,
                currency,
                status,
                receiver_number: this.receiver?.number!,
                sender_number: this.sender?.number!,
                receiver_name: this.receiver?.name!,
                sender_name: this.sender?.name!,
                fee_currency: this?.fee_currency!,
                transactionCategory: transactionDetail.additionalData.trxn_type,
                domestic_trxn_fee: status === "Failed" ? "0" : transactionDetail.additionalData.domestic_trxn_fee,
                international_trxn_fee: status === "Failed" ? "0" : transactionDetail.additionalData.international_trxn_fee
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
        return prisma.user.findFirst({ where: { AND: [{ id: userId }, { number: sender_number }] } })
    }

    private async validateReceiver(receiver_number: string) {
        return prisma.user.findUnique({ where: { number: receiver_number } })
    }

    async start(transactionDetail: ITransactionDetail) {
        try {
            const session = await getServerSession(authOptions)
            if (!session?.user?.uid) {
                return { message: "Unauthorized. Please login first", status: 401 }
            }

            const validatedPayload = SendMoneySchema.safeParse(transactionDetail.formData)
            if (!validatedPayload.success) {
                console.log(validatedPayload.error.format().phone_number?._errors);
                throw new Error(validatedPayload.error.format().phone_number?._errors[0] || validatedPayload.error.format().amount?._errors[0] || validatedPayload.error.format().pincode?._errors[0])
            }

            /* ------------------- Validate Sender -------------------*/
            const isUserExist = await this.validateSender(session.user.uid, transactionDetail.additionalData.sender_number)
            if (!isUserExist) {
                throw new Error("User not found")
            }
            console.log("SEnder--------->", this.sender);
            this.sender = isUserExist
            if (!isUserExist.isVerified) {
                throw new Error("Please verify your account first to send money")
            }

            /* ------------------- Check Account Lock status -------------------*/
            const account = await prisma.account.findFirst({ where: { userId: isUserExist.id } }) as account
            if (account.isLock) {
                throw new Error("Your account is locked.")
            }

            /* ------------------- Validate wallet Pincode -------------------*/
            const wallet = await prisma.wallet.findFirst({ where: { userId: isUserExist.id } })
            if (!wallet) {
                throw new Error("You're not verified to make a transaction.Please create a pincode or enter valid OTP sent to your mail")
            }
            if (!wallet.otpVerified) {
                throw new Error("OTP verification falied. Enter valid OTP sent to your mail")
            }
            if (!wallet.pincode) {
                throw new Error("Pincode not found. Pincode is required to send money")
            }


            const decodedPincode = verify(wallet.pincode, isUserExist.password)
            const isPincodeValid = decodedPincode === transactionDetail.formData.pincode
            if (!isPincodeValid) {
                const numberOfAttempts = (await prisma.wallet.update({ where: { userId: isUserExist.id }, data: { wrongPincodeAttempts: { increment: 1 } } })).wrongPincodeAttempts
                if (numberOfAttempts >= WRONG_PINCODE_ATTEMPTS) {
                    await prisma.account.update({ where: { userId: isUserExist.id }, data: { isLock: true, lock_expiresAt: new Date(Date.now() + 1000 * 43200) } })
                }
                throw new Error("Wrong pincode. Please enter the correct pincode")
            }

            /* ------------------- Validate Receiver -------------------*/
            const isRecipientExist = await this.validateReceiver(transactionDetail.additionalData.receiver_number)
            if (!isRecipientExist) {
                throw new Error("Recipient number not found. Please enter a valid recipient number")
            }
            this.receiver = isRecipientExist;
            console.log("Receiver--------->", this.receiver);

            /* ------------------- Check their number is not same -------------------*/
            if (this.sender.number === this.receiver.number) {
                throw new Error("Cannot send money to yourself. Invalid recipient number")
            }

            /* ------------------- Validate Numbers ------------------- */
            console.log(transactionDetail.additionalData);
            if (transactionDetail.additionalData.trxn_type === "Domestic") {
                const recipientCountry = guessCountryByPartialPhoneNumber({ phone: transactionDetail.additionalData.receiver_number }).country?.name
                if (isUserExist.country !== recipientCountry) {
                    return { message: "Invalid recipient number", status: 400 }
                }
            }
            if (transactionDetail.additionalData.trxn_type === "International") {
                const recipientCountry = guessCountryByPartialPhoneNumber({ phone: transactionDetail.additionalData.receiver_number }).country?.name
                console.log(isRecipientExist.country === recipientCountry);
                if (isUserExist.country === recipientCountry) {
                    return { message: "Invalid recipient number", status: 400 }
                }
            }

            /* ------------------- Validate Sender Amount with his Balance -------------------*/
            const senderBalance = await prisma.balance.findFirst({ where: { userId: this.sender.id } })
            if (!senderBalance) {
                throw new Error("Balance not found")
            }

            this.fee_currency = senderBalance.currency;
            const senderAmountWithFeeArg = {
                amount: transactionDetail.formData.amount,
                transactionType: transactionDetail.additionalData.trxn_type,
                walletCurrency: senderBalance.currency,
                selectedCurrency: transactionDetail.additionalData?.international_trxn_currency
            }
            const senderTotalAmount = senderAmountWithFee(senderAmountWithFeeArg) as number
            console.log("final ------>", senderTotalAmount);

            if (senderBalance?.amount < senderTotalAmount) {
                throw new Error("You're wallet does not have sufficient balance to make this transfer.")
            }

            const deductedAmount = (senderBalance?.amount - senderTotalAmount)
            console.log(senderBalance?.amount + "----" + senderTotalAmount);
            console.log("minus ---->", senderBalance?.amount - senderTotalAmount);

            if (senderBalance.locked !== 0 && deductedAmount <= senderBalance.locked) {
                throw new Error("The amount you're trying to send exceeds your locked amount. Please reduce the amount & try again")
            }
            if (deductedAmount < 0) {
                throw new Error("You're wallet does not have sufficient balance to make this transfer.")
            }
            /* ------------------- Create P2P Transfer -------------------*/
            await prisma.$transaction(async (tx) => {
                await tx.$queryRaw`SELECT * FROM Balance WHERE userId=${isUserExist.id} FOR UPDATE`;
                await tx.balance.update({
                    where: {
                        userId: this.sender?.id
                    },
                    data: {
                        amount: deductedAmount
                    }

                })
                await tx.balance.update({
                    where: {
                        userId: this.receiver?.id
                    },
                    data: {
                        amount: parseFloat(transactionDetail.formData.amount) * 100
                    }
                })
                if (transactionDetail.additionalData.trxn_type === "International") {
                    await prisma.preference.update({ where: { userId: this.sender.id }, data: { currency: transactionDetail.additionalData.international_trxn_currency } })
                }
                this.currency = (await prisma.preference.findFirst({ where: { userId: this.sender.id } }) as preference)?.currency
                this.p2pTransfer = await this.createP2PTransfer(transactionDetail, this.currency as string, "Success")
                await prisma.wallet.update({ where: { userId: this.sender?.id }, data: { wrongPincodeAttempts: 0 } })
            })
            return { message: "Sending money successful", status: 200, transaction: this.p2pTransfer }

        } catch (error: any) {
            console.log("--------------->", error.message);
            if (error.message === "Your account is locked. Please contact support") {
                return { message: error.message, status: 403 }
            }
            if (error.message === "Pincode not found. Pincode is required to send money" || error.message === "OTP verification failed. Enter valid OTP sent to your mail"
                || error.message === "You're not verified to make a transaction.Please create a pincode or enter valid OTP sent to your mail" || false
            ) {
                return { message: error.message, status: 422 }
            }
            if (error.message === "Cannot send money to yourself. Invalid recipient number" ||
                error.message === "You're wallet does not have sufficient balance to make this transfer." || false
            ) {
                return { message: error.message, status: 400 }
            }
            if (error instanceof ZodError) {
                return { message: error.message, status: 400 }
            }
            if (error.message === "Unauthorized. Please login first" ||
                error.message === "User not found" || error.message === "Please verify your account first to send money" ||
                error.message === "Wrong pincode. Please enter the correct pincode" || error.message === "Recipient number not found. Please enter a valid recipient number" ||
                error.message === "Balance not found"
            ) {
                return { message: error.message, status: 401 }
            }
            this.p2pTransfer = await this.createP2PTransfer(transactionDetail, this.currency as string, "Failed")
            await prisma.wallet.update({ where: { userId: this.sender?.id }, data: { wrongPincodeAttempts: 0 } })
            return { message: error.message || "Something went wrong on the bank server", status: 500 }

        }
    }

    static getInstance(transactionDetail: ITransactionDetail) {

        this.instance = new SendMoney(transactionDetail);

        return this.instance;
    }
}

export const sendMoneyAction = async (transactionDetail: ITransactionDetail) => SendMoney.getInstance(transactionDetail)

export const getAllP2PTransactionHistories = async (): Promise<p2ptransfer[] | []> => {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return []
        }
        const isUserExist = await prisma.user.findFirst({ where: { id: session.user.uid } })
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
        return p2pTransactionHistories
    } catch (error) {
        console.log("getAllP2PTransactions =========>", error);
        return []
    }
}

export const getAllP2PTransactionByTrxnID = async (trxn_id: string) => {
    let res: [] | [p2ptransfer] = []
    try {
        const p2pTransactionHistory = await prisma.p2ptransfer.findFirst({ where: { transactionID: trxn_id } })
        if (p2pTransactionHistory) {
            res.push(p2pTransactionHistory)
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
    console.log(email);
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }

        const isUserExist = await prisma.user.findFirst({
            where:
            {
                AND: [
                    { id: session?.user?.uid },
                    { email }
                ]
            }
        })

        if (!isUserExist) return { message: "User doesn't exist. Please login first.", status: 401 }
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
    console.log(otp);
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.uid) {
            return { message: "Unauthorized. Please login first", status: 401 }
        }

        const isUserExist = await prisma.user.findFirst({
            where:
            {
                AND: [
                    { id: session?.user?.uid },
                ]
            }
        })

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

        console.log(isWalletExist);
        await prisma.wallet.update({ where: { userId: session.user.uid }, data: { otpVerified: true, otp: null, otp_expiresAt: null } })
        return { message: "OTP has verified", status: 200 }
    } catch (error: any) {
        console.log(error);
        return { message: error.message || "Something went wrong while verifying your otp", status: 500 }
    }
}
