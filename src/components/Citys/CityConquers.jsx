// src/components/cidades/CidadePatrimonio.jsx
import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Building2, ChevronRight, MapPinned, Award, Archive,
  Flame, Clock, Maximize, Minimize,
} from 'lucide-react'
import MapWorldFitCity from '../MapWorldCity'
import MapLoadingOverlay from '../MapLoadingOverlay'
import { useFitCityStore } from '../../store/fitCityStore'
import { usePatrimonioMap } from '../../hooks/usePatrimônioMap'


// =============================================
// HEX DIRECTIONS (ainda precisa para validar movimentos)
// =============================================
const HEX_DIRECTIONS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]
const vizinhosDeHex = (q, r) => HEX_DIRECTIONS.map(([dq, dr]) => `${q + dq},${r + dr}`)

// =============================================
// HELPERS
// =============================================
function formatarTempo(minutos) {
  const m = Math.max(0, Math.round(minutos || 0))
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}min`
  return `${h}h ${min}min`
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function CityConquers() {
  // ─── Store ───
  const atividades = useFitCityStore((s) => s.atividades)
  const posicionarCarta = useFitCityStore((s) => s.posicionarCartaPatrimonio)

  // ─── Hook compartilhado ───
  const patrimonio = usePatrimonioMap()

  const {
    cartasUnicas,
    totalCartasPossuidas,
    totalCatalogo,
    porte,
    raioMapa,
    ultimoNivel,
    nivelProgresso,
    edificiosAtivos,
    posicoes,
    satelites,
    tilesToRender,
    hexMap,
    edificioPorId,
    temCartas,
  } = patrimonio

  // ─── Seleção / Hover / Move ───
  const [selectedKey, setSelectedKey] = useState(null)
  const [moveMode, setMoveMode] = useState(false)
  const [hoveredKey, setHoveredKey] = useState(null)

  // ─── Fullscreen + Loading ───
  const mapWrapperRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true
  )
  const [mapReady, setMapReady] = useState(false)
  const [mapTimeoutId, setMapTimeoutId] = useState(null)

  const handleMapReady = useCallback(() => {
    const id = setTimeout(() => setMapReady(true), 400)
    setMapTimeoutId(id)
  }, [])

  useEffect(() => {
    return () => { if (mapTimeoutId) clearTimeout(mapTimeoutId) }
  }, [mapTimeoutId])

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const handleOrientation = (e) => setIsPortrait(e.matches)
    mq.addEventListener('change', handleOrientation)
    return () => mq.removeEventListener('change', handleOrientation)
  }, [])

  useEffect(() => {
    const handleFsChange = () => {
      const fs = !!document.fullscreenElement
      setIsFullscreen(fs)
      if (!fs) {
        setMoveMode(false)
        setSelectedKey(null)
        setHoveredKey(null)
      }
    }
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
          try { await screen.orientation.lock('landscape') } catch {}
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

  // ─── Movimento ───
  const destinoEhValido = useCallback((destKey) => {
    if (!selectedKey) return false
    if (destKey === '0,0') return false
    if (destKey === selectedKey) return false
    if (posicoes[destKey]) return false
    if (satelites[destKey]) return false

    const edSendo = edificioPorId.get(posicoes[selectedKey])
    if (!edSendo) return false

    if (edSendo.ehCluster) {
      const gridKeys = new Set(Array.from(hexMap.keys()))
      const ocupadasSemEle = new Set(['0,0'])

      Object.entries(posicoes).forEach(([k, id]) => {
        if (k === selectedKey) return
        ocupadasSemEle.add(k)
        const ed = edificioPorId.get(id)
        if (ed?.ehCluster) {
          const [q, r] = k.split(',').map(Number)
          vizinhosDeHex(q, r).forEach((vk) => ocupadasSemEle.add(vk))
        }
      })

      Object.keys(satelites).forEach((k) => {
        if (k !== selectedKey) ocupadasSemEle.add(k)
      })

      const [dq, dr] = destKey.split(',').map(Number)
      return vizinhosDeHex(dq, dr).every(
        (vk) => !ocupadasSemEle.has(vk) && gridKeys.has(vk)
      )
    }

    return true
  }, [selectedKey, posicoes, satelites, edificioPorId, hexMap])

  const moverEdificio = useCallback((destKey) => {
    if (!destinoEhValido(destKey)) return false
    const cartaId = posicoes[selectedKey]
    if (!cartaId) return false

    // Persiste na store (o hook vai re-sincronizar)
    posicionarCarta(cartaId, destKey)

    setSelectedKey(destKey)
    setMoveMode(false)
    setHoveredKey(null)
    return true
  }, [selectedKey, posicoes, destinoEhValido, posicionarCarta])

  const handleHexClick = useCallback((hex) => {
    const key = `${hex.q},${hex.r}`
    if (moveMode) {
      moverEdificio(key)
      return
    }
    if (posicoes[key]) {
      setSelectedKey((prev) => (prev === key ? null : key))
    } else {
      setSelectedKey(null)
    }
  }, [moveMode, posicoes, moverEdificio])

  const handleHover = useCallback((key, isOver) => {
    setHoveredKey(isOver ? key : null)
  }, [])

  const ativarMoveMode = useCallback(() => {
    if (!document.fullscreenElement) return
    if (!selectedKey) return
    setMoveMode(true)
  }, [selectedKey])

  const cancelarMoveMode = useCallback(() => {
    setMoveMode(false)
    setHoveredKey(null)
  }, [])

  const fecharPainel = useCallback(() => {
    setSelectedKey(null)
    setMoveMode(false)
  }, [])

  // ─── Estatísticas ───
  const stats = {
    totalKcal: atividades.reduce((acc, a) => acc + (a.calorias || 0), 0),
    totalDuracao: atividades.reduce((acc, a) => acc + (a.duracao || 0), 0),
    totalDistancia: atividades.reduce((acc, a) => acc + (a.distancia || 0), 0),
  }

  return (
    <div className="flex flex-col gap-4">
      {/* MAPA 3D */}
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
        {temCartas ? (
<MapWorldFitCity
  porte={porte}
  edificiosAtivos={edificiosAtivos}
  posicoes={posicoes}
  satelites={satelites}
  tilesToRender={tilesToRender}
  hexMap={hexMap}
  edificioPorId={edificioPorId}
  selectedKey={selectedKey}
  moveMode={moveMode}
  hoveredKey={hoveredKey}
  isFullscreen={isFullscreen}
  onHexClick={handleHexClick}
  onHover={handleHover}
  onMover={ativarMoveMode}
  onCancelarMove={cancelarMoveMode}
  onFecharPainel={fecharPainel}
  onMapReady={handleMapReady}

  // 🔥 Câmera da Cidade
  cameraPosition={[-3.5, -5, -3.5]}
  cameraFov={35}
  cameraTarget={[0, 0, 0]}
  minDistance={3}
  maxDistance={22}
  autoRotate={true}
  dayProgress={0.4}
/>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6">
            <Building2 size={40} className="text-white/20" />
            <p className="text-sm text-white/60">Sua cidade ainda está vazia</p>
            <p className="text-xs text-white/40 max-w-[240px]">
              Compre pacotes na loja e colecione cartas para construir sua cidade patrimônio.
            </p>
          </div>
        )}

        <MapLoadingOverlay visible={!mapReady && temCartas} />

        {temCartas && (
          <button
            onClick={toggleFullscreen}
            className="absolute left-3 top-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2.5 shadow-lg z-10"
          >
            {isFullscreen
              ? <Minimize size={16} className="text-white" />
              : <Maximize size={16} className="text-white" />}
          </button>
        )}
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-2 gap-3">
        {/* Progresso do nível */}
        <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-fitcity-energy" />
            <p className="text-xs font-semibold">Progresso</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{cartasUnicas}</span>
            <span className="text-xs text-white/40">/ {nivelProgresso.meta}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-fitcity-energy to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${nivelProgresso.pct}%` }}
            />
          </div>
          <p className="text-[10px] text-white/40 mt-1.5">
            {ultimoNivel
              ? '★ Nível máximo'
              : `Faltam ${nivelProgresso.faltam} cartas únicas`}
          </p>
        </div>

        {/* Total de cartas */}
        <button
          className="text-left bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(242,116,5,0.3)] group"
          style={{
            background:
              'linear-gradient(135deg, rgba(242,116,5,0.08) 0%, rgba(255,160,0,0.03) 50%, rgba(242,116,5,0.05) 100%)',
            borderColor: 'rgba(242,116,5,0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Archive size={16} className="text-fitcity-energy group-hover:text-orange-400 transition-colors" />
            <p className="text-xs font-semibold group-hover:text-orange-300/80 transition-colors">
              Total de cartas
            </p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold group-hover:text-orange-300 transition-colors">
              {totalCartasPossuidas}
            </span>
            <span className="text-xs text-white/40">/ {totalCatalogo}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-fitcity-energy to-orange-500 rounded-full transition-all duration-500"
              style={{
                width: `${totalCatalogo > 0 ? (cartasUnicas / totalCatalogo) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-white/40 group-hover:text-orange-300/60 transition-colors">
              {cartasUnicas} tipos descobertos
            </span>
            <ChevronRight
              size={14}
              className="text-fitcity-energy group-hover:text-orange-400 group-hover:translate-x-1 transition-all"
            />
          </div>
        </button>
      </div>

      {/* ESTATÍSTICAS GERAIS */}
      <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
        <p className="text-xs font-semibold mb-3">Estatísticas gerais</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Flame size={18} className="text-fitcity-energy" />
            </div>
            <p className="text-lg font-bold text-fitcity-energy">
              {stats.totalKcal.toLocaleString('pt-BR')}
            </p>
            <p className="text-[8px] text-white/40 uppercase">kcal totais</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Clock size={18} className="text-fitcity-energy" />
            </div>
            <p className="text-lg font-bold text-fitcity-energy">
              {formatarTempo(stats.totalDuracao)}
            </p>
            <p className="text-[8px] text-white/40 uppercase">tempo ativo</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-1">
              <MapPinned size={18} className="text-fitcity-energy" />
            </div>
            <p className="text-lg font-bold text-fitcity-energy">
              {stats.totalDistancia.toFixed(1)} km
            </p>
            <p className="text-[8px] text-white/40 uppercase">distância total</p>
          </div>
        </div>
      </div>
    </div>
  )
}