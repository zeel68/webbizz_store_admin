"use client"

import type React from "react"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { StoreAdminSidebar } from "@/components/dashboard/sidebar"
import { StoreAdminHeader } from "@/components/dashboard/header"
import { CommandPalette } from "@/components/ui/command-palette"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts"
import { Toaster } from "@/components/ui/toaster"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
    const [showConnectionStatus, setShowConnectionStatus] = useState(false)

    // const { isConnected, connectionStatus } = useRealtime({
    //     onConnect: () => {
    //         setShowConnectionStatus(true)
    //         setTimeout(() => setShowConnectionStatus(false), 3000)
    //     },
    //     onDisconnect: () => {
    //         setShowConnectionStatus(true)
    //     },
    // })

    // Global keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: "k",
            ctrlKey: true,
            action: () => setCommandPaletteOpen(true),
            description: "Open command palette",
        },
        {
            key: "/",
            action: () => setCommandPaletteOpen(true),
            description: "Open command palette",
        },
        {
            key: "Escape",
            action: () => setCommandPaletteOpen(false),
            description: "Close command palette",
        },
    ])

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
                <StoreAdminSidebar />
                <SidebarInset className="flex flex-col flex-1">
                    <StoreAdminHeader />

                    {/* Connection Status */}
                    <AnimatePresence>
                        {showConnectionStatus && (
                            <motion.div
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -50 }}
                                className="fixed top-20 right-4 z-50"
                            >
                                <div className="bg-background border rounded-lg shadow-lg p-3">
                                    {/* <StatusIndicator
                                        status={isConnected ? "online" : "offline"}
                                        label={isConnected ? "Connected" : "Disconnected"}
                                        description={isConnected ? "Real-time updates active" : "Attempting to reconnect..."}
                                        showPulse={!isConnected}
                                        variant="full"
                                    /> */}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Content */}
                    <main className="flex-1 overflow-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="h-full w-full p-10"
                        >
                            {children}
                        </motion.div>
                    </main>
                </SidebarInset>
            </div>

            {/* Global Components */}
            <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
            <Toaster />
        </SidebarProvider>
    )
}
