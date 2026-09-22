// src/store/fitcityStore.js
// ============================================================
// STORE PRINCIPAL DO FITCITY
// ============================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import {
  CARTAS_CATALOGO,
  RARIDADES_CONFIG,
  MULTIPLICADORES_NIVEL,
} from '../data/cartasFitCity'

import { PACOTES_CATALOGO } from '../data/pacotes'

import { calcularXpAtividade } from '../utils/progressaoUsuario'
import { calcularNivelProgresso } from '../utils/progressaoProgresso'

import {
  calcularMoedas,
  getHoje,
  getMesAtual,
  edificioNivelPorAtividade,
  setorPorAtividade,
} from '../utils/atividades'

// ============================================================
// HELPERS INTERNOS
// ============================================================

const gerarId = (prefixo) =>
  `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

const proximoMes = (mes) => {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const diasNoMes = (mesStr) => {
  const [ano, mes] = mesStr.split('-').map(Number)
  return new Date(ano, mes, 0).getDate()
}

// ============================================================
// ESTADO INICIAL
// ============================================================

const initialState = {
  user: {
    id: null,
    username: '',
    nome: '',
    avatarUrl: null,
    criadoEm: null,
  },

  progressao: {
    xp: 0,
    sequenciaDias: 0,
    ultimaAtividadeEm: null,
  },

  economia: {
    saldo: 0,
    historico: [],
    coletasDiarias: {},
  },

  atividades: [],

  inventario: {
    cartas: {},
  },

  cidade: {
    temporadaAtualId: null,
    ultimaViradaProcessada: null,
    nivel: 1,
    porte: 'Micro Empresa',
    raio: 3,
    atividadesMes: 0,
    nivelExpandido: 1,

    // Fluxo A: Patrimônio
    posicoesPatrimonio: {},

    // Fluxo B: Progresso
    temporadas: {},
  },

  social: {
    amigos: [],
    solicitacoesRecebidas: [],
    solicitacoesEnviadas: [],
    grupos: [],
  },

  ui: {
    modalAtividadeAberto: false,
    modalLojaAberto: false,
    modalViradaDeMes: null,
    cartaExpandidaId: null,
    loading: false,
    erro: null,
  },

  catalogo: {
    cartas: CARTAS_CATALOGO,
    pacotes: PACOTES_CATALOGO,
    raridades: RARIDADES_CONFIG,
    multiplicadores: MULTIPLICADORES_NIVEL,
    config: {
      metaDiariaKcal: 600,
      metaSemanalTreinos: 5,
      metaMensalAtividades: 16,
      moedasPorColeta: 0.19,
    },
  },
}

// ============================================================
// STORE
// ============================================================

export const useFitCityStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ═══════════════════════════════════════════════════════
      // 1. USUÁRIO
      // ═══════════════════════════════════════════════════════

      setUser: (user) => set((state) => ({
        user: {
          ...state.user,
          ...user,
          criadoEm: state.user.criadoEm || new Date().toISOString(),
        },
      })),

      clearUser: () => set(() => ({
        user: initialState.user,
        progressao: initialState.progressao,
        economia: initialState.economia,
        atividades: [],
        inventario: initialState.inventario,
        cidade: initialState.cidade,
        social: initialState.social,
      })),

      // ═══════════════════════════════════════════════════════
      // 2. ATIVIDADES
      // ═══════════════════════════════════════════════════════

      registrarAtividade: (dadosAtividade) => {
        const state = get()
        const agora = new Date().toISOString()
        const hoje = getHoje()
        const temporadaId = state.cidade.temporadaAtualId

        if (!temporadaId) {
          console.warn('Nenhuma temporada ativa.')
          return null
        }

        const moedas = calcularMoedas(dadosAtividade)
        const xpGanho = calcularXpAtividade({ ...dadosAtividade, moedas })

        const atividade = {
          id: gerarId('atv'),
          tipo: dadosAtividade.tipo,
          data: agora,
          duracao: dadosAtividade.duracao || 0,
          distancia: dadosAtividade.distancia || 0,
          calorias: dadosAtividade.calorias || 0,
          moedas,
          xp: xpGanho,
          origem: dadosAtividade.origem || 'manual',
          temporadaId,
          createdAt: agora,
          efeitos: {},
        }

        // Streak
        const ultima = state.progressao.ultimaAtividadeEm
        const ontem = new Date()
        ontem.setDate(ontem.getDate() - 1)
        const ontemStr = ontem.toISOString().split('T')[0]
        const ultimaStr = ultima ? ultima.split('T')[0] : null

        let novaSequencia = state.progressao.sequenciaDias
        if (ultimaStr !== hoje) {
          novaSequencia = (ultimaStr === ontemStr) ? novaSequencia + 1 : 1
        }

        // Edifício do progresso
        const edificio = get()._criarEdificioProgresso({
          atividade,
          temporadaId,
        })
        atividade.efeitos.edificioProgressoCriado = edificio?.id ?? null

        set((s) => {
          const novasAtividades = [...s.atividades, atividade]
          const novasTransacoes = [
            ...s.economia.historico,
            {
              id: gerarId('tx'),
              tipo: 'ganho',
              valor: moedas,
              origem: 'atividade',
              refId: atividade.id,
              temporadaId,
              data: agora,
            },
          ]

          const tempAtual = s.cidade.temporadas[temporadaId] || { edificiosAtivos: {} }
          const novasTemporadas = {
            ...s.cidade.temporadas,
            [temporadaId]: {
              ...tempAtual,
              edificiosAtivos: {
                ...tempAtual.edificiosAtivos,
                ...(edificio ? { [edificio.id]: edificio } : {}),
              },
            },
          }

          const atividadesMes = novasAtividades.filter(
            (a) => a.temporadaId === temporadaId
          ).length
          const nivelInfo = calcularNivelProgresso(atividadesMes)

          return {
            atividades: novasAtividades,
            economia: {
              ...s.economia,
              saldo: s.economia.saldo + moedas,
              historico: novasTransacoes,
            },
            progressao: {
              ...s.progressao,
              xp: s.progressao.xp + xpGanho,
              sequenciaDias: novaSequencia,
              ultimaAtividadeEm: agora,
            },
            cidade: {
              ...s.cidade,
              atividadesMes,
              nivel: nivelInfo.nivel,
              porte: nivelInfo.porte,
              raio: nivelInfo.raio,
              temporadas: novasTemporadas,
            },
          }
        })

        return atividade
      },

      removerAtividade: (atividadeId) => set((s) => ({
        atividades: s.atividades.filter((a) => a.id !== atividadeId),
      })),

      // ═══════════════════════════════════════════════════════
      // 3. ECONOMIA
      // ═══════════════════════════════════════════════════════

      adicionarMoedas: (valor, origem, refId = null) => set((s) => ({
        economia: {
          ...s.economia,
          saldo: s.economia.saldo + valor,
          historico: [
            ...s.economia.historico,
            {
              id: gerarId('tx'),
              tipo: 'ganho',
              valor,
              origem,
              refId,
              temporadaId: s.cidade.temporadaAtualId,
              data: new Date().toISOString(),
            },
          ],
        },
      })),

      gastarMoedas: (valor, origem, refId = null) => {
        const state = get()
        if (state.economia.saldo < valor) return false

        set((s) => ({
          economia: {
            ...s.economia,
            saldo: s.economia.saldo - valor,
            historico: [
              ...s.economia.historico,
              {
                id: gerarId('tx'),
                tipo: 'gasto',
                valor,
                origem,
                refId,
                temporadaId: s.cidade.temporadaAtualId,
                data: new Date().toISOString(),
              },
            ],
          },
        }))
        return true
      },

      coletarMoeda: (edificioId) => {
        const state = get()
        const hoje = getHoje()

        if (state.economia.coletasDiarias[edificioId] === hoje) {
          return { sucesso: false, motivo: 'ja_coletado_hoje' }
        }

        const tempAtual = state.cidade.temporadas[state.cidade.temporadaAtualId]
        const edificio = tempAtual?.edificiosAtivos?.[edificioId]
        if (!edificio) {
          return { sucesso: false, motivo: 'edificio_nao_encontrado' }
        }

        const valor = edificio.moedasPorColeta

        set((s) => ({
          economia: {
            ...s.economia,
            saldo: s.economia.saldo + valor,
            coletasDiarias: {
              ...s.economia.coletasDiarias,
              [edificioId]: hoje,
            },
            historico: [
              ...s.economia.historico,
              {
                id: gerarId('tx'),
                tipo: 'ganho',
                valor,
                origem: 'coleta_diaria',
                refId: edificioId,
                temporadaId: s.cidade.temporadaAtualId,
                data: new Date().toISOString(),
              },
            ],
          },
        }))

        return { sucesso: true, valor }
      },

      // ═══════════════════════════════════════════════════════
      // 4. INVENTÁRIO
      // ═══════════════════════════════════════════════════════

      adicionarCarta: (cartaId, quantidade = 1) => set((s) => {
        const atual = s.inventario.cartas[cartaId] || { cartaId, quantidade: 0 }
        return {
          inventario: {
            ...s.inventario,
            cartas: {
              ...s.inventario.cartas,
              [cartaId]: { ...atual, quantidade: atual.quantidade + quantidade },
            },
          },
        }
      }),

      removerCarta: (cartaId, quantidade = 1) => set((s) => {
        const atual = s.inventario.cartas[cartaId]
        if (!atual) return s

        const novaQtd = Math.max(0, atual.quantidade - quantidade)
        const novasCartas = { ...s.inventario.cartas }

        if (novaQtd === 0) {
          delete novasCartas[cartaId]
        } else {
          novasCartas[cartaId] = { ...atual, quantidade: novaQtd }
        }

        return { inventario: { ...s.inventario, cartas: novasCartas } }
      }),

      // ═══════════════════════════════════════════════════════
      // 5. LOJA
      // ═══════════════════════════════════════════════════════

      comprarPacote: (pacoteId) => {
        const state = get()
        const pacote = state.catalogo.pacotes.find((p) => p.id === pacoteId)
        if (!pacote) return { sucesso: false, motivo: 'pacote_inexistente' }

        if (state.economia.saldo < pacote.preco) {
          return { sucesso: false, motivo: 'saldo_insuficiente' }
        }

        const cartasSorteadas = state._sortearCartas(pacote)

        const debitou = get().gastarMoedas(pacote.preco, 'compra_pacote', pacoteId)
        if (!debitou) return { sucesso: false, motivo: 'erro_debito' }

        set((s) => {
          const novasCartas = { ...s.inventario.cartas }
          cartasSorteadas.forEach((cartaId) => {
            const atual = novasCartas[cartaId] || { cartaId, quantidade: 0 }
            novasCartas[cartaId] = { ...atual, quantidade: atual.quantidade + 1 }
          })
          return { inventario: { ...s.inventario, cartas: novasCartas } }
        })

        return { sucesso: true, cartas: cartasSorteadas }
      },

      // ═══════════════════════════════════════════════════════
      // 6. FLUXO A — CIDADE PATRIMÔNIO
      // ═══════════════════════════════════════════════════════

      posicionarCartaPatrimonio: (cartaId, hexKey) => set((s) => {
        const posicoes = { ...s.cidade.posicoesPatrimonio }
        Object.keys(posicoes).forEach((key) => {
          if (posicoes[key] === cartaId) delete posicoes[key]
        })
        posicoes[hexKey] = cartaId
        return { cidade: { ...s.cidade, posicoesPatrimonio: posicoes } }
      }),

      removerCartaPatrimonio: (cartaId) => set((s) => {
        const posicoes = { ...s.cidade.posicoesPatrimonio }
        Object.keys(posicoes).forEach((key) => {
          if (posicoes[key] === cartaId) delete posicoes[key]
        })
        return { cidade: { ...s.cidade, posicoesPatrimonio: posicoes } }
      }),

      // ═══════════════════════════════════════════════════════
      // 7. FLUXO B — CIDADE PROGRESSO
      // ═══════════════════════════════════════════════════════

      moverEdificioProgresso: (edificioId, novoHexKey) => set((s) => {
        const temporadaId = s.cidade.temporadaAtualId
        const temp = s.cidade.temporadas[temporadaId]
        if (!temp) return s

        const edificio = temp.edificiosAtivos[edificioId]
        if (!edificio) return s

        return {
          cidade: {
            ...s.cidade,
            temporadas: {
              ...s.cidade.temporadas,
              [temporadaId]: {
                ...temp,
                edificiosAtivos: {
                  ...temp.edificiosAtivos,
                  [edificioId]: { ...edificio, hexKey: novoHexKey },
                },
              },
            },
          },
        }
      }),

      expandirMundo: () => set((s) => ({
        cidade: { ...s.cidade, nivelExpandido: s.cidade.nivel },
      })),

      // ═══════════════════════════════════════════════════════
      // 8. CICLO MENSAL
      // ═══════════════════════════════════════════════════════

      verificarViradaDeMes: () => {
        const state = get()
        const mesAtual = getMesAtual()

        if (!state.cidade.temporadaAtualId) {
          set((s) => ({
            cidade: {
              ...s.cidade,
              temporadaAtualId: mesAtual,
              ultimaViradaProcessada: mesAtual,
              temporadas: {
                ...s.cidade.temporadas,
                [mesAtual]: {
                  id: mesAtual,
                  inicio: `${mesAtual}-01`,
                  fim: `${mesAtual}-${diasNoMes(mesAtual)}`,
                  status: 'ativa',
                  edificiosAtivos: {},
                  agregados: null,
                  arquivadaEm: null,
                },
              },
            },
          }))
          return
        }

        if (state.cidade.ultimaViradaProcessada === mesAtual) return
        if (mesAtual <= state.cidade.temporadaAtualId) return

        let mesCursor = state.cidade.temporadaAtualId
        const temporadasArquivadas = []

        while (mesCursor !== mesAtual) {
          const proximo = proximoMes(mesCursor)
          const temp = state.cidade.temporadas[mesCursor]

          if (temp) {
            const agregados = get()._calcularAgregados(mesCursor)
            temporadasArquivadas.push({ id: mesCursor, agregados })
          }

          mesCursor = proximo
        }

        const novaTemp = {
          id: mesAtual,
          inicio: `${mesAtual}-01`,
          fim: `${mesAtual}-${diasNoMes(mesAtual)}`,
          status: 'ativa',
          edificiosAtivos: {},
          agregados: null,
          arquivadaEm: null,
        }

        set((s) => {
          const novasTemporadas = { ...s.cidade.temporadas }

          temporadasArquivadas.forEach(({ id, agregados }) => {
            if (novasTemporadas[id]) {
              novasTemporadas[id] = {
                ...novasTemporadas[id],
                status: 'arquivada',
                agregados,
                arquivadaEm: new Date().toISOString(),
              }
            }
          })

          novasTemporadas[mesAtual] = novaTemp

          const ultimaArquivada = temporadasArquivadas[temporadasArquivadas.length - 1]
          const notificacao = ultimaArquivada && ultimaArquivada.agregados.totalAtividades > 0
            ? {
                mesAnterior: ultimaArquivada.id,
                mesAtual,
                agregados: ultimaArquivada.agregados,
              }
            : null

          return {
            cidade: {
              ...s.cidade,
              temporadaAtualId: mesAtual,
              ultimaViradaProcessada: mesAtual,
              nivel: 1,
              porte: 'Micro Empresa',
              raio: 3,
              atividadesMes: 0,
              nivelExpandido: 1,
              temporadas: novasTemporadas,
            },
            economia: {
              ...s.economia,
              coletasDiarias: {},
            },
            ui: {
              ...s.ui,
              modalViradaDeMes: notificacao,
            },
          }
        })
      },

      // ═══════════════════════════════════════════════════════
      // 9. UI
      // ═══════════════════════════════════════════════════════

      abrirModalAtividade: () => set((s) => ({ ui: { ...s.ui, modalAtividadeAberto: true } })),
      fecharModalAtividade: () => set((s) => ({ ui: { ...s.ui, modalAtividadeAberto: false } })),

      abrirModalLoja: () => set((s) => ({ ui: { ...s.ui, modalLojaAberto: true } })),
      fecharModalLoja: () => set((s) => ({ ui: { ...s.ui, modalLojaAberto: false } })),

      fecharModalViradaDeMes: () => set((s) => ({ ui: { ...s.ui, modalViradaDeMes: null } })),

      setCartaExpandida: (cartaId) => set((s) => ({ ui: { ...s.ui, cartaExpandidaId: cartaId } })),

      setLoading: (loading) => set((s) => ({ ui: { ...s.ui, loading } })),
      setErro: (erro) => set((s) => ({ ui: { ...s.ui, erro } })),

      // ═══════════════════════════════════════════════════════
      // 10. HELPERS INTERNOS
      // ═══════════════════════════════════════════════════════

      _criarEdificioProgresso: ({ atividade, temporadaId }) => {
        const state = get()
        const temp = state.cidade.temporadas[temporadaId]
        if (!temp) return null

        const edificioNivel = edificioNivelPorAtividade(atividade)
        const setor = setorPorAtividade(atividade)

        const hexOcupados = new Set(
          Object.values(temp.edificiosAtivos || {}).map((e) => e.hexKey)
        )
        let hexKey = null
        const raio = state.cidade.raio

        outer: for (let dist = 1; dist <= raio; dist++) {
          for (let q = -dist; q <= dist; q++) {
            for (let r = -dist; r <= dist; r++) {
              if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) !== dist) continue
              const key = `${q},${r}`
              if (key === '0,0') continue
              if (hexOcupados.has(key)) continue
              hexKey = key
              break outer
            }
          }
        }

        return {
          id: gerarId('edf'),
          edificioNivel,
          setor,
          atividadeOrigem: atividade.id,
          criadoEm: new Date().toISOString(),
          moedasPorColeta: state.catalogo.config.moedasPorColeta,
          hexKey: hexKey || '1,0',
        }
      },

      _calcularAgregados: (temporadaId) => {
        const state = get()
        const temp = state.cidade.temporadas[temporadaId]
        if (!temp) return null

        const atividadesTemp = state.atividades.filter((a) => a.temporadaId === temporadaId)
        const transacoesTemp = state.economia.historico.filter(
          (t) => t.temporadaId === temporadaId
        )

        const totalEdificios = Object.keys(temp.edificiosAtivos || {}).length
        const totalMoedasColetadas = transacoesTemp
          .filter((t) => t.tipo === 'ganho' && t.origem === 'coleta_diaria')
          .reduce((sum, t) => sum + t.valor, 0)

        const dias = diasNoMes(temporadaId)
        const moedasPotenciais = Object.values(temp.edificiosAtivos || {}).reduce(
          (sum, ed) => {
            const diaCriacao = parseInt(ed.criadoEm.split('T')[0].split('-')[2], 10)
            const diasDisponiveis = dias - diaCriacao + 1
            return sum + ed.moedasPorColeta * Math.max(0, diasDisponiveis)
          },
          0
        )

        const eficienciaColeta = moedasPotenciais > 0
          ? (totalMoedasColetadas / moedasPotenciais) * 100
          : 0

        const diasComColeta = new Set(
          transacoesTemp
            .filter((t) => t.origem === 'coleta_diaria')
            .map((t) => t.data.split('T')[0])
        ).size

        return {
          totalEdificios,
          totalAtividades: atividadesTemp.length,
          totalKcal: atividadesTemp.reduce((s, a) => s + a.calorias, 0),
          totalMoedasColetadas,
          moedasPotenciais,
          eficienciaColeta,
          diasComColeta,
          diasNoMes: dias,
          nivelFinal: state.cidade.nivel,
          porteFinal: state.cidade.porte,
        }
      },

      _sortearCartas: (pacote) => {
        const state = get()
        const cartas = state.catalogo.cartas
        const sorteio = []

        const probs = pacote.probabilidades || { S: 0, A: 0, B: 0, C: 100 }
        const rankParaRaridade = { S: 'lendario', A: 'epico', B: 'raro', C: 'comum' }

        const porRaridade = { lendario: [], epico: [], raro: [], comum: [] }
        Object.values(cartas).forEach((c) => {
          if (porRaridade[c.raridade]) porRaridade[c.raridade].push(c.id)
        })

        for (let i = 0; i < pacote.quantidade; i++) {
          const roll = Math.random() * 100
          let acumulado = 0
          let raridadeSorteada = 'comum'

          for (const [rank, prob] of Object.entries(probs)) {
            acumulado += prob
            if (roll <= acumulado) {
              raridadeSorteada = rankParaRaridade[rank]
              break
            }
          }

          const pool = porRaridade[raridadeSorteada]
          if (pool.length > 0) {
            const cartaId = pool[Math.floor(Math.random() * pool.length)]
            sorteio.push(cartaId)
          }
        }

        return sorteio
      },
    }),
    {
      name: 'fitcity-storage',
      version: 3,   // ← bump por remoção de campos
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        progressao: state.progressao,
        economia: state.economia,
        atividades: state.atividades,
        inventario: state.inventario,
        cidade: state.cidade,
        social: state.social,
      }),
      migrate: (persisted, version) => {
        // Remove campos que não existem mais
        if (persisted?.cidade) {
          delete persisted.cidade.pacoteVisualAtivo
          delete persisted.cidade.pacotesVisuaisDesbloqueados
        }
        return persisted
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.verificarViradaDeMes()
      },
    }
  )
)