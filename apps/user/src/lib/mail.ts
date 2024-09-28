"use server"

const nodemailer = require("nodemailer");
import { PASSWORD_RESET_REQUEST_TEMPLATE } from "../templates/mailTemplates"


const nodeMailerClient = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
        user: process.env.NEXT_PUBLIC_MAIL_SENDER_USER!,
        pass: process.env.NEXT_PUBLIC_MAIL_SENDER_PASS!
    },
});

const sender = process.env.NEXT_PUBLIC_MAIL_SENDER!;



export const sendVerificationEmail = async (email: string, passwordResetToken: string) => {
    console.log(sender, passwordResetToken);
    try {
        await nodeMailerClient.sendMail({
            from: sender,
            to: email,
            subject: "Verify your email",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetToken}", passwordResetToken),
            category: "Email Verification",
        });
        return { message: "Password reset link has been sent to your email`", status: 200 };
    } catch (error: any) {
        console.log(error);
        return { message: "Something went wrong while sending password reset link to your email", status: 500 };
    }
};