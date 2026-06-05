import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BadgeCheck, Calendar, MapPin, Phone, MessageCircle, ChevronLeft, Mail, ShieldCheck, ShieldOff } from 'lucide-react'
import { CarCard } from '../../components/ui/CarCard'
import { listingsService, usersService } from '../../services/api'
import type { Listing } from '../../types/api'

interface PublicUser {
  id: string
  name: string
  email?: string | null
  avatar_url?: string | null
  bio?: string | null
  city?: string | null
  state?: string | null
  phone?: string | null
  is_verified: boolean
  created_at: string
}

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>()
  const [seller, setSeller] = useState<PublicUser | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [listingsLoading, setListingsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    usersService.getById(id)
      .then(r => setSeller((r.data as any).data ?? r.data))
      .catch(() => setSeller(null))
      .finally(() => setLoading(false))

    listingsService.getByUser(id)
      .then(r => {
        const raw = r.data as any
        const data = raw?.data?.data ?? raw?.data ?? []
        setListings(Array.isArray(data) ? data.filter((l: Listing) => l.status === 'ATIVO') : [])
      })
      .catch(() => setListings([]))
      .finally(() => setListingsLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#1e2040]" />
            <div className="space-y-2">
              <div className="h-5 bg-[#1e2040] rounded w-40" />
              <div className="h-3 bg-[#1e2040] rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20 text-center">
        <p className="text-white/60">Vendedor não encontrado.</p>
        <Link to="/anuncios" className="mt-4 inline-block text-sm text-[#00e5cc] hover:underline">
          Ver anúncios
        </Link>
      </div>
    )
  }

  const whatsappUrl = seller.phone
    ? `https://wa.me/55${seller.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Encontrei seu perfil no AutoFácil e gostaria de saber mais sobre seus anúncios.')}`
    : undefined

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
      <Link
        to={-1 as any}
        className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-[#e8e8f4] transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        Voltar
      </Link>

      {/* Seller card */}
      <div className="rounded-2xl border border-[#1e2040] bg-[#000000] p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-[#1e2040] flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#1e2040]">
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt={seller.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white/50">
                {seller.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-xl font-bold text-[#e8e8f4]">{seller.name}</h1>
            </div>

            {seller.bio && (
              <p className="text-sm text-white/60 mb-4 max-w-lg">{seller.bio}</p>
            )}

            <div className="flex flex-col gap-2 text-sm">
              {seller.email && (
                <span className="flex items-center gap-2 text-white/60">
                  <Mail size={14} className="text-white/40 shrink-0" />
                  {seller.email}
                </span>
              )}
              {(seller.city || seller.state) && (
                <span className="flex items-center gap-2 text-white/60">
                  <MapPin size={14} className="text-white/40 shrink-0" />
                  {[seller.city, seller.state].filter(Boolean).join(', ')}
                </span>
              )}
              <span className="flex items-center gap-2 text-white/60">
                <Calendar size={14} className="text-white/40 shrink-0" />
                Membro desde {new Date(seller.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                {seller.is_verified ? (
                  <>
                    <ShieldCheck size={14} className="text-[#00e5cc] shrink-0" />
                    <span className="text-[#00e5cc] text-sm">Conta verificada</span>
                  </>
                ) : (
                  <>
                    <ShieldOff size={14} className="text-white/30 shrink-0" />
                    <span className="text-white/40 text-sm">Não verificado</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2 shrink-0">
            {seller.phone && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#00e5cc] text-[#07080e] text-sm font-semibold rounded-xl hover:bg-[#00c8b4] transition-colors"
              >
                <MessageCircle size={15} />
                Entrar em contato
              </a>
            )}
            {seller.phone && (
              <a
                href={`tel:+55${seller.phone.replace(/\D/g, '')}`}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#1e2040] text-sm text-white/60 rounded-xl hover:border-[#2e3060] hover:text-[#e8e8f4] transition-colors"
              >
                <Phone size={15} />
                {seller.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div>
        <h2 className="text-base font-semibold text-[#e8e8f4] mb-4">
          Anúncios ativos
          {!listingsLoading && (
            <span className="ml-2 text-sm font-normal text-white/40">({listings.length})</span>
          )}
        </h2>

        {listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(k => (
              <div key={k} className="rounded-2xl bg-[#000000] border border-[#1e2040] animate-pulse">
                <div className="aspect-video bg-[#1e2040] rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#1e2040] rounded w-1/3" />
                  <div className="h-4 bg-[#1e2040] rounded w-2/3" />
                  <div className="h-5 bg-[#1e2040] rounded w-1/2 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[#1e2040] rounded-2xl text-center">
            <span className="text-4xl mb-3 opacity-20">🚗</span>
            <p className="text-white/50 text-sm">Nenhum anúncio ativo no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(listing => (
              <CarCard key={listing.id} listing={listing} featured={listing.featured} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
