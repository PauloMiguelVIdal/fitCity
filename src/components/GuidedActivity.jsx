// src/components/GuidedActivity.jsx
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  X, Play, Pause, Square, Check, ChevronLeft,
  Timer, Target, Clock, Route, Flame, Coins, Wand2,
} from 'lucide-react'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import {
  calcularMoedas,
  nivelPorAtividade,
  raridadePorAtividade,
} from '../utils/atividades'
import { calcularXpAtividade } from '../utils/progressaoUsuario'
import { resolverVisualEdificio } from '../data/edificiosVisual'
import { useFitCityStore } from '../store/fitcityStore'
import CardFitCityActivities from './CardFitCityActivities'

// =============================================
// CONFIG (mesmo do RegistrarAtividadeModal)
// =============================================
const LABEL_CAMPO = {
  tempo: { label: 'DURAÇÃO (MIN)', placeholder: 'Ex: 34' },
  distancia: { label: 'DISTÂNCIA (KM)', placeholder: 'Ex: 8.2' },
  calorias: { label: 'CALORIAS (KCAL)', placeholder: 'Ex: 499' },
}

const FAIXAS = [
  { nivel: 1, min: 0,  max: 19,  nome: 'Comum',    raridade: 'comum' },
  { nivel: 2, min: 20, max: 39,  nome: 'Incomum',  raridade: 'incomum' },
  { nivel: 3, min: 40, max: 59,  nome: 'Raro',     raridade: 'raro' },
  { nivel: 4, min: 60, max: 79,  nome: 'Épico',    raridade: 'epico' },
  { nivel: 5, min: 80, max: 100, nome: 'Lendário', raridade: 'lendario' },
]

const COR_RARIDADE = {
  comum:    '#9CA3AF',
  incomum:  '#34D399',
  raro:     '#60A5FA',
  epico:    '#C084FC',
  lendario: '#F27405',
}

const SETOR_CORES = {
  agricultura: { cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
}

const METS_POR_TIPO = {
  musculacao:  { met: 6.0,  label: 'Musculação' },
  corrida:     { met: 9.8,  label: 'Corrida' },
  caminhada:   { met: 3.8,  label: 'Caminhada' },
}

const PESO_PADRAO_KG = 75
const PERFIL_PADRAO = { peso: PESO_PADRAO_KG, altura: 175, idade: 30 }

// =============================================
// HELPERS
// =============================================
const formatarTempo = (segundos) => {
  const s = Math.max(0, Math.floor(segundos))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function parseValor(v) {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function estimarCalorias(tipo, tempoMin, pesoKg = PESO_PADRAO_KG) {
  const t = Number(tempoMin)
  if (!Number.isFinite(t) || t <= 0) return null
  const met = METS_POR_TIPO[tipo]?.met ?? 6.0
  return Math.max(1, Math.round(met * pesoKg * (t / 60)))
}

function montarAtividade(tipo, valores, camposConfig) {
  const atividade = { tipo }
  camposConfig.forEach((c) => {
    const chave = c === 'tempo' ? 'duracao' : c
    atividade[chave] = parseValor(valores[c])
  })
  return atividade
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function GuidedActivity({ onClose, onSalvar, perfil: perfilProp }) {
  const registrarAtividadeStore = useFitCityStore((s) => s.registrarAtividade)

  // fases: 'tipo' | 'modo' | 'programar' | 'treino' | 'resumo'
  const [fase, setFase] = useState('tipo')
  const [tipo, setTipo] = useState(null)

  // valores do treino (mesma estrutura do RegistrarAtividadeModal)
  const [valores, setValores] = useState({ tempo: '', distancia: '', calorias: '' })
  const [caloriasAuto, setCaloriasAuto] = useState(false)

  // cronômetro
  const [segundosDecorridos, setSegundosDecorridos] = useState(0)
  const [pausado, setPausado] = useState(false)
  const iniciouEmRef = useRef(null)
  const pausouEmRef = useRef(null)
  const acumuladoRef = useRef(0)

  const config = tipo ? TIPOS_ATIVIDADE[tipo] : null
  const perfil = perfilProp || PERFIL_PADRAO

  const caloriasSugeridas = useMemo(
    () => estimarCalorias(tipo, valores.tempo, perfil.peso),
    [tipo, valores.tempo, perfil.peso]
  )

  // Auto-preenche calorias se estiver no modo auto
  useEffect(() => {
    if (caloriasSugeridas == null) return
    if (caloriasAuto) {
      setValores((prev) => ({ ...prev, calorias: String(caloriasSugeridas) }))
    }
  }, [caloriasSugeridas, caloriasAuto])

  const camposOk = useMemo(() => {
    if (!config) return false
    return config.campos.every((c) => {
      const raw = valores[c]
      if (raw === '' || raw == null) return false
      const n = Number(raw)
      return Number.isFinite(n) && n > 0
    })
  }, [config, valores])

  const podeSalvar = !!tipo && camposOk

  // =============================================
  // RESULTADO (mesma lógica do RegistrarAtividadeModal)
  // =============================================
  const resultado = useMemo(() => {
    if (!tipo || !config || !camposOk) return null

    const atividade = montarAtividade(tipo, valores, config.campos)

    const moedas = calcularMoedas(atividade)
    const nivel = nivelPorAtividade(atividade)
    const raridade = raridadePorAtividade(atividade)
    const xp = calcularXpAtividade({ ...atividade, moedas })
    const visual = resolverVisualEdificio(nivel, 'agricultura')

    return {
      moedas,
      nivel,
      raridade,
      xp,
      carta: {
        nome: visual.nome,
        raridade,
        cor1: SETOR_CORES.agricultura.cor1,
        cor2: SETOR_CORES.agricultura.cor2,
        cor3: SETOR_CORES.agricultura.cor3,
        cor4: SETOR_CORES.agricultura.cor4,
      },
      duracao: atividade.duracao,
      distancia: atividade.distancia,
      calorias: atividade.calorias,
    }
  }, [tipo, config, valores, camposOk])

  const coresSetor = SETOR_CORES.agricultura

  // =============================================
  // CRONÔMETRO
  // =============================================
  useEffect(() => {
    if (fase !== 'treino' || pausado) return
    const interval = setInterval(() => {
      const agora = Date.now()
      const base = pausouEmRef.current ?? iniciouEmRef.current
      if (!base) return
      const decorrido = acumuladoRef.current + Math.floor((agora - base) / 1000)
      setSegundosDecorridos(decorrido)
    }, 250)
    return () => clearInterval(interval)
  }, [fase, pausado])

  const iniciarTreino = useCallback(() => {
    const agora = Date.now()
    iniciouEmRef.current = agora
    pausouEmRef.current = null
    acumuladoRef.current = 0
    setSegundosDecorridos(0)
    setPausado(false)
    setFase('treino')
  }, [])

  const togglePausa = useCallback(() => {
    const agora = Date.now()
    if (pausado) {
      pausouEmRef.current = agora
      setPausado(false)
    } else {
      const base = pausouEmRef.current ?? iniciouEmRef.current
      acumuladoRef.current += Math.floor((agora - base) / 1000)
      pausouEmRef.current = null
      setPausado(true)
    }
  }, [pausado])

  // =============================================
  // FINALIZAR — joga o tempo decorrido no campo "tempo"
  // =============================================
  const finalizarTreino = useCallback(() => {
    const agora = Date.now()
    let totalSegundos = acumuladoRef.current
    if (!pausado) {
      const base = pausouEmRef.current ?? iniciouEmRef.current
      totalSegundos += Math.floor((agora - base) / 1000)
    }
    const minutos = Math.max(1, Math.round(totalSegundos / 60))

    // Atualiza valores com o tempo real e auto-calorias
    setValores((prev) => {
      const novos = { ...prev, tempo: String(minutos) }
      // Se o tipo tem calorias e o usuário não mexeu, auto-preenche
      if (config?.campos.includes('calorias')) {
        const sug = estimarCalorias(tipo, minutos, perfil.peso)
        if (sug != null) {
          novos.calorias = String(sug)
          setCaloriasAuto(true)
        }
      }
      return novos
    })

    setFase('resumo')
  }, [pausado, tipo, config, perfil.peso])

  // =============================================
  // AÇÕES DE UI
  // =============================================
  const handleChangeTipo = (novoTipo) => {
    setTipo(novoTipo)
    setValores({ tempo: '', distancia: '', calorias: '' })
    setCaloriasAuto(false)
  }

  const handleChangeCampo = (campo, valor) => {
    setValores((prev) => ({ ...prev, [campo]: valor }))
    if (campo === 'calorias') setCaloriasAuto(false)
    if (campo === 'tempo' && valor === '') setCaloriasAuto(false)
  }

  const aplicarSugestao = () => {
    if (caloriasSugeridas == null) return
    setValores((prev) => ({ ...prev, calorias: String(caloriasSugeridas) }))
    setCaloriasAuto(true)
  }

  const voltar = () => {
    if (fase === 'modo' || fase === 'programar') {
      setFase('tipo')
      setTipo(null)
      setValores({ tempo: '', distancia: '', calorias: '' })
    } else if (fase === 'resumo' && !resultado) {
      setFase('modo')
    } else if (fase === 'resumo') {
      // volta pra tela de modo (perde o resultado)
      setFase('modo')
    }
  }

  const handleSalvar = () => {
    if (!podeSalvar || !resultado) return

    const atividade = montarAtividade(tipo, valores, config.campos)

    registrarAtividadeStore({
      tipo: atividade.tipo,
      duracao: atividade.duracao || 0,
      distancia: atividade.distancia || 0,
      calorias: atividade.calorias || 0,
      origem: 'guiada',
    })

    if (typeof onSalvar === 'function') {
      onSalvar({
        ...atividade,
        moedas: resultado.moedas,
        xp: resultado.xp,
      })
    }

    onClose()
  }

  // =============================================
  // RENDER
  // =============================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-fitcity-bg border-t border-white/10 rounded-t-3xl p-5 pb-3 flex flex-col gap-4 shadow-[0_-15px_50px_rgba(0,0,0,0.5)] max-h-[98vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* KEYFRAMES */}
        <style>{`
          @keyframes gaPulse {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50%      { opacity: 1;   transform: scale(1.05); }
          }
          @keyframes gaRipple {
            0%   { transform: scale(0.85); opacity: 0.7; }
            100% { transform: scale(1.4);  opacity: 0; }
          }
          @keyframes gaBadgePulse {
            0%, 100% { transform: translateY(0)    scale(1);    }
            50%      { transform: translateY(-1px) scale(1.08); }
          }
        `}</style>

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(fase === 'modo' || fase === 'programar' || fase === 'resumo') && (
              <button
                onClick={voltar}
                className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
                aria-label="Voltar"
              >
                <ChevronLeft size={18} className="text-white/70" />
              </button>
            )}
            <h2 className="text-xl font-bold text-white">
              {fase === 'tipo' && 'Atividade Guiada'}
              {fase === 'modo' && 'Como quer treinar?'}
              {fase === 'programar' && 'Definir metas'}
              {fase === 'treino' && 'Treino em andamento'}
              {fase === 'resumo' && 'Resumo do Treino'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* ===================== FASE: TIPO ===================== */}
        {fase === 'tipo' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-white/50">
              Escolha o tipo de atividade que vai realizar agora.
            </p>
            {Object.entries(TIPOS_ATIVIDADE).map(([id, info]) => {
              const Icon = info.Icon
              return (
                <button
                  key={id}
                  onClick={() => handleChangeTipo(id)}
                  className="flex items-center gap-3 w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fitcity-energy to-orange-600 flex items-center justify-center shadow-[0_4px_14px_rgba(242,116,5,0.4)]">
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{info.label}</div>
                    <div className="text-[10px] text-white/45 mt-0.5">
                      Campos: {info.campos.join(' • ')}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ===================== FASE: MODO ===================== */}
        {fase === 'modo' && config && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
              <config.Icon size={18} className="text-fitcity-energy" />
              <span className="text-sm font-bold text-white">{config.label}</span>
            </div>

            <p className="text-xs text-white/50">Como você quer conduzir este treino?</p>

            {/* Cronômetro */}
            <button
              onClick={iniciarTreino}
              className="flex items-start gap-3 w-full text-left bg-gradient-to-br from-purple-600/30 to-fuchsia-600/15 border border-purple-500/50 rounded-2xl p-4 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-[0_4px_14px_rgba(168,85,247,0.5)]">
                <Timer size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">Iniciar cronômetro</div>
                <div className="text-[10px] text-white/55 mt-1 leading-relaxed">
                  Começa a contar agora. Pause, retome e finalize quando quiser.
                </div>
              </div>
            </button>

            {/* Metas */}
            <button
              onClick={() => setFase('programar')}
              className="flex items-start gap-3 w-full text-left bg-white/5 border border-white/10 rounded-2xl p-4 transition-colors hover:bg-white/10"
            >
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                <Target size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">Programar metas</div>
                <div className="text-[10px] text-white/55 mt-1 leading-relaxed">
                  Defina tempo, distância e calorias direto. Sem cronômetro.
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ===================== FASE: PROGRAMAR ===================== */}
        {fase === 'programar' && config && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-white/50">
              Preencha os dados do seu treino e veja o resultado em tempo real.
            </p>

            <CamposAtividade
              config={config}
              valores={valores}
              onChange={handleChangeCampo}
              caloriasSugeridas={caloriasSugeridas}
              caloriasAuto={caloriasAuto}
              aplicarSugestao={aplicarSugestao}
              tipo={tipo}
              perfil={perfil}
            />

            <button
              onClick={() => setFase('resumo')}
              disabled={!podeSalvar}
              className="mt-1 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-4 font-black text-white text-sm tracking-wider uppercase shadow-[0_10px_25px_rgba(242,116,5,0.45)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[0.98]"
            >
              Ver resultado
            </button>
          </div>
        )}

        {/* ===================== FASE: TREINO ===================== */}
        {fase === 'treino' && config && (
          <div className="flex flex-col items-center gap-5 py-4">
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 220, height: 220,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(147,51,234,0.25) 0%, rgba(147,51,234,0) 70%)`,
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px solid rgba(168,85,247,0.35)',
                  boxShadow: pausado ? 'none' : '0 0 30px rgba(168,85,247,0.55)',
                  animation: pausado ? 'none' : 'gaPulse 2s ease-in-out infinite',
                }}
              />
              {!pausado && (
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 8,
                    borderRadius: '50%',
                    border: '2px solid rgba(217,70,239,0.6)',
                    animation: 'gaRipple 2s ease-out infinite',
                  }}
                />
              )}

              <div className="relative flex flex-col items-center gap-1">
                <config.Icon size={26} className="text-fuchsia-400" />
                <div
                  className="font-bold text-white"
                  style={{
                    fontSize: 44,
                    letterSpacing: 1,
                    fontVariantNumeric: 'tabular-nums',
                    textShadow: '0 2px 12px rgba(168,85,247,0.7)',
                  }}
                >
                  {formatarTempo(segundosDecorridos)}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">
                  {config.label}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={togglePausa}
                className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 font-black text-sm tracking-wider uppercase transition-all active:scale-[0.98] ${
                  pausado
                    ? 'bg-gradient-to-r from-fitcity-energy to-orange-600 text-white shadow-[0_10px_25px_rgba(242,116,5,0.45)]'
                    : 'bg-white/5 border border-white/10 text-white/80'
                }`}
              >
                {pausado ? <Play size={16} /> : <Pause size={16} />}
                {pausado ? 'Retomar' : 'Pausar'}
              </button>
              <button
                onClick={finalizarTreino}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 font-black text-sm tracking-wider uppercase bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_10px_25px_rgba(168,85,247,0.5)] transition-all active:scale-[0.98]"
              >
                <Square size={16} />
                Finalizar
              </button>
            </div>

            <p className="text-[10px] text-white/40 text-center">
              Ao finalizar, você poderá ajustar distância e calorias no resumo.
            </p>
          </div>
        )}

        {/* ===================== FASE: RESUMO ===================== */}
        {fase === 'resumo' && (
          <div className="flex flex-col gap-4">
            {/* CAMPOS EDITÁVEIS (durante o resumo, permite ajuste fino) */}
            {config && (
              <CamposAtividade
                config={config}
                valores={valores}
                onChange={handleChangeCampo}
                caloriasSugeridas={caloriasSugeridas}
                caloriasAuto={caloriasAuto}
                aplicarSugestao={aplicarSugestao}
                tipo={tipo}
                perfil={perfil}
              />
            )}

            {resultado && (
              <div className="relative rounded-2xl overflow-hidden">
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: `linear-gradient(160deg, ${coresSetor.cor1} 0%, ${coresSetor.cor3} 40%, #350973 80%,  #6411D9 100%)`,
                    opacity: 0.65,
                    boxShadow: `0 4px 20px ${coresSetor.cor4}33`,
                  }}
                />

                <div className="relative flex flex-col gap-4 p-4">
                  <div className="grid grid-cols-[160px_1fr] gap-3">
                    <div className="flex flex-col">
                      <CardFitCityActivities
                        nome={resultado.carta.nome}
                        raridade={resultado.carta.raridade}
                        quantidade={1}
                        cor1={resultado.carta.cor1}
                        cor2={resultado.carta.cor2}
                        cor3={resultado.carta.cor3}
                        cor4={resultado.carta.cor4}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="bg-orange-600/20 backdrop-blur-sm border border-orange-500/50 rounded-2xl p-3">
                        <span className="text-[10px] font-bold text-orange-200 uppercase tracking-wider">
                          Recompensa
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                            +{resultado.moedas}
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
                            +{resultado.xp}
                          </span>
                          <span className="text-xs font-bold text-purple-200">XP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* RÉGUA 5 NÍVEIS */}
                  <div className="relative pt-6 pb-1">
                    {(() => {
                      const nivel = resultado.nivel
                      const pctPos = ((nivel - 0.5) / 5) * 100

                      return (
                        <>
                          <div
                            className="absolute transition-all duration-500 ease-out z-20"
                            style={{ left: `${pctPos}%`, top: 0, transform: 'translateX(-50%)' }}
                          >
                            <div
                              className="rounded-lg px-3 py-1.5 whitespace-nowrap shadow-[0_6px_20px_rgba(242,116,5,0.6)]"
                              style={{
                                background: 'linear-gradient(135deg, #FF8C1A 0%, #E65A00 100%)',
                                border: '1.5px solid #FFB060',
                              }}
                            >
                              <span className="text-[11px] font-black text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                                {resultado.moedas} Moedas
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
                              const corRaridade = COR_RARIDADE[FAIXAS[n - 1].raridade]

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
                                      style={{ background: 'linear-gradient(135deg, #F27405 0%, #ea580c 100%)' }}
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
            )}

            <button
              onClick={handleSalvar}
              disabled={!podeSalvar}
              className="mt-1 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-4 font-black text-white text-sm tracking-wider uppercase shadow-[0_10px_25px_rgba(242,116,5,0.45)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[0.98]"
            >
              salvar e coletar recompensas
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================
// SUB-COMPONENTE: CAMPOS DE ATIVIDADE
// (reaproveitado de RegistrarAtividadeModal)
// =============================================
function CamposAtividade({
  config,
  valores,
  onChange,
  caloriasSugeridas,
  caloriasAuto,
  aplicarSugestao,
  tipo,
  perfil,
}) {
  return (
    <div className={`grid gap-3 ${config.campos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {config.campos.map((campo) => {
        const isCalorias = campo === 'calorias'
        const mostraSugestao = isCalorias && caloriasSugeridas != null && caloriasSugeridas > 0

        return (
          <div key={campo} className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-fitcity-energy uppercase tracking-wider">
              {LABEL_CAMPO[campo].label}
            </label>

            {isCalorias && mostraSugestao ? (
              <div className="flex items-stretch gap-1.5">
                <input
                  type="number"
                  inputMode="decimal"
                  value={valores[campo]}
                  onChange={(e) => onChange(campo, e.target.value)}
                  placeholder={LABEL_CAMPO[campo].placeholder}
                  className="flex-1 min-w-0 bg-white/5 border-2 border-white/10 rounded-xl px-3 py-3 text-white text-base font-bold placeholder:text-white/20 placeholder:font-normal outline-none focus:border-fitcity-energy transition-colors"
                />
                <button
                  type="button"
                  onClick={aplicarSugestao}
                  className={`flex items-center justify-center gap-1 rounded-xl px-2.5 border text-[10px] font-bold transition-all flex-shrink-0 ${
                    caloriasAuto
                      ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                      : 'bg-purple-500/15 border-purple-400/40 text-purple-200 hover:bg-purple-500/25'
                  }`}
                  title={`Sugestão: ${METS_POR_TIPO[tipo]?.label ?? tipo} • ${perfil.peso}kg • ${valores.tempo}min`}
                >
                  <Wand2 size={11} />
                  <span className="whitespace-nowrap">
                    {caloriasAuto ? caloriasSugeridas : `~${caloriasSugeridas}`}
                  </span>
                </button>
              </div>
            ) : (
              <input
                type="number"
                inputMode="decimal"
                value={valores[campo]}
                onChange={(e) => onChange(campo, e.target.value)}
                placeholder={LABEL_CAMPO[campo].placeholder}
                className="bg-white/5 border-2 border-white/10 rounded-xl px-3 py-3 text-white text-base font-bold placeholder:text-white/20 placeholder:font-normal outline-none focus:border-fitcity-energy transition-colors"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}