interface iProductInfo {
    products: iProduct[]
    pagination: iPagination
}

interface iProduct {
    reviews: []
    ratings: any
    _id: string
    name: string
    description: string
    price: number
    images: string[]
    compare_price?: number
    cost_price?: number
    category?: iStoreCategory
    store_category_id: string
    brand?: string
    sku?: string

    stock: {
        quantity: number
        track_inventory: boolean
        low_stock_threshold: number
        allow_backorder: boolean
        reserved?: number
    }
    attributes: Record<string, any>
    specifications: Record<string, any>
    discount_price: number
    tags: string[]
    seo: {
        title: string
        description: string
        keywords: string[]
    }
    shipping: {
        weight?: number
        dimensions?: {
            length: number
            width: number
            height: number
        }
    }
    variants: Array<{
        id?: string
        name: string
        options: string[]
        price_modifier?: number
        stock_quantity?: number
        sku?: string
        images?: string[]
    }>
    is_active: boolean
    is_featured: boolean
    visibility: "public" | "private" | "hidden"
    createdAt?: string
    updatedAt?: string
}

interface iProductFormData {
    name: string
    description: string
    price: number
    compare_price?: number
    cost_price?: number
    store_category_id: string
    brand?: string
    sku?: string
    stock: {
        quantity: number
        track_inventory: boolean
        low_stock_threshold: number
        allow_backorder: boolean
    }
    attributes: Record<string, any>
    specifications: Record<string, any>
    tags: string[]
    seo: {
        title: string
        description: string
        keywords: string[]
    }
    shipping: {
        weight?: number
        dimensions?: {
            length: number
            width: number
            height: number
        }
    }
    variants: Array<{
        name: string
        options: string[]
        price_modifier?: number
        stock_quantity?: number
        sku?: string
    }>
    is_active: boolean
    is_featured: boolean
    visibility: "public" | "private" | "hidden"
}

interface iProductVariant {
    id?: string
    name: string
    options: string[]
    price_modifier: number
    stock_quantity: number
    sku?: string
    images?: string[]
}

interface iProductFilters {
    page?: number
    search?: string
    category?: string
    status?: string
    stock_level?: string
    price_min?: string
    price_max?: string
    date_from?: string
    date_to?: string
    sort?: string
    order?: string
    limit?: number
    parent_category?: string
}

interface iProductStats {
    total_products: number
    active_products: number
    low_stock_products: number
    out_of_stock_products: number
    total_value: number
    avg_price: number
}

