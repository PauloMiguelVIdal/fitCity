// src/screens/ActivitiesScreen.jsx
import { useState, useMemo } from 'react'
import { MapPin, Clock, Coins, Plus } from 'lucide-react'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import { FILTRO_POR_PERIODO, formatarDetalhe, resumoDoPeriodo } from '../utils/atividades'

const PERIODOS = ['hoje', 'semana', 'mes']
const META_DIARIA_KCAL = 600 // provisório

export default function ActivitiesScreen({ atividades, onRegistrar }) {
  const [periodo, setPeriodo] = useState('hoje')
  const filtradas = useMemo(
    () => atividades.filter(a => FILTRO_POR_PERIODO[periodo](a.data)),
    [atividades, periodo]
  )
  const resumo = useMemo(() => resumoDoPeriodo(filtradas), [filtradas])
  const pct = Math.min(100, (resumo.calorias / META_DIARIA_KCAL) * 100)

  return (
    <div className="relative px-4 pt-6 flex flex-col gap-4 text-white pb-4">
      <div className="pointer-events-none absolute -top-10 right-0 w-64 h-64 rounded-full bg-fitcity-energy/25 blur-[80px]" />

      <h1 className="relative text-xl font-bold">Atividades</h1>

      <div className="relative flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-inner">
        {PERIODOS.map(p => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize ${
              periodo === p ? 'bg-gradient-to-r from-fitcity-energy to-orange-600 shadow-[0_4px_14px_rgba(242,116,5,0.5)]' : 'text-white/50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="relative flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <div className="relative w-28 h-28 flex-shrink-0">
          <div
            className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(242,116,5,0.5)]"
            style={{ background: `conic-gradient(#F27405 ${pct}%, rgba(255,255,255,0.08) ${pct}% 100%)` }}
          />
          <div className="absolute inset-2 rounded-full bg-fitcity-bg flex flex-col items-center justify-center border border-white/10">
            <span className="text-base font-bold">{resumo.calorias} kcal</span>
            <span className="text-[10px] text-white/50">de {META_DIARIA_KCAL} kcal</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 text-sm">
            <MapPin size={16} className="text-fitcity-energy" /> {resumo.distancia.toFixed(1)} km
          </div>
          <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 text-sm">
            <Clock size={16} className="text-fitcity-energy" /> {resumo.tempo} min
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm">Histórico de atividades</p>
        {filtradas.length === 0 && (
          <p className="text-center text-white/40 text-sm py-6">Nenhuma atividade nesse período ainda.</p>
        )}
        {filtradas.map((a) => {
          const Icon = TIPOS_ATIVIDADE[a.tipo]?.Icon
          return (
            <div key={a.id} className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-fitcity-energy/15 rounded-full p-2">
                  {Icon && <Icon size={18} className="text-fitcity-energy" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{TIPOS_ATIVIDADE[a.tipo]?.label}</p>
                  <p className="text-xs text-white/50">{formatarDetalhe(a)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-fitcity-energy/15 rounded-full px-2 py-1">
                <span className="text-fitcity-energy font-semibold text-xs">+{a.moedas}</span>
                <Coins size={12} className="text-fitcity-energy" />
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={onRegistrar}
        className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-3.5 font-semibold shadow-[0_10px_25px_rgba(242,116,5,0.45)] overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <Plus size={18} className="relative" />
        <span className="relative">Registrar atividade</span>
      </button>

      <div className="relative flex items-center gap-3 bg-gradient-to-r from-fitcity-accent to-fitcity-energy rounded-2xl p-4 shadow-[0_10px_30px_rgba(242,116,5,0.35)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
        <div className="relative bg-white/15 backdrop-blur-md rounded-xl p-2.5">
          <Coins size={22} className="text-white" />
        </div>
        <div className="relative">
          <p className="font-semibold text-sm">Suas recompensas</p>
          <p className="text-xs text-white/80">Ganhe moedas com suas atividades e compre pacotes na loja</p>
        </div>
      </div>
    </div>
  )
}