
// src/screens/HomeScreen.jsx
import { useState } from 'react'
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
  Store
} from 'lucide-react'

import MapWorldFitCity from '../components/MapWorldCity'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import {
  isHoje,
  formatarDetalhe,
  resumoDoPeriodo
} from '../utils/atividades'
import { ModalShop } from '../components/ModalShop'

export default function HomeScreen({
  onNavigate,
  atividades,
  onRegistrar
}) {
  const [modalLojaAberto, setModalLojaAberto] = useState(false)

  // ============================================================
  // PACOTES PRINCIPAIS
  // ============================================================
  const pacotesPrincipais = [
    {
      id: 'bronze',
      nome: 'Pacote Bronze',
      preco: 15,
      icone: Package,

      // Cores usadas também pelo ModalShop
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
      probabilidades: {
        S: 0,
        A: 0,
        B: 10,
        C: 90
      }
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
      probabilidades: {
        S: 2,
        A: 8,
        B: 24,
        C: 66
      }
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
      probabilidades: {
        S: 5,
        A: 15,
        B: 30,
        C: 50
      }
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

      // IMPORTANTE:
      // Esses IDs serão usados pelo ModalShop para
      // mesclar automaticamente as cores dos setores.
      setoresIds: ['tecnologia', 'industria'],

      corFundo:
        'bg-gradient-to-r from-orange-600 via-orange-500 to-gray-700',
      corIcone: 'text-white',
      corTexto: 'text-white',

      setores: 'Tecnologia + Indústria',

      descricao:
        'Cartas direcionadas para área urbana industrial e tecnológica.',

      quantidade: 4,

      probabilidades: {
        S: 2,
        A: 8,
        B: 24,
        C: 66
      }
    },

    {
      id: 'imob-agro',
      nome: 'Pacote Imobiliário Agro',
      preco: 5000,
      icone: Home,

      setoresIds: ['imobiliario', 'agricultura'],

      corFundo:
        'bg-gradient-to-r from-blue-700 via-blue-500 to-green-600',
      corIcone: 'text-white',
      corTexto: 'text-white',

      setores: 'Imobiliário + Agricultura',

      descricao:
        'Cartas para expansão residencial e agrícola da sua cidade.',

      quantidade: 4,

      probabilidades: {
        S: 2,
        A: 8,
        B: 24,
        C: 66
      }
    },

    {
      id: 'comercio-energia',
      nome: 'Pacote Comércio Energia',
      preco: 5000,
      icone: Store,

      setoresIds: ['comercio', 'energia'],

      corFundo:
        'bg-gradient-to-r from-red-700 via-red-500 to-yellow-500',
      corIcone: 'text-white',
      corTexto: 'text-white',

      setores: 'Comércio + Energia',

      descricao:
        'Cartas para o setor comercial e de energia da metrópole.',

      quantidade: 4,

      probabilidades: {
        S: 2,
        A: 8,
        B: 24,
        C: 66
      }
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

      // Customização possui identidade própria.
      cor1: '#24004F',
      cor2: '#6411D9',
      cor3: '#9B4DFF',
      cor4: '#F27405',

      corFundo:
        'bg-gradient-to-br from-purple-600 to-pink-600',
      corIcone: 'text-white',
      corTexto: 'text-white',

      descricao:
        'Skin Noturna + 4 Prédios Iluminados',

      quantidade: 5,

      probabilidades: {
        S: 5,
        A: 15,
        B: 30,
        C: 50
      }
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

      corFundo:
        'bg-gradient-to-br from-green-500 to-cyan-500',
      corIcone: 'text-white',
      corTexto: 'text-white',

      descricao:
        'Estádio Ecológico + Pistas + Árvores',

      quantidade: 5,

      probabilidades: {
        S: 5,
        A: 15,
        B: 30,
        C: 50
      }
    }
  ]

  // ============================================================
  // TODOS OS PACOTES
  // ============================================================
  //
  // NÃO sobrescrevemos cor1/cor2/cor3/cor4 aqui.
  //
  // Esse era o principal problema do código anterior:
  //
  // cor1: '#ffffff'
  // cor2: '#3e3a44'
  // cor3: '#fde4ce'
  // cor4: '#1f014e'
  //
  // Como esses valores eram aplicados a todos os pacotes,
  // o ModalShop recebia exatamente a mesma paleta.
  //
  const todosOsPacotes = [
    ...pacotesPrincipais.map((pacote) => ({
      ...pacote,
      categoria: 'principal'
    })),

    ...pacotesSetoriais.map((pacote) => ({
      ...pacote,
      categoria: 'setorial'
    })),

    ...pacotesCustomizacao.map((pacote) => ({
      ...pacote,
      categoria: 'customizacao'
    }))
  ]

  // ============================================================
  // DADOS DA CIDADE
  // ============================================================
  const cidade = {
    nome: 'Minha Cidade',
    nivel: 5,
    progresso: 30,
    meta: 100
  }

  const moedas = atividades.reduce(
    (soma, a) => soma + (a.moedas || 0),
    0
  )

  const resumoHoje = resumoDoPeriodo(
    atividades.filter((a) => isHoje(a.data))
  )

  const recentes = atividades.slice(0, 3)

  const statusKcal = resumoHoje.calorias || 482
  const statusTempo = resumoHoje.tempo || '1h 45min'
  const statusDistancia =
    resumoHoje.distancia?.toFixed(1) || '0.0'

  // ============================================================
  // MINI PACOTES DA HOME
  // ============================================================
  //
  // Aqui usamos apenas uma representação pequena.
  // O clique abre a loja completa.
  //
  const miniPacotes = [
    {
      id: 'bronze',
      nome: 'Bronze',
      icone: Package,
      cor:
        'bg-gradient-to-b from-[#A65F16] to-[#5C2E00]'
    },
    {
      id: 'prata',
      nome: 'Prata',
      icone: Package,
      cor:
        'bg-gradient-to-b from-[#D0D0D0] to-[#666666]'
    },
    {
      id: 'ouro',
      nome: 'Ouro',
      icone: Package,
      cor:
        'bg-gradient-to-b from-[#E0AD2F] to-[#765000]'
    }
  ]

  return (
    <div className="relative px-4 pt-6 flex flex-col gap-4 text-white min-h-screen pb-24">

      {/* Glow superior */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-fitcity-accent/30 blur-[80px]" />

      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="relative flex items-center justify-between z-10">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fitcity-energy to-orange-600 flex items-center justify-center shadow-[0_4px_16px_rgba(242,116,5,0.5)]">
            <Building2 size={22} className="text-white" />
          </div>

          <div>
            <h1 className="text-lg font-bold leading-none">
              FitCity
            </h1>

            <p className="text-[11px] text-white/50 mt-0.5">
              Sua energia constrói o futuro
            </p>
          </div>

        </div>

        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full pl-3 pr-1.5 py-1.5 shadow-lg">

          <Coins
            size={16}
            className="text-fitcity-energy"
          />

          <span className="font-bold text-sm">
            {moedas.toLocaleString('pt-BR')}
          </span>

          <button
            onClick={() => onNavigate('inventario')}
            className="ml-1 bg-gradient-to-br from-fitcity-energy to-orange-600 rounded-full p-1.5 shadow-[0_2px_10px_rgba(242,116,5,0.6)]"
          >
            <Plus
              size={14}
              className="text-white"
            />
          </button>

        </div>
      </div>

      {/* ======================================================
          MINI LOJA
      ====================================================== */}
      <div className="relative rounded-2xl p-4 bg-gradient-to-br from-orange-600 via-[#6411D9] to-[#350973] shadow-[0_10px_30px_rgba(110,11,249,0.35)] border border-white/10 z-10 overflow-hidden">

        {/* Botão abrir loja */}
        <button
          onClick={() => setModalLojaAberto(true)}
          className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-[#F27405] rounded-full py-3.5 px-4 shadow-lg border border-orange-400/30 overflow-hidden transition-transform active:scale-[0.98] mb-4"
        >

          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

          <ShoppingCart
            size={20}
            className="relative text-white"
          />

          <span className="relative font-bold text-base tracking-wide">
            ABRIR A LOJA
          </span>

        </button>

        {/* Mini pacotes */}
        <div className="grid grid-cols-3 gap-2">

          {miniPacotes.map((pacote) => (
            <button
              key={pacote.id}
              onClick={() => setModalLojaAberto(true)}
              className="flex flex-col items-center gap-1 group"
            >

              <div
                className={`
                  relative w-full aspect-[3/4]
                  rounded-lg
                  flex flex-col items-center justify-center
                  shadow-md
                  border border-white/10
                  overflow-hidden
                  transition-transform
                  group-active:scale-95
                  ${pacote.cor}
                `}
              >

                <div className="p-1.5 rounded-md bg-white/10">
                  <pacote.icone
                    size={20}
                    className="text-white"
                  />
                </div>

                <div className="absolute bottom-1 right-1 bg-black/40 backdrop-blur-sm px-1 py-0.5 rounded text-[8px] font-bold">
                  {pacote.nome}
                </div>

              </div>

            </button>
          ))}

        </div>
      </div>

      {/* ======================================================
          CIDADE CONQUISTADA
      ====================================================== */}
      <div className="relative bg-fitcity-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(100,17,217,0.35)] z-10">

        <div className="absolute inset-0 opacity-80 flex items-center justify-center">
          <MapWorldFitCity />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

        <div className="relative p-4 z-10 flex flex-col justify-between min-h-[220px]">

          <div className="flex items-start justify-between mb-2">

            <div>

              <h2 className="text-xl font-bold leading-tight drop-shadow-md">
                Sua cidade
                <br />
                conquistada
              </h2>

              <div className="mt-2 bg-orange-500/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 w-fit shadow-lg">

                <Building2
                  size={16}
                  className="text-white"
                />

                <span className="font-bold text-sm">
                  Nível {cidade.nivel}
                </span>

              </div>

            </div>

            <div className="text-right mt-1">

              <p className="text-xs text-white/80 font-medium drop-shadow-md">
                Total de cartas
              </p>

              <p className="text-lg font-bold drop-shadow-md">
                {cidade.progresso} / {cidade.meta}
              </p>

              <div className="h-1.5 w-24 rounded-full bg-white/20 mt-1 overflow-hidden ml-auto">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-fitcity-energy"
                  style={{
                    width: `${(cidade.progresso / cidade.meta) * 100}%`
                  }}
                />

              </div>

            </div>

          </div>

          <div className="grid grid-cols-3 gap-2 mt-auto">

            <div className="bg-white/10 backdrop-blur-md rounded-xl px-2 py-2 flex items-center justify-center gap-2 border border-white/5">

              <Flame
                size={14}
                className="text-orange-400"
              />

              <div className="flex flex-col">

                <span className="text-[10px] text-white/60 uppercase font-bold">
                  Kcal
                </span>

                <span className="text-xs font-bold">
                  {statusKcal}
                </span>

              </div>

            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl px-2 py-2 flex items-center justify-center gap-2 border border-white/5">

              <Clock
                size={14}
                className="text-orange-400"
              />

              <div className="flex flex-col">

                <span className="text-[10px] text-white/60 uppercase font-bold">
                  Tempo Ativo
                </span>

                <span className="text-xs font-bold">
                  {statusTempo}
                </span>

              </div>

            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl px-2 py-2 flex items-center justify-center gap-2 border border-white/5">

              <MapPin
                size={14}
                className="text-orange-400"
              />

              <div className="flex flex-col">

                <span className="text-[10px] text-white/60 uppercase font-bold">
                  Km Distância
                </span>

                <span className="text-xs font-bold">
                  {statusDistancia}
                </span>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ======================================================
          REGISTRAR ATIVIDADE
      ====================================================== */}
      <button
        onClick={onRegistrar}
        className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-3.5 font-semibold shadow-[0_10px_25px_rgba(242,116,5,0.45)] overflow-hidden z-10"
      >

        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

        <Plus
          size={18}
          className="relative"
        />

        <span className="relative">
          Registrar atividade
        </span>

      </button>

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

          const Icon =
            TIPOS_ATIVIDADE[a.tipo]?.Icon

          const cor =
            TIPOS_ATIVIDADE[a.tipo]?.cor ||
            '#F27405'

          const label =
            TIPOS_ATIVIDADE[a.tipo]?.label ||
            a.tipo

          return (
            <div
              key={a.id}
              className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-md"
            >

              <div className="flex items-center gap-3">

                <div
                  className="rounded-full p-2"
                  style={{
                    backgroundColor: `${cor}20`
                  }}
                >
                  {Icon && (
                    <Icon
                      size={18}
                      style={{ color: cor }}
                    />
                  )}
                </div>

                <div>

                  <p className="text-sm font-bold">
                    {label}
                  </p>

                  <p className="text-xs text-white/50">
                    {formatarDetalhe(a)}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-1 bg-fitcity-energy/15 rounded-full px-2 py-1">

                <span className="text-fitcity-energy font-bold text-xs">
                  +{a.moedas}
                </span>

                <Coins
                  size={12}
                  className="text-fitcity-energy"
                />

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
