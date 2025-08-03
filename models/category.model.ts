interface iCategory {

}

interface FilterOption {
    name: string
    type: "text" | "number" | "range" | "select" | "multiselect" | "boolean"
    options?: string[]
    is_required: boolean
}

interface AttributeOption {
    name: string
    type: string
    is_required: boolean
    default_value?: string
}

interface StoreCategoryConfig {
    filters: FilterOption[]
    attributes: AttributeOption[]
}


interface iCategory {
    _id: string
    name: string
    image_url?: string
    tag_schema: string[]
    created_at: string
    updated_at: string
    stores?: Store[]
}
interface iStoreCategory {
    _id: string
    category_id: string
    store_id: string
    is_primary: boolean
    products: string[]
    img_url?: string
    image_url?: string
    display_name: string
    description?: string
    sort_order: number
    is_active: boolean
    config?: StoreCategoryConfig
    created_at: string
    updated_at: string
    category_details?: iCategory
    store_details?: Store
    products_count?: number
    subcategories: iStoreCategory[]
    parent_id: string
}