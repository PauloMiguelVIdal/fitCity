// src/components/CardMinimal.jsx
import { memo, useMemo } from "react";
import { Maximize2 } from "lucide-react";

const getImageUrl = (nome) => `/imagens/${nome}.png`;

// ============================================================
// CONFIG DE RARIDADE + POWER-UP
// ============================================================
const RARIDADE_POWERUP = {
  comum:    { quantidadeMinimaNv2: 20, quantidadeMinimaNv3: 50, qtdMaxima: 100 },
  raro:     { quantidadeMinimaNv2: 15, quantidadeMinimaNv3: 40, qtdMaxima: 80  },
  epico:    { quantidadeMinimaNv2: 10, quantidadeMinimaNv3: 20, qtdMaxima: 50  },
  lendario: { quantidadeMinimaNv2: 2,  quantidadeMinimaNv3: 5,  qtdMaxima: 10  },
};

// ============================================================
// CATEGORIAS
// ============================================================
const PRODUCOES = [
  "Plantação De Grãos", "Fazenda De Vacas", "Plantação De Eucalipto", "Granja De Aves", "Criação De Ovinos",
  "Serraria", "Fábrica De Smartphones", "Fábrica De Computadores", "Fábrica De Consoles De Jogos",
  "Fábrica De Dispositivos Vestíveis", "Fábrica De Rações", "Fábrica De Embalagens", "Fábrica De Fertilizantes",
  "Fábrica Têxtil", "Fábrica De Calçados", "Fábrica De Roupas", "Fábrica De Celulose", "Fábrica De Papel",
  "Fábrica De Livros", "Fábrica De Medicamentos", "Laboratório Farmacêutico", "Fábrica De Plásticos",
  "Fábrica De Químicos Especializados", "Alto-Forno", "Usina Siderúrgica", "Fundição De Alumínio",
  "Fábrica De Ligas Metálicas", "Indústria De Componentes Mecânicos", "Fábrica De Chapas Metálicas",
  "Fábrica De Estruturas Metálicas", "Fábrica De Peças Automotivas", "Montadora De Veículos Elétricos",
  "Fábrica De Automóveis", "Refinaria", "Biofábrica", "Fábrica De Chips", "Fábrica De Placas Eletrônicas",
  "Fábrica De Semicondutores", "Fábrica De Robôs", "Fábrica De Motores", "Fábrica De Foguetes",
  "Fábrica De Aeronaves", "Estaleiro", "Fábrica De Turbinas Eólicas", "Fábrica De Painéis Solares", "Fábrica De Baterias",
];

const VENDAS = [
  "Livraria", "Mercado", "Açougue", "Petshop", "Farmácia", "Loja De Calçados", "Loja De Vestuário",
  "Loja De Gadgets E Wearables", "Loja De Games", "Loja De Celulares", "Loja De Informática",
  "Loja De Eletrônicos", "Concessionária De Veículos",
];

const ARMAZENAMENTO = [
  "Armazém", "Silo", "Depósito De Resíduos Orgânicos", "Data Center", "Servidor Em Nuvem", "Armazém Logístico",
  "Centro De Distribuição", "Fábrica De Tanque De Armazenamento Biocombustível", "Centro De Coleta De Biomassa",
  "Campo De Estocagem", "Armazém De Materiais Brutos", "Câmara Fria", "Container Modular", "Pátio De Veículos",
  "Armazém Industrial", "Armazém De Materiais Sensíveis", "Hangar", "Pátio De Mineração",
];

// ============================================================
// CARD MINIMAL
// ============================================================
const CardMinimal = memo(function CardMinimal({
  nome,
  raridade = "comum",
  quantidade = 1,
  setor = "agricultura",
  cor1 = "#1A1A1A",
  cor2 = "#4D4D4D",
  cor3 = "#808080",
  cor4 = "#B3B3B3",
  onExpand,
}) {
  // ── RARIDADE + POWER-UP ───────────────────────────────────
  const raridadeBase = RARIDADE_POWERUP[raridade] ? raridade : "comum";
  const powerUpConfig = RARIDADE_POWERUP[raridadeBase];
  const quantidadeMinimaNv2 = powerUpConfig.quantidadeMinimaNv2;
  const quantidadeMinimaNv3 = powerUpConfig.quantidadeMinimaNv3;
  const qtdMaxima = powerUpConfig.qtdMaxima;

  const isEterno = quantidade >= qtdMaxima;

  const powerUpSelecionado = useMemo(() => {
    if (isEterno) return "powerUpNv3";
    if (quantidade >= quantidadeMinimaNv3) return "powerUpNv3";
    if (quantidade >= quantidadeMinimaNv2) return "powerUpNv2";
    return "powerUpNv1";
  }, [quantidade, quantidadeMinimaNv2, quantidadeMinimaNv3, isEterno]);

  const raridadeFinal = isEterno ? "eterno" : raridadeBase;

  const RARIDADE_CONFIG = useMemo(() => ({
    comum:    { label: "Comum",    stars: 1, cor: cor1,       corText: "#a8ffb0" },
    raro:     { label: "Raro",     stars: 2, cor: "#9944ff",  corText: "#cc88ff" },
    epico:    { label: "Épico",    stars: 3, cor: "#ff9933",  corText: "#ffcc88" },
    lendario: { label: "Lendário", stars: 4, cor: "#ffd700",  corText: "#fff8d0" },
    eterno:   { label: "∞ ETERNO", stars: 5, cor: "#7c3aed",  corText: "#c4b5fd" },
  }), [cor1]);

  const rConfig = RARIDADE_CONFIG[raridadeFinal];

  // ── CATEGORIA ─────────────────────────────────────────────
  const categoriaEdificio = useMemo(() => {
    if (ARMAZENAMENTO.includes(nome)) return "estoque";
    if (PRODUCOES.includes(nome)) return "producao";
    if (VENDAS.includes(nome)) return "venda";
    return "passiva";
  }, [nome]);

  const isEstoque  = categoriaEdificio === "estoque";
  const isProducao = categoriaEdificio === "producao";
  const isVenda    = categoriaEdificio === "venda";
  const isPassiva  = categoriaEdificio === "passiva";

  // ── GRADIENTE DE NÍVEL ────────────────────────────────────
  const gradientLevel = useMemo(() => {
    if (isEterno) return "#7C3AED";
    if (powerUpSelecionado === "powerUpNv3") return "#FFD700";
    if (powerUpSelecionado === "powerUpNv2") return "#6411D9";
    return cor2;
  }, [isEterno, powerUpSelecionado, cor2]);

  // ── GRADIENTE POR CATEGORIA + RARIDADE ────────────────────
  const getGradient = useMemo(() => {
    const c1 = cor1, c2 = cor2, c3 = cor3, c4 = cor4;
    const g = gradientLevel;

    if (isEterno) {
      return `radial-gradient(circle at 30% 30%, rgba(74,26,122,0.85) 0%, rgba(45,10,78,0.95) 45%, rgba(10,0,20,1) 80%, #0a0014 100%)`;
    }

    if (isProducao) {
      if (raridadeFinal === "lendario") {
        return `radial-gradient(circle at 2% 2%, #ffeeb6 0%, #ffffff 40%, #fffadc 70%, #f7e9bd 80%, #ffffff 85%, #f8f5ea 92%, #bbb49d 98%, #ffffff 100%)`;
      }
      return `radial-gradient(circle at 2% 50%, ${c1}99 0%, ${c4}FF 40%, ${g}CC 70%, ${c4}FF 80%, ${c2}B3 85%, ${c1}99 92%, ${c2}B3 98%, ${c4}FF 100%)`;
    }
    if (isVenda) {
      if (raridadeFinal === "lendario") {
        return `radial-gradient(circle at 100% 0%, ${c1}11 0%, ${g}CC 12%, ${c4}CC 28%, ${c3}FF 48%, #FFD700 55%, ${c3}FF 62%, ${g}99 80%, ${c1}11 100%)`;
      }
      return `radial-gradient(circle at 100% 0%, ${c1}11 0%, ${g}CC 12%, ${c4}CC 28%, ${c3}FF 48%, ${c3}FF 62%, ${g}99 80%, ${c1}11 100%)`;
    }
    if (isEstoque) {
      if (raridadeFinal === "lendario") {
        return `linear-gradient(190deg, ${g}15 0%, ${c4}EE 28%, ${c3}CC 50%, #D4AF37 65%, ${c4}EE 70%, ${c1}77 100%)`;
      }
      return `linear-gradient(190deg, ${g}15 0%, ${c4}EE 28%, ${c3}CC 50%, ${c4}EE 70%, ${c1}77 100%)`;
    }
    if (isPassiva) {
      if (raridadeFinal === "lendario") {
        return `linear-gradient(135deg, ${g}FF 0%, #FFD70077 15%, ${c3}BB 35%, ${c4}FF 52%, ${c4} 60%, #D4AF3799 70%, ${c1}FF 100%)`;
      }
      return `linear-gradient(135deg, ${g}FF 0%, ${c2}77 15%, ${c3}BB 35%, ${c4}FF 52%, ${c3}99 70%, ${c1}FF 100%)`;
    }
    return `radial-gradient(circle at center, ${c3} 0%, rgba(255,255,255,0) 70%)`;
  }, [cor1, cor2, cor3, cor4, gradientLevel, isProducao, isVenda, isEstoque, isPassiva, raridadeFinal, isEterno]);

  // ── BORDA ─────────────────────────────────────────────────
  const borda = useMemo(() => {
    if (isEterno) {
      return {
        border: `1.5px solid rgba(139,92,246,0.55)`,
        boxShadow: `0 4px 20px rgba(76,29,149,0.5), 0 0 24px rgba(139,92,246,0.25)`,
        borderRadius: "16px",
      };
    }
    if (isProducao) return { border: `1.5px solid ${cor1}88`, boxShadow: `0 0 0 1px ${cor3}55`, borderRadius: "18px 8px 18px 8px" };
    if (isEstoque)  return { border: `1.5px solid ${cor2}`,   boxShadow: `0 0 0 2px ${cor3}66`, borderRadius: "16px" };
    if (isVenda)    return { borderRadius: "16px 5px 16px 5px", border: `1.5px solid ${cor3}` };
    if (isPassiva)  return { border: `1px solid ${cor3}55`, boxShadow: `0 0 0 1px ${cor1}88`, borderRadius: "16px" };
    return { borderRadius: "16px" };
  }, [cor1, cor2, cor3, isProducao, isEstoque, isVenda, isPassiva, isEterno]);

  const imageUrl = useMemo(() => getImageUrl(nome), [nome]);

  // ── HANDLE EXPAND (com fallback seguro) ──────────────────
  const handleExpandClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof onExpand === "function") onExpand();
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div
      className="card-no-select relative w-full aspect-[3/4] overflow-hidden flex flex-col items-center justify-between p-2"
      onClick={handleExpandClick}
      style={{
        background: getGradient,
        ...borda,
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Botão fullscreen — sempre clicável, acima de qualquer overlay do pai */}
      {onExpand && (
        <button
          type="button"
          
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 4, left: 4,
            zIndex: 30,                    // 🔑 acima do dot do setor (40) e de qualquer overlay
            width: 22, height: 22,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.22)",
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            fontSize: 9,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            lineHeight: 1,
            pointerEvents: "auto",          // 🔑 garante que recebe o clique
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",    // 🔑 evita delay de 300ms em mobile
          }}
          aria-label="Expandir carta"
        >
          <Maximize2 size={11} color="#fff" />
        </button>
      )}

      {/* ===== Área superior: imagem + estrelas dentro ===== */}
      <div
        className="relative z-10 flex-1 w-full flex items-center justify-center"
        style={{ minHeight: 0, paddingTop: 4 }}
      >
        <div
          style={{
            width: "62%",
            height: "62%",
            maxWidth: 70,
            maxHeight: 70,
            borderRadius: 10,
            background: isEterno
              ? `radial-gradient(circle at 30% 30%, rgba(18,6,46,0.95), rgb(30,6,66) 90%)`
              : `linear-gradient(135deg, ${cor1} 0%, ${cor2} 100%)`,
            border: `1px solid ${isEterno ? "rgba(139,92,246,0.35)" : cor3 + "66"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src={imageUrl}
            alt={nome}
            loading="lazy"
            decoding="async"
            draggable={false}
            style={{
              width: "75%",
              height: "75%",
              objectFit: "contain",
              pointerEvents: "none",
              filter: isEterno
                ? "drop-shadow(0 0 8px rgba(139,92,246,0.7))"
                : `drop-shadow(0 0 6px ${cor4}88)`,
            }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />

          {/* ⭐ Estrelas dentro do logo */}
          <div
            style={{
              position: "absolute",
              bottom: 2,
              left: 0, right: 0,
              display: "flex", justifyContent: "center", gap: 1,
              fontSize: 7,
              color: rConfig.cor,
              textShadow: `0 0 4px ${rConfig.cor}`,
              lineHeight: 1,
            }}
          >
            {isEterno ? "∞" : "★".repeat(rConfig.stars)}
          </div>
        </div>
      </div>

      {/* ===== Nome ===== */}
      <p
        className="relative z-10 text-[8px] font-semibold uppercase tracking-wide text-center px-1"
        style={{
          color: "#fff",
          textShadow: "0 1px 4px #000000aa",
          lineHeight: 1.15,
          margin: 0,
          marginBottom: 4,
          maxWidth: "100%",
        }}
      >
        {nome}
      </p>

      {/* ===== Badge quantidade ===== */}
      <div
        style={{
          position: "absolute",
          bottom: 0, right: 0,
          width: 30, height: 30,
          zIndex: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderTopLeftRadius: 10,
          borderBottomRightRadius: 10,
          background: isEterno
            ? `linear-gradient(135deg, rgba(139,92,246,0.7), rgba(139,92,246,0.3))`
            : raridadeFinal === "lendario"
              ? `linear-gradient(135deg, #ffd700, #ffd70066, ${cor4})`
              : cor3,
          filter: "brightness(0.85)",
          boxShadow: isEterno
            ? "-2px -2px 8px rgba(139,92,246,0.4)"
            : "-2px -2px 8px rgba(0,0,0,0.35)",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: isEterno ? "#c4b5fd" : "#fff",
            textShadow: "0 1px 3px rgba(0,0,0,0.7)",
            lineHeight: 1,
          }}
        >
          {quantidade}
        </span>
      </div>
    </div>
  );
});

export default CardMinimal;