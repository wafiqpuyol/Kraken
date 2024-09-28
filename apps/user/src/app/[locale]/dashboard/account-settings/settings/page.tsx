import React from 'react'
import { SettingsTab } from "@repo/ui/SettingsTab"
import { getServerSession } from "next-auth"
import { authOptions } from '@repo/network'
import { prisma } from '@repo/db/client'
import { user, preference } from "@repo/db/type"
import { updatePreference } from "../../../../../lib/action"
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"

async function page({ params: { locale } }: { params: { locale: string } }) {
    await useRedirectToLogin(locale, "/login")
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findFirst({ where: { id: session?.user?.uid } }) as user
    const userPreference = await prisma.preference.findFirst({ where: { userId: session?.user?.uid } }) as preference
    return (
        <SettingsTab userDetails={user} userPreference={userPreference} updatePreference={updatePreference} />
    )
}

export default page;