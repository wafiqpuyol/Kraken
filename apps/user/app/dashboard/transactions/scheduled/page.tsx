import { authOptions } from '@repo/network'
import { Scheduled } from '@repo/ui/Scheduled'
import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'

async function page() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
        redirect("/login")
    }
    return (
        <Scheduled />
    )
}

export default page