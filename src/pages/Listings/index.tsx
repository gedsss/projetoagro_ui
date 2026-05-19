import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { CarCard } from '../../components/ui/CarCard'
import { listingsService } from '../../services/api'
import type { Listing, SearchFilters } from '../../types/api'

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const CONDITIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'seminovo', label: 'Seminovo' },
  { value: 'usado', label: 'Usado' },
]

const FUELS = [
  { value: 'flex', label: 'Flex' },
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'etanol', label: 'Etanol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'eletrico', label: 'Elétrico' },
  { value: 'hibrido', label: 'Híbrido' },
]

const ORDER_OPTIONS = [
  { value: 'recente', label: 'Mais recentes' },
  { value: 'menor_preco', label: 'Menor preço' },
  { value: 'maior_preco', label: 'Maior preço' },
  { value: 'relevancia', label: 'Relevância' },
]

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') ?? undefined,
    category: (searchParams.get('category') as SearchFilters['category']) ?? undefined,
    state: searchParams.get('state') ?? undefined,
    condition: (searchParams.get('condition') as SearchFilters['condition']) ?? undefined,
    min_price: undefined,
    max_price: undefined,
    min_year: undefined,
    max_year: undefined,
    max_km: undefined,
    fuel: undefined,
    order_by: 'recente',
    per_page: 12,
  })

  const fetchListings = useCallback(async (f: SearchFilters, p: number) => {
    setLoading(true)
    try {
      const res = await listingsService.search({ ...f, page: p })
      setListings(res.data.data)
      setTotal(res.data.data[0]?.total_count ?? res.data.data.length)
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchListings(filters, page)
  }, [filters, page, fetchListings])

  function applyFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setPage(1)
    setFilters(prev => ({ ...prev, [key]: value || undefined }))
  }

  function clearFilters() {
    setPage(1)
    setFilters({ order_by: 'recente', per_page: 12 })
    setSearchParams({})
  }

  const activeFilterCount = [
    filters.query, filters.category, filters.state, filters.condition,
    filters.min_price, filters.max_price, filters.min_year, filters.max_year,
    filters.max_km, filters.fuel,
  ].filter(Boolean).length

  const totalPages = Math.ceil(total / 12)

  function FilterPanel() {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Estado</label>
          <select
            value={filters.state ?? ''}
            onChange={e => applyFilter('state', e.target.value as any)}
            className="w-full bg-[#000000] border border-[#1e2040] rounded-lg px-3 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none"
          >
            <option value="">Todos</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Condição</label>
          <div className="space-y-1.5">
            {CONDITIONS.map(c => (
              <label key={c.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="condition"
                  value={c.value}
                  checked={filters.condition === c.value}
                  onChange={() => applyFilter('condition', c.value as any)}
                  className="accent-[#00e5cc]"
                />
                <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">{c.label}</span>
              </label>
            ))}
            {filters.condition && (
              <button onClick={() => applyFilter('condition', undefined)} className="text-xs text-[#00e5cc] mt-1">
                Limpar
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Combustível</label>
          <div className="space-y-1.5">
            {FUELS.map(f => (
              <label key={f.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="fuel"
                  value={f.value}
                  checked={filters.fuel === f.value}
                  onChange={() => applyFilter('fuel', f.value as any)}
                  className="accent-[#00e5cc]"
                />
                <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">{f.label}</span>
              </label>
            ))}
            {filters.fuel && (
              <button onClick={() => applyFilter('fuel', undefined)} className="text-xs text-[#00e5cc] mt-1">
                Limpar
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Preço</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Mín"
              value={filters.min_price ?? ''}
              onChange={e => applyFilter('min_price', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-[#000000] border border-[#1e2040] rounded-lg px-3 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Máx"
              value={filters.max_price ?? ''}
              onChange={e => applyFilter('max_price', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-[#000000] border border-[#1e2040] rounded-lg px-3 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Ano</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="De"
              value={filters.min_year ?? ''}
              onChange={e => applyFilter('min_year', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-[#000000] border border-[#1e2040] rounded-lg px-3 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Até"
              value={filters.max_year ?? ''}
              onChange={e => applyFilter('max_year', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-[#000000] border border-[#1e2040] rounded-lg px-3 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">KM máximo</label>
          <input
            type="number"
            placeholder="Ex: 50000"
            value={filters.max_km ?? ''}
            onChange={e => applyFilter('max_km', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-[#000000] border border-[#1e2040] rounded-lg px-3 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none"
          />
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="w-full py-2 text-sm text-red-400 border border-red-400/20 rounded-lg hover:bg-red-400/10 transition-colors"
          >
            Limpar filtros ({activeFilterCount})
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f4]">
            {filters.query ? `"${filters.query}"` : 'Todos os anúncios'}
          </h1>
          {!loading && (
            <p className="text-sm text-white/60 mt-0.5">
              {total} {total === 1 ? 'veículo encontrado' : 'veículos encontrados'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Order */}
          <div className="relative hidden sm:block">
            <select
              value={filters.order_by}
              onChange={e => applyFilter('order_by', e.target.value as any)}
              className="appearance-none bg-[#000000] border border-[#1e2040] rounded-lg pl-3 pr-8 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none cursor-pointer"
            >
              {ORDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm border border-[#1e2040] rounded-lg text-white/60 hover:text-[#e8e8f4] hover:border-[#2e3060] transition-colors"
          >
            <SlidersHorizontal size={15} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 text-xs bg-[#00e5cc] text-[#07080e] rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 rounded-2xl border border-[#1e2040] bg-[#000000] p-5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-5">Filtros</p>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="relative ml-auto w-72 bg-[#000000] border-l border-[#1e2040] h-full overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Filtros</p>
                <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-[#e8e8f4]">
                  <X size={18} />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Listings grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-[#000000] border border-[#1e2040] animate-pulse">
                  <div className="aspect-video bg-[#1e2040] rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-[#1e2040] rounded w-1/3" />
                    <div className="h-4 bg-[#1e2040] rounded w-2/3" />
                    <div className="h-5 bg-[#1e2040] rounded w-1/2 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {listings.map(listing => (
                  <CarCard key={listing.id} listing={listing} featured={listing.featured} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 text-sm border border-[#1e2040] rounded-lg text-white/60 hover:border-[#2e3060] hover:text-[#e8e8f4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-white/60 px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 text-sm border border-[#1e2040] rounded-lg text-white/60 hover:border-[#2e3060] hover:text-[#e8e8f4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4 opacity-20">🔍</span>
              <p className="text-white/60">Nenhum veículo encontrado.</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-4 text-sm text-[#00e5cc] hover:underline">
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
