import ApiClient from "@/lib/apiCalling";
import { getSession } from "next-auth/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CouponState {
  couponInfo: iCouponiInfo | null;
  loading: boolean;
  error: string | null;

  fetchCoupons: (query: any) => Promise<void>;
  createCoupon: (couponData: any) => Promise<void>;
  updateCoupon: (id: string, couponData: any) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  duplicateCoupon: (id: string, newCode: string) => Promise<void>;
  deactivateCoupon: (id: string) => Promise<void>;
  clearError: () => void;
}

const createApiClient = async () => {
  const session = await getSession();
  return new ApiClient({
    headers: {
      Authorization: `Bearer ${session?.user?.accessToken || ''}`,
    },
  });
};

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      couponInfo: null,
      loading: false,
      error: null,

      /** Fetch all coupons with query parameters */
      fetchCoupons: async (query: any) => {
        set({ loading: true, error: null });
        try {
          const apiClient = await createApiClient();

          const searchParams = new URLSearchParams();
          Object.entries(query).forEach(([key, value]) => {
            if (value && value !== "all" && value !== "") {
              searchParams.append(key, value.toString());
            }
          });

          const response = await apiClient.get(
            `/store-admin/coupons?${searchParams.toString()}`
          ) as ApiResponse<any>;

          if (response.success) {
            const data = response.data?.data || response.data;
            set({
              couponInfo: data,
              loading: false,
            });
          } else {
            set({
              error: response.data.message || "Failed to fetch coupons",
              loading: false,
            });
          }
        } catch (error: any) {
          console.error("Coupons fetch error:", error);
          set({
            error: error.message || "Failed to fetch coupons",
            loading: false,
          });
        }
      },

      /** Create a new coupon */
      createCoupon: async (couponData: any) => {
        set({ loading: true, error: null });
        try {
          const apiClient = await createApiClient();

          const response = await apiClient.post(
            "/store-admin/coupons",
            couponData
          );

          if (response.success) {
            // Refresh the coupons list
            await get().fetchCoupons({ page: 1, limit: 20 });
            set({ loading: false });
          } else {
            set({
              error: response.error?.message || "Failed to create coupon",
              loading: false,
            });
            throw new Error(response.error?.message || "Failed to create coupon");
          }
        } catch (error: any) {
          console.error("Coupon creation error:", error);
          set({
            error: error.message || "Failed to create coupon",
            loading: false,
          });
          throw error;
        }
      },

      /** Update an existing coupon */
      updateCoupon: async (id: string, couponData: any) => {
        set({ loading: true, error: null });
        try {
          const apiClient = await createApiClient();

          const response = await apiClient.put(
            `/store-admin/coupons/${id}`,
            couponData
          ) as ApiResponse<any>;

          if (response.success) {
            const state = get();
            if (state.couponInfo) {
              const updatedCoupon = response.data?.data || response.data;
              set({
                couponInfo: {
                  ...state.couponInfo,
                  coupons: state.couponInfo.coupons.map((c) =>
                    c._id === id ? { ...c, ...updatedCoupon } : c
                  ),
                },
                loading: false,
              });
            }
          } else {
            set({
              error: response.data.message || "Failed to update coupon",
              loading: false,
            });
            throw new Error(response.data.message || "Failed to update coupon");
          }
        } catch (error: any) {
          console.error("Coupon update error:", error);
          set({
            error: error.message || "Failed to update coupon",
            loading: false,
          });
          throw error;
        }
      },

      /** Delete a coupon */
      deleteCoupon: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const apiClient = await createApiClient();

          const response = await apiClient.delete(`/store-admin/coupons/${id}`);

          if (response.success) {
            const state = get();
            if (state.couponInfo) {
              set({
                couponInfo: {
                  ...state.couponInfo,
                  coupons: state.couponInfo.coupons.filter((c) => c._id !== id),
                },
                loading: false,
              });
            }
          } else {
            set({
              error: response.error?.message || "Failed to delete coupon",
              loading: false,
            });
            throw new Error(response.error?.message || "Failed to delete coupon");
          }
        } catch (error: any) {
          console.error("Coupon deletion error:", error);
          set({
            error: error.message || "Failed to delete coupon",
            loading: false,
          });
          throw error;
        }
      },

      /** Duplicate a coupon */
      duplicateCoupon: async (id: string, newCode: string) => {
        set({ loading: true, error: null });
        try {
          const apiClient = await createApiClient();

          const response = await apiClient.post(
            `/store-admin/coupons/${id}/duplicate`,
            { new_code: newCode }
          );

          if (response.success) {
            await get().fetchCoupons({ page: 1, limit: 20 });
            set({ loading: false });
          } else {
            set({
              error: response.error?.message || "Failed to duplicate coupon",
              loading: false,
            });
            throw new Error(response.error?.message || "Failed to duplicate coupon");
          }
        } catch (error: any) {
          console.error("Coupon duplication error:", error);
          set({
            error: error.message || "Failed to duplicate coupon",
            loading: false,
          });
          throw error;
        }
      },

      /** Deactivate a coupon */
      deactivateCoupon: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const apiClient = await createApiClient();

          const response = await apiClient.post(
            `/store-admin/coupons/deactivate/${id}`,
            {}
          );

          if (response.success) {
            await get().fetchCoupons({ page: 1, limit: 20 });
            set({ loading: false });
          } else {
            set({
              error: response.error?.message || "Failed to deactivate coupon",
              loading: false,
            });
            throw new Error(response.error?.message || "Failed to deactivate coupon");
          }
        } catch (error: any) {
          console.error("Coupon deactivation error:", error);
          set({
            error: error.message || "Failed to deactivate coupon",
            loading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "coupon-store",
      partialize: (state) => ({
        couponInfo: state.couponInfo,
      }),
    }
  )
);
