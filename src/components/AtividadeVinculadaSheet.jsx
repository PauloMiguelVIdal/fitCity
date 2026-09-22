// src/components/AtividadeVinculadaSheet.jsx
import { X, Coins, Clock, MapPin, Flame } from 'lucide-react'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import {
  calcularMoedas,
  nivelPorAtividade,
  raridadePorAtividade,
} from '../utils/atividades'
import { calcularXpAtividade } from '../utils/progressaoUsuario'
import { resolverVisualEdificio } from '../data/edificiosVisual'
import CardFitCityActivities from './CardFitCityActivities'

const SETOR_CORES = {
  agricultura: { cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
}

// =============================================
// HELPERS
// =============================================
function resolverDadosVisuais(atividade) {
  const nivel = nivelPorAtividade(atividade)
  const raridade = raridadePorAtividade(atividade)
  const setor = 'agricultura'

  const visual = resolverVisualEdificio(nivel, setor)
  const cores = SETOR_CORES[setor] || SETOR_CORES.agricultura

  return {
    nivel,
    raridade,
    setor,
    nome: visual.nome,
    cor1: cores.cor1,
    cor2: cores.cor2,
    cor3: cores.cor3,
    cor4: cores.cor4,
  }
}

const RARIDADE_COR = {
  comum:    '#9CA3AF',
  incomum:  '#34D399',
  raro:     '#60A5FA',
  epico:    '#C084FC',
  lendario: '#F27405',
}

const FAIXAS = [
  { nivel: 1, min: 0,  max: 19,  raridade: 'comum' },
  { nivel: 2, min: 20, max: 39,  raridade: 'incomum' },
  { nivel: 3, min: 40, max: 59,  raridade: 'raro' },
  { nivel: 4, min: 60, max: 79,  raridade: 'epico' },
  { nivel: 5, min: 80, max: 100, raridade: 'lendario' },
]

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function AtividadeVinculadaSheet({ atividade, onClose }) {
  if (!atividade) return null

  const Icon = TIPOS_ATIVIDADE[atividade.tipo]?.Icon
  const data = new Date(atividade.data)

  const moedas = calcularMoedas(atividade)
  const xp = calcularXpAtividade({ ...atividade, moedas })
  const visual = resolverDadosVisuais(atividade)

  const dataFormatada = data.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  const horaFormatada = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-fitcity-bg border-t border-white/10 rounded-t-3xl p-5 pb-3 flex flex-col gap-4 shadow-[0_-15px_50px_rgba(0,0,0,0.5)] max-h-[98vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          {Icon && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${visual.cor4}22` }}
            >
              <Icon size={20} style={{ color: visual.cor3 }} />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">Atividade Realizada</h2>
            <p className="text-[11px] text-white/50 mt-0.5">
              {dataFormatada} às {horaFormatada}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* CONTAINER UNIFICADO */}
        <div className="relative rounded-2xl overflow-hidden">
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `linear-gradient(160deg, ${visual.cor1} 0%, ${visual.cor3} 40%, #350973 80%, #6411D9 100%)`,
              opacity: 0.65,
              boxShadow: `0 4px 20px ${visual.cor4}33`,
            }}
          />

          <div className="relative flex flex-col gap-4 p-4">
            {/* CARTA + RECOMPENSAS */}
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <div className="flex flex-col">
                <CardFitCityActivities
                  nome={visual.nome}
                  raridade={visual.raridade}
                  quantidade={1}
                  cor1={visual.cor1}
                  cor2={visual.cor2}
                  cor3={visual.cor3}
                  cor4={visual.cor4}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="bg-orange-600/20 backdrop-blur-sm border border-orange-500/50 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-orange-200 uppercase tracking-wider">
                    Moedas ganhas
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                      +{moedas}
                    </span>
                    <Coins size={20} className="text-orange-400" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="bg-purple-700/25 backdrop-blur-sm border border-purple-500/50 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">
                    XP Conquistado
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                      +{xp}
                    </span>
                    <span className="text-xs font-bold text-purple-200">XP</span>
                  </div>
                  <p className="text-[10px] text-purple-100/80 mt-0.5 leading-tight">
                    Progressão do Usuário
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* RÉGUA DE DESEMPENHO — 5 níveis */}
            <div className="relative pt-6 pb-1">
              {(() => {
                const nivel = visual.nivel
                const pctPos = ((nivel - 0.5) / 5) * 100

                return (
                  <>
                    <div
                      className="absolute transition-all duration-500 ease-out z-20"
                      style={{
                        left: `${pctPos}%`,
                        top: 0,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div
                        className="rounded-lg px-3 py-1.5 whitespace-nowrap shadow-[0_6px_20px_rgba(242,116,5,0.6)]"
                        style={{
                          background: 'linear-gradient(135deg, #FF8C1A 0%, #E65A00 100%)',
                          border: '1.5px solid #FFB060',
                        }}
                      >
                        <span className="text-[11px] font-black text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                          {moedas} Moedas
                        </span>
                      </div>
                      <div
                        className="w-2.5 h-2.5 rotate-45 mx-auto -mt-1.5"
                        style={{
                          background: '#E65A00',
                          borderRight: '1.5px solid #FFB060',
                          borderBottom: '1.5px solid #FFB060',
                        }}
                      />
                    </div>

                    <div className="relative mt-6">
                      <div className="h-3 rounded-full bg-[#2a1d4a] border border-white/10" />

                      <div
                        className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${pctPos}%`,
                          background: 'linear-gradient(90deg, #F27405 0%, #ea580c 100%)',
                          boxShadow: '0 0 12px rgba(242,116,5,0.5)',
                        }}
                      />

                      {[1, 2, 3, 4, 5].map((n) => {
                        const passado = n < nivel
                        const ativa = n === nivel
                        const futuro = n > nivel
                        const corRaridade = RARIDADE_COR[FAIXAS[n - 1].raridade] || '#9CA3AF'

                        return (
                          <div
                            key={n}
                            className="absolute top-1/2 transition-all duration-500 z-10"
                            style={{
                              left: `${((n - 0.5) / 5) * 100}%`,
                              transform: 'translate(-50%, -50%)',
                            }}
                          >
                            {passado && (
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(242,116,5,0.6)]"
                                style={{
                                  background: 'linear-gradient(135deg, #F27405 0%, #ea580c 100%)',
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            )}

                            {ativa && (
                              <div className="relative">
                                <div
                                  className="absolute inset-0 rounded-full blur-md"
                                  style={{ background: corRaridade, opacity: 0.7 }}
                                />
                                <div
                                  className="relative w-8 h-8 rounded-full flex items-center justify-center"
                                  style={{
                                    background: '#fff',
                                    boxShadow: `0 0 0 2px ${corRaridade}, 0 0 0 3px #fff, 0 0 20px ${corRaridade}aa`,
                                  }}
                                >
                                  <div
                                    className="w-full h-full rounded-full flex items-center justify-center"
                                    style={{
                                      background: `linear-gradient(135deg, ${corRaridade} 0%, ${corRaridade}cc 100%)`,
                                    }}
                                  >
                                    <span className="text-[12px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                                      {n}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {futuro && (
                              <div
                                className="w-6 h-6 rounded-full bg-[#1a0a3a] flex items-center justify-center"
                                style={{ border: '2px solid rgba(150, 100, 220, 0.5)' }}
                              >
                                <span className="text-[10px] font-black text-white/40">{n}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="relative mt-3 grid grid-cols-5">
                      {[1, 2, 3, 4, 5].map((n) => {
                        const ativa = nivel === n
                        const faixa = FAIXAS[n - 1]
                        return (
                          <div key={n} className="flex flex-col items-center gap-0.5">
                            <span className={`text-[11px] font-bold transition-colors ${ativa ? 'text-orange-400' : 'text-white/45'}`}>
                              Nv {n}{ativa && <span className="ml-1">(Atual)</span>}
                            </span>
                            <span className={`text-[10px] font-medium transition-colors ${ativa ? 'text-orange-300/80' : 'text-white/30'}`}>
                              {faixa.min}-{faixa.max}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>

        {/* DADOS DA ATIVIDADE */}
        <div className="flex flex-col gap-3 mt-2">
          <h3 className="text-base font-bold text-white">Detalhes do Treino</h3>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1">
              <Clock size={16} className="text-fitcity-energy" />
              <span className="text-lg font-black text-white">
                {atividade.duracao != null ? Math.round(atividade.duracao) : '—'}
              </span>
              <span className="text-[9px] text-white/50 uppercase tracking-wider">minutos</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1">
              <MapPin size={16} className="text-fitcity-energy" />
              <span className="text-lg font-black text-white">
                {atividade.distancia != null ? Number(atividade.distancia).toFixed(1) : '—'}
              </span>
              <span className="text-[9px] text-white/50 uppercase tracking-wider">km</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1">
              <Flame size={16} className="text-fitcity-energy" />
              <span className="text-lg font-black text-white">
                {atividade.calorias != null ? Math.round(atividade.calorias) : '—'}
              </span>
              <span className="text-[9px] text-white/50 uppercase tracking-wider">kcal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}