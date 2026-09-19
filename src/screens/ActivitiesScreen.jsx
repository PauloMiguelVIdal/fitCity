// src/screens/ActivitiesScreen.jsx
import { useState, useMemo } from 'react'
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
} from '../utils/atividades'
import MapWorldActivities from '../components/MapWorldActivities'
import { MODELOS, EDIFICIO_PARA_MODELO } from '../components/BuildingModels'

const META_DIARIA_KCAL = 600
const META_SEMANAL_ATIVIDADES = 5
const HEX_SIZE = 0.6

// =============================================
// HELPERS
// =============================================
const HEX_DIRECTIONS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]]
const vizinhosDeHex = (q, r) => HEX_DIRECTIONS.map(([dq, dr]) => `${q + dq},${r + dr}`)

const getNivelPorMoedas = (moedas) => {
  if (moedas <= 5) return 1
  if (moedas <= 10) return 2
  if (moedas <= 20) return 3
  if (moedas <= 30) return 4
  if (moedas <= 50) return 5
  return 6
}

const EDIFICIOS_POR_NIVEL = {
  1: { edificios: [{ nome: 'Plantação De Vegetais', setor: 'agricultura' }] },
  2: { edificios: [{ nome: 'Granja De Aves', setor: 'agricultura' }] },
  3: { edificios: [{ nome: 'Fazenda De Vacas', setor: 'agricultura' }] },
  4: { edificios: [{ nome: 'Criação De Ovinos', setor: 'agricultura' }] },
  5: { edificios: [{ nome: 'Cooperativa Agrícola', setor: 'agricultura' }] },
  6: { edificios: [{ nome: 'Centro De Comércio De Plantações', setor: 'agricultura' }] },
}

const escolherEdificioPorNivel = (nivel) => {
  const config = EDIFICIOS_POR_NIVEL[nivel] || EDIFICIOS_POR_NIVEL[1]
  return config.edificios[0]
}

const edificioEhCluster = (() => {
  const cache = new Map()
  return (nomeEdificio) => {
    if (cache.has(nomeEdificio)) return cache.get(nomeEdificio)
    const modeloId = EDIFICIO_PARA_MODELO[nomeEdificio]
    const result = modeloId ? MODELOS[modeloId]?.tamanho === 7 : false
    cache.set(nomeEdificio, result)
    return result
  }
})()

const edificioEhComposto = (() => {
  const cache = new Map()
  return (nomeEdificio) => {
    if (cache.has(nomeEdificio)) return cache.get(nomeEdificio)
    const modeloId = EDIFICIO_PARA_MODELO[nomeEdificio]
    const result = modeloId ? MODELOS[modeloId]?.tipo === 'composto' : false
    cache.set(nomeEdificio, result)
    return result
  }
})()

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

const MODALIDADE_CORES = {
  corrida:    { cor: '#F27405', corBg1: '#F27405', corBg2: '#8B3D00' },
  musculacao: { cor: '#6411D9', corBg1: '#6411D9', corBg2: '#331B8C' },
  caminhada:  { cor: '#8F5ADA', corBg1: '#8F5ADA', corBg2: '#6411D9' },
}

// =============================================
// MINI MAPA DO CARD "SUA CIDADE"
// =============================================
function MiniMapaCidade({ atividades }) {
  const atividadesMes = atividades.length
  const nivelAtual = calcularNivel(atividadesMes)
  const raioMapa = nivelAtual.raio

  const edificiosAtivos = useMemo(() => {
    const tipos = ['corrida', 'musculacao', 'caminhada']
    return atividades
      .filter(a => tipos.includes(a.tipo))
      .map((atividade, idx) => {
        const moedas = calcularMoedas(atividade)
        const nivelMoeda = getNivelPorMoedas(moedas)
        const edificio = escolherEdificioPorNivel(nivelMoeda)
        return {
          id: atividade.id ?? `atv-${idx}`,
          nome: edificio.nome,
          setor: edificio.setor,
          ehCluster: edificioEhCluster(edificio.nome),
          ehComposto: edificioEhComposto(edificio.nome),
        }
      })
  }, [atividades])

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
    edificiosAtivos.forEach(e => m.set(e.id, e))
    return m
  }, [edificiosAtivos])

  const posicoes = useMemo(() => {
    const gridKeys = new Set(hexGrid.map(h => `${h.q},${h.r}`))
    const ocupadas = new Set(['0,0'])
    const novas = {}

    const keys = hexGrid.map(h => `${h.q},${h.r}`).sort((a, b) => {
      const [aq, ar] = a.split(',').map(Number)
      const [bq, br] = b.split(',').map(Number)
      return (aq*aq + ar*ar) - (bq*bq + br*br)
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

    edificiosAtivos.filter(e => e.ehCluster).forEach(ed => {
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

    edificiosAtivos.filter(e => !e.ehCluster).forEach(ed => {
      const pos = proximoLivre()
      if (pos) { novas[pos] = ed.id; ocupadas.add(pos) }
    })

    return novas
  }, [edificiosAtivos, hexGrid])

  const satelites = useMemo(() => {
    const m = {}
    Object.entries(posicoes).forEach(([key, id]) => {
      const ed = edificioPorId.get(id)
      if (!ed?.ehCluster) return
      const modeloId = EDIFICIO_PARA_MODELO[ed.nome]
      const modeloDef = modeloId ? MODELOS[modeloId] : null
      const defSats = modeloDef?.satelites || []
      const [q, r] = key.split(',').map(Number)
      vizinhosDeHex(q, r).forEach((vk, i) => {
        if (vk === '0,0') return
        if (!posicoes[vk]) {
          m[vk] = { modeloId: defSats[i]?.modeloId ?? null, edificioDono: ed, corFallback: '#888888' }
        }
      })
    })
    return m
  }, [posicoes, edificioPorId])

  const tiles = useMemo(
    () => hexGrid.map(h => ({ hex: h, key: `${h.q},${h.r}` }))
      .filter(({ key }) => key !== '0,0' && !satelites[key]),
    [hexGrid, satelites]
  )

  const noop = () => {}
  const jaColetou = () => true

  return (
    <MapWorldActivities
      nomeEmpresa="FitCity"
      porte={nivelAtual.porte}
      raioMapa={raioMapa}
      dayProgress={0}
      posicoes={posicoes}
      satelites={satelites}
      tilesToRender={tiles}
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
      onMapReady={noop}
    />
  )
}

// =============================================
// GRÁFICO DE LINHA ACUMULATIVA (SEMANAL)
// =============================================
function GraficoLinhaAcumulativaSemanal({ pontos = [], cor = '#F27405' }) {
  const max = Math.max(...pontos.map(p => p.valor), 1)
  const w = 100
  const h = 40
  const padTopo = 10
  const stepX = w / Math.max(pontos.length - 1, 1)

  const path = pontos.map((p, i) => {
    const x = i * stepX
    const y = h - (p.valor / max) * h
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')

  const areaPath = `${path} L${w},${h} L0,${h} Z`

  return (
    <div className="mt-2">
      <svg viewBox={`0 -${padTopo} ${w} ${h + 6 + padTopo}`} className="w-full h-20 overflow-visible">
        <defs>
          <linearGradient id={`gradAcum-${cor.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={cor} stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill={`url(#gradAcum-${cor.replace('#','')})`} />
        <path d={path} fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {pontos.map((p, i) => {
          const x = i * stepX
          const y = h - (p.valor / max) * h
          return (
            <g key={i}>
              <text
                x={x}
                y={y - 4}
                textAnchor="middle"
                fontSize="3.5"
                fontWeight="700"
                fill="rgba(255,255,255,0.55)"
              >
                {p.label}
              </text>

              <circle cx={x} cy={y} r="2.5" fill="#1a0b2e" stroke={cor} strokeWidth="1.5" />

              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                fontSize="2.4"
                fontWeight="900"
                fill="#ffffff"
              >
                {p.dia}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="flex justify-between mt-1">
        {pontos.map((p, i) => (
          <span key={i} className="text-[8px] text-white/40 font-medium">
            {p.dia}
          </span>
        ))}
      </div>
    </div>
  )
}

// =============================================
// GRÁFICO DE LINHA ACUMULATIVA (GENÉRICO — mensal)
// =============================================
function GraficoLinhaAcumulativa({ pontos = [], cor = '#F27405' }) {
  const max = Math.max(...pontos.map(p => p.valor), 1)
  const w = 100, h = 40
  const stepX = w / Math.max(pontos.length - 1, 1)

  const path = pontos.map((p, i) => {
    const x = i * stepX
    const y = h - (p.valor / max) * h
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')

  const areaPath = `${path} L${w},${h} L0,${h} Z`

  return (
    <div className="mt-2">
      <svg viewBox={`0 0 ${w} ${h + 6}`} className="w-full h-16 overflow-visible">
        <defs>
          <linearGradient id={`gradAcum-${cor.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={cor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#gradAcum-${cor.replace('#','')})`} />
        <path d={path} fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pontos.map((p, i) => {
          const x = i * stepX
          const y = h - (p.valor / max) * h
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#1a0b2e" stroke={cor} strokeWidth="1.5" />
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {pontos.map((p, i) => (
          <span key={i} className="text-[8px] text-white/40 font-medium">{p.label}</span>
        ))}
      </div>
    </div>
  )
}

// =============================================
// MAPA DE CALOR (Heatmap) — Calendário real por dia da semana
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
          <div
            key={i}
            className="text-center text-[8px] font-bold text-white/40 uppercase"
          >
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
              <span className="text-[7px] font-bold text-white/70">
                {c.dia}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =============================================
// BLOCO META DA SEMANA (dias da semana estilo HomeScreen)
// Usado DENTRO do card do Resumo Semanal
// =============================================
function BlocoMetaSemanal({ dias = [], progressoMeta, metaSemanal, proximoEdificio }) {
  return (
    <div className="relative mt-4 pt-4 border-t border-white/10">
      {/* Header: título + recompensa */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-[0_4px_14px_rgba(242,116,5,0.5)] shrink-0">
            <Trophy size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black leading-tight">Meta da Semana</p>
            <p className="text-[9px] text-white/50 truncate">
              {progressoMeta}/{metaSemanal} atividades
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-[0_4px_15px_rgba(234,88,12,0.4)] shrink-0">
          <Gift size={11} className="text-white" />
          <span className="text-[10px] font-black text-white">+100</span>
          <Coins size={10} className="text-white" />
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full h-2 bg-purple-900/50 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fitcity-energy to-orange-500 transition-all"
          style={{ width: `${(progressoMeta / metaSemanal) * 100}%` }}
        />
      </div>

      {/* Dias da semana */}
      <div className="flex justify-between items-center gap-0.5">
        {dias.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="relative">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  item.concluido
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_4px_15px_rgba(234,88,12,0.5)]'
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
                className={item.concluido ? 'text-orange-400' : 'text-purple-400/30'}
              />
              <span
                className={`text-[9px] font-bold ${
                  item.concluido ? 'text-orange-400' : 'text-purple-400/30'
                }`}
              >
                {item.concluido ? `+${item.xp}` : '-'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé: recompensa detalhada */}
      {/* <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-center flex-wrap">
        <span className="text-[9px] font-black text-white/50 uppercase tracking-wider">
          Recompensa:
        </span>
        <span className="text-xs font-black text-white truncate max-w-[140px]">
          🏭 {proximoEdificio}
        </span>
        <span className="text-[10px] text-orange-400">⭐⭐⭐</span>
        <span className="text-xs font-black text-fitcity-energy">+100</span>
        <Coins size={12} className="text-fitcity-energy" />
      </div> */}
    </div>
  )
}

// =============================================
// CARD PEQUENO DE MODALIDADE (Musculação / Caminhada)
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
export default function ActivitiesScreen({ atividades = [], onRegistrar, onSelecionarAtividade }) {
  const [escopo, setEscopo] = useState('semana')

  // ── Hoje ──
  const atividadesHoje = useMemo(
    () => atividades.filter(a => FILTRO_POR_PERIODO.hoje(a.data)),
    [atividades]
  )
  const resumoHoje = useMemo(() => resumoDoPeriodo(atividadesHoje), [atividadesHoje])
  const pctHoje = Math.min(100, (resumoHoje.calorias / META_DIARIA_KCAL) * 100)
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

  const proximoEdificio = useMemo(() => {
    if (!proximoNivel) return 'Mega Holding'
    return escolherEdificioPorNivel(Math.min(proximoNivel.nivel - 1, 6)).nome
  }, [proximoNivel])

  // ── Dados Gráfico Semanal (Acumulativo + dia da semana + número do dia) ──
  const dadosSemanaAcumulativo = useMemo(() => {
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    const hoje = new Date()
    const diaSemana = hoje.getDay()
    const offset = diaSemana === 0 ? 6 : diaSemana - 1

    let acumulado = 0
    return labels.map((label, i) => {
      const diff = i - offset
      const data = new Date()
      data.setDate(data.getDate() + diff)
      const dataStr = data.toDateString()
      
      const totalDia = atividades
        .filter(a => new Date(a.data).toDateString() === dataStr)
        .reduce((acc, a) => acc + (a.tempo || 0), 0)
      
      acumulado += totalDia
      return {
        label,
        dia: data.getDate(),
        valor: acumulado,
      }
    })
  }, [atividades])

  // ── Dados dos dias da semana (para o bloco Meta) ──
  const diasDaSemana = useMemo(() => {
    const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
    const nomes = ['Hoje', 'Ontem', 'Anteontem', 'Qui', 'Sex', 'Sáb', 'Dom']

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

  // ── Dados Gráfico Mensal (Heatmap + Acumulativo) ──
  const dadosMesHeatmap = useMemo(() => {
    const agora = new Date()
    const diasNoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate()
    const dados = []
    
    for (let d = 1; d <= diasNoMes; d++) {
      const dataStr = new Date(agora.getFullYear(), agora.getMonth(), d).toDateString()
      const totalMin = atividades
        .filter(a => new Date(a.data).toDateString() === dataStr)
        .reduce((acc, a) => acc + (a.tempo || 0), 0)
      dados.push({ dia: d, valor: totalMin })
    }
    return dados
  }, [atividades])

  const dadosMesAcumulativo = useMemo(() => {
    let acumulado = 0
    const pontos = []
    dadosMesHeatmap.forEach((d, i) => {
      acumulado += d.valor
      if (i % 5 === 0 || i === dadosMesHeatmap.length - 1) {
        pontos.push({ label: `${i+1}`, valor: acumulado })
      }
    })
    return pontos
  }, [dadosMesHeatmap])

  // ── Desempenho por modalidade ──
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
      const totalTempo = lista.reduce((acc, a) => acc + (a.tempo || 0), 0)
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

  // ═════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-4 pb-24 text-white">

      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-black">Atividades</h1>
      </div>

      {/* ═══════════════ CARD "HOJE" + "SUA CIDADE" ═══════════════ */}
      <div className="px-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Hoje */}
          <div className="bg-gradient-to-br from-purple-900/60 to-purple-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(100,17,217,0.35)] flex flex-col">
            <p className="text-xs font-bold text-white/70 mb-1">Hoje</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-xl font-black">{resumoHoje.calorias}</span>
              <span className="text-[11px] text-white/50">/ {META_DIARIA_KCAL} kcal</span>
            </div>
            <div className="relative h-5 rounded-full bg-white/10 overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-fitcity-energy to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${pctHoje}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                {Math.round(pctHoje)}%
              </span>
            </div>
            <div className="flex flex-col gap-1.5 mt-auto">
              <div className="flex items-center gap-2 text-[11px]">
                <MapPin size={12} className="text-fitcity-energy" />
                <span className="font-semibold">{resumoHoje.distancia.toFixed(1)} km</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Clock size={12} className="text-fitcity-energy" />
                <span className="font-semibold">
                  {Math.floor(resumoHoje.tempo / 60)}h {resumoHoje.tempo % 60}min
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Coins size={12} className="text-fitcity-energy" />
                <span className="font-semibold">+{resumoHoje.moedas} moedas</span>
              </div>
            </div>
          </div>

          {/* Sua cidade */}
          <div className="relative bg-gradient-to-br from-purple-900/60 to-indigo-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-[0_10px_30px_rgba(100,17,217,0.35)] overflow-hidden flex flex-col">
            <div className="absolute inset-0 opacity-90 pointer-events-none">
              <MiniMapaCidade atividades={atividades} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/75 pointer-events-none" />
            <div className="relative flex flex-col h-full">
              <div>
                <p className="text-[10px] font-bold text-white/60">Sua cidade</p>
                <p className="text-xs font-black leading-tight mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  FitCity - Nível {nivelAtual.nivel}
                </p>
              </div>
              <div className="flex-1 min-h-[50px]" />
              <div className="mt-auto">
                <p className="text-sm font-black text-emerald-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  +{xpHoje} XP hoje
                </p>
                <p className="text-[9px] text-white/60 mt-0.5 truncate">
                  Próximo: <b className="text-white/80">{proximoEdificio}</b>
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex-1 flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const preenchido = (i + 1) * 50 <= atividades.length
                      return (
                        <div
                          key={i}
                          className="flex-1 h-1.5 rounded-sm"
                          style={{
                            background: preenchido
                              ? 'linear-gradient(180deg, #F27405 0%, #E65A00 100%)'
                              : 'rgba(255,255,255,0.15)',
                          }}
                        />
                      )
                    })}
                  </div>
                  <span className="text-[8px] font-bold text-white/60 shrink-0">
                    {atividades.length}/500 XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ BOTÃO REGISTRAR ═══════════════ */}
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

      {/* ═══════════════ RESUMO SEMANAL (LARGURA TOTAL) + META DA SEMANA ═══════════════ */}
      <div className="px-3">
        <div className="bg-purple-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-purple-300" />
              <p className="text-sm font-black">Resumo Semanal</p>
            </div>
            <span className="text-[10px] text-white/40">
              {dadosSemanaAcumulativo[0]?.dia} - {dadosSemanaAcumulativo[dadosSemanaAcumulativo.length - 1]?.dia} de set
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-black/20 rounded-xl p-2 flex flex-col items-center">
              <Clock size={14} className="text-fitcity-energy mb-1" />
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

          {/* 🔽 BLOCO META DA SEMANA (dentro do Resumo Semanal) */}
          <BlocoMetaSemanal
            dias={diasDaSemana}
            progressoMeta={progressoMeta}
            metaSemanal={META_SEMANAL_ATIVIDADES}
            proximoEdificio={proximoEdificio}
          />
        </div>
      </div>

      {/* ═══════════════ RESUMO MENSAL (LARGURA TOTAL — calendário) ═══════════════ */}
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

      {/* ═══════════════ SUAS ATIVIDADES ═══════════════ */}
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
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                  escopo === 'semana'
                    ? 'bg-gradient-to-r from-fitcity-energy to-orange-600 text-white shadow-[0_2px_8px_rgba(242,116,5,0.5)]'
                    : 'text-white/40'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setEscopo('mes')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                  escopo === 'mes'
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