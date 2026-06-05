import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BadgeCheck, Bell, Calendar, Camera, CheckCircle, ChevronDown,
  ChevronLeft, ChevronRight, Edit3, Filter, LayoutList, LogOut,
  Mail, MapPin, Phone, Plus, SlidersHorizontal, Trash2, User, X,
} from 'lucide-react'
import { CarCard } from '../../components/ui/CarCard'
import { useNotifications } from '../../hooks/useNotifications'
import { commentsService, listingsService, usersService } from '../../services/api'
import { fipeService } from '../../services/fipe'
import type { FipeMarca, FipeModelo, FipeAno } from '../../services/fipe'
import type { Listing, NotificationItem, User as UserType } from '../../types/api'

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const CONDITIONS = [{ value: 'NOVO', label: 'Novo' }, { value: 'SEMINOVO', label: 'Seminovo' }, { value: 'USADO', label: 'Usado' }]
const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'PAUSADO', label: 'Pausado' },
  { value: 'VENDIDO', label: 'Vendido' },
  { value: 'EXPIRADO', label: 'Expirado' },
  { value: 'REMOVIDO', label: 'Removido' },
]
const CATEGORIES = [
  { value: 'SEDANS', label: 'Sedan' }, { value: 'SUVS', label: 'SUV' },
  { value: 'PICKUPS', label: 'Pickup' }, { value: 'MOTOS', label: 'Moto' },
  { value: 'CLASSICOS', label: 'Coupé' }, { value: 'VANS', label: 'Van / Utilitário' },
  { value: 'CAMINHOES', label: 'Caminhão' }, { value: 'OUTROS', label: 'Outros' },
]
const FUELS = [
  { value: 'FLEX', label: 'Flex' }, { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'ETANOL', label: 'Etanol' }, { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELETRICO', label: 'Elétrico' }, { value: 'HIBRIDO', label: 'Híbrido' },
]
const TRANSMISSIONS = [
  { value: 'MANUAL', label: 'Manual' }, { value: 'AUTOMATICO', label: 'Automático' },
  { value: 'CVT', label: 'CVT' }, { value: 'AUTOMATIZADO', label: 'Automatizado' },
]
const COLORS = ['Branco','Preto','Prata','Cinza','Vermelho','Azul','Verde','Amarelo','Laranja','Bege','Marrom','Roxo','Dourado']

function getTokenId(): string | null {
  const token = localStorage.getItem('token')
  if (!token) return null
  try { return JSON.parse(atob(token.split('.')[1])).id } catch { return null }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`
  return new Date(date).toLocaleDateString('pt-BR')
}

type Tab = 'info' | 'listings' | 'notifications' | 'edit'

const inputClass = 'w-full bg-[#07080e] border border-[#1e2040] rounded-xl px-4 py-3 text-sm text-[#e8e8f4] placeholder-white/30 focus:border-[#00e5cc55] focus:outline-none transition-colors'
const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'

export default function Perfil() {
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState<UserType | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [tab, setTab] = useState<Tab>(() => {
    const p = searchParams.get('tab')
    if (p === 'notifications' || p === 'listings' || p === 'edit') return p
    return 'info'
  })
  const [loading, setLoading] = useState(true)
  const [listingsLoading, setListingsLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [editError, setEditError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Boost modal
  const [boostListing, setBoostListing] = useState<{ id: string; title: string } | null>(null)
  const [boostAmount, setBoostAmount] = useState('')
  const [boostPayment, setBoostPayment] = useState('')

  const [orderFilter, setOrderFilter] = useState('recente')

  type LF = {
    status: string; condition: string; state: string; city: string
    brand: string; model: string; year: number | undefined
    category: string; fuel: string; transmission: string
    doors: number | undefined; color: string
    minEngineCC: number | undefined; maxEngineCC: number | undefined
    minPrice: number | undefined; maxPrice: number | undefined
    maxKm: number | undefined
    bulletProof: boolean | undefined; auction: boolean | undefined
  }
  const EMPTY_LF: LF = {
    status: '', condition: '', state: '', city: '', brand: '', model: '',
    year: undefined, category: '', fuel: '', transmission: '',
    doors: undefined, color: '', minEngineCC: undefined, maxEngineCC: undefined,
    minPrice: undefined, maxPrice: undefined, maxKm: undefined,
    bulletProof: undefined, auction: undefined,
  }
  const [appliedFilters, setAppliedFilters] = useState<LF>({ ...EMPTY_LF })
  const [pending, setPending] = useState<LF>({ ...EMPTY_LF })
  function setPF<K extends keyof LF>(key: K, value: LF[K]) {
    setPending(p => ({ ...p, [key]: value }))
  }

  // FIPE cascade for filter panel
  const [fipeMarcas, setFipeMarcas] = useState<FipeMarca[]>([])
  const [fipeModelos, setFipeModelos] = useState<FipeModelo[]>([])
  const [fipeAnos, setFipeAnos] = useState<FipeAno[]>([])
  const [fipeCodMarca, setFipeCodMarca] = useState('')
  const [fipeCodModelo, setFipeCodModelo] = useState('')
  const [fipeCodAno, setFipeCodAno] = useState('')
  const [fipeLoading, setFipeLoading] = useState(false)

  // Notifications
  const [notifs, setNotifs] = useState<NotificationItem[]>([])
  const [notifsLoading, setNotifsLoading] = useState(false)
  const [notifsPage, setNotifsPage] = useState(1)
  const [notifsTotal, setNotifsTotal] = useState(0)
  const [notifsPages, setNotifsPages] = useState(1)
  const [notifsUnreadOnly, setNotifsUnreadOnly] = useState(false)
  const [notifsFrom, setNotifsFrom] = useState('')
  const [notifsTo, setNotifsTo] = useState('')
  const NOTIFS_PER_PAGE = 10

  const navigate = useNavigate()
  const { count: notifCount, markRead } = useNotifications()

  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', city: '', state: '', bio: '', password: '',
  })

  useEffect(() => {
    const p = searchParams.get('tab')
    if (p === 'notifications' || p === 'listings' || p === 'edit') setTab(p)
  }, [searchParams])

  useEffect(() => {
    usersService.getMe()
      .then(r => {
        const u = r.data.data
        setUser(u)
        setEditForm({ name: u.name, email: u.email, phone: u.phone ?? '', city: u.city ?? '', state: u.state ?? 'SP', bio: u.bio ?? '', password: '' })
        if (u.avatar_url) setAvatarPreview(u.avatar_url)
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    if (tab !== 'listings') return
    const id = getTokenId()
    if (!id) return
    setListingsLoading(true)
    listingsService.getByUser(id)
      .then(r => {
        const raw = r.data as any
        const data = raw?.data?.data ?? raw?.data ?? []
        setListings(Array.isArray(data) ? data : [])
      })
      .catch(() => setListings([]))
      .finally(() => setListingsLoading(false))
  }, [tab])

  const fetchNotifs = useCallback(() => {
    setNotifsLoading(true)
    commentsService.getNotifications({
      page: notifsPage,
      per_page: NOTIFS_PER_PAGE,
      from: notifsFrom || undefined,
      to: notifsTo || undefined,
      unread_only: notifsUnreadOnly || undefined,
    })
      .then(r => {
        setNotifs(r.data.data.notifications)
        setNotifsTotal(r.data.data.total)
        setNotifsPages(r.data.data.pages)
      })
      .catch(() => setNotifs([]))
      .finally(() => setNotifsLoading(false))
  }, [notifsPage, notifsFrom, notifsTo, notifsUnreadOnly])

  useEffect(() => {
    if (tab === 'notifications') fetchNotifs()
  }, [tab, fetchNotifs])

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await fileToBase64(file)
    setAvatarPreview(base64)
    setEditForm(f => ({ ...f }))
    // Save immediately
    try {
      const res = await usersService.update({ avatar_url: base64 } as Parameters<typeof usersService.update>[0])
      setUser(res.data.data)
    } catch { /* silent */ }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setEditError('')
    setEditSuccess(false)
    setEditLoading(true)
    try {
      const payload: Record<string, string> = {}
      if (editForm.name) payload.name = editForm.name
      if (editForm.email) payload.email = editForm.email
      if (editForm.phone) payload.phone = editForm.phone
      if (editForm.city) payload.city = editForm.city
      if (editForm.state) payload.state = editForm.state
      if (editForm.bio) payload.bio = editForm.bio
      if (editForm.password) payload.password = editForm.password
      if (avatarPreview && avatarPreview !== user?.avatar_url) payload.avatar_url = avatarPreview
      const res = await usersService.update(payload)
      setUser(res.data.data)
      setEditSuccess(true)
      setEditForm(f => ({ ...f, password: '' }))
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setEditError(msg ?? 'Erro ao atualizar perfil.')
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await listingsService.remove(id)
      setListings(prev => prev.filter(l => l.id !== id))
    } catch { /* silent */ }
    setDeleteId(null)
  }

  // Load FIPE marcas once
  useEffect(() => {
    fipeService.getMarcas('carros').then(setFipeMarcas).catch(() => {})
  }, [])

  function handleMarcaChange(codMarca: string) {
    const marca = fipeMarcas.find(m => m.codigo === codMarca)
    setFipeCodMarca(codMarca)
    setFipeCodModelo('')
    setFipeCodAno('')
    setFipeModelos([])
    setFipeAnos([])
    setPending(p => ({ ...p, brand: marca?.nome || '', model: '', year: undefined }))
    if (!codMarca) return
    setFipeLoading(true)
    fipeService.getModelos('carros', codMarca).then(setFipeModelos).catch(() => {}).finally(() => setFipeLoading(false))
  }

  function handleModeloChange(codModelo: string) {
    const modelo = fipeModelos.find(m => String(m.codigo) === codModelo)
    setFipeCodModelo(codModelo)
    setFipeCodAno('')
    setFipeAnos([])
    setPending(p => ({ ...p, model: modelo?.nome || '', year: undefined }))
    if (!codModelo) return
    setFipeLoading(true)
    fipeService.getAnos('carros', fipeCodMarca, codModelo).then(setFipeAnos).catch(() => {}).finally(() => setFipeLoading(false))
  }

  function handleAnoChange(codAno: string) {
    const ano = fipeAnos.find(a => a.codigo === codAno)
    setFipeCodAno(codAno)
    setPending(p => ({ ...p, year: ano ? parseInt(ano.nome, 10) : undefined }))
  }

  // Filter + sort listings (client-side)
  const af = appliedFilters
  const filteredListings = (Array.isArray(listings) ? listings : [])
    .filter(l => !af.status || l.status === af.status)
    .filter(l => !af.category || l.category === af.category)
    .filter(l => !af.condition || l.condition === af.condition)
    .filter(l => !af.state || l.state === af.state)
    .filter(l => !af.city || l.city?.toLowerCase().includes(af.city.toLowerCase()))
    .filter(l => !af.brand || l.brand?.toLowerCase().includes(af.brand.toLowerCase()))
    .filter(l => !af.model || l.model?.toLowerCase().includes(af.model.toLowerCase()))
    .filter(l => !af.year || l.year_model === af.year)
    .filter(l => !af.fuel || l.fuel === af.fuel)
    .filter(l => !af.transmission || l.transmission === af.transmission)
    .filter(l => !af.doors || l.doors === af.doors)
    .filter(l => !af.color || l.color?.toLowerCase().includes(af.color.toLowerCase()))
    .filter(l => af.minEngineCC === undefined || (l.engine_cc ?? 0) >= af.minEngineCC)
    .filter(l => af.maxEngineCC === undefined || (l.engine_cc ?? Infinity) <= af.maxEngineCC)
    .filter(l => af.minPrice === undefined || Number(l.price) >= af.minPrice)
    .filter(l => af.maxPrice === undefined || Number(l.price) <= af.maxPrice)
    .filter(l => af.maxKm === undefined || (l.km ?? 0) <= af.maxKm)
    .filter(l => af.bulletProof === undefined || l.bullet_proof === af.bulletProof)
    .filter(l => af.auction === undefined || l.auction === af.auction)
    .sort((a, b) => {
      if (orderFilter === 'menor_preco') return Number(a.price) - Number(b.price)
      if (orderFilter === 'maior_preco') return Number(b.price) - Number(a.price)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const activeFilterCount = [
    af.status, af.category, af.condition, af.state, af.city,
    af.brand, af.model, af.year, af.fuel, af.transmission,
    af.doors, af.color, af.minEngineCC, af.maxEngineCC,
    af.minPrice, af.maxPrice, af.maxKm, af.bulletProof, af.auction,
  ].filter(v => v !== undefined && v !== null && v !== '').length

  function applyListingFilters() {
    setAppliedFilters({ ...pending })
    setSidebarOpen(false)
  }

  function clearFilters() {
    setAppliedFilters({ ...EMPTY_LF })
    setPending({ ...EMPTY_LF })
    setOrderFilter('recente')
    setFipeCodMarca('')
    setFipeCodModelo('')
    setFipeCodAno('')
    setFipeModelos([])
    setFipeAnos([])
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1e2040]" />
            <div className="space-y-2">
              <div className="h-5 bg-[#1e2040] rounded w-40" />
              <div className="h-3 bg-[#1e2040] rounded w-28" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'info', label: 'Informações', icon: User },
    { key: 'listings', label: 'Meus Anúncios', icon: LayoutList },
    { key: 'notifications', label: 'Notificações', icon: Bell },
    { key: 'edit', label: 'Editar Perfil', icon: Edit3 },
  ]

  const selectCls = "w-full bg-[#000000] border border-[#1e2040] rounded-lg px-3 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none appearance-none"
  const inputCls = "w-full bg-[#000000] border border-[#1e2040] rounded-lg px-3 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none"

  const filterPanel = (
    <div className="space-y-6">

      {/* Status */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Status</p>
        <div className="space-y-1.5">
          {STATUS_OPTIONS.map(s => (
            <label key={s.value} htmlFor={`status-${s.value}`} className="flex items-center gap-2 cursor-pointer group">
              <input id={`status-${s.value}`} type="radio" name="status" checked={pending.status === s.value} onChange={() => setPF('status', s.value)} className="accent-[#00e5cc]" />
              <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categoria */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Categoria</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => setPF('category', pending.category === c.value ? '' : c.value)}
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
        <select value={fipeCodMarca} onChange={e => handleMarcaChange(e.target.value)} disabled={fipeMarcas.length === 0} className={selectCls}>
          <option value="">Todas as marcas</option>
          {fipeMarcas.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
        </select>
      </div>

      {fipeCodMarca && (
        <div>
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Modelo</p>
          <select value={fipeCodModelo} onChange={e => handleModeloChange(e.target.value)} disabled={fipeLoading || fipeModelos.length === 0} className={`${selectCls} disabled:opacity-50`}>
            <option value="">Todos os modelos</option>
            {fipeModelos.map(m => <option key={m.codigo} value={String(m.codigo)}>{m.nome}</option>)}
          </select>
        </div>
      )}

      {fipeCodModelo && (
        <div>
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Versão / Ano</p>
          <select value={fipeCodAno} onChange={e => handleAnoChange(e.target.value)} disabled={fipeLoading || fipeAnos.length === 0} className={`${selectCls} disabled:opacity-50`}>
            <option value="">Todas as versões</option>
            {fipeAnos.map(a => <option key={a.codigo} value={a.codigo}>{a.nome}</option>)}
          </select>
        </div>
      )}

      {/* Estado + Cidade */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Estado</p>
        <select value={pending.state} onChange={e => { setPF('state', e.target.value); if (!e.target.value) setPF('city', '') }} className={selectCls}>
          <option value="">Todos</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {pending.state && (
        <div>
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Cidade</p>
          <input type="text" placeholder="Ex: São Paulo" value={pending.city} onChange={e => setPF('city', e.target.value)} className={inputCls} />
        </div>
      )}

      {/* Condição */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Condição</p>
        <div className="space-y-1.5">
          {CONDITIONS.map(c => (
            <label key={c.value} htmlFor={`cond-${c.value}`} className="flex items-center gap-2 cursor-pointer group">
              <input id={`cond-${c.value}`} type="radio" name="condition" checked={pending.condition === c.value} onChange={() => setPF('condition', c.value)} className="accent-[#00e5cc]" />
              <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">{c.label}</span>
            </label>
          ))}
          {pending.condition && <button type="button" onClick={() => setPF('condition', '')} className="text-xs text-[#00e5cc] mt-1">Limpar</button>}
        </div>
      </div>

      {/* Combustível */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Combustível</p>
        <div className="space-y-1.5">
          {FUELS.map(f => (
            <label key={f.value} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="fuel" value={f.value} checked={pending.fuel === f.value} onChange={() => setPF('fuel', f.value)} className="accent-[#00e5cc]" />
              <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">{f.label}</span>
            </label>
          ))}
          {pending.fuel && <button type="button" onClick={() => setPF('fuel', '')} className="text-xs text-[#00e5cc] mt-1">Limpar</button>}
        </div>
      </div>

      {/* Câmbio */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Câmbio</p>
        <div className="space-y-1.5">
          {TRANSMISSIONS.map(t => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="transmission" value={t.value} checked={pending.transmission === t.value} onChange={() => setPF('transmission', t.value)} className="accent-[#00e5cc]" />
              <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">{t.label}</span>
            </label>
          ))}
          {pending.transmission && <button type="button" onClick={() => setPF('transmission', '')} className="text-xs text-[#00e5cc] mt-1">Limpar</button>}
        </div>
      </div>

      {/* Portas */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Portas</p>
        <div className="flex gap-2">
          {[2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setPF('doors', pending.doors === n ? undefined : n)}
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
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Cor</p>
        <select value={pending.color} onChange={e => setPF('color', e.target.value)} className={selectCls}>
          <option value="">Todas</option>
          {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Cavalos / Cilindradas */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
          {pending.category === 'MOTOS' ? 'Cilindradas (cc)' : 'Cavalos (cv)'}
        </p>
        <div className="flex gap-2">
          <input type="number" placeholder="Mín" value={pending.minEngineCC ?? ''} onChange={e => setPF('minEngineCC', e.target.value ? Number(e.target.value) : undefined)} className={inputCls} />
          <input type="number" placeholder="Máx" value={pending.maxEngineCC ?? ''} onChange={e => setPF('maxEngineCC', e.target.value ? Number(e.target.value) : undefined)} className={inputCls} />
        </div>
      </div>

      {/* Valor */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Valor (R$)</p>
        <div className="flex gap-2">
          <input type="number" placeholder="Mín" value={pending.minPrice ?? ''} onChange={e => setPF('minPrice', e.target.value ? Number(e.target.value) : undefined)} className={inputCls} />
          <input type="number" placeholder="Máx" value={pending.maxPrice ?? ''} onChange={e => setPF('maxPrice', e.target.value ? Number(e.target.value) : undefined)} className={inputCls} />
        </div>
      </div>

      {/* KM */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">KM máximo</p>
        <input type="number" placeholder="Ex: 50000" value={pending.maxKm ?? ''} onChange={e => setPF('maxKm', e.target.value ? Number(e.target.value) : undefined)} className={inputCls} />
      </div>

      {/* Características Especiais */}
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Características Especiais</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={pending.bulletProof === true} onChange={e => setPF('bulletProof', e.target.checked ? true : undefined)} className="accent-[#00e5cc] w-4 h-4" />
            <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">Blindado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={pending.auction === true} onChange={e => setPF('auction', e.target.checked ? true : undefined)} className="accent-[#00e5cc] w-4 h-4" />
            <span className="text-sm text-white/60 group-hover:text-[#e8e8f4] transition-colors">Leilão</span>
          </label>
        </div>
      </div>

      {/* Ações */}
      <div className="space-y-2 pt-1">
        <button type="button" onClick={applyListingFilters} className="w-full py-2.5 text-sm font-semibold bg-[#00e5cc] text-[#07080e] rounded-lg hover:bg-[#00cdb8] transition-colors">
          Aplicar filtros
        </button>
        {activeFilterCount > 0 && (
          <button type="button" onClick={clearFilters} className="w-full py-2 text-sm text-red-400 border border-red-400/20 rounded-lg hover:bg-red-400/10 transition-colors">
            Limpar tudo ({activeFilterCount})
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1e2040] flex items-center justify-center shrink-0 border-2 border-[#1e2040] overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white/60">{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">{user.name}</h1>
              {user.is_verified && (
                <span className="flex items-center gap-1 text-xs text-[#00e5cc] bg-[#00e5cc12] border border-[#00e5cc22] rounded-full px-2 py-0.5">
                  <BadgeCheck size={12} />Verificado
                </span>
              )}
            </div>
            <p className="text-sm text-white/60 mt-0.5">{user.email}</p>
            {user.bio && <p className="text-sm text-white/60 mt-1 max-w-xs">{user.bio}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/criar-anuncio" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-[#00e5cc] text-[#07080e] hover:bg-[#00c8b4] transition-colors">
            <Plus size={14} />Novo Anúncio
          </Link>
          <button
            type="button"
            onClick={() => { markRead(); setTab('notifications') }}
            className="relative flex items-center gap-1.5 px-3 py-2 text-sm text-white/60 hover:text-[#e8e8f4] border border-[#1e2040] rounded-xl transition-colors"
          >
            <Bell size={14} />
            <span className="hidden sm:inline">Notificações</span>
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 rounded-full bg-[#00e5cc] text-[#07080e] text-[10px] font-bold flex items-center justify-center">
                {notifCount > 99 ? '99+' : notifCount}
              </span>
            )}
          </button>
          <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/60 hover:text-red-400 border border-[#1e2040] rounded-xl transition-colors">
            <LogOut size={14} /><span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e2040] mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              tab === t.key ? 'border-[#00e5cc] text-[#00e5cc]' : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <t.icon size={14} />
            <span>{t.label}</span>
            {t.key === 'notifications' && notifCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#00e5cc] text-[#07080e] text-[10px] font-bold leading-none">
                {notifCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Informações ── */}
      {tab === 'info' && (
        <div className="max-w-lg mx-auto rounded-2xl border border-[#1e2040] bg-[#0c0e1a] divide-y divide-[#1e2040]">
          {[
            { icon: Mail, label: 'E-mail', value: user.email },
            { icon: Phone, label: 'Telefone', value: user.phone ?? '—' },
            { icon: MapPin, label: 'Localização', value: [user.city, user.state].filter(Boolean).join(', ') || '—' },
            { icon: Calendar, label: 'Membro desde', value: new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) },
            { icon: BadgeCheck, label: 'Status', value: user.is_verified ? 'Conta verificada' : 'Conta não verificada' },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-lg bg-[#00e5cc0d] flex items-center justify-center shrink-0">
                <row.icon size={15} className="text-[#00e5cc]" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wide">{row.label}</p>
                <p className={`text-sm font-medium mt-0.5 ${row.label === 'Status' && user.is_verified ? 'text-[#00e5cc]' : 'text-[#e8e8f4]'}`}>
                  {row.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Meus Anúncios ── */}
      {tab === 'listings' && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <p className="text-sm text-white/60">{filteredListings.length} de {listings.length} anúncio{listings.length !== 1 ? 's' : ''}</p>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)} className="appearance-none bg-[#000000] border border-[#1e2040] rounded-lg pl-3 pr-8 py-2 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none cursor-pointer">
                  <option value="recente">Mais recentes</option>
                  <option value="menor_preco">Menor preço</option>
                  <option value="maior_preco">Maior preço</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
              </div>
              <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm border border-[#1e2040] rounded-lg text-white/60 hover:text-[#e8e8f4] hover:border-[#2e3060] transition-colors">
                <SlidersHorizontal size={15} />Filtros
                {activeFilterCount > 0 && <span className="w-4 h-4 text-xs bg-[#00e5cc] text-[#07080e] rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>}
              </button>
              <Link to="/criar-anuncio" className="flex items-center gap-1.5 text-sm text-[#00e5cc] border border-[#00e5cc30] hover:border-[#00e5cc] rounded-lg px-3 py-2 transition-colors">
                <Plus size={14} />Criar novo
              </Link>
            </div>
          </div>


          <div className="flex gap-8">
            <aside className="hidden lg:block w-52 shrink-0">
              <div className="sticky top-24 rounded-2xl border border-[#1e2040] bg-[#000000] p-5">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-5">Filtros</p>
                {filterPanel}
              </div>
            </aside>

            {sidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-50 flex">
                <button type="button" aria-label="Fechar" className="absolute inset-0 bg-black/60 w-full" onClick={() => setSidebarOpen(false)} />
                <div className="relative ml-auto w-72 bg-[#000000] border-l border-[#1e2040] h-full overflow-y-auto p-5">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Filtros</p>
                    <button type="button" onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-[#e8e8f4]"><X size={18} /></button>
                  </div>
                  {filterPanel}
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              {listingsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3].map(k => (
                    <div key={k} className="rounded-2xl bg-[#000000] border border-[#1e2040] animate-pulse">
                      <div className="aspect-video bg-[#1e2040] rounded-t-2xl" />
                      <div className="p-4 space-y-2"><div className="h-3 bg-[#1e2040] rounded w-1/3" /><div className="h-4 bg-[#1e2040] rounded w-2/3" /></div>
                    </div>
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#1e2040] rounded-2xl text-center">
                  <span className="text-4xl mb-4 opacity-20">🚗</span>
                  <p className="text-white/60 mb-4">{listings.length === 0 ? 'Você ainda não tem anúncios.' : 'Nenhum anúncio com esses filtros.'}</p>
                  {activeFilterCount > 0
                    ? <button type="button" onClick={clearFilters} className="text-sm text-[#00e5cc] hover:underline">Limpar filtros</button>
                    : <Link to="/criar-anuncio" className="text-sm text-[#00e5cc] hover:underline">Criar primeiro anúncio</Link>
                  }
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredListings.map(listing => (
                    <div key={listing.id} className="relative group">
                      <CarCard listing={listing} featured={listing.featured} />
                      <div className="absolute top-3 left-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          type="button"
                          onClick={() => { setBoostListing({ id: listing.id, title: listing.title }); setBoostAmount(''); setBoostPayment('') }}
                          className="p-1.5 rounded-lg bg-black/60 text-[#7b5cf0] hover:bg-black/80 hover:text-[#9d7ef0] transition-colors"
                          title="Melhorar anúncio"
                        >
                          ⚡
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(listing.id)}
                          className="p-1.5 rounded-lg bg-black/60 text-white/60 hover:text-red-400 hover:bg-black/80 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {deleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <button type="button" aria-label="Fechar" className="absolute inset-0 bg-black/70 w-full" onClick={() => setDeleteId(null)} />
              <div className="relative bg-[#0c0e1a] border border-[#1e2040] rounded-2xl p-6 max-w-sm w-full">
                <h3 className="text-base font-semibold text-white mb-2">Excluir anúncio?</h3>
                <p className="text-sm text-white/60 mb-5">Esta ação não pode ser desfeita.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm border border-[#1e2040] rounded-xl text-white/60 hover:text-white transition-colors">Cancelar</button>
                  <button type="button" onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors">Excluir</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Boost Modal ── */}
      {boostListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c0e1a] border border-[#1e2040] rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2040]">
              <div>
                <h2 className="text-base font-bold text-[#e8e8f4]">⚡ Melhorar Anúncio</h2>
                <p className="text-xs text-white/40 mt-0.5 truncate max-w-65">{boostListing.title}</p>
              </div>
              <button type="button" onClick={() => setBoostListing(null)} className="p-1.5 text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Como funciona */}
              <div className="p-4 rounded-xl bg-[#7b5cf0]/10 border border-[#7b5cf0]/25 space-y-2">
                <p className="text-xs font-semibold text-[#7b5cf0] uppercase tracking-wider">Como funciona</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Seu anúncio aparece em <span className="text-[#e8e8f4] font-medium">destaque na página inicial</span> para todos os visitantes.
                  Quanto maior o valor investido, mais à frente seu anúncio aparece em relação a outros em destaque.
                  O destaque permanece ativo enquanto o investimento estiver vigente.
                </p>
              </div>

              {/* Valor */}
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Valor a investir</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['10', '25', '50', '100'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setBoostAmount(v)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        boostAmount === v
                          ? 'bg-[#7b5cf0] border-[#7b5cf0] text-white'
                          : 'border-[#1e2040] text-white/60 hover:border-[#7b5cf0]/50 hover:text-white'
                      }`}
                    >
                      R$ {v}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ou digite outro valor"
                  value={!['10','25','50','100'].includes(boostAmount) ? boostAmount : ''}
                  onChange={e => setBoostAmount(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#07080e] border border-[#1e2040] rounded-xl px-4 py-2.5 text-sm text-[#e8e8f4] placeholder-white/30 focus:border-[#7b5cf0]/50 focus:outline-none transition-colors"
                />
              </div>

              {/* Forma de pagamento */}
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Forma de pagamento</p>
                <div className="flex flex-wrap gap-2">
                  {['PIX', 'Cartão de Crédito', 'Transferência'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBoostPayment(m)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        boostPayment === m
                          ? 'bg-[#7b5cf0] border-[#7b5cf0] text-white'
                          : 'border-[#1e2040] text-white/60 hover:border-[#7b5cf0]/50 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão finalizar */}
              <a
                href={
                  boostAmount && boostPayment
                    ? `https://wa.me/5599999999999?text=${encodeURIComponent(`Olá! Gostaria de destacar meu anúncio no AutoFácil.\n\nAnúncio: ${boostListing.title}\nID: ${boostListing.id}\nValor: R$ ${boostAmount}\nForma de pagamento: ${boostPayment}\n\nPode me ajudar?`)}`
                    : undefined
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => { if (!boostAmount || !boostPayment) e.preventDefault() }}
                className={`mt-1 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center transition-colors ${
                  boostAmount && boostPayment
                    ? 'bg-[#7b5cf0] hover:bg-[#6a4ee0] text-white'
                    : 'bg-[#1e2040] text-white/30 cursor-not-allowed'
                }`}
              >
                Finalizar Pagamento via WhatsApp
              </a>
              {(!boostAmount || !boostPayment) && (
                <p className="text-center text-xs text-white/30">Selecione o valor e a forma de pagamento</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Notificações ── */}
      {tab === 'notifications' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3 mb-5 p-4 rounded-2xl border border-[#1e2040] bg-[#000000]">
            <div className="flex items-center gap-2 text-white/60">
              <Filter size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Filtros</span>
            </div>
            <div className="flex flex-wrap gap-3 flex-1">
              <div>
                <label htmlFor="notif-from" className="block text-[10px] text-white/40 mb-1">De</label>
                <input id="notif-from" type="date" value={notifsFrom} onChange={e => { setNotifsFrom(e.target.value); setNotifsPage(1) }}
                  className="bg-[#07080e] border border-[#1e2040] rounded-lg px-3 py-1.5 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none scheme-dark" />
              </div>
              <div>
                <label htmlFor="notif-to" className="block text-[10px] text-white/40 mb-1">Até</label>
                <input id="notif-to" type="date" value={notifsTo} onChange={e => { setNotifsTo(e.target.value); setNotifsPage(1) }}
                  className="bg-[#07080e] border border-[#1e2040] rounded-lg px-3 py-1.5 text-sm text-[#e8e8f4] focus:border-[#00e5cc55] focus:outline-none scheme-dark" />
              </div>
              <div className="flex items-end">
                <label htmlFor="notif-unread" className="flex items-center gap-2 cursor-pointer pb-1.5">
                  <input id="notif-unread" type="checkbox" checked={notifsUnreadOnly} onChange={e => { setNotifsUnreadOnly(e.target.checked); setNotifsPage(1) }} className="accent-[#00e5cc]" />
                  <span className="text-sm text-white/60">Apenas não lidas</span>
                </label>
              </div>
              {(notifsFrom || notifsTo || notifsUnreadOnly) && (
                <div className="flex items-end">
                  <button type="button" onClick={() => { setNotifsFrom(''); setNotifsTo(''); setNotifsUnreadOnly(false); setNotifsPage(1) }}
                    className="pb-1.5 text-xs text-red-400 hover:underline">
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-white/40 ml-auto">{notifsTotal} notificação{notifsTotal !== 1 ? 'ões' : ''}</p>
          </div>

          {/* List */}
          <div className="rounded-2xl border border-[#1e2040] overflow-hidden">
            {notifsLoading ? (
              <div className="divide-y divide-[#1e2040]">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-[#1e2040] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-[#1e2040] rounded w-32" />
                      <div className="h-3 bg-[#1e2040] rounded w-3/4" />
                    </div>
                    <div className="h-3 bg-[#1e2040] rounded w-16" />
                  </div>
                ))}
              </div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bell size={36} className="text-white/10 mb-3" />
                <p className="text-white/60">Nenhuma notificação encontrada.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e2040]">
                {notifs.map(notif => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => navigate(`/anuncios/${notif.listing_id}#comment-${notif.id}`)}
                    className={`w-full flex items-start gap-4 px-5 py-4 hover:bg-white/2 transition-colors text-left ${!notif.is_read ? 'bg-[#00e5cc05]' : ''}`}
                  >
                    {/* Unread dot */}
                    <div className="shrink-0 mt-2">
                      <div className={`w-2 h-2 rounded-full ${notif.is_read ? 'bg-transparent' : 'bg-[#00e5cc]'}`} />
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[#1e2040] flex items-center justify-center shrink-0 overflow-hidden">
                      {notif.author.avatar_url ? (
                        <img src={notif.author.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-white/50">{notif.author.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3 mb-0.5">
                        <span className={`text-sm font-semibold truncate ${!notif.is_read ? 'text-[#e8e8f4]' : 'text-white/70'}`}>
                          {notif.author.name}
                        </span>
                        <span className="text-xs text-white/40 shrink-0">{timeAgo(notif.created_at)}</span>
                      </div>
                      <p className="text-xs text-white/40 truncate mb-1">
                        {notif.notification_type === 'reply'
                          ? 'Respondeu seu comentário'
                          : notif.listing_title}
                      </p>
                      {notif.notification_type === 'reply' && notif.parent_body && (
                        <p className="text-xs text-white/25 italic truncate mb-1">"{notif.parent_body}"</p>
                      )}
                      <p className={`text-sm line-clamp-2 leading-relaxed ${!notif.is_read ? 'text-white/70' : 'text-white/50'}`}>
                        {notif.body}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {notifsPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button type="button" disabled={notifsPage === 1} onClick={() => setNotifsPage(p => p - 1)}
                className="flex items-center gap-1 px-4 py-2 text-sm border border-[#1e2040] rounded-lg text-white/60 hover:border-[#2e3060] hover:text-[#e8e8f4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} />Anterior
              </button>
              <span className="text-sm text-white/40 px-2">{notifsPage} / {notifsPages}</span>
              <button type="button" disabled={notifsPage === notifsPages} onClick={() => setNotifsPage(p => p + 1)}
                className="flex items-center gap-1 px-4 py-2 text-sm border border-[#1e2040] rounded-lg text-white/60 hover:border-[#2e3060] hover:text-[#e8e8f4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Próxima<ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Editar Perfil ── */}
      {tab === 'edit' && (
        <form onSubmit={handleEdit} className="space-y-5 max-w-2xl mx-auto">

          {/* Photo upload */}
          <div className="rounded-2xl border border-[#1e2040] bg-[#0c0e1a] p-5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Foto de perfil</p>
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full bg-[#1e2040] overflow-hidden border-2 border-[#1e2040]">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={28} className="text-white/30" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00e5cc] text-[#07080e] flex items-center justify-center hover:bg-[#00c8b4] transition-colors shadow-lg"
                  title="Alterar foto"
                >
                  <Camera size={13} />
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
              <div>
                <p className="text-sm text-[#e8e8f4] font-medium">{user.name}</p>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="text-sm text-[#00e5cc] hover:underline mt-1"
                >
                  Alterar foto
                </button>
                {avatarPreview && avatarPreview !== user.avatar_url && (
                  <button
                    type="button"
                    onClick={() => setAvatarPreview(user.avatar_url ?? null)}
                    className="block text-xs text-white/40 hover:text-red-400 transition-colors mt-0.5"
                  >
                    Remover alteração
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1e2040] bg-[#0c0e1a] p-5 space-y-4">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Dados pessoais</p>
            <div>
              <label htmlFor="edit-name" className={labelClass}>Nome completo</label>
              <input id="edit-name" type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label htmlFor="edit-email" className={labelClass}>E-mail</label>
              <input id="edit-email" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label htmlFor="edit-phone" className={labelClass}>Telefone</label>
              <input id="edit-phone" type="text" placeholder="(11) 99999-9999" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label htmlFor="edit-bio" className={labelClass}>Bio</label>
              <textarea id="edit-bio" rows={3} placeholder="Conte um pouco sobre você..." value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#1e2040] bg-[#0c0e1a] p-5 space-y-4">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Localização</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-city" className={labelClass}>Cidade</label>
                <input id="edit-city" type="text" value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label htmlFor="edit-state" className={labelClass}>Estado</label>
                <select id="edit-state" value={editForm.state} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))} className={`${inputClass} appearance-none`}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1e2040] bg-[#0c0e1a] p-5 space-y-4">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Segurança</p>
            <div>
              <label htmlFor="edit-password" className={labelClass}>Nova senha</label>
              <input id="edit-password" type="password" placeholder="Deixe em branco para não alterar" minLength={8} value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} className={inputClass} />
            </div>
          </div>

          {editError && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{editError}</p>}
          {editSuccess && (
            <div className="flex items-center gap-2 text-sm text-[#00e5cc] bg-[#00e5cc10] border border-[#00e5cc30] rounded-xl px-4 py-3">
              <CheckCircle size={15} />Perfil atualizado com sucesso!
            </div>
          )}

          <button type="submit" disabled={editLoading} className="w-full py-3.5 bg-[#00e5cc] text-[#07080e] font-semibold rounded-xl hover:bg-[#00c8b4] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {editLoading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      )}
    </div>
  )
}
