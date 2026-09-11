// src/components/CardPack.jsx
import React, { useMemo, useRef, useCallback, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ============================================================
// CONSTANTES
// ============================================================
const getImageUrl = (nome) => `/imagens/${nome}.png`;
const getImageUrlSetor = (setor) => `/outrasImagens/setores/${setor}.png`;

const SETORES_CONFIG = {
  agricultura: { id: "agricultura", cor1: "#003816", cor2: "#1A5E2A", cor3: "#0C9123", cor4: "#4CAF50" },
  tecnologia:  { id: "tecnologia",  cor1: "#A64B00", cor2: "#D45A00", cor3: "#FF6F00", cor4: "#FF8C42" },
  industria:   { id: "industria",   cor1: "#1A1A1A", cor2: "#4D4D4D", cor3: "#808080", cor4: "#B3B3B3" },
  comercio:    { id: "comercio",    cor1: "#660000", cor2: "#A31919", cor3: "#E60000", cor4: "#FF4D4D" },
  imobiliario: { id: "imobiliario", cor1: "#000066", cor2: "#1A1A8C", cor3: "#3333CC", cor4: "#6666FF" },
  energia:     { id: "energia",     cor1: "#665200", cor2: "#A37F19", cor3: "#E6B800", cor4: "#FFD966" },
  outros:      { id: "outros",      cor1: "#1A1A1A", cor2: "#4D4D4D", cor3: "#808080", cor4: "#B3B3B3" },
};

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

const RARIDADE_CONFIG = {
  comum:    { label: "Comum",    stars: 1, cor: "#9CA3AF", corText: "#a8ffb0" },
  raro:     { label: "Raro",     stars: 2, cor: "#9944ff", corText: "#cc88ff" },
  epico:    { label: "Épico",    stars: 3, cor: "#ff9933", corText: "#ffcc88" },
  lendario: { label: "Lendário", stars: 4, cor: "#ffd700", corText: "#fff8d0" },
};

const RANK_PARA_RARIDADE = { S: "lendario", A: "epico", B: "raro", C: "comum" };

// ============================================================
// HOOK: TILT 3D SUAVE (apenas mouse)
// ============================================================
function useTilt3D({ maxTilt = 14, scale = 1.04, stiffness = 180, damping = 18 } = {}) {
  const ref = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });
  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);
  const glareX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(springY, [0, 1], ["0%", "100%"]);
  const [isHover, setIsHover] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }, [x, y]);

  const handleMouseEnter = useCallback(() => setIsHover(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHover(false);
    x.set(0.5);
    y.set(0.5);
  }, [x, y]);

  return {
    ref,
    rotateX, rotateY, glareX, glareY, isHover, scale,
    handlers: { onMouseMove: handleMouseMove, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave },
  };
}

// ============================================================
// COMPONENTE PRINCIPAL — CardPack
// ============================================================
const CardPack = ({
  nome,
  rank = "C",
  setor = "agricultura",
  setorLabel,
}) => {
  // ── DADOS DERIVADOS ──────────────────────────────────────
  const raridade = RANK_PARA_RARIDADE[rank] || "comum";
  const rConfig = RARIDADE_CONFIG[raridade];
  const setorInfo = SETORES_CONFIG[setor] || SETORES_CONFIG.outros;
  const nomeAtual = nome || "Edifício";

  // ── CATEGORIA ────────────────────────────────────────────
  const categoria = useMemo(() => {
    if (ARMAZENAMENTO.includes(nomeAtual)) return "estoque";
    if (PRODUCOES.includes(nomeAtual)) return "producao";
    if (VENDAS.includes(nomeAtual)) return "venda";
    return "passiva";
  }, [nomeAtual]);

  const isEstoque = categoria === "estoque";
  const isProducao = categoria === "producao";
  const isVenda = categoria === "venda";
  const isPassiva = categoria === "passiva";

  // ── GRADIENTE POR CATEGORIA ──────────────────────────────
  const getGradient = useMemo(() => {
    const { cor1: c1, cor2: c2, cor3: c3, cor4: c4 } = setorInfo;

    if (isProducao) {
      if (raridade === "lendario") return `radial-gradient(circle at 2% 2%, #ffeeb6 0%, #ffffff 40%, #fffadc 70%, #f7e9bd 80%, #ffffff 85%, #f8f5ea 92%, #bbb49d 98%, #ffffff 100%)`;
      return `radial-gradient(circle at 2% 50%, ${c1}99 0%, ${c4}FF 40%, ${c3}CC 70%, ${c4}FF 80%, ${c2}B3 85%, ${c1}99 92%, ${c2}B3 98%, ${c4}FF 100%)`;
    }
    if (isVenda) {
      if (raridade === "lendario") return `radial-gradient(circle at 100% 0%, ${c1}11 0%, ${c3}CC 12%, ${c4}CC 28%, ${c3}FF 48%, #FFD700 55%, ${c3}FF 62%, ${c3}99 80%, ${c1}11 100%)`;
      return `radial-gradient(circle at 100% 0%, ${c1}11 0%, ${c3}CC 12%, ${c4}CC 28%, ${c3}FF 48%, ${c3}FF 62%, ${c3}99 80%, ${c1}11 100%)`;
    }
    if (isEstoque) {
      if (raridade === "lendario") return `linear-gradient(190deg, ${c3}15 0%, ${c4}EE 28%, ${c3}CC 50%, #D4AF37 65%, ${c4}EE 70%, ${c1}77 100%)`;
      return `linear-gradient(190deg, ${c3}15 0%, ${c4}EE 28%, ${c3}CC 50%, ${c4}EE 70%, ${c1}77 100%)`;
    }
    if (isPassiva) {
      if (raridade === "lendario") return `linear-gradient(135deg, ${c3}FF 0%, #FFD70077 15%, ${c3}BB 35%, ${c4}FF 52%, ${c4} 60%, #D4AF3799 70%, ${c1}FF 100%)`;
      return `linear-gradient(135deg, ${c3}FF 0%, ${c2}77 15%, ${c3}BB 35%, ${c4}FF 52%, ${c3}99 70%, ${c1}FF 100%)`;
    }
    return `radial-gradient(circle at center, ${c3} 0%, rgba(255,255,255,0) 70%)`;
  }, [setorInfo, isProducao, isVenda, isEstoque, isPassiva, raridade]);

  // ── BORDA POR CATEGORIA ──────────────────────────────────
  const bordaCategoria = useMemo(() => {
    const { cor1: c1, cor2: c2, cor3: c3 } = setorInfo;
    if (isProducao) return { border: `2px solid ${c1}55`, boxShadow: `0 0 0 1px ${c3}88`, borderRadius: "25px 10px 25px 10px" };
    if (isEstoque)  return { border: `2px solid ${c2}`,   boxShadow: `0 0 0 3px ${c3}88`, borderRadius: "20px" };
    if (isVenda)    return { borderRadius: "20px 5px 20px 5px", border: `1.5px solid ${c3}` };
    if (isPassiva)  return { border: `1px solid ${c3}55`, boxShadow: `0 0 0 1px ${c1}88`, borderRadius: "20px" };
    return { borderRadius: "20px" };
  }, [setorInfo, isProducao, isEstoque, isVenda, isPassiva]);

  // ── BORDA POR RARIDADE ───────────────────────────────────
  const bordaRaridade = useMemo(() => {
    const sombras = {
      comum:    `0 8px 24px #00000088`,
      raro:     `0 8px 32px #6600cc44, 0 0 60px #44008844`,
      epico:    `0 8px 32px #ff660044, 0 0 60px #cc440022`,
      lendario: `0 8px 40px #ffd70066, 0 0 80px #ffaa0033, inset 0 0 30px #ffd70011`,
    };
    const borders = { comum: "0px", raro: "0.6px", epico: "1.0px", lendario: "2px" };
    return {
      border: `${borders[raridade]} solid ${rConfig.cor}`,
      boxShadow: sombras[raridade] || `0 8px 24px #00000088`,
      borderRadius: "14px",
    };
  }, [raridade, rConfig]);

  // ── FUNDO TEMÁTICO (SVG patterns) ────────────────────────
  const fundoTematico = useMemo(() => {
    const estiloBase = {
      position: "absolute", inset: 0, overflow: "hidden",
      pointerEvents: "none", zIndex: 2, borderRadius: "inherit",
    };

    if (isProducao) {
      return (
        <div style={estiloBase}>
          <svg style={{ position: "absolute", width: "100%", height: "100%" }} viewBox="0 0 400 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cardPackWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={setorInfo.cor4} stopOpacity="0" />
                <stop offset="30%" stopColor={setorInfo.cor4} stopOpacity="0.9" />
                <stop offset="70%" stopColor={setorInfo.cor4} stopOpacity="0.9" />
                <stop offset="100%" stopColor={setorInfo.cor4} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,200 Q50,100 100,200 T200,200 T300,200 T400,200 L400,400 L0,400 Z" fill="url(#cardPackWaveGrad)" opacity="0.35">
              <animate attributeName="d" dur="8s" repeatCount="indefinite" values="
                M0,200 Q50,100 100,200 T200,200 T300,200 T400,200 L400,400 L0,400 Z;
                M0,200 Q50,300 100,200 T200,200 T300,200 T400,200 L400,400 L0,400 Z;
                M0,200 Q50,100 100,200 T200,200 T300,200 T400,200 L400,400 L0,400 Z" />
            </path>
          </svg>
        </div>
      );
    }
    if (isVenda) {
      return (
        <div style={estiloBase}>
          <svg style={{ position: "absolute", width: "100%", height: "100%" }} viewBox="0 0 400 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cardPackDiagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={setorInfo.cor4} stopOpacity="0" />
                <stop offset="20%" stopColor={setorInfo.cor4} stopOpacity="1" />
                <stop offset="80%" stopColor={setorInfo.cor4} stopOpacity="1" />
                <stop offset="100%" stopColor={setorInfo.cor4} stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0" x2="400" y2="400" stroke="url(#cardPackDiagGrad)" strokeWidth="3" opacity="0.35">
              <animate attributeName="y1" dur="4s" repeatCount="indefinite" values="0;400;0" />
              <animate attributeName="x2" dur="4s" repeatCount="indefinite" values="400;0;400" />
            </line>
          </svg>
        </div>
      );
    }
    if (isEstoque) {
      return (
        <div style={estiloBase}>
          <svg style={{ position: "absolute", width: "100%", height: "100%" }} viewBox="0 0 400 400" preserveAspectRatio="none">
            <defs>
              <polygon id="cardPackHex" points="20,0 40,11.5 40,34.5 20,46 0,34.5 0,11.5" fill={setorInfo.cor4} opacity="0.7" />
              <pattern id="cardPackHexPattern" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                <use href="#cardPackHex" x="0" y="0" />
                <use href="#cardPackHex" x="40" y="26" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="400" height="400" fill="url(#cardPackHexPattern)" opacity="0.3" />
          </svg>
        </div>
      );
    }
    if (isPassiva) {
      return (
        <div style={estiloBase}>
          <svg style={{ position: "absolute", width: "100%", height: "100%" }} viewBox="0 0 400 400" preserveAspectRatio="none">
            <defs>
              <pattern id="cardPackGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="none" stroke={setorInfo.cor4} strokeWidth="0.8" opacity="0.6" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="400" height="400" fill="url(#cardPackGridPattern)" opacity="0.3" />
          </svg>
        </div>
      );
    }
    return null;
  }, [isProducao, isVenda, isEstoque, isPassiva, setorInfo]);

  // ── TILT 3D ──────────────────────────────────────────────
  const tilt = useTilt3D({ maxTilt: 14, scale: 1.04, stiffness: 180, damping: 18 });

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div
      ref={tilt.ref}
      {...tilt.handlers}
      className="relative w-full aspect-[3/4] overflow-hidden"
      style={{
        perspective: "1200px",
        perspectiveOrigin: "50% 50%",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          WebkitBackfaceVisibility: "hidden",
          overflow: "hidden",
          ...bordaCategoria,
          ...bordaRaridade,
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          scale: tilt.isHover ? tilt.scale : 1,
        }}
      >
        {/* Fundo temático */}
        {fundoTematico}

        {/* Conteúdo */}
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: getGradient, borderRadius: "inherit",
            transformStyle: "preserve-3d", overflow: "hidden",
            zIndex: 3,
          }}
        >
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
            {/* Glare */}
            <motion.div
              style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(circle at ${tilt.glareX} ${tilt.glareY}, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)`,
                opacity: tilt.isHover ? 1 : 0,
                transition: "opacity 0.4s ease",
                pointerEvents: "none", zIndex: 30, borderRadius: "inherit",
              }}
            />

            {/* Badge de Raridade (canto superior direito) */}
            <div style={{
              position: "absolute", top: 6, right: 6,
              zIndex: 15,
              fontSize: 6, fontWeight: 800,
              textTransform: "uppercase", letterSpacing: ".1em",
              padding: "2px 5px", borderRadius: 4,
              background: `${setorInfo.cor1}cc`,
              color: rConfig.cor,
              border: `1px solid ${rConfig.cor}66`,
              transform: "translateZ(25px)",
            }}>
              {rConfig.label}
            </div>

            {/* Ornamentos para Lendário */}
            {raridade === "lendario" && ["tl", "tr", "bl", "br"].map((pos) => (
              <div key={pos} style={{
                position: "absolute",
                ...(pos.includes("t") ? { top: 5 } : { bottom: 5 }),
                ...(pos.includes("l") ? { left: 5 } : { right: 5 }),
                color: setorInfo.cor4, fontSize: 8, opacity: 0.8,
                textShadow: `0 0 6px ${setorInfo.cor4}`,
                zIndex: 5, pointerEvents: "none", transform: "translateZ(20px)",
              }}>✦</div>
            ))}

            {/* Conteúdo central */}
            <div style={{
              width: "88%", height: "92%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "space-between",
              position: "relative", zIndex: 10, transformStyle: "preserve-3d",
              padding: "6px 0",
            }}>
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 6, width: "100%", transformStyle: "preserve-3d",
              }}>
                {/* Box da Imagem */}
                <div style={{
                  width: "55%", aspectRatio: "1/1",
                  maxWidth: 70, maxHeight: 70,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${setorInfo.cor1} 0%, ${setorInfo.cor2} 100%)`,
                  border: `1px solid ${setorInfo.cor3}66`,
                  boxShadow: `0 4px 20px ${setorInfo.cor4}33, inset 0 0 20px ${setorInfo.cor1}88`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden", flexShrink: 0,
                  transform: "translateZ(40px)",
                }}>
                  <img
                    src={getImageUrl(nomeAtual)}
                    alt={nomeAtual}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    style={{
                      width: "70%", height: "70%", objectFit: "contain",
                      filter: `drop-shadow(0 0 8px ${setorInfo.cor4}88)`,
                      pointerEvents: "none",
                    }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  {/* Estrelas de raridade */}
                  <div style={{
                    position: "absolute", bottom: 3, left: 0, right: 0,
                    display: "flex", justifyContent: "center", gap: 1,
                    fontSize: 7, color: rConfig.cor,
                    textShadow: raridade === "lendario" ? `0 0 6px ${rConfig.cor}` : "none",
                  }}>
                    {"★".repeat(rConfig.stars)}
                  </div>
                </div>

                {/* Divisor */}
                <div style={{
                  width: "80%", height: 1,
                  background: `linear-gradient(90deg, transparent, ${setorInfo.cor4}, transparent)`,
                  boxShadow: (raridade === "lendario" || raridade === "epico") ? `0 0 6px ${setorInfo.cor4}88` : "none",
                }} />

                {/* Nome */}
                <h1 style={{
                  fontSize: 9, lineHeight: 1.2,
                  maxWidth: "90%",
                  textTransform: "uppercase",
                  letterSpacing: ".03em",
                  fontWeight: 700, textAlign: "center", color: "#fff",
                  textShadow: raridade === "lendario"
                    ? `0 0 10px ${setorInfo.cor4}88, 0 1px 4px #00000088`
                    : `0 1px 6px #00000088`,
                  margin: 0,
                }}>
                  {nomeAtual}
                </h1>
              </div>

              {/* Rodapé — Ícone do Setor */}
              <div className="bg-white/10" style={{
                padding: "2px 8px", borderRadius: 5, flexShrink: 0,
                color: setorInfo.cor4,
                border: `1px solid ${setorInfo.cor3}66`,
                fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <img
                  src={getImageUrlSetor(setor)}
                  alt={setor}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  style={{
                    width: "16px", height: "24px", objectFit: "contain",
                    filter: `drop-shadow(0 0 8px ${setorInfo.cor4}88)`,
                    pointerEvents: "none",
                  }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CardPack;