// src/screens/HomeScreen.jsx
import { Coins, Plus, Store, Flame, Clock, MapPin, Building2, ChevronRight, User, Award, Zap } from 'lucide-react'
import MapWorldFitCity from '../components/MapWorldCity'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import { isHoje, formatarDetalhe, resumoDoPeriodo } from '../utils/atividades'

export default function HomeScreen({ onNavigate, atividades, onRegistrar, usuario = { nome: 'Paulo', nivel: 6, titulo: 'Explorador Urbano' } }) {
  const cidade = { nome: 'Minha Cidade', nivel: 5, progresso: 320, meta: 500 }
  const moedas = atividades.reduce((soma, a) => soma + (a.moedas || 0), 0)
  const resumoHoje = resumoDoPeriodo(atividades.filter(a => isHoje(a.data)))
  const recentes = atividades.slice(0, 3)
  const pct = (cidade.progresso / cidade.meta) * 100

  // Total de cartas (mock)
  const totalCartas = 30
  const metaCartas = 100

  return (
    <div className="relative px-4 pt-6 flex flex-col gap-4 text-white min-h-screen">
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-fitcity-accent/30 blur-[80px]" />

      {/* Header com logo e saudação */}
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
          <span className="font-bold text-sm">{moedas.toLocaleString('pt-BR')}</span>
          <button onClick={() => onNavigate('inventario')} className="ml-1 bg-gradient-to-br from-fitcity-energy to-orange-600 rounded-full p-1.5 shadow-[0_2px_10px_rgba(242,116,5,0.6)]">
            <Plus size={14} className="text-white" />
          </button>
        </div>
      </div>

      {/* Botão Loja */}
      <button
        onClick={() => onNavigate('inventario')}
        className="relative flex items-center gap-3 bg-gradient-to-r from-orange-600 via-fitcity-energy to-[#350973] rounded-2xl p-4 text-left shadow-[0_10px_30px_rgba(110,11,249,0.35)] border border-white/10 overflow-hidden"
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

      {/* Card da Cidade Conquistada com mapa como fundo */}
      <div className="relative bg-fitcity-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(100,17,217,0.35)]">
        {/* Mapa como fundo */}
        <div className="absolute inset-0 opacity-70">
          <MapWorldFitCity />
        </div>
        
        {/* Conteúdo sobreposto */}
        <div className="relative p-4 z-10">
          {/* Título da cidade */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-fitcity-energy/15 rounded-lg p-1.5 backdrop-blur-sm">
                <Building2 size={16} className="text-fitcity-energy" />
              </div>
              <p className="font-bold text-sm">Sua cidade conquistada</p>
            </div>
            <span className="text-xs font-bold text-fitcity-energy">Nível {cidade.nivel}</span>
          </div>
          
          {/* Total de cartas */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/70">Total de cartas</span>
            <span className="text-xs font-bold text-white">{totalCartas} / {metaCartas}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-fitcity-energy to-orange-500"
              style={{ width: `${(totalCartas / metaCartas) * 100}%` }}
            />
          </div>

          {/* Stats do dia - sobrepostos ao mapa */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl px-3 py-2 text-center border border-white/5">
              <Flame size={16} className="text-fitcity-energy mx-auto mb-0.5" />
              <span className="text-sm font-bold block text-white">{resumoHoje.calorias || 482}</span>
              <span className="text-[9px] text-white/40 uppercase">kcal</span>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl px-3 py-2 text-center border border-white/5">
              <Clock size={16} className="text-fitcity-energy mx-auto mb-0.5" />
              <span className="text-sm font-bold block text-white">{resumoHoje.tempo || '1h 45min'}</span>
              <span className="text-[9px] text-white/40 uppercase">tempo ativo</span>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl px-3 py-2 text-center border border-white/5">
              <MapPin size={16} className="text-fitcity-energy mx-auto mb-0.5" />
              <span className="text-sm font-bold block text-white">{resumoHoje.distancia?.toFixed(1) || '8.2'}</span>
              <span className="text-[9px] text-white/40 uppercase">km distância</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acessar sua cidade - Cards de navegação rápida */}
      <div className="relative">
        <p className="text-xs font-semibold text-white/60 mb-2">Acessar sua cidade</p>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onNavigate('city')}
            className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-left hover:bg-white/5 transition group"
          >
            <div className="flex items-center gap-2">
              <div className="bg-fitcity-energy/20 rounded-lg p-1.5">
                <Zap size={16} className="text-fitcity-energy" />
              </div>
              <span className="text-xs font-semibold group-hover:text-fitcity-energy transition">Cidade Atividade</span>
            </div>
            <p className="text-[9px] text-white/40 mt-1">Sua cidade em evolução</p>
          </button>
          <button 
            onClick={() => onNavigate('city')}
            className="bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-left hover:bg-white/5 transition group"
          >
            <div className="flex items-center gap-2">
              <div className="bg-fitcity-energy/20 rounded-lg p-1.5">
                <Building2 size={16} className="text-fitcity-energy" />
              </div>
              <span className="text-xs font-semibold group-hover:text-fitcity-energy transition">Cidade Conquistada</span>
            </div>
            <p className="text-[9px] text-white/40 mt-1">Sua cidade com suas cartas</p>
          </button>
        </div>
      </div>

      {/* Atividades recentes */}
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
          const cor = TIPOS_ATIVIDADE[a.tipo]?.cor || '#F27405'
          const label = TIPOS_ATIVIDADE[a.tipo]?.label || a.tipo
          
          return (
            <div key={a.id} className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-md">
              <div className="flex items-center gap-3">
                <div 
                  className="rounded-full p-2"
                  style={{ backgroundColor: `${cor}20` }}
                >
                  {Icon && <Icon size={18} style={{ color: cor }} />}
                </div>
                <div>
                  <p className="text-sm font-bold">{label}</p>
                  <p className="text-xs text-white/50">{formatarDetalhe(a)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-fitcity-energy/15 rounded-full px-2 py-1">
                <span className="text-fitcity-energy font-bold text-xs">+{a.moedas}</span>
                <Coins size={12} className="text-fitcity-energy" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}