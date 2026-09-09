// src/screens/InventoryScreen.jsx
import { useState, useMemo } from 'react'
import CardFitCity from '../components/CardFitCity'
import MapWorldFitCity from '../components/MapWorldCity'

const getImageUrl = (nome) => `/outrasImagens/setores/${nome}.png`

// =============================================
// DADOS DAS CARTAS (mock)
// =============================================
const CARTAS_FITCITY = [
  // Agricultura e recursos
  { nome: "Terreno De Mineração", raridade: "comum", qtd: 1 },
  { nome: "Pátio De Mineração", raridade: "comum", qtd: 1 },
  { nome: "Pomares", raridade: "comum", qtd: 1 },
  { nome: "Depósito De Resíduos Orgânicos", raridade: "comum", qtd: 2 },
  { nome: "Plantação De Grãos", raridade: "incomum", qtd: 5 },
  { nome: "Serraria", raridade: "incomum", qtd: 2 },
  { nome: "Plantação De Eucalipto", raridade: "incomum", qtd: 3 },
  { nome: "Cooperativa Agrícola", raridade: "epico", qtd: 2 },
  { nome: "Centro De Comércio De Plantações", raridade: "raro", qtd: 1 },
  { nome: "Área Florestal", raridade: "comum", qtd: 1 },
  
  // Energia
  { nome: "Subestação De Energia", raridade: "comum", qtd: 1 },
  { nome: "Campo De Estocagem", raridade: "comum", qtd: 1 },
  { nome: "Silo", raridade: "comum", qtd: 3 },
  
  // Indústria
  { nome: "Fazenda De Vacas", raridade: "incomum", qtd: 3 },
  { nome: "Granja De Aves", raridade: "incomum", qtd: 2 },
  { nome: "Fábrica De Rações", raridade: "incomum", qtd: 1 },
  { nome: "Fábrica De Papel", raridade: "incomum", qtd: 1 },
  { nome: "Fábrica De Pães", raridade: "incomum", qtd: 1 },
  { nome: "Container Modular", raridade: "comum", qtd: 2 },
  { nome: "Pátio De Veículos", raridade: "comum", qtd: 1 },
  { nome: "Fábrica De Calçados", raridade: "incomum", qtd: 1 },
  { nome: "Fábrica De Bebidas", raridade: "incomum", qtd: 1 },
  { nome: "Laboratório Farmacêutico", raridade: "raro", qtd: 1 },
  { nome: "Fábrica De Motores", raridade: "lendario", qtd: 1 },
  { nome: "Fábrica De Robôs", raridade: "lendario", qtd: 1 },
  { nome: "Usina Siderúrgica", raridade: "epico", qtd: 1 },
  { nome: "Fábrica De Ligas Metálicas", raridade: "epico", qtd: 1 },
  { nome: "Fábrica De Peças Automotivas", raridade: "epico", qtd: 1 },
  { nome: "Fábrica De Smartphones", raridade: "epico", qtd: 2 },
  { nome: "Empresa De Automação Industrial", raridade: "epico", qtd: 1 },
  
  // Tecnologia
  { nome: "Startup", raridade: "comum", qtd: 1 },
  { nome: "Servidor Em Nuvem", raridade: "raro", qtd: 1 },
  { nome: "Empresa De Desenvolvimento De Software", raridade: "raro", qtd: 1 },
  { nome: "Centro De Pesquisa Em Fusão Nuclear", raridade: "epico", qtd: 1 },
  { nome: "Centro De Pesquisa Aeroespacial", raridade: "epico", qtd: 1 },
  
  // Comércio
  { nome: "Feira", raridade: "comum", qtd: 1 },
  { nome: "Loja De Móveis", raridade: "comum", qtd: 1 },
  { nome: "Farmácia", raridade: "comum", qtd: 2 },
  { nome: "Câmara Fria", raridade: "comum", qtd: 2 },
  { nome: "Mercado", raridade: "comum", qtd: 3 },
  { nome: "Loja De Calçados", raridade: "comum", qtd: 2 },
  { nome: "Posto De Combustíveis", raridade: "comum", qtd: 1 },
  { nome: "Centro De Distribuição", raridade: "raro", qtd: 2 },
  { nome: "Concessionária De Veículos", raridade: "raro", qtd: 1 },
  { nome: "Transporte Petrolífero", raridade: "epico", qtd: 1 },
  { nome: "Shopping Popular", raridade: "lendario", qtd: 2 },
  { nome: "Shopping Center", raridade: "lendario", qtd: 1 },
  { nome: "Mega Mercado", raridade: "epico", qtd: 1 },
  
  // Imobiliário
  { nome: "Construtora De Pequenas Obras", raridade: "comum", qtd: 1 },
  { nome: "Cartório E Licenças", raridade: "comum", qtd: 1 },
  { nome: "Escritório De Arquitetura", raridade: "comum", qtd: 1 },
  { nome: "Consultoria Em Engenharia Civil", raridade: "comum", qtd: 1 },
  { nome: "Escritório De Design De Interiores", raridade: "comum", qtd: 1 },
  { nome: "Construtora", raridade: "raro", qtd: 2 },
  { nome: "Imobiliária Residencial", raridade: "raro", qtd: 1 },
  { nome: "Imobiliária Comercial", raridade: "raro", qtd: 1 },
  { nome: "Construtora De Infraestruturas", raridade: "lendario", qtd: 1 },
  
  // Recursos e logística
  { nome: "Hangar", raridade: "comum", qtd: 1 },
  { nome: "Mineradora", raridade: "raro", qtd: 1 },
  { nome: "Plataforma De Petróleo", raridade: "lendario", qtd: 1 },
  { nome: "Centro De Coleta De Biomassa", raridade: "raro", qtd: 1 },
  { nome: "Tanque De Armazenamento De Fluidos", raridade: "comum", qtd: 1 },
  { nome: "Estação De Carregamento", raridade: "comum", qtd: 1 },
  { nome: "Centro De Pesquisa Energética", raridade: "raro", qtd: 1 },
  { nome: "Empresa De Comércio Energético", raridade: "raro", qtd: 1 },
  { nome: "Usina De Biomassa", raridade: "epico", qtd: 1 },
  // { nome: "Usina Solar", raridade: "comum", qtd: 1 },
  { nome: "Parque Eólico", raridade: "comum", qtd: 1 },
  { nome: "Fábrica De Turbinas Eólicas", raridade: "comum", qtd: 1 },
  { nome: "Usina Hidrelétrica", raridade: "lendario", qtd: 1 },
  { nome: "Usina Termelétrica A Biocombustíveis", raridade: "raro", qtd: 1 },
  { nome: "Usina Termelétrica", raridade: "raro", qtd: 1 },
  { nome: "Reator Nuclear Convencional", raridade: "lendario", qtd: 1 },
  { nome: "Usina De Fusão Nuclear", raridade: "lendario", qtd: 1 },
  
  // Transporte
  { nome: "Aeroporto", raridade: "lendario", qtd: 1 },
  { nome: "Porto", raridade: "lendario", qtd: 1 },
  { nome: "Estaleiro", raridade: "epico", qtd: 1 },
  { nome: "Fábrica De Aeronaves", raridade: "lendario", qtd: 1 },
  { nome: "Fábrica De Foguetes", raridade: "lendario", qtd: 1 },
  { nome: "Armazém De Materiais Sensíveis", raridade: "comum", qtd: 1 },
  
  // Outros
  { nome: "Criação De Ovinos", raridade: "incomum", qtd: 2 },
  { nome: "Prédio De Alto Padrão", raridade: "epico", qtd: 2 },
  { nome: "Armazém", raridade: "comum", qtd: 4 }
]
// =============================================
// MAPEAMENTO DE SETOR (6 setores)
// =============================================
const mapaSetor = {
  // Agricultura
  "Plantação De Grãos": "agricultura",
  "Plantação De Vegetais": "agricultura",
  "Fazenda Administrativa": "agricultura",
  "Pomares": "agricultura",
  "Cooperativa Agrícola": "agricultura",
  "Centro De Comércio De Plantações": "agricultura",
  "Fazenda De Vacas": "agricultura",
  "Granja De Aves": "agricultura",
  "Criação De Ovinos": "agricultura",
  "Armazém": "agricultura",
  "Silo": "agricultura",
  "Depósito De Resíduos Orgânicos": "agricultura",
  "Serraria": "agricultura",
  "Área Florestal": "agricultura",
  "Terreno De Mineração": "agricultura",
  "Plantação De Eucalipto": "agricultura",
  "Plantação De Plantas Medicinais": "agricultura",
  "Campo De Estocagem": "agricultura",
  "Pátio De Mineração": "agricultura",
  

  // Indústria
  "Fábrica De Móveis": "industria",
  "Fábrica De Rações": "industria",
  "Fábrica De Embalagens": "industria",
  "Fábrica De Fertilizantes": "industria",
  "Fábrica De Bebidas": "industria",
  "Fábrica De Pães": "industria",
  "Fábrica Têxtil": "industria",
  "Fábrica De Calçados": "industria",
  "Fábrica De Roupas": "industria",
  "Fábrica De Celulose": "industria",
  "Fábrica De Papel": "industria",
  "Fábrica De Livros": "industria",
  "Fábrica De Medicamentos": "industria",
  "Laboratório Farmacêutico": "industria",
  "Fábrica De Plásticos": "industria",
  "Fábrica De Químicos Especializados": "industria",
  "Alto-Forno": "industria",
  "Usina Siderúrgica": "industria",
  "Fundição De Alumínio": "industria",
  "Fábrica De Ligas Metálicas": "industria",
  "Indústria De Componentes Mecânicos": "industria",
  "Fábrica De Chapas Metálicas": "industria",
  "Fábrica De Estruturas Metálicas": "industria",
  "Fábrica De Peças Automotivas": "industria",
  "Montadora De Veículos Elétricos": "industria",
  "Fábrica De Automóveis": "industria",
  "Refinaria De Biocombustíveis": "industria",
  "Refinaria": "industria",
  "Biofábrica": "industria",
  "Fábrica De Chips": "industria",
  "Fábrica De Placas Eletrônicas": "industria",
  "Fábrica De Semicondutores": "industria",
  "Fábrica De Eletrônicos": "industria",
  "Fábrica De Robôs": "industria",
  "Empresa De Automação Industrial": "industria",
  "Fábrica De Motores": "industria",
  "Fábrica De Foguetes": "industria",
  "Fábrica De Aeronaves": "industria",
  "Estaleiro": "industria",
 "Container Modular": "industria",
 "Pátio De Veículos": "industria",


  // Tecnologia
  "Startup": "tecnologia",
  "Servidor Em Nuvem": "tecnologia",
  "Data Center": "tecnologia",
  "Empresa De Desenvolvimento De Software": "tecnologia",
  "Empresa De Jogos Digitais": "tecnologia",
  "Empresa De Telecomunicações": "tecnologia",
  "Plataforma De Redes Sociais": "tecnologia",
  "Marketplace Online": "tecnologia",
  "Plataforma De Streaming": "tecnologia",
  "Fábrica De Smartphones": "tecnologia",
  "Fábrica De Computadores": "tecnologia",
  "Fábrica De Consoles De Jogos": "tecnologia",
  "Fábrica De Dispositivos Vestíveis": "tecnologia",
  "Instituto De Tecnologia Alimentar": "tecnologia",
  "Centro De Pesquisa Agrícola": "tecnologia",
  "Instituto De Biotecnologia": "tecnologia",
  "Laboratório De Nanotecnologia": "tecnologia",
  "Centro De Pesquisa Em Eletrônicos": "tecnologia",
  "Laboratório De Design De Produtos": "tecnologia",
  "Centro De Pesquisa Química": "tecnologia",
  "Centro De Pesquisa Em Fusão Nuclear": "tecnologia",
  "Laboratório De Novos Combustíveis": "tecnologia",
  "Centro De Pesquisa Aeroespacial": "tecnologia",
  "Centro De Engenharia Avançada": "tecnologia",
  "Centro De Pesquisa Em Materiais": "tecnologia",
  "Centro De Pesquisa Em Robótica": "tecnologia",
  "Centro De Pesquisa Em IA": "tecnologia",

  // Comércio
  "Feira": "comercio",
  "Loja De Móveis": "comercio",
  "Restaurante": "comercio",
  "Livraria": "comercio",
  "Mercado": "comercio",
  "Adega": "comercio",
  "Câmara Fria": "comercio",
  "Padaria": "comercio",
  "Açougue": "comercio",
  "Loja De Conveniência": "comercio",
  "Posto De Combustíveis": "comercio",
  "Rede De Fast-Food": "comercio",
  "Petshop": "comercio",
  "Farmácia": "comercio",
  "Cafeteria": "comercio",
  "Loja De Departamentos": "comercio",
  "Loja De Calçados": "comercio",
  "Loja De Vestuário": "comercio",
  "Loja De Gadgets E Wearables": "comercio",
  "Loja De Games": "comercio",
  "Loja De Celulares": "comercio",
  "Loja De Informática": "comercio",
  "Loja De Eletrônicos": "comercio",
  "Joalheria": "comercio",
  "Concessionária De Veículos": "comercio",
  "Shopping Popular": "comercio",
  "Shopping Center": "comercio",
  "Centro De Transporte E Entrega": "comercio",
  "Centro De Distribuição": "comercio",
  "Armazém Logístico": "comercio",
  "Transporte Petrolífero": "comercio",

  // Imobiliário
  "Cartório E Licenças": "imobiliario",
  "Terraplanagem E Pavimentação": "imobiliario",
  "Construtora De Pequenas Obras": "imobiliario",
  "Escritório De Design De Interiores": "imobiliario",
  "Escritório De Arquitetura": "imobiliario",
  "Consultoria Em Engenharia Civil": "imobiliario",
  "Construtora": "imobiliario",
  "Imobiliária Residencial": "imobiliario",
  "Imobiliária Comercial": "imobiliario",
  "Construtora De Infraestruturas": "imobiliario",
  "Aeroporto": "imobiliario",
  "Porto": "imobiliario",
  "Mineradora": "imobiliario",
  "Mineradora Radioativa": "imobiliario",
  "Mineradora De Pedras Preciosas": "imobiliario",
  "Mega Mercado": "imobiliario",
  "Prédio De Alto Padrão": "imobiliario",
  "Centro De Coleta De Biomassa": "imobiliario",
  "Tanque De Armazenamento De Fluidos":"imobiliario",
  "Plataforma De Petróleo": "imobiliario",
  "Hangar": "imobiliario",
 

  // Energia
  "Subestação De Energia": "energia",
  "Rede De Distribuição Elétrica": "energia",
  // "Usina Solar": "energia",
  "Fábrica De Turbinas Eólicas": "energia",
  // "Fábrica De Painéis Solares": "energia",
  "Fábrica De Baterias": "energia",
  "Empresa De Comércio Energético": "energia",
  "Empresa De Consultoria Energética": "energia",
  "Estação De Carregamento": "energia",
  "Centro De Pesquisa Em Energias Renováveis": "energia",
  "Centro De Pesquisa Energética": "energia",
  "Centro De Reciclagem De Baterias": "energia",
  "Usina Termelétrica A Biocombustíveis": "energia",
  "Armazém De Materiais Sensíveis": "energia",
  "Usina De Biomassa": "energia",
  "Usina Hidrelétrica": "energia",
  "Parque Eólico": "energia",
  "Usina Termelétrica": "energia",
  "Reator Nuclear Convencional": "energia",
  "Usina De Fusão Nuclear": "energia",
}

// =============================================
// CONFIGURAÇÃO DOS SETORES COM CORES
// =============================================
const SETORES_CONFIG = {
  agricultura: { 
    id: "agricultura", 
    label: "Agricultura", 
    cor1: "#003816", 
    cor2: "#1A5E2A", 
    cor3: "#0C9123", 
    cor4: "#4CAF50" 
  },
  tecnologia: { 
    id: "tecnologia", 
    label: "Tecnologia", 
    cor1: "#A64B00", 
    cor2: "#D45A00", 
    cor3: "#FF6F00", 
    cor4: "#FF8C42" 
  },
  industria: { 
    id: "industria", 
    label: "Indústria", 
    cor1: "#1A1A1A", 
    cor2: "#4D4D4D", 
    cor3: "#808080", 
    cor4: "#B3B3B3" 
  },
  comercio: { 
    id: "comercio", 
    label: "Comércio", 
    cor1: "#660000", 
    cor2: "#A31919", 
    cor3: "#E60000", 
    cor4: "#FF4D4D" 
  },
  imobiliario: { 
    id: "imobiliario", 
    label: "Imobiliário", 
    cor1: "#000066", 
    cor2: "#1A1A8C", 
    cor3: "#3333CC", 
    cor4: "#6666FF" 
  },
  energia: { 
    id: "energia", 
    label: "Energia", 
    cor1: "#665200", 
    cor2: "#A37F19", 
    cor3: "#E6B800", 
    cor4: "#FFD966" 
  },
  outros: { 
    id: "outros", 
    label: "📦", 
    cor1: "#1A1A1A", 
    cor2: "#4D4D4D", 
    cor3: "#808080", 
    cor4: "#B3B3B3" 
  },
}

// =============================================
// FUNÇÃO GET SETOR
// =============================================
const getSetor = (nome) => {
  return mapaSetor[nome] || "outros"
}

// =============================================
// FILTROS
// =============================================
const FILTROS_RARIDADE = ['todas', 'comum', 'incomum', 'raro', 'epico', 'lendario']
const FILTROS_RANK = ['todos', 'S', 'A', 'B', 'C']
const FILTROS_SETOR = ['todos', 'agricultura', 'industria', 'tecnologia', 'comercio', 'imobiliario', 'energia']

// =============================================
// FUNÇÃO GET RANK
// =============================================
const getRank = (nome) => {
  const RankS = [
    "Usina Hidrelétrica", "Reator Nuclear Convencional", "Usina De Fusão Nuclear",
    "Shopping Popular", "Shopping Center", "Fábrica De Computadores",
    "Construtora De Infraestruturas", "Aeroporto", "Porto", "Mineradora Radioativa",
    "Plataforma De Petróleo", "Montadora De Veículos Elétricos", "Fábrica De Automóveis",
    "Refinaria", "Fábrica De Chips", "Fábrica De Semicondutores", "Fábrica De Robôs",
    "Fábrica De Motores", "Fábrica De Foguetes", "Fábrica De Aeronaves"
  ]

  const RankA = [
    "Cooperativa Agrícola", "Usina De Biomassa", "Transporte Petrolífero",
    "Marketplace Online", "Plataforma De Streaming", "Fábrica De Smartphones",
    "Fábrica De Consoles De Jogos", "Fábrica De Dispositivos Vestíveis",
    "Centro De Pesquisa Em Fusão Nuclear", "Centro De Pesquisa Aeroespacial",
    "Centro De Engenharia Avançada", "Centro De Pesquisa Em Materiais",
    "Centro De Pesquisa Em IA", "Mineradora De Pedras Preciosas", "Mega Mercado",
    "Prédio De Alto Padrão", "Tanque De Armazenamento Biocombustível", 
    "Fábrica De Químicos Especializados", "Alto-Forno", "Usina Siderúrgica",
    "Fundição De Alumínio", "Fábrica De Ligas Metálicas", "Fábrica De Peças Automotivas",
    "Refinaria De Biocombustíveis", "Biofábrica", "Fábrica De Eletrônicos",
    "Empresa De Automação Industrial", "Estaleiro"
  ]

  const RankB = [
    "Centro De Comércio De Plantações", "Empresa De Comércio Energético",
    "Empresa De Consultoria Energética", "Centro De Pesquisa Em Energias Renováveis",
    "Centro De Pesquisa Energética", "Usina Termelétrica A Biocombustíveis", 
    "Usina Termelétrica", "Joalheria", "Concessionária De Veículos",
    "Centro De Distribuição", "Armazém Logístico", "Servidor Em Nuvem", "Data Center",
    "Empresa De Desenvolvimento De Software", "Empresa De Jogos Digitais",
    "Empresa De Telecomunicações", "Plataforma De Redes Sociais",
    "Instituto De Tecnologia Alimentar", "Centro De Pesquisa Agrícola",
    "Instituto De Biotecnologia", "Laboratório De Nanotecnologia",
    "Centro De Pesquisa Em Eletrônicos", "Laboratório De Design De Produtos",
    "Laboratório De Novos Combustíveis", "Centro De Engenharia Avançada",
    "Centro De Pesquisa Em Robótica", "Construtora", "Imobiliária Residencial",
    "Imobiliária Comercial", "Mineradora", "Centro De Coleta De Biomassa",
    "Fábrica De Fertilizantes", "Fábrica De Medicamentos", "Laboratório Farmacêutico",
    "Fábrica De Plásticos", "Indústria De Componentes Mecânicos",
    "Fábrica De Chapas Metálicas", "Fábrica De Estruturas Metálicas",
    "Fábrica De Placas Eletrônicas",
  ]

  if (RankS.includes(nome)) return 'S'
  if (RankA.includes(nome)) return 'A'
  if (RankB.includes(nome)) return 'B'
  return 'C'
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function InventoryScreen() {
  const [aba, setAba] = useState('cartas')
  const [filtroRaridade, setFiltroRaridade] = useState('todas')
  const [filtroRank, setFiltroRank] = useState('todos')
  const [filtroSetor, setFiltroSetor] = useState('todos')

  // =============================================
  // PROCESSAMENTO DOS DADOS
  // =============================================
  const cartasProcessadas = useMemo(() => {
    return CARTAS_FITCITY.map(carta => ({
      ...carta,
      rank: getRank(carta.nome),
      setor: getSetor(carta.nome),
    }))
  }, [])

  // =============================================
  // FILTROS
  // =============================================
  const cartasFiltradas = useMemo(() => {
    let filtradas = cartasProcessadas
    
    // Filtro por raridade
    if (filtroRaridade !== 'todas') {
      filtradas = filtradas.filter(c => c.raridade === filtroRaridade)
    }
    
    // Filtro por rank
    if (filtroRank !== 'todos') {
      filtradas = filtradas.filter(c => c.rank === filtroRank)
    }
    
    // Filtro por setor
    if (filtroSetor !== 'todos') {
      filtradas = filtradas.filter(c => c.setor === filtroSetor)
    }
    
    // Ordenação: primeiro por setor, depois por rank, depois por nome
    const ordemSetor = { 'agricultura': 0, 'industria': 1, 'tecnologia': 2, 'comercio': 3, 'imobiliario': 4, 'energia': 5, 'outros': 6 }
    const ordemRank = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 }
    filtradas.sort((a, b) => {
      if (ordemSetor[a.setor] !== ordemSetor[b.setor]) {
        return ordemSetor[a.setor] - ordemSetor[b.setor]
      }
      if (ordemRank[a.rank] !== ordemRank[b.rank]) {
        return ordemRank[a.rank] - ordemRank[b.rank]
      }
      return a.nome.localeCompare(b.nome)
    })
    
    return filtradas
  }, [cartasProcessadas, filtroRaridade, filtroRank, filtroSetor])

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className="relative px-4 pt-6 flex flex-col gap-4 text-white min-h-screen">
      <div className="pointer-events-none absolute -top-10 left-0 w-64 h-64 rounded-full bg-fuchsia-500/20 blur-[80px]" />

      <h1 className="relative text-xl font-bold">Inventário</h1>
            <div className="relative h-[60vh] rounded-2xl overflow-hidden bg-black/30 border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">

          <MapWorldFitCity/>
</div>
      {/* Abas */}
      <div className="relative flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-inner">
        {['cartas', 'pacotes'].map(id => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition ${
              aba === id 
                ? 'bg-gradient-to-r from-fitcity-energy to-orange-600 shadow-[0_4px_14px_rgba(242,116,5,0.5)]' 
                : 'text-white/50'
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      {aba === 'cartas' && (
        <>
          {/* Filtro de Raridade */}
          <div className="relative flex gap-2 overflow-x-auto pb-1">
            {FILTROS_RARIDADE.map(f => (
              <button
                key={f}
                onClick={() => setFiltroRaridade(f)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap capitalize border transition ${
                  filtroRaridade === f
                    ? 'bg-gradient-to-r from-fitcity-energy to-orange-600 border-transparent shadow-[0_2px_10px_rgba(242,116,5,0.45)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Filtro de Rank */}
          {/* <div className="relative flex gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-white/40 font-bold uppercase tracking-wider mr-1">Rank:</span>
            {FILTROS_RANK.map(r => (
              <button
                key={r}
                onClick={() => setFiltroRank(r)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                  filtroRank === r
                    ? r === 'S' ? 'bg-gradient-to-r from-yellow-500 to-yellow-300 text-black shadow-[0_2px_10px_rgba(255,215,0,0.5)]'
                      : r === 'A' ? 'bg-gradient-to-r from-purple-500 to-purple-300 text-white shadow-[0_2px_10px_rgba(168,85,247,0.5)]'
                      : r === 'B' ? 'bg-gradient-to-r from-blue-500 to-blue-300 text-white shadow-[0_2px_10px_rgba(59,130,246,0.5)]'
                      : r === 'C' ? 'bg-gradient-to-r from-gray-500 to-gray-300 text-white shadow-[0_2px_10px_rgba(156,163,175,0.5)]'
                      : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                    : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                }`}
              >
                {r === 'todos' ? 'Todos' : r}
              </button>
            ))}
          </div> */}

          {/* Filtro de Setor (6 setores) */}

          <div className="relative flex gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-white/40 font-bold uppercase tracking-wider mr-1">Setor:</span>
            {FILTROS_SETOR.map(s => {
              const config = SETORES_CONFIG[s] || SETORES_CONFIG.outros
              const corAtiva = s === 'todos' ? '#F27405' : config.cor4
              return (
                <button
                  key={s}
                  onClick={() => setFiltroSetor(s)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                    filtroSetor === s
                      ? 'text-white shadow-[0_2px_10px_rgba(242,116,5,0.45)]'
                      : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                  }`}
                  style={filtroSetor === s ? { background: corAtiva } : {}}
                >
                
                  {config.label !== '📦' ? (
          <img
            src={getImageUrl(config.id)}
            alt={config.label}
          />
        ) : (
          <span>{config.label}</span>
        )}
                </button>
              )
            })}
          </div>
          {/* Grid de Cartas */}
          <div className="grid grid-cols-3 gap-3 pb-4">
            {cartasFiltradas.map(({ nome, raridade, qtd, rank, setor }) => {
              // Pega a configuração do setor
              const config = SETORES_CONFIG[setor] || SETORES_CONFIG.outros
              
              return (
                <CardFitCity
                  key={nome}
                  nome={nome}
                  raridade={raridade}
                  quantidade={qtd}
                  // Usa as cores do setor
                  cor1={config.cor1}
                  cor2={config.cor2}
                  cor3={config.cor3}
                  cor4={config.cor4}
                  setorLabel={config.label}
                />
              )
            })}
          </div>

          {/* Contador */}
          {/* <div className="text-center text-white/30 text-xs py-2">
            {cartasFiltradas.length} edifício{cartasFiltradas.length !== 1 ? 's' : ''}
          </div> */}
        </>
      )}

      {aba === 'pacotes' && (
        <p className="text-center text-white/50 text-sm py-8">Seus pacotes aparecem aqui.</p>
      )}
    </div>
  )
}