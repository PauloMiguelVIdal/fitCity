// src/utils/atividades.js
import { avaliarAtividade } from './atividadeModel'

// ============================================================
// FILTROS POR PERÍODO
// ============================================================

export function isHoje(iso) {
  const d = new Date(iso)
  const h = new Date()
  return d.toDateString() === h.toDateString()
}

export function isNaSemana(iso) {
  const diff = (new Date() - new Date(iso)) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff < 7
}

export function isNoMes(iso) {
  const d = new Date(iso)
  const h = new Date()
  return d.getMonth() === h.getMonth() && d.getFullYear() === h.getFullYear()
}

export const FILTRO_POR_PERIODO = {
  hoje: isHoje,
  semana: isNaSemana,
  mes: isNoMes,
}

// ============================================================
// FORMATAÇÃO DE DETALHES
// ============================================================

export function formatarDetalhe(atividade) {
  const partes = []
  
  if (atividade?.tempo != null && atividade.tempo > 0) {
    partes.push(`${Math.round(atividade.tempo)} min`)
  }
  
  if (atividade?.distancia != null && atividade.distancia > 0) {
    partes.push(`${Number(atividade.distancia).toFixed(1)} km`)
  }
  
  if (atividade?.calorias != null && atividade.calorias > 0) {
    partes.push(`${Math.round(atividade.calorias)} kcal`)
  }
  
  return partes.length > 0 ? partes.join(' · ') : 'Atividade registrada'
}

// ============================================================
// RESUMO DO PERÍODO
// ============================================================

export function resumoDoPeriodo(lista) {
  return lista.reduce((acc, a) => ({
    calorias: acc.calorias + (a.calorias || 0),
    distancia: acc.distancia + (a.distancia || 0),
    tempo: acc.tempo + (a.tempo || 0),
    atividades: acc.atividades + 1,
    moedas: acc.moedas + (a.moedas || 0),
  }), { 
    calorias: 0, 
    distancia: 0, 
    tempo: 0, 
    atividades: 0,
    moedas: 0,
  })
}

// ============================================================
// CÁLCULO DE MOEDAS BASEADO NO MODELO DE ATIVIDADE
// ============================================================

/**
 * Calcula as moedas ganhas com base na atividade.
 * Usa o fitScore do modelo matemático para determinar a recompensa.
 *
 * @param {Object} atividade - Dados da atividade
 * @param {number} [multiplicadorBase=1] - Multiplicador adicional
 * @returns {number} - Quantidade de moedas ganhas
 */
export function calcularMoedas(atividade, multiplicadorBase = 1) {
  // Se não houver atividade, retorna 0
  if (!atividade) return 0

  try {
    // Avalia a atividade usando o modelo matemático
    const resultado = avaliarAtividade(atividade)

    // FitScore entre 0 e 100
    const fitScore = resultado.fitScore || 0
    const nivel = resultado.nivel || 1
    const raridade = resultado.raridade || 'comum'

    // ============================================================
    // MOEDAS BASE (pelo fitScore)
    // ============================================================
    // 
    // fitScore 0-20   → 1-5 moedas
    // fitScore 20-40  → 5-15 moedas
    // fitScore 40-60  → 15-30 moedas
    // fitScore 60-80  → 30-50 moedas
    // fitScore 80-100 → 50-100 moedas
    // ============================================================
    const moedasBase = Math.round(
      1 + (fitScore / 100) * 50 + Math.pow(fitScore / 100, 2) * 40
    )

    // ============================================================
    // BÔNUS POR NÍVEL
    // ============================================================
    const bonusPorNivel = {
      1: 0,
      2: 2,
      3: 5,
      4: 10,
      5: 20,
    }
    const bonusNivel = bonusPorNivel[nivel] || 0

    // ============================================================
    // BÔNUS POR RARIDADE
    // ============================================================
    const bonusPorRaridade = {
      'comum': 0,
      'incomum': 3,
      'raro': 8,
      'epico': 15,
      'lendario': 30,
    }
    const bonusRaridade = bonusPorRaridade[raridade] || 0

    // ============================================================
    // BÔNUS POR TIPO DE ATIVIDADE
    // ============================================================
    const bonusPorTipo = {
      'corrida': 2,
      'caminhada': 1,
      'musculacao': 3,
      'ciclismo': 4,
      'natacao': 3,
      'futebol': 2,
      'basquete': 2,
      'volei': 2,
      'maratona': 8,
      'triatlo': 12,
      'alongamento': 1,
      'yoga': 1,
    }
    const bonusTipo = bonusPorTipo[atividade.tipo] || 1

    // ============================================================
    // BÔNUS POR DURAÇÃO (cada 15 minutos extras)
    // ============================================================
    let bonusDuracao = 0
    if (atividade.tempo && atividade.tempo > 0) {
      const minutos = Number(atividade.tempo)
      if (minutos > 30) {
        bonusDuracao = Math.floor((minutos - 30) / 15) * 2
      }
    }

    // ============================================================
    // BÔNUS POR DISTÂNCIA (cada 3km extras)
    // ============================================================
    let bonusDistancia = 0
    if (atividade.distancia && atividade.distancia > 0) {
      const km = Number(atividade.distancia)
      if (km > 3) {
        bonusDistancia = Math.floor((km - 3) / 3) * 3
      }
    }

    // ============================================================
    // TOTAL
    // ============================================================
    let moedas = moedasBase + bonusNivel + bonusRaridade + bonusTipo + bonusDuracao + bonusDistancia
    
    // Aplica multiplicador
    moedas = Math.round(moedas * multiplicadorBase)

    // Garante que o mínimo seja 1 moeda
    return Math.max(1, moedas)

  } catch (error) {
    // Fallback: se o modelo falhar, usa uma fórmula simples
    console.warn('Erro ao calcular moedas com modelo, usando fallback:', error)
    return calcularMoedasFallback(atividade)
  }
}

// ============================================================
// FALLBACK PARA CÁLCULO DE MOEDAS
// ============================================================

function calcularMoedasFallback(atividade) {
  const tempo = Number(atividade.tempo) || 0
  const distancia = Number(atividade.distancia) || 0

  let moedas = 2

  // Base por tipo
  const basePorTipo = {
    'corrida': 5,
    'caminhada': 3,
    'musculacao': 4,
    'ciclismo': 6,
    'natacao': 5,
    'futebol': 4,
    'basquete': 4,
    'volei': 3,
    'maratona': 12,
    'triatlo': 18,
    'alongamento': 2,
    'yoga': 2,
  }

  moedas = basePorTipo[atividade.tipo] || 3

  // Adiciona por tempo (a cada 10 min)
  if (tempo > 0) {
    moedas += Math.floor(tempo / 10) * 2
  }

  // Adiciona por distância (a cada 2km)
  if (distancia > 0) {
    moedas += Math.floor(distancia / 2) * 3
  }

  return Math.max(1, moedas)
}

// ============================================================
// FUNÇÃO PARA OBTER O NOME DO EDIFÍCIO DA ATIVIDADE
// ============================================================

/**
 * Retorna o nome do edifício correspondente à atividade.
 * Baseado no nível de intensidade da atividade.
 */
export function nomeEdificioPorAtividade(atividade) {
  if (!atividade) return 'Pomares'

  try {
    const resultado = avaliarAtividade(atividade)
    const nivel = resultado.nivel || 1

    // Mapeia nível para edifício
    const mapaNivelEdificio = {
      1: 'Pomares',
      2: 'Plantação De Eucalipto',
      3: 'Fábrica De Rações',
      4: 'Data Center',
      5: 'Shopping Popular',
      6: 'Prédio De Alto Padrão',
      7: 'Usina De Fusão Nuclear',
      8: 'Aeroporto',
      9: 'Porto',
      10: 'Construtora De Infraestruturas',
    }

    return mapaNivelEdificio[nivel] || 'Pomares'
  } catch {
    return 'Pomares'
  }
}

// ============================================================
// FUNÇÃO PARA OBTER A RARIDADE DA ATIVIDADE
// ============================================================

export function raridadePorAtividade(atividade) {
  if (!atividade) return 'comum'

  try {
    const resultado = avaliarAtividade(atividade)
    return resultado.raridade || 'comum'
  } catch {
    return 'comum'
  }
}

// ============================================================
// FUNÇÃO PARA OBTER O FITSCORE DA ATIVIDADE
// ============================================================

export function fitScorePorAtividade(atividade) {
  if (!atividade) return 0

  try {
    const resultado = avaliarAtividade(atividade)
    return resultado.fitScore || 0
  } catch {
    return 0
  }
}

// ============================================================
// FUNÇÃO PARA OBTER O NÍVEL DA ATIVIDADE
// ============================================================

export function nivelPorAtividade(atividade) {
  if (!atividade) return 1

  try {
    const resultado = avaliarAtividade(atividade)
    return resultado.nivel || 1
  } catch {
    return 1
  }
}