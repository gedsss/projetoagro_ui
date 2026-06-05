import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, ImagePlus, Loader2, X } from 'lucide-react'
import { listingImagesService, listingsService } from '../../services/api'
import { fipeService, type FipeMarca, type FipeModelo, type FipeAno, type FipePreco } from '../../services/fipe'

// ── Constants ──────────────────────────────────────────────────────────────────

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const MAX_IMAGES = 10
const YEAR_NOW = new Date().getFullYear()
const STEP_LABELS = ['Tipo', 'Veículo', 'Opcionais', 'Anúncio', 'Fotos', 'Revisão']

const CATEGORIES = [
  { value: 'SEDANS', label: 'Sedan' },
  { value: 'SUVS', label: 'SUV' },
  { value: 'PICKUPS', label: 'Pickup' },
  { value: 'MOTOS', label: 'Moto' },
  { value: 'CLASSICOS', label: 'Coupé' },
  { value: 'VANS', label: 'Van / Utilitário' },
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

const COLORS = ['Branco','Preto','Prata','Cinza','Vermelho','Azul','Verde','Amarelo','Laranja','Bege','Marrom','Roxo','Dourado','Outro']

const SECURITY_OPT = [
  { value: 'ABS', label: 'ABS' },
  { value: 'DISTRIBUICAO_FRENAGEM', label: 'Dist. de frenagem' },
  { value: 'ASSISTENTE_FRENAGEM', label: 'Assist. de frenagem' },
  { value: 'CONTROLE_ESTABILIDADE', label: 'Controle de estabilidade' },
  { value: 'CONTROLE_TRACAO', label: 'Controle de tração' },
  { value: 'ASSISTENTE_RAMPA', label: 'Assistente de rampa' },
  { value: 'CRUISE_ADAPTATIVO', label: 'Cruise adaptativo' },
  { value: 'FRENAGEM_AUTONOMA', label: 'Frenagem autônoma' },
  { value: 'MONITOR_PONTO_CEGO', label: 'Monitor ponto cego' },
  { value: 'ASSISTENTE_FAIXA', label: 'Assistente de faixa' },
  { value: 'AVISO_COLISAO_FRONTAL', label: 'Aviso colisão frontal' },
  { value: 'AVISO_TRAFEGO_TRASEIRO', label: 'Aviso tráfego traseiro' },
  { value: 'AIRBAG_FRONTAL', label: 'Airbag frontal' },
  { value: 'AIRBAG_LATERAL', label: 'Airbag lateral' },
  { value: 'AIRBAG_CORTINA', label: 'Airbag cortina' },
  { value: 'AIRBAG_JOELHO', label: 'Airbag joelho' },
  { value: 'CAMERA_RE', label: 'Câmera de ré' },
  { value: 'CAMERA_360', label: 'Câmera 360°' },
  { value: 'SENSOR_ESTACIONAMENTO', label: 'Sensor de estac.' },
  { value: 'ESTACIONAMENTO_AUTONOMO', label: 'Estac. autônomo' },
  { value: 'ISOFIX', label: 'ISOFIX' },
  { value: 'CINTO_PRETENSIONADOR', label: 'Cinto pretensionador' },
  { value: 'IMOBILIZADOR', label: 'Imobilizador' },
  { value: 'ALARME', label: 'Alarme' },
  { value: 'ENTRADA_SEM_CHAVE', label: 'Entrada sem chave' },
  { value: 'RASTREADOR', label: 'Rastreador' },
  { value: 'MONITOR_PRESSAO_PNEUS', label: 'Monitor pressão pneus' },
  { value: 'PNEU_RUN_FLAT', label: 'Pneu run flat' },
]

const COMFORT_OPT = [
  { value: 'AR_CONDICIONADO', label: 'Ar-condicionado' },
  { value: 'AR_CONDICIONADO_DIGITAL', label: 'Ar-cond. digital' },
  { value: 'AR_CONDICIONADO_DUAL_ZONE', label: 'Dual zone' },
  { value: 'AR_CONDICIONADO_TRI_ZONE', label: 'Tri zone' },
  { value: 'BANCO_AQUECIDO', label: 'Banco aquecido' },
  { value: 'BANCO_VENTILADO', label: 'Banco ventilado' },
  { value: 'BANCO_MASSAGEADOR', label: 'Banco massageador' },
  { value: 'BANCO_ELETRICO', label: 'Banco elétrico' },
  { value: 'BANCO_MEMORIA', label: 'Banco com memória' },
  { value: 'BANCO_COURO', label: 'Banco de couro' },
  { value: 'VOLANTE_AQUECIDO', label: 'Volante aquecido' },
  { value: 'VOLANTE_MULTIMIDIA', label: 'Volante multimídia' },
  { value: 'VOLANTE_REGULAGEM_ELETRICA', label: 'Volante elétrico' },
  { value: 'TETO_SOLAR', label: 'Teto solar' },
  { value: 'TETO_PANORAMICO', label: 'Teto panorâmico' },
  { value: 'VIDRO_ELETRICO', label: 'Vidro elétrico' },
  { value: 'VIDRO_ELETRICO_TRASEIRO', label: 'Vidro elétrico tras.' },
  { value: 'RETROVISOR_ELETRICO', label: 'Retrovisor elétrico' },
  { value: 'RETROVISOR_FOTOCROMATICO', label: 'Retrovisor fotocrôm.' },
  { value: 'CHAVE_PRESENCIAL', label: 'Chave presencial' },
  { value: 'PARTIDA_BOTAO', label: 'Partida por botão' },
  { value: 'PORTA_MALAS_ELETRICO', label: 'Porta-malas elétrico' },
  { value: 'PORTA_MALAS_HANDS_FREE', label: 'Porta-malas hands-free' },
  { value: 'CARREGADOR_WIRELESS', label: 'Carregador wireless' },
  { value: 'TOMADA_USB', label: 'Tomada USB' },
  { value: 'TOMADA_110V', label: 'Tomada 110V' },
  { value: 'SISTEMA_SOM_PREMIUM', label: 'Som premium' },
  { value: 'PAINEL_DIGITAL', label: 'Painel digital' },
  { value: 'HEAD_UP_DISPLAY', label: 'Head-up display' },
  { value: 'NAVEGACAO_GPS', label: 'Navegação GPS' },
  { value: 'CONTROLE_CRUZEIRO', label: 'Controle de cruzeiro' },
  { value: 'SUSPENSAO_ADAPTATIVA', label: 'Suspensão adaptativa' },
  { value: 'ILUMINACAO_AMBIENTE', label: 'Iluminação ambiente' },
  { value: 'CORTINA_ELETRICA_TRASEIRA', label: 'Cortina elétrica tras.' },
]

const TECH_OPT = [
  { value: 'CENTRAL_MULTIMIDIA', label: 'Central multimídia' },
  { value: 'TELA_TOUCHSCREEN', label: 'Tela touchscreen' },
  { value: 'APPLE_CARPLAY', label: 'Apple CarPlay' },
  { value: 'ANDROID_AUTO', label: 'Android Auto' },
  { value: 'BLUETOOTH', label: 'Bluetooth' },
  { value: 'WIFI_BORDO', label: 'Wi-Fi a bordo' },
  { value: 'ENTRADA_USB', label: 'Entrada USB' },
  { value: 'ENTRADA_HDMI', label: 'Entrada HDMI' },
  { value: 'CARREGADOR_WIRELESS', label: 'Carregador wireless' },
  { value: 'RECONHECIMENTO_VOZ', label: 'Reconhec. de voz' },
  { value: 'ASSISTENTE_VIRTUAL', label: 'Assistente virtual' },
  { value: 'PILOTO_AUTOMATICO', label: 'Piloto automático' },
  { value: 'ATUALIZACAO_OTA', label: 'Atualização OTA' },
  { value: 'CONTROLE_REMOTO_APP', label: 'Controle remoto app' },
  { value: 'PARTIDA_REMOTA', label: 'Partida remota' },
  { value: 'MONITORAMENTO_MOTORISTA', label: 'Monitor. motorista' },
  { value: 'FAROL_ADAPTATIVO', label: 'Farol adaptativo' },
  { value: 'FAROL_LED', label: 'Farol LED' },
  { value: 'FAROL_LASER', label: 'Farol laser' },
  { value: 'CONEXAO_4G', label: 'Conexão 4G' },
  { value: 'CONEXAO_5G', label: 'Conexão 5G' },
  { value: 'SUBWOOFER', label: 'Subwoofer' },
  { value: 'AMPLIFICADOR', label: 'Amplificador' },
  { value: 'TELA_TRASEIRA', label: 'Tela traseira' },
  { value: 'ESPELHO_RETROVISOR_CAMERA', label: 'Retrovisor c/ câmera' },
]

const MECHANIC_OPT = [
  { value: 'MOTOR_ASPIRADO', label: 'Motor aspirado' },
  { value: 'MOTOR_TURBO', label: 'Motor turbo' },
  { value: 'MOTOR_BITURBO', label: 'Motor biturbo' },
  { value: 'MOTOR_HIBRIDO', label: 'Motor híbrido' },
  { value: 'MOTOR_HIBRIDO_PLUG_IN', label: 'Híbrido plug-in' },
  { value: 'MOTOR_ELETRICO', label: 'Motor elétrico' },
  { value: 'MOTOR_FLEX', label: 'Motor flex' },
  { value: 'MOTOR_DIESEL', label: 'Motor diesel' },
  { value: 'MOTOR_GNV', label: 'Motor GNV' },
  { value: 'TRACAO_DIANTEIRA', label: 'Tração dianteira' },
  { value: 'TRACAO_TRASEIRA', label: 'Tração traseira' },
  { value: 'TRACAO_INTEGRAL', label: 'Tração integral' },
  { value: 'TRACAO_4X4', label: '4×4' },
  { value: 'TRACAO_4X4_REDUCAO', label: '4×4 com redução' },
  { value: 'DIRECAO_HIDRAULICA', label: 'Direção hidráulica' },
  { value: 'DIRECAO_ELETRICA', label: 'Direção elétrica' },
  { value: 'DIRECAO_ELETRO_HIDRAULICA', label: 'Dir. eletro-hidráulica' },
  { value: 'SUSPENSAO_INDEPENDENTE', label: 'Susp. independente' },
  { value: 'SUSPENSAO_MULTILINK', label: 'Susp. multilink' },
  { value: 'SUSPENSAO_MOLA', label: 'Susp. a mola' },
  { value: 'SUSPENSAO_AR', label: 'Susp. a ar' },
  { value: 'FREIO_DISCO_DIANTEIRO', label: 'Freio disco diant.' },
  { value: 'FREIO_DISCO_TRASEIRO', label: 'Freio disco traseiro' },
  { value: 'FREIO_TAMBOR_TRASEIRO', label: 'Freio tambor traseiro' },
  { value: 'DIFERENCIAL_ELETRONICO', label: 'Dif. eletrônico' },
  { value: 'DIFERENCIAL_MECANICO', label: 'Dif. mecânico' },
  { value: 'BLOQUEIO_DIFERENCIAL', label: 'Bloqueio de dif.' },
  { value: 'ESCAPE_ESPORTIVO', label: 'Escape esportivo' },
  { value: 'START_STOP', label: 'Start/Stop' },
  { value: 'RECUPERACAO_ENERGIA', label: 'Recuperação de energia' },
  { value: 'BATERIA_LITIO', label: 'Bateria de lítio' },
  { value: 'CARREGAMENTO_RAPIDO', label: 'Carregamento rápido' },
  { value: 'MODO_CONDUCAO', label: 'Modos de condução' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function getFipeTipo(category: string): string {
  if (category === 'MOTOS') return 'motos'
  if (category === 'CAMINHOES' || category === 'VANS') return 'caminhoes'
  return 'carros'
}

function getTokenId(): string | null {
  const token = localStorage.getItem('token')
  if (!token) return null
  try { return JSON.parse(atob(token.split('.')[1])).id } catch { return null }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}

function maskCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
}

function maskKM(v: string) {
  return v.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function maskYear(v: string) {
  return v.replace(/\D/g, '').slice(0, 4)
}

function toggleArr(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? 'bg-[#00e5cc] border-[#00e5cc] text-[#07080e]'
          : 'border-[#1e2040] text-white/60 hover:border-[#2e3060] hover:text-[#e8e8f4]'
      }`}
    >
      {label}
    </button>
  )
}

function Toggle({ id, label, description, checked, onChange }: {
  id: string; label: string; description?: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label htmlFor={id} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors select-none ${
      checked ? 'border-[#00e5cc55] bg-[#00e5cc08]' : 'border-[#1e2040] hover:border-[#2e3060]'
    }`}>
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
      <div className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-[#00e5cc]' : 'bg-[#2e3060]'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-[#e8e8f4]">{label}</p>
        {description && <p className="text-xs text-white/40">{description}</p>}
      </div>
    </label>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1e2040] last:border-0">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-sm font-medium text-[#e8e8f4]">{value}</span>
    </div>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface ImageItem {
  id: number
  file: File | null
  preview: string
  url: string
  uploading: boolean
  error: string
}

const inputClass = 'w-full bg-[#07080e] border border-[#1e2040] rounded-xl px-4 py-3 text-sm text-[#e8e8f4] placeholder-white/30 focus:border-[#00e5cc55] focus:outline-none transition-colors'
const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'
const cardClass = 'rounded-2xl border border-[#1e2040] bg-[#0c0e1a] p-5 space-y-4'

// ── Main ───────────────────────────────────────────────────────────────────────

export default function CriarAnuncio() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<ImageItem[]>([])
  const [dragging, setDragging] = useState(false)

  const [security, setSecurity] = useState<string[]>([])
  const [comfort, setComfort] = useState<string[]>([])
  const [technology, setTechnology] = useState<string[]>([])
  const [mechanic, setMechanic] = useState<string[]>([])

  // FIPE state
  const [fipeMarcas, setFipeMarcas] = useState<FipeMarca[]>([])
  const [fipeModelos, setFipeModelos] = useState<FipeModelo[]>([])
  const [fipeAnos, setFipeAnos] = useState<FipeAno[]>([])
  const [fipePreco, setFipePreco] = useState<FipePreco | null>(null)
  const [fipeSel, setFipeSel] = useState({ codMarca: '', codModelo: '', codAno: '' })
  const [fipeLoading, setFipeLoading] = useState(false)

  // Cities (IBGE)
  const [cities, setCities] = useState<string[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)

  const [form, setForm] = useState({
    category: '', condition: '', bullet_proof: false, auction: false,
    brand: '', model: '', popular_name: '', plate: '', fipe_code: '',
    year_model: String(YEAR_NOW), year_manuf: '', km: '', fuel: '',
    transmission: '', doors: '', engine_cc: '', color: '',
    title: '', description: '', observation: '',
    price: '', price_negotiable: true, accepts_trade: false,
    city: '', state: '', cep: '',
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  // Carrega marcas ao entrar no step 1
  useEffect(() => {
    if (step !== 1 || !form.category) return
    const tipo = getFipeTipo(form.category)
    setFipeLoading(true)
    fipeService.getMarcas(tipo)
      .then(setFipeMarcas)
      .catch(() => {})
      .finally(() => setFipeLoading(false))
  }, [step, form.category])

  // Carrega cidades do estado via IBGE
  useEffect(() => {
    if (!form.state) {
      setCities([])
      setForm(prev => ({ ...prev, city: '' }))
      return
    }
    setCitiesLoading(true)
    setForm(prev => ({ ...prev, city: '' }))
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${form.state}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then((data: { nome: string }[]) => setCities(data.map(c => c.nome)))
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false))
  }, [form.state])

  // Carrega modelos ao selecionar marca
  async function handleMarcaChange(codMarca: string) {
    const tipo = getFipeTipo(form.category)
    const marca = fipeMarcas.find(m => m.codigo === codMarca)
    setFipeSel({ codMarca, codModelo: '', codAno: '' })
    setFipeModelos([])
    setFipeAnos([])
    setFipePreco(null)
    set('brand', marca?.nome ?? '')
    set('model', '')
    set('fipe_code', '')
    if (!codMarca) return
    setFipeLoading(true)
    fipeService.getModelos(tipo, codMarca)
      .then(setFipeModelos)
      .catch(() => {})
      .finally(() => setFipeLoading(false))
  }

  // Carrega anos ao selecionar modelo
  async function handleModeloChange(codModelo: string) {
    const tipo = getFipeTipo(form.category)
    const modelo = fipeModelos.find(m => String(m.codigo) === codModelo)
    setFipeSel(prev => ({ ...prev, codModelo, codAno: '' }))
    setFipeAnos([])
    setFipePreco(null)
    set('model', modelo?.nome ?? '')
    set('fipe_code', '')
    if (!codModelo) return
    setFipeLoading(true)
    fipeService.getAnos(tipo, fipeSel.codMarca, codModelo)
      .then(setFipeAnos)
      .catch(() => {})
      .finally(() => setFipeLoading(false))
  }

  // Busca preço ao selecionar ano
  async function handleAnoChange(codAno: string) {
    const tipo = getFipeTipo(form.category)
    const ano = fipeAnos.find(a => a.codigo === codAno)
    const yearNum = ano ? parseInt(ano.nome) : YEAR_NOW
    setFipeSel(prev => ({ ...prev, codAno }))
    setFipePreco(null)
    set('year_model', String(yearNum))
    set('fipe_code', '')
    if (!codAno) return
    setFipeLoading(true)
    fipeService.getPreco(tipo, fipeSel.codMarca, fipeSel.codModelo, codAno)
      .then(preco => {
        setFipePreco(preco)
        set('fipe_code', preco.CodigoFipe)
      })
      .catch(() => {})
      .finally(() => setFipeLoading(false))
  }

  function validateStep(): string {
    if (step === 0) {
      if (!form.category) return 'Selecione uma categoria'
      if (!form.condition) return 'Selecione a condição do veículo'
    }
    if (step === 1) {
      if (!form.brand.trim()) return 'Selecione ou informe a marca'
      if (!form.model.trim()) return 'Selecione ou informe o modelo'
      if (!form.plate.trim()) return 'Informe a placa'
      if (form.plate.length !== 7) return 'Placa deve ter 7 caracteres (ex: ABC1D23)'
      if (!form.fuel) return 'Selecione o combustível'
      if (!form.transmission) return 'Selecione o câmbio'
    }
    if (step === 3) {
      if (!form.title.trim()) return 'Informe o título do anúncio'
      if (!form.price) return 'Informe o preço'
      if (!form.state) return 'Selecione o estado'
      if (!form.city) return 'Selecione a cidade'
    }
    return ''
  }

  function goNext() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    setError('')
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function addFiles(files: FileList | null) {
    if (!files) return
    const remaining = MAX_IMAGES - images.length
    const toAdd = Array.from(files).slice(0, remaining)
    setImages(prev => [...prev, ...toAdd.map(file => ({
      id: Date.now() + Math.random(),
      file, preview: URL.createObjectURL(file), url: '', uploading: false, error: '',
    }))])
  }

  function removeImage(id: number) {
    setImages(prev => {
      const item = prev.find(i => i.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return prev.filter(i => i.id !== id)
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  async function uploadAll(): Promise<string[]> {
    const urls: string[] = []
    for (const item of images) {
      if (item.url) { urls.push(item.url); continue }
      if (!item.file) continue
      setImages(prev => prev.map(i => i.id === item.id ? { ...i, uploading: true, error: '' } : i))
      try {
        const url = await fileToBase64(item.file)
        setImages(prev => prev.map(i => i.id === item.id ? { ...i, uploading: false, url } : i))
        urls.push(url)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao enviar'
        setImages(prev => prev.map(i => i.id === item.id ? { ...i, uploading: false, error: msg } : i))
        throw new Error(msg)
      }
    }
    return urls
  }

  async function handleSubmit() {
    const sellerId = getTokenId()
    if (!sellerId) { navigate('/login'); return }

    setLoading(true)
    setError('')
    try {
      const imageUrls = images.length > 0 ? await uploadAll() : []
      const toInt = (v: string) => { const n = parseInt(v, 10); return Number.isNaN(n) ? undefined : n }

      const res = await listingsService.create({
        seller_id: sellerId,
        title: form.title,
        brand: form.brand,
        model: form.model,
        popular_name: form.popular_name || undefined,
        plate: form.plate.toUpperCase(),
        fipe_code: form.fipe_code || undefined,
        category: form.category,
        condition: form.condition,
        fuel: form.fuel,
        transmission: form.transmission,
        year_model: toInt(form.year_model) ?? YEAR_NOW,
        year_manuf: form.year_manuf ? toInt(form.year_manuf) : undefined,
        km: form.km ? toInt(form.km) : undefined,
        doors: form.doors ? toInt(form.doors) : undefined,
        engine_cc: form.engine_cc ? toInt(form.engine_cc) : undefined,
        color: form.color || undefined,
        bullet_proof: form.bullet_proof,
        auction: form.auction,
        price: parseFloat(form.price) || 0,
        price_negotiable: form.price_negotiable,
        accepts_trade: form.accepts_trade,
        city: form.city,
        state: form.state,
        cep: form.cep.replace(/\D/g, '') || undefined,
        description: form.description || undefined,
        observation: form.observation || undefined,
        security_components: security,
        comfort_components: comfort,
        technology_components: technology,
        mechanic_components: mechanic,
        status: 'ATIVO',
      })

      const listingId = res.data.data.id
      await Promise.all(imageUrls.map((url, i) => listingImagesService.create(listingId, url, i)))
      setSuccess(true)
      setTimeout(() => navigate('/perfil?tab=listings'), 1800)
    } catch (err: unknown) {
      console.error('[CriarAnuncio] erro ao criar:', err)
      const e = err as { response?: { data?: { message?: string | string[] } }; message?: string }
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? (err as Error)?.message ?? 'Erro ao criar anúncio.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-6">
        <ArrowLeft size={15} />Voltar
      </button>

      <h1 className="text-2xl font-bold text-white mb-1">Criar Anúncio</h1>
      <p className="text-sm text-white/60 mb-6">Preencha os dados do veículo que deseja anunciar</p>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => { if (i < step) { setError(''); setStep(i) } }}
              disabled={i > step}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                i === step
                  ? 'bg-[#00e5cc] text-[#07080e]'
                  : i < step
                  ? 'bg-[#00e5cc20] text-[#00e5cc] hover:bg-[#00e5cc30] cursor-pointer'
                  : 'bg-[#0c0e1a] border border-[#1e2040] text-white/30 cursor-default'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i === step ? 'bg-[#07080e]/20 text-[#07080e]' : i < step ? 'bg-[#00e5cc] text-[#07080e]' : 'bg-[#1e2040] text-white/30'
              }`}>
                {i < step ? '✓' : i + 1}
              </span>
              {label}
            </button>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-px w-3 ${i < step ? 'bg-[#00e5cc40]' : 'bg-[#1e2040]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 0: Tipo ── */}
      {step === 0 && (
        <div className="space-y-5">
          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Categoria *</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <Chip key={c.value} label={c.label} active={form.category === c.value} onClick={() => set('category', c.value)} />
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Condição *</p>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(c => (
                <Chip key={c.value} label={c.label} active={form.condition === c.value} onClick={() => set('condition', c.value)} />
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Características especiais</p>
            <div className="space-y-2">
              <Toggle id="bullet_proof" label="Blindado" description="O veículo possui blindagem" checked={form.bullet_proof} onChange={v => set('bullet_proof', v)} />
              <Toggle id="auction" label="Leilão" description="Veículo proveniente de leilão" checked={form.auction} onChange={v => set('auction', v)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: Veículo ── */}
      {step === 1 && (
        <div className="space-y-5">
          {/* FIPE cascading dropdowns */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Busca FIPE</p>
              {fipeLoading && <Loader2 size={13} className="text-[#00e5cc] animate-spin" />}
            </div>

            <div>
              <label className={labelClass}>Marca</label>
              <select
                value={fipeSel.codMarca}
                onChange={e => handleMarcaChange(e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Selecione a marca...</option>
                {fipeMarcas.map(m => (
                  <option key={m.codigo} value={m.codigo}>{m.nome}</option>
                ))}
              </select>
            </div>

            {fipeSel.codMarca && (
              <div>
                <label className={labelClass}>Modelo</label>
                <select
                  value={fipeSel.codModelo}
                  onChange={e => handleModeloChange(e.target.value)}
                  className={`${inputClass} appearance-none`}
                  disabled={fipeModelos.length === 0}
                >
                  <option value="">Selecione o modelo...</option>
                  {fipeModelos.map(m => (
                    <option key={m.codigo} value={String(m.codigo)}>{m.nome}</option>
                  ))}
                </select>
              </div>
            )}

            {fipeSel.codModelo && (
              <div>
                <label className={labelClass}>Ano / Versão</label>
                <select
                  value={fipeSel.codAno}
                  onChange={e => handleAnoChange(e.target.value)}
                  className={`${inputClass} appearance-none`}
                  disabled={fipeAnos.length === 0}
                >
                  <option value="">Selecione o ano...</option>
                  {fipeAnos.map(a => (
                    <option key={a.codigo} value={a.codigo}>{a.nome}</option>
                  ))}
                </select>
              </div>
            )}

            {fipePreco && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#00e5cc0d] border border-[#00e5cc25]">
                <div>
                  <p className="text-xs text-white/50">Preço FIPE ({fipePreco.MesReferencia})</p>
                  <p className="text-lg font-bold text-[#00e5cc]">{fipePreco.Valor}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Código FIPE</p>
                  <p className="text-sm font-mono text-white/70">{fipePreco.CodigoFipe}</p>
                </div>
              </div>
            )}
          </div>

          {/* Manual fields (pre-filled by FIPE or editable) */}
          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Identificação</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="popular_name" className={labelClass}>Nome popular</label>
                <input id="popular_name" type="text" placeholder="Ex: Cívico" value={form.popular_name} onChange={e => set('popular_name', e.target.value)} className={inputClass} maxLength={20} />
              </div>
              <div>
                <label htmlFor="plate" className={labelClass}>Placa *</label>
                <input
                  id="plate"
                  type="text"
                  placeholder="ABC1D23"
                  value={form.plate}
                  onChange={e => set('plate', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}
                  className={inputClass}
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Dados do veículo</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="year_model" className={labelClass}>Ano modelo *</label>
                <input id="year_model" type="text" inputMode="numeric" maxLength={4} placeholder={String(YEAR_NOW)} value={form.year_model} onChange={e => set('year_model', maskYear(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label htmlFor="year_manuf" className={labelClass}>Ano fabricação</label>
                <input id="year_manuf" type="text" inputMode="numeric" maxLength={4} placeholder="Opcional" value={form.year_manuf} onChange={e => set('year_manuf', maskYear(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label htmlFor="km" className={labelClass}>Quilometragem</label>
                <input id="km" type="text" inputMode="numeric" placeholder="Ex: 45.000 km" value={form.km ? `${maskKM(form.km)} km` : ''} onChange={e => set('km', e.target.value.replace(/\D/g, ''))} className={inputClass} />
              </div>
            </div>
            {form.category === 'MOTOS' && (<div>
              <label htmlFor="engine_cc" className={labelClass}>Cilindradas (cc)</label>
              <input id="engine_cc" type="number" min={0} placeholder="Ex: 1600" value={form.engine_cc} onChange={e => set('engine_cc', e.target.value)} className={inputClass} />
            </div>)}
            {form.category !== 'MOTOS' && (<div>
              <label htmlFor="engine_cc" className={labelClass}>Cavalos (cv)</label>
              <input id="engine_cc" type="number" min={0} placeholder="Ex: 120" value={form.engine_cc} onChange={e => set('engine_cc', e.target.value)} className={inputClass} />
            </div>)}
          </div>

          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Combustível *</p>
            <div className="flex flex-wrap gap-2">
              {FUELS.map(f => (
                <Chip key={f.value} label={f.label} active={form.fuel === f.value} onClick={() => set('fuel', f.value)} />
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Câmbio *</p>
            <div className="flex flex-wrap gap-2">
              {TRANSMISSIONS.map(t => (
                <Chip key={t.value} label={t.label} active={form.transmission === t.value} onClick={() => set('transmission', t.value)} />
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Portas</p>
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5].map(n => (
                <Chip key={n} label={`${n} portas`} active={form.doors === String(n)} onClick={() => set('doors', form.doors === String(n) ? '' : String(n))} />
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Cor</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <Chip key={c} label={c} active={form.color === c} onClick={() => set('color', form.color === c ? '' : c)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Opcionais ── */}
      {step === 2 && (
        <div className="space-y-5">
          {([
            { title: 'Segurança', opts: SECURITY_OPT, arr: security, setArr: setSecurity },
            { title: 'Conforto', opts: COMFORT_OPT, arr: comfort, setArr: setComfort },
            { title: 'Tecnologia', opts: TECH_OPT, arr: technology, setArr: setTechnology },
            { title: 'Mecânica', opts: MECHANIC_OPT, arr: mechanic, setArr: setMechanic },
          ] as const).map(({ title, opts, arr, setArr }) => (
            <div key={title} className={cardClass}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">{title}</p>
                {arr.length > 0 && (
                  <span className="text-[10px] text-[#00e5cc] bg-[#00e5cc15] px-2 py-0.5 rounded-full">
                    {arr.length} selecionado{arr.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {opts.map(o => (
                  <Chip
                    key={o.value}
                    label={o.label}
                    active={arr.includes(o.value)}
                    onClick={() => setArr(toggleArr(arr, o.value))}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Step 3: Anúncio ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Detalhes do anúncio</p>
            <div>
              <label htmlFor="title" className={labelClass}>Título *</label>
              <input id="title" type="text" placeholder="Ex: Honda Civic EXL 2021 impecável" value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} maxLength={200} />
            </div>
            <div>
              <label htmlFor="description" className={labelClass}>Descrição</label>
              <textarea id="description" rows={4} placeholder="Estado do veículo, histórico de manutenção, acessórios..." value={form.description} onChange={e => set('description', e.target.value)} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label htmlFor="observation" className={labelClass}>Observações</label>
              <textarea id="observation" rows={2} placeholder="Alguma observação adicional?" value={form.observation} onChange={e => set('observation', e.target.value)} className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Preço</p>
            <div>
              <label htmlFor="price" className={labelClass}>Valor (R$) *</label>
              <input id="price" type="text" inputMode="numeric" placeholder="Ex: 85.000" value={form.price ? maskKM(form.price) : ''} onChange={e => set('price', e.target.value.replace(/\D/g, ''))} className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <Toggle id="price_negotiable" label="Preço negociável" checked={form.price_negotiable} onChange={v => set('price_negotiable', v)} />
              <Toggle id="accepts_trade" label="Aceita troca" checked={form.accepts_trade} onChange={v => set('accepts_trade', v)} />
            </div>
          </div>

          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Localização</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className={labelClass}>Estado *</label>
                <select
                  id="state"
                  value={form.state}
                  onChange={e => set('state', e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Selecione o estado...</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="city" className={labelClass}>Cidade *</label>
                <select
                  id="city"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  disabled={!form.state || citiesLoading}
                  className={`${inputClass} appearance-none disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {citiesLoading ? 'Carregando...' : form.state ? 'Selecione a cidade...' : 'Selecione o estado primeiro'}
                  </option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="cep" className={labelClass}>CEP</label>
              <input id="cep" type="text" placeholder="00000-000" value={form.cep} onChange={e => set('cep', maskCEP(e.target.value))} className={inputClass} inputMode="numeric" />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Fotos ── */}
      {step === 4 && (
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Fotos do veículo</p>
            <span className="text-xs text-white/40">{images.length}/{MAX_IMAGES}</span>
          </div>

          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`w-full border-2 border-dashed rounded-xl py-10 flex flex-col items-center gap-2 transition-colors ${
                dragging ? 'border-[#00e5cc] bg-[#00e5cc08]' : 'border-[#1e2040] hover:border-[#2e3060] hover:bg-white/2'
              }`}
            >
              <ImagePlus size={28} className="text-white/30" />
              <p className="text-sm text-white/60">Clique ou arraste fotos aqui</p>
              <p className="text-xs text-white/30">JPG, PNG, WEBP · até {MAX_IMAGES} fotos · primeira será a capa</p>
            </button>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((item, i) => (
                <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-[#1e2040] bg-[#07080e]">
                  <img src={item.preview} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 text-[9px] bg-[#00e5cc] text-[#07080e] font-bold px-1.5 py-0.5 rounded-md">Capa</span>}
                  {item.uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 size={20} className="text-[#00e5cc] animate-spin" />
                    </div>
                  )}
                  {item.error && (
                    <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center p-1">
                      <p className="text-[10px] text-white text-center leading-tight">{item.error}</p>
                    </div>
                  )}
                  {!item.uploading && (
                    <button type="button" onClick={() => removeImage(item.id)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 5: Revisão ── */}
      {step === 5 && (
        <div className="space-y-5">
          {/* FIPE card */}
          {fipePreco && (
            <div className={cardClass}>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Tabela FIPE</p>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#00e5cc0d] border border-[#00e5cc25] mb-2">
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Preço referência ({fipePreco.MesReferencia})</p>
                  <p className="text-2xl font-bold text-[#00e5cc]">{fipePreco.Valor}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 mb-0.5">Código FIPE</p>
                  <p className="text-sm font-mono text-white/70">{fipePreco.CodigoFipe}</p>
                </div>
              </div>
              <ReviewRow label="Marca" value={fipePreco.Marca} />
              <ReviewRow label="Modelo" value={fipePreco.Modelo} />
              <ReviewRow label="Ano" value={String(fipePreco.AnoModelo)} />
              <ReviewRow label="Combustível" value={fipePreco.Combustivel} />
            </div>
          )}

          {/* Preço e placa */}
          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Dados do anúncio</p>

            {fipePreco && form.price && (
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="p-3 rounded-xl bg-[#0c0e1a] border border-[#1e2040] text-center">
                  <p className="text-[10px] text-white/40 mb-1">Preço FIPE</p>
                  <p className="text-sm font-semibold text-[#00e5cc]">{fipePreco.Valor}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0c0e1a] border border-[#1e2040] text-center">
                  <p className="text-[10px] text-white/40 mb-1">Seu preço</p>
                  <p className="text-sm font-semibold text-[#e8e8f4]">{formatBRL(parseFloat(form.price))}</p>
                </div>
              </div>
            )}

            <ReviewRow label="Placa" value={form.plate.toUpperCase()} />
            <ReviewRow label="Preço pedido" value={form.price ? formatBRL(parseFloat(form.price)) : '—'} />
            <ReviewRow label="Negociável" value={form.price_negotiable ? 'Sim' : 'Não'} />
            <ReviewRow label="Aceita troca" value={form.accepts_trade ? 'Sim' : 'Não'} />
            <ReviewRow label="Localização" value={`${form.city} / ${form.state}`} />
          </div>

          {/* Veículo */}
          <div className={cardClass}>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Veículo</p>
            <ReviewRow label="Marca" value={form.brand} />
            <ReviewRow label="Modelo" value={form.model} />
            <ReviewRow label="Ano modelo" value={form.year_model} />
            {form.color && <ReviewRow label="Cor" value={form.color} />}
            {form.km && <ReviewRow label="Quilometragem" value={`${parseInt(form.km).toLocaleString('pt-BR')} km`} />}
            <ReviewRow label="Combustível" value={FUELS.find(f => f.value === form.fuel)?.label ?? form.fuel} />
            <ReviewRow label="Câmbio" value={TRANSMISSIONS.find(t => t.value === form.transmission)?.label ?? form.transmission} />
            <ReviewRow label="Fotos" value={`${images.length} foto${images.length !== 1 ? 's' : ''}`} />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
      )}

      {success && (
        <div className="mt-4 flex items-center gap-2 text-sm text-[#00e5cc] bg-[#00e5cc10] border border-[#00e5cc30] rounded-xl px-4 py-3">
          <CheckCircle size={16} />Anúncio criado com sucesso! Redirecionando...
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button type="button" onClick={goBack} className="flex items-center gap-2 py-3 px-5 border border-[#1e2040] rounded-xl text-sm text-white/60 hover:text-[#e8e8f4] hover:border-[#2e3060] transition-colors">
            <ArrowLeft size={15} />Voltar
          </button>
        )}
        {step < STEP_LABELS.length - 1 ? (
          <button type="button" onClick={goNext} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00e5cc] text-[#07080e] font-semibold rounded-xl hover:bg-[#00c8b4] transition-colors">
            Próximo<ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || success || images.some(i => i.uploading)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00e5cc] text-[#07080e] font-semibold rounded-xl hover:bg-[#00c8b4] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Publicando...' : 'Publicar Anúncio'}
          </button>
        )}
      </div>
    </div>
  )
}
