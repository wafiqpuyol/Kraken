"use server";

export type ErrorCodes =
    | "missing-input-secret"
    | "invalid-input-secret"
    | "missing-input-response"
    | "invalid-input-response"
    | "bad-request"
    | "timeout-orduplicate";
import axios from "axios";


export const verifyCaptchaToken = async (token: string | null | undefined): Promise<{
    message: string;
    status: number;
    success: boolean
}> => {
    console.log("TOKEN ===>", token);
    try {
        const secretKey: string | undefined = process.env.CAPTCHA_SECRET_SITE_KEY;

        if (!token || !secretKey) {
            return { message: "Token not found", status: 405, success: false }
        }
        const captchaData = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${"asa"}`,
        );
        // console.log("((((((((((((((((((", captchaData);
        if (captchaData.data.success) {
            return { message: "Captcha verified successful", status: 200, success: captchaData.data.success };
        } else {
            return { message: "Failed to verify captcha", status: 405, success: captchaData.data.success }
        }
    } catch (error) {
        console.log("verifyCaptchaToken ==>", error);
        return { message: "Something went wrong while verifying CAPTCHA", status: 500, success: false }
    }
}