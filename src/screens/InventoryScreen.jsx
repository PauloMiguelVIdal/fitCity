// src/screens/InventoryScreen.jsx
import { useState, useMemo, useCallback } from 'react'
import {
  Sprout, Cpu, Factory, Store, Building2, Zap, Package,
  LayoutGrid, Gem, ArrowDownWideNarrow, Lock, Unlock,
} from 'lucide-react'
import CardMinimal from '../components/CardMinimal'
import CardColection from '../components/CardColection'
import { useFitCityStore } from '../store/fitCityStore'

// =============================================
// CONFIGURAÇÃO DOS SETORES (visual)
// =============================================
const SETORES_CONFIG = {
  agricultura: { id: 'agricultura', label: 'Agricultura', icon: Sprout,    cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
  tecnologia:  { id: 'tecnologia',  label: 'Tecnologia',  icon: Cpu,       cor1: '#A64B00', cor2: '#D45A00', cor3: '#FF6F00', cor4: '#FF8C42' },
  industria:   { id: 'industria',   label: 'Indústria',   icon: Factory,   cor1: '#1A1A1A', cor2: '#4D4D4D', cor3: '#808080', cor4: '#B3B3B3' },
  comercio:    { id: 'comercio',    label: 'Comércio',    icon: Store,     cor1: '#660000', cor2: '#A31919', cor3: '#E60000', cor4: '#FF4D4D' },
  imobiliario: { id: 'imobiliario', label: 'Imobiliário', icon: Building2, cor1: '#000066', cor2: '#1A1A8C', cor3: '#3333CC', cor4: '#6666FF' },
  energia:     { id: 'energia',     label: 'Energia',     icon: Zap,       cor1: '#665200', cor2: '#A37F19', cor3: '#E6B800', cor4: '#FFD966' },
  outros:      { id: 'outros',      label: 'Outros',      icon: Package,   cor1: '#1A1A1A', cor2: '#4D4D4D', cor3: '#808080', cor4: '#B3B3B3' },
}

const RARIDADE_COR = {
  comum:    '#9CA3AF',
  incomum:  '#34D399',
  raro:     '#9944ff',
  epico:    '#ff9933',
  lendario: '#ffd700',
}

const FILTROS_SETOR = [
  { id: 'todos', label: 'Todos', icon: LayoutGrid },
  { id: 'agricultura', label: 'Agricultura', icon: Sprout },
  { id: 'industria', label: 'Indústria', icon: Factory },
  { id: 'tecnologia', label: 'Tecnologia', icon: Cpu },
  { id: 'comercio', label: 'Comércio', icon: Store },
  { id: 'imobiliario', label: 'Imobiliário', icon: Building2 },
  { id: 'energia', label: 'Energia', icon: Zap },
]

// =============================================
// LÓGICA DE NÍVEL / PROGRESSO DA CARTA
// =============================================
const calcularProgresso = (raridade, quantidade, raridadesConfig) => {
  const cfg = raridadesConfig[raridade] || raridadesConfig.comum
  if (!cfg) {
    return {
      nivel: 1,
      labelNivel: 'Nv 1',
      progressoAtual: 0,
      progressoMaximo: 1,
      textoProximoNivel: '',
    }
  }

  const { quantidadeMinimaNv2, quantidadeMinimaNv3, qtdMaxima } = cfg

  if (quantidade >= qtdMaxima) {
    return {
      nivel: 4,
      labelNivel: 'MAX',
      progressoAtual: qtdMaxima,
      progressoMaximo: qtdMaxima,
      textoProximoNivel: 'Nível máximo alcançado',
    }
  }
  if (quantidade >= quantidadeMinimaNv3) {
    const falta = qtdMaxima - quantidade
    return {
      nivel: 3,
      labelNivel: 'Nv 3',
      progressoAtual: quantidade - quantidadeMinimaNv3,
      progressoMaximo: qtdMaxima - quantidadeMinimaNv3,
      textoProximoNivel: `Faltam ${falta} para o máximo`,
    }
  }
  if (quantidade >= quantidadeMinimaNv2) {
    const falta = quantidadeMinimaNv3 - quantidade
    return {
      nivel: 2,
      labelNivel: 'Nv 2',
      progressoAtual: quantidade - quantidadeMinimaNv2,
      progressoMaximo: quantidadeMinimaNv3 - quantidadeMinimaNv2,
      textoProximoNivel: `Faltam ${falta} para o Nv 3`,
    }
  }
  const falta = quantidadeMinimaNv2 - quantidade
  return {
    nivel: 1,
    labelNivel: 'Nv 1',
    progressoAtual: quantidade,
    progressoMaximo: quantidadeMinimaNv2,
    textoProximoNivel: `Faltam ${falta} para o Nv 2`,
  }
}

// =============================================
// CÉLULA DA CARTA
// =============================================
const CartaCell = ({ carta, onExpand, raridadesConfig }) => {
  const config = SETORES_CONFIG[carta.setor] || SETORES_CONFIG.outros
  const raridade = carta.raridade
  const qtd = carta.quantidade || 0
  const bloqueada = qtd === 0

  const prog = calcularProgresso(raridade, qtd, raridadesConfig)
  const corRaridade = RARIDADE_COR[raridade] || RARIDADE_COR.comum
  const pct = Math.min(100, (prog.progressoAtual / prog.progressoMaximo) * 100)

  return (
    <div className="relative w-full">
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ background: config.cor2, opacity: 0.7, boxShadow: `0 4px 20px ${config.cor4}33` }}
      />

      <div className="relative w-full flex flex-col" style={{ padding: 5 }}>
        {/* ÁREA DA CARTA */}
        <div className="relative w-full" style={{ flexShrink: 0 }}>
          <CardMinimal
            nome={carta.nome}
            raridade={raridade}
            quantidade={qtd}
            setor={carta.setor}
            cor1={config.cor1}
            cor2={config.cor2}
            cor3={config.cor3}
            cor4={config.cor4}
            onExpand={() => onExpand(carta)}
          />

          {/* Dot de setor */}
          <div
            className="absolute rounded-full"
            style={{
              top: 6, right: 6, width: 10, height: 10,
              background: config.cor4,
              boxShadow: `0 0 6px ${config.cor4}aa`,
              zIndex: 40,
            }}
          />

          {/* Overlay de bloqueada */}
          {bloqueada && (
            <div
              className="absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none"
              style={{ background: 'rgba(0,0,0,0.8)', zIndex: 35 }}
            >
              <Lock size={26} color="rgba(255,255,255,0.35)" strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* PROGRESSO */}
        <div className="flex flex-col justify-center" style={{ marginTop: 4, gap: 2, minHeight: 10 }}>
          {!bloqueada ? (
            <div className="flex items-center gap-1.5">
              <div
                className="flex-1 relative overflow-hidden"
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: 'rgba(0,0,0,0.55)',
                  border: `1px solid ${corRaridade}55`,
                }}
              >
                <div
                  style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${corRaridade}, ${corRaridade}cc)`,
                    boxShadow: `0 0 6px ${corRaridade}aa`,
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              className="text-center"
              style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}
            >
              0 / {raridadesConfig[raridade]?.quantidadeMinimaNv2 ?? 20}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================
// SEGMENTED CONTROL DE ORDENAÇÃO
// =============================================
const SegmentedOrdenar = ({ ordenarPor, onChange }) => (
  <div
    className="relative flex items-center"
    style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 12,
      padding: 3,
      gap: 2,
    }}
  >
    {[
      { id: 'raridade', label: 'Raridade', icon: Gem },
      { id: 'quantidade', label: 'Quantidade', icon: ArrowDownWideNarrow },
    ].map(({ id, label, icon: Icon }) => {
      const ativo = ordenarPor === id
      return (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex items-center gap-1.5 transition"
          style={{
            padding: '6px 10px',
            borderRadius: 9,
            fontSize: 11,
            fontWeight: 700,
            color: ativo ? '#fff' : 'rgba(255,255,255,0.5)',
            background: ativo ? 'linear-gradient(90deg, #9333ea, #d946ef)' : 'transparent',
            boxShadow: ativo ? '0 2px 10px rgba(168,85,247,0.45)' : 'none',
          }}
        >
          <Icon size={13} />
          <span>{label}</span>
        </button>
      )
    })}
  </div>
)

// =============================================
// SWITCH — mostrar/ocultar bloqueadas
// =============================================
const SwitchBloqueadas = ({ ativo, onToggle }) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-1.5"
    style={{
      padding: '6px 10px',
      borderRadius: 12,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      fontSize: 11,
      fontWeight: 700,
      color: ativo ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
      flexShrink: 0,
    }}
    title={ativo ? 'Ocultar bloqueadas' : 'Mostrar bloqueadas'}
  >
    {ativo ? <Unlock size={13} /> : <Lock size={13} />}
    <span className="whitespace-nowrap">Bloqueadas</span>
  </button>
)

// =============================================
// TELA
// =============================================
export default function InventoryScreen() {
  const [filtroSetor, setFiltroSetor] = useState('todos')
  const [ordenarPor, setOrdenarPor] = useState('quantidade')
  const [mostrarBloqueadas, setMostrarBloqueadas] = useState(true)
  const [cartaExpandidaId, setCartaExpandidaId] = useState(null)

  // ─── Store ───
  const catalogo = useFitCityStore((s) => s.catalogo)
  const inventario = useFitCityStore((s) => s.inventario)

  const cartasCatalogo = catalogo?.cartas || {}
  const cartasInventario = inventario?.cartas || {}
  const raridadesConfig = catalogo?.raridades || {}

  // ─── Mescla catálogo + inventário numa única lista ───
  const cartasProcessadas = useMemo(() => {
    return Object.values(cartasCatalogo).map((carta) => {
      const itemInventario = cartasInventario[carta.id]
      const quantidade = itemInventario?.quantidade || 0
      return {
        id: carta.id,
        nome: carta.nome,
        raridade: carta.raridade,
        setor: carta.setor,
        rank: carta.rank,
        quantidade,
      }
    })
  }, [cartasCatalogo, cartasInventario])

  // ─── Contadores ───
  const totalDescobertas = useMemo(
    () => cartasProcessadas.filter((c) => c.quantidade > 0).length,
    [cartasProcessadas]
  )
  const totalCartas = cartasProcessadas.length

  // ─── Filtro + Ordenação ───
  const cartasFiltradas = useMemo(() => {
    let filtradas = cartasProcessadas

    if (filtroSetor !== 'todos') {
      filtradas = filtradas.filter((c) => c.setor === filtroSetor)
    }
    if (!mostrarBloqueadas) {
      filtradas = filtradas.filter((c) => c.quantidade > 0)
    }

    const ordemRaridade = { lendario: 0, epico: 1, raro: 2, comum: 3, incomum: 4 }
    filtradas = [...filtradas].sort((a, b) => {
      if (ordenarPor === 'quantidade') {
        if (b.quantidade !== a.quantidade) return b.quantidade - a.quantidade
        return (ordemRaridade[a.raridade] ?? 99) - (ordemRaridade[b.raridade] ?? 99)
      } else {
        const diffRaridade = (ordemRaridade[a.raridade] ?? 99) - (ordemRaridade[b.raridade] ?? 99)
        if (diffRaridade !== 0) return diffRaridade
        return b.quantidade - a.quantidade
      }
    })

    return filtradas
  }, [cartasProcessadas, filtroSetor, ordenarPor, mostrarBloqueadas])

  const handleSetorFilter = useCallback((s) => setFiltroSetor(s), [])

  // ─── Carta expandida ───
  const cartaExpandida = useMemo(() => {
    if (!cartaExpandidaId) return null
    return cartasProcessadas.find((c) => c.id === cartaExpandidaId) || null
  }, [cartaExpandidaId, cartasProcessadas])

  const configExpandida = cartaExpandida
    ? SETORES_CONFIG[cartaExpandida.setor] || SETORES_CONFIG.outros
    : null

  return (
    <div
      className="relative text-white flex flex-col"
      style={{ height: '100dvh', overflow: 'hidden', overscrollBehavior: 'none' }}
    >
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -top-10 left-0 w-64 h-64 rounded-full bg-fuchsia-500/20 blur-[80px]" />

      {/* HEADER */}
      <div className="relative flex items-center justify-between px-4 pt-5 pb-1.5" style={{ flexShrink: 0 }}>
        <h1 className="text-xl font-bold">Inventário</h1>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: 11,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <Gem size={12} color="#c4b5fd" />
          <span style={{ color: '#fff' }}>{totalDescobertas}</span>
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>/</span>
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>{totalCartas}</span>
        </div>
      </div>

      {/* CONTROLES */}
      <div className="relative flex items-center justify-between gap-2 px-4 pt-2" style={{ flexShrink: 0 }}>
        <SegmentedOrdenar ordenarPor={ordenarPor} onChange={setOrdenarPor} />
        <SwitchBloqueadas ativo={mostrarBloqueadas} onToggle={() => setMostrarBloqueadas((v) => !v)} />
      </div>

      {/* FILTRO DE SETOR */}
      <div
        className="relative flex gap-1.5 overflow-x-auto px-4 pt-2.5 pb-1 scrollbar-hide"
        style={{ flexShrink: 0 }}
      >
        {FILTROS_SETOR.map(({ id, label, icon: Icon }) => {
          const config = SETORES_CONFIG[id] || SETORES_CONFIG.outros
          const corAtiva = id === 'todos' ? '#F27405' : config.cor4
          const ativo = filtroSetor === id
          return (
            <button
              key={id}
              onClick={() => handleSetorFilter(id)}
              className="flex items-center gap-1.5 transition whitespace-nowrap"
              style={{
                padding: '7px 12px',
                borderRadius: 11,
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 700,
                color: ativo ? '#fff' : 'rgba(255,255,255,0.5)',
                background: ativo ? corAtiva : 'rgba(255,255,255,0.05)',
                border: ativo ? 'none' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: ativo ? `0 2px 10px ${corAtiva}66` : 'none',
              }}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      {/* GRID */}
      <div className="relative flex-1 w-full overflow-y-auto pb-[75px] pt-2" style={{ minHeight: 0 }}>
        <div className="grid gap-2.5 mx-auto px-4" style={{ maxWidth: 640 }}>
          <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>

          {cartasFiltradas.length === 0 ? (
            <div className="text-center py-12 col-span-full">
              <p className="text-sm text-white/40">Nenhuma carta para este filtro.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 col-span-full">
              {cartasFiltradas.map((carta) => (
                <CartaCell
                  key={carta.id}
                  carta={carta}
                  onExpand={(c) => setCartaExpandidaId(c.id)}
                  raridadesConfig={raridadesConfig}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CARTA EXPANDIDA */}
      {cartaExpandida && configExpandida && (
        <CardColection
          expandida
          nome={cartaExpandida.nome}
          raridade={cartaExpandida.raridade}
          quantidade={cartaExpandida.quantidade}
          setor={cartaExpandida.setor}
          cor1={configExpandida.cor1}
          cor2={configExpandida.cor2}
          cor3={configExpandida.cor3}
          cor4={configExpandida.cor4}
          setorLabel={configExpandida.label}
          onClose={() => setCartaExpandidaId(null)}
        />
      )}
    </div>
  )
}