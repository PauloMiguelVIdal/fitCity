// src/components/CardColection.jsx
import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  X, Sparkles, Smartphone, Check, Factory, Store, Warehouse, Layers, Package,
} from "lucide-react";

// ============================================================
// CONSTANTES
// ============================================================
const getImageUrl = (nome) => `/imagens/${nome}.png`;
const getImageUrlSetor = (setor) => `/outrasImagens/setores/${setor}.png`;

const POWERUP_CORES = {
  powerUpNv1: "#8F5ADA",
  powerUpNv2: "#6411D9",
  powerUpNv3: "#350973",
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

const SETORES_CONFIG = {
  agricultura: { id: "agricultura", cor1: "#003816", cor2: "#1A5E2A", cor3: "#0C9123", cor4: "#4CAF50" },
  tecnologia:  { id: "tecnologia",  cor1: "#A64B00", cor2: "#D45A00", cor3: "#FF6F00", cor4: "#FF8C42" },
  industria:   { id: "industria",   cor1: "#1A1A1A", cor2: "#4D4D4D", cor3: "#808080", cor4: "#B3B3B3" },
  comercio:    { id: "comercio",    cor1: "#660000", cor2: "#A31919", cor3: "#E60000", cor4: "#FF4D4D" },
  imobiliario: { id: "imobiliario", cor1: "#000066", cor2: "#1A1A8C", cor3: "#3333CC", cor4: "#6666FF" },
  energia:     { id: "energia",     cor1: "#665200", cor2: "#A37F19", cor3: "#E6B800", cor4: "#FFD966" },
  outros:      { id: "outros",      cor1: "#1A1A1A", cor2: "#4D4D4D", cor3: "#808080", cor4: "#B3B3B3" },
};

// ============================================================
// CONFIG DE RARIDADE + POWER-UP
// ============================================================
const RARIDADE_POWERUP = {
  comum:    { quantidadeMinimaNv2: 20, quantidadeMinimaNv3: 50, qtdMaxima: 100 },
  raro:     { quantidadeMinimaNv2: 15, quantidadeMinimaNv3: 40, qtdMaxima: 80 },
  epico:    { quantidadeMinimaNv2: 10, quantidadeMinimaNv3: 20, qtdMaxima: 50 },
  lendario: { quantidadeMinimaNv2: 2,  quantidadeMinimaNv3: 5,  qtdMaxima: 10 },
};

// Cores usadas na HUD (contraste garantido — independente das cores internas do card)
const RARIDADE_COR_HUD = {
  comum: "#9CA3AF",
  raro: "#9944ff",
  epico: "#ff9933",
  lendario: "#ffd700",
  eterno: "#c4b5fd",
};

const RANK_PARA_RARIDADE = { S: "lendario", A: "epico", B: "raro", C: "comum" };

// ============================================================
// HELPERS
// ============================================================
const formatarNumero = (num) => {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(".0", "") + "T";
  if (num >= 1e9)  return (num / 1e9).toFixed(1).replace(".0", "") + "B";
  if (num >= 1e6)  return (num / 1e6).toFixed(1).replace(".0", "") + "M";
  if (num >= 1e3)  return (num / 1e3).toFixed(1).replace(".0", "") + "K";
  return num.toString();
};

// ============================================================
// CANVAS DE ESTRELAS
// ============================================================
const StarsCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height;
    let stars = [];
    const starCount = 200;
    let raf;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      width = canvas.width;
      height = canvas.height;
    };

    const createStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 0.5,
          opacity: Math.random() * 4.5 + 0.3,
          speed: Math.random() * 0.005 + 0.002,
        });
      }
    };

    const drawStars = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius);
        gradient.addColorStop(0, `rgba(139, 92, 246, ${star.opacity})`);
        gradient.addColorStop(0.5, `rgba(124, 58, 237, ${star.opacity * 0.5})`);
        gradient.addColorStop(1, "rgba(124, 58, 237, 0)");
        ctx.fillStyle = gradient;
        ctx.shadowColor = "rgba(139, 92, 246, 0.3)";
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    const animateStars = () => {
      stars.forEach((star) => {
        star.opacity += (Math.random() - 0.5) * 0.02;
        star.opacity = Math.max(0.2, Math.min(0.8, star.opacity));
      });
      drawStars();
      raf = requestAnimationFrame(animateStars);
    };

    resizeCanvas();
    createStars();
    drawStars();
    animateStars();

    const onResize = () => {
      resizeCanvas();
      createStars();
      drawStars();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 1, borderRadius: "inherit",
      }}
    />
  );
};

// ============================================================
// V4 - IGNIÇÃO
// ============================================================
const V4Ignicao = () => (
  <>
    <motion.div
      style={{
        position: "absolute", zIndex: 1, pointerEvents: "none",
        width: "100%", height: "100%", top: 0, left: 0,
        background: `
          radial-gradient(ellipse 260% 60% at 85% 85%, rgba(139,92,246,0.2) 0%, transparent 50%),
          radial-gradient(ellipse 60% 260% at 85% 85%, rgba(124,58,237,0.12) 0%, transparent 50%)
        `,
      }}
      animate={{ rotate: [0, 3, 0], scale: [1, 1.03, 1] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      style={{
        position: "absolute", zIndex: 1, pointerEvents: "none",
        width: "100%", height: "100%", top: 0, left: 0,
        background: `radial-gradient(circle at 85% 85%, rgba(205,187,240,0.4) 0%, rgba(132,88,233,0.85) 5%, rgba(104,14,230,0.6) 14%, rgba(76,29,149,0.35) 26%, rgba(40,15,80,0.2) 42%, rgba(78,25,156,0.1) 60%, transparent 75%)`,
      }}
      animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      style={{
        position: "absolute", zIndex: 1, pointerEvents: "none",
        width: "70%", height: "30%", bottom: "10%", right: "30%",
        background: `radial-gradient(circle at center, transparent 18%, rgba(82,16,236,0.25) 24%, rgb(79,34,156) 34%, transparent 46%)`,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />
    <StarsCanvas />
  </>
);

// ============================================================
// ETERNO FLOW EFFECTS
// ============================================================
const EternoFlowEffects = () => {
  const flowPath = "M0 250 C150 80 350 420 500 200";
  const linePaths = [
    { d: flowPath, delay: 0 },
    { d: "M0 300 C180 120 320 500 500 280", delay: 1.2 },
    { d: "M0 180 C120 320 380 60 500 260", delay: 2.4 },
    { d: "M0 350 C200 180 300 460 500 340", delay: 3.6 },
  ];

  return (
    <>
      <motion.div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(circle at 30% 30%, rgba(139,92,246,0.7) 0%, transparent 60%),
            radial-gradient(circle at 75% 75%, rgba(124,58,237,0.5) 0%, transparent 55%)
          `,
          filter: "blur(60px)", zIndex: 0,
        }}
        animate={{ scale: [1, 1.08, 1], rotate: [0, 3, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 1,
        }}
        viewBox="0 0 500 700"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="flowGradA" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168,85,247,0)" />
            <stop offset="50%" stopColor="rgba(196,181,253,0.9)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0)" />
          </linearGradient>
          <linearGradient id="flowGradB" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139,92,246,0)" />
            <stop offset="50%" stopColor="rgba(167,139,250,0.85)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0)" />
          </linearGradient>
        </defs>

        {linePaths.map((line, i) => (
          <path key={`ghost-${i}`} d={line.d} stroke="rgba(139,92,246,0.08)" strokeWidth="1.5" fill="none" />
        ))}

        {linePaths.map((line, i) => (
          <motion.path
            key={`trace-${i}`}
            d={line.d}
            stroke={i % 2 === 0 ? "url(#flowGradA)" : "url(#flowGradB)"}
            strokeWidth={2.2 - i * 0.2}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 0.45, 0.45, 0],
              pathOffset: [0, 0, 0.55, 1],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 6 + i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: line.delay,
              times: [0, 0.25, 0.75, 1],
            }}
          />
        ))}

        {linePaths.map((line, i) => (
          <motion.circle
            key={`dot-${i}`}
            r="2.5"
            fill="rgba(196,181,253,0.9)"
            style={{ filter: "drop-shadow(0 0 4px rgba(168,85,247,0.9))" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 6 + i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: line.delay,
              times: [0, 0.25, 0.75, 1],
            }}
          >
            <animateMotion dur={`${6 + i * 0.8}s`} repeatCount="indefinite" begin={`${line.delay}s`} path={line.d} />
          </motion.circle>
        ))}
      </svg>
    </>
  );
};

// ============================================================
// AURA ETERNO
// ============================================================
const AuraEterno = () => (
  <>
    <motion.div
      style={{
        position: "absolute", inset: -14, pointerEvents: "none",
        borderRadius: "inherit", zIndex: 3,
      }}
      animate={{
        boxShadow: [
          "0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.3), 0 0 120px rgba(99,102,241,0.2), inset 0 0 60px rgba(124,58,237,0.2)",
          "0 0 50px rgba(139,92,246,0.7), 0 0 100px rgba(124,58,237,0.5), 0 0 140px rgba(99,102,241,0.3), inset 0 0 70px rgba(124,58,237,0.3)",
          "0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.3), 0 0 120px rgba(99,102,241,0.2), inset 0 0 60px rgba(124,58,237,0.2)",
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    <div
      style={{
        position: "absolute", inset: -24, pointerEvents: "none",
        overflow: "visible", zIndex: 3,
      }}
    >
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: 2 + (i % 4),
            height: 2 + (i % 4),
            borderRadius: "50%",
            background: `hsl(${230 + ((i * 11) % 60)}, 90%, 70%)`,
            left: `${(i * 17) % 100}%`,
            top: `${(i * 29) % 100}%`,
            boxShadow: `0 0 8px hsl(${260 + ((i * 11) % 60)}, 90%, 70%)`,
          }}
          animate={{ y: [0, -25, 0], scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 4 + (i % 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i * 0.25) % 3,
          }}
        />
      ))}
    </div>
  </>
);

// ============================================================
// HOOK: TILT 3D
// ============================================================
function useTilt3D({ maxTilt = 1000, scale = 1.04, stiffness = 180, damping = 18, gyroSensibilidade = 25 } = {}) {
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

  const [gyroAtivo, setGyroAtivo] = useState(false);
  const [precisaPermissao, setPrecisaPermissao] = useState(false);
  const [gyroSuportado, setGyroSuportado] = useState(true);
  const orientacaoBase = useRef(null);

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
    if (!gyroAtivo) { x.set(0.5); y.set(0.5); }
  }, [x, y, gyroAtivo]);

  const handleOrientation = useCallback((event) => {
    const { beta, gamma } = event;
    if (beta === null || gamma === null) return;
    if (!orientacaoBase.current) orientacaoBase.current = { beta, gamma };
    const deltaGamma = gamma - orientacaoBase.current.gamma;
    const deltaBeta = beta - orientacaoBase.current.beta;
    const alcance = 40 / gyroSensibilidade;
    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    x.set(clamp01(0.5 + deltaGamma / (alcance * 2)));
    y.set(clamp01(0.5 + deltaBeta / (alcance * 2)));
    setIsHover(true);
  }, [x, y, gyroSensibilidade]);

  const ligarListenerGiro = useCallback(() => {
    orientacaoBase.current = null;
    window.addEventListener("deviceorientation", handleOrientation);
    setGyroAtivo(true);
    setPrecisaPermissao(false);
  }, [handleOrientation]);

  const ativarGiroscopio = useCallback(async () => {
    const TemAPI = typeof window !== "undefined" && typeof DeviceOrientationEvent !== "undefined";
    if (!TemAPI) return;
    const precisaPedirPermissao = typeof DeviceOrientationEvent.requestPermission === "function";
    if (precisaPedirPermissao) {
      try {
        const resposta = await DeviceOrientationEvent.requestPermission();
        if (resposta === "granted") ligarListenerGiro();
      } catch (err) {
        console.error("Erro ao solicitar permissão do giroscópio:", err);
      }
    } else {
      ligarListenerGiro();
    }
  }, [ligarListenerGiro]);

  useEffect(() => {
    const TemAPI = typeof window !== "undefined" && typeof DeviceOrientationEvent !== "undefined";
    const ehTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const precisaPedirPermissao = TemAPI && typeof DeviceOrientationEvent.requestPermission === "function";

    // ✅ Detecta se o dispositivo suporta giroscópio
    if (!TemAPI) {
      setGyroSuportado(false);
    }

    if (ehTouch && precisaPedirPermissao) {
      setPrecisaPermissao(true);
    } else if (ehTouch && TemAPI) {
      ligarListenerGiro();
    }

    return () => window.removeEventListener("deviceorientation", handleOrientation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ref, rotateX, rotateY, glareX, glareY, isHover, scale,
    gyroAtivo, precisaPermissao, ativarGiroscopio, gyroSuportado,
    handlers: { onMouseMove: handleMouseMove, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave },
  };
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const CardColection = ({
  nome,
  raridade: raridadeProp = "comum",
  quantidade,
  setor = "agricultura",
  cor1,
  cor2,
  cor3,
  cor4,
  setorLabel,
  setorIcon: SetorIconProp,
  edificio,
  expandida = false,
  onClose,
}) => {
  const [debugQtd] = useState(quantidade ?? 1);
  const [debugSetor] = useState(setor);

  const setorInfo = SETORES_CONFIG[debugSetor] || SETORES_CONFIG.outros;
  const nomeAtual = nome ?? edificio?.nome ?? "Edifício";
  const SetorIcon = SetorIconProp || Package;

  // ── FULLSCREEN ───────────────────────────────────────────
  const [isFullscreenLocal, setIsFullscreenLocal] = useState(false);
  const isFullscreen = expandida || isFullscreenLocal;

  const fecharFullscreen = useCallback(() => {
    if (onClose) onClose();
    else setIsFullscreenLocal(false);
  }, [onClose]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleEsc = (e) => e.key === "Escape" && fecharFullscreen();
    window.addEventListener("keydown", handleEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullscreen, fecharFullscreen]);

  // ── CATEGORIA ────────────────────────────────────────────
  const categoriaEdificio = useMemo(() => {
    if (ARMAZENAMENTO.includes(nomeAtual)) return "estoque";
    if (PRODUCOES.includes(nomeAtual)) return "producao";
    if (VENDAS.includes(nomeAtual)) return "venda";
    return "passiva";
  }, [nomeAtual]);

  const isEstoque = categoriaEdificio === "estoque";
  const isProducao = categoriaEdificio === "producao";
  const isVenda = categoriaEdificio === "venda";
  const isPassiva = categoriaEdificio === "passiva";

  const categoriaLabel = isEstoque ? "Estoque" : isProducao ? "Produção" : isVenda ? "Venda" : "Passiva";
  const CategoriaIcon = isEstoque ? Warehouse : isProducao ? Factory : isVenda ? Store : Layers;

  // ── RARIDADE + POWER-UP ──────────────────────────────────
  const raridadeBase = RARIDADE_POWERUP[raridadeProp] ? raridadeProp : "comum";
  const powerUpConfig = RARIDADE_POWERUP[raridadeBase];
  const quantidadeMinimaNv2 = powerUpConfig.quantidadeMinimaNv2;
  const quantidadeMinimaNv3 = powerUpConfig.quantidadeMinimaNv3;
  const qtdMaxima = powerUpConfig.qtdMaxima;

  const isEterno = debugQtd >= qtdMaxima;

  const powerUpSelecionado = useMemo(() => {
    if (isEterno) return "powerUpNv3";
    if (debugQtd >= quantidadeMinimaNv3) return "powerUpNv3";
    if (debugQtd >= quantidadeMinimaNv2) return "powerUpNv2";
    return "powerUpNv1";
  }, [debugQtd, quantidadeMinimaNv2, quantidadeMinimaNv3, isEterno]);

  const corPowerUpAtual = POWERUP_CORES[powerUpSelecionado] ?? setorInfo.cor2;

  const raridade = isEterno ? "eterno" : raridadeBase;

  const RARIDADE_CONFIG = useMemo(() => ({
    comum:    { label: "Comum",    stars: 1, cor: setorInfo.cor1, corText: "#a8ffb0", corBorder: "#3a8c4244" },
    raro:     { label: "Raro",     stars: 2, cor: "#9944ff", corText: "#cc88ff", corBorder: "#9944ff44" },
    epico:    { label: "Épico",    stars: 3, cor: "#ff9933", corText: "#ffcc88", corBorder: "#ff993344" },
    lendario: { label: "Lendário", stars: 4, cor: "#ffd700", corText: "#fff8d0", corBorder: "#ffd70066" },
    eterno:   { label: "∞ ETERNO", stars: 5, cor: "#7c3aed", corText: "#c4b5fd", corBorder: "#7c3aed88" },
  }), [setorInfo]);

  const rConfig = RARIDADE_CONFIG[raridade];
  const corNivelHUD = RARIDADE_COR_HUD[raridade] || RARIDADE_COR_HUD.comum;

  // ── PROGRESSO (usado na HUD do fullscreen) ───────────────
  const progressInfo = useMemo(() => {
    if (debugQtd >= qtdMaxima) {
      return { labelNivel: "MAX", atual: qtdMaxima, max: qtdMaxima, texto: "Nível máximo alcançado" };
    }
    if (debugQtd >= quantidadeMinimaNv3) {
      const falta = qtdMaxima - debugQtd;
      return { labelNivel: "Nv 3", atual: debugQtd - quantidadeMinimaNv3, max: qtdMaxima - quantidadeMinimaNv3, texto: `Faltam ${falta} para o nível máximo` };
    }
    if (debugQtd >= quantidadeMinimaNv2) {
      const falta = quantidadeMinimaNv3 - debugQtd;
      return { labelNivel: "Nv 2", atual: debugQtd - quantidadeMinimaNv2, max: quantidadeMinimaNv3 - quantidadeMinimaNv2, texto: `Faltam ${falta} para o Nv 3` };
    }
    const falta = quantidadeMinimaNv2 - debugQtd;
    return { labelNivel: "Nv 1", atual: debugQtd, max: quantidadeMinimaNv2, texto: `Faltam ${falta} para o Nv 2` };
  }, [debugQtd, quantidadeMinimaNv2, quantidadeMinimaNv3, qtdMaxima]);

  const progressPct = Math.min(100, (progressInfo.atual / progressInfo.max) * 100);
  const podeTrocar = debugQtd >= 11;

  // ── GRADIENTE DE NÍVEL ───────────────────────────────────
  const gradientLevel = useMemo(() => {
    if (isEterno) return "#7C3AED";
    if (powerUpSelecionado === "powerUpNv3") return "#FFD700";
    if (powerUpSelecionado === "powerUpNv2") return "#6411D9";
    return setorInfo.cor2;
  }, [isEterno, powerUpSelecionado, setorInfo]);

  const getGradientByLevel = useMemo(() => {
    if (isEterno) return `linear-gradient(135deg, #1a0a2e 0%, #2d0a4e 25%, #4a1a7a 50%, #2d0a4e 75%, #1a0a2e 100%)`;
    if (powerUpSelecionado === "powerUpNv3") return `linear-gradient(135deg, #7a5500 0%, #b8870b 20%, #F27405 40%, #FFD700 60%, #F27405 80%, #7a5500 100%)`;
    if (powerUpSelecionado === "powerUpNv2") return `linear-gradient(135deg, #350973 0%, #6411D9 25%, #8F5ADA 50%, #6411D9 75%, #350973 100%)`;
    return `transparent`;
  }, [isEterno, powerUpSelecionado]);

  // ── GRADIENTE POR CATEGORIA ──────────────────────────────
  const getGradient = useMemo(() => {
    const { cor1: c1, cor2: c2, cor3: c3, cor4: c4 } = setorInfo;
    const g = gradientLevel;

    if (isEterno) return `radial-gradient(circle at 30% 30%, rgba(74,26,122,0.25) 0%, rgba(45,10,78,0.15) 40%, rgba(10,0,20,0.05) 70%, transparent 100%)`;

    if (isProducao) {
      if (raridade === "lendario") return `radial-gradient(circle at 2% 2%, #ffeeb6 0%, #ffffff 40%, #fffadc 70%, #f7e9bd 80%, #ffffff 85%, #f8f5ea 92%, #bbb49d 98%, #ffffff 100%)`;
      return `radial-gradient(circle at 2% 50%, ${c1}99 0%, ${c4}FF 40%, ${g}CC 70%, ${c4}FF 80%, ${c2}B3 85%, ${c1}99 92%, ${c2}B3 98%, ${c4}FF 100%)`;
    }
    if (isVenda) {
      if (raridade === "lendario") return `radial-gradient(circle at 100% 0%, ${c1}11 0%, ${g}CC 12%, ${c4}CC 28%, ${c3}FF 48%, #FFD700 55%, ${c3}FF 62%, ${g}99 80%, ${c1}11 100%)`;
      return `radial-gradient(circle at 100% 0%, ${c1}11 0%, ${g}CC 12%, ${c4}CC 28%, ${c3}FF 48%, ${c3}FF 62%, ${g}99 80%, ${c1}11 100%)`;
    }
    if (isEstoque) {
      if (raridade === "lendario") return `linear-gradient(190deg, ${g}15 0%, ${c4}EE 28%, ${c3}CC 50%, #D4AF37 65%, ${c4}EE 70%, ${c1}77 100%)`;
      return `linear-gradient(190deg, ${g}15 0%, ${c4}EE 28%, ${c3}CC 50%, ${c4}EE 70%, ${c1}77 100%)`;
    }
    if (isPassiva) {
      if (raridade === "lendario") return `linear-gradient(135deg, ${g}FF 0%, #FFD70077 15%, ${c3}BB 35%, ${c4}FF 52%, ${c4} 60%, #D4AF3799 70%, ${c1}FF 100%)`;
      return `linear-gradient(135deg, ${g}FF 0%, ${c2}77 15%, ${c3}BB 35%, ${c4}FF 52%, ${c3}99 70%, ${c1}FF 100%)`;
    }
    return `radial-gradient(circle at center, ${c3} 0%, rgba(255,255,255,0) 70%)`;
  }, [setorInfo, gradientLevel, isProducao, isVenda, isEstoque, isPassiva, raridade, isEterno]);

  // ── BORDA DINÂMICA ───────────────────────────────────────
  const getBordaDinamica = useMemo(() => {
    const { cor1: c1, cor2: c2, cor3: c3 } = setorInfo;
    if (isEterno) return {
      border: `1.5px solid rgba(139,92,246,0.55)`,
      boxShadow: `0 8px 32px rgba(76,29,149,0.4), 0 0 40px rgba(139,92,246,0.15)`,
      borderRadius: "16px",
    };
    if (isProducao) return { border: `2px solid ${c1}55`, boxShadow: `0 0 0 1px ${c3}88`, borderRadius: "25px 10px 25px 10px" };
    if (isEstoque)  return { border: `2px solid ${c2}`,   boxShadow: `0 0 0 3px ${c3}88`, borderRadius: "20px" };
    if (isVenda)    return { borderRadius: "20px 5px 20px 5px", border: `1.5px solid ${c3}` };
    if (isPassiva)  return { border: `1px solid ${c3}55`, boxShadow: `0 0 0 1px ${c1}88`, borderRadius: "20px" };
    return { borderRadius: "20px" };
  }, [setorInfo, isProducao, isEstoque, isVenda, isPassiva, isEterno]);

  // ── BORDA DE RARIDADE ────────────────────────────────────
  const getBordaRaridade = useMemo(() => {
    if (isEterno) return {};
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
  }, [raridade, rConfig, isEterno]);

  // ── FUNDO TEMÁTICO ───────────────────────────────────────
  const fundoTematico = useMemo(() => {
    if (isEterno) return null;

    const estiloBase = {
      position: "absolute", inset: 0, overflow: "hidden",
      pointerEvents: "none", zIndex: 2, borderRadius: "inherit",
    };

    if (isProducao) {
      return (
        <div style={estiloBase}>
          <svg style={{ position: "absolute", width: "100%", height: "100%" }} viewBox="0 0 400 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={setorInfo.cor4} stopOpacity="0" />
                <stop offset="30%" stopColor={setorInfo.cor4} stopOpacity="0.9" />
                <stop offset="70%" stopColor={setorInfo.cor4} stopOpacity="0.9" />
                <stop offset="100%" stopColor={setorInfo.cor4} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,200 Q50,100 100,200 T200,200 T300,200 T400,200 L400,400 L0,400 Z" fill="url(#waveGrad)" opacity="0.35">
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
              <linearGradient id="diagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={setorInfo.cor4} stopOpacity="0" />
                <stop offset="20%" stopColor={setorInfo.cor4} stopOpacity="1" />
                <stop offset="80%" stopColor={setorInfo.cor4} stopOpacity="1" />
                <stop offset="100%" stopColor={setorInfo.cor4} stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0" x2="400" y2="400" stroke="url(#diagGrad)" strokeWidth="3" opacity="0.35">
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
              <polygon id="hex" points="20,0 40,11.5 40,34.5 20,46 0,34.5 0,11.5" fill={setorInfo.cor4} opacity="0.7" />
              <pattern id="hexPattern" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                <use href="#hex" x="0" y="0" />
                <use href="#hex" x="40" y="26" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="400" height="400" fill="url(#hexPattern)" opacity="0.3" />
          </svg>
        </div>
      );
    }
    if (isPassiva) {
      return (
        <div style={estiloBase}>
          <svg style={{ position: "absolute", width: "100%", height: "100%" }} viewBox="0 0 400 400" preserveAspectRatio="none">
            <defs>
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="none" stroke={setorInfo.cor4} strokeWidth="0.8" opacity="0.6" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="400" height="400" fill="url(#gridPattern)" opacity="0.3" />
          </svg>
        </div>
      );
    }
    return null;
  }, [isProducao, isVenda, isEstoque, isPassiva, isEterno, setorInfo]);

  // ── AURA DE POWER-UP ─────────────────────────────────────
  const auraPowerUp = useMemo(() => {
    if (isEterno) return null;
    if (powerUpSelecionado === "powerUpNv1") {
      return <div className="absolute inset-[-4px] pointer-events-none rounded-xl" style={{ boxShadow: `inset 0 0 15px ${setorInfo.cor4}22` }} />;
    }
    if (powerUpSelecionado === "powerUpNv2") {
      return <div className="absolute inset-[-6px] pointer-events-none rounded-xl" style={{ boxShadow: `0 0 20px #6411D966, 0 0 40px #6411D933, inset 0 0 30px #6411D922`, animation: "pulseAuraNv2 2.5s ease-in-out infinite" }} />;
    }
    if (powerUpSelecionado === "powerUpNv3") {
      return <div className="absolute inset-[-8px] pointer-events-none rounded-xl" style={{ boxShadow: `0 0 30px #FFD70066, 0 0 60px #FFD70044, 0 0 90px #FFD70022, inset 0 0 40px #FFD70033`, animation: "pulseAuraNv3 2s ease-in-out infinite" }} />;
    }
    return null;
  }, [powerUpSelecionado, setorInfo, isEterno]);

  // ── TILT 3D ──────────────────────────────────────────────
  const tilt = useTilt3D({ maxTilt: 14, scale: 1.04, stiffness: 150, damping: 18, gyroSensibilidade: 1 });

  // 🔧 Fix: WebKit às vezes só composita elementos com transform 3D +
  // backdrop-filter recém-inseridos no DOM depois de um evento real de
  // toque/clique. Isso simula esse "empurrão" automaticamente ao abrir
  // o fullscreen, sem depender do usuário tocar na tela.
  useEffect(() => {
    if (!isFullscreen) return;
    const el = tilt.ref.current;
    if (!el) return;

    let raf2;
    const raf1 = requestAnimationFrame(() => {
      void el.getBoundingClientRect(); // força recálculo de layout/estilo
      el.style.transform = "translateZ(0.01px)";
      raf2 = requestAnimationFrame(() => {
        el.style.transform = "";
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [isFullscreen]);

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div
      className="card-no-select"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 16, padding: 0,
        userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none",
        WebkitTouchCallout: "none", WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* ====== CARD ====== */}
      <div
        ref={tilt.ref}
        {...tilt.handlers}
        style={
          isFullscreen
            ? {
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                perspective: "1400px",
                perspectiveOrigin: "50% 50%",
                zIndex: 10000,
                // reserva espaço pro header e pro painel/botão fixos no rodapé,
                // pra carta centralizada nunca ficar por trás da HUD
                padding: "96px 20px 208px",
                boxSizing: "border-box",
                willChange: "transform",
                WebkitBackfaceVisibility: "hidden",
              }
            : { position: "relative", width: "100%", height: "100%", perspective: "1200px", perspectiveOrigin: "50% 50%" }
        }
      >
        <motion.div
          style={{
            width: isFullscreen ? "min(78vw, 340px)" : "100%",
            height: isFullscreen ? "min(104vw, 453px)" : "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            WebkitBackfaceVisibility: "hidden",
            background: isEterno ? "#0a0014" : getGradientByLevel,
            overflow: "visible",
            ...getBordaDinamica,
            ...getBordaRaridade,
            rotateX: tilt.rotateX,
            rotateY: tilt.rotateY,
            scale: tilt.isHover ? tilt.scale : 1,
            userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none", msUserSelect: "none",
          }}
        >
          {/* 🌌 Fundo */}
          {isEterno ? <V4Ignicao /> : fundoTematico}
          {isEterno ? <EternoFlowEffects /> : null}
          {isEterno ? <AuraEterno /> : auraPowerUp}

          {/* ====== CONTEÚDO DO CARD ====== */}
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: getGradient, borderRadius: "inherit",
              transformStyle: "preserve-3d", overflow: "hidden", mixBlendMode: "normal",
              zIndex: 3,
            }}
          >
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
              {/* Glare */}
              <motion.div
                style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(circle at ${tilt.glareX} ${tilt.glareY}, ${isEterno ? 'rgba(196,181,253,0.18)' : 'rgba(255,255,255,0.25)'} 0%, rgba(255,255,255,0) 60%)`,
                  opacity: tilt.isHover ? 1 : 0,
                  transition: "opacity 0.4s ease",
                  pointerEvents: "none", zIndex: 30, borderRadius: "inherit",
                }}
              />

              {/* Badge quantidade */}
              <div style={{
                position: "absolute", bottom: 0, right: 0,
                width: 50, height: 50, zIndex: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderTopLeftRadius: 16, borderBottomRightRadius: 16,
                background: isEterno
                  ? `linear-gradient(135deg, rgba(139,92,246,0.6), rgba(139,92,246,0.2), ${setorInfo.cor4}22)`
                  : raridade === "lendario"
                    ? `linear-gradient(135deg, #ffd700, #ffd70066, ${setorInfo.cor4})`
                    : setorInfo.cor3,
                filter: "brightness(0.8)",
                boxShadow: isEterno ? "-2px -2px 10px rgba(139,92,246,0.4)" : "-2px -2px 10px rgba(0,0,0,0.3)",
                transform: "translateZ(30px)",
              }}>
                <span style={{
                  fontSize: 18, fontWeight: 800,
                  color: isEterno ? "#c4b5fd" : "#fff",
                  textShadow: "0 1px 4px rgba(0,0,0,0.6)", lineHeight: 1,
                }}>
                  {debugQtd}
                </span>
              </div>

              {/* Badge raridade */}
              <div style={{
                position: "absolute",
                top: isEterno ? 10 : 8, right: isEterno ? 10 : 8,
                zIndex: 15,
                fontSize: isEterno ? 8 : 7, fontWeight: 800,
                textTransform: "uppercase", letterSpacing: ".1em",
                padding: isEterno ? "3px 8px" : "2px 6px",
                borderRadius: isEterno ? 20 : 4,
                background: isEterno ? `rgba(76,29,149,0.45)` : `${setorInfo.cor1}cc`,
                color: isEterno ? "#e9d5ff" : rConfig.cor,
                border: `1px solid ${isEterno ? "rgba(139,92,246,0.55)" : rConfig.cor + "66"}`,
                transform: "translateZ(25px)",
                boxShadow: isEterno ? `0 0 12px rgba(139,92,246,0.4)` : "none",
              }}>
                {isEterno ? "ETERNO" : rConfig.label}
              </div>

              {/* Ornamentos lendário */}
              {raridade === "lendario" && ["tl", "tr", "bl", "br"].map((pos) => (
                <div key={pos} style={{
                  position: "absolute",
                  ...(pos.includes("t") ? { top: 6 } : { bottom: 6 }),
                  ...(pos.includes("l") ? { left: 6 } : { right: 6 }),
                  color: setorInfo.cor4, fontSize: 10, opacity: 0.8,
                  textShadow: `0 0 6px ${setorInfo.cor4}`,
                  zIndex: 5, pointerEvents: "none", transform: "translateZ(20px)",
                }}>✦</div>
              ))}

              <div style={{
                width: "90%", height: "90%",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "space-between",
                position: "relative", zIndex: 10, transformStyle: "preserve-3d",
              }}>
                <div style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 10, width: "100%", transformStyle: "preserve-3d",
                }}>
                  {/* Box da imagem */}
                  <div style={{
                    width: 100, height: 100, borderRadius: 12,
                    background: isEterno
                      ? `radial-gradient(circle at 30% 30%, rgba(18, 6, 46, 0.93), rgb(30, 6, 66) 90%)`
                      : `linear-gradient(135deg, ${setorInfo.cor1} 0%, ${setorInfo.cor2} 100%)`,
                    border: isEterno
                      ? `1.5px solid rgba(139,92,246,0.35)`
                      : `1px solid ${setorInfo.cor3}66`,
                    boxShadow: isEterno
                      ? `0 0 30px rgba(139,92,246,0.3), inset 0 0 20px rgba(76,29,149,0.15)`
                      : `0 4px 20px ${setorInfo.cor4}33, inset 0 0 20px ${setorInfo.cor1}88`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", overflow: "hidden", flexShrink: 0,
                    transform: "translateZ(40px)",
                    animation: isEterno ? "iconGlowEterno 3s ease-in-out infinite alternate" : undefined,
                  }}>
                    {isEterno ? (
                      <>
                        <img
                          src={getImageUrl(nomeAtual)}
                          alt={nomeAtual}
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          style={{ width: "70%", height: "70%", objectFit: "contain", pointerEvents: "none" }}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <div style={{
                          position: "absolute", bottom: 6, left: 0, right: 0,
                          display: "flex", justifyContent: "center",
                          fontSize: 12, color: "rgba(139,92,246,0.9)",
                          textShadow: `0 0 8px rgba(139,92,246,0.6)`,
                        }}>∞</div>
                      </>
                    ) : (
                      <>
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
                        <div style={{
                          position: "absolute", bottom: 5, left: 0, right: 0,
                          display: "flex", justifyContent: "center", gap: 2,
                          fontSize: 8, color: rConfig.cor,
                          textShadow: raridade === "lendario" ? `0 0 6px ${rConfig.cor}` : "none",
                        }}>
                          {"★".repeat(rConfig.stars)}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Divisor */}
                  <div style={{
                    width: isEterno ? "60%" : "85%", height: 1,
                    background: isEterno
                      ? `linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)`
                      : `linear-gradient(90deg, transparent, ${setorInfo.cor4}, transparent)`,
                    boxShadow: isEterno
                      ? `0 0 10px rgba(139,92,246,0.3)`
                      : (raridade === "lendario" || raridade === "epico" ? `0 0 6px ${setorInfo.cor4}88` : "none"),
                  }} />

                  {/* Nome */}
                  <h1 style={{
                    fontSize: 12, lineHeight: 1.3,
                    maxWidth: isEterno ? "90%" : "85%",
                    textTransform: "uppercase",
                    letterSpacing: isEterno ? ".15em" : ".04em",
                    fontWeight: 700, textAlign: "center", color: "#fff",
                    textShadow: isEterno
                      ? `0 0 10px rgba(139,92,246,0.6), 0 1px 4px #00000088`
                      : raridade === "lendario"
                        ? `0 0 10px ${setorInfo.cor4}88, 0 1px 4px #00000088`
                        : `0 1px 6px #00000088`,
                  }}>
                    {nomeAtual}
                  </h1>
                </div>

                {/* Rodapé — ícone do setor */}
                <div className="bg-white/10" style={{
                  padding: "2px 10px", borderRadius: 6, flexShrink: 0,
                  color: setorInfo.cor4,
                  border: `1px solid ${setorInfo.cor3}66`,
                  fontSize: 10, fontWeight: 700,
                }}>
                  <img
                    src={getImageUrlSetor(debugSetor)}
                    alt={debugSetor}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    style={{
                      width: "20px", height: "30px", objectFit: "contain",
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

      {/* ====== BACKDROP FULLSCREEN ====== */}
      {isFullscreen && (
        <div
          onClick={fecharFullscreen}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 9999,
          }}
        />
      )}

      {/* ====== HUD SUPERIOR — fixa, não gira com a carta ======
          Setor + categoria à esquerda, fechar à direita. */}
      {isFullscreen && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 10001,
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            padding: "calc(20px + env(safe-area-inset-top)) 20px 0",
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6, pointerEvents: "auto" }}>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 999,
                background: `${setorInfo.cor2}55`,
                border: `1px solid ${setorInfo.cor4}66`,
                backdropFilter: "blur(8px)",
                width: "fit-content",
              }}
            >
                                      {/* <img
                          src={getImageUrl(debugSetor)}
                          alt={debugSetor}
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          style={{ width: "20px", height: "20px", objectFit: "contain", pointerEvents: "none" }}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        /> */}
              <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: ".02em" }}>
                {setorLabel || debugSetor}
              </span>
            </div>
            {/* <div style={{ display: "flex", alignItems: "center", gap: 5, paddingLeft: 4 }}>
              <CategoriaIcon size={11} color="rgba(255,255,255,0.55)" />
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>
                {categoriaLabel}
              </span>
            </div> */}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); fecharFullscreen(); }}
            style={{
              pointerEvents: "auto",
              width: 40, height: 40, borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ====== HUD INFERIOR — fixa, não gira com a carta ======
          Nível + progresso + quantidade + troca, e o botão de
          Experiência Premium fixo no rodapé da tela. */}
      {isFullscreen && (
        <div
          style={{
            position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 10001,
            display: "flex", flexDirection: "column", gap: 14,
            padding: "18px 20px calc(20px + env(safe-area-inset-bottom))",
            background: "linear-gradient(to top, rgba(5,2,10,0.92) 45%, transparent)",
            pointerEvents: "none",
          }}
        >
          <div style={{ pointerEvents: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: corNivelHUD, textShadow: `0 0 6px ${corNivelHUD}88` }}>
                  {progressInfo.labelNivel}
                </span>
                {podeTrocar && (
                  <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 800, letterSpacing: ".04em", color: "#4ade80", textShadow: "0 0 4px #4ade8066" }}>
                    <Check size={10} /> DISPONÍVEL P/ TROCA
                  </span>
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                {debugQtd}/{qtdMaxima}
              </span>
            </div>

            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", border: `1px solid ${corNivelHUD}44`, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${corNivelHUD}, ${corNivelHUD}cc)`,
                boxShadow: `0 0 8px ${corNivelHUD}aa`,
                borderRadius: 4,
              }} />
            </div>

            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              {progressInfo.texto}
            </span>
          </div>

          {tilt.gyroSuportado && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!tilt.gyroAtivo) tilt.ativarGiroscopio();
              }}
              disabled={tilt.gyroAtivo}
              style={{
                pointerEvents: "auto",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "14px 20px", borderRadius: 999,
                border: tilt.gyroAtivo ? "1px solid rgba(74,222,128,0.6)" : "1px solid rgba(255,255,255,0.18)",
                background: tilt.gyroAtivo
                  ? "linear-gradient(135deg, rgba(34,197,94,0.3), rgba(74,222,128,0.18))"
                  : "linear-gradient(90deg, #F27405, #6411D9)",
                color: tilt.gyroAtivo ? "#86efac" : "#fff",
                fontSize: 13, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase",
                boxShadow: tilt.gyroAtivo
                  ? "0 4px 20px rgba(74,222,128,0.35)"
                  : "0 4px 24px rgba(100,17,217,0.45), 0 2px 16px rgba(242,116,5,0.3)",
                cursor: tilt.gyroAtivo ? "default" : "pointer",
                transition: "all 0.3s ease",
              }}
              aria-label="Ativar experiência premium com giroscópio"
            >
              {tilt.gyroAtivo ? <Check size={16} /> : <Sparkles size={16} />}
              <span>{tilt.gyroAtivo ? "Experiência Ativa" : "Ativar Experiência Premium"}</span>
              {!tilt.gyroAtivo && <Smartphone size={16} />}
            </button>
          )}
        </div>
      )}

      {/* ====== ESTILOS ====== */}
      <style>{`
        @keyframes pulseAuraNv2 { 0%,100%{opacity:.6;} 50%{opacity:1;} }
        @keyframes pulseAuraNv3 { 0%,100%{opacity:.5;transform:scale(1);} 50%{opacity:1;transform:scale(1.02);} }
        @keyframes iconGlowEterno {
          0% { box-shadow: 0 0 15px rgba(76, 0, 255, 0.4), inset 0 0 14px rgba(99,102,241,0.2); }
          100% { box-shadow: 0 0 30px rgba(25, 7, 68, 0.7), inset 0 0 20px rgba(99,102,241,0.4); }
        }
        .card-no-select, .card-no-select * {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .card-no-select img {
          pointer-events: none;
          -webkit-user-drag: none;
          user-drag: none;
        }
      `}</style>
    </div>
  );
};

export default CardColection;