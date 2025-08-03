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
