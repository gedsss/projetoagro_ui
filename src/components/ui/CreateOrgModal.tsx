import { useRef, useState } from 'react'
import { Building2, Camera, Loader2, User, X } from 'lucide-react'
import { organizationsService } from '../../services/api'
import type { Organization } from '../../types/api'

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const inputClass = 'w-full bg-[#07080e] border border-[#1e2040] rounded-xl px-4 py-3 text-sm text-[#e8e8f4] placeholder-white/30 focus:border-[#00e5cc55] focus:outline-none transition-colors'
const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatCnpj(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

interface Props {
  onClose: () => void
  onCreated: (org: Organization) => void
}

export function CreateOrgModal({ onClose, onCreated }: Props) {
  const logoRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', cnpj: '', description: '', phone: '',
    email: '', website: '', city: '', state: 'SP', address: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await fileToBase64(file)
    setLogoPreview(b64)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const rawCnpj = form.cnpj.replace(/\D/g, '')
    if (rawCnpj.length !== 14) { setError('CNPJ deve ter 14 dígitos.'); return }
    setLoading(true)
    try {
      const res = await organizationsService.create({
        name: form.name,
        cnpj: rawCnpj,
        logo_url: logoPreview ?? undefined,
        description: form.description || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        address: form.address || undefined,
      })
      onCreated(res.data.data)
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Erro ao criar organização.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-black/70 w-full" onClick={onClose} />

      <div className="relative bg-[#0c0e1a] border border-[#1e2040] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2040] sticky top-0 bg-[#0c0e1a] z-10">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-[#00e5cc]" />
            <h2 className="text-base font-semibold text-[#e8e8f4]">Criar Organização</h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-[#1e2040] overflow-hidden border border-[#2e3060] flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={28} className="text-white/20" />
                )}
              </div>
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00e5cc] text-[#07080e] flex items-center justify-center hover:bg-[#00c8b4] transition-colors shadow-md"
              >
                <Camera size={13} />
              </button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#e8e8f4]">Logo da organização</p>
              <button type="button" onClick={() => logoRef.current?.click()} className="text-sm text-[#00e5cc] hover:underline mt-0.5">
                {logoPreview ? 'Alterar logo' : 'Adicionar logo'}
              </button>
              <p className="text-xs text-white/30 mt-0.5">JPG, PNG · recomendado 200×200</p>
            </div>
          </div>

          {/* Dados principais */}
          <div className="space-y-4">
            <div>
              <label htmlFor="org-name" className={labelClass}>Nome da organização *</label>
              <input id="org-name" type="text" required placeholder="Ex: Garage Premium Veículos" value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} maxLength={200} />
            </div>
            <div>
              <label htmlFor="org-cnpj" className={labelClass}>CNPJ *</label>
              <input
                id="org-cnpj"
                type="text"
                required
                placeholder="00.000.000/0000-00"
                value={formatCnpj(form.cnpj)}
                onChange={e => set('cnpj', e.target.value)}
                className={inputClass}
                maxLength={18}
              />
            </div>
            <div>
              <label htmlFor="org-desc" className={labelClass}>Descrição</label>
              <textarea id="org-desc" rows={3} placeholder="Breve descrição da organização, especialidade, etc." value={form.description} onChange={e => set('description', e.target.value)} className={`${inputClass} resize-none`} />
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Contato</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="org-phone" className={labelClass}>Telefone</label>
                <input id="org-phone" type="text" placeholder="(11) 99999-9999" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="org-email" className={labelClass}>E-mail</label>
                <input id="org-email" type="email" placeholder="contato@garage.com" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="org-website" className={labelClass}>Website</label>
              <input id="org-website" type="text" placeholder="https://www.garage.com" value={form.website} onChange={e => set('website', e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Endereço</p>
            <div>
              <label htmlFor="org-address" className={labelClass}>Logradouro</label>
              <input id="org-address" type="text" placeholder="Rua, número, bairro" value={form.address} onChange={e => set('address', e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="org-city" className={labelClass}>Cidade</label>
                <input id="org-city" type="text" placeholder="São Paulo" value={form.city} onChange={e => set('city', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="org-state" className={labelClass}>Estado</label>
                <select id="org-state" value={form.state} onChange={e => set('state', e.target.value)} className={`${inputClass} appearance-none`}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm border border-[#1e2040] rounded-xl text-white/60 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#00e5cc] text-[#07080e] font-semibold rounded-xl hover:bg-[#00c8b4] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Criando...' : 'Criar Organização'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
