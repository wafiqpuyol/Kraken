import { verifyEmail } from "../../../../lib/auth"
import { EmailVerification } from "@repo/ui/EmailVerification"
import { sendVerificationEmailAction } from "../../../../lib/auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { useRedirectToLogin } from "../../../../hooks/useRedirect"

interface IContent {
    locale: string
    status: number
    title: string
    description: string
    btnText: string
    redirectToLogin?: boolean
}

interface IProps {
    searchParams: { token: string },
    params: { locale: string }
}

const page: React.FC<IProps> = async ({ params: { locale }, searchParams: { token } }) => {
    const session = await getServerSession(authOptions)
    useRedirectToLogin(locale, "/login")
    let content: IContent | null = null
    console.log(session);
    if (!session?.user?.isVerified) {
        try {
            const res = await verifyEmail(token)
            console.log(res);
            switch (res.status) {
                case 200 || session?.user?.isVerified:
                    content = {
                        locale,
                        status: res.status,
                        title: res.message,
                        description: `
                            <div className='bg-purple-100/50 py-4 rounded-xl px-3'>
                        <ul cla <div className='bg-purple-100/50 py-4 rounded-xl px-3'>
                        <p className='text-slate-700 font-medium text-lg mb-2'>Now you can :</p>
                        <ul className='ml-2 text-slate-600 font-medium text-[14px]'>
                            <div className='flex items-center my-1'>
                                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 256" class="text-purple-500 text-xl mr-[8px]" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M128,35.31V128a8,8,0,0,1-16,0V35.31L93.66,53.66A8,8,0,0,1,82.34,42.34l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32Zm64,88.31V96a16,16,0,0,0-16-16H160a8,8,0,0,0,0,16h16v80.4A28,28,0,0,0,131.75,210l.24.38,22.26,34a8,8,0,0,0,13.39-8.76l-22.13-33.79A12,12,0,0,1,166.4,190c.07.13.15.26.23.38l10.68,16.31A8,8,0,0,0,192,202.31V144a74.84,74.84,0,0,1,24,54.69V240a8,8,0,0,0,16,0V198.65A90.89,90.89,0,0,0,192,123.62ZM80,80H64A16,16,0,0,0,48,96V200a8,8,0,0,0,16,0V96H80a8,8,0,0,0,0-16Z"></path></svg>
                                <li> Deposit Money</li>
                            </div>
                            <div className='flex items-center'>
                                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 640 512" class="text-green-500 text-lg mr-[8.5px]" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M535 41c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l64 64c4.5 4.5 7 10.6 7 17s-2.5 12.5-7 17l-64 64c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l23-23L384 112c-13.3 0-24-10.7-24-24s10.7-24 24-24l174.1 0L535 41zM105 377l-23 23L256 400c13.3 0 24 10.7 24 24s-10.7 24-24 24L81.9 448l23 23c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L7 441c-4.5-4.5-7-10.6-7-17s2.5-12.5 7-17l64-64c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9zM96 64H337.9c-3.7 7.2-5.9 15.3-5.9 24c0 28.7 23.3 52 52 52l117.4 0c-4 17 .6 35.5 13.8 48.8c20.3 20.3 53.2 20.3 73.5 0L608 169.5V384c0 35.3-28.7 64-64 64H302.1c3.7-7.2 5.9-15.3 5.9-24c0-28.7-23.3-52-52-52l-117.4 0c4-17-.6-35.5-13.8-48.8c-20.3-20.3-53.2-20.3-73.5 0L32 342.5V128c0-35.3 28.7-64 64-64zm64 64H96v64c35.3 0 64-28.7 64-64zM544 320c-35.3 0-64 28.7-64 64h64V320zM320 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z"></path></svg>
                                <li>P2P Money Transfer</li>
                            </div>
                        </ul>
                    </div>
                        `,
                        btnText: "Back to Home page"
                    }
                    return <EmailVerification content={content} sendVerificationEmailAction={sendVerificationEmailAction} />
                case 401:
                    let description = "";
                    if (res.message.includes("Token is missing")) {
                        description = `
                            <div className='bg-red-200/50 py-4 rounded-xl px-3'>
                        <p className='text-slate-600 text-[0.95rem] font-medium'>Email verification failed due to missing token.</p>
                    </div>
                        `
                    }
                    console.log(res.message.includes("Token has expired"));
                    if (res.message.includes("Token has expired")) {
                        description = `
                        <div className='bg-red-200/50 py-4 rounded-xl px-3'>
                    <p className='text-slate-600 text-[0.95rem] font-medium'>Email verification failed due to token expiration.</p>
                </div>
                    `
                    }
                    content = {
                        locale,
                        description,
                        status: res.status,
                        title: res.message,
                        btnText: "Resend Verification Email"
                    }

                    return <EmailVerification content={content} sendVerificationEmailAction={sendVerificationEmailAction} />
                case 404:
                    content = {
                        locale,
                        redirectToLogin: true,
                        status: res.status,
                        title: res.message,
                        description: `
                          <div className='bg-red-200/50 py-4 rounded-xl px-3'>
                        <p className='text-slate-600 text-[0.95rem] font-medium'>User with this email does not exist.</p>
                        <p className='text-slate-600 text-[0.95rem] font-medium'>Now you'll be redirected to login page</p>
                    </div>
                        `,
                        btnText: ""
                    }
                    return <EmailVerification content={content} sendVerificationEmailAction={sendVerificationEmailAction} />

                case 500:
                    content = {
                        locale,
                        status: res.status,
                        title: res.message, description: `
                          <div className='bg-red-200/50 py-4 rounded-xl px-3'>
                        <p className='text-slate-600 text-[0.95rem] font-medium'>Something went wrong while verifying your email.</p>
                    </div>
                        `,
                        btnText: "Resend Verification Email"
                    }
                    return <EmailVerification content={content} sendVerificationEmailAction={sendVerificationEmailAction} />
            }
        } catch (error) {
            content = {
                locale,
                status: 500,
                title: error.message,
                description:
                    `
                    <div className='bg-red-200/50 py-4 rounded-xl px-3'>
                        <p className='text-slate-600 text-[0.95rem] font-medium'>Something went wrong while verifying your email.</p>
                    </div>
                `,
                btnText: "Resend Verification Email"
            }
            return <EmailVerification content={content} sendVerificationEmailAction={sendVerificationEmailAction} />
        }
    }
    content = {
        locale,
        status: 200,
        title: "Email verification successful",
        description: `
                    <div className='bg-purple-100/50 py-4 rounded-xl px-3'>
                        <ul cla <div className='bg-purple-100/50 py-4 rounded-xl px-3'>
                        <p className='text-slate-700 font-medium text-lg mb-2'>Now you can :</p>
                        <ul className='ml-2 text-slate-600 font-medium text-[14px]'>
                            <div className='flex items-center my-1'>
                                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 256" class="text-purple-500 text-xl mr-[8px]" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M128,35.31V128a8,8,0,0,1-16,0V35.31L93.66,53.66A8,8,0,0,1,82.34,42.34l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32Zm64,88.31V96a16,16,0,0,0-16-16H160a8,8,0,0,0,0,16h16v80.4A28,28,0,0,0,131.75,210l.24.38,22.26,34a8,8,0,0,0,13.39-8.76l-22.13-33.79A12,12,0,0,1,166.4,190c.07.13.15.26.23.38l10.68,16.31A8,8,0,0,0,192,202.31V144a74.84,74.84,0,0,1,24,54.69V240a8,8,0,0,0,16,0V198.65A90.89,90.89,0,0,0,192,123.62ZM80,80H64A16,16,0,0,0,48,96V200a8,8,0,0,0,16,0V96H80a8,8,0,0,0,0-16Z"></path></svg>
                                <li> Deposit Money</li>
                            </div>
                            <div className='flex items-center'>
                                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 640 512" class="text-green-500 text-lg mr-[8.5px]" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M535 41c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l64 64c4.5 4.5 7 10.6 7 17s-2.5 12.5-7 17l-64 64c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l23-23L384 112c-13.3 0-24-10.7-24-24s10.7-24 24-24l174.1 0L535 41zM105 377l-23 23L256 400c13.3 0 24 10.7 24 24s-10.7 24-24 24L81.9 448l23 23c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L7 441c-4.5-4.5-7-10.6-7-17s2.5-12.5 7-17l64-64c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9zM96 64H337.9c-3.7 7.2-5.9 15.3-5.9 24c0 28.7 23.3 52 52 52l117.4 0c-4 17 .6 35.5 13.8 48.8c20.3 20.3 53.2 20.3 73.5 0L608 169.5V384c0 35.3-28.7 64-64 64H302.1c3.7-7.2 5.9-15.3 5.9-24c0-28.7-23.3-52-52-52l-117.4 0c4-17-.6-35.5-13.8-48.8c-20.3-20.3-53.2-20.3-73.5 0L32 342.5V128c0-35.3 28.7-64 64-64zm64 64H96v64c35.3 0 64-28.7 64-64zM544 320c-35.3 0-64 28.7-64 64h64V320zM320 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z"></path></svg>
                                <li>P2P Money Transfer</li>
                            </div>
                        </ul>
                    </div>
        `,
        btnText: "Back to Home page"
    }
    return <EmailVerification content={content} sendVerificationEmailAction={sendVerificationEmailAction} />
}

export default page