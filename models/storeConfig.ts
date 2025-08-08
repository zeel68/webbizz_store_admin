interface iStoreConfig {
    _id?: string
    name: string
    description?: string
    logo_url?: string
    banner_url?: string
    contact_info: {
        website: string
        email: string
        phone: string
        address: string
    }
    address: {
        street: string
        city: string
        state: string
        country: string
        postal_code: string
    }
    business_hours: {
        [key: string]: {
            open: string
            close: string
            is_open: boolean
        }
    }
    social_media: {
        facebook?: string
        twitter?: string
        instagram?: string
        linkedin?: string
        youtube?: string
    }
    seo_settings: {
        keywords: never[]
        meta_title?: string
        meta_description?: string
        meta_keywords?: string
        og_image?: string
    }
    payment_methods: {
        [x: string]: any
        stripe?: boolean
        paypal?: boolean
        razorpay?: boolean
        cash_on_delivery?: boolean
    }
    shipping_zones: Array<{
        name: string
        countries: string[]
        shipping_cost: number
        free_shipping_threshold?: number
    }>
    tax_settings: {
        tax_rate: number
        tax_inclusive: boolean
        tax_name: string
    }
    theme_settings: {
        layout: string
        primary_color: string
        secondary_color: string
        font_family: string
        custom_css?: string
    }
    features: {
        reviews_enabled: boolean
        wishlist_enabled: boolean
        compare_enabled: boolean
        multi_currency: boolean
        inventory_tracking: boolean
    }
    attributes: Array<{
        attribute_name: string
        attribute_value: string
    }>
    created_at: string
    updated_at: string
}

interface iStoreTheme {
    primary_color: string
    secondary_color: string
    font_family: string
    custom_css?: string
}

interface iStoreFeatures {
    reviews_enabled: boolean
    wishlist_enabled: boolean
    compare_enabled: boolean
    multi_currency: boolean
    inventory_tracking: boolean
}
