// src/utils/progressaoProgresso.js
// ============================================================
// PROGRESSÃO DA CIDADE PROGRESSO (baseada em atividades, mensal)
// ============================================================

export const TABELA_NIVEIS_PROGRESSO = [
  { nivel: 1,  porte: 'Micro Empresa',             raio: 3, atvMin: 1  },
  { nivel: 2,  porte: 'Sociedade Limitada',        raio: 3, atvMin: 3  },
  { nivel: 3,  porte: 'Empresa Regional',          raio: 3, atvMin: 7  },
  { nivel: 4,  porte: 'Companhia Local',           raio: 4, atvMin: 12 },
  { nivel: 5,  porte: 'Empresa Estadual',          raio: 5, atvMin: 16 },
  { nivel: 6,  porte: 'Companhia Nacional',        raio: 6, atvMin: 21 },
  { nivel: 7,  porte: 'Corporação Multissetorial', raio: 6, atvMin: 27 },
  { nivel: 8,  porte: 'Grupo Empresarial',         raio: 7, atvMin: 34 },
  { nivel: 9,  porte: 'Conglomerado Global',       raio: 7, atvMin: 42 },
  { nivel: 10, porte: 'Mega Holding',              raio: 8, atvMin: 50 },
]

export const NIVEL_MAXIMO_PROGRESSO = 10

// ── Nível atual (baseado em atividadesMes) ──
export function calcularNivelProgresso(atividadesMes) {
  let resultado = TABELA_NIVEIS_PROGRESSO[0]
  for (const item of TABELA_NIVEIS_PROGRESSO) {
    if (atividadesMes >= item.atvMin) resultado = item
    else break
  }
  return resultado
}

// ── Próximo nível ──
export function proximoNivelProgresso(atividadesMes) {
  const atual = calcularNivelProgresso(atividadesMes)
  const idx = TABELA_NIVEIS_PROGRESSO.findIndex(n => n.nivel === atual.nivel)
  if (idx < 0 || idx >= TABELA_NIVEIS_PROGRESSO.length - 1) return null
  return TABELA_NIVEIS_PROGRESSO[idx + 1]
}

// ── Progresso no nível ──
export function progressoNivelProgresso(atividadesMes) {
  const nivel = calcularNivelProgresso(atividadesMes)
  const proximo = proximoNivelProgresso(atividadesMes)
  
  const atvNivelAtual = nivel.atvMin
  const atvProximo = proximo ? proximo.atvMin : nivel.atvMin
  
  const total = atvProximo - atvNivelAtual
  const atual = atividadesMes - atvNivelAtual
  
  return {
    nivel: nivel.nivel,
    porte: nivel.porte,
    raio: nivel.raio,
    nivelProximo: proximo?.nivel ?? null,
    porteProximo: proximo?.porte ?? null,
    atvAtual: atividadesMes,
    atvNivelAtual,
    atvProximo,
    progresso: atual,
    total,
    porcentagem: total > 0 ? Math.min(100, (atual / total) * 100) : 100,
    faltam: proximo ? Math.max(0, proximo.atvMin - atividadesMes) : 0,
    ehMaximo: !proximo,
  }
}

// ── Contagem de hexágonos por raio ──
export function hexCountPorRaio(raio) {
  return 1 + 3 * raio * (raio + 1)
}

// ── Diferença de hex entre dois raios ──
export function hexDiff(raioAntigo, raioNovo) {
  return hexCountPorRaio(raioNovo) - hexCountPorRaio(raioAntigo)
}