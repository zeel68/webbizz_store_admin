import React from 'react'
import { ThemeProvider } from './theme-provider'
import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/sonner'

interface BizzProviderProps {
    children: React.ReactNode
}
export default function BizzProvider({ children }: BizzProviderProps) {
    return (
        <SessionProvider>
            <ThemeProvider>

                {children}
                <Toaster />
            </ThemeProvider>
        </SessionProvider>
    )
}
