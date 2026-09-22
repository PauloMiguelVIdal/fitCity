// src/utils/progressaoConquista.js
// ============================================================
// PROGRESSÃO DA CIDADE CONQUISTA (baseada em cartas, teto 20)
// ============================================================

export const CONFIG_CONQUISTA = {
  nivelMaximo: 20,
  expoenteCurva: 1.8,
  pesos: {
    comum: 1,
    raro: 5,
    epico: 25,
    lendario: 100,
  },
  multiplicadores: {
    1: 1,
    2: 2,
    3: 4,
    4: 8,   // MAX
  },
  faixasNivel: {
    comum:    { 1: [1, 19],  2: [20, 49], 3: [50, 99],  4: [100, Infinity] },
    raro:     { 1: [1, 14],  2: [15, 39], 3: [40, 79],  4: [80,  Infinity] },
    epico:    { 1: [1, 9],   2: [10, 19], 3: [20, 49],  4: [50,  Infinity] },
    lendario: { 1: [1, 1],   2: [2, 4],   3: [5, 9],    4: [10,  Infinity] },
  },
}

// ── Nível da carta (baseado na quantidade) ──
export function calcularNivelCarta(raridade, quantidade) {
  const faixas = CONFIG_CONQUISTA.faixasNivel[raridade]
  if (!faixas) return 1
  
  for (const [nivel, [min, max]] of Object.entries(faixas)) {
    if (quantidade >= min && quantidade <= max) return Number(nivel)
  }
  return 4
}

// ── XP de uma carta ──
export function calcularXpCarta(carta, quantidade) {
  const peso = CONFIG_CONQUISTA.pesos[carta.raridade] || 1
  const nivel = calcularNivelCarta(carta.raridade, quantidade)
  const mult = CONFIG_CONQUISTA.multiplicadores[nivel] || 1
  return peso * mult
}

// ── XP total do inventário ──
export function calcularXpConquista(inventario, catalogo) {
  return Object.entries(inventario.cartas).reduce((total, [cartaId, item]) => {
    const carta = catalogo.cartas[cartaId]
    if (!carta) return total
    return total + calcularXpCarta(carta, item.quantidade)
  }, 0)
}

// ── XP máximo (coleção completa, tudo MAX) ──
export function calcularXpMaximoConquista(catalogo) {
  return Object.values(catalogo.cartas).reduce((total, carta) => {
    const peso = CONFIG_CONQUISTA.pesos[carta.raridade] || 1
    const multMax = CONFIG_CONQUISTA.multiplicadores[4]
    return total + (peso * multMax)
  }, 0)
}

// ── Nível da cidade conquista (1 a 20) ──
export function calcularNivelConquista(xp, xpMax) {
  const { nivelMaximo, expoenteCurva } = CONFIG_CONQUISTA
  if (xpMax <= 0) return 1
  
  const fracao = Math.pow(Math.min(xp, xpMax) / xpMax, 1 / expoenteCurva)
  return Math.min(nivelMaximo, 1 + Math.floor(fracao * (nivelMaximo - 1)))
}

// ── XP necessário para um nível (nível 1 = 0) ──
export function xpParaNivelConquista(nivel, xpMax) {
  const { nivelMaximo, expoenteCurva } = CONFIG_CONQUISTA
  if (nivel <= 1) return 0
  
  const fracao = (nivel - 1) / (nivelMaximo - 1)
  return Math.round(xpMax * Math.pow(fracao, expoenteCurva))
}

// ── Progresso no nível ──
export function progressoNivelConquista(xp, xpMax) {
  const nivel = calcularNivelConquista(xp, xpMax)
  const xpNivelAtual = xpParaNivelConquista(nivel, xpMax)
  const xpProximo = nivel >= CONFIG_CONQUISTA.nivelMaximo
    ? xpMax
    : xpParaNivelConquista(nivel + 1, xpMax)
  
  const total = xpProximo - xpNivelAtual
  const atual = xp - xpNivelAtual
  
  return {
    nivel,
    nivelProximo: nivel + 1,
    nivelMaximo: CONFIG_CONQUISTA.nivelMaximo,
    xpAtual: xp,
    xpNivelAtual,
    xpProximo,
    xpMax,
    progresso: atual,
    total,
    porcentagem: total > 0 ? Math.min(100, (atual / total) * 100) : 100,
    ehMaximo: nivel >= CONFIG_CONQUISTA.nivelMaximo,
  }
}