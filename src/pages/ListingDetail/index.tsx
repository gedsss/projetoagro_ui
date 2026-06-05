import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, BadgeCheck, Calendar, ChevronLeft, ChevronRight,
  DoorOpen, Fuel, Gauge, Heart, MapPin, Settings2, Share2, Shield,
  Palette, Zap, Hash,
} from 'lucide-react'

import { CommentsSection } from '../../components/ui/CommentsSection'
import { listingsService } from '../../services/api'
import type { Listing } from '../../types/api'

const fuelLabel: Record<string, string> = {
  FLEX: 'Flex', GASOLINA: 'Gasolina', ETANOL: 'Etanol',
  DIESEL: 'Diesel', ELETRICO: 'Elétrico', HIBRIDO: 'Híbrido',
}

const transmissionLabel: Record<string, string> = {
  MANUAL: 'Manual', AUTOMATICO: 'Automático', CVT: 'CVT', AUTOMATIZADO: 'Automatizado',
}

const conditionLabel: Record<string, string> = {
  NOVO: 'Novo', SEMINOVO: 'Seminovo', USADO: 'Usado',
}

const categoryLabel: Record<string, string> = {
  SEDANS: 'Sedan', SUVS: 'SUV', PICKUPS: 'Pickup', MOTOS: 'Moto',
  CLASSICOS: 'Coupé', VANS: 'Van / Utilitário', CAMINHOES: 'Caminhão', OUTROS: 'Outros',
}

const componentLabels: Record<string, string> = {
  // security
  ABS: 'ABS', DISTRIBUICAO_FRENAGEM: 'Dist. de frenagem', ASSISTENTE_FRENAGEM: 'Assist. de frenagem',
  CONTROLE_ESTABILIDADE: 'Controle de estabilidade', CONTROLE_TRACAO: 'Controle de tração',
  ASSISTENTE_RAMPA: 'Assistente de rampa', CRUISE_ADAPTATIVO: 'Cruise adaptativo',
  FRENAGEM_AUTONOMA: 'Frenagem autônoma', MONITOR_PONTO_CEGO: 'Monitor ponto cego',
  ASSISTENTE_FAIXA: 'Assistente de faixa', AVISO_COLISAO_FRONTAL: 'Aviso colisão frontal',
  AVISO_TRAFEGO_TRASEIRO: 'Aviso tráfego traseiro', AIRBAG_FRONTAL: 'Airbag frontal',
  AIRBAG_LATERAL: 'Airbag lateral', AIRBAG_CORTINA: 'Airbag cortina', AIRBAG_JOELHO: 'Airbag joelho',
  CAMERA_RE: 'Câmera de ré', CAMERA_360: 'Câmera 360°', SENSOR_ESTACIONAMENTO: 'Sensor de estac.',
  ESTACIONAMENTO_AUTONOMO: 'Estac. autônomo', ISOFIX: 'ISOFIX',
  CINTO_PRETENSIONADOR: 'Cinto pretensionador', IMOBILIZADOR: 'Imobilizador', ALARME: 'Alarme',
  ENTRADA_SEM_CHAVE: 'Entrada sem chave', RASTREADOR: 'Rastreador',
  MONITOR_PRESSAO_PNEUS: 'Monitor pressão pneus', PNEU_RUN_FLAT: 'Pneu run flat',
  // comfort
  AR_CONDICIONADO: 'Ar-condicionado', AR_CONDICIONADO_DIGITAL: 'Ar-cond. digital',
  AR_CONDICIONADO_DUAL_ZONE: 'Dual zone', AR_CONDICIONADO_TRI_ZONE: 'Tri zone',
  BANCO_AQUECIDO: 'Banco aquecido', BANCO_VENTILADO: 'Banco ventilado',
  BANCO_MASSAGEADOR: 'Banco massageador', BANCO_ELETRICO: 'Banco elétrico',
  BANCO_MEMORIA: 'Banco com memória', BANCO_COURO: 'Banco de couro',
  VOLANTE_AQUECIDO: 'Volante aquecido', VOLANTE_MULTIMIDIA: 'Volante multimídia',
  VOLANTE_REGULAGEM_ELETRICA: 'Volante elétrico', TETO_SOLAR: 'Teto solar',
  TETO_PANORAMICO: 'Teto panorâmico', VIDRO_ELETRICO: 'Vidro elétrico',
  VIDRO_ELETRICO_TRASEIRO: 'Vidro elétrico tras.', RETROVISOR_ELETRICO: 'Retrovisor elétrico',
  RETROVISOR_FOTOCROMATICO: 'Retrovisor fotocrôm.', CHAVE_PRESENCIAL: 'Chave presencial',
  PARTIDA_BOTAO: 'Partida por botão', PORTA_MALAS_ELETRICO: 'Porta-malas elétrico',
  PORTA_MALAS_HANDS_FREE: 'Porta-malas hands-free', CARREGADOR_WIRELESS: 'Carregador wireless',
  TOMADA_USB: 'Tomada USB', TOMADA_110V: 'Tomada 110V', SISTEMA_SOM_PREMIUM: 'Som premium',
  PAINEL_DIGITAL: 'Painel digital', HEAD_UP_DISPLAY: 'Head-up display',
  NAVEGACAO_GPS: 'Navegação GPS', CONTROLE_CRUZEIRO: 'Controle de cruzeiro',
  SUSPENSAO_ADAPTATIVA: 'Suspensão adaptativa', ILUMINACAO_AMBIENTE: 'Iluminação ambiente',
  CORTINA_ELETRICA_TRASEIRA: 'Cortina elétrica tras.',
  // technology
  CENTRAL_MULTIMIDIA: 'Central multimídia', TELA_TOUCHSCREEN: 'Tela touchscreen',
  APPLE_CARPLAY: 'Apple CarPlay', ANDROID_AUTO: 'Android Auto', BLUETOOTH: 'Bluetooth',
  WIFI_BORDO: 'Wi-Fi a bordo', ENTRADA_USB: 'Entrada USB', ENTRADA_HDMI: 'Entrada HDMI',
  RECONHECIMENTO_VOZ: 'Reconhec. de voz', ASSISTENTE_VIRTUAL: 'Assistente virtual',
  PILOTO_AUTOMATICO: 'Piloto automático', ATUALIZACAO_OTA: 'Atualização OTA',
  CONTROLE_REMOTO_APP: 'Controle remoto app', PARTIDA_REMOTA: 'Partida remota',
  MONITORAMENTO_MOTORISTA: 'Monitor. motorista', FAROL_ADAPTATIVO: 'Farol adaptativo',
  FAROL_LED: 'Farol LED', FAROL_LASER: 'Farol laser', CONEXAO_4G: 'Conexão 4G',
  CONEXAO_5G: 'Conexão 5G', SUBWOOFER: 'Subwoofer', AMPLIFICADOR: 'Amplificador',
  TELA_TRASEIRA: 'Tela traseira', ESPELHO_RETROVISOR_CAMERA: 'Retrovisor c/ câmera',
  // mechanic
  MOTOR_ASPIRADO: 'Motor aspirado', MOTOR_TURBO: 'Motor turbo', MOTOR_BITURBO: 'Motor biturbo',
  MOTOR_HIBRIDO: 'Motor híbrido', MOTOR_HIBRIDO_PLUG_IN: 'Híbrido plug-in',
  MOTOR_ELETRICO: 'Motor elétrico', MOTOR_FLEX: 'Motor flex', MOTOR_DIESEL: 'Motor diesel',
  MOTOR_GNV: 'Motor GNV', TRACAO_DIANTEIRA: 'Tração dianteira', TRACAO_TRASEIRA: 'Tração traseira',
  TRACAO_INTEGRAL: 'Tração integral', TRACAO_4X4: '4×4', TRACAO_4X4_REDUCAO: '4×4 com redução',
  DIRECAO_HIDRAULICA: 'Direção hidráulica', DIRECAO_ELETRICA: 'Direção elétrica',
  DIRECAO_ELETRO_HIDRAULICA: 'Dir. eletro-hidráulica', SUSPENSAO_INDEPENDENTE: 'Susp. independente',
  SUSPENSAO_MULTILINK: 'Susp. multilink', SUSPENSAO_MOLA: 'Susp. a mola', SUSPENSAO_AR: 'Susp. a ar',
  FREIO_DISCO_DIANTEIRO: 'Freio disco diant.', FREIO_DISCO_TRASEIRO: 'Freio disco traseiro',
  FREIO_TAMBOR_TRASEIRO: 'Freio tambor traseiro', DIFERENCIAL_ELETRONICO: 'Dif. eletrônico',
  DIFERENCIAL_MECANICO: 'Dif. mecânico', BLOQUEIO_DIFERENCIAL: 'Bloqueio de dif.',
  ESCAPE_ESPORTIVO: 'Escape esportivo', START_STOP: 'Start/Stop',
  RECUPERACAO_ENERGIA: 'Recuperação de energia', BATERIA_LITIO: 'Bateria de lítio',
  CARREGAMENTO_RAPIDO: 'Carregamento rápido', MODO_CONDUCAO: 'Modos de condução',
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

  useEffect(() => {
    if (!id || !listing) return
    const key = `viewed_listing_${id}`
    if (localStorage.getItem(key)) return
    // não conta visualização do próprio vendedor
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.id === listing.seller_id) return
      } catch { /* ignore */ }
    }
    localStorage.setItem(key, '1')
    listingsService.incrementView(id).catch(() => {})
  }, [id, listing])

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

  const isMoto = listing.category === 'MOTOS'

  const specs = [
    { icon: Gauge, label: 'Quilometragem', value: listing.km != null ? `${Number(listing.km).toLocaleString('pt-BR')} km` : null },
    { icon: Calendar, label: 'Ano modelo', value: String(listing.year_model) },
    { icon: Calendar, label: 'Ano fabricação', value: listing.year_manuf ? String(listing.year_manuf) : null },
    { icon: Fuel, label: 'Combustível', value: fuelLabel[listing.fuel] ?? listing.fuel },
    { icon: Settings2, label: 'Câmbio', value: transmissionLabel[listing.transmission] ?? listing.transmission },
    { icon: DoorOpen, label: 'Portas', value: listing.doors != null ? String(listing.doors) : null },
    { icon: Palette, label: 'Cor', value: listing.color ?? null },
    { icon: Zap, label: isMoto ? 'Cilindradas' : 'Cavalos', value: listing.engine_cc != null ? `${listing.engine_cc} ${isMoto ? 'cc' : 'cv'}` : null },
    { icon: Hash, label: 'Placa', value: listing.plate ?? listing.license_plate ?? null },
  ].filter(s => s.value !== null) as { icon: typeof Gauge; label: string; value: string }[]

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
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {listing.featured && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-[#00e5cc] text-[#07080e]">
                  Destaque
                </span>
              )}
              <span className="px-2 py-0.5 text-xs rounded-md bg-[#1e2040] text-white/60">
                {conditionLabel[listing.condition] ?? listing.condition}
              </span>
              {listing.category && (
                <span className="px-2 py-0.5 text-xs rounded-md bg-[#1e2040] text-white/60">
                  {categoryLabel[listing.category] ?? listing.category}
                </span>
              )}
              {listing.bullet_proof && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Shield size={11} />Blindado
                </span>
              )}
              {listing.auction && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-[#7b5cf0]/10 text-[#7b5cf0] border border-[#7b5cf0]/20">
                  Leilão
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 font-medium uppercase tracking-wide mb-1">{listing.brand}</p>
            <h1 className="text-2xl font-bold text-[#e8e8f4]">
              {listing.popular_name || listing.model} {listing.year_model}
            </h1>
            {listing.popular_name && listing.popular_name !== listing.model && (
              <p className="text-sm text-white/40 mt-0.5">{listing.model}</p>
            )}
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

          {/* Opcionais */}
          {(() => {
            const sections = [
              { key: 'security', title: 'Segurança', items: listing.security_components },
              { key: 'comfort', title: 'Conforto', items: listing.comfort_components },
              { key: 'technology', title: 'Tecnologia', items: listing.technology_components },
              { key: 'mechanic', title: 'Mecânica', items: listing.mechanic_components },
            ].filter(s => s.items && s.items.length > 0)
            if (sections.length === 0) return null
            return (
              <div className="mt-8">
                <h2 className="text-base font-semibold text-[#e8e8f4] mb-4">Opcionais</h2>
                <div className="space-y-4">
                  {sections.map(section => (
                    <div key={section.key}>
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">{section.title}</p>
                      <div className="flex flex-wrap gap-2">
                        {(section.items ?? []).map(item => (
                          <span
                            key={item}
                            className="px-3 py-1 text-xs rounded-full bg-[#00e5cc] text-[#07080e] font-medium"
                          >
                            {componentLabels[item] ?? item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

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
              <Link
                to={`/vendedor/${listing.seller_id}`}
                className="flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#1e2040] flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white/60">
                    {listing.seller_name?.charAt(0).toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#e8e8f4]">{listing.seller_name ?? 'Vendedor'}</p>
                  <p className="text-xs text-white/40 mt-0.5">Ver perfil e anúncios</p>
                </div>
                <BadgeCheck size={16} className="shrink-0 text-[#00e5cc]" />
              </Link>
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
