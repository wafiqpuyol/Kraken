import { cn } from "@/src/lib/utils";
import { ControllerRenderProps } from "@repo/forms/types";
import { Dispatch, SetStateAction } from "react";
import { CURRENCY_LOGO, EXCHANGE_RATE } from "../../lib/constant";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../atoms/Select";

interface SelectCurrencyProps {
    field: ControllerRenderProps<{
        amount: string;
        phone_number: string;
        pincode: string;
        currency?: string | undefined;
    }, "currency">,
    current_selected_currency: string,
    wallet_currency: string | undefined,
    form: any,
    accountLock?: boolean,
    setCurrency: Dispatch<SetStateAction<string | null>>
}

export const SelectCurrency = ({ field, current_selected_currency, wallet_currency, form, setCurrency, accountLock }: SelectCurrencyProps) => {

    if (!field.value) {
        form.setValue("currency", current_selected_currency)
    } else {
        setCurrency(field.value);
    }

    return (
        <Select defaultValue={current_selected_currency} onValueChange={field.onChange} disabled={accountLock}>
            <SelectTrigger className="w-full h-[50px]" >
                <SelectValue placeholder="Please choose currency" />
            </SelectTrigger>
            <SelectContent className="bg-white">
                <SelectGroup >
                    {
                        Object.keys(EXCHANGE_RATE[wallet_currency]).map((currency, idx) => {
                            const Logo = CURRENCY_LOGO[currency].Logo
                            const title = CURRENCY_LOGO[currency].title

                            return (
                                <SelectItem key={idx} className="cursor-pointer hover:bg-gray-100 px-9" value={currency}>
                                    <div className={cn("grid grid-cols-2 grid-flow-col place-items-center gap-x-24", currency === "BDT" && "gap-x-7")}>
                                        <div className="row-span-1 flex items-center gap-3 justify-between">
                                            <Logo />
                                            <div className="text-[13px] font-medium text-slate-800 flex flex-col">
                                                <p className="self-start">{currency}</p>
                                                <span className="text-slate-500">{title}</span>
                                            </div>
                                        </div>
                                        <div className="row-span-1 font-bold text-slate-600 justify-self-end text-[12.5px]">
                                            <span>{EXCHANGE_RATE[wallet_currency][currency]} {currency}</span>
                                            <span>/{wallet_currency}</span>
                                        </div>
                                    </div>
                                </SelectItem>
                            )
                        })
                    }
                </SelectGroup>
            </SelectContent>
        </Select >
    )
}