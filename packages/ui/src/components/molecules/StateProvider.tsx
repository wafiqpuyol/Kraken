"use client"
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { notification } from "@repo/db/type"
import { useSession } from "next-auth/react"
import { SignallingManager } from "../../lib/utils"

type AppContextType = {
    totalNotifications: notification[],
    totalNumberOfUnreadNotificationCount: number,
    totalNumberOfNotificationCount: number
    setTotalNumberOfUnreadNotificationCount: Dispatch<SetStateAction<number>>
    setTotalNotifications: Dispatch<SetStateAction<notification[]>>
    getNextUnreadNotifications: (skipItem: number) => Promise<notification[] | []>
    updateNotification: (payload: Partial<notification>, notificationID: number) => Promise<{}>
    userTotalBalance: number,
    setUserTotalBalance: Dispatch<SetStateAction<number>>
    setAccountLocked: Dispatch<SetStateAction<boolean>>
    setLockExpiry: Dispatch<SetStateAction<Date | null>>
    accountLocked: boolean,
    lockExpiry: Date | null
}
interface AppStateProviderProps {
    children: React.ReactNode
    notifications?: notification[]
    getAllNotifications: () => Promise<notification[] | []>
    getNextUnreadNotifications: (skipItem: number) => Promise<notification[] | []>
    updateNotification: (payload: Partial<notification>, notificationID: number) => Promise<{
        message: string;
        status: number;
    }>
    totalUnreadNotificationCount: () => Promise<number>
    totalNotificationCount: () => Promise<number>
    isAccountLocked: boolean;
    lockedAccountExpiresAt: Date | null;
}


const AppStateContext = createContext<AppContextType>({
    totalNotifications: [],
    totalNumberOfUnreadNotificationCount: 0,
    totalNumberOfNotificationCount: 0,
    setTotalNumberOfUnreadNotificationCount: () => { },
    setTotalNotifications: () => { },
    getNextUnreadNotifications: (skipItem: number) => Promise.resolve([]),
    updateNotification: (payload: Partial<notification>, notificationID: number) => Promise.resolve({}),
    userTotalBalance: 0,
    setUserTotalBalance: () => { },
    setAccountLocked: () => { },
    setLockExpiry: () => { },
    accountLocked: false,
    lockExpiry: null
})

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children,
    getAllNotifications, getNextUnreadNotifications,
    totalNotificationCount, totalUnreadNotificationCount,
    updateNotification, isAccountLocked, lockedAccountExpiresAt
}) => {
    const [totalNumberOfNotificationCount, setTotalNumberOfNotificationCount] = useState<number>(0)
    const [totalNumberOfUnreadNotificationCount, setTotalNumberOfUnreadNotificationCount] = useState<number>(0)
    const [totalNotifications, setTotalNotifications] = useState<notification[]>([])
    const [userTotalBalance, setUserTotalBalance] = useState<number>(0)
    const [accountLocked, setAccountLocked] = useState(isAccountLocked)
    const [lockExpiry, setLockExpiry] = useState<Date | null>(lockedAccountExpiresAt)
    const session = useSession()

    console.log(session);
    console.log("-------------->", totalNumberOfUnreadNotificationCount, totalNumberOfNotificationCount,);

    useEffect(() => {
        console.log("SESSION ===>", session);
        // if (window !== undefined) {
        //     const accountStatus = localStorage.getItem("account_status")
        //     if (accountStatus) {
        //         const parsedData = JSON.parse(accountStatus)
        //         setLockExpiry(parsedData.lockedAccountExpiresAt)
        //         setAccountLocked(parsedData.isAccountLocked)
        //     }
        // }
        if (
            session.status === "authenticated" &&
            ((session.data.user?.isTwoFAActive && session.data.user.isOtpVerified && session?.data?.user?.preference?.notification_status)
                ||
                (session?.data?.user?.isTwoFAActive && session.data.user.isMasterKeyActivated &&
                    session.data.user.isMasterKeyVerified && session?.data?.user?.preference?.notification_status))
            ||
            !session.data?.user?.isTwoFAActive && !session?.data?.user?.isMasterKeyActivated && session.data?.user?.isVerified && session?.data?.user?.preference?.notification_status
        ) {
            (async () => {
                try {
                    console.log("fethcing1");
                    getAllNotifications().then(res => {
                        console.log(res);
                        setTotalNotifications(res)
                    })
                    totalNotificationCount().then(res => setTotalNumberOfNotificationCount(res))
                    totalUnreadNotificationCount().then(res => setTotalNumberOfUnreadNotificationCount(res))
                    console.log("fethcing2");
                } catch (error) {
                    console.log("getAllUnreadNotifications ===>", error)
                }
            })()
            // console.log("call from herer");
            SignallingManager.isConnected = true
            SignallingManager.getInstance(session.data).init(setTotalNotifications, setTotalNumberOfUnreadNotificationCount, setUserTotalBalance)
            console.log("BALACCNE ===>", session.data.user.total_balance);
            setUserTotalBalance(session.data.user.total_balance!)
            
        }
    }, [session.status, session.data])

    return (
        <AppStateContext.Provider value={{
            totalNotifications, setTotalNumberOfUnreadNotificationCount, setTotalNotifications,
            totalNumberOfUnreadNotificationCount, getNextUnreadNotifications, totalNumberOfNotificationCount, updateNotification,
            setUserTotalBalance, userTotalBalance, setAccountLocked, setLockExpiry, accountLocked, lockExpiry
        }}>
            {children}
        </AppStateContext.Provider>
    )
}

export const useAppState = () => useContext(AppStateContext)