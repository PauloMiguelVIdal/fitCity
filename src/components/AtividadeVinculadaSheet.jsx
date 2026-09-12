// src/components/AtividadeVinculadaSheet.jsx
import { X, Coins, Clock, MapPin, Flame, Award } from 'lucide-react'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import { formatarDetalhe, calcularMoedas } from '../utils/atividades'
import CardFitCityActivities from './CardFitCityActivities'

// =============================================
// MAPEAMENTO DE EDIFÍCIOS POR NÍVEL DE MOEDAS
// =============================================
const EDIFICIOS_POR_NIVEL = {
  1: { edificios: [{ nome: 'Plantação De Vegetais', setor: 'agricultura' }], cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
  2: { edificios: [{ nome: 'Granja De Aves', setor: 'agricultura' }],        cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
  3: { edificios: [{ nome: 'Fazenda De Vacas', setor: 'agricultura' }],       cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
  4: { edificios: [{ nome: 'Criação De Ovinos', setor: 'agricultura' }],      cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
  5: { edificios: [{ nome: 'Cooperativa Agrícola', setor: 'agricultura' }],   cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
  6: { edificios: [{ nome: 'Centro De Comércio De Plantações', setor: 'agricultura' }], cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
}

const FAIXAS = [
  { nivel: 1, min: 1,  max: 5,  nome: 'Plantação De Vegetais',            raridade: 'comum' },
  { nivel: 2, min: 6,  max: 10, nome: 'Granja De Aves',                   raridade: 'incomum' },
  { nivel: 3, min: 11, max: 20, nome: 'Fazenda De Vacas',                 raridade: 'raro' },
  { nivel: 4, min: 21, max: 30, nome: 'Criação De Ovinos',                raridade: 'epico' },
  { nivel: 5, min: 31, max: 50, nome: 'Cooperativa Agrícola',             raridade: 'lendario' },
  { nivel: 6, min: 51, max: Infinity, nome: 'Centro De Comércio De Plantações', raridade: 'lendario' },
]

const RARIDADE_COR = {
  comum:    '#9CA3AF',
  incomum:  '#34D399',
  raro:     '#60A5FA',
  epico:    '#C084FC',
  lendario: '#F27405',
}

const SETOR_CORES = {
  agricultura:  { cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
  tecnologia:   { cor1: '#A64B00', cor2: '#D45A00', cor3: '#FF6F00', cor4: '#FF8C42' },
  industria:    { cor1: '#1A1A1A', cor2: '#4D4D4D', cor3: '#808080', cor4: '#B3B3B3' },
  comercio:     { cor1: '#660000', cor2: '#A31919', cor3: '#E60000', cor4: '#FF4D4D' },
  imobiliario:  { cor1: '#000066', cor2: '#1A1A8C', cor3: '#3333CC', cor4: '#6666FF' },
  energia:      { cor1: '#665200', cor2: '#A37F19', cor3: '#E6B800', cor4: '#FFD966' },
}

// =============================================
// HELPERS
// =============================================
const getNivelPorMoedas = (moedas) => {
  if (moedas <= 5) return 1
  if (moedas <= 10) return 2
  if (moedas <= 20) return 3
  if (moedas <= 30) return 4
  if (moedas <= 50) return 5
  return 6
}

const escolherEdificioPorNivel = (nivel) => {
  const config = EDIFICIOS_POR_NIVEL[nivel] || EDIFICIOS_POR_NIVEL[1]
  return config.edificios[0]
}

const getCartaDaAtividade = (atividade) => {
  const moedas = calcularMoedas(atividade)
  const nivel = getNivelPorMoedas(moedas)
  const edificio = escolherEdificioPorNivel(nivel)

  return {
    nome: edificio.nome,
    setor: edificio.setor,
    nivel,
    moedas,
    cor1: EDIFICIOS_POR_NIVEL[nivel]?.cor1 || '#003816',
    cor2: EDIFICIOS_POR_NIVEL[nivel]?.cor2 || '#1A5E2A',
    cor3: EDIFICIOS_POR_NIVEL[nivel]?.cor3 || '#0C9123',
    cor4: EDIFICIOS_POR_NIVEL[nivel]?.cor4 || '#4CAF50',
  }
}

const mapaRaridadePorNivel = {
  1: 'comum',
  2: 'incomum',
  3: 'raro',
  4: 'epico',
  5: 'lendario',
  6: 'lendario',
}

// Calcula XP de forma consistente com o RegistrarAtividadeModal
function calcularXP(moedas, tempo) {
  const t = Number(tempo) || 0
  const bonusTempo = Math.floor(t / 10) * 1
  return Math.round(moedas * 1.5) + bonusTempo
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function AtividadeVinculadaSheet({ atividade, onClose }) {
  if (!atividade) return null

  const Icon = TIPOS_ATIVIDADE[atividade.tipo]?.Icon
  const labelAtividade = TIPOS_ATIVIDADE[atividade.tipo]?.label || atividade.tipo
  const data = new Date(atividade.data)
  const detalhe = formatarDetalhe(atividade)

  const moedas = calcularMoedas(atividade)
  const carta = getCartaDaAtividade(atividade)
  const raridade = mapaRaridadePorNivel[carta.nivel] || 'comum'
  const xp = calcularXP(moedas, atividade.tempo)

  // Cores do setor (para o gradiente do container)
  const coresSetor = SETOR_CORES[carta.setor] || SETOR_CORES.agricultura

  // Formata data/hora
  const dataFormatada = data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const horaFormatada = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
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
                style={{ backgroundColor: `${coresSetor.cor4}22` }}
              >
                               <Icon size={20} style={{ color: coresSetor.cor3 }} />

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

        {/* ═══════════════ CONTAINER UNIFICADO (mesmo padrão do Registrar) ═══════════════ */}
        <div className="relative rounded-2xl overflow-hidden">

          {/* Overlay translúcido com gradiente do setor + roxo */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `linear-gradient(160deg, ${coresSetor.cor1} 0%, ${coresSetor.cor3} 40%, #350973 80%, #6411D9 100%)`,
              opacity: 0.65,
              boxShadow: `0 4px 20px ${coresSetor.cor4}33`,
            }}
          />

          {/* Conteúdo */}
          <div className="relative flex flex-col gap-4 p-4">

            {/* ─────── BLOCO SUPERIOR: CARTA + RECOMPENSAS ─────── */}
            <div className="grid grid-cols-[160px_1fr] gap-3">

              {/* COLUNA ESQUERDA: CARTA */}
              <div className="flex flex-col">
                <CardFitCityActivities
                  nome={carta.nome}
                  raridade={raridade}
                  quantidade={1}
                  cor1={carta.cor1}
                  cor2={carta.cor2}
                  cor3={carta.cor3}
                  cor4={carta.cor4}
                />
              </div>

              {/* COLUNA DIREITA: RECOMPENSAS */}
              <div className="flex flex-col gap-2">

                {/* Recompensa em moedas */}
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

                {/* XP conquistado */}
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
                    Cidade Conquista
                  </p>
                </div>
              </div>
            </div>

            {/* ─────── DIVISOR ─────── */}
            <div className="h-px bg-white/10" />

            {/* ─────── RÉGUA DE DESEMPENHO ─────── */}
{/* ─────── RÉGUA DE DESEMPENHO ─────── */}
<div className="relative pt-6 pb-1">
  {(() => {
    // 🔥 Clamp: nunca passa da última bolinha (índice 5)
    const nivelClamp = Math.min(carta.nivel, 5)
    const pctPos = ((nivelClamp - 0.5) / 5) * 100

    return (
      <>
        {/* Badge flutuante com moedas */}
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

        {/* TRILHA */}
        <div className="relative mt-6">
          <div className="h-3 rounded-full bg-[#2a1d4a] border border-white/10" />

          {/* Barra preenchida — nunca ultrapassa 90% */}
          <div
            className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pctPos}%`,
              background: 'linear-gradient(90deg, #F27405 0%, #ea580c 100%)',
              boxShadow: '0 0 12px rgba(242,116,5,0.5)',
            }}
          />

          {[1, 2, 3, 4, 5].map((n) => {
            const passado = n < nivelClamp
            const ativa = n === nivelClamp
            const futuro = n > nivelClamp

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
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}

                {ativa && (
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full blur-md"
                      style={{ background: '#F27405', opacity: 0.7 }}
                    />
                    <div
                      className="relative w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: '#fff',
                        boxShadow:
                          '0 0 0 2px #F27405, 0 0 0 3px #fff, 0 0 20px rgba(242,116,5,0.9)',
                      }}
                    >
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #F27405 0%, #ea580c 100%)',
                        }}
                      >
                        {/* 🔥 mostra o nível REAL, não o clampado */}
                        <span className="text-[12px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                          {carta.nivel}
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

        {/* LABELS DOS NÍVEIS */}
        <div className="relative mt-3 grid grid-cols-5">
          {[1, 2, 3, 4, 5].map((n) => {
            const ativa = nivelClamp === n
            const faixa = FAIXAS[n - 1]
            return (
              <div key={n} className="flex flex-col items-center gap-0.5">
                <span
                  className={`text-[11px] font-bold transition-colors ${
                    ativa ? 'text-orange-400' : 'text-white/45'
                  }`}
                >
                  Nv {n}
                  {ativa && <span className="ml-1">(Atual)</span>}
                </span>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    ativa ? 'text-orange-300/80' : 'text-white/30'
                  }`}
                >
                  {faixa.min}-{faixa.max === Infinity ? '∞' : faixa.max}
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

        {/* ═══════════════ DADOS DA ATIVIDADE ═══════════════ */}
        <div className="flex flex-col gap-3 mt-2">
          <h3 className="text-base font-bold text-white">
            Detalhes do Treino
          </h3>

          {/* Métricas em 3 colunas */}
          <div className="grid grid-cols-3 gap-2">
            {/* Tempo */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1">
              <Clock size={16} className="text-fitcity-energy" />
              <span className="text-lg font-black text-white">
                {atividade.tempo != null ? Math.round(atividade.tempo) : '—'}
              </span>
              <span className="text-[9px] text-white/50 uppercase tracking-wider">
                minutos
              </span>
            </div>

            {/* Distância */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1">
              <MapPin size={16} className="text-fitcity-energy" />
              <span className="text-lg font-black text-white">
                {atividade.distancia != null ? Number(atividade.distancia).toFixed(1) : '—'}
              </span>
              <span className="text-[9px] text-white/50 uppercase tracking-wider">
                km
              </span>
            </div>

            {/* Calorias */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1">
              <Flame size={16} className="text-fitcity-energy" />
              <span className="text-lg font-black text-white">
                {atividade.calorias != null ? Math.round(atividade.calorias) : '—'}
              </span>
              <span className="text-[9px] text-white/50 uppercase tracking-wider">
                kcal
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}