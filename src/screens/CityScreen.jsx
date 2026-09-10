// src/screens/CityScreen.jsx
import { useState, useMemo, useCallback } from 'react'
import { Plus, Minus, LocateFixed, Building2, ChevronRight, TrendingUp, Award } from 'lucide-react'
import AtividadeVinculadaSheet from '../components/AtividadeVinculadaSheet'



import CityConquers from '../components/Citys/CityConquers'
import CityProgress from '../components/Citys/ProgressCity'

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function CityScreen({ atividades = [] }) {
  const [aba, setAba] = useState('patrimonio')
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null)
  const nivel = 5
  
  // Dados mock para a cidade
  const dadosCidade = useMemo(() => ({
    nivel: 5,
    progresso: 320,
    meta: 500,
    totalCartas: 30,
    metaCartas: 100,
    kcalTotais: 1250,
    tempoAtivo: '12h 30min',
    distanciaTotal: '52,6 km',
    edificiosConstruidos: 87,
    ultimasAtividades: [
      { tipo: 'corrida', distancia: '8,2 km', kcal: 482, pontos: 80 },
      { tipo: 'musculacao', tempo: '1h 20min', kcal: 430, pontos: 60 },
      { tipo: 'caminhada', distancia: '4,3 km', kcal: 210, pontos: 40 },
    ]
  }), [])

  return (
    <div className="relative px-4 pt-6 flex flex-col gap-4 text-white min-h-screen">
      <div className="pointer-events-none absolute -top-10 right-0 w-64 h-64 rounded-full bg-fitcity-accent/25 blur-[80px]" />

      {/* Header com nome da cidade e nível */}
      <div className="relative flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {aba === 'patrimonio' ? 'Cidade Patrimônio' : 'Cidade Progresso'}
          </h1>
          <p className="text-xs text-white/40 mt-0.5">
            {aba === 'patrimonio' 
              ? 'Sua cidade construída com suas cartas' 
              : 'Sua cidade em evolução constante'}
          </p>
        </div>
        <span className="bg-white/10 backdrop-blur-xl border border-white/10 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
          Nível {dadosCidade.nivel}
        </span>
      </div>

      {/* Abas de navegação */}
      <div className="relative flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-inner">
        {[
          { id: 'patrimonio', label: 'Patrimônio', icon: Award },
          { id: 'progresso', label: 'Progresso', icon: TrendingUp }
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

      {/* Conteúdo da aba selecionada */}
      <div className="flex-1">
        {aba === 'patrimonio' ? (
          <CityConquers 
            atividades={atividades}
            dadosCidade={dadosCidade}
            onSelecionarAtividade={setAtividadeSelecionada}
          />
        ) : (
          <CityProgress 
            atividades={atividades}
            dadosCidade={dadosCidade}
            onSelecionarAtividade={setAtividadeSelecionada}
          />
        )}
      </div>

      <AtividadeVinculadaSheet 
        atividade={atividadeSelecionada} 
        onClose={() => setAtividadeSelecionada(null)} 
      />
    </div>
  )
}