// src/screens/CityScreen.jsx
import { Plus, Minus, LocateFixed, Building2, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'
import AtividadeVinculadaSheet from '../components/AtividadeVinculadaSheet'
import MapWorldActivities from '../components/MapWorldActivities'

// =============================================
// UTILITÁRIO PARA IMAGENS
// =============================================
const getImageUrl = (nome) => `/imagens/${nome}.png`

// =============================================
// MAPEAMENTO DE EDIFÍCIOS POR NÍVEL DE MOEDAS
// =============================================
//
// Nível 1: 1-5 moedas
// Nível 2: 6-10 moedas
// Nível 3: 11-20 moedas
// Nível 4: 21-30 moedas
// Nível 5: 31-50 moedas
// Nível 6: 51+ moedas
//
// =============================================
const EDIFICIOS_POR_NIVEL = {
  1: {
    edificios: [
      { nome: 'Plantação De Vegetais', raridade: 'comum' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 1',
  },
  2: {
    edificios: [
      { nome: 'Granja De Aves', raridade: 'incomum' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 2',
  },
  3: {
    edificios: [
      { nome: 'Fazenda De Vacas', raridade: 'raro' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 3',
  },
  4: {
    edificios: [
      { nome: 'Criação De Ovinos', raridade: 'epico' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 4',
  },
  5: {
    edificios: [
      { nome: 'Cooperativa Agrícola', raridade: 'lendario' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 5',
  },
  6: {
    edificios: [
      { nome: 'Centro De Comércio De Plantações', raridade: 'lendario' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 6',
  },
}

// =============================================
// CONFIGURAÇÃO DE RARIDADE PARA CORES
// =============================================
const RARIDADE_CORES = {
  comum: { cor: '#9CA3AF', bg: '#1A1A2A', border: '#9CA3AF44' },
  incomum: { cor: '#34D399', bg: '#0F2A22', border: '#34D39944' },
  raro: { cor: '#60A5FA', bg: '#1A2A4A', border: '#60A5FA44' },
  epico: { cor: '#C084FC', bg: '#2D1A4A', border: '#C084FC44' },
  lendario: { cor: '#F27405', bg: '#4A2400', border: '#F2740544' },
}

// =============================================
// FUNÇÃO PARA DETERMINAR NÍVEL BASEADO NAS MOEDAS
// =============================================
const getNivelPorMoedas = (moedas) => {
  if (moedas <= 5) return 1
  if (moedas <= 10) return 2
  if (moedas <= 20) return 3
  if (moedas <= 30) return 4
  if (moedas <= 50) return 5
  return 6
}

// =============================================
// FUNÇÃO PARA ESCOLHER EDIFÍCIO POR NÍVEL
// =============================================
const escolherEdificioPorNivel = (nivel) => {
  const config = EDIFICIOS_POR_NIVEL[nivel] || EDIFICIOS_POR_NIVEL[1]
  const edificios = config.edificios || EDIFICIOS_POR_NIVEL[1].edificios
  return edificios[Math.floor(Math.random() * edificios.length)]
}

// =============================================
// FUNÇÃO PARA CALCULAR MOEDAS (simplificada para o mock)
// =============================================
const calcularMoedasMock = (atividade) => {
  // Simula o cálculo de moedas baseado no tipo e duração
  const base = {
    'corrida': 10,
    'caminhada': 5,
    'musculacao': 8,
  }
  const tempo = atividade.tempo || 0
  const distancia = atividade.distancia || 0
  let moedas = base[atividade.tipo] || 5
  moedas += Math.floor(tempo / 10) * 2
  moedas += Math.floor(distancia / 2) * 3
  return Math.min(moedas, 100)
}

// =============================================
// FUNÇÃO PARA OBTER A CARTA DA ATIVIDADE
// =============================================
const getCartaDaAtividade = (atividade) => {
  const moedas = atividade.moedas || calcularMoedasMock(atividade)
  const nivel = getNivelPorMoedas(moedas)
  const edificio = escolherEdificioPorNivel(nivel)
  
  return {
    nome: edificio.nome,
    raridade: edificio.raridade || 'comum',
    nivel: nivel,
    moedas: moedas,
  }
}

// =============================================
// COMPONENTE DE CARD MINIATURA
// =============================================
function MiniCardAtividade({ nome, raridade, quantidade, moedas }) {
  const config = RARIDADE_CORES[raridade] || RARIDADE_CORES.comum
  
  return (
    <div 
      className="flex flex-col items-center p-2 rounded-xl bg-black/30 border transition-all hover:scale-105"
      style={{ borderColor: config.border }}
    >
      {/* Imagem do edifício */}
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, ${config.bg} 0%, #000 100%)`,
          border: `1px solid ${config.border}`
        }}
      >
        <img
          src={getImageUrl(nome)}
          alt={nome}
          loading="lazy"
          className="w-[70%] h-[70%] object-contain"
          style={{ filter: `drop-shadow(0 0 8px ${config.cor}66)` }}
          onError={(e) => { 
            e.currentTarget.style.display = 'none'
            // Fallback: mostra o nome
            const fallback = document.createElement('span')
            fallback.className = 'text-[8px] text-white/50 text-center'
            fallback.textContent = nome.substring(0, 2)
            e.currentTarget.parentNode.appendChild(fallback)
          }}
        />
      </div>
      
      {/* Nome */}
      <span className="text-[8px] text-white/70 font-medium mt-1 text-center leading-tight line-clamp-2">
        {nome}
      </span>
      
      {/* Quantidade e Moedas */}
      <div className="flex items-center gap-2 mt-0.5">
        {quantidade != null && (
          <span className="text-[8px] font-bold" style={{ color: config.cor }}>
            x{quantidade}
          </span>
        )}
        {moedas != null && (
          <span className="text-[7px] text-fitcity-energy/70 flex items-center gap-0.5">
            +{moedas} 🪙
          </span>
        )}
      </div>
    </div>
  )
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function CityScreen({ atividades = [] }) {
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null)
  const nivel = 6
  
  // ── Processa as atividades para gerar as cartas ──
  const cartasDasAtividades = useMemo(() => {
    // Filtra apenas os tipos permitidos
    const tiposPermitidos = ['corrida', 'musculacao', 'caminhada']
    const atividadesFiltradas = atividades.filter(a => 
      tiposPermitidos.includes(a.tipo)
    )

    // Mapeia cada atividade para uma carta
    const cartasMap = new Map()
    
    atividadesFiltradas.forEach(atividade => {
      const carta = getCartaDaAtividade(atividade)
      const chave = carta.nome
      
      if (cartasMap.has(chave)) {
        const existente = cartasMap.get(chave)
        existente.quantidade += 1
        // Soma as moedas (para exibir o total)
        existente.totalMoedas += carta.moedas
      } else {
        cartasMap.set(chave, {
          nome: carta.nome,
          raridade: carta.raridade,
          quantidade: 1,
          totalMoedas: carta.moedas,
          nivel: carta.nivel,
        })
      }
    })

    // Converte para array e ordena por quantidade (maior primeiro)
    return Array.from(cartasMap.values())
      .sort((a, b) => b.quantidade - a.quantidade)
  }, [atividades])

  // Total de edifícios
  const totalEdificios = useMemo(() => {
    return cartasDasAtividades.reduce((acc, c) => acc + c.quantidade, 0)
  }, [cartasDasAtividades])

  // Proxima construção (baseada na carta com maior quantidade)
  const proximaConstrucao = useMemo(() => {
    if (cartasDasAtividades.length === 0) {
      return { nome: 'Nenhuma carta', atual: 0, meta: 10 }
    }
    const carta = cartasDasAtividades.reduce((a, b) => a.quantidade > b.quantidade ? a : b)
    return {
      nome: carta.nome,
      atual: carta.quantidade,
      meta: Math.ceil(carta.quantidade / 5) * 5 + 5,
      raridade: carta.raridade,
    }
  }, [cartasDasAtividades])

  const pct = proximaConstrucao.meta > 0 
    ? Math.min((proximaConstrucao.atual / proximaConstrucao.meta) * 100, 100)
    : 0

  return (
    <div className="relative px-4 pt-6 flex flex-col gap-4 text-white">
      <div className="pointer-events-none absolute -top-10 right-0 w-64 h-64 rounded-full bg-fitcity-accent/25 blur-[80px]" />

      <div className="relative flex items-center justify-between">
        <h1 className="text-xl font-bold">Minha Cidade</h1>
        <span className="bg-white/10 backdrop-blur-xl border border-white/10 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
          Nível {nivel}
        </span>
      </div>

      {/* Mapa */}
      <div className="relative h-[60vh] rounded-2xl overflow-hidden bg-black/30 border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
        <MapWorldActivities atividades={atividades} onSelecionarAtividade={setAtividadeSelecionada} />
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {[Plus, Minus, LocateFixed].map((Icon, i) => (
            <button key={i} className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2.5 shadow-lg">
              <Icon size={16} className="text-white" />
            </button>
          ))}
        </div>
      </div>

      {/* Cartas das Atividades */}
      <div className="relative bg-fitcity-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(100,17,217,0.3)]">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm">🎴 Edifícios da Cidade</p>
          <span className="text-xs text-white/40">Total: {totalEdificios}</span>
        </div>
        
        {cartasDasAtividades.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-white/30">Nenhuma atividade registrada</p>
            <p className="text-xs text-white/20 mt-1">Complete atividades para construir sua cidade!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {cartasDasAtividades.map((carta) => (
              <MiniCardAtividade
                key={carta.nome}
                nome={carta.nome}
                raridade={carta.raridade}
                quantidade={carta.quantidade}
                moedas={carta.totalMoedas}
              />
            ))}
          </div>
        )}
      </div>

      {/* Próxima construção */}
      {/* {cartasDasAtividades.length > 0 && (
        <div className="relative flex items-center gap-3 bg-gradient-to-r from-fitcity-accent to-fitcity-energy rounded-2xl p-4 shadow-[0_10px_30px_rgba(242,116,5,0.35)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
          <div className="relative bg-white/15 backdrop-blur-md rounded-xl p-2.5">
            <Building2 size={22} className="text-white" />
          </div>
          <div className="relative flex-1">
            <p className="text-xs text-white/80">Próxima construção</p>
            <p className="font-semibold">{proximaConstrucao.nome}</p>
            <div className="h-1.5 rounded-full bg-black/30 overflow-hidden mt-2">
              <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="relative text-xs font-semibold">{proximaConstrucao.atual}/{proximaConstrucao.meta}</span>
        </div>
      )} */}

      {/* <p className="text-center text-xs text-white/40 pb-4">
        Cada atividade te aproxima de uma cidade ainda maior!
      </p>
       */}
      <AtividadeVinculadaSheet 
        atividade={atividadeSelecionada} 
        onClose={() => setAtividadeSelecionada(null)} 
      />
    </div>
  )
}