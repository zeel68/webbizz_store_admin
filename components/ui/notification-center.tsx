"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings,
  ShoppingCart,
  CreditCard,
  Package,
  Users,
  AlertTriangle,
} from "lucide-react"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { formatRelativeTime } from "@/lib/utils"

export function NotificationCenter() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, clearAll } =
    useNotifications()

  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      order: ShoppingCart,
      payment: CreditCard,
      inventory: Package,
      customer: Users,
      system: Settings,
    }

    const Icon = iconMap[type as keyof typeof iconMap] || AlertTriangle
    return <Icon className="h-4 w-4" />
  }

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === "high") return "text-red-600 bg-red-50"
    if (priority === "medium") return "text-orange-600 bg-orange-50"

    const colorMap = {
      order: "text-blue-600 bg-blue-50",
      payment: "text-green-600 bg-green-50",
      inventory: "text-orange-600 bg-orange-50",
      customer: "text-purple-600 bg-purple-50",
      system: "text-gray-600 bg-gray-50",
    }

    return colorMap[type as keyof typeof colorMap] || "text-gray-600 bg-gray-50"
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id)
                    }
                    if (notification.actionUrl) {
                      window.open(notification.actionUrl, "_blank")
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        {!notification.read && <div className="h-2 w-2 bg-blue-600 rounded-full ml-2" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(new Date(notification.timestamp))}
                        </span>
                        <div className="flex items-center space-x-1">
                          {notification.priority === "high" && (
                            <Badge variant="destructive" className="text-xs px-1 py-0">
                              High
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
