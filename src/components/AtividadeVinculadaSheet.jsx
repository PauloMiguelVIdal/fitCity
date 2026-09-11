// src/components/AtividadeVinculadaSheet.jsx
import { X } from 'lucide-react'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import { 
  formatarDetalhe, 
  calcularMoedas,
} from '../utils/atividades'
import CardFitCityActivities from './CardFitCityActivities'

// =============================================
// MAPEAMENTO DE EDIFÍCIOS POR NÍVEL DE MOEDAS
// (MESMO DO MapWorldActivities - mantido em sincronia)
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
      { nome: 'Plantação De Vegetais', setor: 'agricultura' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 1',
  },
  2: {
    edificios: [
      { nome: 'Granja De Aves', setor: 'agricultura' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 2',
  },
  3: {
    edificios: [
      { nome: 'Fazenda De Vacas', setor: 'agricultura' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 3',
  },
  4: {
    edificios: [
      { nome: 'Criação De Ovinos', setor: 'agricultura' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 4',
  },
  5: {
    edificios: [
      { nome: 'Cooperativa Agrícola', setor: 'agricultura' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 5',
  },
  6: {
    edificios: [
      { nome: 'Centro De Comércio De Plantações', setor: 'agricultura' },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 6',
  },
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
// FUNÇÃO PARA OBTER A CARTA DA ATIVIDADE
// =============================================
const getCartaDaAtividade = (atividade) => {
  const moedas = calcularMoedas(atividade)
  const nivel = getNivelPorMoedas(moedas)
  const edificio = escolherEdificioPorNivel(nivel)
  
  return {
    nome: edificio.nome,
    setor: edificio.setor,
    nivel: nivel,
    moedas: moedas,
    cor1: EDIFICIOS_POR_NIVEL[nivel]?.cor1 || '#003816',
    cor2: EDIFICIOS_POR_NIVEL[nivel]?.cor2 || '#1A5E2A',
    cor3: EDIFICIOS_POR_NIVEL[nivel]?.cor3 || '#0C9123',
    cor4: EDIFICIOS_POR_NIVEL[nivel]?.cor4 || '#4CAF50',
  }
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function AtividadeVinculadaSheet({ atividade, onClose }) {
  if (!atividade) return null
  
  const Icon = TIPOS_ATIVIDADE[atividade.tipo]?.Icon
  const data = new Date(atividade.data)
  const detalhe = formatarDetalhe(atividade)
  
  // Calcula as moedas usando o modelo
  const moedas = calcularMoedas(atividade)
  
  // Pega a carta correspondente à atividade
  const carta = getCartaDaAtividade(atividade)
  
  // Determina a raridade baseada no nível
  const mapaRaridadePorNivel = {
    1: 'comum',
    2: 'incomum',
    3: 'raro',
    4: 'epico',
    5: 'lendario',
    6: 'lendario',
  }
  const raridade = mapaRaridadePorNivel[carta.nivel] || 'comum'

  // Label do tipo de atividade
  const labelAtividade = TIPOS_ATIVIDADE[atividade.tipo]?.label || atividade.tipo

  // Formata a data e hora
  const dataFormatada = data.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
  const horaFormatada = data.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return (
    <div 
      className="fixed inset-0 z-100 flex items-end justify-center bg-black/60 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-fitcity-bg border-t border-white/10 rounded-t-3xl p-5 pb-6 flex flex-col gap-4 shadow-[0_-15px_50px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Atividade Realizada</h2>
          <button 
            onClick={onClose} 
            className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* CARD DA ATIVIDADE */}
        <div className="w-full max-w-[80%] mx-auto">
          <CardFitCityActivities
            nome={carta.nome}
            raridade={raridade}
            quantidade={1}
            cor1={carta.cor1}
            cor2={carta.cor2}
            cor3={carta.cor3}
            cor4={carta.cor4}
            IconAtividade={Icon}
            dataAtividade={atividade.data}
            detalheAtividade={detalhe}
            moedasGanhas={moedas}
          />
        </div>

        {/* INFORMAÇÕES DA ATIVIDADE - FORMATO DA IMAGEM */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          {/* Tipo da atividade */}
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} className="text-fitcity-energy" />}
            <span className="text-sm font-semibold text-white">{labelAtividade}</span>
          </div>
          
          {/* Detalhes (tempo · distância · calorias) */}
          <p className="text-xs text-white/60">
            {detalhe}
          </p>
          
          {/* Data e Moedas em linha */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-white/40">
              {dataFormatada} às {horaFormatada}
            </span>
            <span className="flex items-center gap-1 text-sm font-bold text-fitcity-energy">
              +{moedas} 🪙
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}