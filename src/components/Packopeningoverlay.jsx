// src/components/PackOpeningOverlay.jsx
import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../public/outrasImagens/logo Joguinho.png";
import CardPack from "./CardPack";

// ─── DETECTAR DISPOSITIVO ──────────────────────────────────────────
function useDeviceDetection() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkDevice = () => setIsMobile(window.innerWidth < 768);
        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    return { isMobile };
}

// ═══════════════════════════════════════════════════════════════════
// PARTÍCULA
// ═══════════════════════════════════════════════════════════════════
const Particle = ({ x, y, dx, dy, color, delay }) => (
    <motion.div
        style={{
            position: "absolute", left: x, top: y,
            width: 8, height: 8, borderRadius: "50%",
            background: color,
            boxShadow: `0 0 20px ${color}, 0 0 60px ${color}44`,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], x: [0, dx], y: [0, dy] }}
        transition={{ duration: 1.4, delay, ease: "easeOut" }}
    />
);

// ═══════════════════════════════════════════════════════════════════
// PACOTE VISUAL (com fases: idle → shaking → opening)
// ═══════════════════════════════════════════════════════════════════
const Pacote = ({ fase, onOpen, tema, isMobile }) => {
    const largura = isMobile ? 200 : 240;
    const altura = isMobile ? 280 : 340;

    const packGradient = `linear-gradient(160deg, ${tema.cor1} 0%, ${tema.cor2} 25%, ${tema.cor3} 50%, ${tema.cor2} 75%, ${tema.cor1} 100%)`;
    const metallicSheen = `linear-gradient(135deg, transparent 0%, ${tema.cor4}15 30%, ${tema.cor4}30 50%, ${tema.cor4}15 70%, transparent 100%)`;

    return (
        <motion.div
            style={{ position: "relative", width: largura, height: altura, cursor: "pointer", perspective: 1200 }}
            onClick={onOpen}
            animate={
                fase === "idle"
                    ? {
                        scale: [1, 1.015, 1],
                        boxShadow: [
                            `0 30px 80px ${tema.cor4}33`,
                            `0 30px 100px ${tema.cor4}66`,
                            `0 30px 80px ${tema.cor4}33`,
                        ],
                    }
                    : fase === "shaking"
                        ? {
                            rotate: [0, -5, 5, -5, 5, -4, 4, 0],
                            scale: [1, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1],
                            boxShadow: `0 40px 120px ${tema.cor4}88`,
                        }
                        : fase === "opening"
                            ? { y: -100, opacity: 0, scale: 0.8, boxShadow: `0 60px 200px ${tema.cor4}aa` }
                            : { rotate: 0, scale: 1 }
            }
            transition={
                fase === "idle"
                    ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                    : fase === "shaking"
                        ? { duration: 0.7, times: [0, .1, .25, .4, .55, .7, .85, 1] }
                        : { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
            }
            exit={{ y: -120, opacity: 0, scale: 0.7, transition: { duration: 0.5 } }}
            whileHover={fase === "idle" ? { scale: 1.05, y: -6 } : {}}
        >
            {/* Aura luminosa */}
            <motion.div
                style={{
                    position: "absolute", inset: "-30px", borderRadius: "40px",
                    background: `radial-gradient(circle at 50% 40%, ${tema.cor4}44, ${tema.cor4}11 60%, transparent 80%)`,
                    filter: "blur(30px)", opacity: 0.5, pointerEvents: "none",
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Sombra de base */}
            <div style={{
                position: "absolute", inset: "10px", borderRadius: 20,
                background: `radial-gradient(ellipse at 50% 80%, ${tema.cor4}22, transparent 70%)`,
                filter: "blur(15px)", pointerEvents: "none",
            }} />

            <div style={{
                position: "absolute", inset: 0, borderRadius: 20,
                background: packGradient, border: `2px solid ${tema.cor4}88`,
                boxShadow: `inset 0 2px 0 ${tema.cor4}44, 0 20px 60px ${tema.cor4}33, 0 0 40px ${tema.cor4}22`,
                overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", inset: 0, borderRadius: 20,
                    backgroundImage: `repeating-linear-gradient(0deg, ${tema.cor4}06 0px, ${tema.cor4}06 1px, transparent 1px, transparent 6px), repeating-linear-gradient(90deg, ${tema.cor4}04 0px, ${tema.cor4}04 1px, transparent 1px, transparent 6px)`,
                }} />

                <motion.div
                    style={{ position: "absolute", inset: 0, borderRadius: 20, background: metallicSheen }}
                    animate={{ x: [-50, 50, -50], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                <div style={{ position: "absolute", inset: 3, borderRadius: 18, border: `1px solid ${tema.cor4}22`, pointerEvents: "none" }} />

                <motion.div
                    style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 72,
                        background: `linear-gradient(160deg, ${tema.cor2} 0%, ${tema.cor3} 40%, ${tema.cor2} 70%, ${tema.cor3} 100%)`,
                        borderRadius: "20px 20px 0 0", borderBottom: `2px solid ${tema.cor4}88`,
                        transformOrigin: "top center", overflow: "hidden", zIndex: 5,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                    animate={fase === "opening" ? { rotateX: -130, y: -30, opacity: 0 } : { rotateX: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, transparent 20%, ${tema.cor4}33 50%, transparent 80%)` }} />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent 0%, ${tema.cor4}66 50%, transparent 100%)` }} />
                    <div style={{ position: "absolute", bottom: 0, left: 20, right: 20, height: 2, background: `repeating-linear-gradient(90deg, ${tema.cor4} 0px, ${tema.cor4} 8px, transparent 8px, transparent 16px)`, opacity: 0.4 }} />
                    <div style={{ position: "absolute", top: 10, right: 16, width: 20, height: 20, borderRadius: "50%", border: `2px solid ${tema.cor4}66`, background: `radial-gradient(circle, ${tema.cor4}33, transparent)` }} />
                </motion.div>

                <div style={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    width: 110, height: 110, borderRadius: "50%",
                    background: `radial-gradient(circle at 30% 30%, ${tema.cor2} 0%, ${tema.cor1} 80%, ${tema.cor3} 100%)`,
                    border: `3px solid ${tema.cor4}88`,
                    boxShadow: `inset 0 -10px 30px rgba(0,0,0,0.2), 0 10px 40px ${tema.cor4}33`,
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                }}>
                    <img
                        src={logo}
                        className="rounded-full"
                        alt="Logo"
                        style={{ width: "80%", height: "80%", objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}
                    />
                    <div style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        background: `radial-gradient(circle at 30% 20%, ${tema.cor4}44, transparent 70%)`,
                        pointerEvents: "none",
                    }} />
                </div>

                <div style={{
                    position: "absolute", top: 86, left: 0, right: 0, textAlign: "center", fontSize: 14,
                    color: tema.cor4, letterSpacing: 4, opacity: 0.6, fontWeight: 300,
                }}>✦ ✦ ✦</div>

                <motion.div
                    style={{
                        position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center",
                        fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: tema.cor4,
                        fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif",
                        textShadow: `0 0 30px ${tema.cor4}22`, letterSpacing: ".2em", opacity: 0.9,
                    }}
                    animate={fase === "idle" ? { letterSpacing: [".2em", ".3em", ".2em"], opacity: [0.8, 1, 0.8] } : {}}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    Business Game
                </motion.div>

                <div style={{ position: "absolute", bottom: 60, left: 40, right: 40, height: 1, background: `linear-gradient(90deg, transparent 0%, ${tema.cor4}33 50%, transparent 100%)` }} />
            </div>

            {fase === "opening" && (
                <>
                    <motion.div
                        style={{
                            position: "absolute", inset: "-50px", borderRadius: "50%",
                            border: `2px solid ${tema.cor4}55`, pointerEvents: "none", boxShadow: `0 0 60px ${tema.cor4}33`,
                        }}
                        animate={{ scale: [0.5, 3], opacity: [0.8, 0] }}
                        transition={{ duration: 1, ease: "easeOut", repeat: 3, repeatDelay: 0.15 }}
                    />
                    <motion.div
                        style={{
                            position: "absolute", inset: "-70px", borderRadius: "50%",
                            border: `1px solid ${tema.cor4}33`, pointerEvents: "none",
                        }}
                        animate={{ scale: [0.3, 3.5], opacity: [0.6, 0] }}
                        transition={{ duration: 1.2, ease: "easeOut", repeat: 2, repeatDelay: 0.3 }}
                    />
                </>
            )}
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — PackOpeningOverlay
// ═══════════════════════════════════════════════════════════════════
// Recebe as cartas JÁ SORTEADAS pelo ModalShop (nome, rank, setor,
// setorLabel) e o tema do pacote comprado. Controla apenas a
// experiência de abertura: idle → shaking → opening → revealed.
// Renderiza em tela cheia, por cima de tudo — a loja fica escondida
// enquanto este componente está montado.
export const PackOpeningOverlay = ({ pacoteNome, tema, cartas = [], onClose }) => {
    const { isMobile } = useDeviceDetection();
    const [fase, setFase] = useState("idle");
    const [particles, setParticles] = useState([]);

    const spawnParticles = useCallback(() => {
        const colors = [tema.cor4, tema.cor3, "#ffffff", `${tema.cor4}aa`, `${tema.cor3}88`];
        const count = isMobile ? 30 : 60;
        const list = Array.from({ length: count }, (_, i) => {
            const angle = Math.random() * 2 * Math.PI;
            const dist = 80 + Math.random() * 200;
            return {
                id: i, x: "50%", y: "20%",
                color: colors[Math.floor(Math.random() * colors.length)],
                dx: Math.cos(angle) * dist,
                dy: Math.sin(angle) * dist,
                delay: Math.random() * 0.3,
            };
        });
        setParticles(list);
        setTimeout(() => setParticles([]), 1800);
    }, [tema, isMobile]);

    const handleOpen = () => {
        if (fase !== "idle") return;
        setFase("shaking");
        setTimeout(() => setFase("opening"), 800);
        setTimeout(() => spawnParticles(), 1000);
        setTimeout(() => setFase("revealed"), 1500);
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: `radial-gradient(ellipse at 50% 30%, ${tema.cor1} 0%, #07070f 80%)`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: isMobile ? 20 : 28, padding: isMobile ? 20 : 32,
                overflowY: "auto",
            }}
        >
            <div style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(circle at 50% 20%, ${tema.cor4}11, transparent 70%)`,
                pointerEvents: "none",
            }} />

            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                <AnimatePresence>
                    {particles.map((p) => <Particle key={p.id} {...p} />)}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {fase !== "revealed" && (
                    <Pacote key="pacote" fase={fase} onOpen={handleOpen} tema={tema} isMobile={isMobile} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {fase === "idle" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                            position:'fixed', bottom:'30px',
                            fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase",
                            color: `${tema.cor4}66`, fontFamily: "'Inter', sans-serif", fontWeight: 500,
                        }}
                    >
                        ✦ Clique no pacote para abrir ✦
                    </motion.div>
                )}
            </AnimatePresence>

            {/* <AnimatePresence>
                {fase === "idle" && (
                    <motion.button
                        onClick={handleOpen}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        whileHover={{ scale: 1.06, y: -4, boxShadow: `0 12px 50px ${tema.cor4}66` }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: "14px 44px", borderRadius: 12, border: "none",
                            background: `linear-gradient(135deg, ${tema.cor4} 0%, ${tema.cor3} 100%)`,
                            color: "#fff", fontSize: 14, fontWeight: 700,
                            letterSpacing: ".15em", textTransform: "uppercase", cursor: "pointer",
                            boxShadow: `0 6px 30px ${tema.cor4}44`, position: "relative", overflow: "hidden",
                            fontFamily: "'Inter', sans-serif", transition: "all 0.3s ease",
                        }}
                    >
                        <motion.div
                            style={{
                                position: "absolute", top: 0, left: "-150%", width: "400%", height: "100%",
                                background: `linear-gradient(90deg, transparent 0%, ${tema.cor4}55 50%, transparent 100%)`,
                            }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                        <div style={{ position: "absolute", inset: 0, borderRadius: 12, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)", pointerEvents: "none" }} />
                        Abrir Pacote
                    </motion.button>
                )}
            </AnimatePresence> */}

            {/* ── Revelação — grid de 3 colunas, sem scroll lateral ── */}
<AnimatePresence>
    {fase === "revealed" && (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
                position: "relative", 
                width: "100%", 
                maxWidth: 500,
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                gap: isMobile ? 20 : 30, 
                borderRadius: 20,
                // Padding bottom seguro para o botão fixo, sem forçar scroll
                padding: isMobile ? "20px 16px 90px" : "30px 20px 110px",
                // REMOVIDO: minHeight: "100vh" e justifyContent: "center"
                boxSizing: "border-box",
            }}
        >
            {/* Título do Pacote */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ textAlign: "center", marginBottom: 10 }}
            >
                <h1 style={{
                    color: "#fff", 
                    fontSize: isMobile ? 20 : 28, 
                    fontWeight: 800,
                    fontFamily: "'Inter', sans-serif", 
                    textShadow: `0 0 40px ${tema.cor4}88`,
                    letterSpacing: "-0.02em"
                }}>
                     {pacoteNome}
                </h1>
            </motion.div>

            {/* Container das Cartas - MANTIDO O TAMANHO ORIGINAL */}
            <div
                style={{
                    position: "relative", 
                    zIndex: 2, 
                    display: "flex", 
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: isMobile ? 16 : 24,
                    width: "100%",
                    maxWidth: 400,
                    // Garante que o container não force altura extra
                    height: "auto",
                }}
            >
                {cartas.map((carta, i) => (
                    <motion.div
                        key={`${carta.nome}-${i}`}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                            delay: 0.15 + i * 0.1, 
                            duration: 0.5, 
                            type: "spring", 
                            stiffness: 260, 
                            damping: 20 
                        }}
                        style={{ 
                            // TAMANHO ORIGINAL MANTIDO
                            width: isMobile ? "45%" : "30%",
                            minWidth: 100,
                            maxWidth: 140,
                            aspectRatio: "3 / 4",
                            opacity: 1,
                            filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
                            flexShrink: 0,
                        }}
                    >
                        <CardPack
                            nome={carta.nome}
                            rank={carta.rank}
                            setor={carta.setor}
                            setorLabel={carta.setorLabel}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Botão Fixo na Base - MANTIDO IGUAL */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: isMobile ? "16px 20px 30px" : "20px 40px 40px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
                    display: "flex",
                    justifyContent: "center",
                    zIndex: 100,
                    pointerEvents: "none",
                }}
            >
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: `0 8px 40px ${tema.cor4}88` }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    style={{
                        pointerEvents: "auto",
                        padding: isMobile ? "14px 48px" : "16px 64px", 
                        borderRadius: 50,
                        border: `2px solid ${tema.cor4}66`,
                        background: `linear-gradient(135deg, ${tema.cor4} 0%, ${tema.cor3} 100%)`,
                        color: "#fff", 
                        fontSize: isMobile ? 14 : 16, 
                        fontWeight: 800,
                        letterSpacing: ".1em", 
                        textTransform: "uppercase", 
                        cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: `0 4px 30px ${tema.cor4}66, 0 0 40px ${tema.cor4}33`,
                    }}
                >
                    Coletar Cartas
                </motion.button>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>
        </div>
    );
};

export default PackOpeningOverlay;