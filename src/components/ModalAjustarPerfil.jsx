// src/components/ModalAjustarPerfil.jsx
import { useState, useMemo } from 'react'
import { X, User, Ruler, Weight, Calendar, Target, Info, Flame } from 'lucide-react'
import { useFitCityStore } from '../store/fitCityStore'

// ============================================================
// METs base por objetivo (pra mensagem informativa)
// ============================================================
const OBJETIVOS = [
  { id: 'manter',   label: 'Manter peso',    desc: 'Equilíbrio entre consumo e gasto' },
  { id: 'perder',   label: 'Perder peso',    desc: 'Foco em déficit calórico' },
  { id: 'ganhar',   label: 'Ganhar peso',    desc: 'Foco em superávit calórico' },
]

// ============================================================
// TMB — Mifflin-St Jeor (referência)
// ============================================================
function estimarTMB(peso, altura, idade, sexo = 'M') {
  const p = Number(peso) || 0
  const a = Number(altura) || 0
  const i = Number(idade) || 0

  if (p <= 0 || a <= 0 || i <= 0) return null

  // Mifflin-St Jeor
  if (sexo === 'F') {
    return Math.round(10 * p + 6.25 * a - 5 * i - 161)
  }
  return Math.round(10 * p + 6.25 * a - 5 * i + 5)
}

// ============================================================
// COMPONENTE
// ============================================================
export default function ModalAjustarPerfil({ onClose }) {
  const user = useFitCityStore((s) => s.user)
  const setUser = useFitCityStore((s) => s.setUser)

  const [nome, setNome] = useState(user?.nome || '')
  const [altura, setAltura] = useState(user?.altura ?? 178)
  const [peso, setPeso] = useState(user?.peso ?? 78)
  const [idade, setIdade] = useState(user?.idade ?? 24)
  const [objetivo, setObjetivo] = useState(user?.objetivo || 'manter')

  const tmb = useMemo(
    () => estimarTMB(peso, altura, idade, user?.sexo || 'M'),
    [peso, altura, idade, user?.sexo]
  )

  const podeSalvar = nome.trim().length >= 2 && peso > 0 && altura > 0 && idade > 0

  const handleSalvar = () => {
    if (!podeSalvar) return

    setUser({
      nome: nome.trim(),
      altura: Number(altura),
      peso: Number(peso),
      idade: Number(idade),
      objetivo,
      atleta: OBJETIVOS.find((o) => o.id === objetivo)?.label || 'Atleta',
    })

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-fitcity-bg border-t border-white/10 rounded-t-3xl p-5 pb-3 flex flex-col gap-4 shadow-[0_-15px_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Ajustar perfil e medidas</h2>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* DADOS PESSOAIS */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-fitcity-energy uppercase tracking-wider">
            Dados pessoais
          </p>

          {/* Nome */}
          <div>
            <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1">
              <User size={10} /> Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Paulo Miguel"
              className="w-full mt-1 bg-white/5 border-2 border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-fitcity-energy transition-colors"
            />
          </div>

          {/* Altura / Peso / Idade */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1">
                <Ruler size={10} /> Altura
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                placeholder="cm"
                className="w-full mt-1 bg-white/5 border-2 border-white/10 rounded-xl px-3 py-3 text-white text-sm font-bold placeholder:text-white/30 outline-none focus:border-fitcity-energy transition-colors"
              />
              <span className="text-[9px] text-white/40 mt-0.5 block">centímetros</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1">
                <Weight size={10} /> Peso
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="kg"
                className="w-full mt-1 bg-white/5 border-2 border-white/10 rounded-xl px-3 py-3 text-white text-sm font-bold placeholder:text-white/30 outline-none focus:border-fitcity-energy transition-colors"
              />
              <span className="text-[9px] text-white/40 mt-0.5 block">kg</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={10} /> Idade
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="anos"
                className="w-full mt-1 bg-white/5 border-2 border-white/10 rounded-xl px-3 py-3 text-white text-sm font-bold placeholder:text-white/30 outline-none focus:border-fitcity-energy transition-colors"
              />
              <span className="text-[9px] text-white/40 mt-0.5 block">anos</span>
            </div>
          </div>

          {/* Objetivo */}
          <div>
            <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <Target size={10} /> Objetivo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {OBJETIVOS.map((obj) => {
                const ativo = objetivo === obj.id
                return (
                  <button
                    key={obj.id}
                    onClick={() => setObjetivo(obj.id)}
                    className={`rounded-xl px-2 py-2.5 border transition-all text-center ${
                      ativo
                        ? 'bg-gradient-to-br from-fitcity-energy to-orange-600 border-transparent shadow-[0_4px_14px_rgba(242,116,5,0.4)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span className={`text-[11px] font-bold block ${ativo ? 'text-white' : 'text-white/60'}`}>
                      {obj.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ESTIMATIVA */}
        {tmb && (
          <div className="bg-orange-600/10 border border-orange-500/30 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-500/20 rounded-full p-1.5 shrink-0">
                <Flame size={14} className="text-orange-300" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-orange-300 mb-1">
                  🔥 Cálculo de calorias
                </p>
                <p className="text-[11px] text-orange-100/80 leading-relaxed">
                  Com base nos seus dados, sua <b>taxa metabólica basal estimada</b> é de
                  aproximadamente <b className="text-white">{tmb.toLocaleString('pt-BR')} kcal/dia</b>.
                </p>
                <p className="text-[10px] text-orange-100/60 leading-relaxed mt-1.5">
                  ⚠️ Este valor é uma <b>estimativa</b>, não uma medição precisa. O gasto real
                  varia com genética, composição corporal e nível de atividade.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* INFO */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-2">
          <Info size={12} className="text-white/50 shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/50 leading-relaxed">
            Seus dados serão usados para estimar automaticamente o gasto energético
            (kcal) das suas atividades no registro de treino.
          </p>
        </div>

        {/* BOTÃO SALVAR */}
        <button
          onClick={handleSalvar}
          disabled={!podeSalvar}
          className="mt-1 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-4 font-black text-white text-sm tracking-wider uppercase shadow-[0_10px_25px_rgba(242,116,5,0.45)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[0.98]"
        >
          Salvar alterações
        </button>
      </div>
    </div>
  )
}