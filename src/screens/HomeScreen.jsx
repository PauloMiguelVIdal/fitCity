// src/screens/HomeScreen.jsx
import { useState, useMemo, useEffect } from 'react'
import {
  Coins,
  Plus,
  ShoppingCart,
  Flame,
  Clock,
  MapPin,
  Building2,
  Package,
  Star,
  Zap,
  Home,
  Store,
  CircleChevronRight,
  Activity,
  Gift,
  Check,
  Trophy,
  Bell
} from 'lucide-react'

import MapWorldFitCity from '../components/MapWorldCity'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import {
  FILTRO_POR_PERIODO,
  isHoje,
  formatarDetalhe,
  resumoDoPeriodo
} from '../utils/atividades'
import { ModalShop } from '../components/ModalShop'

// ============================================================
// CONSTANTES
// ============================================================
const META_SEMANAL_ATIVIDADES = 5
const RECOMPENSA_META_SEMANAL = 100
const STORAGE_KEY_META_SEMANAL = 'fitcity:meta-semanal-coletada'
const STORAGE_KEY_ATIVIDADES = 'fitcity:atividades'

// ============================================================
// TABELA DE NÍVEIS (mesma usada no ActivitiesScreen)
// ============================================================
const TABELA_NIVEIS = [
  { nivel: 1, porte: 'Micro Empresa', raio: 3, atvMin: 1 },
  { nivel: 2, porte: 'Sociedade Limitada', raio: 3, atvMin: 3 },
  { nivel: 3, porte: 'Empresa Regional', raio: 3, atvMin: 7 },
  { nivel: 4, porte: 'Companhia Local', raio: 4, atvMin: 12 },
  { nivel: 5, porte: 'Empresa Estadual', raio: 5, atvMin: 16 },
  { nivel: 6, porte: 'Companhia Nacional', raio: 6, atvMin: 21 },
  { nivel: 7, porte: 'Corporação Multissetorial', raio: 6, atvMin: 27 },
  { nivel: 8, porte: 'Grupo Empresarial', raio: 7, atvMin: 34 },
  { nivel: 9, porte: 'Conglomerado Global', raio: 7, atvMin: 42 },
  { nivel: 10, porte: 'Mega Holding', raio: 8, atvMin: 50 },
]

function calcularNivel(atividadesMes) {
  let resultado = TABELA_NIVEIS[0]
  for (const item of TABELA_NIVEIS) {
    if (atividadesMes >= item.atvMin) resultado = item
    else break
  }
  return resultado
}

// Helper: lê atividades do localStorage
function lerAtividadesStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ATIVIDADES)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

// Helper: chave semanal (ex: "2026-W38")
function getSemanaAtualKey() {
  const d = new Date()
  const ano = d.getFullYear()
  const start = new Date(ano, 0, 1)
  const diff = Math.floor((d - start) / (24 * 60 * 60 * 1000))
  const semana = Math.ceil((diff + start.getDay() + 1) / 7)
  return `${ano}-W${semana}`
}

export default function HomeScreen({
  onNavigate,
  atividades: atividadesProp,
  onRegistrar,
  onColetarRecompensa, // 🔥 callback opcional: (moedas) => void
}) {
  const [modalLojaAberto, setModalLojaAberto] = useState(false)

  // ============================================================
  // FONTE DE DADOS: prop > localStorage
  // ============================================================
  const [atividadesLocal, setAtividadesLocal] = useState(() => {
    if (Array.isArray(atividadesProp)) return atividadesProp
    return lerAtividadesStorage() ?? []
  })

  useEffect(() => {
    if (Array.isArray(atividadesProp)) {
      setAtividadesLocal(atividadesProp)
      return
    }
    const doStorage = lerAtividadesStorage()
    if (doStorage) setAtividadesLocal(doStorage)
  }, [atividadesProp])

  useEffect(() => {
    function onStorage(e) {
      if (e.key !== STORAGE_KEY_ATIVIDADES) return
      const novo = lerAtividadesStorage()
      if (novo) setAtividadesLocal(novo)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const atividades = atividadesLocal

  // ============================================================
  // RECOMPENSA SEMANAL (estado + persistência)
  // ============================================================
  const semanaKey = useMemo(() => getSemanaAtualKey(), [])
  const [recompensaJaColetada, setRecompensaJaColetada] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_META_SEMANAL)
      if (!raw) return
      const parsed = JSON.parse(raw)
      setRecompensaJaColetada(parsed?.semana === semanaKey)
    } catch { /* noop */ }
  }, [semanaKey])

  // ============================================================
  // PACOTES PRINCIPAIS
  // ============================================================
  const pacotesPrincipais = [
    {
      id: 'bronze',
      nome: 'Pacote Bronze',
      preco: 15,
      icone: Package,
      cor1: '#7A3F00',
      cor2: '#A65F16',
      cor3: '#D8892B',
      cor4: '#F2B866',
      corFundo: 'bg-gradient-to-b from-amber-700 to-amber-900',
      corIcone: 'text-amber-200',
      corTexto: 'text-amber-100',
      conteudo: '3 Cartas (100% Comuns)',
      descricao:
        'Acesso rápido e contínuo. Todo treino gera progresso imediato.',
      quantidade: 3,
      probabilidades: { S: 0, A: 0, B: 10, C: 90 }
    },
    {
      id: 'prata',
      nome: 'Pacote Prata',
      preco: 40,
      icone: Package,
      cor1: '#555555',
      cor2: '#858585',
      cor3: '#BDBDBD',
      cor4: '#F1F1F1',
      corFundo: 'bg-gradient-to-b from-gray-400 to-gray-600',
      corIcone: 'text-white',
      corTexto: 'text-white',
      conteudo: '5 Cartas (4 Comuns + 1 Rara Garantida)',
      descricao:
        'O pacote principal do jogo. Equilibra volume e garantia de carta superior.',
      quantidade: 5,
      probabilidades: { S: 2, A: 8, B: 24, C: 66 }
    },
    {
      id: 'ouro',
      nome: 'Pacote Ouro',
      preco: 90,
      icone: Package,
      cor1: '#7A5200',
      cor2: '#B8860B',
      cor3: '#E0AD2F',
      cor4: '#FFE38A',
      corFundo: 'bg-gradient-to-b from-yellow-500 to-yellow-700',
      corIcone: 'text-yellow-100',
      corTexto: 'text-yellow-100',
      conteudo: '5 Cartas (3 Comuns + 1 Rara + 1 Épica Garantida)',
      descricao:
        'Meta de médio/longo prazo. Incentiva o acúmulo de moedas e constância.',
      quantidade: 5,
      probabilidades: { S: 5, A: 15, B: 30, C: 50 }
    }
  ]

  // ============================================================
  // PACOTES SETORIAIS
  // ============================================================
  const pacotesSetoriais = [
    {
      id: 'tech-industria',
      nome: 'Pacote Tech Indústria',
      preco: 5000,
      icone: Zap,
      setoresIds: ['tecnologia', 'industria'],
      corFundo: 'bg-gradient-to-r from-orange-600 via-orange-500 to-gray-700',
      corIcone: 'text-white',
      corTexto: 'text-white',
      setores: 'Tecnologia + Indústria',
      descricao: 'Cartas direcionadas para área urbana industrial e tecnológica.',
      quantidade: 4,
      probabilidades: { S: 2, A: 8, B: 24, C: 66 }
    },
    {
      id: 'imob-agro',
      nome: 'Pacote Imobiliário Agro',
      preco: 5000,
      icone: Home,
      setoresIds: ['imobiliario', 'agricultura'],
      corFundo: 'bg-gradient-to-r from-blue-700 via-blue-500 to-green-600',
      corIcone: 'text-white',
      corTexto: 'text-white',
      setores: 'Imobiliário + Agricultura',
      descricao: 'Cartas para expansão residencial e agrícola da sua cidade.',
      quantidade: 4,
      probabilidades: { S: 2, A: 8, B: 24, C: 66 }
    },
    {
      id: 'comercio-energia',
      nome: 'Pacote Comércio Energia',
      preco: 5000,
      icone: Store,
      setoresIds: ['comercio', 'energia'],
      corFundo: 'bg-gradient-to-r from-red-700 via-red-500 to-yellow-500',
      corIcone: 'text-white',
      corTexto: 'text-white',
      setores: 'Comércio + Energia',
      descricao: 'Cartas para o setor comercial e de energia da metrópole.',
      quantidade: 4,
      probabilidades: { S: 2, A: 8, B: 24, C: 66 }
    }
  ]

  // ============================================================
  // PACOTES DE CUSTOMIZAÇÃO
  // ============================================================
  const pacotesCustomizacao = [
    {
      id: 'cyberpunk',
      nome: 'Distrito Cyberpunk Neon',
      preco: 8500,
      icone: Zap,
      cor1: '#24004F',
      cor2: '#6411D9',
      cor3: '#9B4DFF',
      cor4: '#F27405',
      corFundo: 'bg-gradient-to-br from-purple-600 to-pink-600',
      corIcone: 'text-white',
      corTexto: 'text-white',
      descricao: 'Skin Noturna + 4 Prédios Iluminados',
      quantidade: 5,
      probabilidades: { S: 5, A: 15, B: 30, C: 50 }
    },
    {
      id: 'esportivo',
      nome: 'Complexo Esportivo Eco',
      preco: 6000,
      icone: Star,
      cor1: '#064A32',
      cor2: '#087F5B',
      cor3: '#18B981',
      cor4: '#67E8F9',
      corFundo: 'bg-gradient-to-br from-green-500 to-cyan-500',
      corIcone: 'text-white',
      corTexto: 'text-white',
      descricao: 'Estádio Ecológico + Pistas + Árvores',
      quantidade: 5,
      probabilidades: { S: 5, A: 15, B: 30, C: 50 }
    }
  ]

  // ============================================================
  // TODOS OS PACOTES
  // ============================================================
  const todosOsPacotes = [
    ...pacotesPrincipais.map((pacote) => ({ ...pacote, categoria: 'principal' })),
    ...pacotesSetoriais.map((pacote) => ({ ...pacote, categoria: 'setorial' })),
    ...pacotesCustomizacao.map((pacote) => ({ ...pacote, categoria: 'customizacao' }))
  ]

  // ============================================================
  // DADOS DERIVADOS DAS ATIVIDADES
  // ============================================================
  const moedas = useMemo(
    () => atividades.reduce((soma, a) => soma + (a.moedas || 0), 0),
    [atividades]
  )

  const atividadesHoje = useMemo(
    () => atividades.filter((a) => FILTRO_POR_PERIODO.hoje(a.data)),
    [atividades]
  )

  const resumoHoje = useMemo(
    () => resumoDoPeriodo(atividadesHoje),
    [atividadesHoje]
  )

  const recentes = useMemo(
    () => [...atividades]
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 3),
    [atividades]
  )

  const statusKcal = resumoHoje.calorias || 0
  const statusTempo = resumoHoje.tempo
    ? `${Math.floor(resumoHoje.tempo / 60)}h ${resumoHoje.tempo % 60}min`
    : '0h 0min'
  const statusDistancia = (resumoHoje.distancia ?? 0).toFixed(1)

  // ── Nível da cidade ──
  const nivelAtual = useMemo(
    () => calcularNivel(atividades.length),
    [atividades.length]
  )

  const cidade = {
    nome: 'FitCity',
    nivel: nivelAtual.nivel,
    porte: nivelAtual.porte,
    progresso: atividades.length,
    meta: TABELA_NIVEIS[Math.min(nivelAtual.nivel, TABELA_NIVEIS.length - 1)].atvMin
  }

  // ── Atividades da semana ──
  const atividadesSemana = useMemo(
    () => atividades.filter((a) => FILTRO_POR_PERIODO.semana(a.data)),
    [atividades]
  )

  const semana = useMemo(() => {
    const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
    const nomes = ['Hoje', 'Ontem', 'Anteontem', 'Qui', 'Sex', 'Sáb', 'Dom']

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
        concluido: atividadesDoDia.length > 0
      }
    })
  }, [atividades])

  const progressoSemanal = Math.min(atividadesSemana.length, META_SEMANAL_ATIVIDADES)
  const metaSemanalBatida = progressoSemanal >= META_SEMANAL_ATIVIDADES
  const metaSemanal = META_SEMANAL_ATIVIDADES

  // 🔥 Handler de coleta
  const handleColetarRecompensa = () => {
    if (!metaSemanalBatida || recompensaJaColetada) return

    // 1) Notifica o pai
    if (typeof onColetarRecompensa === 'function') {
      onColetarRecompensa(RECOMPENSA_META_SEMANAL)
    }

    // 2) Fallback: salva no localStorage
    try {
      const saldoRaw = localStorage.getItem('fitcity:saldo-moedas')
      const saldoAtual = saldoRaw ? Number(saldoRaw) || 0 : 0
      localStorage.setItem(
        'fitcity:saldo-moedas',
        String(saldoAtual + RECOMPENSA_META_SEMANAL)
      )
    } catch { /* noop */ }

    // 3) Marca como coletado nesta semana
    try {
      localStorage.setItem(
        STORAGE_KEY_META_SEMANAL,
        JSON.stringify({ semana: semanaKey, valor: RECOMPENSA_META_SEMANAL })
      )
    } catch { /* noop */ }

    setRecompensaJaColetada(true)
  }

  return (
    <div className="relative px-3 sm:px-4 pt-4 sm:pt-6 flex flex-col gap-3 sm:gap-4 text-white min-h-screen pb-12">

      {/* ======================================================
          HEADER — CIDADE CONQUISTADA
          ====================================================== */}

      <div

        className="relative flex items-center gap-2 sm:gap-3 w-full rounded-2xl p-3 sm:p-4 text-left overflow-hidden transition-all duration-300 group z-10 border border-white/10 shadow-[0_10px_40px_rgba(100,17,217,0.45)]"
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-orange-500 rounded-xl blur-md opacity-60 animate-pulse" />
          <div className="relative bg-gradient-to-br from-[#6411D9] to-[#331B8C] rounded-xl p-2 sm:p-2.5 shadow-[0_4px_20px_rgba(234,88,12,0.6)]">
            <Bell size={18} className="relative text-white sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="relative flex-1 min-w-0">
          <p className="font-semibold text-white text-sm sm:text-sm truncate">
            Lembresse de se movimentar hoje
          </p>

        </div>

        {/* <CircleChevronRight
          size={16}
          className="relative text-white/70 transition-transform duration-300 group-hover:translate-x-1 shrink-0 sm:w-[18px] sm:h-[18px]"
        /> */}
      </div>
      <div className="relative flex items-center justify-between z-10 gap-2 w-full">
        <div className="relative w-full bg-fitcity-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(100,17,217,0.35)] z-10">
          <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-fitcity-accent/30 blur-[80px]" />

          <div className="absolute w-full inset-0 opacity-95 flex items-center justify-center">
            <MapWorldFitCity />
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
                    Nível {cidade.nivel} • {cidade.porte}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full pl-2 sm:pl-3 pr-1 sm:pr-1.5 py-1 sm:py-1.5 shadow-lg shrink-0">
                <Coins size={14} className="text-fitcity-energy sm:w-4 sm:h-4 shrink-0" />
                <span className="font-bold text-xs sm:text-sm">
                  {moedas.toLocaleString('pt-BR')}
                </span>
                <button
                  onClick={() => onNavigate('inventario')}
                  className="ml-0.5 sm:ml-1 bg-gradient-to-br from-fitcity-energy to-orange-600 rounded-full p-1 sm:p-1.5 shadow-[0_2px_10px_rgba(242,116,5,0.6)] shrink-0"
                >
                  <Plus size={12} className="text-white sm:w-[14px] sm:h-[14px]" />
                </button>
              </div>
            </div>

            {/* STATUS UNIFICADO */}
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

      {/* ======================================================
          LOJA DE PACOTES
          ====================================================== */}
      <button
        onClick={() => setModalLojaAberto(true)}
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

      {/* ======================================================
          REGISTRAR ATIVIDADE
          ====================================================== */}
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

      {/* ======================================================
          ATIVIDADE SEMANAL — Bloco "à parte" com botão coletável
          ====================================================== */}
      <div
        className={`relative rounded-3xl p-3 sm:p-4 z-10 overflow-hidden border shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-500 ${metaSemanalBatida
            ? 'bg-gradient-to-br from-[#F27405]/35 to-[#6411D9]/55 border-[#6411D9]/35'
            : 'bg-[#1E0A3C]/55 border-purple-500/20'
          }`}
      >
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-purple-600/20 blur-[60px] pointer-events-none" />

        {/* Header: título + botão de recompensa */}
        <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-[0_4px_14px_rgba(242,116,5,0.5)] shrink-0">
              <Trophy size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black leading-tight">Meta da Semana</p>
              <p className="text-[9px] text-white/50 truncate">
                {progressoSemanal}/{metaSemanal} atividades
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">


            {/* 🔥 Botão clicável de recompensa */}
            <button
              type="button"
              disabled={!metaSemanalBatida || recompensaJaColetada}
              onClick={handleColetarRecompensa}
              className={`rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 transition-all ${recompensaJaColetada
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
                    : `Bata ${metaSemanal} treinos para liberar`
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
        </div>

        {/* Barra de progresso */}
        <div className="w-full h-1.5 bg-black/50 rounded-full mb-3 sm:mb-4 overflow-hidden relative z-10 border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${metaSemanalBatida
                ? 'bg-gradient-to-r from-[#6411D9] via-[#F27405] to-orange-600 shadow-[0_0_10px_rgba(100,17,217,0.7)]'
                : 'bg-gradient-to-r from-[#350973] to-[#F27405] shadow-[0_0_8px_rgba(242,116,5,0.5)]'
              }`}
            style={{ width: `${(progressoSemanal / metaSemanal) * 100}%` }}
          />
        </div>

        {/* Dias da semana */}
        <div className="flex justify-between items-center relative z-10 gap-0.5 sm:gap-1">
          {semana.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div className="relative">
                <div
                  className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-[10px] xs:text-xs sm:text-sm transition-all ${item.concluido
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
                  className={`sm:w-[10px] sm:h-[10px] ${item.concluido ? 'text-[#F27405]' : 'text-purple-400/30'}`}
                />
                <span
                  className={`text-[8px] xs:text-[9px] sm:text-[10px] font-bold ${item.concluido ? 'text-[#F27405]' : 'text-purple-400/30'
                    }`}
                >
                  {item.concluido ? `+${item.xp}` : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Etiqueta de meta batida */}
        {metaSemanalBatida && !recompensaJaColetada && (
          <p className="text-[9px] sm:text-[10px] font-black text-purple-200 uppercase tracking-wider mt-2 sm:mt-3 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] relative z-10">
            ★ Meta batida — colete sua recompensa!
          </p>
        )}
      </div>

      {/* ======================================================
          ATIVIDADES RECENTES
          ====================================================== */}
      <div className="flex flex-col gap-2 pb-4 z-10">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">
            Atividades recentes
          </p>
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

      {/* ======================================================
          MODAL DA LOJA
          ====================================================== */}
      {modalLojaAberto && (
        <ModalShop
          onCancelar={() => setModalLojaAberto(false)}
          pacotes={todosOsPacotes}
          moedas={moedas}
        />
      )}
    </div>
  )
}