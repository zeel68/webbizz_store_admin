import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "INR", locale = "en-US"): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "₹0.00"
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatNumber(num: number, locale = "en-US"): string {
  if (typeof num !== "number" || isNaN(num)) {
    return "0"
  }

  return new Intl.NumberFormat(locale).format(num)
}

export function formatPercentage(num: number, decimals = 1, locale = "en-US"): string {
  if (typeof num !== "number" || isNaN(num)) {
    return "0%"
  }

  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100)
}

export function formatRelativeTime(date: string | Date, locale = "en-US"): string {
  try {
    const targetDate = new Date(date)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? "s" : ""} ago`
    } else {
      return targetDate.toLocaleDateString(locale)
    }
  } catch (error) {
    return "Invalid date"
  }
}

export function getInitials(name: string): string {
  if (!name || typeof name !== "string") {
    return "U"
  }

  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function truncateText(text: string, maxLength = 100): string {
  if (!text || typeof text !== "string") {
    return ""
  }

  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength).trim() + "..."
}

export function generateSlug(text: string): string {
  if (!text || typeof text !== "string") {
    return ""
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") {
    return false
  }

  const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function capitalizeFirst(str: string): string {
  if (!str || typeof str !== "string") {
    return ""
  }

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function formatFileSize(bytes: number): string {
  if (typeof bytes !== "number" || bytes === 0) {
    return "0 Bytes"
  }

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false
  }

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: "text-green-600 bg-green-50",
    inactive: "text-red-600 bg-red-50",
    pending: "text-yellow-600 bg-yellow-50",
    completed: "text-blue-600 bg-blue-50",
    cancelled: "text-gray-600 bg-gray-50",
    processing: "text-purple-600 bg-purple-50",
    shipped: "text-indigo-600 bg-indigo-50",
    delivered: "text-green-600 bg-green-50",
    returned: "text-orange-600 bg-orange-50",
    refunded: "text-pink-600 bg-pink-50",
  }

  return statusColors[status?.toLowerCase()] || "text-gray-600 bg-gray-50"
}

export function sortArray<T>(array: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] {
  if (!Array.isArray(array)) {
    return []
  }

  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal === bVal) return 0

    if (direction === "asc") {
      return aVal < bVal ? -1 : 1
    } else {
      return aVal > bVal ? -1 : 1
    }
  })
}

export function filterArray<T>(array: T[], searchTerm: string, searchKeys: (keyof T)[]): T[] {
  if (!Array.isArray(array) || !searchTerm || !searchKeys.length) {
    return array
  }

  const lowercaseSearch = searchTerm.toLowerCase()

  return array.filter((item) =>
    searchKeys.some((key) => {
      const value = item[key]
      if (typeof value === "string") {
        return value.toLowerCase().includes(lowercaseSearch)
      }
      if (typeof value === "number") {
        return value.toString().includes(lowercaseSearch)
      }
      return false
    }),
  )
}
