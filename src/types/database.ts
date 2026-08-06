// Core domain types mirroring the Firestore data model (see firestore.rules for security rules)

export type UserRole = 'super_admin' | 'owner' | 'staff'
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'business'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'
export type RestaurantStatus = 'active' | 'suspended' | 'pending'

export interface LocalizedText {
  ar: string
  en?: string
  [locale: string]: string | undefined
}

export interface AppUser {
  id: string
  full_name: string
  phone?: string | null
  role: UserRole
  avatar_url?: string | null
  created_at: string
}

export interface Restaurant {
  id: string
  owner_id: string | null
  slug: string
  name: string
  description?: string | null
  logo_url?: string | null
  cover_url?: string | null
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  google_maps_url?: string | null
  working_hours: Record<string, { open: string; close: string; closed?: boolean }>
  status: RestaurantStatus
  is_open: boolean
  theme: { primaryColor: string; font: string; mode: 'light' | 'dark' }
  default_language: string
  supported_languages: string[]
  rating: number
  managed_by_admin?: boolean
  client_name?: string
  client_contact?: string
  payment_status?: 'paid' | 'unpaid'
  amount_paid?: number
  payment_note?: string
}

export interface Branch {
  id: string
  restaurant_id: string
  name: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  phone?: string | null
  is_main: boolean
}

export interface Category {
  id: string
  restaurant_id: string
  name: LocalizedText
  icon?: string | null
  sort_order: number
  is_visible: boolean
}

export interface ProductExtra {
  name: string
  price: number
}

export interface Product {
  id: string
  restaurant_id: string
  category_id?: string | null
  name: LocalizedText
  description?: LocalizedText | null
  price: number
  discount_price?: number | null
  calories?: number | null
  ingredients: string[]
  extras: ProductExtra[]
  video_url?: string | null
  is_available: boolean
  is_best_seller: boolean
  is_new: boolean
  is_spicy: boolean
  is_vegetarian: boolean
  sort_order: number
  images?: { id: string; url: string; sort_order: number }[]
}

export interface Offer {
  id: string
  restaurant_id: string
  title: LocalizedText
  description?: LocalizedText | null
  image_url?: string | null
  discount_percent?: number | null
  starts_at?: string | null
  ends_at?: string | null
  is_active: boolean
}

export interface QRCode {
  id: string
  restaurant_id: string
  branch_id?: string | null
  table_id?: string | null
  style: { color: string; shape: 'square' | 'rounded' | 'dots'; logoUrl: string | null }
  scans_count: number
}

export interface Subscription {
  id: string
  restaurant_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  price: number
  starts_at: string
  ends_at?: string | null
}

export interface Plan {
  id: string
  code: SubscriptionPlan
  name: LocalizedText
  price: number
  max_branches: number
  max_products: number
  features: string[]
  is_active: boolean
}

// ============================================================
// Cart & Orders
// ============================================================

export interface OrderItemExtra {
  name: string
  price: number
}

export interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  extras: OrderItemExtra[]
  notes?: string
}

export type OrderType = 'dine_in' | 'pickup' | 'delivery' | 'whatsapp'
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export interface Order {
  id: string
  restaurant_id: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  tax: number
  total: number
  order_type: OrderType
  customer_name?: string
  customer_phone?: string
  table_label?: string
  notes?: string
  status: OrderStatus
  created_at: string
}
