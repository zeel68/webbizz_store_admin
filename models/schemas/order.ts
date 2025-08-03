// export interface OrderItem {
//   _id?: string
//   product_id: string
//   variant_id?: string
//   quantity: number
//   price: number
//   attributes?: Record<string, any>
//   product_name?: string
//   variant_name?: string
//   image_url?: string
//   product_details?: Product
//   variant_details?: ProductVariant
// }

// export interface ShippingAddress {
//   street: string
//   city: string
//   state: string
//   country: string
//   postal_code: string
//   phone: string
// }

// export interface BillingAddress {
//   street?: string
//   city?: string
//   state?: string
//   country?: string
//   postal_code?: string
// }

// export interface Order {
//   _id: string
//   store_id: string
//   user_id: string | User
//   order_number: string
//   total: number
//   total_amount: number
//   subtotal?: number
//   tax?: number
//   shipping?: number
//   discount?: number
//   status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
//   shipping_address: ShippingAddress
//   billing_address?: BillingAddress
//   items: OrderItem[]
//   payment_status: "pending" | "paid" | "failed" | "refunded"
//   payment_method?: string
//   shipping_method?: string
//   tracking_number?: string
//   notes?: string
//   created_at: string
//   updated_at: string
//   store_details?: Store
//   user_details?: User
//   payment_info?: Payment
//   items_count?: number
// }

// export interface OrderFormData {
//   user_id: string
//   items: Array<{
//     product_id: string
//     variant_id?: string
//     quantity: number
//     price: number
//     attributes?: Record<string, any>
//   }>
//   shipping_address: ShippingAddress
//   billing_address?: BillingAddress
//   shipping_method?: string
//   notes?: string
// }

// import type { Product, ProductVariant } from "./product"
// import type { Store } from "./store"
// import type { User } from "./user"
// import type { Payment } from "./payment"
