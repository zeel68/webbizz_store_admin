// stores/categoryStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";



import ApiClient from "@/lib/apiCalling";
import { getSession } from "next-auth/react";
import { apiClient } from "@/data/Consts";

interface CategoryState {
    categories: iStoreCategory[];
    parentCategory: iCategory | null;
    loading: boolean;
    error: string | null;
    lastFetch: number;

    fetchCategories: (force: boolean) => Promise<void>;
    fetchParentCategory: () => Promise<void>;
    createCategory: (categoryData: iCategoryFormData) => void
    updateCategory: (id: string, categoryData: iCategoryFormData) => void
    deleteCategory: (id: string) => void
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

                fetchCategories: async (force: boolean = false) => {
                    const state = get();

                    if (
                        !force &&

                        get().categories.length > 0
                    ) {
                        return;
                    }

                    set({ loading: true, error: null });
                    try {
                        const response = await apiClient.get(
                            "/store-admin/getStoreCategories",
                        ) as ApiResponse<any>;
                        if (response.success) {
                            const data = response.data.data || response.data;
                            set({
                                categories: data,
                                loading: false,
                                // categoriesCache: { data, timestamp: Date.now() },
                            });
                        } else {
                            set({
                                error:
                                    response.error || "Failed to fetch categories",
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

                },

                // Create Category
                createCategory: async (categoryData: iCategoryFormData) => {
                    set({ loading: true, error: null });
                    try {

                        const response = await apiClient.post(
                            "/store-admin/category",
                            categoryData,
                        ) as ApiResponse<any>;
                        if (response.success) {
                            const state = get();
                            set({
                                categories: [response.data, ...state.categories],
                                loading: false,
                            });
                            return response.data;
                        } else {
                            const errorMsg =
                                response.error || "Failed to create category";
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
                    categoryData: Partial<iCategoryFormData>,
                ) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await apiClient.put(
                            `/store-admin/category/${id}`,
                            categoryData,
                        ) as ApiResponse<any>;
                        if (response.success) {
                            const state = get();
                            set({
                                categories: state.categories.map((c) =>
                                    c._id === id ? { ...c, ...response.data } : c,
                                ),

                                loading: false,

                            });

                            return response.data;
                        } else {
                            const errorMsg =
                                response.error || "Failed to update category";
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
                        ) as ApiResponse<any>;
                        if (response.success) {
                            const state = get();
                            set({
                                categories: state.categories.filter((c) => c._id !== id),
                                loading: false,
                            });

                        } else {
                            const errorMsg =
                                response.error || "Failed to delete category";
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
    ),
);
