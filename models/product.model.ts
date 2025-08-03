interface iProductInfo {
    products: iProduct[]
    pagination: iPagination
}
interface iProduct {
    id: string
    name: string
    description: string
    price: number
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
    }>
    is_active: boolean
    is_featured: boolean
    visibility: "public" | "private" | "hidden"
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
    }>
    is_active: boolean
    is_featured: boolean
    visibility: "public" | "private" | "hidden"
}

