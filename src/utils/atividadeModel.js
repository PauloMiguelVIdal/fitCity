// ============================================================
// FITCITY — MODELO MATEMÁTICO DE ATIVIDADES v0.1
// ============================================================
//
// Atividades suportadas:
//   - corrida
//   - caminhada
//   - musculacao
//
// Fluxo:
//
// atividade
//    ↓
// modelo específico da modalidade
//    ↓
// intensityScore (0–100)
//    ↓
// volumeScore (0–100)
//    ↓
// fitScore (0–100)
//    ↓
// nível / raridade
//
// ============================================================


// ============================================================
// CONFIGURAÇÃO GERAL
// ============================================================

const NIVEIS = [
  {
    nivel: 1,
    minimo: 0,
    maximo: 19,
    raridade: 'comum',
  },
  {
    nivel: 2,
    minimo: 20,
    maximo: 39,
    raridade: 'incomum',
  },
  {
    nivel: 3,
    minimo: 40,
    maximo: 59,
    raridade: 'raro',
  },
  {
    nivel: 4,
    minimo: 60,
    maximo: 79,
    raridade: 'epico',
  },
  {
    nivel: 5,
    minimo: 80,
    maximo: 100,
    raridade: 'lendario',
  },
]


// ============================================================
// UTILITÁRIOS
// ============================================================

/**
 * Limita um número entre mínimo e máximo.
 */
function clamp(valor, minimo = 0, maximo = 100) {
  return Math.min(Math.max(valor, minimo), maximo)
}


/**
 * Converte minutos para um valor numérico seguro.
 */
function normalizarMinutos(valor) {
  const minutos = Number(valor)

  if (!Number.isFinite(minutos) || minutos <= 0) {
    return 0
  }

  return minutos
}


/**
 * Converte distância para um valor numérico seguro.
 */
function normalizarDistancia(valor) {
  const distancia = Number(valor)

  if (!Number.isFinite(distancia) || distancia <= 0) {
    return 0
  }

  return distancia
}


/**
 * Converte calorias para um valor numérico seguro.
 */
function normalizarCalorias(valor) {
  const calorias = Number(valor)

  if (!Number.isFinite(calorias) || calorias <= 0) {
    return 0
  }

  return calorias
}


/**
 * Converte minutos/km para minutos decimais.
 *
 * Exemplos:
 *
 * 5:30 → 5.5
 * 4:36 → 4.6
 */
function paceParaDecimal(pace) {
  if (typeof pace === 'number') {
    return pace
  }

  if (typeof pace !== 'string') {
    return 0
  }

  const partes = pace.split(':')

  if (partes.length !== 2) {
    return Number(pace) || 0
  }

  const minutos = Number(partes[0])
  const segundos = Number(partes[1])

  if (
    !Number.isFinite(minutos) ||
    !Number.isFinite(segundos)
  ) {
    return 0
  }

  return minutos + segundos / 60
}


// ============================================================
// FUNÇÃO DE CURVA LOGÍSTICA
// ============================================================
//
// É utilizada para evitar que pequenas diferenças produzam
// mudanças exageradas no score.
//
// O resultado sempre fica entre aproximadamente 0 e 100.
//
// ============================================================

function curvaLogistica(x, centro, inclinacao) {
  return 100 / (1 + Math.exp(inclinacao * (x - centro)))
}


// ============================================================
// 1. CORRIDA
// ============================================================
//
// Principal determinante de intensidade:
// PACE
//
// Também utilizamos:
// - distância
// - duração
//
// Pace = tempo / distância
//
// Exemplo:
//
// 7 km / 40 min
// = 5.71 min/km
// = aproximadamente 5:43/km
//
// 5 km / 23 min
// = 4.60 min/km
// = aproximadamente 4:36/km
//
// A segunda atividade terá maior intensidade.
//
// ============================================================

function avaliarCorrida(atividade) {
  const distancia = normalizarDistancia(atividade.distancia)
  const duracao = normalizarMinutos(atividade.duracao)

  // ----------------------------------------------------------
  // Caso não exista distância suficiente para calcular pace
  // ----------------------------------------------------------

  if (distancia <= 0 || duracao <= 0) {
    return {
      intensityScore: 0,
      volumeScore: 0,
      fitScore: 0,
      pace: null,
    }
  }

  // ----------------------------------------------------------
  // PACE
  // ----------------------------------------------------------

  const pace = duracao / distancia

  // ----------------------------------------------------------
  // INTENSIDADE
  //
  // Quanto menor o pace, maior a intensidade.
  //
  // Centro aproximado: 5:20/km
  //
  // A curva cresce progressivamente conforme o pace diminui.
  // ----------------------------------------------------------

  const intensityScore = clamp(
    curvaLogistica(
      pace,
      5.3,
      1.2
    )
  )

  // ----------------------------------------------------------
  // VOLUME
  //
  // A distância representa principalmente o volume.
  //
  // Utilizamos uma curva de saturação:
  //
  // poucos quilômetros → crescimento rápido
  // muitos quilômetros → crescimento gradual
  // ----------------------------------------------------------

  const volumeScore = clamp(
    100 * (
      1 - Math.exp(-distancia / 8)
    )
  )

  // ----------------------------------------------------------
  // FITSCORE
  //
  // Intensidade possui maior peso que volume.
  // ----------------------------------------------------------

  const fitScore = clamp(
    intensityScore * 0.7 +
    volumeScore * 0.3
  )

  return {
    tipo: 'corrida',

    pace,
    paceFormatado: formatarPace(pace),

    distancia,
    duracao,

    intensityScore: arredondar(intensityScore),
    volumeScore: arredondar(volumeScore),
    fitScore: arredondar(fitScore),
  }
}


// ============================================================
// 2. CAMINHADA
// ============================================================
//
// A caminhada possui uma escala de pace diferente da corrida.
//
// Uma velocidade de 8:00/km pode representar uma caminhada
// moderada, enquanto seria extremamente lenta para uma corrida.
//
// Portanto NÃO reutilizamos o modelo da corrida.
//
// ============================================================

function avaliarCaminhada(atividade) {
  const distancia = normalizarDistancia(atividade.distancia)
  const duracao = normalizarMinutos(atividade.duracao)

  if (distancia <= 0 || duracao <= 0) {
    return {
      intensityScore: 0,
      volumeScore: 0,
      fitScore: 0,
      pace: null,
    }
  }

  // ----------------------------------------------------------
  // PACE
  // ----------------------------------------------------------

  const pace = duracao / distancia

  // ----------------------------------------------------------
  // INTENSIDADE
  //
  // Escala específica para caminhada.
  //
  // Centro aproximado: 8:00/km
  // ----------------------------------------------------------

  const intensityScore = clamp(
    curvaLogistica(
      pace,
      8.0,
      1.0
    )
  )

  // ----------------------------------------------------------
  // VOLUME
  // ----------------------------------------------------------

  const volumeScore = clamp(
    100 * (
      1 - Math.exp(-distancia / 7)
    )
  )

  // ----------------------------------------------------------
  // FITSCORE
  // ----------------------------------------------------------

  const fitScore = clamp(
    intensityScore * 0.7 +
    volumeScore * 0.3
  )

  return {
    tipo: 'caminhada',

    pace,
    paceFormatado: formatarPace(pace),

    distancia,
    duracao,

    intensityScore: arredondar(intensityScore),
    volumeScore: arredondar(volumeScore),
    fitScore: arredondar(fitScore),
  }
}


// ============================================================
// 3. MUSCULAÇÃO
// ============================================================
//
// NÃO utilizamos:
// - carga
// - repetições
// - séries
//
// Apenas:
// - duração
// - calorias
//
// A ideia é que o sistema utilize a quantidade de calorias
// gastas por minuto como indicador de intensidade.
//
//
//
// caloriasPorMinuto = calorias / duração
//
// Isso permite diferenciar:
//
// 60 min / 250 kcal
//
// de:
//
// 60 min / 500 kcal
//
// A segunda atividade terá maior intensidade.
//
// ============================================================

function avaliarMusculacao(atividade) {
  const duracao = normalizarMinutos(atividade.duracao)
  const calorias = normalizarCalorias(atividade.calorias)

  if (duracao <= 0 || calorias <= 0) {
    return {
      intensityScore: 0,
      volumeScore: 0,
      fitScore: 0,
      caloriasPorMinuto: 0,
    }
  }

  // ----------------------------------------------------------
  // CALORIAS POR MINUTO
  // ----------------------------------------------------------

  const caloriasPorMinuto = calorias / duracao

  // ----------------------------------------------------------
  // INTENSIDADE
  //
  // Utilizamos calorias/minuto como indicador.
  //
  // Quanto maior o gasto energético por minuto,
  // maior o score de intensidade.
  //
  // Centro aproximado: 6 kcal/min
  // ----------------------------------------------------------

  const intensityScore = clamp(
    curvaLogistica(
      caloriasPorMinuto,
      6,
      -0.8
    )
  )

  // ----------------------------------------------------------
  // VOLUME
  //
  // Aqui a duração representa o volume da atividade.
  //
  // 30 min → volume menor
  // 60 min → volume médio
  // 90+ min → volume alto
  //
  // ----------------------------------------------------------

  const volumeScore = clamp(
    100 * (
      1 - Math.exp(-duracao / 60)
    )
  )

  // ----------------------------------------------------------
  // FITSCORE
  // ----------------------------------------------------------

  const fitScore = clamp(
    intensityScore * 0.7 +
    volumeScore * 0.3
  )

  return {
    tipo: 'musculacao',

    duracao,
    calorias,
    caloriasPorMinuto: arredondar(caloriasPorMinuto, 2),

    intensityScore: arredondar(intensityScore),
    volumeScore: arredondar(volumeScore),
    fitScore: arredondar(fitScore),
  }
}


// ============================================================
// FORMATAR PACE
// ============================================================

function formatarPace(pace) {
  if (!Number.isFinite(pace) || pace <= 0) {
    return null
  }

  const minutos = Math.floor(pace)
  const segundos = Math.round((pace - minutos) * 60)

  if (segundos === 60) {
    return `${minutos + 1}:00/km`
  }

  return `${minutos}:${String(segundos).padStart(2, '0')}/km`
}


// ============================================================
// ARREDONDAMENTO
// ============================================================

function arredondar(valor, casas = 0) {
  const multiplicador = 10 ** casas

  return Math.round(
    valor * multiplicador
  ) / multiplicador
}


// ============================================================
// DESCOBRIR NÍVEL
// ============================================================

function obterNivel(fitScore) {
  const score = clamp(fitScore)

  return (
    NIVEIS.find(
      nivel =>
        score >= nivel.minimo &&
        score <= nivel.maximo
    ) || NIVEIS[0]
  )
}


// ============================================================
// FUNÇÃO PRINCIPAL
// ============================================================
//
// Esta é a função que o restante da aplicação deverá utilizar.
//
// Não importa qual seja a tela:
//
// ActivityContext
// ActivityMap
// ActivityDetails
// Cards
//
// Todos podem chamar:
//
// avaliarAtividade(atividade)
//
// ============================================================

export function avaliarAtividade(atividade) {
  if (!atividade || !atividade.tipo) {
    return {
      tipo: null,
      intensityScore: 0,
      volumeScore: 0,
      fitScore: 0,
      nivel: 1,
      raridade: 'comum',
    }
  }

  let resultado

  switch (atividade.tipo) {
    case 'corrida':
      resultado = avaliarCorrida(atividade)
      break

    case 'caminhada':
      resultado = avaliarCaminhada(atividade)
      break

    case 'musculacao':
      resultado = avaliarMusculacao(atividade)
      break

    default:
      resultado = {
        tipo: atividade.tipo,
        intensityScore: 0,
        volumeScore: 0,
        fitScore: 0,
      }
  }

  const nivel = obterNivel(resultado.fitScore)

  return {
    ...resultado,

    nivel: nivel.nivel,
    raridade: nivel.raridade,
  }
}


// ============================================================
// EXPORTAÇÕES OPCIONAIS
// ============================================================

export {
  avaliarCorrida,
  avaliarCaminhada,
  avaliarMusculacao,
  obterNivel,
  formatarPace,
  NIVEIS,
}