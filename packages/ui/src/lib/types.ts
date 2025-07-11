import { sendMoneyPayload } from "@repo/forms/sendMoneySchema"
import { schedulePaymentPayload } from "@repo/forms/schedulePaymentSchema"
import { editSchdulePaymentPayload } from "@repo/forms/editSchedulePaymentSchema"

export interface ITransactionDetail {
    formData: sendMoneyPayload | schedulePaymentPayload | editSchdulePaymentPayload
    additionalData: {
        symbol: string
        sender_number: string,
        receiver_number: string,
        trxn_type: TRANSACTION_TYPE.DOMESTIC | TRANSACTION_TYPE.INTERNATIONAL,
        domestic_trxn_currency: string
        international_trxn_currency: string
        domestic_trxn_fee: string | null
        international_trxn_fee: string | null
    }
}

export interface IScheduleDetails extends ITransactionDetail {
    scheduleId: string
    executionTime: Date
    jobOptions?: any
}

export enum TRANSACTION_TYPE {
    INTERNATIONAL = "International",
    DOMESTIC = "Domestic"
}

export interface ICharge {
    domestic_charge: string
    international_charge: string
    symbol: string
}

export enum SUPPORTED_CURRENCY_ENUM {
    USD = "USD",
    INR = "INR",
    BDT = "BDT",
    JPY = "JPY",
    EUR = "EUR"
}

// export type ExchangeRateType = Record<SUPPORTED_CURRENCY_ENUM, { [currency in SUPPORTED_CURRENCY_ENUM]?: string }>
export type ExchangeRateType = Record<SUPPORTED_CURRENCY_ENUM, Partial<Record<SUPPORTED_CURRENCY_ENUM, string>>>
export type WithdrawLimitType = {
    dayLimit: string;
    monthLimit: string;
} & {
    [currency in SUPPORTED_CURRENCY_ENUM]: {
        name: string;
        symbol: string;
        perTransactionLimit: {
            min: string;
            max: string;
        };
        totalTransactionLimit: {
            day: string;
            month: string
        }
    }
}

export interface SendMoneyType  {
    DIRECT:"DIRECT",
    SCHEDULED:"SCHEDULED"
}

export enum Phase {
    PINCODE = "pincode",
    EMAIL = "email",
    EMERGENCY = "eneergencyCode",
    OTP= "otp"
}