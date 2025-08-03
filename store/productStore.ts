// stores/categoryStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";



import ApiClient from "@/lib/apiCalling";
import { getSession } from "next-auth/react";
import { apiClient } from "@/data/Consts";

interface ProductState {
    productInfo: iProductInfo | null
    loading: boolean;
    error: string | null;
    lastFetch: number;

    fetchProducts: (query: any) => Promise<void>;
    createProduct: (categoryData: iProductFormData) => void
    updateProduct: (id: string, productData: iProductFormData) => void
    deleteProduct: (id: string) => void
    clearError: () => void
}

export const useProductStore = create<ProductState>()(
    persist(
        (set, get) => ({
            productInfo: null,
            loading: false,
            error: null,
            lastFetch: 0,

            fetchProducts: async (query: any) => {
                set({ loading: true, error: null })
                try {

                    const searchParams = new URLSearchParams()
                    Object.entries(query).forEach(([key, value]) => {
                        if (value && value !== "all") {
                            searchParams.append(key, value.toString())
                        }
                    })

                    const response = await apiClient.get(`/store-admin/products?${searchParams.toString()}`) as ApiResponse<any>
                    console.log(response.data.data);

                    if (response.success) {
                        set({
                            productInfo: response.data.data || response.data,
                            loading: false,

                        })
                    } else {
                        set({ error: response.error || "Failed to fetch products", loading: false })
                    }
                } catch (error: any) {
                    set({ error: error.message || "Failed to fetch products", loading: false })
                }
            },
            createProduct: async (productData: any) => {
                set({ loading: true, error: null })
                try {

                    const response = await apiClient.post("/store-admin/products", productData)
                    if (response.success) {
                        // Refresh products list
                        await get().fetchProducts({ page: 1, limit: 20 })
                        set({ loading: false })
                    } else {
                        set({ error: response.error || "Failed to create product", loading: false })
                        throw new Error(response.error?.message || "Failed to create product")
                    }
                } catch (error: any) {
                    set({ error: error.message || "Failed to create product", loading: false })
                    throw error
                }
            },

            // Update Product
            updateProduct: async (id: string, productData: any) => {
                set({ loading: true, error: null })
                console.log("Update Data", productData);

                try {
                    const response = await apiClient.put(`/store-admin/products/${id}`, productData) as ApiResponse<any>

                    if (response.success) {
                        set((state) => {
                            const currentProducts = state.productInfo?.products || []
                            const updatedProducts = currentProducts.map((product) =>
                                product.id === id ? { ...product, ...response.data } : product,
                            )
                            return {
                                productsInfo: {
                                    ...state.productInfo,
                                    products: updatedProducts,
                                },
                                isLoading: false,
                                error: null,
                            }
                        })
                        return response.data
                    } else {
                        const errorMsg = response.error || "Failed to update product"
                        set({ error: errorMsg, loading: false })
                        throw new Error(errorMsg)
                    }
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || error.message || "Failed to update product"
                    set({ error: errorMessage, loading: false })
                    throw new Error(errorMessage)
                }
            },

            // Delete Product
            deleteProduct: async (id: string) => {
                set({ loading: true, error: null })
                try {

                    const response = await apiClient.delete(`/store-admin/products/${id}`) as ApiResponse<any>
                    if (response.success) {
                        set((state) => ({
                            productInfo: {
                                ...state.productInfo,
                                products: state.productInfo?.products.filter((p) => p.id !== id) || [],
                            },
                            loading: false,
                        }))
                    } else {
                        set({ error: response.error || "Failed to delete product", loading: false })
                        throw new Error(response.error || "Failed to delete product")
                    }
                } catch (error: any) {
                    set({ error: error.message || "Failed to delete product", loading: false })
                    throw error
                }
            },


            clearError: () => set({ error: null }),
        }),
        {
            name: "category-store",

        },
    ),
);
