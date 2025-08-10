"use client"

import { useState, useEffect, useCallback } from "react"
// import { useRealtime } from "./use-realtime"
import { useApiClient } from "@/hooks/use-api-client"


interface Notification {
  id: string
  type: "order" | "payment" | "inventory" | "customer" | "system"
  title: string
  message: string
  priority: "low" | "medium" | "high"
  read: boolean
  timestamp: string
  actionUrl?: string
  metadata?: Record<string, any>
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const apiClient = useApiClient()
  // const { subscribe } = useRealtime()

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/notifications")

      if (response.success) {
        setNotifications(response.data as any)
        setUnreadCount(response.data.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [apiClient])

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await apiClient.patch(`/notifications/${notificationId}/read`)

        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (error) {
        console.error("Failed to mark notification as read:", error)
      }
    },
    [apiClient],
  )

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.patch("/notifications/read-all")

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }, [apiClient])

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await apiClient.delete(`/notifications/${notificationId}`)

        setNotifications((prev) => {
          const filtered = prev.filter((n) => n.id !== notificationId)
          const wasUnread = prev.find((n) => n.id === notificationId && !n.read)
          if (wasUnread) {
            setUnreadCount((count) => Math.max(0, count - 1))
          }
          return filtered
        })
      } catch (error) {
        console.error("Failed to delete notification:", error)
      }
    },
    [apiClient],
  )

  const clearAll = useCallback(async () => {
    try {
      await apiClient.delete("/notifications")
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to clear all notifications:", error)
    }
  }, [apiClient])

  // Subscribe to real-time notifications
  // useEffect(() => {
  //   const unsubscribe = subscribe("notification", (notification: Notification) => {
  //     setNotifications((prev) => [notification, ...prev])
  //     if (!notification.read) {
  //       setUnreadCount((prev) => prev + 1)
  //     }
  //   })

  //   return unsubscribe
  // }, [subscribe])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch: fetchNotifications,
  }
}
