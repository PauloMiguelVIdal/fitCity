// src/data/pacotes.js
// ============================================================
// CATÁLOGO DE PACOTES DO FITCITY
// Fonte única — consumido pela loja (ModalShop)
// Pacotes dão CARTAS para o inventário. Customização visual
// será tratada em outro sistema (futuro).
// ============================================================

// ============================================================
// 1. PACOTES PRINCIPAIS
// ============================================================

export const PACOTES_PRINCIPAIS = [
  {
    id: 'bronze',
    nome: 'Pacote Bronze',
    preco: 15,
    categoria: 'principal',
    quantidade: 3,
    probabilidades: { S: 0, A: 0, B: 10, C: 90 },
    conteudo: '3 Cartas (100% Comuns)',
    descricao: 'Acesso rápido e contínuo. Todo treino gera progresso imediato.',
    cor1: '#7A3F00',
    cor2: '#A65F16',
    cor3: '#D8892B',
    cor4: '#F2B866',
  },
  {
    id: 'prata',
    nome: 'Pacote Prata',
    preco: 40,
    categoria: 'principal',
    quantidade: 5,
    probabilidades: { S: 2, A: 8, B: 24, C: 66 },
    conteudo: '5 Cartas (4 Comuns + 1 Rara Garantida)',
    descricao: 'O pacote principal do jogo. Equilibra volume e garantia de carta superior.',
    cor1: '#555555',
    cor2: '#858585',
    cor3: '#BDBDBD',
    cor4: '#F1F1F1',
  },
  {
    id: 'ouro',
    nome: 'Pacote Ouro',
    preco: 90,
    categoria: 'principal',
    quantidade: 5,
    probabilidades: { S: 5, A: 15, B: 30, C: 50 },
    conteudo: '5 Cartas (3 Comuns + 1 Rara + 1 Épica Garantida)',
    descricao: 'Meta de médio/longo prazo. Incentiva o acúmulo de moedas e constância.',
    cor1: '#7A5200',
    cor2: '#B8860B',
    cor3: '#E0AD2F',
    cor4: '#FFE38A',
  },
]

// ============================================================
// 2. PACOTES SETORIAIS
// ============================================================

export const PACOTES_SETORIAIS = [
  {
    id: 'tech-industria',
    nome: 'Pacote Tech Indústria',
    preco: 5000,
    categoria: 'setorial',
    quantidade: 4,
    probabilidades: { S: 2, A: 8, B: 24, C: 66 },
    setoresIds: ['tecnologia', 'industria'],
    setores: 'Tecnologia + Indústria',
    descricao: 'Cartas direcionadas para área urbana industrial e tecnológica.',
  },
  {
    id: 'imob-agro',
    nome: 'Pacote Imobiliário Agro',
    preco: 5000,
    categoria: 'setorial',
    quantidade: 4,
    probabilidades: { S: 2, A: 8, B: 24, C: 66 },
    setoresIds: ['imobiliario', 'agricultura'],
    setores: 'Imobiliário + Agricultura',
    descricao: 'Cartas para expansão residencial e agrícola da sua cidade.',
  },
  {
    id: 'comercio-energia',
    nome: 'Pacote Comércio Energia',
    preco: 5000,
    categoria: 'setorial',
    quantidade: 4,
    probabilidades: { S: 2, A: 8, B: 24, C: 66 },
    setoresIds: ['comercio', 'energia'],
    setores: 'Comércio + Energia',
    descricao: 'Cartas para o setor comercial e de energia da metrópole.',
  },
]

// ============================================================
// 3. CATÁLOGO COMPLETO
// (Customização visual NÃO faz parte deste catálogo)
// ============================================================

export const PACOTES_CATALOGO = [
  ...PACOTES_PRINCIPAIS,
  ...PACOTES_SETORIAIS,
]

// ============================================================
// 4. HELPERS
// ============================================================

export const getPacote = (pacoteId) =>
  PACOTES_CATALOGO.find((p) => p.id === pacoteId) || null

export const getPacotesPorCategoria = (categoria) =>
  PACOTES_CATALOGO.filter((p) => p.categoria === categoria)

export const getPacotesPrincipais = () =>
  PACOTES_CATALOGO.filter((p) => p.categoria === 'principal')

export const getPacotesSetoriais = () =>
  PACOTES_CATALOGO.filter((p) => p.categoria === 'setorial')

export const TOTAL_PACOTES = PACOTES_CATALOGO.length

export const PACOTES_POR_CATEGORIA = PACOTES_CATALOGO.reduce(
  (acc, p) => {
    acc[p.categoria] = (acc[p.categoria] || 0) + 1
    return acc
  },
  { principal: 0, setorial: 0 }
)