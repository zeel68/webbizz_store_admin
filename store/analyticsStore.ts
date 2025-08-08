"use client"

import ApiClient from "@/lib/apiCalling"
import { getSession } from "next-auth/react"
import { create } from "zustand"
import { devtools } from "zustand/middleware"


interface iAnalyticsState {
    // Basic Analytics
    dashboardData: iDashboardData | null
    salesAnalytics: iSalesAnalytics | null
    topSellingProducts: iTopSellingProduct[]
    customerAnalytics: iCustomerAnalytics | null
    inventoryAnalytics: iInventoryAnalytics | null

    // Advanced Analytics
    customerBehaviorAnalytics: iCustomerBehaviorAnalytics | null
    productPerformanceAnalytics: iProductPerformanceAnalytics | null
    geographicAnalytics: iGeographicAnalytics | null
    realTimeAnalytics: iRealTimeAnalytics | null
    conversionFunnelAnalytics: iConversionFunnelAnalytics | null

    // Loading states
    loading: boolean
    error: string | null

    // Actions
    fetchDashboardData: () => Promise<void>
    fetchSalesAnalytics: (params?: { period?: string; start?: string; end?: string }) => Promise<void>
    fetchTopSellingProducts: (params?: { limit?: number; period?: string }) => Promise<void>
    fetchCustomerAnalytics: (params?: { period?: string }) => Promise<void>
    fetchInventoryAnalytics: () => Promise<void>

    // Advanced Analytics Actions
    fetchCustomerBehaviorAnalytics: (params?: { period?: string; start?: string; end?: string }) => Promise<void>
    fetchProductPerformanceAnalytics: (params?: { period?: string }) => Promise<void>
    fetchGeographicAnalytics: (params?: { period?: string }) => Promise<void>
    fetchRealTimeAnalytics: () => Promise<void>
    fetchConversionFunnelAnalytics: (params?: { period?: string }) => Promise<void>

    clearError: () => void
}

const session = await getSession();
const apiClient = new ApiClient({
    headers: {
        Authorization: `Bearer ₹{session?.user.accessToken}`,
    },
});
export const useAnalyticsStore = create<iAnalyticsState>()(

    devtools(
        (set, get) => ({
            // Initial state
            dashboardData: null,
            salesAnalytics: null,
            topSellingProducts: [],
            customerAnalytics: null,
            inventoryAnalytics: null,
            customerBehaviorAnalytics: null,
            productPerformanceAnalytics: null,
            geographicAnalytics: null,
            realTimeAnalytics: null,
            conversionFunnelAnalytics: null,
            loading: false,
            error: null,

            // Basic Analytics Actions
            fetchDashboardData: async () => {
                set({ loading: true, error: null })
                try {
                    const response = await apiClient.get("/store-admin/dashboard") as ApiResponse<any>
                    const data = response;
                    console.log(response);

                    if (response.success) {
                        set({ dashboardData: response.data.data })
                    } else {
                        set({ error: data.error || "Failed to fetch dashboard data" })
                    }
                } catch (error) {
                    set({ error: "Network error occurred" })
                } finally {
                    set({ loading: false })
                }
            },

            fetchSalesAnalytics: async (params = {}) => {
                set({ loading: true, error: null })
                try {
                    const queryParams = new URLSearchParams(params as Record<string, string>)
                    const response = await apiClient.get(`/store-admin/analytics/sales?₹{queryParams}`) as ApiResponse<any>
                    const data = response

                    if (data.success) {
                        set({ salesAnalytics: data.data.data })
                    } else {
                        set({ error: data.error || "Failed to fetch sales analytics" })
                    }
                } catch (error) {
                    set({ error: "Network error occurred" })
                } finally {
                    set({ loading: false })
                }
            },

            fetchTopSellingProducts: async (params = {}) => {
                set({ loading: true, error: null })
                try {
                    const queryParams = new URLSearchParams(params as Record<string, string>)
                    const response = await apiClient.get(`/store-admin/analytics/products/top-selling?₹{queryParams}`) as ApiResponse<any>
                    const data = response

                    if (data.success) {
                        set({ topSellingProducts: data.data.data })
                    } else {
                        set({ error: data.error || "Failed to fetch top selling products" })
                    }
                } catch (error) {
                    set({ error: "Network error occurred" })
                } finally {
                    set({ loading: false })
                }
            },

            fetchCustomerAnalytics: async (params = {}) => {
                set({ loading: true, error: null })
                try {
                    const queryParams = new URLSearchParams(params as Record<string, string>)
                    const response = await apiClient.get(`/store-admin/analytics/customers?₹{queryParams}`) as ApiResponse<any>
                    const data = response

                    if (data.success) {
                        set({ customerAnalytics: data.data.data })
                    } else {
                        set({ error: data.error || "Failed to fetch customer analytics" })
                    }
                } catch (error) {
                    set({ error: "Network error occurred" })
                } finally {
                    set({ loading: false })
                }
            },

            fetchInventoryAnalytics: async () => {
                set({ loading: true, error: null })
                try {
                    const response = await apiClient.get("/store-admin/analytics/inventory") as ApiResponse<any>
                    const data = response

                    if (data.success) {
                        set({ inventoryAnalytics: data.data.data })
                    } else {
                        set({ error: data.error || "Failed to fetch inventory analytics" })
                    }
                } catch (error) {
                    set({ error: "Network error occurred" })
                } finally {
                    set({ loading: false })
                }
            },

            // Advanced Analytics Actions
            fetchCustomerBehaviorAnalytics: async (params = {}) => {
                set({ loading: true, error: null })
                try {
                    const queryParams = new URLSearchParams(params as Record<string, string>)
                    const response = await apiClient.get(`/store-admin/analytics/advanced/customer-behavior?₹{queryParams}`) as ApiResponse<any>
                    const data = response

                    if (data.success) {
                        set({ customerBehaviorAnalytics: data.data.data })
                    } else {
                        set({ error: data.error || "Failed to fetch customer behavior analytics" })
                    }
                } catch (error) {
                    set({ error: "Network error occurred" })
                } finally {
                    set({ loading: false })
                }
            },

            fetchProductPerformanceAnalytics: async (params = {}) => {
                set({ loading: true, error: null })
                try {
                    const queryParams = new URLSearchParams(params as Record<string, string>)
                    const response = await apiClient.get(`/store-admin/analytics/advanced/product-performance?₹{queryParams}`) as ApiResponse<any>
                    const data = response

                    if (data.success) {
                        set({ productPerformanceAnalytics: data.data.data })
                    } else {
                        set({ error: data.error || "Failed to fetch product performance analytics" })
                    }
                } catch (error) {
                    set({ error: "Network error occurred" })
                } finally {
                    set({ loading: false })
                }
            },

            fetchGeographicAnalytics: async (params = {}) => {
                set({ loading: true, error: null })
                try {
                    const queryParams = new URLSearchParams(params as Record<string, string>)
                    const response = await apiClient.get(`/store-admin/analytics/advanced/geographic?₹{queryParams}`) as ApiResponse<any>
                    const data = response

                    if (data.success) {
                        set({ geographicAnalytics: data.data.data })
                    } else {
                        set({ error: data.error || "Failed to fetch geographic analytics" })
                    }
                } catch (error) {
                    set({ error: "Network error occurred" })
                } finally {
                    set({ loading: false })
                }
            },

            fetchRealTimeAnalytics: async () => {
                set({ loading: true, error: null })
                try {
                    const response = await apiClient.get("/store-admin/analytics/advanced/real-time") as ApiResponse<any>
                    const data = response

                    if (data.success) {
                        set({ realTimeAnalytics: data.data.data })
                    } else {
                        set({ error: data.error || "Failed to fetch real-time analytics" })
                    }
                } catch (error) {
                    set({ error: "Network error occurred" })
                } finally {
                    set({ loading: false })
                }
            },

            fetchConversionFunnelAnalytics: async (params = {}) => {
                set({ loading: true, error: null })
                try {
                    const queryParams = new URLSearchParams(params as Record<string, string>)
                    const response = await apiClient.get(`/store-admin/analytics/advanced/conversion-funnel?₹{queryParams}`) as ApiResponse<any>
                    const data = response

                    if (data.success) {
                        set({ conversionFunnelAnalytics: data.data.data })
                    } else {
                        set({ error: data.error || "Failed to fetch conversion funnel analytics" })
                    }
                } catch (error) {
                    set({ error: "Network error occurred" })
                } finally {
                    set({ loading: false })
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: "analytics-store",
        }
    )
)
