import { StoreAdminSidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: DashboardLayoutProps) {
    return (
        <div>
            <SidebarProvider>
                <StoreAdminSidebar />
            </SidebarProvider>
            {children}
        </div>
    )
}
