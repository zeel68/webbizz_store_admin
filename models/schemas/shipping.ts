// export interface ShippingMethod {
//   _id: string
//   store_id: string
//   name: string
//   description?: string
//   type: "standard" | "express" | "overnight" | "same_day" | "pickup"
//   base_cost: number
//   cost_per_kg?: number
//   cost_per_km?: number
//   free_shipping_threshold?: number
//   estimated_days: {
//     min: number
//     max: number
//   }
//   zones?: string[]
//   is_active: boolean
//   created_at: string
//   updated_at: string
// }

// export interface TrackingEvent {
//   status: string
//   description: string
//   location: string
//   timestamp: string
// }

// export interface ShippingDimensions {
//   length?: number
//   width?: number
//   height?: number
// }

// export interface Shipping {
//   _id: string
//   order_id: string
//   store_id: string
//   shipping_method_id: string
//   tracking_number?: string
//   carrier: string
//   shipping_address: {
//     name: string
//     street: string
//     city: string
//     state: string
//     country: string
//     postal_code: string
//     phone: string
//   }
//   status: "pending" | "processing" | "shipped" | "in_transit" | "delivered" | "returned" | "cancelled"
//   cost: number
//   weight?: number
//   dimensions?: ShippingDimensions
//   tracking_events: TrackingEvent[]
//   shipped_at?: string
//   delivered_at?: string
//   created_at: string
//   updated_at: string
// }

// export interface ShippingMethodFormData {
//   name: string
//   description?: string
//   type: "standard" | "express" | "overnight" | "same_day" | "pickup"
//   base_cost: number
//   cost_per_kg?: number
//   cost_per_km?: number
//   free_shipping_threshold?: number
//   estimated_days: {
//     min: number
//     max: number
//   }
//   zones?: string[]
//   is_active: boolean
// }
