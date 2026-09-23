// src/screens/ActivitiesScreen.jsx
import { useState, useMemo, useEffect } from 'react'
import {
  MapPin, Clock, Coins, Plus, Flame, Calendar,
  TrendingUp, Footprints, Dumbbell, Trophy, Award, Zap,
  Gift, Check,
} from 'lucide-react'
import { defineHex, Grid, spiral } from 'honeycomb-grid'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import {
  FILTRO_POR_PERIODO,
  resumoDoPeriodo,
  calcularMoedas,
  edificioNivelPorAtividade,
  setorPorAtividade,
  fitScorePorAtividade,
} from '../utils/atividades'
import MapWorldActivities from '../components/MapWorldActivities'
import MapLoadingOverlay from '../components/MapLoadingOverlay'
import { MODELOS, EDIFICIO_PARA_MODELO } from '../components/BuildingModels'
import { resolverVisualEdificio } from '../data/edificiosVisual'
import { useFitCityStore } from '../store/fitCityStore'

const META_DIARIA_KCAL = 600
const META_SEMANAL_ATIVIDADES = 5
const HEX_SIZE = 0.6
const RECOMPENSA_META_SEMANAL = 100
const STORAGE_KEY_META_SEMANAL = 'fitcity:meta-semanal-coletada'

// =============================================
// HELPERS
// =============================================
const HEX_DIRECTIONS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]
const vizinhosDeHex = (q, r) => HEX_DIRECTIONS.map(([dq, dr]) => `${q + dq},${r + dr}`)

const TABELA_NIVEIS = [
  { nivel: 1, porte: 'Micro Empresa', raio: 3, atvMin: 1 },
  { nivel: 2, porte: 'Sociedade Limitada', raio: 3, atvMin: 3 },
  { nivel: 3, porte: 'Empresa Regional', raio: 3, atvMin: 7 },
  { nivel: 4, porte: 'Companhia Local', raio: 4, atvMin: 12 },
  { nivel: 5, porte: 'Empresa Estadual', raio: 5, atvMin: 16 },
  { nivel: 6, porte: 'Companhia Nacional', raio: 6, atvMin: 21 },
  { nivel: 7, porte: 'Corporação Multissetorial', raio: 6, atvMin: 27 },
  { nivel: 8, porte: 'Grupo Empresarial', raio: 7, atvMin: 34 },
  { nivel: 9, porte: 'Conglomerado Global', raio: 7, atvMin: 42 },
  { nivel: 10, porte: 'Mega Holding', raio: 8, atvMin: 50 },
]

function calcularNivel(atividadesMes) {
  let resultado = TABELA_NIVEIS[0]
  for (const item of TABELA_NIVEIS) {
    if (atividadesMes >= item.atvMin) resultado = item
    else break
  }
  return resultado
}

const MODALIDADE_CORES = {
  corrida: { cor: '#F27405', corBg1: '#F27405', corBg2: '#8B3D00' },
  musculacao: { cor: '#6411D9', corBg1: '#6411D9', corBg2: '#331B8C' },
  caminhada: { cor: '#8F5ADA', corBg1: '#8F5ADA', corBg2: '#6411D9' },
}

// Helper: chave semanal (ex: "2026-W38")
function getSemanaAtualKey() {
  const d = new Date()
  const ano = d.getFullYear()
  const start = new Date(ano, 0, 1)
  const diff = Math.floor((d - start) / (24 * 60 * 60 * 1000))
  const semana = Math.ceil((diff + start.getDay() + 1) / 7)
  return `${ano}-W${semana}`
}

// =============================================
// MINI MAPA DA CIDADE
// ─────────────────────────────────────────────
// 🔥 Corrigido: usa `edificioNivelPorAtividade` (mesma fonte da store)
//    em vez de `getNivelPorMoedas` (fórmula inventada)
// =============================================
function MiniMapaCidade({ atividades }) {
  const atividadesMes = atividades.length
  const nivelAtual = calcularNivel(atividadesMes)
  const raioMapa = nivelAtual.raio

  // ─── Edifícios derivados das atividades (mesma lógica da store) ───
  const edificios = useMemo(() => {
    const tipos = ['corrida', 'musculacao', 'caminhada']
    return atividades
      .filter(a => tipos.includes(a.tipo))
      .map((atividade, idx) => {
        // ✅ FONTE ÚNICA — mesma função que a store usa
        const edificioNivel = edificioNivelPorAtividade(atividade)
        const setor = setorPorAtividade(atividade)

        const visual = resolverVisualEdificio(edificioNivel, setor)
        if (!visual?.nome) return null

        const modeloId = EDIFICIO_PARA_MODELO[visual.nome]
        const modeloDef = modeloId ? MODELOS[modeloId] : null

        return {
          id: atividade.id ?? `atv-${idx}`,
          nome: visual.nome,
          setor,
          edificioNivel,                     // ← nível correto (1-5)
          ehCluster: modeloDef?.tamanho === 7,
          ehComposto: modeloDef?.tipo === 'composto',
        }
      })
      .filter(Boolean)
  }, [atividades])

  // ─── HEX GRID ───
  const hexGrid = useMemo(() => {
    const Tile = defineHex({ dimensions: HEX_SIZE, orientation: 'pointy' })
    return Array.from(new Grid(Tile, spiral({ center: [0, 0], radius: raioMapa })))
  }, [raioMapa])

  const hexMap = useMemo(() => {
    const m = new Map()
    hexGrid.forEach(h => m.set(`${h.q},${h.r}`, h))
    return m
  }, [hexGrid])

  const edificioPorId = useMemo(() => {
    const m = new Map()
    edificios.forEach(e => m.set(e.id, e))
    return m
  }, [edificios])

  // ─── POSICIONAMENTO ───
  const posicoes = useMemo(() => {
    const gridKeys = new Set(hexGrid.map(h => `${h.q},${h.r}`))
    const ocupadas = new Set(['0,0'])
    const novas = {}

    const keys = hexGrid.map(h => `${h.q},${h.r}`).sort((a, b) => {
      const [aq, ar] = a.split(',').map(Number)
      const [bq, br] = b.split(',').map(Number)
      return (aq * aq + ar * ar) - (bq * bq + br * br)
    })

    const proximoLivre = (pred = null) => {
      for (const k of keys) {
        if (k === '0,0') continue
        if (ocupadas.has(k)) continue
        if (pred && !pred(k)) continue
        return k
      }
      return null
    }

    edificios.filter(e => e.ehCluster).forEach(ed => {
      const central = proximoLivre(k => {
        const [cq, cr] = k.split(',').map(Number)
        return vizinhosDeHex(cq, cr).every(vk => {
          if (vk === '0,0') return false
          return !ocupadas.has(vk) && gridKeys.has(vk)
        })
      })
      if (central) {
        const [cq, cr] = central.split(',').map(Number)
        novas[central] = ed.id
        ocupadas.add(central)
        vizinhosDeHex(cq, cr).forEach(vk => vk !== '0,0' && ocupadas.add(vk))
      }
    })

    edificios.filter(e => !e.ehCluster).forEach(ed => {
      const pos = proximoLivre()
      if (pos) { novas[pos] = ed.id; ocupadas.add(pos) }
    })

    return novas
  }, [edificios, hexGrid])

  // ─── SATÉLITES ───
  const satelites = useMemo(() => {
    const m = {}
    Object.entries(posicoes).forEach(([key, id]) => {
      const ed = edificioPorId.get(id)
      if (!ed) return

      const visual = resolverVisualEdificio(ed.edificioNivel, ed.setor)
      if (!visual?.nome) return

      const modeloId = EDIFICIO_PARA_MODELO[visual.nome]
      const modeloDef = modeloId ? MODELOS[modeloId] : null

      if (!modeloDef?.tamanho || modeloDef.tamanho !== 7) return

      const defSats = modeloDef?.satelites || []
      const [q, r] = key.split(',').map(Number)

      vizinhosDeHex(q, r).forEach((vk, i) => {
        if (vk === '0,0') return
        if (!posicoes[vk]) {
          m[vk] = {
            corTopo: undefined,
            corFallback: '#888888',
            modeloId: defSats[i]?.modeloId ?? null,
            edificioDono: ed,
          }
        }
      })
    })
    return m
  }, [posicoes, edificioPorId])

  // ─── TILES ───
  const tilesToRender = useMemo(
    () => hexGrid
      .map(h => ({ hex: h, key: `${h.q},${h.r}` }))
      .filter(({ key }) => key !== '0,0' && !satelites[key]),
    [hexGrid, satelites]
  )

  const [mapReady, setMapReady] = useState(false)
  const [mapTimeoutId, setMapTimeoutId] = useState(null)

  const handleMapReady = () => {
    const id = setTimeout(() => setMapReady(true), 400)
    setMapTimeoutId(id)
  }

  useEffect(() => () => { if (mapTimeoutId) clearTimeout(mapTimeoutId) }, [mapTimeoutId])

  const noop = () => { }
  const jaColetou = () => true

  return (
    <>
      <MapWorldActivities
        nomeEmpresa="FitCity"
        porte={nivelAtual.porte}
        raioMapa={raioMapa}
        dayProgress={0}
        posicoes={posicoes}
        satelites={satelites}
        tilesToRender={tilesToRender}
        hexMap={hexMap}
        edificioPorId={edificioPorId}
        chavesAntigas={null}
        expandindo={false}
        selectedKey={null}
        moveMode={false}
        hoveredKey={null}
        isFullscreen={false}
        onHexClick={noop}
        onHover={noop}
        onMover={noop}
        onCancelarMove={noop}
        onFecharPainel={noop}
        onColetarMoeda={noop}
        jaColetou={jaColetou}
        onMapReady={handleMapReady}
      />
      <MapLoadingOverlay visible={!mapReady} />
    </>
  )
}

// =============================================
// MAPA DE CALOR (Heatmap)
// 🔥 Corrigido: usa `a.duracao` em vez de `a.tempo`
// =============================================
function MapaDeCalor({ dados = [] }) {
  const max = Math.max(...dados.map(d => d.valor), 1)

  const ano = new Date().getFullYear()
  const mes = new Date().getMonth()
  const primeiroDia = new Date(ano, mes, 1).getDay()

  const offsetInicial = primeiroDia === 0 ? 6 : primeiroDia - 1

  const celulas = []
  for (let i = 0; i < offsetInicial; i++) {
    celulas.push({ vazio: true, key: `vazio-ini-${i}` })
  }
  dados.forEach((d) => {
    celulas.push({ ...d, vazio: false, key: `dia-${d.dia}` })
  })

  const restante = celulas.length % 7
  if (restante !== 0) {
    for (let i = 0; i < 7 - restante; i++) {
      celulas.push({ vazio: true, key: `vazio-fim-${i}` })
    }
  }

  const DIAS_SEMANA = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

  return (
    <div className="mt-2">
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} className="text-center text-[8px] font-bold text-white/40 uppercase">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celulas.map((c) => {
          if (c.vazio) {
            return <div key={c.key} className="aspect-square" />
          }

          const intensidade = c.valor / max
          const bg = c.valor === 0
            ? 'rgba(255,255,255,0.05)'
            : `rgba(242, 116, 5, ${0.2 + intensidade * 0.8})`

          return (
            <div
              key={c.key}
              className="aspect-square rounded-[3px] transition-all hover:scale-110 flex items-center justify-center"
              style={{
                background: bg,
                boxShadow: c.valor > 0
                  ? `0 0 6px rgba(242,116,5,${intensidade * 0.6})`
                  : 'none',
              }}
              title={`Dia ${c.dia}: ${c.valor} min`}
            >
              <span className="text-[7px] font-bold text-white/70">{c.dia}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =============================================
// BLOCO META DA SEMANA
// =============================================
function BlocoMetaSemanal({
  dias = [],
  progressoMeta,
  metaSemanal,
  proximoEdificio,
  metaBatida,
  recompensaJaColetada,
  onColetarRecompensa,
  recompensa = RECOMPENSA_META_SEMANAL,
}) {
  const pctMeta = Math.min(100, (progressoMeta / metaSemanal) * 100)

  return (
    <div
      className={`relative rounded-2xl mt-4 p-3 border overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-500 ${metaBatida
        ? 'bg-gradient-to-br from-[#F27405]/35 to-[#6411D9]/55 border-[#6411D9]/35'
        : 'bg-[#1E0A3C]/55 border-white/10'
        }`}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-[0_4px_14px_rgba(242,116,5,0.5)] shrink-0">
            <Trophy size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black leading-tight">Meta da Semana</p>
            <p className="text-[9px] text-white/50 truncate">
              {progressoMeta}/{metaSemanal} atividades
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={!metaBatida || recompensaJaColetada}
          onClick={onColetarRecompensa}
          className={`rounded-xl px-2.5 py-1 flex items-center gap-1 shrink-0 transition-all ${recompensaJaColetada
            ? 'bg-[#6411D9] border border-[#6411D9]/40 cursor-default'
            : metaBatida
              ? 'bg-gradient-to-br from-[#F27405] to-[#6411D9] shadow-[0_4px_15px_rgba(242,116,5,0.55)] hover:scale-105 active:scale-95 cursor-pointer animate-pulse'
              : 'bg-gradient-to-br from-orange-500 to-orange-600 opacity-60 cursor-not-allowed'
            }`}
          title={
            recompensaJaColetada
              ? 'Recompensa já coletada esta semana'
              : metaBatida
                ? `Coletar +${recompensa} moedas`
                : `Bata ${metaSemanal} treinos para liberar`
          }
        >
          {recompensaJaColetada ? (
            <>
              <Check size={11} className="text-white" strokeWidth={3} />
              <span className="text-[10px] font-black text-white uppercase">Coletado</span>
            </>
          ) : (
            <>
              <Gift size={11} className="text-white" />
              <span className="text-[10px] font-black text-white">+{recompensa}</span>
              <Coins size={10} className="text-white" />
            </>
          )}
        </button>
      </div>

      <div className="w-full h-2 bg-black/50 rounded-full mb-3 overflow-hidden border border-white/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ${metaBatida
            ? 'bg-gradient-to-r from-[#6411D9] via-[#F27405] to-orange-600 shadow-[0_0_10px_rgba(100,17,217,0.7)]'
            : 'bg-gradient-to-r from-[#F27405] to-orange-500 shadow-[0_0_8px_rgba(242,116,5,0.5)]'
            }`}
          style={{ width: `${pctMeta}%` }}
        />
      </div>

      <div className="flex justify-between items-center gap-0.5">
        {dias.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="relative">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${item.concluido
                  ? 'bg-gradient-to-br from-[#F27405] to-orange-600 text-white shadow-[0_4px_15px_rgba(242,116,5,0.5)]'
                  : 'bg-purple-900/40 text-purple-300/50 border border-purple-500/20'
                  }`}
              >
                {item.dia}
              </div>
              {item.concluido && (
                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center border-2 border-[#1a0b2e]">
                  <Check size={8} className="text-white" strokeWidth={3} />
                </div>
              )}
            </div>

            <span className="text-[9px] text-purple-200/60 font-medium truncate w-full text-center">
              {item.label}
            </span>

            <div className="flex items-center gap-0.5">
              <Coins
                size={9}
                className={item.concluido ? 'text-[#F27405]' : 'text-purple-400/30'}
              />
              <span
                className={`text-[9px] font-bold ${item.concluido ? 'text-[#F27405]' : 'text-purple-400/30'
                  }`}
              >
                {item.concluido ? `+${item.xp}` : '-'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {metaBatida && !recompensaJaColetada && (
        <p className="text-[9px] font-black text-purple-200 uppercase tracking-wider mt-2 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          ★ Meta batida — colete sua recompensa!
        </p>
      )}
    </div>
  )
}

// =============================================
// CARD PEQUENO DE MODALIDADE
// 🔥 Corrigido: usa `a.duracao` em vez de `a.tempo`
// =============================================
function CardModalidadePequeno({ tipo, dados, corConfig }) {
  const { cor, corBg1, corBg2 } = corConfig
  const Icone = tipo === 'musculacao' ? Dumbbell : Footprints
  const label = TIPOS_ATIVIDADE[tipo]?.label || tipo

  const mediaTempo = dados.mediaTempo || 0
  const mediaDist = dados.mediaDist || 0
  const mediaCal = dados.mediaCalorias || 0
  const totalCal = dados.totalCalorias || 0
  const totalTempo = dados.totalTempo || 0

  return (
    <div
      className="relative rounded-xl p-3 border overflow-hidden flex flex-col h-full"
      style={{
        borderColor: `${cor}44`,
        background: `linear-gradient(135deg, ${corBg1} 0%, ${corBg2} 100%)`,
      }}
    >
      <div
        className="absolute -right-4 -top-4 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: cor, opacity: 0.2, filter: 'blur(25px)' }}
      />

      <div className="relative flex flex-col h-full">
        <div className="flex items-center gap-1.5 mb-2.5">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.25)' }}
          >
            <Icone size={12} className="text-white" />
          </div>
          <span className="text-[11px] font-black text-white truncate">{label}</span>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <div>
            <p className="text-[8px] text-white/60 uppercase tracking-wider font-bold leading-none">
              {tipo === 'musculacao' ? 'Tempo médio' : 'Dist. média'}
            </p>
            <p className="text-base font-black text-white leading-tight mt-0.5">
              {tipo === 'musculacao'
                ? `${Math.round(mediaTempo)} min`
                : `${mediaDist.toFixed(1)} km`}
            </p>
          </div>

          <div>
            <p className="text-[8px] text-white/60 uppercase tracking-wider font-bold leading-none">
              Cal. média
            </p>
            <p className="text-sm font-black text-white leading-tight mt-0.5">
              {Math.round(mediaCal)} <span className="text-[9px] font-bold text-white/70">kcal</span>
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Flame size={10} className="text-white/70" />
            <span className="text-[9px] text-white/70 font-semibold">
              {Math.round(totalCal)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} className="text-white/70" />
            <span className="text-[9px] text-white/70 font-semibold">
              {Math.floor(totalTempo / 60)}h {totalTempo % 60}m
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================
// CARD GRANDE DE MODALIDADE (Corrida)
// =============================================
function CardModalidadeGrande({ tipo, dados, corConfig }) {
  const { cor, corBg1, corBg2 } = corConfig
  const Icone = tipo === 'musculacao' ? Dumbbell : Footprints
  const label = TIPOS_ATIVIDADE[tipo]?.label || tipo

  const mediaDist = dados.mediaDist || 0
  const mediaTempo = dados.mediaTempo || 0
  const mediaCal = dados.mediaCalorias || 0
  const totalCal = dados.totalCalorias || 0
  const totalTempo = dados.totalTempo || 0
  const totalDist = dados.totalDist || 0
  const pace = mediaDist > 0 ? (mediaTempo / mediaDist) : 0

  return (
    <div
      className="relative rounded-xl p-4 border overflow-hidden flex flex-col h-full"
      style={{
        borderColor: `${cor}55`,
        background: `linear-gradient(135deg, ${corBg1} 0%, ${corBg2} 100%)`,
        boxShadow: `0 8px 24px ${cor}33`,
      }}
    >
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: cor, opacity: 0.3, filter: 'blur(40px)' }}
      />

      <div className="relative flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)' }}
          >
            <Icone size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-base font-black text-white block leading-tight">{label}</span>
            <span className="text-[10px] text-white/60 block">
              {dados.qtd || 0} registros no período
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          <div>
            <p className="text-[9px] text-white/60 uppercase tracking-wider font-bold leading-none">
              Dist. média
            </p>
            <p className="text-lg font-black text-white leading-tight mt-1">
              {mediaDist.toFixed(1)}
              <span className="text-[11px] font-bold text-white/70 ml-0.5">km</span>
            </p>
          </div>

          <div>
            <p className="text-[9px] text-white/60 uppercase tracking-wider font-bold leading-none">
              Tempo médio
            </p>
            <p className="text-lg font-black text-white leading-tight mt-1">
              {Math.round(mediaTempo)}
              <span className="text-[11px] font-bold text-white/70 ml-0.5">min</span>
            </p>
          </div>

          <div>
            <p className="text-[9px] text-white/60 uppercase tracking-wider font-bold leading-none">
              Pace médio
            </p>
            <p className="text-lg font-black text-white leading-tight mt-1">
              {pace > 0 ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')}` : '—'}
              <span className="text-[11px] font-bold text-white/70 ml-0.5">/km</span>
            </p>
          </div>

          <div>
            <p className="text-[9px] text-white/60 uppercase tracking-wider font-bold leading-none">
              Cal. média
            </p>
            <p className="text-lg font-black text-white leading-tight mt-1">
              {Math.round(mediaCal)}
              <span className="text-[11px] font-bold text-white/70 ml-0.5">kcal</span>
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-0.5">
              <MapPin size={10} className="text-white/70" />
              <span className="text-[8px] text-white/60 uppercase font-bold tracking-wider">Total</span>
            </div>
            <span className="text-[11px] font-black text-white">
              {totalDist.toFixed(1)} <span className="text-[9px] font-bold text-white/70">km</span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-0.5">
              <Flame size={10} className="text-white/70" />
              <span className="text-[8px] text-white/60 uppercase font-bold tracking-wider">Total</span>
            </div>
            <span className="text-[11px] font-black text-white">
              {Math.round(totalCal)} <span className="text-[9px] font-bold text-white/70">kcal</span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-0.5">
              <Clock size={10} className="text-white/70" />
              <span className="text-[8px] text-white/60 uppercase font-bold tracking-wider">Total</span>
            </div>
            <span className="text-[11px] font-black text-white">
              {Math.floor(totalTempo / 60)}h {totalTempo % 60}m
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function ActivitiesScreen({
  atividades: atividadesProp,
  onRegistrar,
  onSelecionarAtividade,
  onColetarRecompensa,
}) {
  const [escopo, setEscopo] = useState('semana')

  // 🔥 Consome atividades da store (fonte única), com fallback pra prop
  const atividadesStore = useFitCityStore((s) => s.atividades)
  const atividades = atividadesProp || atividadesStore || []

  // ── Recompensa semanal ──
  const semanaKey = useMemo(() => getSemanaAtualKey(), [])
  const [recompensaJaColetada, setRecompensaJaColetada] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_META_SEMANAL)
      if (!raw) return
      const parsed = JSON.parse(raw)
      setRecompensaJaColetada(parsed?.semana === semanaKey)
    } catch { /* noop */ }
  }, [semanaKey])

  // ── Hoje ──
  const atividadesHoje = useMemo(
    () => atividades.filter(a => FILTRO_POR_PERIODO.hoje(a.data)),
    [atividades]
  )
  const resumoHoje = useMemo(() => resumoDoPeriodo(atividadesHoje), [atividadesHoje])
  const pctHoje = Math.min(100, (resumoHoje.calorias / META_DIARIA_KCAL) * 100)
  const metaHojeBatida = resumoHoje.calorias >= META_DIARIA_KCAL
  const xpHoje = Math.round(resumoHoje.moedas * 1.5)

  // ── Semana ──
  const atividadesSemana = useMemo(
    () => atividades.filter(a => FILTRO_POR_PERIODO.semana(a.data)),
    [atividades]
  )
  const resumoSemana = useMemo(() => resumoDoPeriodo(atividadesSemana), [atividadesSemana])

  // ── Mês ──
  const atividadesMes = useMemo(
    () => atividades.filter(a => FILTRO_POR_PERIODO.mes(a.data)),
    [atividades]
  )
  const resumoMes = useMemo(() => resumoDoPeriodo(atividadesMes), [atividadesMes])

  // ── Nível ──
  const nivelAtual = useMemo(() => calcularNivel(atividades.length), [atividades.length])
  const proximoNivel = TABELA_NIVEIS[nivelAtual.nivel] || null

  // ── Dias da semana ──
  const diasDaSemana = useMemo(() => {
    const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
    const nomes = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

    const hoje = new Date()
    const diaSemana = hoje.getDay()
    const offset = diaSemana === 0 ? 6 : diaSemana - 1

    return labels.map((dia, i) => {
      const diff = i - offset
      const data = new Date()
      data.setDate(data.getDate() + diff)
      const dataStr = data.toDateString()

      const atividadesDoDia = atividades.filter(
        a => new Date(a.data).toDateString() === dataStr
      )
      const xp = atividadesDoDia.reduce((acc, a) => acc + (a.moedas || 0), 0)

      return {
        dia,
        label: nomes[i],
        xp,
        concluido: atividadesDoDia.length > 0,
      }
    })
  }, [atividades])

  // ── Dados Gráfico Mensal ──
  // 🔥 Corrigido: usa `a.duracao` em vez de `a.tempo`
  const dadosMesHeatmap = useMemo(() => {
    const agora = new Date()
    const diasNoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate()
    const dados = []

    for (let d = 1; d <= diasNoMes; d++) {
      const dataStr = new Date(agora.getFullYear(), agora.getMonth(), d).toDateString()
      const totalMin = atividades
        .filter(a => new Date(a.data).toDateString() === dataStr)
        .reduce((acc, a) => acc + (a.duracao || 0), 0)  // ← corrigido: duracao
      dados.push({ dia: d, valor: totalMin })
    }
    return dados
  }, [atividades])

  // ── Desempenho por modalidade ──
  // 🔥 Corrigido: usa `a.duracao` em vez de `a.tempo`
  const desempenho = useMemo(() => {
    const base = escopo === 'semana' ? atividadesSemana : atividadesMes
    const grupos = { corrida: [], musculacao: [], caminhada: [] }

    base.forEach(a => {
      if (grupos[a.tipo]) grupos[a.tipo].push(a)
    })

    const calc = (lista) => {
      if (lista.length === 0) {
        return {
          qtd: 0,
          mediaDist: 0,
          mediaTempo: 0,
          mediaCalorias: 0,
          totalDist: 0,
          totalTempo: 0,
          totalCalorias: 0,
        }
      }
      const totalDist = lista.reduce((acc, a) => acc + (a.distancia || 0), 0)
      const totalTempo = lista.reduce((acc, a) => acc + (a.duracao || 0), 0)  // ← corrigido
      const totalCalorias = lista.reduce((acc, a) => acc + (a.calorias || 0), 0)
      return {
        qtd: lista.length,
        mediaDist: totalDist / lista.length,
        mediaTempo: totalTempo / lista.length,
        mediaCalorias: totalCalorias / lista.length,
        totalDist,
        totalTempo,
        totalCalorias,
      }
    }

    return {
      corrida: calc(grupos.corrida),
      musculacao: calc(grupos.musculacao),
      caminhada: calc(grupos.caminhada),
    }
  }, [atividadesSemana, atividadesMes, escopo])

  const progressoMeta = Math.min(atividadesSemana.length, META_SEMANAL_ATIVIDADES)
  const metaSemanalBatida = progressoMeta >= META_SEMANAL_ATIVIDADES

  const handleColetarRecompensa = () => {
    if (!metaSemanalBatida || recompensaJaColetada) return

    if (typeof onColetarRecompensa === 'function') {
      onColetarRecompensa(RECOMPENSA_META_SEMANAL)
    }

    try {
      const saldoRaw = localStorage.getItem('fitcity:saldo-moedas')
      const saldoAtual = saldoRaw ? Number(saldoRaw) || 0 : 0
      localStorage.setItem(
        'fitcity:saldo-moedas',
        String(saldoAtual + RECOMPENSA_META_SEMANAL)
      )
    } catch { /* noop */ }

    try {
      localStorage.setItem(
        STORAGE_KEY_META_SEMANAL,
        JSON.stringify({ semana: semanaKey, valor: RECOMPENSA_META_SEMANAL })
      )
    } catch { /* noop */ }

    setRecompensaJaColetada(true)
  }

  // ═════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-4 pb-24 text-white">

      {/* HEADER */}
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-black">Atividades</h1>
      </div>

      {/* CARD UNIFICADO */}
      <div className="px-3">
        <div className="relative bg-gradient-to-br from-purple-900/60 to-indigo-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_30px_rgba(100,17,217,0.35)] overflow-hidden min-h-[150px] sm:min-h-[280px]">
          <div className="absolute inset-0 pointer-events-none">
            <MiniMapaCidade atividades={atividades} />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/85 pointer-events-none" />

          <div className="relative flex flex-col justify-between h-full p-4 gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="shrink-0">
                <p className="text-base font-black leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  Hoje
                </p>
                <p className="text-sm font-black text-emerald-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  +{xpHoje} XP
                </p>
              </div>

              <div
                className={`relative rounded-2xl border px-4 py-3 w-[130px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-500 ${metaHojeBatida
                  ? 'bg-gradient-to-br from-[#F27405]/35 to-[#6411D9]/55 border-[#6411D9]/35'
                  : 'bg-[#1E0A3C]/55 border-white/10'
                  }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <Flame size={13} className="text-orange-400 shrink-0" />
                    <span className="text-sm font-black leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                      {resumoHoje.calorias}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] shrink-0 ${metaHojeBatida ? 'text-purple-300' : 'text-[#F27405]'
                      }`}
                  >
                    {Math.round(pctHoje)}%
                  </span>
                </div>

                <p className="text-[9px] text-white/50 font-medium leading-none mb-2">
                  / {META_DIARIA_KCAL} kcal
                </p>

                <div className="relative h-2 rounded-full bg-black/50 border border-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${metaHojeBatida
                      ? 'bg-gradient-to-r from-[#F27405] via-orange-600 to-[#6411D9] shadow-[0_0_10px_rgba(100,17,217,0.7)]'
                      : 'bg-gradient-to-r from-[#F27405] to-orange-500 shadow-[0_0_8px_rgba(242,116,5,0.5)]'
                      }`}
                    style={{ width: `${pctHoje}%` }}
                  />
                </div>

                {metaHojeBatida && (
                  <p className="text-[9px] font-black text-purple-200 uppercase tracking-wider mt-1.5 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    ★ Meta batida
                  </p>
                )}
              </div>
            </div>

            <div className="bg-[#6411D9]/30 backdrop-blur-sm rounded-2xl border border-white/10 flex items-stretch overflow-hidden">
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 min-w-0">
                <MapPin size={14} className="text-orange-400 shrink-0" />
                <span className="text-xs font-bold truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {resumoHoje.distancia.toFixed(1)} Km
                </span>
              </div>
              <div className="w-px bg-white/10 my-2" />
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 min-w-0">
                <Clock size={14} className="text-orange-400 shrink-0" />
                <span className="text-xs font-bold truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {Math.floor(resumoHoje.tempo / 60)}h {resumoHoje.tempo % 60}min
                </span>
              </div>
              <div className="w-px bg-white/10 my-2" />
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 min-w-0">
                <Coins size={14} className="text-orange-400 shrink-0" />
                <span className="text-xs font-bold truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  +{resumoHoje.moedas}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÃO REGISTRAR */}
      <div className="px-3">
        <button
          onClick={onRegistrar}
          className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-4 font-black text-base shadow-[0_10px_25px_rgba(242,116,5,0.5)] overflow-hidden active:scale-[0.98] transition-transform"
        >
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          <Plus size={20} className="relative" />
          <span className="relative">Registrar atividade</span>
        </button>
      </div>

      {/* RESUMO SEMANAL */}
      <div className="px-3">
        <div className="bg-[#350973]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-purple-300" />
              <p className="text-sm font-black">Resumo Semanal</p>
            </div>
            <span className="text-[10px] text-white/40">Últimos 7 dias</span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-black/20 rounded-xl p-2 flex flex-col items-center">
              <Clock size={14} className="text-[#F27405] mb-1" />
              <span className="text-[11px] font-black">{Math.floor(resumoSemana.tempo / 60)}h {resumoSemana.tempo % 60}m</span>
              <span className="text-[8px] text-white/50">Tempo</span>
            </div>
            <div className="bg-black/20 rounded-xl p-2 flex flex-col items-center">
              <Flame size={14} className="text-orange-400 mb-1" />
              <span className="text-[11px] font-black">{resumoSemana.calorias}</span>
              <span className="text-[8px] text-white/50">Kcal</span>
            </div>
            <div className="bg-black/20 rounded-xl p-2 flex flex-col items-center">
              <Coins size={14} className="text-yellow-400 mb-1" />
              <span className="text-[11px] font-black">+{resumoSemana.moedas}</span>
              <span className="text-[8px] text-white/50">Moedas</span>
            </div>
            <div className="bg-black/20 rounded-xl p-2 flex flex-col items-center">
              <Footprints size={14} className="text-purple-300 mb-1" />
              <span className="text-[11px] font-black">{atividadesSemana.length}</span>
              <span className="text-[8px] text-white/50">Treinos</span>
            </div>
          </div>

          <BlocoMetaSemanal
            dias={diasDaSemana}
            progressoMeta={progressoMeta}
            metaSemanal={META_SEMANAL_ATIVIDADES}
            proximoEdificio="—"
            metaBatida={metaSemanalBatida}
            recompensaJaColetada={recompensaJaColetada}
            onColetarRecompensa={handleColetarRecompensa}
          />
        </div>
      </div>

      {/* RESUMO MENSAL */}
      <div className="px-3">
        <div className="bg-purple-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-purple-300" />
              <p className="text-sm font-black">Resumo Mensal</p>
            </div>
            <span className="text-[10px] text-white/40">Setembro 2026</span>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div>
              <p className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Dias Ativos</p>
              <p className="text-lg font-black">{dadosMesHeatmap.filter(d => d.valor > 0).length}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Tempo Total</p>
              <p className="text-lg font-black">{Math.floor(resumoMes.tempo / 60)}h {resumoMes.tempo % 60}m</p>
            </div>
            <div>
              <p className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Calorias</p>
              <p className="text-lg font-black">{resumoMes.calorias}</p>
            </div>
          </div>

          <MapaDeCalor dados={dadosMesHeatmap} />
        </div>
      </div>

      {/* SUAS ATIVIDADES */}
      <div className="px-3">
        <div className="bg-purple-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-600/40 flex items-center justify-center">
                <Footprints size={13} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-black leading-tight">Suas Atividades</p>
                <p className="text-[9px] text-white/50">Desempenho por modalidade</p>
              </div>
            </div>

            <div className="flex bg-black/30 rounded-full p-0.5">
              <button
                onClick={() => setEscopo('semana')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${escopo === 'semana'
                  ? 'bg-gradient-to-r from-fitcity-energy to-orange-600 text-white shadow-[0_2px_8px_rgba(242,116,5,0.5)]'
                  : 'text-white/40'
                  }`}
              >
                Semana
              </button>
              <button
                onClick={() => setEscopo('mes')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${escopo === 'mes'
                  ? 'bg-gradient-to-r from-fitcity-energy to-orange-600 text-white shadow-[0_2px_8px_rgba(242,116,5,0.5)]'
                  : 'text-white/40'
                  }`}
              >
                Mês
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2" style={{ minHeight: '220px' }}>
            <div className="flex flex-col gap-2">
              <CardModalidadePequeno
                tipo="musculacao"
                dados={desempenho.musculacao}
                corConfig={MODALIDADE_CORES.musculacao}
              />
              <CardModalidadePequeno
                tipo="caminhada"
                dados={desempenho.caminhada}
                corConfig={MODALIDADE_CORES.caminhada}
              />
            </div>

            <CardModalidadeGrande
              tipo="corrida"
              dados={desempenho.corrida}
              corConfig={MODALIDADE_CORES.corrida}
            />
          </div>
        </div>
      </div>

    </div>
  )
}