import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@repo/ui/Toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FraudShield - Advanced Fraud Detection & Prevention",
  description: "Protect your business from fraud with AI-powered detection and prevention",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}