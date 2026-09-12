// src/components/cidades/CidadeProgresso.jsx
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Building2, Maximize, Minimize, ChevronRight, TrendingUp, Flame, Target, Award } from 'lucide-react'
import MapWorldActivities from '../MapWorldActivities'
import { TIPOS_ATIVIDADE } from '../../data/tiposAtividade'

// =============================================
// UTILITÁRIO PARA IMAGENS
// =============================================
const getImageUrl = (nome) => `/imagens/${nome}.png`

// =============================================
// CONFIGURAÇÃO DE RARIDADE
// =============================================
const RARIDADE_CORES = {
  comum:    { cor: '#9CA3AF', bg: '#1A1A2A', border: '#9CA3AF44' },
  incomum:  { cor: '#34D399', bg: '#0F2A22', border: '#34D39944' },
  raro:     { cor: '#60A5FA', bg: '#1A2A4A', border: '#60A5FA44' },
  epico:    { cor: '#C084FC', bg: '#2D1A4A', border: '#C084FC44' },
  lendario: { cor: '#F27405', bg: '#4A2400', border: '#F2740544' },
}

// =============================================
// HELPERS
// =============================================
const getNivelPorMoedas = (moedas) => {
  if (moedas <= 5) return 1
  if (moedas <= 10) return 2
  if (moedas <= 20) return 3
  if (moedas <= 30) return 4
  if (moedas <= 50) return 5
  return 6
}

// Faixas de atividades por nível (mesma TABELA do MapWorldActivities)
const TABELA_NIVEIS = [
  { nivel: 1,  atvMin: 1  },
  { nivel: 2,  atvMin: 3  },
  { nivel: 3,  atvMin: 7  },
  { nivel: 4,  atvMin: 12 },
  { nivel: 5,  atvMin: 16 },
  { nivel: 6,  atvMin: 21 },
  { nivel: 7,  atvMin: 27 },
  { nivel: 8,  atvMin: 34 },
  { nivel: 9,  atvMin: 42 },
  { nivel: 10, atvMin: 50 },
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

// =============================================
// COMPONENTE: MINI CARD DE CARTA
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
export default function CityProgress({ atividades = [], dadosCidade, onSelecionarAtividade }) {
  // ── Processa atividades em cartas ──
  const cartasDasAtividades = useMemo(() => {
    const tiposPermitidos = ['corrida', 'musculacao', 'caminhada']
    const atividadesFiltradas = atividades.filter(a => tiposPermitidos.includes(a.tipo))

    const cartasMap = new Map()

    atividadesFiltradas.forEach(atividade => {
      const moedas = atividade.moedas || (
        atividade.tipo === 'corrida' ? 10 + Math.floor((atividade.distancia || 0) / 2) * 3 :
        atividade.tipo === 'musculacao' ? 8 + Math.floor((atividade.tempo || 0) / 10) * 2 :
        5
      )
      const nivel = getNivelPorMoedas(moedas)

      const edificiosPorNivel = {
        1: { nome: 'Plantação De Vegetais', raridade: 'comum' },
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
      } else {
        cartasMap.set(chave, {
          nome: edificio.nome,
          raridade: edificio.raridade,
          quantidade: 1,
        })
      }
    })

    return Array.from(cartasMap.values()).sort((a, b) => b.quantidade - a.quantidade)
  }, [atividades])

  // ── Total de edifícios ──
  const totalEdificios = useMemo(() => {
    return cartasDasAtividades.reduce((acc, c) => acc + c.quantidade, 0)
  }, [cartasDasAtividades])

  // ── Contagem por raridade ──
  const porRaridade = useMemo(() => {
    const result = { comum: 0, incomum: 0, raro: 0, epico: 0, lendario: 0 }
    cartasDasAtividades.forEach(c => {
      result[c.raridade] = (result[c.raridade] || 0) + c.quantidade
    })
    return result
  }, [cartasDasAtividades])

  // 🔥 Progresso de nível (dados do MapWorldActivities)
  const atividadesMes = useMemo(() => {
    const tiposPermitidos = ['corrida', 'musculacao', 'caminhada']
    return atividades.filter(a => tiposPermitidos.includes(a.tipo)).length
  }, [atividades])

  const nivelAtual = useMemo(() => calcularNivel(atividadesMes), [atividadesMes])
  const proximo = useMemo(() => proximoNivel(atividadesMes), [atividadesMes])

  const faltamAtividades = proximo ? Math.max(0, proximo.atvMin - atividadesMes) : 0
  const progressoNivel = proximo
    ? Math.min(100, (atividadesMes / proximo.atvMin) * 100)
    : 100

  // ── Meta do mês ──
  const metaMensal = 16 // pode vir de props se quiser
  const metaPercentual = Math.min(100, (atividadesMes / metaMensal) * 100)

  // ── Total kcal ──
  const kcalTotais = useMemo(() => {
    return atividades.reduce((acc, a) => acc + (a.calorias || 0), 0)
  }, [atividades])

  // ── Fullscreen ──
  const mapWrapperRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true
  )

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const handleOrientation = (e) => setIsPortrait(e.matches)
    mq.addEventListener('change', handleOrientation)
    return () => mq.removeEventListener('change', handleOrientation)
  }, [])

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
        <MapWorldActivities atividades={atividades} onSelecionarAtividade={onSelecionarAtividade} />

        <button
          onClick={toggleFullscreen}
          className="absolute left-3 top-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2.5 shadow-lg z-10"
        >
          {isFullscreen ? <Minimize size={16} className="text-white" /> : <Maximize size={16} className="text-white" />}
        </button>
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
          {/* Meta */}
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

          {/* Edifícios */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-fitcity-energy/15 border border-fitcity-energy/30 flex items-center justify-center mb-1">
              <Building2 size={22} className="text-fitcity-energy" />
            </div>
            <span className="text-[9px] text-white/50 uppercase tracking-wider">Edifícios</span>
            <span className="text-[10px] font-bold text-white mt-0.5">
              {totalEdificios} no mês
            </span>
          </div>

          {/* Kcal */}
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
          {/* Linha decorativa lateral */}
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

            {/* Falta X atividades */}
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-lg font-black text-white">
                Faltam {faltamAtividades}
              </span>
              <span className="text-xs text-white/60">
                atividade{faltamAtividades !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Barra de progresso */}
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

            {/* Ganhos do próximo nível */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <p className="text-[9px] text-white/50 uppercase tracking-wider">Terrenos</p>
                <p className="text-sm font-black text-emerald-400">+{hexCountPorRaio(TABELA_NIVEIS[proximo.nivel-1]?.raio || 3) - hexCountPorRaio(TABELA_NIVEIS[nivelAtual.nivel-1]?.raio || 3)}</p>
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

        {dadosCidade?.ultimasAtividades?.length > 0 ? (
          <div className="space-y-2">
            {dadosCidade.ultimasAtividades.slice(0, 5).map((atividade, index) => {
              const Icon = TIPOS_ATIVIDADE[atividade.tipo]?.Icon
              const cor = TIPOS_ATIVIDADE[atividade.tipo]?.cor || '#F27405'

              return (
                <button
                  key={index}
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
                        {atividade.distancia ? `${atividade.distancia}  · ` : ''}
                        {atividade.tempo ? `${atividade.tempo} · ` : ''}
                        {atividade.calorias || atividade.kcal} kcal
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className="text-xs font-black text-fitcity-energy">
                      +{atividade.pontos || atividade.moedas || 0}
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

        {/* Grid de cartas */}
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

            {/* Distribuição por raridade */}
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