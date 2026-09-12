// src/utils/cartasPorMoedas.js
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

export const EDIFICIOS_POR_NIVEL = {
  1: {
    edificios: [
      {
        nome: 'Plantação De Vegetais',
        setor: 'agricultura',
      },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 1',
  },

  2: {
    edificios: [
      {
        nome: 'Granja De Aves',
        setor: 'agricultura',
      },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 2',
  },

  3: {
    edificios: [
      {
        nome: 'Fazenda De Vacas',
        setor: 'agricultura',
      },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 3',
  },

  4: {
    edificios: [
      {
        nome: 'Criação De Ovinos',
        setor: 'agricultura',
      },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 4',
  },

  5: {
    edificios: [
      {
        nome: 'Cooperativa Agrícola',
        setor: 'agricultura',
      },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 5',
  },

  6: {
    edificios: [
      {
        nome: 'Centro De Comércio De Plantações',
        setor: 'agricultura',
      },
    ],
    cor1: '#003816',
    cor2: '#1A5E2A',
    cor3: '#0C9123',
    cor4: '#4CAF50',
    label: 'Nível 6',
  },
}

// =============================================
// LIMITE SUPERIOR DE CADA NÍVEL
// =============================================


// =============================================
// NÍVEL BASEADO NAS MOEDAS
// =============================================

export const getNivelPorMoedas = (moedas) => {
  if (moedas <= 5) return 1
  if (moedas <= 10) return 2
  if (moedas <= 20) return 3
  if (moedas <= 30) return 4
  if (moedas <= 50) return 5

  return 6
}

// =============================================
// ESCOLHE O EDIFÍCIO DO NÍVEL
// =============================================

export const escolherEdificioPorNivel = (nivel) => {
  const config =
    EDIFICIOS_POR_NIVEL[nivel] ||
    EDIFICIOS_POR_NIVEL[1]

  const edificios =
    config.edificios ||
    EDIFICIOS_POR_NIVEL[1].edificios

  // Atualmente cada nível possui apenas 1 edifício.
  // Quando houver vários, podemos colocar randomização aqui.
  return edificios[0]
}

// =============================================
// RARIDADE POR NÍVEL
// =============================================

export const mapaRaridadePorNivel = {
  1: 'comum',
  2: 'incomum',
  3: 'raro',
  4: 'epico',
  5: 'lendario',
  6: 'lendario',
}

// =============================================
// CARTA RESULTANTE
// =============================================

/**
 * Calcula a carta resultante de uma atividade
 * com base na quantidade de moedas.
 *
 * @param {number} moedas
 * @returns {{
 *   nome: string,
 *   setor: string,
 *   nivel: number,
 *   raridade: string,
 *   cor1: string,
 *   cor2: string,
 *   cor3: string,
 *   cor4: string
 * }}
 */
export function getCartaPorMoedas(moedas) {
  const nivel = getNivelPorMoedas(moedas)

  const edificio = escolherEdificioPorNivel(nivel)

  const cfg =
    EDIFICIOS_POR_NIVEL[nivel] ||
    EDIFICIOS_POR_NIVEL[1]

  return {
    nome: edificio.nome,
    setor: edificio.setor,
    nivel,
    raridade: mapaRaridadePorNivel[nivel] || 'comum',
    cor1: cfg.cor1,
    cor2: cfg.cor2,
    cor3: cfg.cor3,
    cor4: cfg.cor4,
  }
}

export const LIMITE_NIVEL = [5, 10, 20, 30, 50, Infinity]
