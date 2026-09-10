// MockCardStandalone.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";

// ============================================
// IMAGENS MOCKADAS (substitui os imports)
// ============================================
const IMAGENS_MOCK = {
  // Setores
  agricultura: "🌾",
  tecnologia: "💻",
  comercio: "🛒",
  industria: "🏭",
  imobiliario: "🏢",
  energia: "⚡",
  grafico: "📊",
  
  // Ícones
  "simbolo-de-porcentagem": "%",
  "rendaPassiva": "💰",
  "terreno": "🗺️",
  "construção necessária": "🔨",
  "proximo": "▶️",
  "martelo": "🔨",
  "licença": "📜",
  "simbolo-do-dolar": "$",
  "lojaP": "🏪",
  "lojaM": "🏬",
  "lojaG": "🏛️",
  "fechar": "❌",
  "imgLucroLiquido": "📈",
  "imgFaturamentoMensal": "📊",
  "imgPercFaturamento": "📉",
  "imgSomaImpostos": "🧾",
  "imgImpostoFixo": "💰",
  "imgFaturamentoDiario": "📅",
  "imgImpostoSfatu": "💸",
  "sanção": "⚖️",
  "plantação": "🌱"
};

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
    img: "🌾",
    descLicença: "Licença de Agricultura"
  },
  tecnologia: {
    id: "tecnologia",
    cor1: "#A64B00",
    cor2: "#D45A00",
    cor3: "#FF6F00",
    cor4: "#FF8C42",
    img: "💻",
    descLicença: "Licença de Tecnologia"
  },
  comercio: {
    id: "comercio",
    cor1: "#660000",
    cor2: "#A31919",
    cor3: "#E60000",
    cor4: "#FF4D4D",
    img: "🛒",
    descLicença: "Licença de Comércio"
  },
  industria: {
    id: "industria",
    cor1: "#1A1A1A",
    cor2: "#4D4D4D",
    cor3: "#808080",
    cor4: "#B3B3B3",
    img: "🏭",
    descLicença: "Licença de Indústria"
  },
  imobiliario: {
    id: "imobiliario",
    cor1: "#000066",
    cor2: "#1A1A8C",
    cor3: "#3333CC",
    cor4: "#6666FF",
    img: "🏢",
    descLicença: "Licença Imobiliária"
  },
  energia: {
    id: "energia",
    cor1: "#665200",
    cor2: "#A37F19",
    cor3: "#E6B800",
    cor4: "#FFD966",
    img: "⚡",
    descLicença: "Licença de Energia"
  }
};

// 2. Lista de edifícios por setor
const EDIFICIOS_POR_SETOR = {
  agricultura: [
    { nome: "Plantação De Grãos", custoConstrucao: 150000, faturamentoUnitario: 1200, impostoFixo: 100, impostoSobreFatu: 0.15 },
    { nome: "Fazenda De Vacas", custoConstrucao: 250000, faturamentoUnitario: 2000, impostoFixo: 150, impostoSobreFatu: 0.18 },
    { nome: "Plantação De Eucalipto", custoConstrucao: 180000, faturamentoUnitario: 1400, impostoFixo: 120, impostoSobreFatu: 0.16 },
    { nome: "Granja De Aves", custoConstrucao: 200000, faturamentoUnitario: 1600, impostoFixo: 130, impostoSobreFatu: 0.17 },
    { nome: "Criação De Ovinos", custoConstrucao: 220000, faturamentoUnitario: 1800, impostoFixo: 140, impostoSobreFatu: 0.17 }
  ],
  tecnologia: [
    { nome: "Fábrica De Smartphones", custoConstrucao: 500000, faturamentoUnitario: 5000, impostoFixo: 300, impostoSobreFatu: 0.20 },
    { nome: "Fábrica De Computadores", custoConstrucao: 600000, faturamentoUnitario: 6000, impostoFixo: 350, impostoSobreFatu: 0.22 },
    { nome: "Fábrica De Consoles De Jogos", custoConstrucao: 450000, faturamentoUnitario: 4500, impostoFixo: 280, impostoSobreFatu: 0.19 }
  ],
  comercio: [
    { nome: "Mercado", custoConstrucao: 100000, faturamentoUnitario: 800, impostoFixo: 80, impostoSobreFatu: 0.12 },
    { nome: "Livraria", custoConstrucao: 80000, faturamentoUnitario: 600, impostoFixo: 60, impostoSobreFatu: 0.10 },
    { nome: "Farmácia", custoConstrucao: 120000, faturamentoUnitario: 1000, impostoFixo: 90, impostoSobreFatu: 0.13 }
  ],
  industria: [
    { nome: "Serraria", custoConstrucao: 200000, faturamentoUnitario: 1800, impostoFixo: 150, impostoSobreFatu: 0.16 },
    { nome: "Fábrica Têxtil", custoConstrucao: 300000, faturamentoUnitario: 2500, impostoFixo: 200, impostoSobreFatu: 0.18 },
    { nome: "Fábrica De Papel", custoConstrucao: 250000, faturamentoUnitario: 2200, impostoFixo: 180, impostoSobreFatu: 0.17 }
  ],
  imobiliario: [
    { nome: "Construtora", custoConstrucao: 300000, faturamentoUnitario: 3000, impostoFixo: 250, impostoSobreFatu: 0.18 },
    { nome: "Imobiliária Residencial", custoConstrucao: 200000, faturamentoUnitario: 2000, impostoFixo: 150, impostoSobreFatu: 0.15 }
  ],
  energia: [
    { nome: "Usina Solar", custoConstrucao: 400000, faturamentoUnitario: 4000, impostoFixo: 300, impostoSobreFatu: 0.20 },
    { nome: "Parque Eólico", custoConstrucao: 500000, faturamentoUnitario: 5000, impostoFixo: 350, impostoSobreFatu: 0.22 }
  ]
};

// 3. Dados completos
const criarDadosMock = (setorAtivo = "agricultura", index = 0) => {
  const edificios = {};
  const setores = ["agricultura", "tecnologia", "comercio", "industria", "imobiliario", "energia"];
  
  setores.forEach(setor => {
    edificios[setor] = EDIFICIOS_POR_SETOR[setor].map((ed, i) => ({
      nome: ed.nome,
      quantidade: i === 0 && setor === setorAtivo ? 2 : 0,
      custoConstrucao: ed.custoConstrucao,
      lojasNecessarias: {
        terrenos: ed.nome === "Mercado" ? 1 : (ed.nome.includes("Loja") ? 1 : 0),
        lojasP: ed.nome === "Mercado" ? 1 : 0,
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
        faturamentoUnitário: ed.faturamentoUnitario,
        impostoFixo: ed.impostoFixo,
        impostoSobreFatu: ed.impostoSobreFatu
      },
      ForneceMelhoraEficiencia: [],
      RecebeMelhoraEficiencia: []
    }));
  });

  return {
    ...edificios,
    terrenos: { quantidade: 5, preçoConstrução: 50000 },
    lojasP: { quantidade: 3, preçoConstrução: 80000, quantidadeNecTerreno: 1 },
    lojasM: { quantidade: 2, preçoConstrução: 150000, quantidadeNecTerreno: 2 },
    lojasG: { quantidade: 1, preçoConstrução: 300000, quantidadeNecTerreno: 3 },
    modalAlert: { estadoModal: false, head: "", content: "" },
    dia: 1
  };
};

// 4. Dados de economia
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
    carteiraAtual: [[], [], [], [], [], []]
  },
  centralEdificios: {
    quantidadeSetoresAtual: 0,
    QuantidadeEdifíciosAtual: 0,
    QuantidadeDiversosEdificiosAtual: 0
  }
});

// ============================================
// COMPONENTE CARD MINIMAL (VERSÃO STANDALONE)
// ============================================

const CardMinimalStandalone = ({ index = 0, setor = "agricultura" }) => {
  // ── ESTADOS ──────────────────────────────────────────
  const [dados, setDados] = useState(() => criarDadosMock(setor, index));
  const [economia, setEconomia] = useState(() => criarEconomiaMock(setor));
  const [flipped, setFlipped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [modalPowerup, setModalPowerUp] = useState(false);
  const [verificadorDeLojasNecessárias, setVerificador] = useState(true);
  const [verificadorDeConstruçõesNecessárias, setVerificadorConstr] = useState(true);

  // ── HELPERS ──────────────────────────────────────────
  const setoresArr = ["agricultura", "tecnologia", "comercio", "industria", "imobiliario", "energia"];
  
  const getImageUrl = (nome) => {
    // Tenta encontrar a imagem no mock
    if (IMAGENS_MOCK[nome]) return IMAGENS_MOCK[nome];
    // Fallback: retorna a primeira letra ou emoji genérico
    return `📦`;
  };

  const formatarNumero = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(1).replace(".0", "") + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(1).replace(".0", "") + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(".0", "") + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1).replace(".0", "") + "K";
    return num.toString();
  };

  // ── RARIDADE ──────────────────────────────────────────
  const getRaridade = (custo) => {
    if (custo >= 50_000_000) return "lendario";
    if (custo >= 10_000_000) return "epico";
    if (custo >= 1_000_000) return "raro";
    if (custo >= 500_000) return "incomum";
    return "comum";
  };

  const RARIDADE_CONFIG = {
    comum: { label: "Comum", stars: 1, cor: "#3a8c42", corText: "#a8ffb0", corBg: "#0c2210", corBorder: "#3a8c4244" },
    incomum: { label: "Incomum", stars: 2, cor: "#4488ff", corText: "#88ccff", corBg: "#001030", corBorder: "#4488ff44" },
    raro: { label: "Raro", stars: 3, cor: "#9944ff", corText: "#cc88ff", corBg: "#180030", corBorder: "#9944ff44" },
    epico: { label: "Épico", stars: 4, cor: "#ff9933", corText: "#ffcc88", corBg: "#2a0c00", corBorder: "#ff993344" },
    lendario: { label: "Lendário", stars: 5, cor: "#ffd700", corText: "#fff8d0", corBg: "#1a1000", corBorder: "#ffd70066" }
  };

  // ── DADOS DO EDIFÍCIO ATUAL ──────────────────────────
  const setorInfo = SETORES_CONFIG[setor];
  const edifAtual = dados[setor]?.edificios?.[index];
  const nomeAtual = edifAtual?.nome || "Edifício";
  const quantidadeAtual = edifAtual?.quantidade || 0;
  const custoConstrucao = edifAtual?.custoConstrucao || 0;
  const lojasNecessarias = edifAtual?.lojasNecessarias || { terrenos: 0, lojasP: 0, lojasM: 0, lojasG: 0 };
  
  // Finanças
  const valorFatu = edifAtual?.finanças?.faturamentoUnitario || 0;
  const valorImpostoFixo = edifAtual?.finanças?.impostoFixo || 0;
  const impostoSobreFatu = edifAtual?.finanças?.impostoSobreFatu || 0;

  // ── CATEGORIA ──────────────────────────────────────────
  const producaoList = ["Plantação De Grãos", "Fazenda De Vacas", "Plantação De Eucalipto", "Granja De Aves", "Criação De Ovinos", "Serraria"];
  const vendaList = ["Mercado", "Livraria", "Farmácia"];
  const estoqueList = ["Armazém", "Silo"];

  const categoriaEdificio = (() => {
    if (estoqueList.includes(nomeAtual)) return "estoque";
    if (producaoList.includes(nomeAtual)) return "producao";
    if (vendaList.includes(nomeAtual)) return "venda";
    return "passiva";
  })();

  const isEstoque = categoriaEdificio === "estoque";
  const isProducao = categoriaEdificio === "producao";
  const isVenda = categoriaEdificio === "venda";
  const isPassiva = categoriaEdificio === "passiva";

  // ── POWERUP ──────────────────────────────────────────
  const quantidadeMinimaPowerUpNv2 = edifAtual?.powerUp?.nível2?.quantidadeMínima || 5;
  const quantidadeMinimaPowerUpNv3 = edifAtual?.powerUp?.nível3?.quantidadeMínima || 25;

  const powerUpSelecionado = quantidadeAtual >= quantidadeMinimaPowerUpNv3 ? "powerUpNv3" 
    : quantidadeAtual >= quantidadeMinimaPowerUpNv2 ? "powerUpNv2" 
    : "powerUpNv1";

  const corPowerUp = (pu) => {
    switch (pu) {
      case "powerUpNv1": return "#8F5ADA";
      case "powerUpNv2": return "#6411D9";
      case "powerUpNv3": return "#350973";
      default: return setorInfo.cor2;
    }
  };

  const corPowerUpAtual = corPowerUp(powerUpSelecionado);

  const gradientLevel = () => {
    if (powerUpSelecionado === "powerUpNv3") return "#FFD700";
    if (powerUpSelecionado === "powerUpNv2") return "#6411D9";
    return setorInfo.cor2;
  };

  // ── CÁLCULOS FINANCEIROS ──────────────────────────────
  const economiaSetor = economia.economiaSetores[setor] || "estável";
  const fatorEconomico = { recessão: 0.4, declinio: 0.8, estável: 1, progressiva: 1.1, aquecida: 1.25 }[economiaSetor] || 1;

  const fatuMensal = valorFatu * 30 * fatorEconomico;
  const impostoFinal = impostoSobreFatu * fatuMensal;
  const valorFinalMês = fatuMensal - impostoFinal - valorImpostoFixo;

  // ── CUSTO TOTAL ──────────────────────────────────────
  const totalCusto = custoConstrucao + 
    (lojasNecessarias.terrenos * 50000) +
    (lojasNecessarias.lojasP * 80000) +
    (lojasNecessarias.lojasM * 150000) +
    (lojasNecessarias.lojasG * 300000);

  const raridade = getRaridade(totalCusto);
  const rConfig = RARIDADE_CONFIG[raridade];

  // ── GRADIENTES ──────────────────────────────────────
  const getGradientByLevel = () => {
    if (powerUpSelecionado === "powerUpNv3") {
      return `linear-gradient(135deg, #7a5500 0%, #b8870b 20%, #F27405 40%, #FFD700 60%, #F27405 80%, #7a5500 100%)`;
    }
    if (powerUpSelecionado === "powerUpNv2") {
      return `linear-gradient(135deg, #350973 0%, #6411D9 25%, #8F5ADA 50%, #6411D9 75%, #350973 100%)`;
    }
    return `transparent`;
  };

  const getGradient = () => {
    if (isProducao) {
      return `radial-gradient(circle at 2% 50%, ${setorInfo.cor1}99 0%, ${setorInfo.cor4}FF 40%, ${gradientLevel()}CC 70%, ${setorInfo.cor4}FF 80%, ${setorInfo.cor2}B3 85%, ${setorInfo.cor1}99 92%, ${setorInfo.cor2}B3 98%, ${setorInfo.cor4}FF 100%)`;
    }
    if (isVenda) {
      return `radial-gradient(circle at 100% 0%, ${setorInfo.cor1}11 0%, ${gradientLevel()}CC 12%, ${setorInfo.cor4}CC 28%, ${setorInfo.cor3}FF 48%, ${setorInfo.cor3}FF 62%, ${gradientLevel()}99 80%, ${setorInfo.cor1}11 100%)`;
    }
    if (isEstoque) {
      return `linear-gradient(190deg, ${gradientLevel()}15 0%, ${setorInfo.cor4}EE 28%, ${setorInfo.cor3}CC 50%, ${setorInfo.cor4}EE 70%, ${setorInfo.cor1}77 100%)`;
    }
    if (isPassiva) {
      return `linear-gradient(135deg, ${gradientLevel()}FF 0%, ${setorInfo.cor2}77 15%, ${setorInfo.cor3}BB 35%, ${setorInfo.cor4}FF 52%, ${setorInfo.cor3}99 70%, ${setorInfo.cor1}FF 100%)`;
    }
    return `radial-gradient(circle at center, ${setorInfo.cor3} 0%, rgba(255,255,255,0) 70%)`;
  };

  const getBordaDinamica = () => {
    if (isProducao) {
      return {
        border: `2px solid ${setorInfo.cor1}55`,
        boxShadow: `0 0 0 1px ${setorInfo.cor3}88`,
        borderRadius: "25px 10px 25px 10px"
      };
    }
    if (isEstoque) {
      return {
        border: `2px solid ${setorInfo.cor2}`,
        boxShadow: `0 0 0 3px ${setorInfo.cor3}88`,
        borderRadius: "20px 20px 20px 20px"
      };
    }
    if (isVenda) {
      return {
        borderRadius: "20px 20px 20px 20px",
        border: `1.5px solid ${setorInfo.cor3}`
      };
    }
    if (isPassiva) {
      return {
        border: `1px solid ${setorInfo.cor3}55`,
        boxShadow: `0 0 0 1px ${setorInfo.cor1}88`,
        borderRadius: "20px 20px 20px 20px"
      };
    }
    return { borderRadius: "20px 20px 20px 20px" };
  };

  // ── FUNÇÕES DE AÇÃO MOCK ──────────────────────────────
  const handleFlip = () => setFlipped(!flipped);
  const handleMouseEnter = () => setIsModalOpen(true);
  const handleMouseLeave = () => setIsModalOpen(false);

  const comprarCard = () => {
    console.log(`🛒 Comprando: ${nomeAtual} (${setor})`);
    const novoQuantidade = quantidadeAtual + 1;
    
    // Atualiza dados
    setDados(prev => {
      const novo = { ...prev };
      novo[setor].edificios[index] = {
        ...novo[setor].edificios[index],
        quantidade: novoQuantidade
      };
      return novo;
    });

    // Atualiza economia
    setEconomia(prev => ({
      ...prev,
      saldo: prev.saldo - custoConstrucao,
      patrimonio: prev.patrimonio + custoConstrucao
    }));
  };

  // ── VERIFICAÇÕES ──────────────────────────────────────
  const podeComprar = economia.saldo >= custoConstrucao && 
    dados.terrenos.quantidade >= (lojasNecessarias.terrenos || 0) &&
    dados.lojasP.quantidade >= (lojasNecessarias.lojasP || 0) &&
    dados.lojasM.quantidade >= (lojasNecessarias.lojasM || 0) &&
    dados.lojasG.quantidade >= (lojasNecessarias.lojasG || 0);

  // ── RENDER ──────────────────────────────────────────
  const getIconeCategoria = () => {
    if (isProducao) return "🏭";
    if (isVenda) return "🛒";
    if (isEstoque) return "📦";
    if (isPassiva) return "💰";
    return "📄";
  };

  return (
    <motion.div
      style={{
        background: getGradientByLevel(),
        ...getBordaDinamica(),
        width: "220px",
        height: "320px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        position: "relative",
        overflow: "hidden",
      }}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ── FRENTE DO CARD ── */}
        <div
          className="absolute w-full h-full flex items-center justify-center"
          style={{
            background: getGradient(),
            borderRadius: "20px",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="w-[90%] h-[90%] flex flex-col items-center justify-between py-3">
            {/* Imagem + Nome */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2 w-full">
              {/* Badge de raridade */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 15,
                  fontSize: 7,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: `${setorInfo.cor1}cc`,
                  color: setorInfo.cor4,
                  border: `1px solid ${setorInfo.cor4}66`,
                }}
              >
                {rConfig.label}
              </div>

              {/* Categoria Icon */}
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  zIndex: 15,
                  fontSize: 16,
                }}
              >
                {getIconeCategoria()}
              </div>

              {/* Box da imagem */}
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${setorInfo.cor1} 0%, ${setorInfo.cor2} 100%)`,
                  border: `1px solid ${setorInfo.cor3}66`,
                  boxShadow: `0 4px 20px ${setorInfo.cor4}33, inset 0 0 20px ${setorInfo.cor1}88`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  flexShrink: 0,
                  fontSize: 40,
                }}
              >
                <span style={{ filter: `drop-shadow(0 0 8px ${setorInfo.cor4}88)` }}>
                  {getImageUrl(nomeAtual)}
                </span>

                {/* Estrelas */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 5,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    fontSize: 8,
                    color: setorInfo.cor4,
                    textShadow: raridade === "lendario" ? `0 0 6px ${setorInfo.cor4}` : "none",
                  }}
                >
                  {"★".repeat(rConfig.stars)}
                </div>
              </div>

              {/* Divisor */}
              <div
                style={{
                  width: "85%",
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${setorInfo.cor4}, transparent)`,
                  boxShadow:
                    raridade === "lendario" || raridade === "epico"
                      ? `0 0 6px ${setorInfo.cor4}88`
                      : "none",
                }}
              />

              {/* Nome */}
              <h1
                className="text-center text-white"
                style={{
                  fontSize: 12,
                  lineHeight: 1.3,
                  maxWidth: "85%",
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  fontWeight: 700,
                  textShadow:
                    raridade === "lendario"
                      ? `0 0 10px ${setorInfo.cor4}88, 0 1px 4px #00000088`
                      : `0 1px 6px #00000088`,
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                {nomeAtual}
              </h1>
            </div>

            {/* Quantidade e Custo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                justifyContent: "center",
                padding: "4px 0",
              }}
            >
              {/* Quantidade */}
              <div
                style={{
                  padding: "2px 10px",
                  borderRadius: 6,
                  background: setorInfo.cor1,
                  color: setorInfo.cor4,
                  border: `1px solid ${setorInfo.cor3}66`,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                {quantidadeAtual}x
              </div>

              {/* Custo */}
              <div
                style={{
                  padding: "2px 10px",
                  borderRadius: 6,
                  background: setorInfo.cor1,
                  color: setorInfo.cor4,
                  border: `1px solid ${setorInfo.cor3}66`,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                ${formatarNumero(totalCusto)}
              </div>
            </div>

            {/* Botão Comprar (Mock) */}
            <button
              onClick={comprarCard}
              disabled={!podeComprar}
              style={{
                padding: "4px 16px",
                borderRadius: 6,
                border: "none",
                background: podeComprar ? setorInfo.cor4 : "#555",
                color: podeComprar ? "#fff" : "#999",
                fontSize: 10,
                fontWeight: 700,
                cursor: podeComprar ? "pointer" : "not-allowed",
                fontFamily: "'Rajdhani', sans-serif",
                textTransform: "uppercase",
                letterSpacing: ".05em",
                transition: "all 0.2s",
                boxShadow: podeComprar ? `0 4px 12px ${setorInfo.cor4}44` : "none",
              }}
            >
              {podeComprar ? "🛒 Comprar" : "🔒 Bloqueado"}
            </button>

            {/* Info extra (hover) */}
            {isModalOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: 50,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.9)",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 9,
                  fontFamily: "'Rajdhani', sans-serif",
                  width: "90%",
                  textAlign: "center",
                  zIndex: 20,
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${setorInfo.cor4}44`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span>📊 Fatu: ${formatarNumero(valorFatu)}/dia</span>
                  <span>💰 Lucro: ${formatarNumero(valorFinalMês)}/mês</span>
                </div>
                <div style={{ fontSize: 8, color: "#888", marginTop: 4 }}>
                  {economiaSetor.toUpperCase()} • {rConfig.label}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── VERSO DO CARD (opcional) ── */}
        <div
          className="absolute w-full h-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${setorInfo.cor1}, ${setorInfo.cor2})`,
            borderRadius: "20px",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-center text-white p-4">
            <div style={{ fontSize: 32, marginBottom: 8 }}>{getImageUrl(nomeAtual)}</div>
            <h3 style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>
              {nomeAtual}
            </h3>
            <div style={{ fontSize: 10, color: setorInfo.cor4, marginTop: 8 }}>
              {setorInfo.descLicença}
            </div>
            <div style={{ fontSize: 9, color: "#888", marginTop: 12 }}>
              ${formatarNumero(totalCusto)} • {rConfig.label}
            </div>
            <button
              onClick={handleFlip}
              style={{
                marginTop: 12,
                padding: "4px 12px",
                borderRadius: 4,
                border: `1px solid ${setorInfo.cor4}`,
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
                fontSize: 10,
              }}
            >
              🔄 Virar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE DE TESTE COM CONTROLES
// ============================================

export const MockCardTest = () => {
  const [setorAtual, setSetorAtual] = useState("industria");
  const [indexAtual, setIndexAtual] = useState(0);

  const setores = ["agricultura", "tecnologia", "comercio", "industria", "imobiliario", "energia"];
  
  const getEdificiosDoSetor = (setor) => {
    return EDIFICIOS_POR_SETOR[setor] || [];
  };

  const edificios = getEdificiosDoSetor(setorAtual);
  const setorInfo = SETORES_CONFIG[setorAtual];

  return (
    <div style={{
      padding: "40px",
      background: "#0a0a1a",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "30px",
      fontFamily: "'Rajdhani', sans-serif"
    }}>
      <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, letterSpacing: ".05em" }}>
        🧪 CardMinimal - Teste Standalone
      </h1>

      {/* Seletor de Setor */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
        {setores.map(s => (
          <button
            key={s}
            onClick={() => { setSetorAtual(s); setIndexAtual(0); }}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `2px solid ${setorAtual === s ? SETORES_CONFIG[s].cor4 : "#333"}`,
              background: setorAtual === s ? SETORES_CONFIG[s].cor2 : "#1a1a2e",
              color: "#fff",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.2s",
            }}
          >
            {SETORES_CONFIG[s].img} {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Seletor de Edifício */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
        {edificios.map((ed, i) => (
          <button
            key={i}
            onClick={() => setIndexAtual(i)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: `1px solid ${indexAtual === i ? setorInfo.cor4 : "#333"}`,
              background: indexAtual === i ? setorInfo.cor2 : "#1a1a2e",
              color: "#fff",
              cursor: "pointer",
              fontSize: 10,
              transition: "all 0.2s",
            }}
          >
            {i === indexAtual ? "▶ " : ""}{ed.nome}
          </button>
        ))}
      </div>

      {/* Card */}
      <CardMinimalStandalone index={indexAtual} setor={setorAtual} />

      {/* Info de Debug */}
      <div style={{
        color: "#666",
        fontSize: 12,
        fontFamily: "monospace",
        maxWidth: "600px",
        background: "#1a1a2e",
        padding: "20px",
        borderRadius: 12,
        marginTop: 10,
        overflow: "auto",
        maxHeight: "250px",
        width: "100%",
        border: `1px solid ${setorInfo.cor3}33`
      }}>
        <h3 style={{ color: "#fff", marginBottom: 10, fontSize: 14 }}>
          📊 Debug Info
        </h3>
        <pre style={{ color: "#8f8", fontSize: 11 }}>
          {JSON.stringify({
            setor: setorAtual,
            edificio: edificios[indexAtual]?.nome,
            quantidade: 20, // Será atualizado pelo card
            categoria: "calculado internamente",
            raridade: "calculado internamente",
          }, null, 2)}
        </pre>
        <div style={{ color: "#888", marginTop: 8, fontSize: 10 }}>
          💡 Clique em "Comprar" para testar a interação
        </div>
      </div>
    </div>
  );
};

export default CardMinimalStandalone;