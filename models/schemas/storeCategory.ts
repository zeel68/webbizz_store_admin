export interface FilterOption {
  name: string
  type: "text" | "number" | "range" | "select" | "multiselect" | "boolean"
  options?: string[]
  is_required: boolean
}

export interface AttributeOption {
  name: string
  type: string
  is_required: boolean
  default_value?: string
}

export interface StoreCategoryConfig {
  filters: FilterOption[]
  attributes: AttributeOption[]
}

export interface StoreCategory {
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
  category_details?: Category
  store_details?: Store
  products_count?: number
}

export interface StoreCategoryFormData {
  category_id: string
  is_primary?: boolean
  img_url?: string
  display_name: string
  description?: string
  sort_order?: number
  is_active: boolean
  config?: StoreCategoryConfig
}

import type { Category } from "./store"
import type { Store } from "./store"
