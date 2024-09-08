"use server"

import { signUp } from "@repo/network"
import { signUpPayload } from "@repo/forms/signupSchema"

export const signUpAction = async (payload: signUpPayload) => {
    return await signUp(payload);
}