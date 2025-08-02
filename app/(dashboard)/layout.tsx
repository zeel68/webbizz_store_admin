import { StoreAdminHeader } from '@/components/dashboard/header'
import { StoreAdminSidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from 'lucide-react'
import React from 'react'

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100/50">
                <StoreAdminSidebar />
                <div className="flex-1 flex flex-col">
                    <StoreAdminHeader />
                    <main className="flex-1 p-6 overflow-auto">{children}</main>
                </div>
            </div>
            <Toaster />
        </SidebarProvider>
    )
}
