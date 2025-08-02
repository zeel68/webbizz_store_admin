import React from 'react'
import { ThemeProvider } from './theme-provider'
import { SessionProvider } from 'next-auth/react'

interface BizzProviderProps {
    children: React.ReactNode
}
export default function BizzProvider({ children }: BizzProviderProps) {
    return (
        <SessionProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}
