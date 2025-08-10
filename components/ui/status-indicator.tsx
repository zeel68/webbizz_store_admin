"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, Clock, AlertTriangle, XCircle, Loader2, Pause, Play, Wifi, WifiOff } from "lucide-react"

interface StatusIndicatorProps {
  status:
    | "online"
    | "offline"
    | "pending"
    | "success"
    | "error"
    | "warning"
    | "loading"
    | "paused"
    | "active"
    | "inactive"
  label?: string
  description?: string
  showIcon?: boolean
  showPulse?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "dot" | "badge" | "full"
  className?: string
}

const statusConfig = {
  online: {
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: Wifi,
    label: "Online",
  },
  offline: {
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: WifiOff,
    label: "Offline",
  },
  pending: {
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: Clock,
    label: "Pending",
  },
  success: {
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle,
    label: "Success",
  },
  error: {
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: XCircle,
    label: "Error",
  },
  warning: {
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: AlertTriangle,
    label: "Warning",
  },
  loading: {
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Loader2,
    label: "Loading",
  },
  paused: {
    color: "bg-gray-500",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: Pause,
    label: "Paused",
  },
  active: {
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: Play,
    label: "Active",
  },
  inactive: {
    color: "bg-gray-500",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: Pause,
    label: "Inactive",
  },
}

export function StatusIndicator({
  status,
  label,
  description,
  showIcon = true,
  showPulse = false,
  size = "md",
  variant = "full",
  className = "",
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  const displayLabel = label || config.label

  const sizeClasses = {
    sm: {
      dot: "w-2 h-2",
      icon: "w-3 h-3",
      text: "text-xs",
      padding: "px-2 py-1",
    },
    md: {
      dot: "w-3 h-3",
      icon: "w-4 h-4",
      text: "text-sm",
      padding: "px-3 py-1",
    },
    lg: {
      dot: "w-4 h-4",
      icon: "w-5 h-5",
      text: "text-base",
      padding: "px-4 py-2",
    },
  }

  const pulseAnimation = showPulse
    ? {
        scale: [1, 1.2, 1],
        opacity: [1, 0.8, 1],
      }
    : {}

  const renderDot = () => (
    <motion.div
      className={`${config.color} ${sizeClasses[size].dot} rounded-full relative`}
      animate={pulseAnimation}
      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
    >
      {showPulse && (
        <motion.div
          className={`absolute inset-0 ${config.color} rounded-full`}
          animate={{
            scale: [1, 2],
            opacity: [0.7, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      )}
    </motion.div>
  )

  const renderBadge = () => (
    <Badge
      variant="outline"
      className={`${config.textColor} ${config.bgColor} ${config.borderColor} ${sizeClasses[size].padding} ${sizeClasses[size].text}`}
    >
      <div className="flex items-center gap-1">
        {renderDot()}
        {displayLabel}
      </div>
    </Badge>
  )

  const renderFull = () => (
    <div className={`flex items-center gap-2 ${sizeClasses[size].padding} ${className}`}>
      {showIcon && (
        <motion.div
          animate={status === "loading" ? { rotate: 360 } : {}}
          transition={status === "loading" ? { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" } : {}}
        >
          <Icon className={`${sizeClasses[size].icon} ${config.textColor}`} />
        </motion.div>
      )}
      {renderDot()}
      <span className={`${sizeClasses[size].text} font-medium ${config.textColor}`}>{displayLabel}</span>
    </div>
  )

  const renderContent = () => {
    switch (variant) {
      case "dot":
        return renderDot()
      case "badge":
        return renderBadge()
      case "full":
      default:
        return renderFull()
    }
  }

  if (description) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{renderContent()}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return renderContent()
}
