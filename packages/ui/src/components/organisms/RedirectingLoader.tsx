import React from 'react'

export const RedirectingLoader = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full backdrop-filter backdrop-blur flex justify-center items-center">
            <div className="rounded-lg p-8 shadow-lg shadow-foreground/50 flex items-center justify-center bg-purple-100/70">
                <div className="animate-pulse text-2xl text-primary-foreground flex items-center justify-center">
                    <span className="animate-blink">⏳️</span>
                    <p className="text-lg text-slate-800 font-medium">Redirecting you to the login page...</p>
                </div>
            </div>
        </div>
    )
}