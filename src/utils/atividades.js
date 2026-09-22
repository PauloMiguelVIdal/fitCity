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
// HELPERS DE DATA
// ============================================================

export function getHoje() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getMesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ============================================================
// FORMATAÇÃO
// ============================================================

export function formatarDetalhe(atividade) {
  const partes = []

  if (atividade?.duracao != null && atividade.duracao > 0) {
    partes.push(`${Math.round(atividade.duracao)} min`)
  }
  if (atividade?.distancia != null && atividade.distancia > 0) {
    partes.push(`${Number(atividade.distancia).toFixed(1)} km`)
  }
  if (atividade?.calorias != null && atividade.calorias > 0) {
    partes.push(`${Math.round(atividade.calorias)} kcal`)
  }

  return partes.length > 0 ? partes.join(' · ') : 'Atividade registrada'
}

export function resumoDoPeriodo(lista) {
  return lista.reduce((acc, a) => ({
    calorias: acc.calorias + (a.calorias || 0),
    distancia: acc.distancia + (a.distancia || 0),
    duracao: acc.duracao + (a.duracao || 0),
    atividades: acc.atividades + 1,
    moedas: acc.moedas + (a.moedas || 0),
  }), {
    calorias: 0,
    distancia: 0,
    duracao: 0,
    atividades: 0,
    moedas: 0,
  })
}

// ============================================================
// HELPERS DE AVALIAÇÃO (fonte única)
// ============================================================

export function fitScorePorAtividade(atividade) {
  if (!atividade) return 0
  try { return avaliarAtividade(atividade).fitScore || 0 } catch { return 0 }
}

export function nivelPorAtividade(atividade) {
  if (!atividade) return 1
  try { return avaliarAtividade(atividade).nivel || 1 } catch { return 1 }
}

export function raridadePorAtividade(atividade) {
  if (!atividade) return 'comum'
  try { return avaliarAtividade(atividade).raridade || 'comum' } catch { return 'comum' }
}

// ============================================================
// CÁLCULO DE MOEDAS — FONTE ÚNICA
// ============================================================
//
//   moedas = base(fitScore)
//          + bonusCalorias   ← coeficiente explícito de calorias
//          + bonusNivel
//          + bonusRaridade
//          + bonusTipo
//
// IMPORTANTE: `atividade` PRECISA ter `duracao` (não `tempo`),
// porque `avaliarAtividade` (atividadeModel.js) lê `atividade.duracao`.
// ============================================================

export function calcularMoedas(atividade) {
  if (!atividade) return 0

  try {
    const resultado = avaliarAtividade(atividade)
    const fitScore = resultado.fitScore || 0
    const nivel = resultado.nivel || 1
    const raridade = resultado.raridade || 'comum'

    // 1. Base pelo fitScore (5-35 moedas)
    const base = Math.round(5 + (fitScore / 100) * 30)

    // 2. Coeficiente de calorias (2 moedas a cada 100 kcal)
    const calorias = Number(atividade.calorias) || 0
    const bonusCalorias = Math.floor(calorias / 100) * 2

    // 3. Bônus por nível
    const bonusPorNivel = { 1: 0, 2: 2, 3: 5, 4: 10, 5: 20 }
    const bonusNivel = bonusPorNivel[nivel] || 0

    // 4. Bônus por raridade
    const bonusPorRaridade = {
      comum: 0, incomum: 1, raro: 3, epico: 6, lendario: 12,
    }
    const bonusRaridade = bonusPorRaridade[raridade] || 0

    // 5. Bônus por tipo — CORRIDA > MUSCULAÇÃO > CAMINHADA
    const bonusPorTipo = {
      corrida: 5,
      musculacao: 3,
      caminhada: 1,
    }
    const bonusTipo = bonusPorTipo[atividade.tipo] || 1

    const moedas = base + bonusCalorias + bonusNivel + bonusRaridade + bonusTipo

    return Math.max(1, Math.round(moedas))
  } catch (error) {
    console.warn('Erro ao calcular moedas:', error)
    return 1
  }
}

// ============================================================
// CIDADE PROGRESSO — Setor e Nível do edifício
// ============================================================

export function setorPorAtividade() {
  return 'agricultura'
}

/**
 * Nível do edifício de progresso — ESCALA 1 a 5.
 * Alinhado com o `nivel` do avaliarAtividade (1-5).
 */
export function edificioNivelPorAtividade(atividade) {
  if (!atividade) return 1

  try {
    const { nivel } = avaliarAtividade(atividade)
    return Math.min(5, Math.max(1, nivel || 1))
  } catch {
    return 1
  }
}