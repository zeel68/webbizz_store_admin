import { create } from "zustand"
import { devtools } from 'zustand/middleware'


import { getSession } from "next-auth/react"
import ApiClient from "@/lib/apiCalling"

interface ProductState {
    // State
    productInfo: iProductInfo | null
    selectedProduct: iProduct | null
    stats: iProductStats | null
    loading: boolean
    error: string | null

    // Actions
    fetchProducts: (filters?: iProductFilters) => Promise<void>
    fetchProductById: (id: string) => Promise<void>
    createProduct: (data: iProductFormData, images?: File[]) => Promise<void>
    updateProduct: (id: string, data: iProductFormData, images?: File[]) => Promise<void>
    deleteProduct: (id: string) => Promise<void>
    fetchProductStats: () => Promise<void>
    assignProductsToCategory: (prodoductsId: string[], categoryId: string) => Promise<void>
    togglePoductStatus: (productId: string) => Promise<void>
    // Variant actions
    createVariant: (productId: string, variant: Omit<iProductVariant, '_id' | 'product_id'>) => Promise<void>
    updateVariant: (variantId: string, variant: Partial<iProductVariant>) => Promise<void>
    deleteVariant: (variantId: string) => Promise<void>

    // Utility actions
    clearError: () => void
    clearSelectedProduct: () => void
}

const session = await getSession();
const apiClient = new ApiClient({
    headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
    },
});

export const useProductStore = create<ProductState>()(
    devtools(
        (set, get) => ({
            // Initial state
            productInfo: null,
            selectedProduct: null,
            stats: null,
            loading: false,
            error: null,

            // Fetch products with filters
            fetchProducts: async (filters = {}) => {
                set({ loading: true, error: null })
                try {
                    const queryParams = new URLSearchParams()

                    Object.entries(filters).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                            queryParams.append(key, value.toString())
                        }
                    })

                    const response = await apiClient.get<iProductInfo>("/store-admin/products", { params: filters }) as any

                    if (response.success) {
                        set({ productInfo: response.data.data, loading: false })
                    } else {
                        set({ error: response.error || 'Failed to fetch products', loading: false })
                    }
                } catch (error: any) {
                    set({ error: error.message || 'Failed to fetch products', loading: false })
                }
            },

            // Fetch single product by ID
            fetchProductById: async (id: string) => {
                set({ loading: true, error: null })
                try {
                    const response = await apiClient.get<iProduct>(`/store-admin/products/${id}`) as any
                    console.log(response);

                    if (response.success) {
                        set({ selectedProduct: response.data.data, loading: false })
                        console.log(get().selectedProduct);

                    } else {
                        set({ error: response.error || 'Failed to fetch product', loading: false })
                    }
                } catch (error: any) {
                    set({ error: error.message || 'Failed to fetch product', loading: false })
                }
            },

            // Create new product
            createProduct: async (data: iProductFormData) => {
                set({ loading: true, error: null })
                try {

                    console.log(data);

                    const response = await apiClient.post<iProduct>("/store-admin/products", data)
                    console.log(response);

                    if (response.success) {
                        console.log("prod", response);

                        set({ loading: false })
                        // Refresh products list
                        get().fetchProducts()
                    } else {
                        set({ error: response.error?.message || 'Failed to create product', loading: false })
                    }
                } catch (error: any) {
                    set({ error: error.message || 'Failed to create product', loading: false })
                }
            },

            // Update existing product
            updateProduct: async (id: string, data: iProductFormData, images?: File[]) => {
                set({ loading: true, error: null })
                try {


                    const response = await apiClient.put<iProduct>(`/store-admin/products/${id}`, data)
                    console.log("res", response);

                    if (response.success) {
                        set({ loading: false, selectedProduct: response.data })
                        // Refresh products list
                        get().fetchProducts()
                    } else {
                        set({ error: response.error?.message || 'Failed to update product', loading: false })
                    }
                } catch (error: any) {
                    set({ error: error.message || 'Failed to update product', loading: false })
                }
            },

            // Delete product
            deleteProduct: async (id: string) => {
                set({ loading: true, error: null })
                try {
                    const response = await apiClient.delete(`/store-admin/products/${id}`)

                    if (response.success) {
                        set({ loading: false })
                        // Refresh products list
                        get().fetchProducts()
                    } else {
                        set({ error: response.error?.message || 'Failed to delete product', loading: false })
                    }
                } catch (error: any) {
                    set({ error: error.message || 'Failed to delete product', loading: false })
                }
            },

            // Fetch product statistics
            fetchProductStats: async () => {
                try {
                    const response = await apiClient.get<iProductStats>("/store-admin/products/stats") as any

                    if (response.success) {
                        set({ stats: response.data })
                    }
                } catch (error: any) {
                    console.error('Failed to fetch product stats:', error)
                }
            },

            // Create product variant
            createVariant: async (productId: string, variant: Omit<iProductVariant, '_id' | 'product_id'>) => {
                set({ loading: true, error: null })
                try {
                    const response = await apiClient.post<iProductVariant>(`/store-admin/products/${productId}/variants`, variant) as any

                    if (response.success) {
                        set({ loading: false })
                        // Refresh product details
                        get().fetchProductById(productId)
                    } else {
                        set({ error: response.error?.message || 'Failed to create variant', loading: false })
                    }
                } catch (error: any) {
                    set({ error: error.message || 'Failed to create variant', loading: false })
                }
            },

            // Update product variant
            updateVariant: async (variantId: string, variant: Partial<iProductVariant>) => {
                set({ loading: true, error: null })
                try {
                    const response = await apiClient.put<iProductVariant>(`/store-admin/products/variants/${variantId}`, variant) as any

                    if (response.success) {
                        set({ loading: false })
                        // Refresh product details if we have a selected product
                        const { selectedProduct } = get()
                        if (selectedProduct) {
                            get().fetchProductById(selectedProduct._id)
                        }
                    } else {
                        set({ error: response.error?.message || 'Failed to update variant', loading: false })
                    }
                } catch (error: any) {
                    set({ error: error.message || 'Failed to update variant', loading: false })
                }
            },

            // Delete product variant
            deleteVariant: async (variantId: string) => {
                set({ loading: true, error: null })
                try {
                    const response = await apiClient.delete(`/store-admin/products/variants/${variantId}`) as any

                    if (response.success) {
                        set({ loading: false })
                        // Refresh product details if we have a selected product
                        const { selectedProduct } = get()
                        if (selectedProduct) {
                            get().fetchProductById(selectedProduct._id)
                        }
                    } else {
                        set({ error: response.error?.message || 'Failed to delete variant', loading: false })
                    }
                } catch (error: any) {
                    set({ error: error.message || 'Failed to delete variant', loading: false })
                }
            },
            assignProductsToCategory: async (prodouctsId: string[], categoryId: string) => {
                try {
                    set({ loading: true, error: null })
                    const response = await apiClient.post("/store-admin/assignProduct", { product_ids: prodouctsId, category_id: categoryId }) as ApiResponse<any>
                    console.log(response);

                    if (response.success) {
                        set({ loading: false })
                    } else {
                        throw new Error(response.data?.message || "Failed to add product to category")
                    }
                } catch (error: any) {
                    set({ error: error.message || "Failed to add product to category", loading: false })
                    throw error
                }
            },
            togglePoductStatus: async (productId: string) => { },

            // Clear error
            clearError: () => set({ error: null }),

            // Clear selected product
            clearSelectedProduct: () => set({ selectedProduct: null })
        }),
        {
            name: 'product-store'
        }
    )
)
