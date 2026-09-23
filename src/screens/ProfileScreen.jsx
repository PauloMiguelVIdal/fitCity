// src/screens/ProfileScreen.jsx
import { useState, useMemo } from 'react'
import {
  Flame,
  Clock,
  MapPin,
  Calendar,
  Trophy,
  Settings,
  Users,
  ChevronRight,
  Sparkles,
  Pencil,
  Layers,
  Star,
  Lock,
  PersonStanding,
  Newspaper,
  Award ,
} from 'lucide-react'
import { useFitCityStore } from '../store/fitCityStore'
import ModalSocial from '../components/ModalSocial'
import ModalAjustarPerfil from '../components/ModalAjustarPerfil'
import ModalConquistas from '../components/ModalConquistas'
import MelhoresMetricas from '../components/MelhoresMetricas'

// ============================================================
// HELPERS
// ============================================================
function formatarTempo(minutos) {
  const m = Math.max(0, Math.round(minutos || 0))
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}min`
  return `${h}h ${min}min`
}

function contarDiasAtivos(atividades) {
  const dias = new Set()
  atividades.forEach((a) => {
    if (!a.data) return
    dias.add(a.data.split('T')[0])
  })
  return dias.size
}

function calcularMaiorRaridade(cartas) {
  const ORDEM = { comum: 1, incomum: 2, raro: 3, epico: 4, lendario: 5 }
  let maior = null
  let maiorOrdem = 0
  Object.values(cartas || {}).forEach((item) => {
    if (!item || item.quantidade <= 0) return
    const ordem = ORDEM[item.raridade] || 0
    if (ordem > maiorOrdem) {
      maiorOrdem = ordem
      maior = item.raridade
    }
  })
  return maior
}

const RARIDADE_LABEL = {
  comum: 'Comum',
  incomum: 'Incomum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
}

const RARIDADE_COR = {
  comum: '#9CA3AF',
  incomum: '#34D399',
  raro: '#60A5FA',
  epico: '#C084FC',
  lendario: '#F27405',
}

const SETORES = ['agricultura', 'tecnologia', 'comercio', 'industria', 'imobiliario', 'energia']

const CONQUISTAS_CONFIG = [
  { id: 'km_10', label: '10km', sub: '(Corridos)', icone: Trophy },
  { id: 'tempo_5k', label: '5k', sub: '(Tempo)', icone: Trophy },
  { id: 'dias_100', label: '100 Dias', sub: '(Ativos)', icone: Trophy },
  { id: 'maratona', label: 'Maratona', sub: '(Meta)', icone: Trophy },
  { id: 'moedas_1k', label: '1.000', sub: '(Moedas)', icone: Trophy },
]

// ============================================================
// COMPONENTE
// ============================================================
export default function ProfileScreen() {
  const [modalSocial, setModalSocial] = useState(false)
  const [modalAjustar, setModalAjustar] = useState(false)
  const [modalConquistas, setModalConquistas] = useState(false)
  const [modoConfig, setModoConfig] = useState(false)

  // ─── Store ───
  const user = useFitCityStore((s) => s.user)
  const progressao = useFitCityStore((s) => s.progressao)
  const atividades = useFitCityStore((s) => s.atividades)
  const economia = useFitCityStore((s) => s.economia)
  const social = useFitCityStore((s) => s.social)
  const inventario = useFitCityStore((s) => s.inventario)
  const catalogo = useFitCityStore((s) => s.catalogo)

  // ─── Usuário ───
  const usuario = useMemo(() => {
    const nome = user?.nome || user?.username || 'Atleta'
    const nivel = progressao?.nivel || 1
    const xp = progressao?.xp || 0
    const xpProximo = progressao?.xpProximo || (nivel * 100) || 500
    const progresso = xp % xpProximo || 0
    const atleta = user?.atleta || user?.objetivo || 'Atleta'
    return { nome, nivel, progresso, meta: xpProximo, xp, atleta }
  }, [user, progressao])

  // ─── Estatísticas ───
  const stats = useMemo(() => {
    const totalKcal = atividades.reduce((acc, a) => acc + (a.calorias || 0), 0)
    const totalDuracao = atividades.reduce((acc, a) => acc + (a.duracao || 0), 0)
    const totalDistancia = atividades.reduce((acc, a) => acc + (a.distancia || 0), 0)
    const diasAtivos = contarDiasAtivos(atividades)

    return [
      { label: 'Total', valor: `${totalKcal.toLocaleString('pt-BR')} kcal`, Icon: Flame, sigla: 'kcal' },
      { label: 'Tempo ativo', valor: formatarTempo(totalDuracao), Icon: Clock, sigla: 'tempo' },
      { label: 'Distância', valor: `${totalDistancia.toFixed(1)} km`, Icon: MapPin, sigla: 'km' },
      // { label: 'Dias ativos', valor: `${diasAtivos}`,                             Icon: Calendar, sigla: 'dias'  },
    ]
  }, [atividades])

  // ─── Coleção ───
  const colecao = useMemo(() => {
    const cartasInventario = inventario?.cartas || {}
    const cartasCatalogo = catalogo?.cartas || {}

    const totalCatalogo = Object.keys(cartasCatalogo).length
    const descobertas = Object.entries(cartasInventario)
      .filter(([, item]) => item && item.quantidade > 0).length

    const possuidas = Object.values(cartasInventario)
      .reduce((acc, item) => acc + (item?.quantidade || 0), 0)

    const percentual = totalCatalogo > 0 ? (descobertas / totalCatalogo) * 100 : 0

    const setoresDescobertos = new Set()
    Object.entries(cartasInventario).forEach(([cartaId, item]) => {
      if (!item || item.quantidade <= 0) return
      const carta = cartasCatalogo[cartaId]
      if (carta?.setor) setoresDescobertos.add(carta.setor)
    })

    const maiorRaridade = calcularMaiorRaridade(cartasInventario)

    return {
      descobertas,
      possuidas,
      totalCatalogo,
      percentual,
      setoresDescobertos: setoresDescobertos.size,
      totalSetores: SETORES.length,
      maiorRaridade,
    }
  }, [inventario, catalogo])

  // ─── Conquistas (mini carrossel) ───
  const conquistas = useMemo(() => {
    const totalDistancia = atividades.reduce((acc, a) => acc + (a.distancia || 0), 0)
    const totalDuracao = atividades.reduce((acc, a) => acc + (a.duracao || 0), 0)
    const diasAtivos = contarDiasAtivos(atividades)

    const desbloqueadas = new Set()
    if (totalDistancia >= 10) desbloqueadas.add('km_10')
    if (totalDuracao >= 300) desbloqueadas.add('tempo_5k')
    if (diasAtivos >= 100) desbloqueadas.add('dias_100')
    if (totalDistancia >= 42.195) desbloqueadas.add('maratona')
    if (economia?.saldo >= 1000) desbloqueadas.add('moedas_1k')

    return CONQUISTAS_CONFIG.map((c) => ({
      ...c,
      desbloqueada: desbloqueadas.has(c.id),
    }))
  }, [atividades, economia])

  const pct = usuario.meta > 0 ? (usuario.progresso / usuario.meta) * 100 : 0
  const amigos = social?.amigos || []

  return (
    <div className="relative px-4 pt-6 flex flex-col gap-4 text-white pb-28">
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-fitcity-accent/25 blur-[80px]" />

      {/* ═══════════════════════════════════════════ */}
      {/* HEADER COMPACTO + TOGGLE MODO CONFIG */}
      {/* ═══════════════════════════════════════════ */}
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fitcity-accent to-fitcity-energy flex items-center justify-center text-lg font-bold shadow-[0_6px_20px_rgba(242,116,5,0.4)] border-2 border-white/20 shrink-0">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate leading-tight">{usuario.nome}</h1>
            <p className="text-[11px] text-white/50 leading-tight">Nível {usuario.nivel}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle Modo de Configuração */}
          {/* Botão Atleta + Editar */}
          <button
            onClick={() => setModalAjustar(true)}
            className="relative self-center flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition-colors -mt-1"
          >
            <PersonStanding size={12} className="text-fitcity-energy" />
            <span className="text-[11px] font-medium text-white/75">{usuario.atleta}</span>
            <Pencil size={10} className="text-fitcity-energy" />
          </button>

          {/* Settings */}
          <button className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-md">
            <Settings size={16} className="text-white/70" />
          </button>
        </div>
      </div>


      {/* Barra de progresso */}
      <div className="relative w-full h-1.5 rounded-full bg-black/40 overflow-hidden -mt-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fitcity-energy to-orange-300 shadow-[0_0_8px_rgba(242,116,5,0.7)] transition-all duration-500"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>



      {/* ═══════════════════════════════════════════ */}
      {/* ESTATÍSTICAS — PILLS */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, valor, Icon, sigla }, i) => (
          <div
            key={`${sigla}-${i}`}
            className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-3 flex items-center gap-3 shadow-lg"
          >
            <div className="bg-fitcity-energy/15 rounded-full p-2.5 shrink-0">
              <Icon size={16} className="text-fitcity-energy" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold text-white/45 uppercase tracking-wider">
                {sigla}
              </p>
              <p className="font-bold text-sm leading-tight truncate mt-0.5">{valor}</p>
              <p className="text-[10px] text-white/45 truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* CONQUISTAS — CÍRCULOS */}
      {/* ═══════════════════════════════════════════ */}

      {/* ═══════════════════════════════════════════ */}
      {/* MELHORES MÉTRICAS */}
      {/* ═══════════════════════════════════════════ */}
      <MelhoresMetricas onClick={() => { /* futuramente: tela detalhada */ }} />

      {/* ═══════════════════════════════════════════ */}
      {/* MINHA COLEÇÃO */}
      {/* ═══════════════════════════════════════════ */}
      <button
        onClick={() => { }}
        className="relative w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-left shadow-[0_10px_30px_rgba(100,17,217,0.2)] overflow-hidden transition-all hover:bg-white/[0.06] active:scale-[0.99]"
      >
        <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-500/15 blur-[60px]" />

        <div className="relative flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500/20 rounded-lg p-1.5">
              <Layers size={13} className="text-purple-300" />
            </div>
            <p className="font-bold text-sm">Minha Coleção</p>
          </div>
          <ChevronRight size={15} className="text-white/40" />
        </div>

        <div className="relative grid grid-cols-3 gap-2 mb-3">
          <div>
            <p className="text-2xl font-black text-white leading-none">
              {colecao.descobertas}
              <span className="text-sm font-bold text-white/40">/{colecao.totalCatalogo}</span>
            </p>
            <p className="text-[9px] text-white/50 uppercase tracking-wider mt-1.5">
              Descobertas
            </p>
          </div>
          <div>
            <p className="text-2xl font-black text-white leading-none">{colecao.possuidas}</p>
            <p className="text-[9px] text-white/50 uppercase tracking-wider mt-1.5">
              Cartas
            </p>
          </div>
          <div>
            <p className="text-2xl font-black text-white leading-none">
              {colecao.setoresDescobertos}
              <span className="text-sm font-bold text-white/40">/{colecao.totalSetores}</span>
            </p>
            <p className="text-[9px] text-white/50 uppercase tracking-wider mt-1.5">
              Setores
            </p>
          </div>
        </div>

        <div className="relative mb-2">
          <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fitcity-energy transition-all duration-500"
              style={{ width: `${Math.min(100, colecao.percentual)}%` }}
            />
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin size={11} className="text-fitcity-energy/70" />
            <span className="text-[10px] text-white/60">
              <b className="text-white/80">{colecao.setoresDescobertos}</b>/{colecao.totalSetores} setores
            </span>
          </div>

          {colecao.maiorRaridade ? (
            <div className="flex items-center gap-1.5">
              <Star size={11} style={{ color: RARIDADE_COR[colecao.maiorRaridade] }} />
              <span className="text-[10px] text-white/60">
                Maior:
                <b className="ml-1" style={{ color: RARIDADE_COR[colecao.maiorRaridade] }}>
                  {RARIDADE_LABEL[colecao.maiorRaridade]}
                </b>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Lock size={11} className="text-white/30" />
              <span className="text-[10px] text-white/40">Nenhuma carta ainda</span>
            </div>
          )}
        </div>
      </button>

      {/* ═══════════════════════════════════════════ */}
      {/* SOCIAL */}

      <div className="flex flex-col gap-3 mt-1 relative w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-left shadow-[0_10px_30px_rgba(100,17,217,0.2)] overflow-hidden ">
        <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
          SOCIAL
        </p>

        <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 min-w-max pb-1">
            <button
              onClick={() => setModalAjustar(true)}
              className="flex flex-col items-center gap-1 w-[58px] shrink-0"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fitcity-accent to-fitcity-energy flex items-center justify-center text-lg font-bold border-2 border-white/20">
                  {usuario.nome.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-fitcity-bg" />
              </div>
              <p className="text-[10px] font-bold text-white/85 truncate w-full text-center">
                {usuario.nome.split(' ')[0]}
              </p>
              <p className="text-[8px] text-white/40 truncate w-full text-center -mt-1">
                User
              </p>
            </button>

            {amigos.slice(0, 10).map((amigo) => (
              <button
                key={amigo.id}
                onClick={() => { }}
                className="flex flex-col items-center gap-1 w-[58px] shrink-0"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-fitcity-energy flex items-center justify-center text-lg font-bold border-2 border-white/20 overflow-hidden">
                    {amigo.avatarUrl ? (
                      <img src={amigo.avatarUrl} alt={amigo.nome} className="w-full h-full object-cover" />
                    ) : (
                      (amigo.nome || 'A').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-fitcity-bg" />
                </div>
                <p className="text-[10px] font-bold text-white/85 truncate w-full text-center">
                  {(amigo.nome || 'Amigo').split(' ')[0]}
                </p>
                <p className="text-[8px] text-white/40 truncate w-full text-center -mt-1">
                  {amigo.username || `Nv ${amigo.nivel || 1}`}
                </p>
              </button>
            ))}

            {amigos.length === 0 && (
              <div className="flex items-center text-[10px] text-white/40 px-3">
                Adicione amigos para vê-los aqui
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setModalSocial(true)}
          className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 hover:bg-white/[0.07] transition-colors text-left"
        >
          <div className="bg-fitcity-energy/15 rounded-lg p-2 shrink-0">
            <Users size={16} className="text-fitcity-energy" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Amigos</p>
            <p className="text-[10px] text-white/50 truncate">
              {amigos.length} {amigos.length === 1 ? 'amigo' : 'amigos'}
              {social?.solicitacoesRecebidas?.length > 0 &&
                ` · ${social.solicitacoesRecebidas.length} ${social.solicitacoesRecebidas.length === 1 ? 'solicitação' : 'solicitações'}`}
            </p>
          </div>
          <ChevronRight size={16} className="text-white/40 shrink-0" />
        </button>

        <button
          onClick={() => { }}
          className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 hover:bg-white/[0.07] transition-colors text-left"
        >
          <div className="bg-fitcity-energy/15 rounded-lg p-2 shrink-0">
            <Newspaper size={16} className="text-fitcity-energy" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Feed</p>
            <p className="text-[10px] text-white/50 truncate">
              Atividades dos seus amigos
            </p>
          </div>
          <ChevronRight size={16} className="text-white/40 shrink-0" />
        </button>
      </div>

      <button
         onClick={() => setModalConquistas(true)}
        className="relative w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-left shadow-[0_10px_30px_rgba(100,17,217,0.2)] overflow-hidden transition-all hover:bg-white/[0.06] active:scale-[0.99]"
      >
        <div className="flex items-center justify-between mt-1">

          <div className="relative flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-purple-500/20 rounded-lg p-1.5">
                <Award size={13} className="text-purple-300" />
              </div>
              <p className="font-bold text-sm">Conquistas</p>
            </div>

          </div>
          <button
           
            className="text-white/40 flex items-center gap-1 hover:text-white/70 transition-colors"
          >
            <span className="text-[10px]">Ver todas</span>
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 min-w-max pb-1">
            {conquistas.map((c) => (
              <div key={c.id} className="flex flex-col items-center gap-1.5 w-[68px]">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${c.desbloqueada
                    ? 'bg-gradient-to-br from-[#F27405] to-[#D95D00] shadow-[0_6px_20px_rgba(242,116,5,0.45)]'
                    : 'bg-white/5 border border-white/10'
                    }`}
                >
                  <Trophy
                    size={26}
                    className={c.desbloqueada ? 'text-white' : 'text-white/20'}
                    strokeWidth={2}
                  />
                </div>
                <p className={`text-[11px] font-bold text-center leading-tight ${c.desbloqueada ? 'text-white' : 'text-white/40'
                  }`}>
                  {c.label}
                </p>
                <p className={`text-[9px] text-center leading-tight -mt-1 ${c.desbloqueada ? 'text-white/60' : 'text-white/30'
                  }`}>
                  {c.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </button>
      {/* ═══════════════════════════════════════════ */}
      {/* MODAIS */}
      {/* ═══════════════════════════════════════════ */}
      {modalSocial && <ModalSocial onClose={() => setModalSocial(false)} />}
      {modalAjustar && <ModalAjustarPerfil onClose={() => setModalAjustar(false)} />}
      {modalConquistas && <ModalConquistas onClose={() => setModalConquistas(false)} />}
    </div>
  )
}