// stores/categoryStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { iCategory, ParentCategory } from "@/models/store.model";

import ApiClient from "@/lib/apiCalling";
import { getSession } from "next-auth/react";

export const fetchStoreCategories = async () => {
  const session = await getSession();
  const apiClient = new ApiClient({
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });
  return apiClient.get("/store-admin/getStoreCategories");
};

export const fetchParentCategory = async () => {
  const session = await getSession();
  const apiClient = new ApiClient({
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });
  return apiClient.get("/store-admin/category");
};

export const createCategory = async (categoryData: any) => {
  const session = await getSession();
  const apiClient = new ApiClient({
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });
  return apiClient.post("/store-admin/category", categoryData);
};

export const updateCategory = async (id: string, categoryData: any) => {
  const session = await getSession();
  const apiClient = new ApiClient({
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });
  return apiClient.put(`/store-admin/category/${id}`, categoryData);
};

export const deleteCategory = async (id: string) => {
  const session = await getSession();
  const apiClient = new ApiClient({
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });
  return apiClient.delete(`/store-admin/category/${id}`);
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CategoryState {
  categories: iCategory[];
  parentCategory: ParentCategory | null;
  loading: boolean;
  error: string | null;
  lastFetch: number;

  fetchCategories: () => Promise<void>;
  fetchParentCategory: () => Promise<void>;
  createCategory: (categoryData: any) => Promise<iCategory>;
  updateCategory: (id: string, categoryData: any) => Promise<iCategory>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    persist(
      (set, get) => ({
        categories: [],
        parentCategory: null,
        loading: false,
        error: null,
        lastFetch: 0,

        fetchCategories: async () => {
          // Skip fetch if cache is still valid
          if (
            Date.now() - get().lastFetch < CACHE_DURATION &&
            get().categories.length > 0
          ) {
            return;
          }

          set({ loading: true, error: null });
          try {
            const response = await fetchStoreCategories();
            if (response.success) {
              set({
                categories: response.data.data || response.data,
                loading: false,
                lastFetch: Date.now(),
              });
            } else {
              set({
                error: response.error?.message || "Failed to fetch categories",
                loading: false,
              });
            }
          } catch (error: any) {
            set({
              error: error.message || "Failed to fetch categories",
              loading: false,
            });
          }
        },

        fetchParentCategory: async () => {
          if (get().parentCategory) return;

          set({ loading: true, error: null });
          try {
            const response = await fetchParentCategory();
            if (response.success) {
              set({
                parentCategory: response.data.data || response.data,
                loading: false,
              });
            } else {
              set({
                error:
                  response.error?.message || "Failed to fetch parent category",
                loading: false,
              });
            }
          } catch (error: any) {
            set({
              error: error.message || "Failed to fetch parent category",
              loading: false,
            });
          }
        },

        createCategory: async (categoryData) => {
          set({ loading: true, error: null });
          try {
            const response = await createCategoryApi(categoryData);
            if (response.success) {
              const newCategory = response.data;
              set((state) => ({
                categories: [newCategory, ...state.categories],
                loading: false,
                lastFetch: 0, // Reset cache
              }));
              return newCategory;
            } else {
              throw new Error(
                response.error?.message || "Failed to create category",
              );
            }
          } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
          }
        },

        updateCategory: async (id, categoryData) => {
          set({ loading: true, error: null });

          try {
            const response = await updateCategoryApi(id, categoryData);
            console.log("API Response:", response);

            if (response.success) {
              const updatedCategory = response.data;

              set((state) => {
                const updatedCategories = state.categories.map((c) => {
                  const isMatch = c._id.toString() === id.toString();
                  if (isMatch) {
                    console.log(
                      "Updating category:",
                      c,
                      "→",
                      updatedCategory.data,
                    );
                    return { ...c, ...updatedCategory };
                  }
                  return c;
                });

                console.log("Updated Categories:", updatedCategories);

                return {
                  categories: updatedCategories,
                  loading: false,
                };
              });

              return updatedCategory;
            } else {
              throw new Error(
                response.error?.message || "Failed to update category",
              );
            }
          } catch (error: any) {
            console.error("Update Error:", error);
            set({ error: error.message, loading: false });
            throw error;
          }
        },

        deleteCategory: async (id) => {
          set({ loading: true, error: null });
          try {
            const response = await deleteCategoryApi(id);
            if (response.success) {
              set((state) => ({
                categories: state.categories.filter((c) => c._id !== id),
                loading: false,
              }));
            } else {
              throw new Error(
                response.error?.message || "Failed to delete category",
              );
            }
          } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: "category-store",
        partialize: (state) => ({
          categories: state.categories,
          parentCategory: state.parentCategory,
          lastFetch: state.lastFetch,
        }),
      },
    ),
  ),
);
