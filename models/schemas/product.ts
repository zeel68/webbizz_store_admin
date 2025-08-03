// export interface ProductReview {
//   user: string
//   rating: number
//   comment: string
//   date: string
// }

// export interface ProductAttribute {
//   color?: Array<{
//     colorOption: string
//     isSelected: boolean
//   }>
//   size?: Array<{
//     colorOption: number
//     isSelected: boolean
//   }>
// }

// export interface ProductStock {
//   quantity: number
//   reserved: number
// }

// export interface ProductTag {
//   tagId: string
//   tagName: string
//   tagType: string
//   value: any
//   category: string
// }

// export interface ProductRatings {
//   average: number
//   count: number
// }

// export interface Product {
//   _id: string
//   name: string
//   description?: string
//   price: number
//   discount_price?: number
//   parent_category: string
//   category: string
//   store_id: string
//   reviews: ProductReview[]
//   attributes: ProductAttribute
//   stock: ProductStock
//   images: string[]
//   is_active: boolean
//   is_featured?: boolean
//   tags: ProductTag[]
//   ratings: ProductRatings
//   availableTags?: string[]
//   searchFilters?: Record<string, any>
//   displaySettings?: Record<string, any>
//   created_at: string
//   updated_at: string
// }

// export interface ProductVariant {
//   _id: string
//   product_id: string
//   attributes: Record<string, string>
//   price: number
//   stock: number
//   created_at: string
//   updated_at: string
// }

// export interface ProductFormData {
//   name: string
//   description?: string
//   price: number
//   discount_price?: number
//   parent_category: string
//   category: string
//   attributes?: ProductAttribute
//   stock: {
//     quantity: number
//     reserved?: number
//   }
//   images?: string[]
//   is_active: boolean
//   is_featured?: boolean
//   tags?: ProductTag[]
//   searchFilters?: Record<string, any>
//   displaySettings?: Record<string, any>
// }
