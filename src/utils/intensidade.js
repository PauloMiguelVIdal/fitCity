// src/utils/intensidade.js
export const EDIFICIO_POR_INTENSIDADE = {
  1: 'Plantação De Grãos',
  2: 'Pomares',
  3: 'Área Florestal',
  4: 'Fazenda De Vacas',
  5: 'Centro De Comércio De Plantações',
}

// Intensidade = calorias por minuto de atividade. Fórmula provisória —
// os limiares (4, 7, 10, 13) são um ponto de partida, ajuste conforme
// os dados reais de atividades que você for coletando.
// =============================================
// RECOMPENSAS FITCITY
// =============================================
//
// A atividade já possui um FitScore de 0 a 100.
// Os pontos são derivados diretamente desse score.
//
// Regra:
// 1 ponto de FitScore = 1 ponto de atividade
//
// As moedas são uma recompensa secundária baseada
// nos pontos conquistados.
//
// Isso evita que tempo/distância sejam contabilizados
// novamente depois que a atividade já foi avaliada.
// =============================================

export function calcularPontos(atividade) {
  if (!atividade) return 0

  // Caso a atividade já tenha a avaliação salva
  if (atividade.fitScore != null) {
    return Math.round(Number(atividade.fitScore) || 0)
  }

  // Compatibilidade caso venha como score
  if (atividade.pontos != null) {
    return Math.round(Number(atividade.pontos) || 0)
  }

  return 0
}

export function calcularMoedas(atividade) {
  const pontos = calcularPontos(atividade)

  if (pontos <= 0) return 0

  // Recompensa progressiva:
  //
  // 0-19 pontos   → 1 moeda a cada 2 pontos
  // 20-39         → 1 moeda a cada 2 pontos
  // 40-59         → 1 moeda por ponto
  // 60-79         → 1 moeda por ponto + bônus
  // 80-100        → recompensa maior
  //
  // O objetivo é fazer atividades melhores
  // valerem proporcionalmente mais.

  if (pontos < 40) {
    return Math.max(1, Math.floor(pontos / 2))
  }

  if (pontos < 60) {
    return pontos
  }

  if (pontos < 80) {
    return pontos + 10
  }

  return pontos + 25
}