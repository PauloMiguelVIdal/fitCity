// src/screens/CityScreen.jsx
import { useState, useMemo, useCallback } from 'react'
import { TrendingUp, Trophy } from 'lucide-react'
import AtividadeVinculadaSheet from '../components/AtividadeVinculadaSheet'
import CityConquers from '../components/Citys/CityConquers'
import CityProgress from '../components/Citys/ProgressCity'
import { useFitCityStore } from '../store/fitCityStore'

export default function CityScreen() {
  const [aba, setAba] = useState('conquista')
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null)

  // Nível da cidade progresso (a conquista tem seu próprio nível, calculado dentro dela)
  const nivelCidade = useFitCityStore((s) => s.cidade.nivel)

  // Título dinâmico
  const titulo = useMemo(
    () => (aba === 'conquista' ? 'Cidade Conquista' : 'Cidade Progresso'),
    [aba]
  )
  const subtitulo = useMemo(
    () =>
      aba === 'conquista'
        ? 'Sua cidade construída com suas cartas'
        : 'Sua cidade em evolução constante',
    [aba]
  )

  return (
    <div className="relative px-4 pt-6 flex flex-col gap-4 text-white min-h-screen">
      <div className="pointer-events-none absolute -top-10 right-0 w-64 h-64 rounded-full bg-fitcity-accent/25 blur-[80px]" />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{titulo}</h1>
          <p className="text-xs text-white/40 mt-0.5">{subtitulo}</p>
        </div>
        <span className="bg-white/10 backdrop-blur-xl border border-white/10 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
          Nível {nivelCidade}
        </span>
      </div>

      {/* Abas */}
      <div className="relative flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-inner">
        {[
          { id: 'conquista', label: 'Conquista', icon: Trophy },
          { id: 'progresso', label: 'Progresso', icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition flex items-center justify-center gap-2 ${
              aba === id
                ? 'bg-gradient-to-r from-fitcity-energy to-orange-600 shadow-[0_4px_14px_rgba(242,116,5,0.5)]'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="flex-1">
        {aba === 'conquista' ? (
          <CityConquers onSelecionarAtividade={setAtividadeSelecionada} />
        ) : (
          <CityProgress onSelecionarAtividade={setAtividadeSelecionada} />
        )}
      </div>

      <AtividadeVinculadaSheet
        atividade={atividadeSelecionada}
        onClose={() => setAtividadeSelecionada(null)}
      />
    </div>
  )
}