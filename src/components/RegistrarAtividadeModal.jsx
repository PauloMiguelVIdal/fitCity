// src/components/RegistrarAtividadeModal.jsx
import { useState, useMemo, useEffect } from 'react'
import { X, Table2, Coins, Wand2 } from 'lucide-react'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import {
  calcularMoedas,
  nivelPorAtividade,
  raridadePorAtividade,
} from '../utils/atividades'
import { calcularXpAtividade } from '../utils/progressaoUsuario'
import { resolverVisualEdificio } from '../data/edificiosVisual'
import { useFitCityStore } from '../store/fitCityStore'
import CardFitCityActivities from './CardFitCityActivities'

// =============================================
// CONFIG
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

// =============================================
// METs — sugestão de calorias
// =============================================
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

/**
 * 🔥 Converte o objeto de campos do modal em objeto "atividade"
 * com os nomes canônicos esperados por avaliarAtividade/calcularMoedas.
 *
 * `tempo` (nome do campo no modal) → `duracao` (nome canônico)
 */
function montarAtividade(tipo, valores, camposConfig) {
  const atividade = { tipo }
  camposConfig.forEach((c) => {
    const chave = c === 'tempo' ? 'duracao' : c
    atividade[chave] = parseValor(valores[c])
  })
  return atividade
}

// =============================================
// COMPONENTE
// =============================================
export default function RegistrarAtividadeModal({
  onClose,
  onSalvar,
  perfil: perfilProp,
}) {
  const registrarAtividadeStore = useFitCityStore((s) => s.registrarAtividade)

  const [tipo, setTipo] = useState('musculacao')
  const [valores, setValores] = useState({ tempo: '', distancia: '', calorias: '' })
  const [tabelaAberta, setTabelaAberta] = useState(false)
  const [caloriasAuto, setCaloriasAuto] = useState(false)

  const config = TIPOS_ATIVIDADE[tipo]
  const perfil = perfilProp || PERFIL_PADRAO

  const caloriasSugeridas = useMemo(
    () => estimarCalorias(tipo, valores.tempo, perfil.peso),
    [tipo, valores.tempo, perfil.peso]
  )

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

  // ═════════════════════════════════════════════
  //  RESULTADO — usa a MESMA fonte da store
  // ═════════════════════════════════════════════
  const resultado = useMemo(() => {
    if (!tipo || !config || !camposOk) return null

    // 🔥 Monta atividade com `duracao` (nome canônico)
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

  const handleSalvar = () => {
    if (!podeSalvar || !resultado) return

    // 🔥 Monta atividade com `duracao` (nome canônico)
    const atividade = montarAtividade(tipo, valores, config.campos)

    registrarAtividadeStore({
      tipo: atividade.tipo,
      duracao: atividade.duracao || 0,
      distancia: atividade.distancia || 0,
      calorias: atividade.calorias || 0,
      origem: 'manual',
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

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[480px] bg-fitcity-bg border-t border-white/10 rounded-t-3xl p-5 pb-3 flex flex-col gap-4 shadow-[0_-15px_50px_rgba(0,0,0,0.5)] max-h-[98vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Resumo do Treino</h2>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
            >
              <X size={18} className="text-white/70" />
            </button>
          </div>

          {/* CONTAINER */}
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

          {/* DADOS DA ATIVIDADE */}
          <div className="flex flex-col gap-3 mt-2">
            <h3 className="text-base font-bold text-white">Dados da Atividade Realizada</h3>

            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TIPOS_ATIVIDADE).map(([id, { label, Icon }]) => {
                const ativo = tipo === id
                return (
                  <button
                    key={id}
                    onClick={() => handleChangeTipo(id)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 border transition-all ${
                      ativo
                        ? 'bg-gradient-to-br from-fitcity-energy to-orange-600 border-transparent shadow-[0_6px_18px_rgba(242,116,5,0.45)]'
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}
                  >
                    <Icon size={16} className={ativo ? 'text-white' : 'text-fitcity-energy/70'} />
                    <span className={`text-xs font-bold ${ativo ? 'text-white' : 'text-white/50'}`}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>

            {config && (
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
                            onChange={(e) => handleChangeCampo(campo, e.target.value)}
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
                          onChange={(e) => handleChangeCampo(campo, e.target.value)}
                          placeholder={LABEL_CAMPO[campo].placeholder}
                          className="bg-white/5 border-2 border-white/10 rounded-xl px-3 py-3 text-white text-base font-bold placeholder:text-white/20 placeholder:font-normal outline-none focus:border-fitcity-energy transition-colors"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleSalvar}
            disabled={!podeSalvar}
            className="mt-1 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-4 font-black text-white text-sm tracking-wider uppercase shadow-[0_10px_25px_rgba(242,116,5,0.45)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[0.98]"
          >
            salvar e coletar recompensas
          </button>
        </div>
      </div>

      {tabelaAberta && (
        <TabelaFaixas onClose={() => setTabelaAberta(false)} nivelAtual={resultado?.nivel ?? 1} />
      )}
    </>
  )
}

// =============================================
// MODAL DE TABELA DE FAIXAS
// =============================================
function TabelaFaixas({ onClose, nivelAtual }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-fitcity-bg border-t border-white/10 rounded-t-3xl p-5 pb-3 flex flex-col gap-4 shadow-[0_-15px_50px_rgba(0,0,0,0.6)] max-h-[98vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📊 Faixas de Recompensa
            </h2>
            <p className="text-[11px] text-white/50 mt-0.5">
              Entenda como o esforço do seu treino gera moedas, cartas e edifícios.
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors flex-shrink-0"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        <div className="grid grid-cols-[60px_90px_1fr_70px] gap-2 px-3 py-2 text-[10px] font-bold text-white/45 uppercase tracking-wider border-b border-white/5">
          <span>Nível</span>
          <span>FitScore</span>
          <span>Raridade</span>
          <span className="text-right">Faixa</span>
        </div>

        <div className="flex flex-col">
          {FAIXAS.map((faixa) => {
            const ativa = nivelAtual === faixa.nivel
            const cor = COR_RARIDADE[faixa.raridade]

            return (
              <div
                key={faixa.nivel}
                className={`grid grid-cols-[60px_90px_1fr_70px] gap-2 items-center px-3 py-3 rounded-xl border transition-all ${
                  ativa ? 'bg-fitcity-energy/10 border-fitcity-energy/50' : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <span className={`text-xs font-black ${ativa ? 'text-fitcity-energy' : 'text-white/50'}`}>
                  Nv {faixa.nivel}
                </span>
                <span className={`text-[11px] font-bold ${ativa ? 'text-fitcity-energy' : 'text-white/60'}`}>
                  {faixa.min}-{faixa.max}
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: cor, boxShadow: ativa ? `0 0 8px ${cor}` : 'none' }}
                  />
                  <span className={`text-[11px] truncate ${ativa ? 'text-white font-bold' : 'text-white/60'}`}>
                    {faixa.nome}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[11px] font-bold ${ativa ? 'text-purple-300' : 'text-white/50'}`}>
                    {ativa ? 'Você está aqui' : ''}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-emerald-600/10 border border-emerald-500/30 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1.5">
            💡 Como funciona o cálculo?
          </h3>
          <p className="text-[11px] text-emerald-100/80 leading-relaxed">
            As moedas vêm de <b>5 componentes</b>:
          </p>
          <ul className="text-[11px] text-emerald-100/80 leading-relaxed mt-1.5 space-y-0.5 list-disc list-inside">
            <li><b>fitScore</b> — combina intensidade (pace ou kcal/min) + volume</li>
            <li><b>Calorias</b> — 2 moedas a cada 100 kcal queimadas</li>
            <li><b>Nível</b> — 0/2/5/10/20 conforme a faixa</li>
            <li><b>Raridade</b> — 0/1/3/6/12</li>
            <li><b>Tipo</b> — corrida: +5, musculação: +3, caminhada: +1</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="mt-1 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-4 font-black text-white text-sm tracking-wider uppercase shadow-[0_10px_25px_rgba(242,116,5,0.45)] transition-all active:scale-[0.98]"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}