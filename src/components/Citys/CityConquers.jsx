// src/components/cidades/CidadePatrimonio.jsx
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Building2, ChevronRight, MapPin, Award, Archive, Flame, Clock, MapPinned, Maximize, Minimize } from 'lucide-react'
import MapWorldFitCity from '../MapWorldCity'

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
// CARD MINIATURA PARA EDIFÍCIOS
// =============================================
function MiniCardEdificio({ nome, raridade, quantidade }) {
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
      
      {quantidade != null && (
        <span className="text-[8px] font-bold mt-0.5" style={{ color: config.cor }}>
          x{quantidade}
        </span>
      )}
    </div>
  )
}

// =============================================
// COMPONENTE PRINCIPAL - CIDADE PATRIMÔNIO
// =============================================
export default function CityConquers({ atividades = [], dadosCidade, onSelecionarAtividade }) {  // Mock de cartas do inventário (usando as mesmas do InventoryScreen)
  const cartasInventario = useMemo(() => [
    { nome: "Usina Hidrelétrica", raridade: "lendario", qtd: 1 },
    { nome: "Shopping Center", raridade: "lendario", qtd: 1 },
    { nome: "Aeroporto", raridade: "lendario", qtd: 1 },
    { nome: "Fábrica De Robôs", raridade: "lendario", qtd: 1 },
    { nome: "Cooperativa Agrícola", raridade: "epico", qtd: 2 },
    { nome: "Mega Mercado", raridade: "epico", qtd: 1 },
    { nome: "Prédio De Alto Padrão", raridade: "epico", qtd: 2 },
    { nome: "Plantação De Grãos", raridade: "incomum", qtd: 5 },
    { nome: "Fazenda De Vacas", raridade: "incomum", qtd: 3 },
  ], [])

  // Top 5 cartas mais abundantes
  const topCartas = useMemo(() => {
    return [...cartasInventario]
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5)
  }, [cartasInventario])

  // Total de cartas
  const totalCartas = useMemo(() => {
    return cartasInventario.reduce((acc, c) => acc + c.qtd, 0)
  }, [cartasInventario])

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
        {/* 🔥 NOVO: passa isFullscreen */}
        <MapWorldFitCity isFullscreen={isFullscreen} />

        <button
          onClick={toggleFullscreen}
          className="absolute right-3 top-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2.5 shadow-lg z-10"
        >
          {isFullscreen ? <Minimize size={16} className="text-white" /> : <Maximize size={16} className="text-white" />}
        </button>
      </div>

      {/* Estatísticas e progresso */}
      <div className="grid grid-cols-2 gap-3">
        {/* Progresso da cidade */}
        <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-fitcity-energy" />
            <p className="text-xs font-semibold">Progresso</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{dadosCidade.progresso}</span>
            <span className="text-xs text-white/40">/ {dadosCidade.meta}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-fitcity-energy to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${(dadosCidade.progresso / dadosCidade.meta) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-white/40 mt-1.5">Próximo nível</p>
        </div>

        {/* Total de cartas - COM DEGRADÊ SUTIL LARANJA */}
        <div 
          className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)] cursor-pointer transition-all hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(242,116,5,0.3)] group"
          style={{
            background: 'linear-gradient(135deg, rgba(242,116,5,0.08) 0%, rgba(255,160,0,0.03) 50%, rgba(242,116,5,0.05) 100%)',
            borderColor: 'rgba(242,116,5,0.2)',
          }}
          onClick={() => {/* Navegar para inventário */}}
        >
          <div className="flex items-center gap-2 mb-2">
            <Archive size={16} className="text-fitcity-energy group-hover:text-orange-400 transition-colors" />
            <p className="text-xs font-semibold group-hover:text-orange-300/80 transition-colors">Total de cartas</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold group-hover:text-orange-300 transition-colors">{dadosCidade.totalCartas}</span>
            <span className="text-xs text-white/40">/ {dadosCidade.metaCartas}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-fitcity-energy to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${(dadosCidade.totalCartas / dadosCidade.metaCartas) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-white/40 group-hover:text-orange-300/60 transition-colors">Ver inventário</span>
            <ChevronRight size={14} className="text-fitcity-energy group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>

      {/* Estatísticas gerais - COM ÍCONES EM CIMA */}
      <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
        <p className="text-xs font-semibold mb-3">Estatísticas gerais</p>
        <div className="grid grid-cols-3 gap-2">
          {/* Kcal */}
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Flame size={18} className="text-fitcity-energy" />
            </div>
            <p className="text-lg font-bold text-fitcity-energy">{dadosCidade.kcalTotais.toLocaleString()}</p>
            <p className="text-[8px] text-white/40 uppercase">kcal totais</p>
          </div>
          
          {/* Tempo */}
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Clock size={18} className="text-fitcity-energy" />
            </div>
            <p className="text-lg font-bold text-fitcity-energy">{dadosCidade.tempoAtivo}</p>
            <p className="text-[8px] text-white/40 uppercase">tempo ativo</p>
          </div>
          
          {/* Distância */}
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <MapPinned size={18} className="text-fitcity-energy" />
            </div>
            <p className="text-lg font-bold text-fitcity-energy">{dadosCidade.distanciaTotal}</p>
            <p className="text-[8px] text-white/40 uppercase">distância total</p>
          </div>
        </div>
      </div>


    </div>
  )
}