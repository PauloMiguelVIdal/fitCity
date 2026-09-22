// src/components/MelhoresMetricas.jsx
import { useMemo } from 'react'
import {
  Trophy,
  Flame,
  MapPin,
  Clock,
  Zap,
  TrendingUp,
  ChevronRight,
  Gauge,
} from 'lucide-react'
import { useFitCityStore } from '../store/fitCityStore'

// ============================================================
// HELPERS
// ============================================================
function formatarTempo(minutos) {
  const m = Math.max(0, Math.round(minutos || 0))
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}min`
  return `${h}h ${min}min`
}

function formatarPace(distancia, duracao) {
  if (!distancia || !duracao) return '—'
  const pace = duracao / distancia
  const min = Math.floor(pace)
  const seg = Math.round((pace - min) * 60)
  return `${min}:${String(seg).padStart(2, '0')}/km`
}

// ============================================================
// COMPONENTE
// ============================================================
export default function MelhoresMetricas({ onClick }) {
  const atividades = useFitCityStore((s) => s.atividades)

  const metricas = useMemo(() => {
    if (atividades.length === 0) {
      return {
        maiorDistancia: null,
        maiorDuracao: null,
        maiorKcal: null,
        melhorPace: null,
        totalAtividades: 0,
      }
    }

    let maiorDistancia = atividades[0]
    let maiorDuracao = atividades[0]
    let maiorKcal = atividades[0]
    let melhorPace = null
    let melhorPaceValor = Infinity

    atividades.forEach((a) => {
      if ((a.distancia || 0) > (maiorDistancia?.distancia || 0)) maiorDistancia = a
      if ((a.duracao || 0) > (maiorDuracao?.duracao || 0)) maiorDuracao = a
      if ((a.calorias || 0) > (maiorKcal?.calorias || 0)) maiorKcal = a

      // Melhor pace (só corrida/caminhada com distância > 0)
      if (a.distancia > 0 && a.duracao > 0 && (a.tipo === 'corrida' || a.tipo === 'caminhada')) {
        const pace = a.duracao / a.distancia
        if (pace < melhorPaceValor) {
          melhorPaceValor = pace
          melhorPace = a
        }
      }
    })

    return {
      maiorDistancia,
      maiorDuracao,
      maiorKcal,
      melhorPace,
      totalAtividades: atividades.length,
    }
  }, [atividades])

  // ─── Layout vazio ───
  if (atividades.length === 0) {
    return (
      <div className="relative w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
        <Gauge size={28} className="text-white/20 mx-auto mb-2" />
        <p className="text-sm text-white/50">Melhores métricas</p>
        <p className="text-[10px] text-white/30 mt-1">
          Registre atividades pra ver seus recordes aqui.
        </p>
      </div>
    )
  }

  // ─── Cards de métrica ───
  const cards = [
    metricas.maiorDistancia && {
      label: 'Maior distância',
      valor: `${Number(metricas.maiorDistancia.distancia).toFixed(1)} km`,
      Icon: MapPin,
      cor: '#60A5FA',
      data: metricas.maiorDistancia.data,
    },
    metricas.maiorDuracao && {
      label: 'Maior duração',
      valor: formatarTempo(metricas.maiorDuracao.duracao),
      Icon: Clock,
      cor: '#34D399',
      data: metricas.maiorDuracao.data,
    },
    metricas.maiorKcal && {
      label: 'Mais calorias',
      valor: `${Math.round(metricas.maiorKcal.calorias)} kcal`,
      Icon: Flame,
      cor: '#F27405',
      data: metricas.maiorKcal.data,
    },
    metricas.melhorPace && {
      label: 'Melhor pace',
      valor: formatarPace(metricas.melhorPace.distancia, metricas.melhorPace.duracao),
      Icon: Zap,
      cor: '#C084FC',
      data: metricas.melhorPace.data,
    },
  ].filter(Boolean)

  return (
    <button
      onClick={onClick}
      className="relative w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-left shadow-[0_10px_30px_rgba(100,17,217,0.2)] overflow-hidden transition-all hover:bg-white/[0.06] active:scale-[0.99]"
    >
      <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-orange-500/15 blur-[60px]" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500/20 rounded-lg p-1.5">
            <TrendingUp size={13} className="text-orange-300" />
          </div>
          <p className="font-bold text-sm">Melhores Métricas</p>
        </div>
        <ChevronRight size={15} className="text-white/40" />
      </div>

      {/* Grid 2x2 */}
      <div className="relative grid grid-cols-2 gap-2">
        {cards.map((card, i) => {
          const Icone = card.Icon
          return (
            <div
              key={i}
              className="bg-black/25 rounded-xl p-2.5 border border-white/5"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icone size={11} style={{ color: card.cor }} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/50 truncate">
                  {card.label}
                </span>
              </div>
              <p
                className="text-sm font-black leading-tight truncate"
                style={{ color: card.cor }}
              >
                {card.valor}
              </p>
            </div>
          )
        })}
      </div>
    </button>
  )
}