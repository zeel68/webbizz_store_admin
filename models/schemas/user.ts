export interface User {
  _id: string
  store_id?: string
  name: string
  email: string
  phone_number: string
  password?: string
  email_verified: boolean
  phone_verified: boolean
  last_login?: Date
  role_id: string
  profile_url?: string
  provider: "local" | "google" | "facebook" | "apple"
  provider_id?: string
  address?: string
  is_active: boolean
  cart?: string
  wishlist: Array<{
    product_id: string
    store_id: string
    added_at: Date
  }>
  preferences: {
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    language: string
    currency: string
    timezone: string
  }
  login_attempts: {
    count: number
    last_attempt?: Date
    locked_until?: Date
  }
  two_factor: {
    enabled: boolean
    secret?: string
    backup_codes?: string[]
  }
  created_at: string
  updated_at: string
}

export interface UserFormData {
  name: string
  email: string
  phone_number: string
  password?: string
  role_id: string
  store_id?: string
  address?: string
  profile_url?: string
  is_active: boolean
  preferences?: {
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    language: string
    currency: string
    timezone: string
  }
}
