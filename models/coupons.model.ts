interface iCouponiInfo {
    coupons:iCoupon[]
    pagination: iPagination
}
interface iCoupon {
  _id: string
  store_id: string
  code: string
  description: string
  type: "percentage" | "fixed" | "free_shipping"
  value: number
  minimum_order_amount?: number
  usage_limit?: number
  usage_count: number
  start_date: string
  end_date?: string
  is_active: boolean
  applicable_products?: string[]
  applicable_categories?: string[]
  created_at: string
  updated_at: string
}

