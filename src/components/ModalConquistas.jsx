// src/components/ModalConquistas.jsx
import { useMemo } from 'react'
import {
  X,
  Trophy,
  Flame,
  MapPin,
  Calendar,
  Clock,
  Coins,
  Layers,
  Star,
  Target,
  Zap,
  Award,
  Lock,
  Check,
} from 'lucide-react'
import { useFitCityStore } from '../store/fitCityStore'

// ============================================================
// CATEGORIAS E CONQUISTAS
// ============================================================
const CATEGORIAS = [
  { id: 'distancia', label: 'Distância', Icon: MapPin },
  { id: 'tempo',     label: 'Tempo',     Icon: Clock },
  { id: 'consistencia', label: 'Consistência', Icon: Calendar },
  { id: 'calorias',  label: 'Calorias',  Icon: Flame },
  { id: 'colecao',   label: 'Coleção',   Icon: Layers },
  { id: 'economia',  label: 'Economia',  Icon: Coins },
  { id: 'especial',  label: 'Especial',  Icon: Award },
]

// ============================================================
// CATÁLOGO DE CONQUISTAS
// Cada conquista tem um `verificar(ctx)` que retorna true/false
// ============================================================
const CONQUISTAS = [
  // ── Distância ──
  {
    id: 'dist_5km',
    categoria: 'distancia',
    titulo: 'Primeiros 5km',
    descricao: 'Corra 5 km no total',
    icone: MapPin,
    verificar: (ctx) => ctx.totalDistancia >= 5,
    progresso: (ctx) => ({ atual: Math.min(ctx.totalDistancia, 5), alvo: 5, unidade: 'km' }),
  },
  {
    id: 'dist_10km',
    categoria: 'distancia',
    titulo: '10km corridos',
    descricao: 'Corra 10 km no total',
    icone: MapPin,
    verificar: (ctx) => ctx.totalDistancia >= 10,
    progresso: (ctx) => ({ atual: Math.min(ctx.totalDistancia, 10), alvo: 10, unidade: 'km' }),
  },
  {
    id: 'dist_50km',
    categoria: 'distancia',
    titulo: 'Meio Centenário',
    descricao: 'Corra 50 km no total',
    icone: MapPin,
    verificar: (ctx) => ctx.totalDistancia >= 50,
    progresso: (ctx) => ({ atual: Math.min(ctx.totalDistancia, 50), alvo: 50, unidade: 'km' }),
  },
  {
    id: 'dist_100km',
    categoria: 'distancia',
    titulo: 'Centenário',
    descricao: 'Corra 100 km no total',
    icone: MapPin,
    verificar: (ctx) => ctx.totalDistancia >= 100,
    progresso: (ctx) => ({ atual: Math.min(ctx.totalDistancia, 100), alvo: 100, unidade: 'km' }),
  },
  {
    id: 'maratona',
    categoria: 'distancia',
    titulo: 'Maratona',
    descricao: 'Corra 42,195 km no total',
    icone: Trophy,
    verificar: (ctx) => ctx.totalDistancia >= 42.195,
    progresso: (ctx) => ({ atual: Math.min(ctx.totalDistancia, 42.195), alvo: 42.195, unidade: 'km' }),
    especial: true,
  },

  // ── Tempo ──
  {
    id: 'tempo_1h',
    categoria: 'tempo',
    titulo: '1 Hora Ativa',
    descricao: 'Some 1 hora de atividade',
    icone: Clock,
    verificar: (ctx) => ctx.totalDuracao >= 60,
    progresso: (ctx) => ({ atual: Math.min(ctx.totalDuracao, 60), alvo: 60, unidade: 'min' }),
  },
  {
    id: 'tempo_5h',
    categoria: 'tempo',
    titulo: '5 Horas Ativas',
    descricao: 'Some 5 horas de atividade',
    icone: Clock,
    verificar: (ctx) => ctx.totalDuracao >= 300,
    progresso: (ctx) => ({ atual: Math.min(ctx.totalDuracao, 300), alvo: 300, unidade: 'min' }),
  },
  {
    id: 'tempo_24h',
    categoria: 'tempo',
    titulo: 'Um Dia Inteiro',
    descricao: 'Some 24 horas de atividade',
    icone: Clock,
    verificar: (ctx) => ctx.totalDuracao >= 1440,
    progresso: (ctx) => ({ atual: Math.min(ctx.totalDuracao, 1440), alvo: 1440, unidade: 'min' }),
    especial: true,
  },

  // ── Consistência ──
  {
    id: 'dias_3',
    categoria: 'consistencia',
    titulo: 'Aquecendo',
    descricao: 'Treine 3 dias seguidos',
    icone: Calendar,
    verificar: (ctx) => ctx.sequenciaDias >= 3 || ctx.diasAtivos >= 3,
    progresso: (ctx) => ({ atual: Math.min(ctx.diasAtivos, 3), alvo: 3, unidade: 'dias' }),
  },
  {
    id: 'dias_7',
    categoria: 'consistencia',
    titulo: 'Uma Semana',
    descricao: 'Treine 7 dias seguidos',
    icone: Calendar,
    verificar: (ctx) => ctx.sequenciaDias >= 7,
    progresso: (ctx) => ({ atual: Math.min(ctx.sequenciaDias, 7), alvo: 7, unidade: 'dias' }),
  },
  {
    id: 'dias_30',
    categoria: 'consistencia',
    titulo: 'Um Mês',
    descricao: 'Treine 30 dias seguidos',
    icone: Calendar,
    verificar: (ctx) => ctx.sequenciaDias >= 30,
    progresso: (ctx) => ({ atual: Math.min(ctx.sequenciaDias, 30), alvo: 30, unidade: 'dias' }),
  },
  {
    id: 'dias_100',
    categoria: 'consistencia',
    titulo: '100 Dias',
    descricao: 'Treine 100 dias no total',
    icone: Calendar,
    verificar: (ctx) => ctx.diasAtivos >= 100,
    progresso: (ctx) => ({ atual: Math.min(ctx.diasAtivos, 100), alvo: 100, unidade: 'dias' }),
    especial: true,
  },

  // ── Calorias ──
  {
    id: 'kcal_1k',
    categoria: 'calorias',
    titulo: '1.000 kcal',
    descricao: 'Queime 1.000 kcal no total',
    icone: Flame,
    verificar: (ctx) => ctx.totalKcal >= 1000,
    progresso: (ctx) => ({ atual: Math.min(ctx.totalKcal, 1000), alvo: 1000, unidade: 'kcal' }),
  },
  {
    id: 'kcal_5k',
    categoria: 'calorias',
    titulo: '5.000 kcal',
    descricao: 'Queime 5.000 kcal no total',
    icone: Flame,
    verificar: (ctx) => ctx.totalKcal >= 5000,
    progresso: (ctx) => ({ atual: Math.min(ctx.totalKcal, 5000), alvo: 5000, unidade: 'kcal' }),
  },
  {
    id: 'kcal_10k',
    categoria: 'calorias',
    titulo: '10.000 kcal',
    descricao: 'Queime 10.000 kcal no total',
    icone: Flame,
    verificar: (ctx) => ctx.totalKcal >= 10000,
    progresso: (ctx) => ({ atual: Math.min(ctx.totalKcal, 10000), alvo: 10000, unidade: 'kcal' }),
    especial: true,
  },

  // ── Coleção ──
  {
    id: 'cartas_10',
    categoria: 'colecao',
    titulo: 'Iniciante',
    descricao: 'Desbloqueie 10 cartas',
    icone: Layers,
    verificar: (ctx) => ctx.descobertas >= 10,
    progresso: (ctx) => ({ atual: Math.min(ctx.descobertas, 10), alvo: 10, unidade: 'cartas' }),
  },
  {
    id: 'cartas_50',
    categoria: 'colecao',
    titulo: 'Colecionador',
    descricao: 'Desbloqueie 50 cartas',
    icone: Layers,
    verificar: (ctx) => ctx.descobertas >= 50,
    progresso: (ctx) => ({ atual: Math.min(ctx.descobertas, 50), alvo: 50, unidade: 'cartas' }),
  },
  {
    id: 'cartas_100',
    categoria: 'colecao',
    titulo: 'Mestre Colecionador',
    descricao: 'Desbloqueie 100 cartas',
    icone: Layers,
    verificar: (ctx) => ctx.descobertas >= 100,
    progresso: (ctx) => ({ atual: Math.min(ctx.descobertas, 100), alvo: 100, unidade: 'cartas' }),
    especial: true,
  },
  {
    id: 'cartas_lendario',
    categoria: 'colecao',
    titulo: 'Achado Lendário',
    descricao: 'Obtenha uma carta lendária',
    icone: Star,
    verificar: (ctx) => ctx.maiorRaridade === 'lendario',
    progresso: () => null,
  },

  // ── Economia ──
  {
    id: 'moedas_100',
    categoria: 'economia',
    titulo: 'Cofrinho',
    descricao: 'Alcance 100 moedas',
    icone: Coins,
    verificar: (ctx) => ctx.saldo >= 100,
    progresso: (ctx) => ({ atual: Math.min(ctx.saldo, 100), alvo: 100, unidade: 'moedas' }),
  },
  {
    id: 'moedas_1k',
    categoria: 'economia',
    titulo: '1.000 Moedas',
    descricao: 'Alcance 1.000 moedas',
    icone: Coins,
    verificar: (ctx) => ctx.saldo >= 1000,
    progresso: (ctx) => ({ atual: Math.min(ctx.saldo, 1000), alvo: 1000, unidade: 'moedas' }),
  },
  {
    id: 'moedas_10k',
    categoria: 'economia',
    titulo: 'Magnata',
    descricao: 'Alcance 10.000 moedas',
    icone: Coins,
    verificar: (ctx) => ctx.saldo >= 10000,
    progresso: (ctx) => ({ atual: Math.min(ctx.saldo, 10000), alvo: 10000, unidade: 'moedas' }),
    especial: true,
  },

  // ── Especial ──
  {
    id: 'primeira_atividade',
    categoria: 'especial',
    titulo: 'O Começo',
    descricao: 'Registre sua primeira atividade',
    icone: Zap,
    verificar: (ctx) => ctx.totalAtividades >= 1,
    progresso: () => null,
    especial: true,
  },
  {
    id: 'cidade_nv5',
    categoria: 'especial',
    titulo: 'Cidade em Expansão',
    descricao: 'Alcance o nível 5 na cidade',
    icone: Trophy,
    verificar: (ctx) => ctx.nivelCidade >= 5,
    progresso: (ctx) => ({ atual: Math.min(ctx.nivelCidade, 5), alvo: 5, unidade: 'níveis' }),
  },
  {
    id: 'cidade_nv10',
    categoria: 'especial',
    titulo: 'Metrópole',
    descricao: 'Alcance o nível 10 na cidade',
    icone: Trophy,
    verificar: (ctx) => ctx.nivelCidade >= 10,
    progresso: (ctx) => ({ atual: Math.min(ctx.nivelCidade, 10), alvo: 10, unidade: 'níveis' }),
    especial: true,
  },
]

// ============================================================
// COMPONENTE
// ============================================================
export default function ModalConquistas({ onClose }) {
  const atividades = useFitCityStore((s) => s.atividades)
  const progressao = useFitCityStore((s) => s.progressao)
  const economia = useFitCityStore((s) => s.economia)
  const cidade = useFitCityStore((s) => s.cidade)
  const inventario = useFitCityStore((s) => s.inventario)
  const catalogo = useFitCityStore((s) => s.catalogo)

  // ─── Contexto para verificar conquistas ───
  const ctx = useMemo(() => {
    const totalDistancia = atividades.reduce((acc, a) => acc + (a.distancia || 0), 0)
    const totalDuracao = atividades.reduce((acc, a) => acc + (a.duracao || 0), 0)
    const totalKcal = atividades.reduce((acc, a) => acc + (a.calorias || 0), 0)

    const diasSet = new Set()
    atividades.forEach((a) => {
      if (a.data) diasSet.add(a.data.split('T')[0])
    })
    const diasAtivos = diasSet.size

    const cartasInventario = inventario?.cartas || {}
    const cartasCatalogo = catalogo?.cartas || {}

    const descobertas = Object.entries(cartasInventario)
      .filter(([, item]) => item && item.quantidade > 0).length

    // Maior raridade
    const ORDEM = { comum: 1, incomum: 2, raro: 3, epico: 4, lendario: 5 }
    let maiorRaridade = null
    let maiorOrdem = 0
    Object.values(cartasInventario).forEach((item) => {
      if (!item || item.quantidade <= 0) return
      const ordem = ORDEM[item.raridade] || 0
      if (ordem > maiorOrdem) {
        maiorOrdem = ordem
        maiorRaridade = item.raridade
      }
    })

    return {
      totalDistancia,
      totalDuracao,
      totalKcal,
      diasAtivos,
      sequenciaDias: progressao?.sequenciaDias || 0,
      saldo: economia?.saldo || 0,
      descobertas,
      maiorRaridade,
      totalAtividades: atividades.length,
      nivelCidade: cidade?.nivel || 1,
    }
  }, [atividades, progressao, economia, cidade, inventario, catalogo])

  // ─── Aplica verificadores ───
  const conquistasComEstado = useMemo(() => {
    return CONQUISTAS.map((c) => ({
      ...c,
      desbloqueada: c.verificar(ctx),
      info: c.progresso(ctx),
    }))
  }, [ctx])

  const totalDesbloqueadas = conquistasComEstado.filter((c) => c.desbloqueada).length
  const total = conquistasComEstado.length
  const pct = total > 0 ? (totalDesbloqueadas / total) * 100 : 0

  // ─── Agrupar por categoria ───
  const conquistasPorCategoria = useMemo(() => {
    const grupos = {}
    CATEGORIAS.forEach((cat) => {
      grupos[cat.id] = conquistasComEstado.filter((c) => c.categoria === cat.id)
    })
    return grupos
  }, [conquistasComEstado])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-fitcity-bg border-t border-white/10 rounded-t-3xl p-5 pb-3 flex flex-col gap-4 shadow-[0_-15px_50px_rgba(0,0,0,0.5)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-fitcity-energy/15 rounded-lg p-2">
              <Trophy size={18} className="text-fitcity-energy" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Conquistas</h2>
              <p className="text-[10px] text-white/50">
                {totalDesbloqueadas} de {total} desbloqueadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* BARRA GERAL */}
        <div>
          <div className="h-2 rounded-full bg-black/40 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fitcity-energy to-orange-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-white/50 mt-1.5 text-right font-bold">
            {pct.toFixed(0)}% completo
          </p>
        </div>

        {/* LISTA POR CATEGORIA */}
        <div className="flex flex-col gap-5">
          {CATEGORIAS.map((cat) => {
            const lista = conquistasPorCategoria[cat.id] || []
            if (lista.length === 0) return null

            const desbloqueadasCat = lista.filter((c) => c.desbloqueada).length

            return (
              <div key={cat.id}>
                {/* Header da categoria */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="bg-white/5 rounded-lg p-1.5">
                    <cat.Icon size={12} className="text-fitcity-energy" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                    {cat.label}
                  </p>
                  <span className="text-[10px] text-white/40 ml-auto">
                    {desbloqueadasCat}/{lista.length}
                  </span>
                </div>

                {/* Conquistas */}
                <div className="flex flex-col gap-2">
                  {lista.map((c) => {
                    const Icone = c.icone
                    const info = c.info

                    return (
                      <div
                        key={c.id}
                        className={`rounded-xl border p-3 flex items-center gap-3 transition-all ${
                          c.desbloqueada
                            ? c.especial
                              ? 'bg-gradient-to-r from-fitcity-energy/20 to-orange-600/10 border-fitcity-energy/40 shadow-[0_4px_16px_rgba(242,116,5,0.2)]'
                              : 'bg-white/[0.04] border-white/10'
                            : 'bg-white/[0.02] border-white/5'
                        }`}
                      >
                        {/* Círculo do ícone */}
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                            c.desbloqueada
                              ? 'bg-gradient-to-br from-fitcity-energy to-orange-600 shadow-[0_4px_14px_rgba(242,116,5,0.4)]'
                              : 'bg-white/5 border border-white/10'
                          }`}
                        >
                          {c.desbloqueada ? (
                            <Icone size={20} className="text-white" strokeWidth={2.2} />
                          ) : (
                            <Lock size={16} className="text-white/25" />
                          )}
                        </div>

                        {/* Texto + progresso */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-sm font-bold truncate ${
                              c.desbloqueada ? 'text-white' : 'text-white/50'
                            }`}>
                              {c.titulo}
                            </p>
                            {c.especial && c.desbloqueada && (
                              <Star size={11} className="text-orange-400 shrink-0" fill="currentColor" />
                            )}
                          </div>
                          <p className={`text-[10px] truncate ${
                            c.desbloqueada ? 'text-white/50' : 'text-white/30'
                          }`}>
                            {c.descricao}
                          </p>

                          {/* Barra de progresso (só se bloqueada e tiver info) */}
                          {!c.desbloqueada && info && (
                            <div className="mt-1.5">
                              <div className="h-1 rounded-full bg-black/40 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-fitcity-energy/60"
                                  style={{
                                    width: `${Math.min(100, (info.atual / info.alvo) * 100)}%`,
                                  }}
                                />
                              </div>
                              <p className="text-[9px] text-white/40 mt-1">
                                {info.atual.toFixed(info.unidade === 'km' ? 1 : 0)} / {info.alvo} {info.unidade}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Badge de status */}
                        {c.desbloqueada && (
                          <div className="shrink-0">
                            <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-full p-1.5">
                              <Check size={12} className="text-emerald-400" strokeWidth={3} />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* FOOTER */}
        <button
          onClick={onClose}
          className="mt-1 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-3.5 font-black text-white text-sm tracking-wider uppercase shadow-[0_10px_25px_rgba(242,116,5,0.45)] transition-all active:scale-[0.98]"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}