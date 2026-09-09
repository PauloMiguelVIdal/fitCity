// src/screens/ProfileScreen.jsx
import { Flame, Clock, MapPin, Building2, Trophy, Settings } from 'lucide-react'

export default function ProfileScreen() {
  const usuario = { nome: 'Paulo Miguel', nivel: 6, progresso: 120, meta: 500 }
  const stats = [
    { label: 'Total de calorias', valor: '2.840 kcal', Icon: Flame },
    { label: 'Tempo ativo', valor: '12h 30min', Icon: Clock },
    { label: 'Distância total', valor: '51,6 km', Icon: MapPin },
    { label: 'Edifícios construídos', valor: '87', Icon: Building2 },
  ]
  const conquistas = ['5 dias seguidos', '10 km corridos', '50 edifícios construídos', '1.000 moedas']
  const pct = (usuario.progresso / usuario.meta) * 100

  return (
    <div className="relative px-4 pt-6 flex flex-col gap-4 text-white pb-4">
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-fitcity-accent/25 blur-[80px]" />

      <div className="relative flex items-center justify-between">
        <h1 className="text-xl font-bold">Perfil</h1>
        <button className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-md">
          <Settings size={18} className="text-white/70" />
        </button>
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fitcity-accent to-fitcity-energy flex items-center justify-center text-2xl font-bold shadow-[0_10px_25px_rgba(242,116,5,0.4)] border-2 border-white/20">
          {usuario.nome.charAt(0)}
        </div>
        <p className="font-semibold">{usuario.nome}</p>
        <p className="text-xs text-white/50">Nível {usuario.nivel}</p>
        <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-fitcity-energy to-orange-300 shadow-[0_0_8px_rgba(242,116,5,0.7)]" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, valor, Icon }) => (
          <div key={label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-lg">
            <div className="bg-fitcity-energy/15 rounded-lg p-1.5 w-fit mb-2">
              <Icon size={16} className="text-fitcity-energy" />
            </div>
            <p className="font-bold">{valor}</p>
            <p className="text-[10px] text-white/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">Conquistas</p>
        <button className="text-xs text-white/50">Ver todas</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {conquistas.map(c => (
          <div key={c} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center shadow-md">
            <div className="bg-fitcity-energy/15 rounded-full p-1.5">
              <Trophy size={16} className="text-fitcity-energy" />
            </div>
            <span className="text-[9px] text-white/60">{c}</span>
          </div>
        ))}
      </div>

      <div className="relative bg-gradient-to-r from-fitcity-accent to-fitcity-energy rounded-2xl p-4 shadow-[0_10px_30px_rgba(242,116,5,0.35)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
        <p className="relative font-semibold text-sm">Você está indo muito bem!</p>
        <p className="relative text-xs text-white/80">
          Sua cidade já é {Math.round(pct)}% do tamanho que pode ser. Continue!
        </p>
      </div>
    </div>
  )
}