export type ListingStatus = 'ativo' | 'pausado' | 'vendido' | 'expirado' | 'removido'
export type ListingCategory = 'sedans' | 'motos' | 'caminhoes' | 'vans' | 'pickups' | 'suvs' | 'classicos' | 'outros'
export type VehicleCondition = 'novo' | 'seminovo' | 'usado'
export type FuelType = 'flex' | 'gasolina' | 'etanol' | 'diesel' | 'eletrico' | 'hibrido'
export type TransmissionType = 'manual' | 'automatico' | 'cvt' | 'automatizado'

export interface ListingImage {
  id: string
  url: string
  position: number
}

export interface Organization {
  id: string
  owner_id: string
  name: string
  cnpj: string
  logo_url?: string | null
  description?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  city?: string | null
  state?: string | null
  address?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  seller_id: string
  organization_id?: string | null
  organization?: Pick<Organization, 'id' | 'name' | 'logo_url' | 'city' | 'state'> | null
  title: string
  description?: string
  category: ListingCategory
  condition: VehicleCondition
  status: ListingStatus
  brand: string
  model: string
  year_model: number
  year_manuf?: number
  color?: string
  fuel: FuelType
  transmission: TransmissionType
  km?: number
  doors?: number
  engine_cc?: number
  price: number
  price_negotiable: boolean
  accepts_trade: boolean
  city: string
  state: string
  views_count: number
  featured: boolean
  featured_until?: string
  published_at?: string
  created_at: string
  listing_images: ListingImage[]
  cover_image?: string
  seller_name?: string
  seller_phone?: string
  seller_rating?: number
  total_count?: number
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  city?: string
  state?: string
  avatar_url?: string
  bio?: string
  is_verified: boolean
  created_at: string
}

export interface CommentAuthor {
  id: string
  name: string
  avatar_url?: string | null
}

export interface Comment {
  id: string
  listing_id: string
  author_id: string
  author: CommentAuthor
  body: string
  parent_id: string | null
  is_read: boolean
  created_at: string
  replies: (Comment & { replies: never[] })[]
}

export interface NotificationItem {
  id: string
  listing_id: string
  listing_title: string
  body: string
  author: CommentAuthor
  is_read: boolean
  created_at: string
}

export interface SearchFilters {
  query?: string
  category?: ListingCategory
  state?: string
  condition?: VehicleCondition
  brand?: string
  min_price?: number
  max_price?: number
  min_year?: number
  max_year?: number
  max_km?: number
  fuel?: FuelType
  transmission?: TransmissionType
  order_by?: 'recente' | 'menor_preco' | 'maior_preco' | 'relevancia'
  page?: number
  per_page?: number
}
