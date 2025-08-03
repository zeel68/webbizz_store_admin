// stores/categoryStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/data/Consts";

interface CouponState {
  couponInfo: iCouponiInfo | null;
  loading: boolean;
  error: string | null;

  fetchCoupons: (query: any) => Promise<void>;
  createCoupon: (couponData: any) => Promise<void>;
  updateCoupon: (id: string, couponData: any) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  duplicateCoupon: (id: string, newCode: string) => Promise<void>;
  deactivateCoupon: (id: string) => void;
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      couponInfo: null,
      loading: false,
      error: null,
      fetchCoupons: async (query: any) => {
        set({ loading: true, error: null });
        try {
          const searchParams = new URLSearchParams();
          Object.entries(query).forEach(([key, value]) => {
            if (value && value !== "all") {
              searchParams.append(key, value.toString());
            }
          });

          const response = (await apiClient.get(
            `/store-admin/coupons?${searchParams.toString()}`
          )) as ApiResponse<any>;
          if (response.success) {
            set({
              couponInfo: response.data.data,
              loading: false,
            });
          } else {
            set({
              error: response.error || "Failed to fetch coupons",
              loading: false,
            });
          }
        } catch (error: any) {
          set({
            error: error || "Failed to fetch coupons",
            loading: false,
          });
        }
      },
      // Create Coupon
      createCoupon: async (couponData: any) => {
        set({ loading: true, error: null });
        try {
          const response = (await apiClient.post(
            "/store-admin/coupons",
            couponData
          )) as ApiResponse<any>;
          if (response.success) {
            // Refresh coupons list
            await get().fetchCoupons({ page: 1, limit: 20 });
            set({ loading: false });
          } else {
            set({
              error: response.error || "Failed to create coupon",
              loading: false,
            });
            throw new Error(response.error || "Failed to create coupon");
          }
        } catch (error: any) {
          set({
            error: error.message || "Failed to create coupon",
            loading: false,
          });
          throw error;
        }
      },

      // Update Coupon
      updateCoupon: async (id: string, couponData: any) => {
        set({ loading: true, error: null });
        try {
          const response = (await apiClient.put(
            `/store-admin/coupons/${id}`,
            couponData
          )) as ApiResponse<any>;
          if (response.success) {
            set((state) => ({
              couponInfo: {
                ...state.couponInfo,
                coupons:
                  state.couponInfo?.coupons.map((c) =>
                    c._id === id ? { ...c, ...response.data } : c
                  ) || [],
              },
              loading: false,
            }));
          } else {
            set({
              error: response.error?.message || "Failed to update coupon",
              loading: false,
            });
            throw new Error(response.error || "Failed to update coupon");
          }
        } catch (error: any) {
          set({
            error: error.message || "Failed to update coupon",
            loading: false,
          });
          throw error;
        }
      },

      // Delete Coupon
      deleteCoupon: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.delete(`/store-admin/coupons/${id}`);
          if (response.success) {
            set((state) => ({
              couponsInfo: {
                ...state.couponInfo,
                coupons:
                  state.couponInfo?.coupons.filter((c) => c._id !== id) || [],
              },
              loading: false,
            }));
          } else {
            set({
              error: response.error?.message || "Failed to delete coupon",
              loading: false,
            });
            throw new Error(
              response.error?.message || "Failed to delete coupon"
            );
          }
        } catch (error: any) {
          set({
            error: error.message || "Failed to delete coupon",
            loading: false,
          });
          throw error;
        }
      },

      // Duplicate Coupon
      duplicateCoupon: async (id: string, newCode: string) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.post(
            `/store-admin/coupons/${id}/duplicate`,
            { new_code: newCode }
          );
          if (response.success) {
            // Refresh coupons list
            await get().fetchCoupons({ page: 1, limit: 20 });
            set({ loading: false });
          } else {
            set({
              error: response.error?.message || "Failed to duplicate coupon",
              loading: false,
            });
            throw new Error(
              response.error?.message || "Failed to duplicate coupon"
            );
          }
        } catch (error: any) {
          set({
            error: error.message || "Failed to duplicate coupon",
            loading: false,
          });
          throw error;
        }
      },

      //Deactivate Coupon
      deactivateCoupon: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.post(
            `/store-admin/coupons/deactivate/${id}`,
            {}
          );
          if (response.success) {
            // Refresh coupons list
            await get().fetchCoupons({ page: 1, limit: 20 });
            set({ loading: false });
          } else {
            set({
              error: response.error?.message || "Failed to deactivate coupon",
              loading: false,
            });
            throw new Error(
              response.error?.message || "Failed to deactivate coupon"
            );
          }
        } catch (error: any) {
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
    }
  )
);
