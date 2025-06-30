import { USD, EUR, USDLogo, YENLogo, EUROLogo, INRLogo, BDTLogo } from "../icons/index"
import { ICharge, SUPPORTED_CURRENCY_ENUM, ExchangeRateType, WithdrawLimitType,SendMoneyType } from "./types"

export const BANK = [
    {
        name: "IFIC Bank",
        url: "https://www.ificbank.com.bd/"
    },
    {
        name: "Jamuna Bank",
        url: "https://jamunabankbd.com/"
    },
]

export const SUPPORTED_LANGUAGE = [
    {
        title: "US English",
        code: "en",
    },
    {
        title: "Hindi",
        code: "hi",
    },
    {
        title: "Bengali",
        code: "bn",
    },
    {
        title: "Japanese",
        code: "ja",
    },
    {
        title: "Espanol",
        code: "es",
    },
    {
        title: "French",
        code: "fr",
    },
    {
        title: "Portuguese",
        code: "pt",
    },
]

export const SUPPORTED_CURRENCY = [
    {
        title: "US Dollar",
        country: "United States",
        name: "USD",
        image: USD
    },
    {
        title: "Rupee",
        country: "India",
        name: "INR",
        image: USD
    },
    {
        title: "Taka",
        country: "Bangladesh",
        name: "BDT",
        image: USD
    },
    {
        title: "YEN",
        country: "Japan",
        name: "JPY",
        image: USD
    },
    {
        title: "Euro",
        country: "Spain",
        name: "EUR",
        image: EUR
    }
]

export const SUPPORTED_TIMEZONE = [
    "[+00:00 UTC] UTC, Universal Time",
    "[-05:00 EST] Eastern Standard Time",
    "[-06:00 CST] Central Standard Time"
]

export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const PINCODE_MAX_LENGTH = 6
export const EMERGENCY_CODE_MAX_LENGTH = 50
export const OTP_CODE=6
export const SELECTED_COUNTRY = [
    [
        "United States",
        "us",
        "1",
        "(...) ...-....",
    ],
    [
        "Bangladesh",
        "bd",
        "880"
    ],
    [
        "India",
        "in",
        "91",
        ".....-....."
    ],
    [
        "Spain",
        "es",
        "34",
        "... ... ..."
    ],
    [
        "France",
        "fr",
        "33",
        ". .. .. .. ..",
    ],
    [
        "Portugal",
        "pt",
        "351"
    ],
    [
        "Japan",
        "jp",
        "81",
        ".. .... ...."
    ],
]

export const LINK = [
    {
        title: "Privacy Policy",
        href: "https://www.kraken.com/legal/privacy"
    },
    {
        title: "Terms of Services",
        href: "https://www.kraken.com/legal"
    }
]
export const MINIMUM_AMOUNT = 10
export const ASSETS = {
    VIDEO_URL: "https://assets-cms.kraken.com/files/51n36hrp/facade/514d4a19b477dec279e57a3188b49aec83c92c17.mp4",
    QR: "https://assets-cms.kraken.com/images/51n36hrp/facade/930f097495c8802dfcd23a58b8e8f1015e867efc-464x464.svg"
}

export const COUNTRY_MATCHED_CURRENCY = [
    {
        name: "USD",
        symbol: "$",
        country: "United States",
        numberType:"US"
    },
    {
        name: "BDT",
        symbol: "৳",
        country: "Bangladesh",
         numberType:"USBangladeshi"
    },
    {
        name: "JPY",
        symbol: "¥",
        country: "Japan",
         numberType:"Japanese"
    },
    {
        name: "EUR",
        symbol: "€",
        country: "Spain",
         numberType:"Spanish"
    },
    {
        name: "EUR",
        symbol: "€",
        country: "France",
         numberType:"French"
    },
    {
        name: "EUR",
        symbol: "€",
        country: "Portugal",
         numberType:"Portuguese"
    },
    {
        name: "INR",
        symbol: "₹",
        country: "India",
         numberType:"Indian"
    }
]

export const EXCHANGE_RATE: ExchangeRateType = {
    USD: {
        BDT: "119.59",
        INR: "83.96",
        JPY: "146.49",
        EUR: "0.91",
    },
    BDT: {
        USD: "0.0084",
        INR: "0.70",
        JPY: "1.23",
        EUR: "0.0076",
    },
    INR: {
        USD: "0.012",
        BDT: "1.42",
        JPY: "1.74",
        EUR: "0.011",
    },
    JPY: {
        USD: "0.0068",
        BDT: "0.82",
        INR: "0.57",
        EUR: "0.0062",
    },
    EUR: {
        USD: "1.10",
        BDT: "131.89",
        INR: "92.63",
        JPY: "161.56",
    },
};

export const CURRENCY_LOGO = {
    USD: {
        title: "US Dollar",
        Logo: USDLogo
    },
    JPY: {
        title: "Japanese YEN",
        Logo: YENLogo
    },
    EUR: {
        title: "Euro",
        Logo: EUR
    },
    INR: {
        title: "Indian Rupee",
        Logo: INRLogo
    },
    BDT: {
        title: "Bangladeshi Taka",
        Logo: BDTLogo
    }
}

export const CHARGE: Record<SUPPORTED_CURRENCY_ENUM, ICharge> = {
    USD: {
        domestic_charge: "6",
        international_charge: "5",
        symbol: "$"
    },
    INR: {
        domestic_charge: "7",
        international_charge: "12",
        symbol: "₹"

    },
    BDT: {
        domestic_charge: "4",
        international_charge: "25",
        symbol: "৳"

    },
    JPY: {
        domestic_charge: "50",
        international_charge: "22",
        symbol: "¥"

    },
    EUR: {
        domestic_charge: "6",
        international_charge: "8",
        symbol: "€"
    }
}

export const WITHDRAW_LIMIT: WithdrawLimitType = {
    dayLimit: "20",
    monthLimit: "50",
    USD: {
        name: "USD",
        symbol: "$",
        perTransactionLimit: {
            min: "120",
            max: "12000",
        },
        totalTransactionLimit: {
            day: "12000",
            month: "320000"
        }
    },
    INR: {
        name: "INR",
        symbol: "₹",
        perTransactionLimit: {
            min: "90",
            max: "60000"
        },
        totalTransactionLimit: {
            day: "60000",
            month: "550000"
        },
    },
    BDT: {
        name: "BDT",
        symbol: "৳",
        perTransactionLimit: {
            min: "50",
            max: "50000"
        },
        totalTransactionLimit: {
            day: "50000",
            month: "300000"
        },
    },
    JPY: {
        name: "JPY",
        symbol: "¥",
        perTransactionLimit: {
            min: "80",
            max: "90000"
        },
        totalTransactionLimit: {
            day: "90000",
            month: "2200000"
        }
    },
    EUR: {
        name: "EUR",
        symbol: "€",
        perTransactionLimit: {
            min: "110",
            max: "17000"
        },
        totalTransactionLimit: {
            day: "17000",
            month: "445000"
        }
    }
}

export const LOCK_AMOUNT = {
    min: "20",
    max: "3500"
}

export const WRONG_PINCODE_ATTEMPTS = 3
export const WRONG_PASSWORD_ATTEMPTS = 3
export const PINCODE_RESET_LIMIT = 3
export const WS_SERVER_URL = "ws://localhost:3010"
export const HEARTBEAT_VALUE = 1;
export const SOCKET_CLOSE_CODE = 1000
export const JOB_NAME = "process-payment"
export const BUFFER_SCHEDULE_TIME=20
export const ATTEMPT_VALUE = 3
export const BACKOFF_DELAY = 5000
export const SEND_MOANEY_TYPE= {
    DIRECT:"DIRECT",
    SCHEDULED:"SCHEDULED"
} as SendMoneyType
export const TOTAL_EDITCOUNT = 3
export const MIN_GAP_MINUTES = 15