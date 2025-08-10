// stores/categoryStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

import ApiClient from "@/lib/apiCalling";
import { getSession } from "next-auth/react";

interface CategoryState {
    categories: any[];
    parentCategory: any | null;
    loading: boolean;
    error: string | null;
    lastFetch: number;

    fetchCategories: (force?: boolean) => Promise<void>;
    fetchParentCategory: () => Promise<void>;
    createCategory: (categoryData: any) => Promise<any>;
    updateCategory: (id: string, categoryData: any) => Promise<any>;
    deleteCategory: (id: string) => Promise<void>;
    toggleCategoryStatus: (id: string, status: boolean) => Promise<void>
    clearError: () => void;
}
const session = await getSession();
const apiClient = new ApiClient({
    headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
    },
});
export const useCategoryStore = create<CategoryState>()(
    persist(
        (set, get) => ({
            categories: [],
            parentCategory: null,
            loading: false,
            error: null,
            lastFetch: 0,

            fetchCategories: async (force: boolean = false) => {
                const state = get();
                const now = Date.now();
                const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

                // // Use cache if not forced and data is fresh
                // if (
                //     !force &&
                //     state.categories.length > 0 &&
                //     (now - state.lastFetch) < CACHE_DURATION
                // ) {
                //     return;
                // }

                set({ loading: true, error: null });

                try {
                    // Create API client without session dependency


                    const response = await apiClient.get(
                        "/store-admin/getStoreCategories",
                    ) as any;


                    if (response.success) {
                        const data = response.data.data || response.data;
                        set({
                            categories: data,
                            loading: false,
                            lastFetch: now,
                        });
                        console.log("cat data", data);

                    } else {
                        set({
                            categories: [],
                            error: response.error || "Failed to fetch categories",
                            loading: false,
                        });
                    }
                } catch (error: any) {
                    console.error("Category fetch error:", error);
                    set({
                        error: error.message || "Failed to fetch categories",
                        loading: false,
                    });
                }
            },

            fetchParentCategory: async () => {
                // Implementation for fetching parent categories if needed
                set({ loading: true, error: null });
                try {
                    // Add parent category fetching logic here if needed
                    set({ loading: false });
                } catch (error: any) {
                    set({
                        error: error.message || "Failed to fetch parent categories",
                        loading: false,
                    });
                }
            },

            // Create Category
            createCategory: async (categoryData: any) => {
                set({ loading: true, error: null });
                try {


                    const response = await apiClient.post(
                        "/store-admin/category",
                        categoryData,
                    ) as any;

                    if (response.success) {
                        const state = get();
                        const newCategory = response.data.data;
                        get().fetchCategories()
                        return newCategory;
                    } else {
                        const errorMsg = response.error || "Failed to create category";
                        set({ error: errorMsg, loading: false });
                        throw new Error(errorMsg);
                    }
                } catch (error: any) {
                    const errorMessage = error.message || "Failed to create category";
                    set({ error: errorMessage, loading: false });
                    throw new Error(errorMessage);
                }
            },

            // Update Category
            updateCategory: async (
                id: string,
                categoryData: any,
            ) => {
                set({ loading: true, error: null });
                try {


                    const response = await apiClient.put(
                        `/store-admin/category/${id}`,
                        categoryData,
                    ) as any;
                    console.log(response);

                    if (response.success) {
                        const state = get();
                        const updatedCategory = response.data.data;
                        set({
                            categories: state.categories.map((c) =>
                                c._id === id ? { ...c, ...updatedCategory } : c,
                            ),
                            loading: false,
                        });
                        return updatedCategory;
                    } else {
                        const errorMsg = response.error || "Failed to update category";
                        set({ error: errorMsg, loading: false });
                        throw new Error(errorMsg);
                    }
                } catch (error: any) {
                    const errorMessage = error.message || "Failed to update category";
                    set({ error: errorMessage, loading: false });
                    throw new Error(errorMessage);
                }
            },

            // Delete Category
            deleteCategory: async (id: string) => {
                set({ loading: true, error: null });
                try {


                    const response = await apiClient.delete(
                        `/store-admin/category/${id}`,
                    ) as any;

                    if (response.success) {

                        get().fetchCategories()
                    } else {
                        const errorMsg = response.error || "Failed to delete category";
                        set({ error: errorMsg, loading: false });
                        throw new Error(errorMsg);
                    }
                } catch (error: any) {
                    const errorMessage = error.message || "Failed to delete category";
                    set({ error: errorMessage, loading: false });
                    throw new Error(errorMessage);
                }
            },
            toggleCategoryStatus: async (id: string, status: boolean) => {
                set({ loading: true, error: null });
                try {


                    const response = await apiClient.post(
                        `/store-admin/category/${id}/status`, { status }
                    ) as any;

                    if (response.success) {

                        get().fetchCategories()
                    } else {
                        const errorMsg = response.error || "Failed to delete category";
                        set({ error: errorMsg, loading: false });
                        throw new Error(errorMsg);
                    }
                } catch (error: any) {
                    const errorMessage = error.message || "Failed to delete category";
                    set({ error: errorMessage, loading: false });
                    throw new Error(errorMessage);
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
);
