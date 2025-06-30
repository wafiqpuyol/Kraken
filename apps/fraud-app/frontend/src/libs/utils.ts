import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const stringToAsciiCodes =(str: string): number[] => {
    return Array.from(str).map(char => char.charCodeAt(0));
}

export const getValueFromLocalStorage = (storeName:string)=> {
    return JSON.parse(localStorage.getItem(storeName)!)
}