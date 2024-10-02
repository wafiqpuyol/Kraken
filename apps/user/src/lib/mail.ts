"use server"

const nodemailer = require("nodemailer");
import { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, AUTHORIZATION_CODE_TEMPLATE, CONFIRMATION_CODE_TEMPLATE } from "../templates/mailTemplates"


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



export const sendPasswordResetEmail = async (email: string, passwordResetToken: string, locale: string) => {
    console.log(sender, passwordResetToken, email);
    try {
        await nodeMailerClient.sendMail({
            from: sender,
            to: email,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetToken}", passwordResetToken).replace("{locale}", locale),
            category: "Password Reset",
        });
        return { message: "Password reset link has been sent to your email", status: 200 };
    } catch (error: any) {
        console.log(error);
        return { message: "Something went wrong while sending password reset link to your email", status: 500 };
    }
};


export const sendVerificationEmail = async (email: string, emailVerificationToken: string, locale: string) => {
    try {
        await nodeMailerClient.sendMail({
            from: sender,
            to: email,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{locale}", locale).replace("{verificationCode}", emailVerificationToken),
            category: "Email Verification",
        });
        return { message: "Email verification link has been sent to your email", status: 200 };
    } catch (error: any) {
        console.log(error);
        return { message: "Something went wrong while sending email verification link to your email", status: 500 };
    }
};

export const sendChangeEmailVerification = async (current_email: string, new_email: string, authorization_code: string, confirmation_code: string) => {
    console.log(current_email, new_email, authorization_code, confirmation_code)
    try {
        await Promise.all([
            await nodeMailerClient.sendMail({
                from: sender,
                to: current_email,
                subject: "Authorize your account email change",
                html: AUTHORIZATION_CODE_TEMPLATE.replaceAll("{new_email}", new_email).replace("{authorization_code}", authorization_code),
                category: "Change Email Address",
            }),
            await nodeMailerClient.sendMail({
                from: sender,
                to: new_email,
                subject: "Confirm your account email change",
                html: CONFIRMATION_CODE_TEMPLATE.replace("{confirmation_code}", confirmation_code),
                category: "Change Email Address",
            })])
        return { message: "Email has been sent to your email", status: 200 };
    } catch (error: any) {
        console.log("sendChangeEmailVerification -->", error);
        return { message: "Something went wrong while sending email to your email", status: 500 };
    }
};