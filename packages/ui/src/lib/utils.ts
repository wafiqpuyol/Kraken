import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CHARGE, EXCHANGE_RATE } from "@repo/ui/constants"
import { SUPPORTED_CURRENCY_ENUM } from "@repo/ui/types"
import { Dispatch, SetStateAction } from "react"
import { Session } from "next-auth"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatAmount(val: string, precision: number): string {
    if (val.length === 0) return "NaN"
    if (Number.isInteger(parseFloat(val))) {
        return val;
    } else {
        const firstHalf = val.split(".")[0]
        if (precision === 0) return firstHalf
        const secondHalf = val.split(".")[1].slice(0, 2)
        return firstHalf + "." + secondHalf
    }
}