import { notification } from "@repo/db/type"
import { useAppState } from "../molecules/StateProvider"
import { BellIcon } from "../../icons"
import { GoGear } from "react-icons/go";
import { IoNotificationsOffOutline } from "react-icons/io5";
import { formatTimestamp } from "../../lib/utils"
import { cn } from "../../lib/utils"
import { COUNTRY_MATCHED_CURRENCY } from "../../lib/constant"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "../molecules/Dropdown"
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react"
import Link from "next/link";
import { useLocale } from "next-intl"

interface NotificationCardProps {
    notificationDetail: notification,
    idx: number,
    currencySymbol: string | undefined
}

export const Notification = () => {
    const session = useSession()
    const { totalNumberOfUnreadNotificationCount, totalNotifications } = useAppState()
    const notificationParantComp = useRef(null)
    const currencySymbol = COUNTRY_MATCHED_CURRENCY.filter(o => o.name === session.data?.user?.wallet_currency)[0]?.symbol
    const locale = useLocale()
    console.log("Unread NOT----->", totalNumberOfUnreadNotificationCount);

    const handleClick = () => {
        console.log("caling fuck");

    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className='relative'>
                    <BellIcon />
                    {
                        session.data?.user?.preference?.notification_status
                        &&
                        <small className={cn('absolute top-0 bg-red-500 text-white rounded-full text-xs font-extrabold px-[5px] py-[2px]',
                            totalNumberOfUnreadNotificationCount <= 0 && "invisible"
                        )}>
                            {totalNumberOfUnreadNotificationCount > 99 ? "99+" : totalNumberOfUnreadNotificationCount}
                        </small>
                    }
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[380px] bg-white mr-24 mt-4 rounded-xl">
                <DropdownMenuLabel className='flex items-center justify-between'>
                    <p className='text-[17px] text-slate-800'>Notification</p>
                    <div className='hover:bg-slate-100/60 cursor-pointer p-2 rounded-full transition-all duration-200' onClick={() => handleClick()}>
                        <Link href={`/${locale}/dashboard/account-settings/settings`}><GoGear size={23} className='text-slate-700' /></Link>
                    </div>
                </DropdownMenuLabel>

                <div className='m-3 py-2 rounded-xl h-[500] flex flex-col justify-center'>
                    {
                        session.data?.user?.preference?.notification_status
                            ?
                            totalNotifications.length > 0 ?
                                <div className='h-[500px] p-3 overflow-y-scroll scroll-smooth' ref={notificationParantComp}>
                                    {totalNotifications.map((t: notification, idx: number) => <NotificationCard key={t.id + 1} notificationDetail={t} idx={idx} currencySymbol={currencySymbol} />)}
                                </div>
                                :
                                <div className='h-[500px] p-3 bg-slate-100/50 mt-1 w-full flex flex-col justify-center items-center'>
                                    <div className='p-2 rounded-full bg-slate-200'><BellIcon className='text-slate-600' /></div>
                                    <h3 className='font-semibold mb-1'>You're all caught up!</h3>
                                    <p className='text-slate-700 font-medium'>Updates will be shown here</p>
                                </div>
                            :
                            <div className='h-[500px] p-3 bg-slate-100/50 mt-1 w-full flex flex-col justify-center items-center'>
                                <div className='p-2 rounded-full bg-slate-200'><IoNotificationsOffOutline className='text-slate-600 text-4xl' /></div>
                                <h3 className='font-semibold mt-4 text-center text-slate-800'>You're notification is off. Please enable it from settings to get notified instantly.</h3>
                            </div>
                    }
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notificationDetail, idx, currencySymbol }) => {
    const notificationRef = useRef(null)
    const notificationContent = JSON.parse(notificationDetail.message! as string)
    const {
        setTotalNumberOfUnreadNotificationCount, setTotalNotifications,
        totalNotifications, getNextUnreadNotifications, totalNotificationCount, totalNumberOfUnreadNotificationCount,
        updateNotification
    } = useAppState()

    // console.log("******", totalNotifications.length);
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    if ((notificationDetail.id === totalNotifications[totalNotifications.length - 1].id)
                        && (totalNotifications.length !== totalNotificationCount)) {
                        getNextUnreadNotifications(totalNotifications.length)
                            .then(res => setTotalNotifications(prev => [...prev, ...res]))

                        // console.log(notificationDetail.id, totalNotifications[totalNotifications.length - 1].id,
                        //     totalNotifications.length, totalNotificationCount);
                    }
                    if (!notificationDetail.read) {
                        setTotalNotifications(prev => {
                            const n = prev[idx] as notification
                            n.read = true
                            return [...prev]
                        })
                        await updateNotification({ read: true }, notificationDetail.id)
                            .then((_) => setTotalNumberOfUnreadNotificationCount(prev => prev ? prev - 1 : 0))
                    }
                }
                if (!entry.isIntersecting && notificationDetail.read) {
                    // console.log("READ ====>", entry, notificationDetail.id);
                    // setTotalNotifications(prev => prev.filter(n => !(n.id === notificationDetail.id && n.read)))
                }
            })
        })
        const notificationItem = notificationRef.current;
        observer.observe(notificationItem!)
        if (totalNotifications.length === totalNotificationCount) {
            // console.log(totalNotifications.length, totalNotificationCount);
        }

        return () => {
            observer.disconnect()
        }
    }, [notificationDetail, notificationDetail.read])


    return (
        <div ref={notificationRef}
            className={cn('bg-white rounded-xl mb-4 p-3 font-medium flex flex-col shadow-md border-t-2',
                notificationDetail.read && "brightness-75"
            )}>
            <small className="self-end text-xs text-slate-500">{formatTimestamp(new Date(notificationContent.timestamp).getTime())}</small>
            <p className="mt-2 text-sm">{notificationDetail.id} - You have received {notificationContent.amount / 100}
                <small className="text-[14px] font-extrabold mr-1">{currencySymbol}</small> from {notificationContent.sender_name}
            </p>
        </div>
    )
}




/**
 * useEffect(() => {
        // console.log(notificationRef.current);
        // if (notificationRef.current) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // notificationRef.current.scrollIntoView({ behavior: 'smooth' })
                    // console.log("Intersecting ==>", entry.isIntersecting, notificationDetail.id);
                    if (!notificationDetail.read) {
                        // setTotalNotifications(prev => {
                        //     const f = prev.filter(n => {
                        //         if (n.id === notificationDetail.id) notificationDetail.read = true
                        //         return n
                        //     })
                        //     // console.log("=>", f);
                        //     return f
                        // })
                        // setTotalNotificationCount(prev => prev - 1)
                    }
                }
                if (!entry.isIntersecting && notificationDetail.read) {
                    console.log("READ ====>", entry, notificationDetail.id);
                    // setTotalNotifications(prev => prev.filter(n => !(n.id === notificationDetail.id && n.read)))
                }
            })
        })
        const notificationItems = notificationRef.current;
        observer.observe(notificationItems!)
        return () => {
            observer.disconnect()
        }
    }, [notificationDetail, notificationDetail.read])
 * 
 */


//     {
//     "name": "process-payment",
//     "data": {
//         "formData": {
//             "pincode": "123456",
//             "payee_number": "+8801962175677",
//             "amount": "25",
//             "currency": "BDT",
//             "payment_date": "2025-07-05T03:00:00.000Z"
//         },
//         "additionalData": {
//             "symbol": "৳",
//             "sender_number": "+8801905333510",
//             "receiver_number": "+8801962175677",
//             "trxn_type": "Domestic",
//             "domestic_trxn_fee": "4",
//             "international_trxn_fee": null,
//             "domestic_trxn_currency": "BDT",
//             "international_trxn_currency": "BDT"
//         },
//         "executionTime": "2025-07-05T03:00:00.000Z",
//         "scheduleId": "92af066e-fd53-435b-98c6-82c2b63a755a",
//         "userId": 26506964
//     },
//     "opts": {
//         "attempts": 3,
//         "delay": 1326423137,
//         "removeOnFail": {
//             "count": 0
//         },
//         "jobId": "schedule_92af066e-fd53-435b-98c6-82c2b63a755a_cc98b850-cec8-4a66-9f0f-f6fba39c55af",
//         "removeOnComplete": {
//             "count": 0
//         },
//         "backoff": {
//             "delay": 5000,
//             "type": "exponential"
//         }
//     },
//     "id": "schedule_92af066e-fd53-435b-98c6-82c2b63a755a_cc98b850-cec8-4a66-9f0f-f6fba39c55af",
//     "progress": 0,
//     "returnvalue": null,
//     "stacktrace": [],
//     "delay": 1326423137,
//     "priority": 0,
//     "attemptsStarted": 0,
//     "attemptsMade": 0,
//     "stalledCounter": 0,
//     "timestamp": 1750357976863,
//     "queueQualifiedName": "bull:payment-schedule-queue"
// }