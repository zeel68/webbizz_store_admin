interface iStore {
  _id: string
  name: string
  domain: string
  category_id: string
  config: Record<string, any>
  is_active: boolean
  owner_id?: string
  features: Array<{
    feature_name: string
  }>
  attributes: Array<{
    attribute_name: string
    attribute_value: string
  }>
  theme: {
    _id?: string
    primary_color: string
    secondary_color: string
    font_family: string
    custom_css?: string
  }
  created_at: string
  updated_at: string
  category_details?: iCategory
  products_count?: number
  orders_count?: number
  users_count?: number
}



// export interface StoreFormData {
//   name: string
//   domain: string
//   category_id: string
//   config?: Record<string, any>
//   is_active: boolean
//   features?: Array<{
//     feature_name: string
//   }>
//   attributes?: Array<{
//     attribute_name: string
//     attribute_value: string
//   }>
//   theme?: {
//     primary_color: string
//     secondary_color: string
//     font_family: string
//     custom_css?: string
//   }
// }
