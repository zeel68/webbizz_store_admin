import ApiClient from '@/lib/apiCalling'
import { getSession } from 'next-auth/react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'


interface HomepageState {
    // Homepage data
    homepageConfig: iHomepageConfig | null
    loading: boolean
    error: string | null

    // Hero slides
    heroSlides: iHeroSlide[]
    heroSlidesLoading: boolean

    // Trending categories
    trendingCategories: iTrendingCategory[]
    trendingCategoriesLoading: boolean

    // Trending products
    trendingProducts: iTrendingProduct[]
    trendingProductsLoading: boolean

    // Testimonials
    testimonials: iTestimonial[]
    testimonialsLoading: boolean

    // Actions
    fetchHomepageConfig: () => Promise<void>

    // Hero slides actions
    fetchHeroSlides: () => Promise<void>
    createHeroSlide: (slideData: iHeroSlideForm) => Promise<void>
    updateHeroSlide: (id: string, slideData: Partial<iHeroSlideForm>) => Promise<void>
    deleteHeroSlide: (id: string) => Promise<void>

    // Trending categories actions
    fetchTrendingCategories: () => Promise<void>
    addTrendingCategory: (categoryId: string, displayOrder?: number) => Promise<void>
    updateTrendingCategory: (id: string, displayOrder: number) => Promise<void>
    removeTrendingCategory: (id: string) => Promise<void>

    // Trending products actions
    fetchTrendingProducts: () => Promise<void>
    addTrendingProduct: (productId: string, displayOrder?: number) => Promise<void>
    updateTrendingProduct: (id: string, displayOrder: number) => Promise<void>
    removeTrendingProduct: (id: string) => Promise<void>

    // Testimonials actions
    fetchTestimonials: () => Promise<void>
    createTestimonial: (testimonialData: iTestimonialForm) => Promise<void>
    updateTestimonial: (id: string, testimonialData: Partial<iTestimonialForm>) => Promise<void>
    deleteTestimonial: (id: string) => Promise<void>

    clearError: () => void
}

const session = await getSession();
const apiClient = new ApiClient({
    headers: {
        Authorization: `Bearer ${session?.user.accessToken}`,
    },
});

export const useHomepageStore = create<HomepageState>()(
    devtools(
        (set, get) => ({
            // Initial state
            homepageConfig: null,
            loading: false,
            error: null,
            heroSlides: [],
            heroSlidesLoading: false,
            trendingCategories: [],
            trendingCategoriesLoading: false,
            trendingProducts: [],
            trendingProductsLoading: false,
            testimonials: [],
            testimonialsLoading: false,

            // Fetch homepage configuration
            fetchHomepageConfig: async () => {
                set({ loading: true, error: null })
                try {
                    const response = await apiClient.get('/store-admin/homepage/config') as ApiResponse<any>
                    const data = response
                    console.log(response);
                    ;

                    if (data.success) {
                        const config = data.data
                        set({
                            homepageConfig: config,
                            heroSlides: config.heroSlides || [],
                            trendingCategories: config.trendingCategories || [],
                            trendingProducts: config.trendingProducts || [],
                            testimonials: config.testimonials || [],
                            loading: false
                        })
                    } else {
                        set({ error: data.data.message, loading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch homepage config',
                        loading: false
                    })
                }
            },

            // Hero slides actions
            fetchHeroSlides: async () => {
                set({ heroSlidesLoading: true, error: null })
                try {
                    const response = await apiClient.get('/store-admin/homepage/hero') as ApiResponse<any>
                    const data = response.data
                    console.log(response);

                    if (data.success) {
                        set({ heroSlides: data.data, heroSlidesLoading: false })
                    } else {
                        set({ error: data.message, heroSlidesLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch hero slides',
                        heroSlidesLoading: false
                    })
                }
            },

            createHeroSlide: async (slideData: iHeroSlideForm) => {
                set({ heroSlidesLoading: true, error: null })
                try {


                    const response = await apiClient.post('/store-admin/homepage/hero', slideData) as ApiResponse<any>

                    const data = response.data

                    if (data.success) {
                        set(state => ({
                            heroSlides: [...state.heroSlides, data.data],
                            heroSlidesLoading: false
                        }))
                    } else {
                        set({ error: data.message, heroSlidesLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to create hero slide',
                        heroSlidesLoading: false
                    })
                }
            },

            updateHeroSlide: async (id: string, slideData: Partial<iHeroSlideForm>) => {
                set({ heroSlidesLoading: true, error: null })
                try {

                    const response = await apiClient.put(`/store-admin/homepage/hero/${id}`, slideData) as ApiResponse<any>

                    const data = response
                    console.log(response);

                    if (data.success) {
                        set(state => ({
                            heroSlides: state.heroSlides.map(slide =>
                                slide._id === id ? { ...slide, ...data.data } : slide
                            ),
                            heroSlidesLoading: false
                        }))
                    } else {
                        set({ error: data.data.message, heroSlidesLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update hero slide',
                        heroSlidesLoading: false
                    })
                }
            },

            deleteHeroSlide: async (id: string) => {
                set({ heroSlidesLoading: true, error: null })
                try {
                    const response = await apiClient.delete(`/store-admin/homepage/hero-slides/${id}`) as ApiResponse<any>

                    const data = await response.data

                    if (data.success) {
                        set(state => ({
                            heroSlides: state.heroSlides.filter(slide => slide._id !== id),
                            heroSlidesLoading: false
                        }))
                    } else {
                        set({ error: data.message, heroSlidesLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to delete hero slide',
                        heroSlidesLoading: false
                    })
                }
            },

            // Trending categories actions
            fetchTrendingCategories: async () => {
                set({ trendingCategoriesLoading: true, error: null })
                try {
                    const response = await apiClient.get('/store-admin/homepage/trendingCategory') as ApiResponse<any>
                    const data = response.data
                    console.log(response);

                    if (data.success) {
                        set({ trendingCategories: data.data, trendingCategoriesLoading: false })
                    } else {
                        set({ error: data.message, trendingCategoriesLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch trending categories',
                        trendingCategoriesLoading: false
                    })
                }
            },

            addTrendingCategory: async (category: string, displayOrder = 0) => {
                set({ trendingCategoriesLoading: true, error: null })
                console.log(category);

                try {
                    const response = await apiClient.post('/store-admin/homepage/trendingCategory', { category_id: category, display_order: displayOrder }) as ApiResponse<any>
                    console.log(response);

                    const data = response as ApiResponse<any>

                    if (data.success) {
                        // set(state => ({
                        //     trendingCategories: [...state.trendingCategories, data.data],
                        //     trendingCategoriesLoading: false
                        // }))
                        get().fetchTrendingCategories();
                    } else {
                        set({ error: data.data.message, trendingCategoriesLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to add trending category',
                        trendingCategoriesLoading: false
                    })
                }
            },

            updateTrendingCategory: async (id: string, displayOrder: number) => {
                set({ trendingCategoriesLoading: true, error: null })
                try {
                    const response = await fetch('/store-admin/homepage/trendingCategory', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ trending_id: id, display_order: displayOrder })
                    })

                    const data = await response.json()

                    if (data.success) {
                        set(state => ({
                            trendingCategories: state.trendingCategories.map(cat =>
                                cat._id === id ? { ...cat, display_order: displayOrder } : cat
                            ),
                            trendingCategoriesLoading: false
                        }))
                    } else {
                        set({ error: data.message, trendingCategoriesLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update trending category',
                        trendingCategoriesLoading: false
                    })
                }
            },

            removeTrendingCategory: async (id: string) => {
                set({ trendingCategoriesLoading: true, error: null })
                try {
                    const response = await apiClient.delete(`/store-admin/homepage/trendingCategory/${id}`) as ApiResponse<any>

                    const data = response

                    if (data.success) {
                        set(state => ({
                            trendingCategories: state.trendingCategories.filter(cat => cat._id !== id),
                            trendingCategoriesLoading: false
                        }))
                    } else {
                        set({ error: data.data.message, trendingCategoriesLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to remove trending category',
                        trendingCategoriesLoading: false
                    })
                }
            },

            // Trending products actions
            fetchTrendingProducts: async () => {
                set({ trendingProductsLoading: true, error: null })
                try {
                    const response = await apiClient.get('/store-admin/homepage/trendingProducts')
                    const data = response as any
                    console.log("res", response);

                    if (data.success) {
                        set({ trendingProducts: data.data.data, trendingProductsLoading: false })
                    } else {
                        set({ error: data.message, trendingProductsLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch trending products',
                        trendingProductsLoading: false
                    })
                }
            },

            addTrendingProduct: async (productId: string, displayOrder = 0) => {
                set({ trendingProductsLoading: true, error: null })
                try {
                    const response = await apiClient.post('/store-admin/homepage/trendingProducts', {
                        product_id: productId, display_order: displayOrder
                    })

                    const data = response.data as any
                    console.log(response);

                    if (data.success) {
                        // get().fetchTrendingProducts()
                    } else {
                        set({ error: data.message, trendingProductsLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to add trending product',
                        trendingProductsLoading: false
                    })
                }
            },

            updateTrendingProduct: async (id: string, displayOrder: number) => {
                set({ trendingProductsLoading: true, error: null })
                try {
                    const response = await fetch(`/store-admin/homepage/trendingProducts/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ display_order: displayOrder })
                    })

                    const data = await response.json()

                    if (data.success) {
                        set(state => ({
                            trendingProducts: state.trendingProducts.map(prod =>
                                prod._id === id ? { ...prod, display_order: displayOrder } : prod
                            ),
                            trendingProductsLoading: false
                        }))
                    } else {
                        set({ error: data.message, trendingProductsLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update trending product',
                        trendingProductsLoading: false
                    })
                }
            },

            removeTrendingProduct: async (id: string) => {
                set({ trendingProductsLoading: true, error: null })
                try {
                    const response = await fetch(`/store-admin/homepage/trending-products/${id}`, {
                        method: 'DELETE'
                    })

                    const data = await response.json()

                    if (data.success) {
                        set(state => ({
                            trendingProducts: state.trendingProducts.filter(prod => prod._id !== id),
                            trendingProductsLoading: false
                        }))
                    } else {
                        set({ error: data.message, trendingProductsLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to remove trending product',
                        trendingProductsLoading: false
                    })
                }
            },

            // Testimonials actions
            fetchTestimonials: async () => {
                set({ testimonialsLoading: true, error: null })
                try {
                    const response = await fetch('/store-admin/homepage/testimonials')
                    const data = await response.json()

                    if (data.success) {
                        set({ testimonials: data.data, testimonialsLoading: false })
                    } else {
                        set({ error: data.message, testimonialsLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch testimonials',
                        testimonialsLoading: false
                    })
                }
            },

            createTestimonial: async (testimonialData: iTestimonialForm) => {
                set({ testimonialsLoading: true, error: null })
                try {
                    const formData = new FormData()

                    formData.append('name', testimonialData.name)
                    formData.append('message', testimonialData.message)
                    if (testimonialData.photo) {
                        formData.append('photo', testimonialData.photo)
                    }

                    const response = await fetch('/store-admin/homepage/testimonials', {
                        method: 'POST',
                        body: formData
                    })

                    const data = await response.json()

                    if (data.success) {
                        set(state => ({
                            testimonials: [...state.testimonials, data.data],
                            testimonialsLoading: false
                        }))
                    } else {
                        set({ error: data.message, testimonialsLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to create testimonial',
                        testimonialsLoading: false
                    })
                }
            },

            updateTestimonial: async (id: string, testimonialData: Partial<iTestimonialForm>) => {
                set({ testimonialsLoading: true, error: null })
                try {
                    const formData = new FormData()

                    if (testimonialData.name) formData.append('name', testimonialData.name)
                    if (testimonialData.message) formData.append('message', testimonialData.message)
                    if (testimonialData.photo) formData.append('photo', testimonialData.photo)

                    const response = await fetch(`/store-admin/homepage/testimonials/${id}`, {
                        method: 'PUT',
                        body: formData
                    })

                    const data = await response.json()

                    if (data.success) {
                        set(state => ({
                            testimonials: state.testimonials.map(testimonial =>
                                testimonial._id === id ? { ...testimonial, ...data.data } : testimonial
                            ),
                            testimonialsLoading: false
                        }))
                    } else {
                        set({ error: data.message, testimonialsLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update testimonial',
                        testimonialsLoading: false
                    })
                }
            },

            deleteTestimonial: async (id: string) => {
                set({ testimonialsLoading: true, error: null })
                try {
                    const response = await fetch(`/store-admin/homepage/testimonials/${id}`, {
                        method: 'DELETE'
                    })

                    const data = await response.json()

                    if (data.success) {
                        set(state => ({
                            testimonials: state.testimonials.filter(testimonial => testimonial._id !== id),
                            testimonialsLoading: false
                        }))
                    } else {
                        set({ error: data.message, testimonialsLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to delete testimonial',
                        testimonialsLoading: false
                    })
                }
            },

            clearError: () => set({ error: null })
        }),
        { name: 'homepage-store' }
    )
)
