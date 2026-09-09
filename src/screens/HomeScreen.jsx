// src/screens/HomeScreen.jsx
import { Coins, Plus, Store, Flame, Clock, MapPin, Building2, ChevronRight } from 'lucide-react'
import MapWorld from '../components/MapWorld'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import { isHoje, formatarDetalhe, resumoDoPeriodo } from '../utils/atividades'

export default function HomeScreen({ onNavigate, atividades, onRegistrar }) {
  const cidade = { nome: 'Minha Cidade', nivel: 6, progresso: 120, meta: 500 }
  const moedas = atividades.reduce((soma, a) => soma + (a.moedas || 0), 0)
  const resumoHoje = resumoDoPeriodo(atividades.filter(a => isHoje(a.data)))
  const recentes = atividades.slice(0, 3)
  const pct = (cidade.progresso / cidade.meta) * 100

  return (
    <div className="relative px-4 pt-6 flex flex-col gap-4 text-white">
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-fitcity-accent/30 blur-[80px]" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fitcity-energy to-orange-600 flex items-center justify-center shadow-[0_4px_16px_rgba(242,116,5,0.5)]">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">FitCity</h1>
            <p className="text-[11px] text-white/50 mt-0.5">Sua energia constrói o futuro</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full pl-3 pr-1.5 py-1.5 shadow-lg">
          <Coins size={16} className="text-fitcity-energy" />
          <span className="font-semibold text-sm">{moedas.toLocaleString('pt-BR')}</span>
          <button onClick={() => onNavigate('inventario')} className="ml-1 bg-gradient-to-br from-fitcity-energy to-orange-600 rounded-full p-1.5 shadow-[0_2px_10px_rgba(242,116,5,0.6)]">
            <Plus size={14} className="text-white" />
          </button>
        </div>
      </div>

      <button
        onClick={() => onNavigate('inventario')}
        className="relative flex items-center gap-3 bg-gradient-to-r from-orange-600  via-fitcity-energy to-[#350973] rounded-2xl p-4 text-left shadow-[0_10px_30px_rgba(110,11,249,0.35)] border border-white/10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
        <div className="relative bg-white/15 backdrop-blur-md rounded-xl p-2.5 shadow-inner">
          <Store size={22} className="text-white" />
        </div>
        <div className="relative flex-1">
          <p className="font-semibold">Loja</p>
          <p className="text-xs text-white/80">Compre pacotes e desbloqueie novas cartas</p>
        </div>
        <ChevronRight size={18} className="relative text-white/70" />
      </button>

      <div className="relative bg-fitcity-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_10px_30px_rgba(100,17,217,0.35)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-fitcity-energy/15 rounded-lg p-1.5">
              <Building2 size={16} className="text-fitcity-energy" />
            </div>
            <p className="font-semibold text-sm">Sua cidade · Nível {cidade.nivel}</p>
          </div>
          <span className="text-xs text-white/50">{cidade.progresso} / {cidade.meta}</span>
        </div>
        <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-fitcity-energy to-orange-300 shadow-[0_0_8px_rgba(242,116,5,0.7)]" style={{ width: `${pct}%` }} />
        </div>
        <div className="h-40 rounded-xl overflow-hidden bg-black/30 shadow-inner border border-white/5" style={{ pointerEvents: 'none' }}>
          <MapWorld />
        </div>
        <div className="flex justify-between gap-2">
          {[
            { Icon: Flame, valor: `${resumoHoje.calorias} kcal` },
            { Icon: Clock, valor: `${resumoHoje.tempo} min` },
            { Icon: MapPin, valor: `${resumoHoje.distancia.toFixed(1)} km` },
          ].map(({ Icon, valor }, i) => (
            <div key={i} className="flex-1 flex items-center gap-1.5 bg-black/20 rounded-lg px-2 py-1.5">
              <Icon size={14} className="text-fitcity-energy flex-shrink-0" />
              <span className="text-[11px] text-white/80 truncate">{valor}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onRegistrar} className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-3.5 font-semibold shadow-[0_10px_25px_rgba(242,116,5,0.45)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <Plus size={18} className="relative" />
        <span className="relative">Registrar atividade</span>
      </button>

      <div className="flex flex-col gap-2 pb-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">Atividades recentes</p>
          <button onClick={() => onNavigate('atividades')} className="text-xs text-white/50">Ver todas</button>
        </div>
        {recentes.length === 0 && (
          <p className="text-center text-white/40 text-sm py-4">Nenhuma atividade registrada ainda.</p>
        )}
        {recentes.map((a) => {
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
    </div>
  )
}