import { scheduleSchemaType } from "@repo/forms/schedulePaymentSchema";
import { sendMoneySchemaType } from "@repo/forms/sendMoneySchema";
import { ITransactionDetail } from "@repo/ui/types";
import { ZodError } from "@repo/forms/types"


const bcrypt = require('bcrypt');

export const generateTransactionId = () => {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let transactionId = "";

    for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        transactionId += characters.charAt(randomIndex);
    }

    return transactionId;
}

export const generateOTP = () => {
    const otp = Math.floor(Math.random() * 1000000);
    return otp.toString().padStart(6, '0');
}

export const getNextDayDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    // @ts-ignore
    const formattedDate = today.toLocaleDateString('en-US', options);
    return formattedDate
}

export const hoursLeft = () => {
    const countdown = (deadline: number) => {

        const now = new Date().getTime();
        const distance = deadline - now;

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (distance < 0) {
            return 'Countdown finished!';
        } else {
            return `${hours} hours`;
        }
    }

    const deadline = new Date(getNextDayDate()).getTime();

    return countdown(deadline);
}

export const generateToken = async () => {
    try {
        const token = Math.random().toString(36).substring(2, 15);
        const hashedToken = await bcrypt.hash(token, 10);
        return hashedToken;
    } catch (error) {
        console.error('Error generating password reset token:', error);
    }
}


export class HttpError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, HttpError.prototype);
        this.name = this.constructor.name;
    }
}


export class ZodSchemaValidator {
    private static instance: ZodSchemaValidator

    private constructor() { }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ZodSchemaValidator()
        }
        return this.instance
    }

    validateScheduleSchema(schema: scheduleSchemaType, payload: ITransactionDetail["formData"]) {
        const validatedScheduledDetails = schema.safeParse(payload)
        if (!validatedScheduledDetails.success) {
            throw new ZodError(
                [{
                    message: (
                        validatedScheduledDetails.error.format().payee_number?._errors[0] ||
                        validatedScheduledDetails.error.format().payment_date?._errors[0]! ||
                        validatedScheduledDetails.error.format().currency?._errors[0] ||
                        validatedScheduledDetails.error.format().amount?._errors[0] ||
                        validatedScheduledDetails.error.format().pincode?._errors[0]
                    )
                }]
            )
        }
        return validatedScheduledDetails
    }
    validateSendMoneySchema(schema: sendMoneySchemaType, payload: ITransactionDetail["formData"]) {
        const validatedScheduledDetails = schema.safeParse(payload)
        if (!validatedScheduledDetails.success) {
            throw new ZodError(
                [{
                    message: (
                       validatedScheduledDetails.error.format().phone_number?._errors[0] || 
                       validatedScheduledDetails.error.format().amount?._errors[0] || 
                       validatedScheduledDetails.error.format().pincode?._errors[0] ||
                       validatedScheduledDetails.error.format().currency?._errors[0]
                    )
                }]
            )
        }
        return validatedScheduledDetails
    }
}