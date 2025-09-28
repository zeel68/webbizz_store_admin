"use client"

import { useApiClient } from "@/hooks/use-api-client"
import { useState, useEffect, useCallback } from "react"


interface AnalyticsData {
  revenue: {
    total: number
    growth: number
    trend: Array<{ date: string; value: number }>
  }
  orders: {
    total: number
    growth: number
    trend: Array<{ date: string; value: number }>
  }
  customers: {
    total: number
    new: number
    returning: number
    growth: number
  }
  products: {
    total: number
    lowStock: number
    outOfStock: number
    topSelling: Array<{
      id: string
      name: string
      sales: number
      revenue: number
    }>
  }
  conversion: {
    rate: number
    funnel: Array<{
      stage: string
      count: number
      percentage: number
    }>
  }
  geographic: Array<{
    country: string
    revenue: number
    orders: number
  }>
}

interface UseAnalyticsOptions {
  dateRange?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { dateRange = "last_30_days", autoRefresh = false, refreshInterval = 300000 } = options

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const apiClient = useApiClient()

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get(`store-admin/dashboard?range=${dateRange}`)

      if (response.success) {
        // console.log(response.data.data);

        // setData(response.data.data)
        setLastUpdated(new Date())
      } else {
        // throw new Error(response.message || "Failed to fetch analytics")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Analytics fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [apiClient, dateRange])

  const exportData = useCallback(
    async (format: "csv" | "xlsx" | "pdf" = "csv") => {
      try {
        const response = await apiClient.get(`/analytics/export?range=${dateRange}&format=${format}`, {
          responseType: "blob",
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `analytics-${dateRange}.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error("Export error:", err)
        throw err
      }
    },
    [apiClient, dateRange],
  )

  const refetch = useCallback(() => {
    return fetchAnalytics()
  }, [fetchAnalytics])

  // Initial fetch
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchAnalytics, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchAnalytics])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch,
    exportData,
  }
}
