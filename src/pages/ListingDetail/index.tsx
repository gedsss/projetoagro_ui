import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, BadgeCheck, Calendar, ChevronLeft, ChevronRight,
  DoorOpen, Fuel, Gauge, Heart, MapPin, Settings2, Share2, Star,
} from 'lucide-react'

import { CommentsSection } from '../../components/ui/CommentsSection'
import { listingsService } from '../../services/api'
import type { Listing } from '../../types/api'

const fuelLabel: Record<string, string> = {
  flex: 'Flex', gasolina: 'Gasolina', etanol: 'Etanol',
  diesel: 'Diesel', eletrico: 'Elétrico', hibrido: 'Híbrido',
}

const transmissionLabel: Record<string, string> = {
  manual: 'Manual', automatico: 'Automático', cvt: 'CVT', automatizado: 'Automatizado',
}

const conditionLabel: Record<string, string> = {
  novo: 'Novo', seminovo: 'Seminovo', usado: 'Usado',
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIndex, setImgIndex] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (!id) return
    listingsService.getById(id)
      .then(r => setListing(r.data.data))
      .catch(() => setListing(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-[#1e2040] rounded w-32" />
          <div className="aspect-video bg-[#1e2040] rounded-2xl" />
          <div className="h-8 bg-[#1e2040] rounded w-1/2" />
          <div className="h-10 bg-[#1e2040] rounded w-1/3" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <span className="text-5xl mb-4 opacity-20">🚗</span>
        <p className="text-white/60 mb-6">Anúncio não encontrado.</p>
        <Link to="/anuncios" className="text-[#00e5cc] hover:underline text-sm">
          Voltar aos anúncios
        </Link>
      </div>
    )
  }

  const images = listing.listing_images?.length
    ? listing.listing_images.map(i => i.url)
    : listing.cover_image
    ? [listing.cover_image]
    : []

  const specs = [
    { icon: Gauge, label: 'Quilometragem', value: listing.km != null ? `${listing.km.toLocaleString('pt-BR')} km` : '—' },
    { icon: Calendar, label: 'Ano modelo', value: String(listing.year_model) },
    { icon: Calendar, label: 'Ano fabricação', value: listing.year_manuf ? String(listing.year_manuf) : '—' },
    { icon: Fuel, label: 'Combustível', value: fuelLabel[listing.fuel] },
    { icon: Settings2, label: 'Câmbio', value: transmissionLabel[listing.transmission] },
    { icon: DoorOpen, label: 'Portas', value: listing.doors != null ? String(listing.doors) : '—' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
      <Link
        to="/anuncios"
        className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-[#e8e8f4] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Left column */}
        <div>
          {/* Image gallery */}
          <div className="relative rounded-2xl overflow-hidden bg-[#07080e] aspect-video mb-3">
            {images.length > 0 ? (
              <img
                src={images[imgIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl opacity-10">🚗</span>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 glass rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setImgIndex(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 glass rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setImgIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-[#00e5cc]' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setImgIndex(i)}
                  className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === imgIndex ? 'border-[#00e5cc]' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title + badges */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              {listing.featured && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-[#00e5cc] text-[#07080e]">
                  Destaque
                </span>
              )}
              <span className="px-2 py-0.5 text-xs rounded-md bg-[#1e2040] text-white/60">
                {conditionLabel[listing.condition]}
              </span>
            </div>
            <p className="text-xs text-white/60 font-medium uppercase tracking-wide mb-1">{listing.brand}</p>
            <h1 className="text-2xl font-bold text-[#e8e8f4]">
              {listing.model} {listing.year_model}
            </h1>
            <div className="flex items-center gap-1.5 mt-2 text-sm text-white/60">
              <MapPin size={13} />
              {listing.city}, {listing.state}
            </div>
          </div>

          {/* Specs grid */}
          <div className="mt-8">
            <h2 className="text-base font-semibold text-[#e8e8f4] mb-4">Especificações</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specs.map(s => (
                <div key={s.label} className="flex items-start gap-3 p-3 rounded-xl border border-[#1e2040] bg-[#000000]">
                  <div className="w-8 h-8 rounded-lg bg-[#00e5cc0d] flex items-center justify-center shrink-0 mt-0.5">
                    <s.icon size={15} className="text-[#00e5cc]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wide">{s.label}</p>
                    <p className="text-sm font-medium text-[#e8e8f4] mt-0.5">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="mt-8">
              <h2 className="text-base font-semibold text-[#e8e8f4] mb-3">Descrição</h2>
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {/* Comments */}
          <CommentsSection listingId={listing.id} sellerId={listing.seller_id} />
        </div>

        {/* Right column — price card */}
        <div>
          <div className="lg:sticky lg:top-24 rounded-2xl border border-[#1e2040] bg-[#000000] p-6 space-y-5">
            <div>
              <p className="text-3xl font-bold text-[#00e5cc]">
                {Number(listing.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </p>
              {listing.price_negotiable && (
                <p className="text-xs text-white/60 mt-0.5">Preço negociável</p>
              )}
              {listing.accepts_trade && (
                <p className="text-xs text-[#7b5cf0] mt-0.5">Aceita troca</p>
              )}
            </div>

            <a
              href={`https://wa.me/55${(listing.seller_phone ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Vi seu anúncio do ${listing.title} no AutoFácil e tenho interesse. Ainda está disponível?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#00e5cc] text-[#07080e] font-semibold rounded-xl hover:bg-[#00c8b4] transition-colors flex items-center justify-center"
            >
              Entrar em contato
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLiked(l => !l)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm transition-colors ${
                  liked
                    ? 'border-red-400/40 bg-red-400/10 text-red-400'
                    : 'border-[#1e2040] text-white/60 hover:border-[#2e3060] hover:text-[#e8e8f4]'
                }`}
              >
                <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
                {liked ? 'Salvo' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#1e2040] text-sm text-white/60 hover:border-[#2e3060] hover:text-[#e8e8f4] transition-colors"
              >
                <Share2 size={15} />
                Compartilhar
              </button>
            </div>

            <div className="border-t border-[#1e2040] pt-5">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Vendedor</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1e2040] flex items-center justify-center">
                  <span className="text-sm font-bold text-white/60">
                    {listing.seller_name?.charAt(0).toUpperCase() ?? '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e8e8f4]">{listing.seller_name ?? 'Vendedor'}</p>
                  {listing.seller_rating !== undefined && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-white/60">{listing.seller_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <BadgeCheck size={16} className="ml-auto text-[#00e5cc]" />
              </div>
            </div>


            <p className="text-[10px] text-white/60 text-center">
              {listing.views_count} visualizações
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
