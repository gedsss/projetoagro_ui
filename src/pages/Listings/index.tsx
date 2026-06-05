import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'

import { CarCard } from '../../components/ui/CarCard'
import { listingsService } from '../../services/api'
import { fipeService } from '../../services/fipe'
import type { FipeMarca, FipeModelo, FipeAno } from '../../services/fipe'
import type { Listing, SearchFilters } from '../../types/api'

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const CATEGORIES = [
  { value: 'SEDANS', label: 'Sedan' },
  { value: 'SUVS', label: 'SUV' },
  { value: 'PICKUPS', label: 'Pickup' },
  { value: 'MOTOS', label: 'Moto' },
  { value: 'CLASSICOS', label: 'Coupé' },
  { value: 'VANS', label: 'Van / Utilitário' },
  { value: 'CAMINHOES', label: 'Caminhão' },
  { value: 'OUTROS', label: 'Outros' },
]

const CONDITIONS = [
  { value: 'NOVO', label: 'Novo' },
  { value: 'SEMINOVO', label: 'Seminovo' },
  { value: 'USADO', label: 'Usado' },
]

const FUELS = [
  { value: 'FLEX', label: 'Flex' },
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'ETANOL', label: 'Etanol' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELETRICO', label: 'Elétrico' },
  { value: 'HIBRIDO', label: 'Híbrido' },
]

const TRANSMISSIONS = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATICO', label: 'Automático' },
  { value: 'CVT', label: 'CVT' },
  { value: 'AUTOMATIZADO', label: 'Automatizado' },
]

const COLORS = ['Branco','Preto','Prata','Cinza','Vermelho','Azul','Verde','Amarelo','Laranja','Bege','Marrom','Roxo','Dourado']

const ORDER_OPTIONS = [
  { value: 'recente', label: 'Mais recentes' },
  { value: 'menor_preco', label: 'Menor preço' },
  { value: 'maior_preco', label: 'Maior preço' },
  { value: 'relevancia', label: 'Relevância' },
]

const EMPTY_FILTERS: SearchFilters = {
  order_by: 'recente',
  per_page: 12,
}

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [page, setPage] = useState(1)

  // FIPE cascade state
  const [fipeMarcas, setFipeMarcas] = useState<FipeMarca[]>([])
  const [fipeModelos, setFipeModelos] = useState<FipeModelo[]>([])
  const [fipeAnos, setFipeAnos] = useState<FipeAno[]>([])
  const [fipeCodMarca, setFipeCodMarca] = useState('')
  const [fipeCodModelo, setFipeCodModelo] = useState('')
  const [fipeCodAno, setFipeCodAno] = useState('')
  const [fipeLoading, setFipeLoading] = useState(false)

  // Applied filters — these trigger the API call
  const [filters, setFilters] = useState<SearchFilters>({
    ...EMPTY_FILTERS,
    query: searchParams.get('q') ?? undefined,
    category: (searchParams.get('category') as SearchFilters['category']) ?? undefined,
    brand: searchParams.get('brand') ?? undefined,
    state: searchParams.get('state') ?? undefined,
    condition: (searchParams.get('condition') as SearchFilters['condition']) ?? undefined,
  })

  // Pending filters — what the user is configuring in the panel
  const [pending, setPending] = useState<SearchFilters>({ ...filters })

  function setPendingField<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setPending(prev => ({ ...prev, [key]: value }))
  }

  const fetchListings = useCallback(async (f: SearchFilters, p: number) => {
    setLoading(true)
    try {
      const res = await listingsService.search({ ...f, page: p })
      const raw = res.data as any
      const data: Listing[] = Array.isArray(raw?.data?.data) ? raw.data.data : Array.isArray(raw?.data) ? raw.data : []
      setListings(data)
      setTotal(raw?.data?.pagination?.total ?? data.length)
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [])

  // URL search params → update both applied and pending
  useEffect(() => {
    const q = searchParams.get('q') ?? undefined
    const category = (searchParams.get('category') as SearchFilters['category']) ?? undefined
    const brand = searchParams.get('brand') ?? undefined
    setPage(1)
    setFilters(prev => ({ ...prev, query: q, category, brand }))
    setPending(prev => ({ ...prev, query: q, category, brand }))
  }, [searchParams])

  useEffect(() => {
    fetchListings(filters, page)
  }, [filters, page, fetchListings])

  // Load FIPE marcas once
  useEffect(() => {
    fipeService.getMarcas('carros').then(setFipeMarcas).catch(() => {})
  }, [])

  // Auto-select marca from URL brand param
  useEffect(() => {
    if (!filters.brand || fipeMarcas.length === 0 || fipeCodMarca) return
    const found = fipeMarcas.find(m => m.nome.toLowerCase() === (filters.brand ?? '').toLowerCase())
    if (!found) return
    setFipeCodMarca(found.codigo)
    setFipeLoading(true)
    fipeService.getModelos('carros', found.codigo)
      .then(setFipeModelos)
      .catch(() => {})
      .finally(() => setFipeLoading(false))
  }, [filters.brand, fipeMarcas, fipeCodMarca])

  function handleMarcaChange(codMarca: string) {
    const marca = fipeMarcas.find(m => m.codigo === codMarca)
    setFipeCodMarca(codMarca)
    setFipeCodModelo('')
    setFipeCodAno('')
    setFipeModelos([])
    setFipeAnos([])
    setPending(prev => ({ ...prev, brand: marca?.nome || undefined, model: undefined, year: undefined }))
    if (!codMarca) return
    setFipeLoading(true)
    fipeService.getModelos('carros', codMarca)
      .then(setFipeModelos)
      .catch(() => {})
      .finally(() => setFipeLoading(false))
  }

  function handleModeloChange(codModelo: string) {
    const modelo = fipeModelos.find(m => String(m.codigo) === codModelo)
    setFipeCodModelo(codModelo)
    setFipeCodAno('')
    setFipeAnos([])
    setPending(prev => ({ ...prev, model: modelo?.nome || undefined, year: undefined }))
    if (!codModelo) return
    setFipeLoading(true)
    fipeService.getAnos('carros', fipeCodMarca, codModelo)
      .then(setFipeAnos)
      .catch(() => {})
      .finally(() => setFipeLoading(false))
  }

  function handleAnoChange(codAno: string) {
    const ano = fipeAnos.find(a => a.codigo === codAno)
    const year = ano ? parseInt(ano.nome, 10) : undefined
    setFipeCodAno(codAno)
    setPending(prev => ({ ...prev, year: year || undefined }))
  }

  function applyFilters() {
    setPage(1)
    setFilters({ ...pending })
    setSidebarOpen(false)
  }

  function clearFilters() {
    const empty = { ...EMPTY_FILTERS }
    setPage(1)
    setFilters(empty)
    setPending(empty)
    setSearchParams({})
    setFipeCodMarca('')
    setFipeCodModelo('')
    setFipeCodAno('')
    setFipeModelos([])
    setFipeAnos([])
  }

  // Count applied filters (excludes order_by and per_page)
  const activeFilterCount = [
    filters.query, filters.brand, filters.model, filters.year,
    filters.category, filters.state, filters.city, filters.condition,
    filters.min_price, filters.max_price, filters.min_year, filters.max_year,
    filters.max_km, filters.fuel, filters.transmission, filters.doors,
    filters.color, filters.min_engine_cc, filters.max_engine_cc,
    filters.bullet_proof, filters.auction,
  ].filter(v => v !== undefined && v !== null && v !== '').length

  const totalPages = Math.ceil(total / 12)

  const selectCls = "w-full bg-[#000000] border border-[#1e2040] rounded-lg px-3 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none appearance-none"
  const inputCls = "w-full bg-[#000000] border border-[#1e2040] rounded-lg px-3 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none"

  const filterPanel = (
    <div className="space-y-6">

      {/* Categoria */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Categoria</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setPendingField('category', pending.category === c.value ? undefined : c.value as any)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                pending.category === c.value
                  ? 'bg-[#00e5cc] text-[#07080e] border-[#00e5cc]'
                  : 'border-[#1e2040] text-white/60 hover:text-[#e8e8f4] hover:border-[#2e3060]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Marca / Modelo / Ano via FIPE */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Marca</p>
        <select
          value={fipeCodMarca}
          onChange={e => handleMarcaChange(e.target.value)}
          disabled={fipeMarcas.length === 0}
          className={selectCls}
        >
          <option value="">Todas as marcas</option>
          {fipeMarcas.map(m => (
            <option key={m.codigo} value={m.codigo}>{m.nome}</option>
          ))}
        </select>
      </div>

      {fipeCodMarca && (
        <div>
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Modelo</p>
          <select
            value={fipeCodModelo}
            onChange={e => handleModeloChange(e.target.value)}
            disabled={fipeLoading || fipeModelos.length === 0}
            className={`${selectCls} disabled:opacity-50`}
          >
            <option value="">Todos os modelos</option>
            {fipeModelos.map(m => (
              <option key={m.codigo} value={String(m.codigo)}>{m.nome}</option>
            ))}
          </select>
        </div>
      )}

      {fipeCodModelo && (
        <div>
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Versão / Ano</p>
          <select
            value={fipeCodAno}
            onChange={e => handleAnoChange(e.target.value)}
            disabled={fipeLoading || fipeAnos.length === 0}
            className={`${selectCls} disabled:opacity-50`}
          >
            <option value="">Todas as versões</option>
            {fipeAnos.map(a => (
              <option key={a.codigo} value={a.codigo}>{a.nome}</option>
            ))}
          </select>
        </div>
      )}

      {/* Estado + Cidade */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Estado</label>
        <select
          value={pending.state ?? ''}
          onChange={e => {
            setPendingField('state', e.target.value as any || undefined)
            if (!e.target.value) setPendingField('city', undefined)
          }}
          className={selectCls}
        >
          <option value="">Todos</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {pending.state && (
        <div>
          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Cidade</label>
          <input
            type="text"
            placeholder="Ex: São Paulo"
            value={pending.city ?? ''}
            onChange={e => setPendingField('city', e.target.value || undefined)}
            className={inputCls}
          />
        </div>
      )}

      {/* Condição */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Condição</label>
        <div className="space-y-1.5">
          {CONDITIONS.map(c => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="condition"
                value={c.value}
                checked={pending.condition === c.value}
                onChange={() => setPendingField('condition', c.value as any)}
                className="accent-[#00e5cc]"
              />
              <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">{c.label}</span>
            </label>
          ))}
          {pending.condition && (
            <button onClick={() => setPendingField('condition', undefined)} className="text-xs text-[#00e5cc] mt-1">Limpar</button>
          )}
        </div>
      </div>

      {/* Combustível */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Combustível</label>
        <div className="space-y-1.5">
          {FUELS.map(f => (
            <label key={f.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="fuel"
                value={f.value}
                checked={pending.fuel === f.value}
                onChange={() => setPendingField('fuel', f.value as any)}
                className="accent-[#00e5cc]"
              />
              <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">{f.label}</span>
            </label>
          ))}
          {pending.fuel && (
            <button onClick={() => setPendingField('fuel', undefined)} className="text-xs text-[#00e5cc] mt-1">Limpar</button>
          )}
        </div>
      </div>

      {/* Câmbio */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Câmbio</label>
        <div className="space-y-1.5">
          {TRANSMISSIONS.map(t => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="transmission"
                value={t.value}
                checked={pending.transmission === t.value}
                onChange={() => setPendingField('transmission', t.value as any)}
                className="accent-[#00e5cc]"
              />
              <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">{t.label}</span>
            </label>
          ))}
          {pending.transmission && (
            <button onClick={() => setPendingField('transmission', undefined)} className="text-xs text-[#00e5cc] mt-1">Limpar</button>
          )}
        </div>
      </div>

      {/* Portas */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Portas</label>
        <div className="flex gap-2">
          {[2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setPendingField('doors', pending.doors === n ? undefined : n)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                pending.doors === n
                  ? 'bg-[#00e5cc] text-[#07080e] border-[#00e5cc]'
                  : 'border-[#1e2040] text-white/60 hover:text-[#e8e8f4] hover:border-[#2e3060]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Cor */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Cor</label>
        <select
          value={pending.color ?? ''}
          onChange={e => setPendingField('color', e.target.value || undefined)}
          className={selectCls}
        >
          <option value="">Todas</option>
          {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Cavalos / Cilindradas */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
          {pending.category === 'MOTOS' ? 'Cilindradas (cc)' : 'Cavalos (cv)'}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={pending.min_engine_cc ?? ''}
            onChange={e => setPendingField('min_engine_cc', e.target.value ? Number(e.target.value) : undefined)}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Máx"
            value={pending.max_engine_cc ?? ''}
            onChange={e => setPendingField('max_engine_cc', e.target.value ? Number(e.target.value) : undefined)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Valor */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Valor (R$)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={pending.min_price ?? ''}
            onChange={e => setPendingField('min_price', e.target.value ? Number(e.target.value) : undefined)}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Máx"
            value={pending.max_price ?? ''}
            onChange={e => setPendingField('max_price', e.target.value ? Number(e.target.value) : undefined)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Ano */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Ano</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="De"
            value={pending.min_year ?? ''}
            onChange={e => setPendingField('min_year', e.target.value ? Number(e.target.value) : undefined)}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Até"
            value={pending.max_year ?? ''}
            onChange={e => setPendingField('max_year', e.target.value ? Number(e.target.value) : undefined)}
            className={inputCls}
          />
        </div>
      </div>

      {/* KM */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">KM máximo</label>
        <input
          type="number"
          placeholder="Ex: 50000"
          value={pending.max_km ?? ''}
          onChange={e => setPendingField('max_km', e.target.value ? Number(e.target.value) : undefined)}
          className={inputCls}
        />
      </div>

      {/* Características Especiais */}
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Características Especiais</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={pending.bullet_proof === true}
              onChange={e => setPendingField('bullet_proof', e.target.checked ? true : undefined)}
              className="accent-[#00e5cc] w-4 h-4"
            />
            <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">Blindado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={pending.auction === true}
              onChange={e => setPendingField('auction', e.target.checked ? true : undefined)}
              className="accent-[#00e5cc] w-4 h-4"
            />
            <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">Leilão</span>
          </label>
        </div>
      </div>

      {/* Ações */}
      <div className="space-y-2 pt-1">
        <button
          onClick={applyFilters}
          className="w-full py-2.5 text-sm font-semibold bg-[#00e5cc] text-[#07080e] rounded-lg hover:bg-[#00cdb8] transition-colors"
        >
          Aplicar filtros
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="w-full py-2 text-sm text-red-400 border border-red-400/20 rounded-lg hover:bg-red-400/10 transition-colors"
          >
            Limpar tudo ({activeFilterCount})
          </button>
        )}
      </div>
    </div>
  )

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
              onChange={e => {
                const val = e.target.value as SearchFilters['order_by']
                setFilters(prev => ({ ...prev, order_by: val }))
                setPending(prev => ({ ...prev, order_by: val }))
              }}
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
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-[#1e2040] bg-[#000000] p-5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-5">Filtros</p>
            {filterPanel}
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
              {filterPanel}
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
