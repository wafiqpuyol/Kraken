import { Scheduled } from '@repo/ui/Scheduled'
import { useRedirectToLogin } from "../../../../../hooks/useRedirect"

async function page({ params: { locale } }: { params: { locale: string } }) {
    await useRedirectToLogin(locale, "/login")
    return (
        <Scheduled />
    )
}

export default page