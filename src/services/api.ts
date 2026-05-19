import axios from 'axios'
import type { Comment, Listing, NotificationItem, Organization, SearchFilters, User } from '../types/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3668',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ token: string }>('/auth/login', { email, password }),

  register: (data: {
    name: string
    email: string
    password: string
    cpf: string
    phone: string
  }) => api.post<{ data: User }>('/users', data),
}

function getTokenPayload(): { id: string; email: string } | null {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

export const usersService = {
  getMe: () => {
    const payload = getTokenPayload()
    if (!payload) return Promise.reject(new Error('Token inválido'))
    return api.get<{ data: User }>(`/users/${payload.id}`)
  },
  update: (data: Partial<Omit<User, 'id' | 'created_at' | 'is_verified'>> & { password?: string }) => {
    const payload = getTokenPayload()
    if (!payload) return Promise.reject(new Error('Token inválido'))
    return api.put<{ data: User }>(`/users/${payload.id}`, data)
  },
}

export const listingsService = {
  search: (filters: SearchFilters) =>
    api.get<{ data: Listing[] }>('/listings', { params: filters }),

  getById: (id: string) =>
    api.get<{ data: Listing }>(`/listings/${id}`),

  getFeatured: () =>
    api.get<{ data: Listing[] }>('/listings', {
      params: { featured: true, per_page: 6, order_by: 'recente' },
    }),

  getByUser: (sellerId: string) =>
    api.get<{ data: Listing[] }>(`/listings/user/${sellerId}`),

  create: (data: object) =>
    api.post<{ data: Listing }>('/listings', data),

  update: (id: string, data: object) =>
    api.put<{ data: Listing }>(`/listings/${id}`, data),

  remove: (id: string) =>
    api.delete(`/listings/${id}`),
}

export const listingImagesService = {
  create: (listing_id: string, url: string, position: number) =>
    api.post('/listing-images', { listing_id, url, position }),
}

export const commentsService = {
  getComments: (listingId: string) =>
    api.get<{ data: Comment[] }>(`/listings/${listingId}/comments`),

  addComment: (listingId: string, body: string, parent_id?: string) =>
    api.post<{ data: Comment }>(`/listings/${listingId}/comments`, { body, parent_id }),

  getUnreadCount: () =>
    api.get<{ data: { count: number } }>('/notifications/unread'),

  markAllRead: () =>
    api.post('/notifications/mark-read'),

  getNotifications: (params: {
    page?: number; per_page?: number; from?: string; to?: string; unread_only?: boolean
  }) =>
    api.get<{ data: { notifications: NotificationItem[]; total: number; page: number; pages: number } }>(
      '/notifications', { params }
    ),
}

export const organizationsService = {
  create: (data: {
    name: string; cnpj: string; logo_url?: string
    description?: string; phone?: string; email?: string
    website?: string; city?: string; state?: string; address?: string
  }) => api.post<{ data: Organization }>('/organizations', data),

  getMine: () =>
    api.get<{ data: Organization[] }>('/organizations/mine'),

  update: (id: string, data: Partial<Organization>) =>
    api.put<{ data: Organization }>(`/organizations/${id}`, data),
}

export default api
