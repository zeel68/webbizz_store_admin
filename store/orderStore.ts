// stores/OrderStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import ApiClient from "@/lib/apiCalling";
import { getSession } from "next-auth/react";

interface OrderState {
  ordersInfo: iOrdersInfo | null;
  loading: boolean;
  error: string | null;

  fetchOrders: (query: any) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: string,
    trackingNumber?: string
  ) => Promise<void>;
  fetchOrder: (orderId: string) => Promise<void>;
  clearError: () => void;
}
const session = await getSession();
const apiClient = new ApiClient({
  headers: {
    Authorization: `Bearer ${session?.user.accessToken}`,
  },
});
export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      ordersInfo: null,
      loading: false,
      error: null,

      // Fetch Orders
      fetchOrders: async (query: any) => {
        set({ loading: true, error: null });
        try {


          const searchParams = new URLSearchParams();
          Object.entries(query).forEach(([key, value]) => {
            if (value && value !== "all") {
              searchParams.append(key, value.toString());
            }
          });

          const response = await apiClient.get(
            `/store-admin/orders?${searchParams.toString()}`
          ) as ApiResponse<any>;

          if (response.success) {
            const data = response.data.data || response.data;
            set({
              ordersInfo: data,
              loading: false,
            });
          } else {
            set({
              error: response.error || "Failed to fetch orders",
              loading: false,
            });
          }
        } catch (error: any) {
          console.error("Orders fetch error:", error);
          set({
            error: error.message || "Failed to fetch orders",
            loading: false,
          });
        }
      },

      // Update Order Status
      updateOrderStatus: async (
        orderId: string,
        status: string,
        trackingNumber?: string
      ) => {
        set({ loading: true, error: null });
        try {


          const response = await apiClient.put(
            `/store-admin/orders/${orderId}/status`,
            {
              status,
              tracking_number: trackingNumber,
            }
          ) as ApiResponse<any>;

          if (response.success) {
            const state = get();
            if (state.ordersInfo) {
              set({
                ordersInfo: {
                  ...state.ordersInfo,
                  orders: state.ordersInfo.orders.map((o) =>
                    o.id === orderId
                      ? { ...o, status, tracking_number: trackingNumber }
                      : o
                  ),
                },
                loading: false,
              });
            }
          } else {
            set({
              error: response.error || "Failed to update order",
              loading: false,
            });
            throw new Error(response.error || "Failed to update order");
          }
        } catch (error: any) {
          console.error("Order status update error:", error);
          set({
            error: error.message || "Failed to update order",
            loading: false,
          });
          throw error;
        }
      },
      fetchOrder: async (orderId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.get(
            `/store-admin/orders/${orderId}`
          ) as ApiResponse<any>;

          if (response.success) {
            return response.data;
          } else {
            set({ error: response.error || "Failed to fetch order", loading: false });
            throw new Error(response.error || "Failed to fetch order");
          }
        } catch (error: any) {
          console.error("Order fetch error:", error);
          set({
            error: error.message || "Failed to fetch order",
            loading: false,
          });
          throw error;
        }
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: "order-store",
      partialize: (state) => ({
        ordersInfo: state.ordersInfo,
      }),
    }
  )
);
