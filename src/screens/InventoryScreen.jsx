// src/screens/InventoryScreen.jsx
import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Sprout, Cpu, Factory, Store, Building2, Zap, Package,
  LayoutGrid, Gem, ArrowDownWideNarrow, Lock, Unlock, X, Maximize2,
} from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import CardMinimal from '../components/CardMinimal'
import CardColection from '../components/CardColection'

// =============================================
// DADOS DAS CARTAS (mock)
// =============================================
const CARTAS_FITCITY = [
  { nome: "Terreno De Mineração", raridade: "comum", qtd: 20 },
  { nome: "Pátio De Mineração", raridade: "comum", qtd: 1 },
  { nome: "Pomares", raridade: "comum", qtd: 1 },
  { nome: "Depósito De Resíduos Orgânicos", raridade: "comum", qtd: 2 },
  { nome: "Plantação De Grãos", raridade: "incomum", qtd: 50 },
  { nome: "Serraria", raridade: "incomum", qtd: 2 },
  { nome: "Plantação De Eucalipto", raridade: "incomum", qtd: 30 },
  { nome: "Cooperativa Agrícola", raridade: "epico", qtd: 2 },
  { nome: "Centro De Comércio De Plantações", raridade: "raro", qtd: 1 },
  { nome: "Área Florestal", raridade: "comum", qtd: 1 },
  { nome: "Subestação De Energia", raridade: "comum", qtd: 1 },
  { nome: "Campo De Estocagem", raridade: "comum", qtd: 1 },
  { nome: "Silo", raridade: "comum", qtd: 3 },
  { nome: "Fazenda De Vacas", raridade: "incomum", qtd: 3 },
  { nome: "Granja De Aves", raridade: "incomum", qtd: 100 },
  { nome: "Fábrica De Rações", raridade: "incomum", qtd: 80 },
  { nome: "Fábrica De Papel", raridade: "incomum", qtd: 0 },
  { nome: "Fábrica De Pães", raridade: "incomum", qtd: 1 },
  { nome: "Container Modular", raridade: "comum", qtd: 99 },
  { nome: "Pátio De Veículos", raridade: "comum", qtd: 1 },
  { nome: "Fábrica De Calçados", raridade: "incomum", qtd: 14 },
  { nome: "Fábrica De Bebidas", raridade: "incomum", qtd: 1 },
  { nome: "Laboratório Farmacêutico", raridade: "raro", qtd: 12 },
  { nome: "Fábrica De Motores", raridade: "lendario", qtd: 0 },
  { nome: "Fábrica De Robôs", raridade: "lendario", qtd: 1 },
  { nome: "Usina Siderúrgica", raridade: "epico", qtd: 1 },
  { nome: "Fábrica De Ligas Metálicas", raridade: "epico", qtd: 1 },
  { nome: "Fábrica De Peças Automotivas", raridade: "epico", qtd: 1 },
  { nome: "Fábrica De Smartphones", raridade: "epico", qtd: 2 },
  { nome: "Empresa De Automação Industrial", raridade: "epico", qtd: 25 },
  { nome: "Startup", raridade: "comum", qtd: 100 },
  { nome: "Servidor Em Nuvem", raridade: "raro", qtd: 70 },
  { nome: "Empresa De Desenvolvimento De Software", raridade: "raro", qtd: 25 },
  { nome: "Centro De Pesquisa Em Fusão Nuclear", raridade: "epico", qtd: 1 },
  { nome: "Centro De Pesquisa Aeroespacial", raridade: "epico", qtd: 1 },
  { nome: "Feira", raridade: "comum", qtd: 1 },
  { nome: "Loja De Móveis", raridade: "comum", qtd: 1 },
  { nome: "Farmácia", raridade: "comum", qtd: 2 },
  { nome: "Câmara Fria", raridade: "comum", qtd: 2 },
  { nome: "Mercado", raridade: "comum", qtd: 3 },
  { nome: "Loja De Calçados", raridade: "comum", qtd: 2 },
  { nome: "Posto De Combustíveis", raridade: "comum", qtd: 12 },
  { nome: "Centro De Distribuição", raridade: "raro", qtd: 24 },
  { nome: "Concessionária De Veículos", raridade: "raro", qtd: 17 },
  { nome: "Transporte Petrolífero", raridade: "epico", qtd: 1 },
  { nome: "Shopping Popular", raridade: "lendario", qtd: 2 },
  { nome: "Shopping Center", raridade: "lendario", qtd: 1 },
  { nome: "Mega Mercado", raridade: "epico", qtd: 1 },
  { nome: "Construtora De Pequenas Obras", raridade: "comum", qtd: 1 },
  { nome: "Cartório E Licenças", raridade: "comum", qtd: 1 },
  { nome: "Escritório De Arquitetura", raridade: "comum", qtd: 1 },
  { nome: "Consultoria Em Engenharia Civil", raridade: "comum", qtd: 1 },
  { nome: "Escritório De Design De Interiores", raridade: "comum", qtd: 1 },
  { nome: "Construtora", raridade: "raro", qtd: 2 },
  { nome: "Imobiliária Residencial", raridade: "raro", qtd: 1 },
  { nome: "Imobiliária Comercial", raridade: "raro", qtd: 1 },
  { nome: "Construtora De Infraestruturas", raridade: "lendario", qtd: 4 },
  { nome: "Hangar", raridade: "comum", qtd: 99 },
  { nome: "Mineradora", raridade: "raro", qtd: 1 },
  { nome: "Plataforma De Petróleo", raridade: "lendario", qtd: 1 },
  { nome: "Centro De Coleta De Biomassa", raridade: "raro", qtd: 1 },
  { nome: "Tanque De Armazenamento De Fluidos", raridade: "comum", qtd: 1 },
  { nome: "Estação De Carregamento", raridade: "comum", qtd: 1 },
  { nome: "Centro De Pesquisa Energética", raridade: "raro", qtd: 1 },
  { nome: "Empresa De Comércio Energético", raridade: "raro", qtd: 1 },
  { nome: "Usina De Biomassa", raridade: "epico", qtd: 1 },
  { nome: "Parque Eólico", raridade: "comum", qtd: 1 },
  { nome: "Fábrica De Turbinas Eólicas", raridade: "comum", qtd: 1 },
  { nome: "Usina Hidrelétrica", raridade: "lendario", qtd: 1 },
  { nome: "Usina Termelétrica A Biocombustíveis", raridade: "raro", qtd: 1 },
  { nome: "Usina Termelétrica", raridade: "raro", qtd: 1 },
  { nome: "Reator Nuclear Convencional", raridade: "lendario", qtd: 1 },
  { nome: "Usina De Fusão Nuclear", raridade: "lendario", qtd: 1 },
  { nome: "Aeroporto", raridade: "lendario", qtd: 10 },
  { nome: "Porto", raridade: "lendario", qtd: 1 },
  { nome: "Estaleiro", raridade: "epico", qtd: 1 },
  { nome: "Fábrica De Aeronaves", raridade: "lendario", qtd: 1 },
  { nome: "Fábrica De Foguetes", raridade: "lendario", qtd: 1 },
  { nome: "Criação De Ovinos", raridade: "incomum", qtd: 2 },
  { nome: "Prédio De Alto Padrão", raridade: "epico", qtd: 2 },
  { nome: "Armazém", raridade: "comum", qtd: 4 },
]

// =============================================
// MAPEAMENTO DE SETOR
// =============================================
const mapaSetor = {
  "Plantação De Grãos": "agricultura", "Plantação De Vegetais": "agricultura",
  "Fazenda Administrativa": "agricultura", "Pomares": "agricultura",
  "Cooperativa Agrícola": "agricultura", "Centro De Comércio De Plantações": "agricultura",
  "Fazenda De Vacas": "agricultura", "Granja De Aves": "agricultura",
  "Criação De Ovinos": "agricultura", "Armazém": "agricultura",
  "Silo": "agricultura", "Depósito De Resíduos Orgânicos": "agricultura",
  "Serraria": "agricultura", "Área Florestal": "agricultura",
  "Terreno De Mineração": "agricultura", "Plantação De Eucalipto": "agricultura",
  "Plantação De Plantas Medicinais": "agricultura", "Campo De Estocagem": "agricultura",
  "Pátio De Mineração": "agricultura",
  "Fábrica De Móveis": "industria", "Fábrica De Rações": "industria",
  "Fábrica De Embalagens": "industria", "Fábrica De Fertilizantes": "industria",
  "Fábrica De Bebidas": "industria", "Fábrica De Pães": "industria",
  "Fábrica Têxtil": "industria", "Fábrica De Calçados": "industria",
  "Fábrica De Roupas": "industria", "Fábrica De Celulose": "industria",
  "Fábrica De Papel": "industria", "Fábrica De Livros": "industria",
  "Fábrica De Medicamentos": "industria", "Laboratório Farmacêutico": "industria",
  "Fábrica De Plásticos": "industria", "Fábrica De Químicos Especializados": "industria",
  "Alto-Forno": "industria", "Usina Siderúrgica": "industria",
  "Fundição De Alumínio": "industria", "Fábrica De Ligas Metálicas": "industria",
  "Indústria De Componentes Mecânicos": "industria", "Fábrica De Chapas Metálicas": "industria",
  "Fábrica De Estruturas Metálicas": "industria", "Fábrica De Peças Automotivas": "industria",
  "Montadora De Veículos Elétricos": "industria", "Fábrica De Automóveis": "industria",
  "Refinaria De Biocombustíveis": "industria", "Refinaria": "industria",
  "Biofábrica": "industria", "Fábrica De Chips": "industria",
  "Fábrica De Placas Eletrônicas": "industria", "Fábrica De Semicondutores": "industria",
  "Fábrica De Eletrônicos": "industria", "Fábrica De Robôs": "industria",
  "Empresa De Automação Industrial": "industria", "Fábrica De Motores": "industria",
  "Fábrica De Foguetes": "industria", "Fábrica De Aeronaves": "industria",
  "Estaleiro": "industria", "Container Modular": "industria", "Pátio De Veículos": "industria",
  "Startup": "tecnologia", "Servidor Em Nuvem": "tecnologia",
  "Data Center": "tecnologia", "Empresa De Desenvolvimento De Software": "tecnologia",
  "Empresa De Jogos Digitais": "tecnologia", "Empresa De Telecomunicações": "tecnologia",
  "Plataforma De Redes Sociais": "tecnologia", "Marketplace Online": "tecnologia",
  "Plataforma De Streaming": "tecnologia", "Fábrica De Smartphones": "tecnologia",
  "Fábrica De Computadores": "tecnologia", "Fábrica De Consoles De Jogos": "tecnologia",
  "Fábrica De Dispositivos Vestíveis": "tecnologia", "Instituto De Tecnologia Alimentar": "tecnologia",
  "Centro De Pesquisa Agrícola": "tecnologia", "Instituto De Biotecnologia": "tecnologia",
  "Laboratório De Nanotecnologia": "tecnologia", "Centro De Pesquisa Em Eletrônicos": "tecnologia",
  "Laboratório De Design De Produtos": "tecnologia", "Centro De Pesquisa Química": "tecnologia",
  "Centro De Pesquisa Em Fusão Nuclear": "tecnologia", "Laboratório De Novos Combustíveis": "tecnologia",
  "Centro De Pesquisa Aeroespacial": "tecnologia", "Centro De Engenharia Avançada": "tecnologia",
  "Centro De Pesquisa Em Materiais": "tecnologia", "Centro De Pesquisa Em Robótica": "tecnologia",
  "Centro De Pesquisa Em IA": "tecnologia",
  "Feira": "comercio", "Loja De Móveis": "comercio", "Restaurante": "comercio",
  "Livraria": "comercio", "Mercado": "comercio", "Adega": "comercio",
  "Câmara Fria": "comercio", "Padaria": "comercio", "Açougue": "comercio",
  "Loja De Conveniência": "comercio", "Posto De Combustíveis": "comercio",
  "Rede De Fast-Food": "comercio", "Petshop": "comercio", "Farmácia": "comercio",
  "Cafeteria": "comercio", "Loja De Departamentos": "comercio",
  "Loja De Calçados": "comercio", "Loja De Vestuário": "comercio",
  "Loja De Gadgets E Wearables": "comercio", "Loja De Games": "comercio",
  "Loja De Celulares": "comercio", "Loja De Informática": "comercio",
  "Loja De Eletrônicos": "comercio", "Joalheria": "comercio",
  "Concessionária De Veículos": "comercio", "Shopping Popular": "comercio",
  "Shopping Center": "comercio", "Centro De Transporte E Entrega": "comercio",
  "Centro De Distribuição": "comercio", "Armazém Logístico": "comercio",
  "Transporte Petrolífero": "comercio",
  "Cartório E Licenças": "imobiliario", "Terraplanagem E Pavimentação": "imobiliario",
  "Construtora De Pequenas Obras": "imobiliario", "Escritório De Design De Interiores": "imobiliario",
  "Escritório De Arquitetura": "imobiliario", "Consultoria Em Engenharia Civil": "imobiliario",
  "Construtora": "imobiliario", "Imobiliária Residencial": "imobiliario",
  "Imobiliária Comercial": "imobiliario", "Construtora De Infraestruturas": "imobiliario",
  "Aeroporto": "imobiliario", "Porto": "imobiliario",
  "Mineradora": "imobiliario", "Mineradora Radioativa": "imobiliario",
  "Mineradora De Pedras Preciosas": "imobiliario", "Mega Mercado": "imobiliario",
  "Prédio De Alto Padrão": "imobiliario", "Centro De Coleta De Biomassa": "imobiliario",
  "Tanque De Armazenamento De Fluidos": "imobiliario", "Plataforma De Petróleo": "imobiliario",
  "Hangar": "imobiliario",
  "Subestação De Energia": "energia", "Rede De Distribuição Elétrica": "energia",
  "Fábrica De Turbinas Eólicas": "energia", "Fábrica De Baterias": "energia",
  "Empresa De Comércio Energético": "energia", "Empresa De Consultoria Energética": "energia",
  "Estação De Carregamento": "energia", "Centro De Pesquisa Em Energias Renováveis": "energia",
  "Centro De Pesquisa Energética": "energia", "Centro De Reciclagem De Baterias": "energia",
  "Usina Termelétrica A Biocombustíveis": "energia", "Usina De Biomassa": "energia",
  "Usina Hidrelétrica": "energia", "Parque Eólico": "energia",
  "Usina Termelétrica": "energia", "Reator Nuclear Convencional": "energia",
  "Usina De Fusão Nuclear": "energia",
}

// =============================================
// CONFIGURAÇÃO DOS SETORES
// Ícones lucide substituem os PNGs — não dependem mais de assets externos
// =============================================
const SETORES_CONFIG = {
  agricultura: { id: "agricultura", label: "Agricultura", icon: Sprout,    cor1: "#003816", cor2: "#1A5E2A", cor3: "#0C9123", cor4: "#4CAF50" },
  tecnologia:  { id: "tecnologia",  label: "Tecnologia",  icon: Cpu,       cor1: "#A64B00", cor2: "#D45A00", cor3: "#FF6F00", cor4: "#FF8C42" },
  industria:   { id: "industria",   label: "Indústria",   icon: Factory,   cor1: "#1A1A1A", cor2: "#4D4D4D", cor3: "#808080", cor4: "#B3B3B3" },
  comercio:    { id: "comercio",    label: "Comércio",    icon: Store,     cor1: "#660000", cor2: "#A31919", cor3: "#E60000", cor4: "#FF4D4D" },
  imobiliario: { id: "imobiliario", label: "Imobiliário", icon: Building2, cor1: "#000066", cor2: "#1A1A8C", cor3: "#3333CC", cor4: "#6666FF" },
  energia:     { id: "energia",     label: "Energia",     icon: Zap,       cor1: "#665200", cor2: "#A37F19", cor3: "#E6B800", cor4: "#FFD966" },
  outros:      { id: "outros",      label: "Outros",       icon: Package,   cor1: "#1A1A1A", cor2: "#4D4D4D", cor3: "#808080", cor4: "#B3B3B3" },
}

// =============================================
// CONFIG DE RARIDADE + POWER-UP
// =============================================
const RARIDADE_POWERUP = {
  comum:    { quantidadeMinimaNv2: 20, quantidadeMinimaNv3: 50, qtdMaxima: 100 },
  raro:     { quantidadeMinimaNv2: 15, quantidadeMinimaNv3: 40, qtdMaxima: 80  },
  epico:    { quantidadeMinimaNv2: 10, quantidadeMinimaNv3: 20, qtdMaxima: 50  },
  lendario: { quantidadeMinimaNv2: 2,  quantidadeMinimaNv3: 5,  qtdMaxima: 10  },
}

const RARIDADE_COR = {
  comum: "#9CA3AF",
  raro: "#9944ff",
  epico: "#ff9933",
  lendario: "#ffd700",
}

const getSetor = (nome) => mapaSetor[nome] || "outros"

const FILTROS_SETOR = [
  { id: 'todos', label: 'Todos', icon: LayoutGrid },
  { id: 'agricultura', label: 'Agricultura', icon: Sprout },
  { id: 'industria', label: 'Indústria', icon: Factory },
  { id: 'tecnologia', label: 'Tecnologia', icon: Cpu },
  { id: 'comercio', label: 'Comércio', icon: Store },
  { id: 'imobiliario', label: 'Imobiliário', icon: Building2 },
  { id: 'energia', label: 'Energia', icon: Zap },
]

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

const RANK_PARA_RARIDADE = {
  S: "lendario",
  A: "epico",
  B: "raro",
  C: "comum",
}



// =============================================
// LÓGICA DE NÍVEL / PROGRESSO
// =============================================
const calcularProgresso = (raridade, quantidade) => {
  const cfg = RARIDADE_POWERUP[raridade] || RARIDADE_POWERUP.comum
  const { quantidadeMinimaNv2, quantidadeMinimaNv3, qtdMaxima } = cfg

  if (quantidade >= qtdMaxima) {
    return {
      nivel: 4,
      labelNivel: "MAX",
      progressoAtual: qtdMaxima,
      progressoMaximo: qtdMaxima,
      textoProximoNivel: "Nível máximo alcançado",
    }
  }
  if (quantidade >= quantidadeMinimaNv3) {
    const falta = qtdMaxima - quantidade
    return {
      nivel: 3,
      labelNivel: "Nv 3",
      progressoAtual: quantidade - quantidadeMinimaNv3,
      progressoMaximo: qtdMaxima - quantidadeMinimaNv3,
      textoProximoNivel: `Faltam ${falta} para o nível máximo`,
    }
  }
  if (quantidade >= quantidadeMinimaNv2) {
    const falta = quantidadeMinimaNv3 - quantidade
    return {
      nivel: 2,
      labelNivel: "Nv 2",
      progressoAtual: quantidade - quantidadeMinimaNv2,
      progressoMaximo: quantidadeMinimaNv3 - quantidadeMinimaNv2,
      textoProximoNivel: `Faltam ${falta} para o Nv 3`,
    }
  }
  const falta = quantidadeMinimaNv2 - quantidade
  return {
    nivel: 1,
    labelNivel: "Nv 1",
    progressoAtual: quantidade,
    progressoMaximo: quantidadeMinimaNv2,
    textoProximoNivel: `Faltam ${falta} para o Nv 2`,
  }
}

// =============================================
// TILT 3D — usado na visualização em tela cheia
// Rotaciona a carta seguindo o ponteiro/toque e adiciona um brilho (glare)
// que acompanha o movimento, tipo carta holográfica física.
// =============================================
function CardTilt3D({ children, className = '' }) {
  const ref = useRef(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)

  const springX = useSpring(rotateX, { stiffness: 220, damping: 22 })
  const springY = useSpring(rotateY, { stiffness: 220, damping: 22 })
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.35), transparent 55%)`
  )

  const updateFromPoint = (clientX, clientY) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (clientX - rect.left) / rect.width
    const py = (clientY - rect.top) / rect.height
    rotateY.set((px - 0.5) * 28)
    rotateX.set((0.5 - py) * 28)
    glareX.set(px * 100)
    glareY.set(py * 100)
  }

  const handlePointerMove = (e) => updateFromPoint(e.clientX, e.clientY)
  const handleTouchMove = (e) => {
    const t = e.touches[0]
    if (t) updateFromPoint(t.clientX, t.clientY)
  }
  const reset = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onTouchMove={handleTouchMove}
      onTouchEnd={reset}
      className={className}
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d', position: 'relative' }}
        className="w-full h-full"
      >
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: glareBackground, mixBlendMode: 'overlay' }}
        />
      </motion.div>
    </div>
  )
}

// =============================================
// CÉLULA DA CARTA (grid não-virtualizado)
// =============================================
const CartaCell = ({ carta, onExpand }) => {
  const config = SETORES_CONFIG[carta.setor] || SETORES_CONFIG.outros
  const raridade = RANK_PARA_RARIDADE[carta.rank] || "comum"
  const qtd = carta.qtd || 0
  const bloqueada = qtd === 0

  const prog = calcularProgresso(raridade, qtd)
  const corRaridade = RARIDADE_COR[raridade]
  const podeTrocar = qtd >= 11
  const pct = Math.min(100, (prog.progressoAtual / prog.progressoMaximo) * 100)

  return (
    <div className="relative w-full">
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: config.cor2, opacity: 0.7, boxShadow: `0 4px 20px ${config.cor4}33` }}
      />

      <div className="relative w-full flex flex-col" style={{ padding: 5 }}>
        {/* ====== ÁREA DA CARTA ====== */}
        <div className="relative w-full" style={{ flexShrink: 0 }}>
          <CardMinimal
            nome={carta.nome}
            raridade={raridade}
            quantidade={qtd}
            setor={carta.setor}
            cor1={config.cor1}
            cor2={config.cor2}
            cor3={config.cor3}
            cor4={config.cor4}
            onExpand={() => onExpand(carta)}
          />

          {/* ====== DOT DE SETOR — discreto, canto superior esquerdo ======
              O selo grande com ícone/PNG saiu do card: a cor já comunica o
              setor no grid, e o ícone + nome completo aparecem só na tela cheia. */}
          <div
            className="absolute rounded-full"
            style={{
              top: 6, right: 6, width: 10, height: 10,
              background: config.cor4,
              boxShadow: `0 0 6px ${config.cor4}aa`,
              zIndex: 40,
            }}
          />

          {/* ====== BOTÃO DE EXPANDIR — deixa a tela cheia visível/descobrível ====== */}


          {bloqueada && (
            <div
              className="absolute inset-0 rounded-2xl flex items-center justify-center pointer-events-none"
              style={{ background: "rgba(0,0,0,0.8)", zIndex: 35 }}
            >
              <Lock size={26} color="rgba(255,255,255,0.35)" strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* ====== PROGRESSO — altura reservada para alinhar as linhas do grid ====== */}
        <div className="flex flex-col justify-center" style={{ marginTop: 4, gap: 2, minHeight: 34 }}>
          {!bloqueada ? (
            <>
              <div className="flex items-center justify-between" style={{ minHeight: 10 }}>
                {podeTrocar ? (
                  <div
                    className="flex items-center gap-0.5"
                    style={{ fontSize: 7, fontWeight: 800, letterSpacing: ".04em", color: "#4ade80", textShadow: "0 0 4px #4ade8066", lineHeight: 1 }}
                  >
                    <span>✓</span><span>TROCA</span>
                  </div>
                ) : <span />}
              </div>

              <div className="flex items-center gap-1.5">
                <div style={{ fontSize: 8, fontWeight: 900, color: corRaridade, textShadow: `0 0 3px ${corRaridade}88`, minWidth: 22, lineHeight: 1 }}>
                  {prog.labelNivel}
                </div>

                <div className="flex-1 relative overflow-hidden" style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.55)", border: `1px solid ${corRaridade}55` }}>
                  <div
                    style={{
                      position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`,
                      background: `linear-gradient(90deg, ${corRaridade}, ${corRaridade}cc)`,
                      boxShadow: `0 0 6px ${corRaridade}aa`, borderRadius: 3,
                    }}
                  />
                </div>

                <div style={{ fontSize: 8, fontWeight: 900, color: "#fff", textShadow: "0 1px 2px #000", minWidth: 38, textAlign: "right", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                  {qtd}/{RARIDADE_POWERUP[raridade]?.qtdMaxima ?? 100}
                </div>
              </div>

              <div className="text-center" style={{ fontSize: 6.5, fontWeight: 700, color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>
                {prog.textoProximoNivel}
              </div>
            </>
          ) : (
            <div className="text-center" style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.4)", lineHeight: 1 }}>
              0 / {RARIDADE_POWERUP[raridade]?.quantidadeMinimaNv2 ?? 20}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================
// SEGMENTED CONTROL DE ORDENAÇÃO
// =============================================
const SegmentedOrdenar = ({ ordenarPor, onChange }) => (
  <div
    className="relative flex items-center"
    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 3, gap: 2 }}
  >
    {[
      { id: 'raridade', label: 'Raridade', icon: Gem },
      { id: 'quantidade', label: 'Quantidade', icon: ArrowDownWideNarrow },
    ].map(({ id, label, icon: Icon }) => {
      const ativo = ordenarPor === id
      return (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex items-center gap-1.5 transition"
          style={{
            padding: "6px 10px",
            borderRadius: 9,
            fontSize: 11,
            fontWeight: 700,
            color: ativo ? "#fff" : "rgba(255,255,255,0.5)",
            background: ativo ? "linear-gradient(90deg, #9333ea, #d946ef)" : "transparent",
            boxShadow: ativo ? "0 2px 10px rgba(168,85,247,0.45)" : "none",
          }}
        >
          <Icon size={13} />
          <span>{label}</span>
        </button>
      )
    })}
  </div>
)

// =============================================
// SWITCH — mostrar/ocultar bloqueadas
// (separado do sort: é um filtro de visibilidade, não uma ordenação)
// =============================================
const SwitchBloqueadas = ({ ativo, onToggle }) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-1.5"
    style={{
      padding: "6px 10px",
      borderRadius: 12,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      fontSize: 11,
      fontWeight: 700,
      color: ativo ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
      flexShrink: 0,
    }}
    title={ativo ? "Ocultar bloqueadas" : "Mostrar bloqueadas"}
  >
    {ativo ? <Unlock size={13} /> : <Lock size={13} />}
    <span className="whitespace-nowrap">Bloqueadas</span>
  </button>
)

// =============================================
// TELA
// =============================================
export default function InventoryScreen() {
  const [filtroSetor, setFiltroSetor] = useState('todos')
  const [ordenarPor, setOrdenarPor] = useState('quantidade')
  const [mostrarBloqueadas, setMostrarBloqueadas] = useState(true)
  const [cartaExpandida, setCartaExpandida] = useState(null)

  const cartasProcessadas = useMemo(() => {
    return CARTAS_FITCITY.map(carta => ({
      ...carta,
      rank: getRank(carta.nome),
      setor: getSetor(carta.nome),
    }))
  }, [])

  const totalDescobertas = useMemo(
    () => cartasProcessadas.filter(c => c.qtd > 0).length,
    [cartasProcessadas]
  )
  const totalCartas = cartasProcessadas.length

  const cartasFiltradas = useMemo(() => {
    let filtradas = cartasProcessadas

    if (filtroSetor !== 'todos') {
      filtradas = filtradas.filter(c => c.setor === filtroSetor)
    }
    if (!mostrarBloqueadas) {
      filtradas = filtradas.filter(c => c.qtd > 0)
    }

    const ordemRaridade = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 }
    filtradas = [...filtradas].sort((a, b) => {
      if (ordenarPor === 'quantidade') {
        if (b.qtd !== a.qtd) return b.qtd - a.qtd
        return ordemRaridade[a.rank] - ordemRaridade[b.rank]
      } else {
        if (ordemRaridade[a.rank] !== ordemRaridade[b.rank]) {
          return ordemRaridade[a.rank] - ordemRaridade[b.rank]
        }
        return b.qtd - a.qtd
      }
    })

    return filtradas
  }, [cartasProcessadas, filtroSetor, ordenarPor, mostrarBloqueadas])

  const handleSetorFilter = useCallback((s) => setFiltroSetor(s), [])

  const configExpandida = cartaExpandida
    ? SETORES_CONFIG[cartaExpandida.setor] || SETORES_CONFIG.outros
    : null

  return (
    <div className="relative text-white flex flex-col"   style={{ height: "100dvh", overflow: "hidden", overscrollBehavior: "none" }}
>
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -top-10 left-0 w-64 h-64 rounded-full bg-fuchsia-500/20 blur-[80px]" />

      {/* ====== HEADER ====== */}
      <div className="relative flex items-center justify-between px-4 pt-5 pb-1.5" style={{ flexShrink: 0 }}>
        <h1 className="text-xl font-bold">Inventário</h1>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 11, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
        >
          <Gem size={12} color="#c4b5fd" />
          <span style={{ color: "#fff" }}>{totalDescobertas}</span>
          <span style={{ color: "rgba(255,255,255,0.45)" }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.65)" }}>{totalCartas}</span>
        </div>
      </div>

      {/* ====== CONTROLES: ordenar (segmented) + bloqueadas (switch) — separados por função ====== */}
      <div className="relative flex items-center justify-between gap-2 px-4 pt-2" style={{ flexShrink: 0 }}>
        <SegmentedOrdenar ordenarPor={ordenarPor} onChange={setOrdenarPor} />
        <SwitchBloqueadas ativo={mostrarBloqueadas} onToggle={() => setMostrarBloqueadas(v => !v)} />
      </div>

      {/* ====== FILTRO DE SETOR — chips com ícone + label ====== */}
      <div className="relative flex gap-1.5 overflow-x-auto px-4 pt-2.5 pb-1 scrollbar-hide" style={{ flexShrink: 0 }}>
        {FILTROS_SETOR.map(({ id, label, icon: Icon }) => {
          const config = SETORES_CONFIG[id] || SETORES_CONFIG.outros
          const corAtiva = id === 'todos' ? '#F27405' : config.cor4
          const ativo = filtroSetor === id
          return (
            <button
              key={id}
              onClick={() => handleSetorFilter(id)}
              className="flex items-center gap-1.5 transition whitespace-nowrap"
              style={{
                padding: "7px 12px",
                borderRadius: 11,
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 700,
                color: ativo ? "#fff" : "rgba(255,255,255,0.5)",
                background: ativo ? corAtiva : "rgba(255,255,255,0.05)",
                border: ativo ? "none" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: ativo ? `0 2px 10px ${corAtiva}66` : "none",
              }}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      {/* ====== GRID — CSS grid centralizado e responsivo, ocupa o restante ====== */}
      <div className="relative flex-1 w-full overflow-y-auto pb-[75px] pt-2" style={{ minHeight: 0 }}>
        <div
          className="grid gap-2.5 mx-auto px-4"
          style={{ maxWidth: 640 }}
        >
          <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 col-span-full">
            {cartasFiltradas.map((carta) => (
              <CartaCell key={carta.nome} carta={carta} onExpand={setCartaExpandida} />
            ))}
          </div>
        </div>
      </div>
            {cartaExpandida && configExpandida && (
        <CardColection
          expandida
          nome={cartaExpandida.nome}
          raridade={RANK_PARA_RARIDADE[cartaExpandida.rank] || "comum"}
          quantidade={cartaExpandida.qtd}
          setor={cartaExpandida.setor}
          cor1={configExpandida.cor1}
          cor2={configExpandida.cor2}
          cor3={configExpandida.cor3}
          cor4={configExpandida.cor4}
          setorLabel={configExpandida.label}
          onClose={() => setCartaExpandida(null)}
        />
      )}
    </div>
  )
}