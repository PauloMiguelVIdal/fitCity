// src/components/cidades/CidadeProgresso.jsx
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Building2, Maximize, Minimize, ChevronRight, TrendingUp, Flame, Target } from 'lucide-react'
import { defineHex, Grid, spiral } from 'honeycomb-grid'
import MapWorldActivities from '../MapWorldActivities'
import MapLoadingOverlay from '../MapLoadingOverlay'
import { TIPOS_ATIVIDADE } from '../../data/tiposAtividade'
import { MODELOS, EDIFICIO_PARA_MODELO } from '../BuildingModels'
import { resolverVisualEdificio } from '../../data/edificiosVisual'
import { useFitCityStore } from '../../store/fitCityStore'
import { raridadePorAtividade } from '../../utils/atividades'

const HEX_SIZE = 0.6

// =============================================
// UTILITÁRIOS
// =============================================
const getImageUrl = (nome) => `/imagens/${nome}.png`

const RARIDADE_CORES = {
  comum:    { cor: '#9CA3AF', bg: '#1A1A2A', border: '#9CA3AF44' },
  incomum:  { cor: '#34D399', bg: '#0F2A22', border: '#34D39944' },
  raro:     { cor: '#60A5FA', bg: '#1A2A4A', border: '#60A5FA44' },
  epico:    { cor: '#C084FC', bg: '#2D1A4A', border: '#C084FC44' },
  lendario: { cor: '#F27405', bg: '#4A2400', border: '#F2740544' },
}

const HEX_DIRECTIONS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]]
const vizinhosDeHex = (q, r) => HEX_DIRECTIONS.map(([dq, dr]) => `${q + dq},${r + dr}`)

// =============================================
// TABELA DE NÍVEIS (por atividades)
// =============================================
const TABELA_NIVEIS = [
  { nivel: 1,  porte: 'Micro Empresa',             raio: 3, atvMin: 1  },
  { nivel: 2,  porte: 'Sociedade Limitada',        raio: 3, atvMin: 3  },
  { nivel: 3,  porte: 'Empresa Regional',          raio: 3, atvMin: 7  },
  { nivel: 4,  porte: 'Companhia Local',           raio: 4, atvMin: 12 },
  { nivel: 5,  porte: 'Empresa Estadual',          raio: 5, atvMin: 16 },
  { nivel: 6,  porte: 'Companhia Nacional',        raio: 6, atvMin: 21 },
  { nivel: 7,  porte: 'Corporação Multissetorial', raio: 6, atvMin: 27 },
  { nivel: 8,  porte: 'Grupo Empresarial',         raio: 7, atvMin: 34 },
  { nivel: 9,  porte: 'Conglomerado Global',       raio: 7, atvMin: 42 },
  { nivel: 10, porte: 'Mega Holding',              raio: 8, atvMin: 50 },
]

function calcularNivel(atividadesMes) {
  let resultado = TABELA_NIVEIS[0]
  for (const item of TABELA_NIVEIS) {
    if (atividadesMes >= item.atvMin) resultado = item
    else break
  }
  return resultado
}

function proximoNivel(atividadesMes) {
  const atual = calcularNivel(atividadesMes)
  const idx = TABELA_NIVEIS.findIndex(n => n.nivel === atual.nivel)
  if (idx < 0 || idx >= TABELA_NIVEIS.length - 1) return null
  return TABELA_NIVEIS[idx + 1]
}

function hexCountPorRaio(raio) {
  return 1 + 3 * raio * (raio + 1)
}

function hexDiff(raioAntigo, raioNovo) {
  return hexCountPorRaio(raioNovo) - hexCountPorRaio(raioAntigo)
}

function raridadePorEdificioNivel(nivel) {
  const mapa = {
    1: 'comum',
    2: 'incomum',
    3: 'raro',
    4: 'epico',
    5: 'lendario',
  }
  return mapa[nivel] || 'comum'
}
// =============================================
// HELPERS DE RARIDADE (por nível do edifício)
// =============================================

// =============================================
// HELPERS DE DATA
// =============================================
function getHoje() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// =============================================
// MINI CARD DE CARTA
// =============================================
function MiniCardProgresso({ nome, raridade, quantidade }) {
  const config = RARIDADE_CORES[raridade] || RARIDADE_CORES.comum

  return (
    <div
      className="flex flex-col items-center p-1.5 rounded-xl bg-black/40 border transition-all hover:scale-105"
      style={{ borderColor: config.border }}
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${config.bg} 0%, #000 100%)`,
          border: `1px solid ${config.border}`,
        }}
      >
        <img
          src={getImageUrl(nome)}
          alt={nome}
          loading="lazy"
          className="w-[72%] h-[72%] object-contain"
          style={{ filter: `drop-shadow(0 0 6px ${config.cor}66)` }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>
      <span className="text-[8px] text-white/60 font-medium mt-1 text-center leading-tight line-clamp-2">
        {nome}
      </span>
      <span className="text-[9px] font-black mt-0.5" style={{ color: config.cor }}>
        x{quantidade}
      </span>
    </div>
  )
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function CityProgress({ onSelecionarAtividade }) {
  // ─── Store ───
  const atividades = useFitCityStore((s) => s.atividades)
  const cidade = useFitCityStore((s) => s.cidade)
  const coletasDiarias = useFitCityStore((s) => s.economia.coletasDiarias)
  const coletarMoeda = useFitCityStore((s) => s.coletarMoeda)

  // ─── Temporada ativa ───
  const temporadaId = cidade.temporadaAtualId
  const temporada = temporadaId ? cidade.temporadas[temporadaId] : null
  const edificiosAtivos = temporada?.edificiosAtivos || {}

  // ─── Nível / Porte / Raio ───
  const atividadesMes = cidade.atividadesMes
  const nivelAtual = useMemo(() => calcularNivel(atividadesMes), [atividadesMes])
  const proximo = useMemo(() => proximoNivel(atividadesMes), [atividadesMes])
  const ultimoNivel = !proximo

  const nivelExpandido = cidade.nivelExpandido || 1
  const nivelParaMapa = TABELA_NIVEIS[nivelExpandido - 1] || TABELA_NIVEIS[0]
  const porte = nivelParaMapa.porte
  const raioMapa = nivelParaMapa.raio

  const precisaExpandir = nivelAtual.nivel > nivelExpandido

  const terrenosNovos = useMemo(() => {
    if (!precisaExpandir) return 0
    const nivelAlvo = TABELA_NIVEIS[nivelAtual.nivel - 1]
    return hexDiff(raioMapa, nivelAlvo.raio)
  }, [precisaExpandir, nivelAtual.nivel, raioMapa])

  const faltamAtividades = proximo ? Math.max(0, proximo.atvMin - atividadesMes) : 0
  const progressoNivel = proximo
    ? Math.min(100, (atividadesMes / proximo.atvMin) * 100)
    : 100

  // ═════════════════════════════════════════════
  //  EDIFÍCIOS — vêm da store
  // ═════════════════════════════════════════════
  const edificios = useMemo(() => {
    return Object.values(edificiosAtivos)
  }, [edificiosAtivos])

  // ─── HEX GRID ───
  const hexGrid = useMemo(() => {
    const Tile = defineHex({ dimensions: HEX_SIZE, orientation: 'pointy' })
    return Array.from(new Grid(Tile, spiral({ center: [0, 0], radius: raioMapa })))
  }, [raioMapa])

  const hexMap = useMemo(() => {
    const map = new Map()
    hexGrid.forEach(h => map.set(`${h.q},${h.r}`, h))
    return map
  }, [hexGrid])

  const edificioPorId = useMemo(() => {
    const map = new Map()
    edificios.forEach(e => map.set(e.id, e))
    return map
  }, [edificios])

  // ─── POSICIONAMENTO ───
  const posicoes = useMemo(() => {
    const pos = {}
    edificios.forEach(ed => {
      if (ed.hexKey) pos[ed.hexKey] = ed.id
    })
    return pos
  }, [edificios])

  // ─── SATÉLITES ───
  const satelites = useMemo(() => {
    const mapa = {}
    Object.entries(posicoes).forEach(([key, id]) => {
      const ed = edificioPorId.get(id)
      if (!ed) return

      const visual = resolverVisualEdificio(ed.edificioNivel, ed.setor)
      if (!visual?.nome) return

      const modeloId = EDIFICIO_PARA_MODELO[visual.nome]
      const modeloDef = modeloId ? MODELOS[modeloId] : null
      const defSats = modeloDef?.satelites || []

      if (!modeloDef?.tamanho || modeloDef.tamanho !== 7) return

      const [q, r] = key.split(',').map(Number)
      vizinhosDeHex(q, r).forEach((vk, i) => {
        if (vk === '0,0') return
        if (!posicoes[vk]) {
          mapa[vk] = {
            corTopo: undefined,
            corFallback: '#888888',
            modeloId: defSats[i]?.modeloId ?? null,
            edificioDono: ed,
          }
        }
      })
    })
    return mapa
  }, [posicoes, edificioPorId])

  // ─── TILES ───
  const tilesToRender = useMemo(() => {
    return hexGrid
      .map(h => ({ hex: h, key: `${h.q},${h.r}` }))
      .filter(({ key }) => key !== '0,0' && !satelites[key])
  }, [hexGrid, satelites])

  // ─── Seleção / Hover / Move ───
  const [selectedKey, setSelectedKey] = useState(null)
  const [moveMode, setMoveMode] = useState(false)
  const [hoveredKey, setHoveredKey] = useState(null)

  const moverEdificio = useCallback((destKey) => {
    if (!selectedKey) return
    if (destKey === '0,0') return
    if (posicoes[destKey]) return
    if (satelites[destKey]) return

    const edId = posicoes[selectedKey]
    if (edId) {
      useFitCityStore.getState().moverEdificioProgresso(edId, destKey)
    }
    setSelectedKey(destKey)
    setMoveMode(false)
    setHoveredKey(null)
  }, [selectedKey, posicoes, satelites])

  const handleHexClick = useCallback((hex) => {
    const key = `${hex.q},${hex.r}`

    if (moveMode) {
      moverEdificio(key)
      return
    }

    const edId = posicoes[key]
    if (!edId) {
      setSelectedKey(null)
      return
    }
    setSelectedKey(prev => (prev === key ? null : key))

    const edificio = edificioPorId.get(edId)
    if (edificio) {
      const atividade = atividades.find(a => a.id === edificio.atividadeOrigem)
      if (atividade) onSelecionarAtividade?.(atividade)
    }
  }, [moveMode, posicoes, edificioPorId, atividades, onSelecionarAtividade, moverEdificio])

  const handleHover = useCallback((key, isOver) => {
    setHoveredKey(isOver ? key : null)
  }, [])

  const [isFullscreen, setIsFullscreen] = useState(false)

  const ativarMoveMode = useCallback(() => {
    if (!isFullscreen || !selectedKey) return
    setMoveMode(true)
  }, [isFullscreen, selectedKey])

  const cancelarMoveMode = useCallback(() => {
    setMoveMode(false)
    setHoveredKey(null)
  }, [])

  const fecharPainel = useCallback(() => {
    setSelectedKey(null)
    setMoveMode(false)
  }, [])

  // ─── Coleta de Moeda ───
  const handleColetarMoeda = useCallback((edificioId) => {
    coletarMoeda(edificioId)
  }, [coletarMoeda])

  const jaColetou = useCallback((edificioId) => {
    const hoje = getHoje()
    return coletasDiarias[edificioId] === hoje
  }, [coletasDiarias])

  // ─── Expansão ───
  const [expandindo, setExpandindo] = useState(false)

  const raioAnterior = useMemo(() => {
    if (!expandindo) return null
    const nivelAnt = TABELA_NIVEIS[(nivelExpandido - 1) - 1] || TABELA_NIVEIS[0]
    return nivelAnt.raio
  }, [expandindo, nivelExpandido])

  const chavesAntigas = useMemo(() => {
    if (raioAnterior == null) return null
    const Tile = defineHex({ dimensions: HEX_SIZE, orientation: 'pointy' })
    const antigos = Array.from(new Grid(Tile, spiral({ center: [0, 0], radius: raioAnterior })))
    const set = new Set()
    antigos.forEach(h => set.add(`${h.q},${h.r}`))
    return set
  }, [raioAnterior])

  const handleExpandirMundo = useCallback(() => {
    if (!precisaExpandir || expandindo) return
    setExpandindo(true)
    useFitCityStore.getState().expandirMundo()
    setTimeout(() => setExpandindo(false), 900)
  }, [precisaExpandir, expandindo])

  // ─── Fullscreen / Loading ───
  const mapWrapperRef = useRef(null)
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true
  )
  const [mapReady, setMapReady] = useState(false)
  const [mapTimeoutId, setMapTimeoutId] = useState(null)

  const handleMapReady = useCallback(() => {
    const id = setTimeout(() => setMapReady(true), 400)
    setMapTimeoutId(id)
  }, [])

  useEffect(() => () => { if (mapTimeoutId) clearTimeout(mapTimeoutId) }, [mapTimeoutId])

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
        console.error('Erro fullscreen:', err)
      }
    } else {
      if (screen.orientation?.unlock) {
        try { screen.orientation.unlock() } catch {}
      }
      await document.exitFullscreen()
    }
  }, [])

  // ═════════════════════════════════════════════
  //  CARTAS / RARIDADE
  // ═════════════════════════════════════════════
  const cartasDasAtividades = useMemo(() => {
    const mapa = new Map()
    edificios.forEach(ed => {
      const visual = resolverVisualEdificio(ed.edificioNivel, ed.setor)
      if (!visual?.nome) return
      const chave = visual.nome
      if (mapa.has(chave)) {
        mapa.get(chave).quantidade += 1
      } else {
        mapa.set(chave, {
          nome: visual.nome,
          raridade: raridadePorEdificioNivel(ed.edificioNivel),
          quantidade: 1,
        })
      }
    })
    return Array.from(mapa.values()).sort((a, b) => b.quantidade - a.quantidade)
  }, [edificios])

  const totalEdificios = edificios.length

  const porRaridade = useMemo(() => {
    const result = { comum: 0, incomum: 0, raro: 0, epico: 0, lendario: 0 }
    edificios.forEach(ed => {
      const r = raridadePorAtividade(ed.edificioNivel)
      result[r] = (result[r] || 0) + 1
    })
    return result
  }, [edificios])

  const kcalTotais = useMemo(() => {
    return atividades.reduce((acc, a) => acc + (a.calorias || 0), 0)
  }, [atividades])

  const metaMensal = 16
  const metaPercentual = Math.min(100, (atividadesMes / metaMensal) * 100)

  // ═════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-3 pb-24">

      {/* ═══════════════ MAPA 3D ═══════════════ */}
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
        <MapWorldActivities
          nomeEmpresa="Minha Cidade"
          porte={porte}
          raioMapa={raioMapa}
          dayProgress={0}
          posicoes={posicoes}
          satelites={satelites}
          tilesToRender={tilesToRender}
          hexMap={hexMap}
          edificioPorId={edificioPorId}
          chavesAntigas={chavesAntigas}
          expandindo={expandindo}
          selectedKey={selectedKey}
          moveMode={moveMode}
          hoveredKey={hoveredKey}
          isFullscreen={isFullscreen}
          onHexClick={handleHexClick}
          onHover={handleHover}
          onMover={ativarMoveMode}
          onCancelarMove={cancelarMoveMode}
          onFecharPainel={fecharPainel}
          onColetarMoeda={handleColetarMoeda}
          jaColetou={jaColetou}
          onMapReady={handleMapReady}
        />

        <MapLoadingOverlay visible={!mapReady} />

        <button
          onClick={toggleFullscreen}
          className="absolute left-3 top-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2.5 shadow-lg z-10"
        >
          {isFullscreen ? <Minimize size={16} className="text-white" /> : <Maximize size={16} className="text-white" />}
        </button>

        {/* Painel de progresso do nível */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          fontFamily: "'Rajdhani','Segoe UI',sans-serif",
          pointerEvents: 'none',
          minWidth: 240,
          maxWidth: 280,
        }}>
          {proximo && !ultimoNivel && (
            <div style={{
              background: 'rgba(10,6,24,0.85)',
              border: '1px solid rgba(242,116,5,0.4)',
              borderRadius: 10,
              padding: '8px 12px',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.05em',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#FFB060', fontSize: 10 }}>PRÓX. NV {proximo.nivel}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
                  {atividadesMes} / {proximo.atvMin}
                </span>
              </div>
              <div style={{
                height: 6,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${progressoNivel}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #F27405, #FFB060)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
                faltam <b style={{ color: '#FFB060' }}>{faltamAtividades}</b> atividade{faltamAtividades !== 1 ? 's' : ''}
              </div>

              {terrenosNovos > 0 && (
                <div style={{
                  marginTop: 4,
                  paddingTop: 6,
                  borderTop: '1px dashed rgba(255,255,255,0.12)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 10,
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>🗺️ Terrenos no nv {proximo.nivel}</span>
                  <span style={{ color: '#78DC8C', fontWeight: 800 }}>+{terrenosNovos}</span>
                </div>
              )}
            </div>
          )}

          {ultimoNivel && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(242,116,5,0.3), rgba(139,61,0,0.3))',
              border: '1.5px solid #F27405',
              borderRadius: 10,
              padding: '6px 12px',
              color: '#FFB060',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}>
              ★ Nível máximo atingido ★
            </div>
          )}
        </div>

        {/* Botão "Expandir Mundo" */}
        {precisaExpandir && (
          <div style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 70,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            fontFamily: "'Rajdhani','Segoe UI',sans-serif",
            pointerEvents: 'auto',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.95), rgba(242,116,5,0.95))',
              border: '2px solid #FFD966',
              boxShadow: '0 0 30px rgba(255,215,0,0.7), 0 4px 16px rgba(0,0,0,0.6)',
              borderRadius: 14,
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              animation: 'pulse 1.5s ease-in-out infinite',
              color: '#3D2800',
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              textShadow: '0 1px 2px rgba(255,255,255,0.4)',
            }}>
              ✨
              <span>Nível {nivelAtual.nivel} alcançado!</span>
            </div>

            <button
              onClick={handleExpandirMundo}
              disabled={expandindo}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 26px',
                borderRadius: 12,
                border: '2px solid #FFD966',
                background: expandindo
                  ? 'linear-gradient(135deg, #555, #333)'
                  : 'linear-gradient(135deg, #F27405, #8B3D00)',
                boxShadow: expandindo
                  ? '0 0 10px rgba(0,0,0,0.4)'
                  : '0 0 24px rgba(242,116,5,0.8), 0 4px 12px rgba(0,0,0,0.5)',
                color: '#fff',
                fontFamily: "'Rajdhani','Segoe UI',sans-serif",
                fontWeight: 900,
                fontSize: 14,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: expandindo ? 'wait' : 'pointer',
                userSelect: 'none',
                animation: expandindo ? 'none' : 'bounce 1.2s ease-in-out infinite',
              }}
            >
              🗺️
              {expandindo ? 'Expandindo...' : 'Expandir Mundo'}
            </button>

            <style>{`
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.04); opacity: 0.9; }
              }
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* ═══════════════ 1. RESUMO DO MÊS ═══════════════ */}
      <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-fitcity-energy" />
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">
            Seu progresso no mês
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-14 h-14 mb-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="#F27405" strokeWidth="3"
                  strokeDasharray={`${metaPercentual * 0.94} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black text-white">{Math.round(metaPercentual)}%</span>
              </div>
            </div>
            <span className="text-[9px] text-white/50 uppercase tracking-wider">Meta mês</span>
            <span className="text-[10px] font-bold text-white mt-0.5">
              {atividadesMes}/{metaMensal}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-fitcity-energy/15 border border-fitcity-energy/30 flex items-center justify-center mb-1">
              <Building2 size={22} className="text-fitcity-energy" />
            </div>
            <span className="text-[9px] text-white/50 uppercase tracking-wider">Edifícios</span>
            <span className="text-[10px] font-bold text-white mt-0.5">
              {totalEdificios} no mês
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mb-1">
              <Flame size={22} className="text-orange-400" />
            </div>
            <span className="text-[9px] text-white/50 uppercase tracking-wider">Calorias</span>
            <span className="text-[10px] font-bold text-white mt-0.5">
              {kcalTotais.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════ 2. PRÓXIMO NÍVEL ═══════════════ */}
      {proximo && (
        <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)] relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fitcity-energy to-orange-600" />

          <div className="pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-fitcity-energy" />
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                Próximo nível
              </p>
              <span className="ml-auto text-[10px] font-black text-fitcity-energy">
                NV {proximo.nivel}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-lg font-black text-white">
                Faltam {faltamAtividades}
              </span>
              <span className="text-xs text-white/60">
                atividade{faltamAtividades !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-fitcity-energy to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progressoNivel}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-white/50 mb-3">
              <span>{atividadesMes} atividades</span>
              <span>Meta: {proximo.atvMin}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <p className="text-[9px] text-white/50 uppercase tracking-wider">Terrenos</p>
                <p className="text-sm font-black text-emerald-400">
                  +{hexCountPorRaio(TABELA_NIVEIS[proximo.nivel-1]?.raio || 3) - hexCountPorRaio(TABELA_NIVEIS[nivelAtual.nivel-1]?.raio || 3)}
                </p>
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <p className="text-[9px] text-white/50 uppercase tracking-wider">Nova sede</p>
                <p className="text-[11px] font-bold text-purple-300 truncate">Atualiza</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ 3. ATIVIDADES DO MÊS ═══════════════ */}
      <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📈</span>
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">
              Atividades do mês
            </p>
          </div>
          <span className="text-[10px] font-bold text-fitcity-energy">
            {kcalTotais.toLocaleString()} kcal
          </span>
        </div>

        {atividades.length > 0 ? (
          <div className="space-y-2">
            {atividades.slice(-5).reverse().map((atividade) => {
              const Icon = TIPOS_ATIVIDADE[atividade.tipo]?.Icon
              const cor = TIPOS_ATIVIDADE[atividade.tipo]?.cor || '#F27405'

              return (
                <button
                  key={atividade.id}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer text-left"
                  onClick={() => onSelecionarAtividade?.(atividade)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cor}22` }}
                    >
                      {Icon && <Icon size={16} style={{ color: cor }} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white capitalize truncate">
                        {TIPOS_ATIVIDADE[atividade.tipo]?.label || atividade.tipo}
                      </p>
                      <p className="text-[10px] text-white/40 truncate">
                        {atividade.distancia ? `${atividade.distancia} km · ` : ''}
                        {atividade.duracao ? `${atividade.duracao} min · ` : ''}
                        {atividade.calorias} kcal
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className="text-xs font-black text-fitcity-energy">
                      +{atividade.moedas || 0}
                    </span>
                    <ChevronRight size={14} className="text-white/30" />
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-xs text-white/40">Nenhuma atividade registrada ainda</p>
          </div>
        )}
      </div>

      {/* ═══════════════ 4. CARTAS / EDIFÍCIOS ═══════════════ */}
      <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🏗️</span>
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">
              Suas cartas
            </p>
          </div>
          <span className="text-[10px] text-white/50">
            {cartasDasAtividades.length} tipos · {totalEdificios} total
          </span>
        </div>

        {cartasDasAtividades.length > 0 ? (
          <>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {cartasDasAtividades.map((carta) => (
                <MiniCardProgresso
                  key={carta.nome}
                  nome={carta.nome}
                  raridade={carta.raridade}
                  quantidade={carta.quantidade}
                />
              ))}
            </div>

            <div className="border-t border-white/5 pt-3">
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2">
                Por raridade
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {Object.entries(porRaridade).map(([raridade, qtd]) => {
                  const cfg = RARIDADE_CORES[raridade]
                  return (
                    <div
                      key={raridade}
                      className="flex flex-col items-center p-1.5 rounded-lg bg-white/5 border"
                      style={{ borderColor: cfg.border }}
                    >
                      <div
                        className="w-2 h-2 rounded-full mb-1"
                        style={{ background: cfg.cor, boxShadow: `0 0 6px ${cfg.cor}` }}
                      />
                      <span className="text-[11px] font-black" style={{ color: cfg.cor }}>
                        {qtd}
                      </span>
                      <span className="text-[8px] text-white/40 capitalize">
                        {raridade}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-xs text-white/40">Nenhuma carta ainda</p>
            <p className="text-[10px] text-white/30 mt-1">
              Registre atividades para ganhar cartas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}