// src/screens/HomeScreen.jsx
import { useState, useMemo } from 'react'
import {
  Coins,
  Plus,
  ShoppingCart,
  Flame,
  Clock,
  MapPin,
  Building2,
  CircleChevronRight,
  Activity,
  Gift,
  Check,
  Trophy,
  Bell,
  X,
  Sparkles,
} from 'lucide-react'

import MapWorldFitCity from '../components/MapWorldCity'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import {
  FILTRO_POR_PERIODO,
  formatarDetalhe,
  resumoDoPeriodo,
} from '../utils/atividades'
import { ModalShop } from '../components/ModalShop'
import { useFitCityStore } from '../store/fitCityStore'
import { usePatrimonioMap } from '../hooks/usePatrimônioMap'

// ============================================================
// CONSTANTES
// ============================================================
const META_SEMANAL_ATIVIDADES = 5
const RECOMPENSA_META_SEMANAL = 100

// Helper: chave semanal (ex: "2026-W38")
function getSemanaAtualKey() {
  const d = new Date()
  const ano = d.getFullYear()
  const start = new Date(ano, 1, 1)  // atenção: mês 0-indexed
  const diff = Math.floor((d - start) / (24 * 60 * 60 * 1000))
  const semana = Math.ceil((diff + start.getDay() + 1) / 7)
  return `${ano}-W${semana}`
}

// ============================================================
// COMPONENTE
// ============================================================
export default function HomeScreen({
  onNavigate,
  onRegistrar,
  onColetarRecompensa,
}) {
  const [modalLojaAberto, setModalLojaAberto] = useState(false)
  const [notificacaoVisivel, setNotificacaoVisivel] = useState(true)

  // ═══════════════════════════════════════════════════════════
  // STORE — fonte única
  // ═══════════════════════════════════════════════════════════
  const atividades = useFitCityStore((s) => s.atividades)
  const saldo = useFitCityStore((s) => s.economia.saldo)
  const economia = useFitCityStore((s) => s.economia)
  const cidade = useFitCityStore((s) => s.cidade)
  const adicionarMoedas = useFitCityStore((s) => s.adicionarMoedas)
  const abrirModalLoja = useFitCityStore((s) => s.abrirModalLoja)

  // 🔥 Hook compartilhado — mesma lógica do CidadePatrimonio
  const patrimonio = usePatrimonioMap()

  // ─── Semana atual ───
  const semanaKey = useMemo(() => getSemanaAtualKey(), [])

  // ─── Recompensa já coletada? ───
  const recompensaJaColetada = useMemo(() => {
    return (economia?.historico || []).some(
      (t) => t.origem === 'meta_semanal' && t.refId === semanaKey
    )
  }, [economia, semanaKey])

  // ═══════════════════════════════════════════════════════════
  // DADOS DERIVADOS
  // ═══════════════════════════════════════════════════════════
  const atividadesHoje = useMemo(
    () => atividades.filter((a) => FILTRO_POR_PERIODO.hoje(a.data)),
    [atividades]
  )
  const resumoHoje = useMemo(() => resumoDoPeriodo(atividadesHoje), [atividadesHoje])

  const recentes = useMemo(
    () =>
      [...atividades]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 3),
    [atividades]
  )

  const statusKcal = resumoHoje.calorias || 0
  const statusTempo = resumoHoje.duracao
    ? `${Math.floor(resumoHoje.duracao / 60)}h ${resumoHoje.duracao % 60}min`
    : '0h 0min'
  const statusDistancia = (resumoHoje.distancia ?? 0).toFixed(1)

  const nivelCidade = cidade.nivel || 1
  const porteCidade = cidade.porte || 'Micro Empresa'

  const atividadesSemana = useMemo(
    () => atividades.filter((a) => FILTRO_POR_PERIODO.semana(a.data)),
    [atividades]
  )

  const semana = useMemo(() => {
    const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
    const nomes = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

    const hoje = new Date()
    const diaSemana = hoje.getDay()
    const offset = diaSemana === 0 ? 6 : diaSemana - 1

    return labels.map((dia, i) => {
      const diff = i - offset
      const data = new Date()
      data.setDate(data.getDate() + diff)
      const dataStr = data.toDateString()

      const atividadesDoDia = atividades.filter(
        (a) => new Date(a.data).toDateString() === dataStr
      )
      const xp = atividadesDoDia.reduce((acc, a) => acc + (a.moedas || 0), 0)

      return {
        dia,
        label: nomes[i],
        xp,
        concluido: atividadesDoDia.length > 0,
      }
    })
  }, [atividades])

  const progressoSemanal = Math.min(atividadesSemana.length, META_SEMANAL_ATIVIDADES)
  const metaSemanalBatida = progressoSemanal >= META_SEMANAL_ATIVIDADES

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════
  const handleColetarRecompensa = () => {
    if (!metaSemanalBatida || recompensaJaColetada) return
    adicionarMoedas(RECOMPENSA_META_SEMANAL, 'meta_semanal', semanaKey)
    if (typeof onColetarRecompensa === 'function') {
      onColetarRecompensa(RECOMPENSA_META_SEMANAL)
    }
  }

  const handleDismissNotificacao = () => setNotificacaoVisivel(false)

  const handleAbrirLoja = () => {
    setModalLojaAberto(true)
    abrirModalLoja()
  }

  const handleFecharLoja = () => setModalLojaAberto(false)

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="relative px-3 sm:px-4 pt-4 sm:pt-6 flex flex-col gap-3 sm:gap-4 text-white min-h-screen pb-12">

      {/* NOTIFICAÇÃO */}
      {notificacaoVisivel && (
        <div className="relative w-full z-20">
          <div className="relative flex items-start gap-3 w-full rounded-2xl p-3.5 sm:p-4 overflow-hidden bg-gradient-to-br from-[#1E0A3C]/95 to-[#0F0520]/95 backdrop-blur-xl border border-purple-500/30 shadow-[0_10px_40px_rgba(100,17,217,0.5)]">
            <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-purple-600/40 blur-[40px] pointer-events-none" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-orange-500/30 blur-[40px] pointer-events-none" />

            <div className="relative shrink-0 mt-0.5">
              <div className="absolute inset-0 bg-orange-500 rounded-xl blur-md opacity-70 animate-pulse" />
              <div className="relative bg-gradient-to-br from-[#6411D9] to-[#331B8C] rounded-xl p-2.5 shadow-[0_4px_20px_rgba(234,88,12,0.6)]">
                <Bell size={18} className="relative text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center border-2 border-[#0F0520]">
                <Sparkles size={8} className="text-white" />
              </span>
            </div>

            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-white text-sm leading-tight">
                  Lembrete de Movimento
                </p>
                <span className="text-[9px] font-black uppercase tracking-wider text-orange-300/90 bg-orange-500/20 px-1.5 py-0.5 rounded-full">
                  Hoje
                </span>
              </div>
              <p className="text-xs text-purple-100/70 leading-relaxed">
                Não esqueça de se movimentar! Cada atividade conta para sua meta semanal. 🏃‍♂️
              </p>

              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6411D9] to-[#F27405] transition-all duration-700"
                    style={{ width: `${(progressoSemanal / META_SEMANAL_ATIVIDADES) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-purple-200/80 whitespace-nowrap">
                  {progressoSemanal}/{META_SEMANAL_ATIVIDADES}
                </span>
              </div>
            </div>

            <button
              onClick={handleDismissNotificacao}
              className="relative shrink-0 p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              aria-label="Fechar notificação"
            >
              <X size={14} className="text-white/50 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HEADER — CIDADE + MAPA (alimentado pelo hook) */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="relative flex items-center justify-between z-10 gap-2 w-full">
        <div className="relative w-full bg-fitcity-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(100,17,217,0.35)] z-10">
          <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-fitcity-accent/30 blur-[80px]" />

          {/* 🔥 Mapa 3D — alimentado com os mesmos dados do CidadePatrimonio */}
          <div className="absolute w-full inset-0 opacity-95 flex items-center justify-center pointer-events-none">
            {patrimonio.temCartas ? (
<MapWorldFitCity
  porte={patrimonio.porte}
  edificiosAtivos={patrimonio.edificiosAtivos}
  posicoes={patrimonio.posicoes}
  satelites={patrimonio.satelites}
  tilesToRender={patrimonio.tilesToRender}
  hexMap={patrimonio.hexMap}
  edificioPorId={patrimonio.edificioPorId}

  // 🔥 Câmera top-down da Activities
  cameraPosition={[2.8, 3, 2.8]}
  cameraFov={35}
  cameraTarget={[3, 3, 3]}
  minDistance={6}
  maxDistance={18}
  minPolarAngle={Math.PI / 8}
  maxPolarAngle={Math.PI / 2.2}
  autoRotate={true}
  dayProgress={0.6} 
  minimalist={true}
  disableControls={true}
/>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center px-6 opacity-60">
                <Building2 size={32} className="text-white/30" />
                <p className="text-xs text-white/50">Sua cidade está vazia</p>
                <p className="text-[10px] text-white/30 max-w-[200px]">
                  Compre pacotes e colecione cartas para construí-la.
                </p>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

          <div className="relative p-3 sm:p-4 z-10 flex flex-col justify-between min-h-[150px] sm:min-h-[320px]">

            {/* Topo: Título + Moedas */}
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-fitcity-energy to-orange-600 flex items-center justify-center shadow-[0_4px_16px_rgba(242,116,5,0.5)] shrink-0">
                  <Building2 size={20} className="text-white sm:w-[22px] sm:h-[22px]" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold leading-none truncate">
                    FitCity
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-white/80 mt-0.5 truncate">
                    Nível {nivelCidade} • {porteCidade}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full pl-2 sm:pl-3 pr-1 sm:pr-1.5 py-1 sm:py-1.5 shadow-lg shrink-0">
                <Coins size={14} className="text-fitcity-energy sm:w-4 sm:h-4 shrink-0" />
                <span className="font-bold text-xs sm:text-sm">
                  {saldo.toLocaleString('pt-BR')}
                </span>
                <button
                  onClick={() => onNavigate('inventario')}
                  className="ml-0.5 sm:ml-1 bg-gradient-to-br from-fitcity-energy to-orange-600 rounded-full p-1 sm:p-1.5 shadow-[0_2px_10px_rgba(242,116,5,0.6)] shrink-0"
                >
                  <Plus size={12} className="text-white sm:w-[14px] sm:h-[14px]" />
                </button>
              </div>
            </div>

            {/* STATUS HOJE */}
            <div className="mt-auto mb-0">
              <div className="bg-[#6411D9]/20 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-between overflow-hidden">
                <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 min-w-0">
                  <Flame size={14} className="text-orange-400 sm:w-4 sm:h-4 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold truncate">
                    {statusKcal} Kcal
                  </span>
                </div>

                <div className="w-px h-6 bg-white/10" />

                <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 min-w-0">
                  <Clock size={14} className="text-orange-400 sm:w-4 sm:h-4 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold truncate">
                    {statusTempo}
                  </span>
                </div>

                <div className="w-px h-6 bg-white/10" />

                <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 min-w-0">
                  <MapPin size={14} className="text-orange-400 sm:w-4 sm:h-4 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold truncate">
                    {statusDistancia} Km
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* LOJA DE PACOTES */}
      <button
        onClick={handleAbrirLoja}
        className="relative flex items-center gap-2 sm:gap-3 w-full rounded-2xl p-3 sm:p-4 text-left overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group z-10 bg-gradient-to-br from-[#4C1D95] via-[#6411D9] to-[#7C3AED] border border-white/10 shadow-[0_10px_40px_rgba(100,17,217,0.45)]"
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-orange-500 rounded-xl blur-md opacity-60 animate-pulse" />
          <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-2 sm:p-2.5 shadow-[0_4px_20px_rgba(234,88,12,0.6)]">
            <ShoppingCart size={18} className="relative text-white sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="relative flex-1 min-w-0">
          <p className="font-semibold text-white text-xs sm:text-sm truncate">
            Loja de Pacotes
          </p>
          <p className="text-[10px] sm:text-[11px] text-purple-100/80 truncate">
            Compre pacotes e desbloqueie novas cartas
          </p>
        </div>

        <CircleChevronRight
          size={16}
          className="relative text-white/70 transition-transform duration-300 group-hover:translate-x-1 shrink-0 sm:w-[18px] sm:h-[18px]"
        />
      </button>

      {/* REGISTRAR ATIVIDADE */}
      <button
        onClick={onRegistrar}
        className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-3 sm:py-3.5 px-3 font-semibold shadow-[0_10px_25px_rgba(242,116,5,0.45)] overflow-hidden z-10"
      >
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-orange-500 rounded-xl blur-md opacity-60 animate-pulse" />
          <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-2 sm:p-2.5 shadow-[0_4px_20px_rgba(234,88,12,0.6)]">
            <Activity size={18} className="relative text-white sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <div className="relative flex-1 min-w-0 text-left">
          <p className="font-semibold text-white text-base sm:text-xl truncate">
            + REGISTRAR ATIVIDADE
          </p>
          <p className="text-[10px] sm:text-[11px] text-purple-100/80 truncate">
            Converta seu treino em recursos para a cidade
          </p>
        </div>
      </button>

      {/* META DA SEMANA */}
      <div
        className={`relative rounded-3xl p-3 sm:p-4 z-10 overflow-hidden border shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-500 ${
          metaSemanalBatida
            ? 'bg-gradient-to-br from-[#F27405]/35 to-[#6411D9]/55 border-[#6411D9]/35'
            : 'bg-[#1E0A3C]/55 border-purple-500/20'
        }`}
      >
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-purple-600/20 blur-[60px] pointer-events-none" />

        <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-[0_4px_14px_rgba(242,116,5,0.5)] shrink-0">
              <Trophy size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black leading-tight">Meta da Semana</p>
              <p className="text-[9px] text-white/50 truncate">
                {progressoSemanal}/{META_SEMANAL_ATIVIDADES} atividades
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!metaSemanalBatida || recompensaJaColetada}
            onClick={handleColetarRecompensa}
            className={`rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 transition-all ${
              recompensaJaColetada
                ? 'bg-[#6411D9] border border-[#6411D9]/40 cursor-default'
                : metaSemanalBatida
                  ? 'bg-gradient-to-br from-[#F27405] to-[#6411D9] shadow-[0_4px_15px_rgba(242,116,5,0.55)] hover:scale-105 active:scale-95 cursor-pointer animate-pulse'
                  : 'bg-gradient-to-br from-orange-500 to-orange-600 opacity-60 cursor-not-allowed'
            }`}
            title={
              recompensaJaColetada
                ? 'Recompensa já coletada esta semana'
                : metaSemanalBatida
                  ? `Coletar +${RECOMPENSA_META_SEMANAL} moedas`
                  : `Bata ${META_SEMANAL_ATIVIDADES} treinos para liberar`
            }
          >
            {recompensaJaColetada ? (
              <>
                <Check size={12} className="text-white sm:w-[14px] sm:h-[14px]" strokeWidth={3} />
                <span className="text-[10px] sm:text-xs font-black text-white uppercase">
                  Coletado
                </span>
              </>
            ) : (
              <>
                <Gift size={12} className="text-white sm:w-[14px] sm:h-[14px]" />
                <span className="text-[10px] sm:text-xs font-bold text-white">
                  +{RECOMPENSA_META_SEMANAL}
                </span>
                <Coins size={10} className="text-white sm:w-3 sm:h-3" />
              </>
            )}
          </button>
        </div>

        <div className="w-full h-1.5 bg-black/50 rounded-full mb-3 sm:mb-4 overflow-hidden relative z-10 border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              metaSemanalBatida
                ? 'bg-gradient-to-r from-[#6411D9] via-[#F27405] to-orange-600 shadow-[0_0_10px_rgba(100,17,217,0.7)]'
                : 'bg-gradient-to-r from-[#350973] to-[#F27405] shadow-[0_0_8px_rgba(242,116,5,0.5)]'
            }`}
            style={{ width: `${(progressoSemanal / META_SEMANAL_ATIVIDADES) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center relative z-10 gap-0.5 sm:gap-1">
          {semana.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div className="relative">
                <div
                  className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-[10px] xs:text-xs sm:text-sm transition-all ${
                    item.concluido
                      ? 'bg-gradient-to-br from-[#F27405] to-orange-600 text-white shadow-[0_4px_15px_rgba(242,116,5,0.5)]'
                      : 'bg-purple-900/40 text-purple-300/50 border border-purple-500/20'
                  }`}
                >
                  {item.dia}
                </div>
                {item.concluido && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 flex items-center justify-center border-2 border-[#1E0A3C]">
                    <Check size={7} className="text-white sm:w-[10px] sm:h-[10px]" strokeWidth={3} />
                  </div>
                )}
              </div>

              <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-purple-200/60 font-medium truncate w-full text-center">
                {item.label}
              </span>

              <div className="flex items-center gap-0.5">
                <Coins
                  size={8}
                  className={`sm:w-[10px] sm:h-[10px] ${
                    item.concluido ? 'text-[#F27405]' : 'text-purple-400/30'
                  }`}
                />
                <span
                  className={`text-[8px] xs:text-[9px] sm:text-[10px] font-bold ${
                    item.concluido ? 'text-[#F27405]' : 'text-purple-400/30'
                  }`}
                >
                  {item.concluido ? `+${item.xp}` : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {metaSemanalBatida && !recompensaJaColetada && (
          <p className="text-[9px] sm:text-[10px] font-black text-purple-200 uppercase tracking-wider mt-2 sm:mt-3 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] relative z-10">
            ★ Meta batida — colete sua recompensa!
          </p>
        )}
      </div>

      {/* ATIVIDADES RECENTES */}
      <div className="flex flex-col gap-2 pb-4 z-10">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">Atividades recentes</p>
          <button
            onClick={() => onNavigate('atividades')}
            className="text-xs text-white/50"
          >
            Ver todas
          </button>
        </div>

        {recentes.length === 0 && (
          <p className="text-center text-white/40 text-sm py-4">
            Nenhuma atividade registrada ainda.
          </p>
        )}

        {recentes.map((a) => {
          const Icon = TIPOS_ATIVIDADE[a.tipo]?.Icon
          const cor = TIPOS_ATIVIDADE[a.tipo]?.cor || '#F27405'
          const label = TIPOS_ATIVIDADE[a.tipo]?.label || a.tipo

          return (
            <div
              key={a.id}
              className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-md gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="rounded-full p-2 shrink-0"
                  style={{ backgroundColor: `${cor}20` }}
                >
                  {Icon && <Icon size={18} style={{ color: cor }} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{label}</p>
                  <p className="text-xs text-white/50 truncate">
                    {formatarDetalhe(a)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-fitcity-energy/15 rounded-full px-2 py-1 shrink-0">
                <span className="text-fitcity-energy font-bold text-xs">
                  +{a.moedas}
                </span>
                <Coins size={12} className="text-fitcity-energy" />
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL DA LOJA */}
      {modalLojaAberto && <ModalShop onCancelar={handleFecharLoja} />}
    </div>
  )
}