import React from 'react'
import { SettingsTab } from "@repo/ui/SettingsTab"
import { getServerSession } from "next-auth"
import { authOptions } from '@repo/network'
import { prisma } from '@repo/db/client'
import { user, preference, account } from "@repo/db/type"
import { updatePreference } from "../../../../../lib/action"
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"
import { changeEmailAction, updateEmail, cancelConfirmMail } from "../../../../../lib/auth"

async function page({ params: { locale } }: { params: { locale: string } }) {
    await useRedirectToLogin(locale, "/login")
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findFirst({ where: { id: session?.user?.uid } }) as user
    const userPreference = await prisma.preference.findFirst({ where: { userId: session?.user?.uid } }) as preference
    const account = await prisma.account.findFirst({ where: { userId: session?.user?.uid } }) as account
    return (
        <SettingsTab userDetails={user} userPreference={userPreference} updatePreference={updatePreference} account={account} changeEmailAction={changeEmailAction} updateEmail={updateEmail} cancelConfirmMail={cancelConfirmMail} />
    )
}

export default page;