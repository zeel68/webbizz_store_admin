interface iCategory {

}

interface iFilterOption {
    name: string
    type: "text" | "number" | "range" | "select" | "multiselect" | "boolean"
    options?: string[]
    is_required: boolean
}

interface iAttributeOption {
    name: string
    type: string
    is_required: boolean
    default_value?: string
}

interface iStoreCategoryConfig {
    filters: iFilterOption[]
    attributes: iAttributeOption[]
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
    config?: iStoreCategoryConfig
    created_at: string
    updated_at: string
    category_details?: iCategory
    store_details?: Store
    products_count?: number
    subcategories: iStoreCategory[]
    parent_id: string
}

interface iStoreCategoryFormData {
    category_id: string
    is_primary?: boolean
    img_url?: string
    display_name: string
    description?: string
    sort_order?: number
    is_active: boolean
    config?: iStoreCategoryConfig
}

interface iCategoryFormData {
    name: string;
    display_name: string;
    description: string;
    parent_id?: string;
    sort_order: number;
    is_active: boolean;
    is_primary: boolean;
    image_url?: string;
    filters: iFilterOption[];
    attributes: Array<{
        name: string;
        type: string;
        is_required: boolean;
        default_value?: string;
    }>;
}