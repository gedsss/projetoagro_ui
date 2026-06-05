import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield, Zap, Star } from 'lucide-react'
import { CarCard } from '../../components/ui/CarCard'
import { BrandSearchInput } from '../../components/ui/BrandSearchInput'
import { listingsService } from '../../services/api'
import type { Listing } from '../../types/api'
import imgSUV from '../../assets/categories/CRETA.png'
import imgSedan from '../../assets/categories/CIVIC.png'
import imgPickup from '../../assets/categories/HILLUX.png'
import imgMoto from '../../assets/categories/MOTO.png'
import imgCoupe from '../../assets/categories/PORSCHE.png'
import imgVan from '../../assets/categories/VAN.png'

const heroVideo = '/hero.mp4'

const categories = [
  { label: 'SUVs', value: 'SUVS', img: imgSUV },
  { label: 'Sedans', value: 'SEDANS', img: imgSedan },
  { label: 'Pickups', value: 'PICKUPS', img: imgPickup },
  { label: 'Motos', value: 'MOTOS', img: imgMoto },
  { label: 'Coupés', value: 'CLASSICOS', img: imgCoupe },
  { label: 'Utilitários', value: 'VANS', img: imgVan },
]

const features = [
  {
    icon: Shield,
    title: 'Anúncios verificados',
    desc: 'Todos os vendedores passam por verificação antes de anunciar.',
  },
  {
    icon: Zap,
    title: 'Negociação rápida',
    desc: 'Contate o vendedor em segundos pelo chat integrado.',
  },
  {
    icon: Star,
    title: 'Avaliações reais',
    desc: 'Veja as avaliações de outros compradores antes de decidir.',
  },
]

export default function Home() {
  const [featured, setFeatured] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    listingsService.getFeatured()
      .then(r => {
        const raw = r.data as any
        const data = raw?.data?.data ?? raw?.data ?? []
        setFeatured(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-20 sm:pt-32 sm:pb-24 px-4 sm:px-6 overflow-hidden min-h-130 sm:min-h-150 flex items-center">
        <video
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#07080e] via-[#07080e55] to-transparent pointer-events-none" />
        <div className="grid-bg absolute inset-0 opacity-[0.03]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#00e5cc] opacity-[0.04] blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00e5cc22] bg-[#00e5cc08] text-[#00e5cc] text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5cc] animate-pulse" />
            Marketplace de veículos
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
            Encontre o carro{' '}
            <span className="gradient-text">perfeito</span>{' '}
            para você
          </h1>

          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Milhares de veículos verificados. Compare preços, filtre por localização e negocie direto com o vendedor.
          </p>

          <div className="max-w-xl mx-auto">
            <BrandSearchInput
              size="md"
              inputClassName="w-full bg-[#000000] border border-[#1e2040] rounded-xl pl-10 pr-4 py-3.5 text-[#e8e8f4] placeholder-[#5a5a7a] focus:border-[#00e5cc55] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 mt-10">
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => navigate(`/anuncios?category=${cat.value}`)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#1e2040] bg-[#000000] hover:border-[#00e5cc33] hover:bg-[#00e5cc08] hover:-translate-y-2 active:scale-95 transition-all duration-200 group"
            >
              <div className="w-full flex items-center justify-center mb-1" style={{ aspectRatio: '4/3' }}>
                <img src={cat.img} alt={cat.label} className="w-full h-full object-contain p-2" />
              </div>
              <span className="text-xs text-white/60 group-hover:text-[#e8e8f4] transition-colors font-medium">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#e8e8f4]">Em destaque</h2>
            <p className="text-white/60 text-sm mt-1">Veículos selecionados para você</p>
          </div>
          <button
            onClick={() => navigate('/anuncios')}
            className="flex items-center gap-1.5 text-sm text-[#00e5cc] hover:text-[#00c8b4] transition-colors"
          >
            Ver todos
            <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#000000] border border-[#1e2040] animate-pulse">
                <div className="aspect-[16/9] bg-[#1e2040] rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#1e2040] rounded w-1/3" />
                  <div className="h-4 bg-[#1e2040] rounded w-2/3" />
                  <div className="h-5 bg-[#1e2040] rounded w-1/2 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(listing => (
              <CarCard key={listing.id} listing={listing} featured />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-white/60">
            Nenhum anúncio em destaque no momento.
          </div>
        )}
      </section>

      {/* Features */}
      <section className="border-t border-[#1e2040]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-2xl font-bold text-[#e8e8f4] text-center mb-12">
            Por que usar o <span className="gradient-text">AutoFácil</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-[#1e2040] bg-[#000000] hover:border-[#00e5cc22] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#00e5cc12] flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-[#00e5cc]" />
                </div>
                <h3 className="font-semibold text-[#e8e8f4] mb-2">{f.title}</h3>
                <p className="text-sm text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
