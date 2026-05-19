import { Link } from 'react-router-dom'
import { MapPin, Gauge, Calendar, Fuel, Heart } from 'lucide-react'
import type { Listing } from '../../types/api'

const fuelLabel: Record<string, string> = {
  flex: 'Flex', gasolina: 'Gasolina', etanol: 'Etanol',
  diesel: 'Diesel', eletrico: 'Elétrico', hibrido: 'Híbrido',
}

const conditionColor: Record<string, string> = {
  novo: 'text-[#00e5cc] bg-[#00e5cc12]',
  seminovo: 'text-[#7b5cf0] bg-[#7b5cf012]',
  usado: 'text-white/60 bg-[#5a5a7a12]',
}

interface CarCardProps {
  listing: Listing
  featured?: boolean
}

export function CarCard({ listing, featured = false }: CarCardProps) {
  const cover = listing.listing_images?.[0]?.url ?? listing.cover_image

  return (
    <Link
      to={`/anuncios/${listing.id}`}
      className={`group block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 bg-[#000000] ${
        featured
          ? 'border-[#00e5cc55] hover:border-[#00e5cc99] hover:shadow-[0_0_30px_rgba(0,229,204,0.15)]'
          : 'border-[#00e5cc22] hover:border-[#00e5cc55] hover:shadow-[0_8px_30px_rgba(0,229,204,0.08)]'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-black">
        {cover ? (
          <img
            src={cover}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-10">🚗</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {featured && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-[#00e5cc] text-[#07080e]">
              Destaque
            </span>
          )}
          <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${conditionColor[listing.condition]}`}>
            {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
          </span>
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={e => e.preventDefault()}
          className="absolute top-3 right-3 p-1.5 rounded-lg glass opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red-400"
        >
          <Heart size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs text-white/60 font-medium uppercase tracking-wide">
              {listing.brand}
            </p>
            <h3 className="font-semibold text-[#e8e8f4] leading-snug line-clamp-1">
              {listing.model} {listing.year_model}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-[#00e5cc] leading-none">
              {Number(listing.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </p>
            {listing.price_negotiable && (
              <p className="text-xs text-white/60 mt-0.5">Negociável</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {listing.km != null && (
            <span className="flex items-center gap-1 text-xs text-white/60">
              <Gauge size={11} />
              {listing.km.toLocaleString('pt-BR')} km
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-white/60">
            <Calendar size={11} />
            {listing.year_model}
          </span>
          <span className="flex items-center gap-1 text-xs text-white/60">
            <Fuel size={11} />
            {fuelLabel[listing.fuel]}
          </span>
          <span className="flex items-center gap-1 text-xs text-white/60 ml-auto">
            <MapPin size={11} />
            {listing.city}, {listing.state}
          </span>
        </div>

      </div>
    </Link>
  )
}
