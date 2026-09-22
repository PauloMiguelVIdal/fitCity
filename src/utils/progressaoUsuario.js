// src/utils/progressaoUsuario.js
// ============================================================
// PROGRESSÃO DO USUÁRIO (permanente, sem teto)
// ============================================================

export const CONFIG_PROGRESSAO_USUARIO = {
  base: 100,          // XP do nível 2
  expoente: 1.6,      // curvatura da curva
  xpPorKcal: 0.1,
  xpPorMoeda: 2,
  xpPorKm: 5,
  xpPorMinuto: 0.5,
}

// ── XP de uma atividade ──
export function calcularXpAtividade(atividade) {
  const { xpPorKcal, xpPorMoeda, xpPorKm, xpPorMinuto } = CONFIG_PROGRESSAO_USUARIO
  
  const xpKcal    = (atividade.kcal || 0) * xpPorKcal
  const xpMoedas  = (atividade.moedas || 0) * xpPorMoeda
  const xpKm      = (atividade.distancia || 0) * xpPorKm
  const xpMinutos = (atividade.duracao || 0) * xpPorMinuto
  
  return Math.round(xpKcal + xpMoedas + xpKm + xpMinutos)
}

// ── Nível do usuário (1 a ∞) ──
export function calcularNivelUsuario(xp) {
  if (xp <= 0) return 1
  const { base, expoente } = CONFIG_PROGRESSAO_USUARIO
  return Math.floor(1 + Math.pow(xp / base, 1 / expoente))
}

// ── XP necessário para um nível ──
export function xpParaNivelUsuario(nivel) {
  if (nivel <= 1) return 0
  const { base, expoente } = CONFIG_PROGRESSAO_USUARIO
  return Math.round(base * Math.pow(nivel - 1, expoente))
}

// ── Progresso percentual no nível ──
export function progressoNivelUsuario(xp) {
  const nivel = calcularNivelUsuario(xp)
  const xpNivelAtual = xpParaNivelUsuario(nivel)
  const xpProximo = xpParaNivelUsuario(nivel + 1)
  
  const total = xpProximo - xpNivelAtual
  const atual = xp - xpNivelAtual
  
  return {
    nivel,
    nivelProximo: nivel + 1,
    xpAtual: xp,
    xpNivelAtual,
    xpProximo,
    progresso: atual,
    total,
    porcentagem: total > 0 ? Math.min(100, (atual / total) * 100) : 0,
  }
}