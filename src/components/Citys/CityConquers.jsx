// src/components/cidades/CidadePatrimonio.jsx
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Building2, ChevronRight, MapPin, Award, Archive, Flame, Clock, MapPinned, Maximize, Minimize } from 'lucide-react'
import { defineHex, Grid, spiral } from 'honeycomb-grid'
import MapWorldFitCity from '../MapWorldCity'
import MapLoadingOverlay from '../MapLoadingOverlay'
import { MODELOS, EDIFICIO_PARA_MODELO } from '../BuildingModels'

const HEX_SIZE = 0.6

// =============================================
// UTILITÁRIO PARA IMAGENS
// =============================================
const getImageUrl = (nome) => `/imagens/${nome}.png`

// =============================================
// HEX DIRECTIONS
// =============================================
const HEX_DIRECTIONS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]]
const vizinhosDeHex = (q, r) => HEX_DIRECTIONS.map(([dq, dr]) => `${q + dq},${r + dr}`)

// =============================================
// TABELA DE NÍVEIS (por cartas únicas)
// =============================================
const TABELA_NIVEIS_PATRIMONIO = [
  { nivel: 1,  porte: 'Micro Empresa',             raio: 3, cartasMin: 1  },
  { nivel: 2,  porte: 'Sociedade Limitada',        raio: 3, cartasMin: 5  },
  { nivel: 3,  porte: 'Empresa Regional',          raio: 3, cartasMin: 10 },
  { nivel: 4,  porte: 'Companhia Local',           raio: 4, cartasMin: 16 },
  { nivel: 5,  porte: 'Empresa Estadual',          raio: 5, cartasMin: 24 },
  { nivel: 6,  porte: 'Companhia Nacional',        raio: 6, cartasMin: 32 },
  { nivel: 7,  porte: 'Corporação Multissetorial', raio: 6, cartasMin: 40 },
  { nivel: 8,  porte: 'Grupo Empresarial',         raio: 7, cartasMin: 48 },
  { nivel: 9,  porte: 'Conglomerado Global',       raio: 7, cartasMin: 56 },
  { nivel: 10, porte: 'Mega Holding',              raio: 8, cartasMin: 65 },
]

function calcularNivelPatrimonio(cartasUnicas) {
  let resultado = TABELA_NIVEIS_PATRIMONIO[0]
  for (const item of TABELA_NIVEIS_PATRIMONIO) {
    if (cartasUnicas >= item.cartasMin) resultado = item
    else break
  }
  return resultado
}

function proximoNivelPatrimonio(cartasUnicas) {
  const atual = calcularNivelPatrimonio(cartasUnicas)
  const idx = TABELA_NIVEIS_PATRIMONIO.findIndex(n => n.nivel === atual.nivel)
  if (idx < 0 || idx >= TABELA_NIVEIS_PATRIMONIO.length - 1) return null
  return TABELA_NIVEIS_PATRIMONIO[idx + 1]
}

// =============================================
// CACHE DE VERIFICAÇÃO
// =============================================
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

// =============================================
// MAPEAMENTO SETOR → CARTAS
// =============================================
const mapaSetor = {
  "Plantação De Grãos": "agricultura",
  "Pomares": "agricultura",
  "Cooperativa Agrícola": "agricultura",
  "Centro De Comércio De Plantações": "agricultura",
  "Fazenda De Vacas": "agricultura",
  "Granja De Aves": "agricultura",
  "Criação De Ovinos": "agricultura",
  "Armazém": "agricultura",
  "Silo": "agricultura",
  "Depósito De Resíduos Orgânicos": "agricultura",
  "Serraria": "agricultura",
  "Área Florestal": "agricultura",
  "Terreno De Mineração": "agricultura",
  "Plantação De Eucalipto": "agricultura",
  "Pátio De Mineração": "agricultura",
  "Fábrica De Rações": "industria",
  "Fábrica De Bebidas": "industria",
  "Fábrica De Pães": "industria",
  "Fábrica De Calçados": "industria",
  "Fábrica De Papel": "industria",
  "Laboratório Farmacêutico": "industria",
  "Usina Siderúrgica": "industria",
  "Fábrica De Ligas Metálicas": "industria",
  "Fábrica De Peças Automotivas": "industria",
  "Fábrica De Robôs": "industria",
  "Empresa De Automação Industrial": "industria",
  "Fábrica De Motores": "industria",
  "Fábrica De Foguetes": "industria",
  "Fábrica De Aeronaves": "industria",
  "Estaleiro": "industria",
  "Container Modular": "industria",
  "Pátio De Veículos": "industria",
  "Startup": "tecnologia",
  "Servidor Em Nuvem": "tecnologia",
  "Empresa De Desenvolvimento De Software": "tecnologia",
  "Centro De Pesquisa Em Fusão Nuclear": "tecnologia",
  "Centro De Pesquisa Aeroespacial": "tecnologia",
  "Feira": "comercio",
  "Loja De Móveis": "comercio",
  "Farmácia": "comercio",
  "Câmara Fria": "comercio",
  "Mercado": "comercio",
  "Loja De Calçados": "comercio",
  "Posto De Combustíveis": "comercio",
  "Centro De Distribuição": "comercio",
  "Concessionária De Veículos": "comercio",
  "Transporte Petrolífero": "comercio",
  "Shopping Popular": "comercio",
  "Shopping Center": "comercio",
  "Mega Mercado": "comercio",
  "Construtora De Pequenas Obras": "imobiliario",
  "Cartório E Licenças": "imobiliario",
  "Escritório De Arquitetura": "imobiliario",
  "Consultoria Em Engenharia Civil": "imobiliario",
  "Escritório De Design De Interiores": "imobiliario",
  "Construtora": "imobiliario",
  "Imobiliária Residencial": "imobiliario",
  "Imobiliária Comercial": "imobiliario",
  "Construtora De Infraestruturas": "imobiliario",
  "Prédio De Alto Padrão": "imobiliario",
  "Subestação De Energia": "energia",
  "Campo De Estocagem": "energia",
  "Centro De Pesquisa Energética": "energia",
  "Empresa De Comércio Energético": "energia",
  "Usina De Biomassa": "energia",
  "Parque Eólico": "energia",
  "Fábrica De Turbinas Eólicas": "energia",
  "Usina Hidrelétrica": "energia",
  "Usina Termelétrica A Biocombustíveis": "energia",
  "Usina Termelétrica": "energia",
  "Reator Nuclear Convencional": "energia",
  "Usina De Fusão Nuclear": "energia",
  "Estação De Carregamento": "energia",
  "Tanque De Armazenamento De Fluidos": "energia",
  "Mineradora": "imobiliario",
  "Plataforma De Petróleo": "imobiliario",
  "Centro De Coleta De Biomassa": "imobiliario",
  "Hangar": "imobiliario",
  "Armazém De Materiais Sensíveis": "imobiliario",
  "Aeroporto": "imobiliario",
  "Porto": "imobiliario",
}

const getSetor = (nome) => mapaSetor[nome] || "outros"

// =============================================
// CARTAS FITCITY ÚNICAS (mock)
// =============================================
const CARTAS_FITCITY_UNICAS = [
  "Terreno De Mineração","Pátio De Mineração","Pomares","Depósito De Resíduos Orgânicos",
  "Plantação De Grãos","Serraria","Plantação De Eucalipto","Cooperativa Agrícola",
  "Centro De Comércio De Plantações","Área Florestal",
  "Subestação De Energia","Campo De Estocagem","Silo","Centro De Pesquisa Energética",
  "Empresa De Comércio Energético","Usina De Biomassa","Parque Eólico","Fábrica De Turbinas Eólicas",
  "Usina Hidrelétrica","Usina Termelétrica A Biocombustíveis","Usina Termelétrica",
  "Reator Nuclear Convencional","Usina De Fusão Nuclear","Estação De Carregamento",
  "Tanque De Armazenamento De Fluidos",
  "Fazenda De Vacas","Granja De Aves","Fábrica De Rações","Fábrica De Papel","Fábrica De Pães",
  "Container Modular","Pátio De Veículos","Fábrica De Calçados","Fábrica De Bebidas",
  "Laboratório Farmacêutico","Fábrica De Motores","Fábrica De Robôs","Usina Siderúrgica",
  "Fábrica De Ligas Metálicas","Fábrica De Peças Automotivas","Fábrica De Smartphones",
  "Empresa De Automação Industrial",
  "Startup","Servidor Em Nuvem","Empresa De Desenvolvimento De Software",
  "Centro De Pesquisa Em Fusão Nuclear","Centro De Pesquisa Aeroespacial",
  "Feira","Loja De Móveis","Farmácia","Câmara Fria","Mercado","Loja De Calçados",
  "Posto De Combustíveis","Centro De Distribuição","Concessionária De Veículos",
  "Transporte Petrolífero","Shopping Popular","Shopping Center","Mega Mercado",
  "Construtora De Pequenas Obras","Cartório E Licenças","Escritório De Arquitetura",
  "Consultoria Em Engenharia Civil","Escritório De Design De Interiores","Construtora",
  "Imobiliária Residencial","Imobiliária Comercial","Construtora De Infraestruturas",
  "Hangar","Mineradora","Plataforma De Petróleo","Centro De Coleta De Biomassa",
  "Criação De Ovinos","Prédio De Alto Padrão","Armazém","Aeroporto","Porto","Estaleiro",
  "Fábrica De Aeronaves","Fábrica De Foguetes",
]

// =============================================
// CONFIGURAÇÃO DE RARIDADE
// =============================================
const RARIDADE_CORES = {
  comum: { cor: '#9CA3AF', bg: '#1A1A2A', border: '#9CA3AF44' },
  incomum: { cor: '#34D399', bg: '#0F2A22', border: '#34D39944' },
  raro: { cor: '#60A5FA', bg: '#1A2A4A', border: '#60A5FA44' },
  epico: { cor: '#C084FC', bg: '#2D1A4A', border: '#C084FC44' },
  lendario: { cor: '#F27405', bg: '#4A2400', border: '#F2740544' },
}

// =============================================
// COMPONENTE: MINI CARD DE EDIFÍCIO
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
          border: `1px solid ${config.border}`,
        }}
      >
        <img
          src={getImageUrl(nome)}
          alt={nome}
          loading="lazy"
          className="w-[70%] h-[70%] object-contain"
          style={{ filter: `drop-shadow(0 0 8px ${config.cor}66)` }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
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
// COMPONENTE PRINCIPAL
// =============================================
export default function CityConquers({ atividades = [], dadosCidade, onSelecionarAtividade }) {
  // ─────────────────────────────────────────────
  //  MOCK: cartas do inventário
  // ─────────────────────────────────────────────
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

  // 🔥 Ajuste pra testar (1, 5, 10, 16, 24, 32, 40, 48, 56, 65)
  const cartasUnicas = 12
  const [isFullscreen, setIsFullscreen] = useState(false)

  // ─────────────────────────────────────────────
  //  NÍVEL / PORTE / RAIO
  // ─────────────────────────────────────────────
  const nivelAtual = useMemo(
    () => calcularNivelPatrimonio(cartasUnicas),
    [cartasUnicas]
  )
  const proximo = useMemo(
    () => proximoNivelPatrimonio(cartasUnicas),
    [cartasUnicas]
  )
  const porte = nivelAtual.porte
  const raioMapa = nivelAtual.raio
  const ultimoNivel = !proximo

  // ─────────────────────────────────────────────
  //  EDIFÍCIOS ATIVOS (mock: pega as N primeiras cartas)
  // ─────────────────────────────────────────────
  const edificiosAtivos = useMemo(() => {
    const qtd = Math.max(1, Math.min(cartasUnicas || 1, CARTAS_FITCITY_UNICAS.length))
    const cartasDisponiveis = CARTAS_FITCITY_UNICAS.slice(0, qtd)

    return cartasDisponiveis.map((nome, index) => {
      const setor = getSetor(nome)
      return {
        id: `edificio-${index}`,
        nome: nome,
        setor: setor || 'outros',
        quantidade: 1,
        ehCluster: edificioEhCluster(nome),
        ehComposto: edificioEhComposto(nome),
      }
    })
  }, [cartasUnicas])

  // ─────────────────────────────────────────────
  //  HEX GRID (raio dinâmico)
  // ─────────────────────────────────────────────
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
    edificiosAtivos.forEach(e => map.set(e.id, e))
    return map
  }, [edificiosAtivos])

  // ─────────────────────────────────────────────
  //  POSICIONAMENTO AUTOMÁTICO
  // ─────────────────────────────────────────────
  const [posicoes, setPosicoes] = useState({})

  useEffect(() => {
    const gridKeys = new Set(hexGrid.map(h => `${h.q},${h.r}`))

    const posOcupadas = new Set(['0,0'])
    const novasPosicoes = {}

    const idsAtivos = new Set(edificiosAtivos.map(e => e.id))
    Object.entries(posicoes).forEach(([key, id]) => {
      if (key === '0,0') return

      if (idsAtivos.has(id)) {
        novasPosicoes[key] = id
        posOcupadas.add(key)
        const ed = edificioPorId.get(id)
        if (ed?.ehCluster) {
          const [q, r] = key.split(',').map(Number)
          vizinhosDeHex(q, r).forEach(vk => {
            if (vk !== '0,0') posOcupadas.add(vk)
          })
        }
      }
    })

    const keys = hexGrid.map(h => `${h.q},${h.r}`)
      .sort((a, b) => {
        const [aq, ar] = a.split(',').map(Number)
        const [bq, br] = b.split(',').map(Number)
        return (aq*aq + ar*ar) - (bq*bq + br*br)
      })

    const proximoLivre = (predicado = null) => {
      for (const k of keys) {
        if (k === '0,0') continue
        if (posOcupadas.has(k)) continue
        if (predicado && !predicado(k)) continue
        return k
      }
      return null
    }

    const idsJaAlocados = new Set(Object.values(novasPosicoes))
    const clusters = edificiosAtivos.filter(ed => ed.ehCluster && !idsJaAlocados.has(ed.id))
    const simples = edificiosAtivos.filter(ed => !ed.ehCluster && !idsJaAlocados.has(ed.id))

    clusters.forEach(ed => {
      const central = proximoLivre(k => {
        const [cq, cr] = k.split(',').map(Number)
        return vizinhosDeHex(cq, cr).every(vk => {
          if (vk === '0,0') return false
          return !posOcupadas.has(vk) && gridKeys.has(vk)
        })
      })
      if (central) {
        const [cq, cr] = central.split(',').map(Number)
        novasPosicoes[central] = ed.id
        posOcupadas.add(central)
        vizinhosDeHex(cq, cr).forEach(vk => {
          if (vk !== '0,0') posOcupadas.add(vk)
        })
      }
    })

    simples.forEach(ed => {
      const pos = proximoLivre()
      if (pos) {
        novasPosicoes[pos] = ed.id
        posOcupadas.add(pos)
      }
    })

    setPosicoes(novasPosicoes)
  }, [edificiosAtivos, hexGrid, edificioPorId])

  // ─────────────────────────────────────────────
  //  SATÉLITES DOS CLUSTERS
  // ─────────────────────────────────────────────
  const satelites = useMemo(() => {
    const mapa = {}
    Object.entries(posicoes).forEach(([key, id]) => {
      const ed = edificioPorId.get(id)
      if (!ed?.ehCluster) return

      const corFall = '#888888'
      const modeloId = EDIFICIO_PARA_MODELO[ed.nome]
      const modeloDef = modeloId ? MODELOS[modeloId] : null
      const defSats = modeloDef?.satelites || []

      const [q, r] = key.split(',').map(Number)
      vizinhosDeHex(q, r).forEach((vk, i) => {
        if (vk === '0,0') return
        if (!posicoes[vk]) {
          mapa[vk] = {
            corTopo: undefined,
            corFallback: corFall,
            modeloId: defSats[i]?.modeloId ?? null,
          }
        }
      })
    })
    return mapa
  }, [posicoes, edificioPorId])

  // ─────────────────────────────────────────────
  //  TILES PARA RENDERIZAR
  // ─────────────────────────────────────────────
  const tilesToRender = useMemo(() => {
    return hexGrid
      .map(h => ({ hex: h, key: `${h.q},${h.r}` }))
      .filter(({ key }) => key !== '0,0' && !satelites[key])
  }, [hexGrid, satelites])

  // ─────────────────────────────────────────────
  //  SELEÇÃO / MOVIMENTO / HOVER
  // ─────────────────────────────────────────────
  const [selectedKey, setSelectedKey] = useState(null)
  const [moveMode, setMoveMode] = useState(false)
  const [hoveredKey, setHoveredKey] = useState(null)

  const destinoEhValido = useCallback((destKey) => {
    if (!selectedKey) return false
    if (destKey === '0,0') return false
    if (destKey === selectedKey) return false
    if (posicoes[destKey]) return false
    if (satelites[destKey]) return false

    const edSendo = edificioPorId.get(posicoes[selectedKey])
    if (!edSendo) return false

    if (edSendo.ehCluster) {
      const gridKeys = new Set(hexGrid.map(h => `${h.q},${h.r}`))
      const ocupadasSemEle = new Set(['0,0'])

      Object.entries(posicoes).forEach(([k, id]) => {
        if (k === selectedKey) return
        ocupadasSemEle.add(k)
        const ed = edificioPorId.get(id)
        if (ed?.ehCluster) {
          const [q, r] = k.split(',').map(Number)
          vizinhosDeHex(q, r).forEach(vk => ocupadasSemEle.add(vk))
        }
      })

      Object.keys(satelites).forEach(k => {
        if (k !== selectedKey) ocupadasSemEle.add(k)
      })

      const [dq, dr] = destKey.split(',').map(Number)
      return vizinhosDeHex(dq, dr).every(
        vk => !ocupadasSemEle.has(vk) && gridKeys.has(vk)
      )
    }

    return true
  }, [selectedKey, posicoes, satelites, edificioPorId, hexGrid])

  const moverEdificio = useCallback((destKey) => {
    if (!destinoEhValido(destKey)) return false

    setPosicoes(prev => {
      const copy = { ...prev }
      copy[destKey] = copy[selectedKey]
      delete copy[selectedKey]
      return copy
    })

    setSelectedKey(destKey)
    setMoveMode(false)
    setHoveredKey(null)
    return true
  }, [selectedKey, destinoEhValido])

  const handleHexClick = useCallback((hex) => {
    const key = `${hex.q},${hex.r}`

    if (moveMode) {
      moverEdificio(key)
      return
    }

    if (posicoes[key]) {
      setSelectedKey(prev => prev === key ? null : key)
    } else {
      setSelectedKey(null)
    }
  }, [moveMode, posicoes, moverEdificio])

  const handleHover = useCallback((key, isOver) => {
    setHoveredKey(isOver ? key : null)
  }, [])

  const ativarMoveMode = useCallback(() => {
    if (!isFullscreen) return
    if (!selectedKey) return
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

  // ─────────────────────────────────────────────
  //  FULLSCREEN + LOADING
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  //  DADOS DE ESTATÍSTICA (inventário mock)
  // ─────────────────────────────────────────────
  const topCartas = useMemo(() => {
    return [...cartasInventario].sort((a, b) => b.qtd - a.qtd).slice(0, 5)
  }, [cartasInventario])

  const totalCartas = useMemo(() => {
    return cartasInventario.reduce((acc, c) => acc + c.qtd, 0)
  }, [cartasInventario])

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
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
        {/* 🔥 Mapa como componente PURO de renderização */}
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
        />

        {/* Loading overlay */}
        <MapLoadingOverlay visible={!mapReady} />

        <button
          onClick={toggleFullscreen}
          className="absolute left-3 top-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2.5 shadow-lg z-10"
        >
          {isFullscreen ? <Minimize size={16} className="text-white" /> : <Maximize size={16} className="text-white" />}
        </button>
      </div>

      {/* ═══════════════ ESTATÍSTICAS ═══════════════ */}
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

        {/* Total de cartas */}
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

      {/* ═══════════════ ESTATÍSTICAS GERAIS ═══════════════ */}
      <div className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
        <p className="text-xs font-semibold mb-3">Estatísticas gerais</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Flame size={18} className="text-fitcity-energy" />
            </div>
            <p className="text-lg font-bold text-fitcity-energy">{dadosCidade.kcalTotais.toLocaleString()}</p>
            <p className="text-[8px] text-white/40 uppercase">kcal totais</p>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Clock size={18} className="text-fitcity-energy" />
            </div>
            <p className="text-lg font-bold text-fitcity-energy">{dadosCidade.tempoAtivo}</p>
            <p className="text-[8px] text-white/40 uppercase">tempo ativo</p>
          </div>

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