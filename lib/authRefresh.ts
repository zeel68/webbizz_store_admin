"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"
import { signOut } from "next-auth/react"
import { TIMEOUT } from "node:dns"

const REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry
const CHECK_INTERVAL = 60 * 1000 // Check every minute

export function useTokenRefresh() {
    const { data: session, update } = useSession()
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const refreshToken = async () => {
        try {
            if (!session?.user.refreshToken) {
                console.warn("No refresh token available")
                return false
            }

            const response = await fetch("/api/auth/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refreshToken: session.user.refreshToken,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to refresh token")
            }

            const data = await response.json()

            if (data.success) {
                // Update the session with new tokens
                await update({
                    ...session,
                    user: {
                        ...session.user,
                        accessToken: data.data.accessToken,
                        refreshToken: data.data.refreshToken,
                    },
                })
                return true
            } else {
                throw new Error(data.message || "Token refresh failed")
            }
        } catch (error) {
            console.error("Token refresh error:", error)
            // If refresh fails, sign out the user
            await signOut({ callbackUrl: "/login" })
            return false
        }
    }

    const scheduleTokenRefresh = () => {
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current)
        }

        if (!session?.expires) return

        const expiryTime = new Date(session.expires).getTime()
        const currentTime = Date.now()
        const timeUntilRefresh = expiryTime - currentTime - REFRESH_THRESHOLD

        if (timeUntilRefresh > 0) {
            refreshTimeoutRef.current = setTimeout(() => {
                refreshToken()
            }, timeUntilRefresh)
        } else {
            // Token is already close to expiry, refresh immediately
            refreshToken()
        }
    }

    useEffect(() => {
        if (session) {
            scheduleTokenRefresh()
        }

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current)
            }
        }
    }, [session])

    // Periodic check for token expiry
    useEffect(() => {
        const interval = setInterval(() => {
            if (session?.expires) {
                const expiryTime = new Date(session.expires).getTime()
                const currentTime = Date.now()

                if (currentTime >= expiryTime - REFRESH_THRESHOLD) {
                    refreshToken()
                }
            }
        }, CHECK_INTERVAL)

        return () => clearInterval(interval)
    }, [session])

    return { refreshToken }
}
