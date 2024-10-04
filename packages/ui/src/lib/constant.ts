import { USD, EUR } from "../icons/index"

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
export const SELECTED_COUNTRY = [
    [
        "United States",
        "us",
        "1",
        "(...) ...-....",
        0
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
        ". .. .. .. .."
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