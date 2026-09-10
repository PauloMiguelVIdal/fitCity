// MockCardTest.jsx
import React from 'react';
import { CardMinimal } from './CardMinimal';
import { DadosEconomyGlobalContext } from '../context/dadosEconomyGlobal';
import { CentraldeDadosContext } from '../context/centralDeDadosContext';

// ============================================
// DADOS MOCKADOS COMPLETOS
// ============================================

// 1. Configuração dos setores
const SETORES_CONFIG = {
  agricultura: {
    id: "agricultura",
    cor1: "#003816",
    cor2: "#1A5E2A",
    cor3: "#0C9123",
    cor4: "#4CAF50",
    img: "/agricultura.png",
    descLicença: "Licença de Agricultura"
  },
  tecnologia: {
    id: "tecnologia",
    cor1: "#A64B00",
    cor2: "#D45A00",
    cor3: "#FF6F00",
    cor4: "#FF8C42",
    img: "/tecnologia.png",
    descLicença: "Licença de Tecnologia"
  },
  comercio: {
    id: "comercio",
    cor1: "#660000",
    cor2: "#A31919",
    cor3: "#E60000",
    cor4: "#FF4D4D",
    img: "/comercio.png",
    descLicença: "Licença de Comércio"
  },
  industria: {
    id: "industria",
    cor1: "#1A1A1A",
    cor2: "#4D4D4D",
    cor3: "#808080",
    cor4: "#B3B3B3",
    img: "/industria.png",
    descLicença: "Licença de Indústria"
  },
  imobiliario: {
    id: "imobiliario",
    cor1: "#000066",
    cor2: "#1A1A8C",
    cor3: "#3333CC",
    cor4: "#6666FF",
    img: "/imobiliario.png",
    descLicença: "Licença Imobiliária"
  },
  energia: {
    id: "energia",
    cor1: "#665200",
    cor2: "#A37F19",
    cor3: "#E6B800",
    cor4: "#FFD966",
    img: "/energia.png",
    descLicença: "Licença de Energia"
  }
};

// 2. Criação de um edifício mockado
const criarEdificioMock = (overrides = {}) => ({
  nome: "Plantação De Grãos",
  quantidade: 0,
  custoConstrucao: 150000,
  lojasNecessarias: {
    terrenos: 1,
    lojasP: 0,
    lojasM: 0,
    lojasG: 0
  },
  construçõesNecessárias: [],
  recursoDeConstrução: [],
  powerUp: {
    nível1: { quantidadeMínima: 0, ativo: false },
    nível2: { quantidadeMínima: 5, ativo: false },
    nível3: { quantidadeMínima: 25, ativo: false }
  },
  finanças: {
    faturamentoUnitário: 1200,
    impostoFixo: 100,
    impostoSobreFatu: 0.15
  },
  ForneceMelhoraEficiencia: [],
  RecebeMelhoraEficiencia: [],
  ...overrides
});

// 3. Dados completos do contexto CentraldeDados
const criarDadosMock = (setorAtivo = "agricultura", index = 0) => {
  const edificios = {
    agricultura: [
      criarEdificioMock({ 
        nome: "Plantação De Grãos",
        custoConstrucao: 150000,
        quantidade: 2
      }),
      criarEdificioMock({ 
        nome: "Fazenda De Vacas",
        custoConstrucao: 250000,
        quantidade: 1
      })
    ],
    tecnologia: [
      criarEdificioMock({ 
        nome: "Fábrica De Smartphones",
        custoConstrucao: 500000,
        quantidade: 0
      })
    ],
    comercio: [
      criarEdificioMock({ 
        nome: "Mercado",
        custoConstrucao: 100000,
        quantidade: 0,
        lojasNecessarias: {
          terrenos: 1,
          lojasP: 1,
          lojasM: 0,
          lojasG: 0
        }
      })
    ],
    industria: [
      criarEdificioMock({ 
        nome: "Serraria",
        custoConstrucao: 200000,
        quantidade: 0
      })
    ],
    imobiliario: [
      criarEdificioMock({ 
        nome: "Construtora",
        custoConstrucao: 300000,
        quantidade: 0
      })
    ],
    energia: [
      criarEdificioMock({ 
        nome: "Usina Solar",
        custoConstrucao: 400000,
        quantidade: 0
      })
    ]
  };

  return {
    agricultura: { edificios: edificios.agricultura },
    tecnologia: { edificios: edificios.tecnologia },
    comercio: { edificios: edificios.comercio },
    industria: { edificios: edificios.industria },
    imobiliario: { edificios: edificios.imobiliario },
    energia: { edificios: edificios.energia },
    terrenos: { quantidade: 5, preçoConstrução: 50000 },
    lojasP: { quantidade: 3, preçoConstrução: 80000, quantidadeNecTerreno: 1 },
    lojasM: { quantidade: 2, preçoConstrução: 150000, quantidadeNecTerreno: 2 },
    lojasG: { quantidade: 1, preçoConstrução: 300000, quantidadeNecTerreno: 3 },
    modalAlert: { estadoModal: false, head: "", content: "" },
    dia: 1
  };
};

// 4. Dados do contexto DadosEconomyGlobal
const criarEconomiaMock = (setorAtivo = "agricultura") => ({
  saldo: 10000000,
  patrimonio: 5000000,
  economiaSetores: {
    agricultura: "estável",
    tecnologia: "estável",
    comercio: "estável",
    industria: "estável",
    imobiliario: "estável",
    energia: "estável"
  },
  carteira: {
    carteiraAtual: [
      [], // agricultura
      [], // tecnologia
      [], // comercio
      [], // industria
      [], // imobiliario
      []  // energia
    ]
  },
  centralEdificios: {
    quantidadeSetoresAtual: 0,
    QuantidadeEdifíciosAtual: 0,
    QuantidadeDiversosEdificiosAtual: 0
  }
});

// 5. Funções mockadas dos contextos
const criarMockFunctions = (dados, setEconomia) => ({
  atualizarDados: (path, value) => {
    console.log('📝 atualizarDados chamado:', { path, value });
  },
  atualizarDadosProf2: (path, value) => {
    console.log('📝 atualizarDadosProf2 chamado:', { path, value });
  },
  atualizarDadosProf3: (path, value) => {
    console.log('📝 atualizarDadosProf3 chamado:', { path, value });
  },
  atualizarDadosProf: (path, value) => {
    console.log('📝 atualizarDadosProf chamado:', { path, value });
  },
  atualizarEco: (key, value) => {
    console.log('💰 atualizarEco chamado:', { key, value });
    setEconomia(prev => ({ ...prev, [key]: value }));
  },
  verificarLimites: (edif, setor, carteira) => {
    return true; // Mock: sempre permite
  }
});

// ============================================
// COMPONENTE DE TESTE
// ============================================

export const MockCardTest = () => {
  const [economia, setEconomia] = React.useState(criarEconomiaMock());
  const [dados, setDados] = React.useState(criarDadosMock());
  
  const mockFunctions = criarMockFunctions(dados, setEconomia);

  // Wrapper dos contextos
  const centralContextValue = {
    dados,
    ...mockFunctions,
    atualizarDados: (path, value) => {
      setDados(prev => {
        const novo = { ...prev };
        // Simples mock de atualização
        if (typeof path === 'string') {
          novo[path] = value;
        }
        return novo;
      });
    }
  };

  const economyContextValue = {
    ...economia,
    economiaSetores: economia.economiaSetores,
    ...mockFunctions
  };

  // Estado para controlar qual card testar
  const [testConfig, setTestConfig] = React.useState({
    setor: "agricultura",
    index: 0
  });

  // Função para mudar o card em teste
  const mudarCard = (setor, index) => {
    setTestConfig({ setor, index });
  };

  return (
    <div style={{ 
      padding: '40px', 
      background: '#0a0a1a', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '30px'
    }}>
      <h1 style={{ color: '#fff', fontFamily: 'Arial' }}>🧪 Teste do CardMinimal</h1>
      
      {/* Controles para testar diferentes cards */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => mudarCard("agricultura", 0)}
          style={{ 
            padding: '8px 16px', 
            background: testConfig.setor === "agricultura" ? '#4CAF50' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🌾 Plantação De Grãos
        </button>
        <button 
          onClick={() => mudarCard("agricultura", 1)}
          style={{ 
            padding: '8px 16px', 
            background: testConfig.setor === "agricultura" && testConfig.index === 1 ? '#4CAF50' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🐄 Fazenda De Vacas
        </button>
        <button 
          onClick={() => mudarCard("comercio", 0)}
          style={{ 
            padding: '8px 16px', 
            background: testConfig.setor === "comercio" ? '#FF4D4D' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🏪 Mercado
        </button>
        <button 
          onClick={() => mudarCard("tecnologia", 0)}
          style={{ 
            padding: '8px 16px', 
            background: testConfig.setor === "tecnologia" ? '#FF8C42' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          📱 Fábrica Smartphones
        </button>
      </div>

      {/* Info do card atual */}
      <div style={{ 
        color: '#888', 
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        Testando: {testConfig.setor} → {dados[testConfig.setor]?.edificios?.[testConfig.index]?.nome || 'N/A'}
      </div>

      {/* Renderização do card com os contextos */}
      <CentraldeDadosContext.Provider value={centralContextValue}>
        <DadosEconomyGlobalContext.Provider value={economyContextValue}>
          <CardMinimal 
            index={testConfig.index} 
            setor={testConfig.setor} 
          />
        </DadosEconomyGlobalContext.Provider>
      </CentraldeDadosContext.Provider>

      {/* Debug info */}
      <div style={{ 
        color: '#666', 
        fontSize: '12px', 
        fontFamily: 'monospace',
        maxWidth: '600px',
        background: '#1a1a2e',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        overflow: 'auto',
        maxHeight: '300px'
      }}>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>📊 Estado Atual</h3>
        <pre style={{ color: '#8f8' }}>
          {JSON.stringify({
            saldo: economia.saldo,
            setorEconomia: economia.economiaSetores[testConfig.setor],
            edificio: dados[testConfig.setor]?.edificios?.[testConfig.index]?.nome,
            quantidade: dados[testConfig.setor]?.edificios?.[testConfig.index]?.quantidade,
            terrenos: dados.terrenos.quantidade,
            lojasP: dados.lojasP.quantidade,
            lojasM: dados.lojasM.quantidade,
            lojasG: dados.lojasG.quantidade
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default MockCardTest;