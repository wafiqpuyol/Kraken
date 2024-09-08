'use client'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionProviderProps {
    children: ReactNode
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
    return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}