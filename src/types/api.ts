export type ListingStatus = 'ATIVO' | 'PAUSADO' | 'VENDIDO' | 'EXPIRADO' | 'REMOVIDO'
export type ListingCategory = 'SEDANS' | 'MOTOS' | 'CAMINHOES' | 'VANS' | 'PICKUPS' | 'SUVS' | 'CLASSICOS' | 'OUTROS'
export type VehicleCondition = 'NOVO' | 'SEMINOVO' | 'USADO'
export type FuelType = 'FLEX' | 'GASOLINA' | 'ETANOL' | 'DIESEL' | 'ELETRICO' | 'HIBRIDO'
export type TransmissionType = 'MANUAL' | 'AUTOMATICO' | 'CVT' | 'AUTOMATIZADO'

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
  popular_name?: string | null
  year_model: number
  year_manuf?: number
  color?: string | null
  fuel: FuelType
  transmission: TransmissionType
  km?: number | null
  doors?: number | null
  engine_cc?: number | null
  price: number
  price_negotiable: boolean
  accepts_trade: boolean
  plate?: string | null
  license_plate?: string | null
  fipe_code?: string | null
  bullet_proof?: boolean | null
  auction?: boolean | null
  city: string
  state: string
  cep?: string | null
  views_count: number
  featured: boolean
  featured_until?: string | null
  published_at?: string | null
  expires_at?: string | null
  created_at: string
  updated_at?: string
  listing_images: ListingImage[]
  cover_image?: string
  seller_name?: string
  seller_phone?: string
  seller_rating?: number
  total_count?: number
  security_components?: string[] | null
  comfort_components?: string[] | null
  technology_components?: string[] | null
  mechanic_components?: string[] | null
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
  notification_type?: 'comment' | 'reply'
  parent_body?: string
}

export interface SearchFilters {
  query?: string
  category?: ListingCategory
  state?: string
  city?: string
  condition?: VehicleCondition
  brand?: string
  model?: string
  year?: number
  min_price?: number
  max_price?: number
  min_year?: number
  max_year?: number
  max_km?: number
  fuel?: FuelType
  transmission?: TransmissionType
  doors?: number
  color?: string
  min_engine_cc?: number
  max_engine_cc?: number
  bullet_proof?: boolean
  auction?: boolean
  order_by?: 'recente' | 'menor_preco' | 'maior_preco' | 'relevancia'
  page?: number
  per_page?: number
}
