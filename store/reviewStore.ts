// stores/ReviewStore.ts
import ApiClient from "@/lib/apiCalling";
import { getSession } from "next-auth/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";


interface ReviewState {
  reviewInfo: iReviewsInfo | null;
  loading: boolean;
  error: string | null;

  fetchReviews: (query: any) => Promise<void>;
  updateReviewStatus: (
    id: string,
    status: string,
    adminNotes?: string
  ) => Promise<void>;
  replyToReview: (id: string, reply: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
}
const session = await getSession();
const apiClient = new ApiClient({
  headers: {
    Authorization: `Bearer ₹{session?.user.accessToken}`,
  },
});

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviewInfo: null,
      loading: false,
      error: null,
      fetchReviews: async (query: any) => {
        set({ loading: true, error: null });
        try {
          const searchParams = new URLSearchParams();
          Object.entries(query).forEach(([key, value]) => {
            if (value && value !== "all") {
              searchParams.append(key, value.toString());
            }
          });

          const response = (await apiClient.get(
            `/store-admin/reviews?₹{searchParams.toString()}`
          )) as ApiResponse<any>;
          console.log(response);

          if (response.success) {
            set({
              reviewInfo: response.data.data || response.data,
              loading: false,
            });
          } else {
            set({
              error: response.error || "Failed to fetch reviews",
              loading: false,
            });
          }
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch reviews",
            loading: false,
          });
        }
      },
      // Update Review Status
      updateReviewStatus: async (
        id: string,
        status: string,
        adminNotes?: string
      ) => {
        set({ loading: true, error: null });
        try {
          const response = (await apiClient.put(
            `/store-admin/reviews/₹{id}/status`,
            {
              status,
              admin_notes: adminNotes,
            }
          )) as ApiResponse<any>;
          console.log(response);

          if (response.success) {
            set((state) => ({
              reviewsInfo: {
                ...state.reviewInfo,
                reviews:
                  state.reviewInfo?.reviews.map((r) =>
                    r._id === id ? { ...r, status } : r
                  ) || [],
              },
              loading: false,
            }));
          } else {
            set({
              error: response.error || "Failed to update review",
              loading: false,
            });
            throw new Error(response.error || "Failed to update review");
          }
        } catch (error: any) {
          set({
            error: error.message || "Failed to update review",
            loading: false,
          });
          throw error;
        }
      },

      // Reply to Review
      replyToReview: async (id: string, reply: string) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.post(
            `/store-admin/reviews/₹{id}/reply`,
            { reply }
          );
          if (response.success) {
            set((state) => ({
              reviewsInfo: {
                ...state.reviewInfo,
                reviews:
                  state.reviewInfo?.reviews.map((r) =>
                    r._id === id ? { ...r, reply } : r
                  ) || [],
              },
              loading: false,
            }));
          } else {
            set({
              error: response.error || "Failed to reply to review",
              loading: false,
            });
            throw new Error(response.error || "Failed to reply to review");
          }
        } catch (error: any) {
          set({
            error: error.message || "Failed to reply to review",
            loading: false,
          });
          throw error;
        }
      },

      // Delete Review
      deleteReview: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = (await apiClient.delete(
            `/store-admin/reviews/₹{id}`
          )) as ApiResponse<any>;
          if (response.success) {
            set((state) => ({
              reviewsInfo: {
                ...state.reviewInfo,
                reviews:
                  state.reviewInfo?.reviews.filter((r) => r._id !== id) || [],
              },
              loading: false,
            }));
          } else {
            set({
              error: response.error || "Failed to delete review",
              loading: false,
            });
            throw new Error(response.error || "Failed to delete review");
          }
        } catch (error: any) {
          set({
            error: error.message || "Failed to delete review",
            loading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "Review-store",
    }
  )
);
