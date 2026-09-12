// src/components/cidades/CidadeProgresso.jsx
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { TrendingUp, Zap, Calendar, MapPin, ChevronRight, Target } from 'lucide-react'
import { Plus, Minus, LocateFixed, Building2,Maximize, Minimize} from 'lucide-react'
import MapWorldActivities from '../MapWorldActivities'
import { TIPOS_ATIVIDADE } from '../../data/tiposAtividade'

// =============================================
// UTILITÁRIO PARA IMAGENS
// =============================================
const getImageUrl = (nome) => `/imagens/${nome}.png`

// =============================================
// CONFIGURAÇÃO DE RARIDADE PARA CORES
// =============================================
const RARIDADE_CORES = {
  comum: { cor: '#9CA3AF', bg: '#1A1A2A', border: '#9CA3AF44' },
  incomum: { cor: '#34D399', bg: '#0F2A22', border: '#34D39944' },
  raro: { cor: '#60A5FA', bg: '#1A2A4A', border: '#60A5FA44' },
  epico: { cor: '#C084FC', bg: '#2D1A4A', border: '#C084FC44' },
  lendario: { cor: '#F27405', bg: '#4A2400', border: '#F2740544' },
}

// =============================================
// CARD MINIATURA PARA EDIFÍCIOS (progresso)
// =============================================
function MiniCardProgresso({ nome, raridade, quantidade, progresso }) {
  const config = RARIDADE_CORES[raridade] || RARIDADE_CORES.comum
  
  return (
    <div 
      className="flex flex-col items-center p-2 rounded-xl bg-black/30 border transition-all hover:scale-105"
      style={{ borderColor: config.border }}
    >
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, ${config.bg} 0%, #000 100%)`,
          border: `1px solid ${config.border}`
        }}
      >
        <img
          src={getImageUrl(nome)}
          alt={nome}
          loading="lazy"
          className="w-[70%] h-[70%] object-contain"
          style={{ filter: `drop-shadow(0 0 8px ${config.cor}66)` }}
          onError={(e) => { 
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
      
      <span className="text-[8px] text-white/70 font-medium mt-1 text-center leading-tight line-clamp-2">
        {nome}
      </span>
      
      <div className="flex items-center gap-2 mt-0.5">
        {quantidade != null && (
          <span className="text-[8px] font-bold" style={{ color: config.cor }}>
            x{quantidade}
          </span>
        )}
        {progresso != null && (
          <div className="flex items-center gap-1">
            <div className="w-8 h-1 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${Math.min(progresso, 100)}%`,
                  background: config.cor 
                }} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================
// FUNÇÃO PARA DETERMINAR NÍVEL BASEADO NAS MOEDAS
// =============================================
const getNivelPorMoedas = (moedas) => {
  if (moedas <= 5) return 1
  if (moedas <= 10) return 2
  if (moedas <= 20) return 3
  if (moedas <= 30) return 4
  if (moedas <= 50) return 5
  return 6
}

// =============================================
// COMPONENTE PRINCIPAL - CIDADE PROGRESSO
// =============================================
export default function CityProgress({ atividades = [], dadosCidade, onSelecionarAtividade }) {
  // Processa as atividades para gerar cartas (mesma lógica do CityScreen original)
  const cartasDasAtividades = useMemo(() => {
    const tiposPermitidos = ['corrida', 'musculacao', 'caminhada']
    const atividadesFiltradas = atividades.filter(a => tiposPermitidos.includes(a.tipo))

    const cartasMap = new Map()
    
    atividadesFiltradas.forEach(atividade => {
      // Simula moedas baseado na atividade
      const moedas = atividade.moedas || (
        atividade.tipo === 'corrida' ? 10 + Math.floor((atividade.distancia || 0) / 2) * 3 :
        atividade.tipo === 'musculacao' ? 8 + Math.floor((atividade.tempo || 0) / 10) * 2 :
        5
      )
      const nivel = getNivelPorMoedas(moedas)
      
      // Mapeia nível para edifício
      const edificiosPorNivel = {
        1: { nome: 'Plantação De Grãos', raridade: 'comum' },
        2: { nome: 'Granja De Aves', raridade: 'incomum' },
        3: { nome: 'Fazenda De Vacas', raridade: 'raro' },
        4: { nome: 'Criação De Ovinos', raridade: 'epico' },
        5: { nome: 'Cooperativa Agrícola', raridade: 'lendario' },
        6: { nome: 'Centro De Comércio De Plantações', raridade: 'lendario' },
      }
      
      const edificio = edificiosPorNivel[nivel] || edificiosPorNivel[1]
      const chave = edificio.nome
      
      if (cartasMap.has(chave)) {
        const existente = cartasMap.get(chave)
        existente.quantidade += 1
        existente.progresso = Math.min(existente.quantidade * 20, 100)
      } else {
        cartasMap.set(chave, {
          nome: edificio.nome,
          raridade: edificio.raridade,
          quantidade: 1,
          progresso: 20,
        })
      }
    })

    return Array.from(cartasMap.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5) // Top 5
  }, [atividades])

  // Total de edifícios
  const totalEdificios = useMemo(() => {
    return cartasDasAtividades.reduce((acc, c) => acc + c.quantidade, 0)
  }, [cartasDasAtividades])

const mapWrapperRef = useRef(null)
const [isFullscreen, setIsFullscreen] = useState(false)
const [isPortrait, setIsPortrait] = useState(
  typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true
)

// Acompanha mudanças de orientação da tela (pra saber quando aplicar o fallback de rotação)
useEffect(() => {
  const mq = window.matchMedia('(orientation: portrait)')
  const handleOrientation = (e) => setIsPortrait(e.matches)
  mq.addEventListener('change', handleOrientation)
  return () => mq.removeEventListener('change', handleOrientation)
}, [])

// Acompanha entrada/saída de fullscreen (inclusive quando o usuário sai via ESC/gesto do sistema)
useEffect(() => {
  const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
  document.addEventListener('fullscreenchange', handleFsChange)
  return () => document.removeEventListener('fullscreenchange', handleFsChange)
}, [])

const toggleFullscreen = useCallback(async () => {
  const el = mapWrapperRef.current
  if (!el) return

  if (!document.fullscreenElement) {
    try {
      await el.requestFullscreen()
      if (screen.orientation?.lock) {
        try {
          await screen.orientation.lock('landscape')
        } catch {
          // Navegador não permite travar orientação (ex.: iOS Safari) — o fallback de rotação via CSS cobre esse caso
        }
      }
    } catch (err) {
      console.error('Não foi possível entrar em tela cheia:', err)
    }
  } else {
    if (screen.orientation?.unlock) {
      try { screen.orientation.unlock() } catch {}
    }
    await document.exitFullscreen()
  }
}, [])

  return (
    <div className="flex flex-col gap-4">
     <div
  ref={mapWrapperRef}
  className={`relative overflow-hidden bg-black/30 border border-white/10 ${
    isFullscreen
      ? 'fixed inset-0 z-50 bg-black'
      : 'h-[55vh] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.4)]'
  }`}
  style={
    isFullscreen && isPortrait
      ? {
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '100vh',
          height: '100vw',
          transform: 'translate(-50%, -50%) rotate(90deg)',
        }
      : undefined
  }
>
   <MapWorldActivities atividades={atividades} onSelecionarAtividade={onSelecionarAtividade} />

  <button
    onClick={toggleFullscreen}
    className="absolute left-3 top-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2.5 shadow-lg z-10"
  >
    {isFullscreen ? <Minimize size={16} className="text-white" /> : <Maximize size={16} className="text-white" />}
  </button>
</div>

      {/* Estatísticas de progresso */}
      <div className="grid grid-cols-2 gap-3">
        {/* Meta do mês */}
        <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-fitcity-energy" />
            <p className="text-xs font-semibold">Meta do mês</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">75</span>
            <span className="text-xs text-white/40">%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-fitcity-energy to-orange-500 rounded-full transition-all duration-500"
              style={{ width: '75%' }}
            />
          </div>
          <p className="text-[10px] text-white/40 mt-1.5">12 de 16 atividades concluídas</p>
        </div>

        {/* Edifícios construídos */}
        <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-fitcity-energy" />
            <p className="text-xs font-semibold">Edifícios construídos</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{totalEdificios}</span>
            <span className="text-xs text-white/40">no mês</span>
          </div>
          <button className="text-[10px] text-fitcity-energy hover:text-fitcity-energy/80 transition mt-1.5 flex items-center gap-1">
            Ver histórico <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Atividades do mês */}
      <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold">📊 Atividades do mês</p>
          <span className="text-xs text-fitcity-energy">{dadosCidade.kcalTotais.toLocaleString()} kcal</span>
        </div>
        
        <div className="space-y-2">
          {dadosCidade.ultimasAtividades.map((atividade, index) => {
            const Icon = TIPOS_ATIVIDADE[atividade.tipo]?.Icon
            const cor = TIPOS_ATIVIDADE[atividade.tipo]?.cor || '#F27405'
            
            return (
              <div 
                key={index}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
                onClick={() => onSelecionarAtividade(atividade)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${cor}20` }}
                  >
                    {Icon && <Icon size={18} style={{ color: cor }} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{TIPOS_ATIVIDADE[atividade.tipo]?.label || atividade.tipo}</p>
                    <p className="text-[10px] text-white/40">
                      {atividade.distancia || atividade.tempo} • {atividade.kcal} kcal
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-fitcity-energy">+{atividade.pontos}</span>
                  <p className="text-[8px] text-white/40">pontos</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Edifícios em construção */}
      <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)] mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold">🏗️ Em construção</p>
          <span className="text-xs text-white/40">{cartasDasAtividades.length} ativos</span>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {cartasDasAtividades.map((carta) => (
            <MiniCardProgresso
              key={carta.nome}
              nome={carta.nome}
              raridade={carta.raridade}
              quantidade={carta.quantidade}
              progresso={carta.progresso}
            />
          ))}
        </div>
      </div>
    </div>
  )
}