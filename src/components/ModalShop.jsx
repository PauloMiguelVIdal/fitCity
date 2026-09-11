// src/components/ModalShop.jsx
import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Coins, ShoppingCart, X } from "lucide-react";
import logo from "../../public/outrasImagens/logo Joguinho.png";
import PackOpeningOverlay from "./Packopeningoverlay";
// ─── DETECTAR DISPOSITIVO ──────────────────────────────────────────
function useDeviceDetection() {
    const [isMobile, setIsMobile] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            const mobile = window.innerWidth < 768;
            const landscape = window.innerWidth > window.innerHeight && mobile;
            setIsMobile(mobile);
            setIsLandscape(landscape);
        };

        checkDevice();
        window.addEventListener("resize", checkDevice);
        const handleOrientationChange = () => setTimeout(checkDevice, 300);
        window.addEventListener("orientationchange", handleOrientationChange);

        return () => {
            window.removeEventListener("resize", checkDevice);
            window.removeEventListener("orientationchange", handleOrientationChange);
        };
    }, []);

    return { isMobile, isLandscape, isDesktop: !isMobile };
}

// ═══════════════════════════════════════════════════════════════════
// 0. CONFIGURAÇÃO DE SETORES
// ═══════════════════════════════════════════════════════════════════
const SETORES_CONFIG = {
    agricultura: { id: "agricultura", label: "Agricultura", cor1: "#003816", cor2: "#1A5E2A", cor3: "#0C9123", cor4: "#4CAF50" },
    tecnologia:  { id: "tecnologia",  label: "Tecnologia",  cor1: "#A64B00", cor2: "#D45A00", cor3: "#FF6F00", cor4: "#FF8C42" },
    industria:   { id: "industria",   label: "Indústria",   cor1: "#1A1A1A", cor2: "#4D4D4D", cor3: "#808080", cor4: "#B3B3B3" },
    comercio:    { id: "comercio",    label: "Comércio",    cor1: "#660000", cor2: "#A31919", cor3: "#E60000", cor4: "#FF4D4D" },
    imobiliario: { id: "imobiliario", label: "Imobiliário", cor1: "#000066", cor2: "#1A1A8C", cor3: "#3333CC", cor4: "#6666FF" },
    energia:     { id: "energia",     label: "Energia",     cor1: "#665200", cor2: "#A37F19", cor3: "#E6B800", cor4: "#FFD966" },
    outros:      { id: "outros",      label: "Outros",      cor1: "#1A1A1A", cor2: "#4D4D4D", cor3: "#808080", cor4: "#B3B3B3" },
};

// ═══════════════════════════════════════════════════════════════════
// 0.1 MAPA DE SETOR POR NOME DE EDIFÍCIO
// ═══════════════════════════════════════════════════════════════════
const mapaSetor = {
    "Plantação De Grãos": "agricultura", "Plantação De Vegetais": "agricultura",
    "Fazenda Administrativa": "agricultura", "Pomares": "agricultura",
    "Cooperativa Agrícola": "agricultura", "Centro De Comércio De Plantações": "agricultura",
    "Fazenda De Vacas": "agricultura", "Granja De Aves": "agricultura",
    "Criação De Ovinos": "agricultura", "Armazém": "agricultura",
    "Silo": "agricultura", "Depósito De Resíduos Orgânicos": "agricultura",
    "Serraria": "agricultura", "Área Florestal": "agricultura",
    "Terreno De Mineração": "agricultura", "Plantação De Eucalipto": "agricultura",
    "Plantação De Plantas Medicinais": "agricultura", "Campo De Estocagem": "agricultura",
    "Pátio De Mineração": "agricultura",
    "Fábrica De Móveis": "industria", "Fábrica De Rações": "industria",
    "Fábrica De Embalagens": "industria", "Fábrica De Fertilizantes": "industria",
    "Fábrica De Bebidas": "industria", "Fábrica De Pães": "industria",
    "Fábrica Têxtil": "industria", "Fábrica De Calçados": "industria",
    "Fábrica De Roupas": "industria", "Fábrica De Celulose": "industria",
    "Fábrica De Papel": "industria", "Fábrica De Livros": "industria",
    "Fábrica De Medicamentos": "industria", "Laboratório Farmacêutico": "industria",
    "Fábrica De Plásticos": "industria", "Fábrica De Químicos Especializados": "industria",
    "Alto-Forno": "industria", "Usina Siderúrgica": "industria",
    "Fundição De Alumínio": "industria", "Fábrica De Ligas Metálicas": "industria",
    "Indústria De Componentes Mecânicos": "industria", "Fábrica De Chapas Metálicas": "industria",
    "Fábrica De Estruturas Metálicas": "industria", "Fábrica De Peças Automotivas": "industria",
    "Montadora De Veículos Elétricos": "industria", "Fábrica De Automóveis": "industria",
    "Refinaria De Biocombustíveis": "industria", "Refinaria": "industria",
    "Biofábrica": "industria", "Fábrica De Chips": "industria",
    "Fábrica De Placas Eletrônicas": "industria", "Fábrica De Semicondutores": "industria",
    "Fábrica De Eletrônicos": "industria", "Fábrica De Robôs": "industria",
    "Empresa De Automação Industrial": "industria", "Fábrica De Motores": "industria",
    "Fábrica De Foguetes": "industria", "Fábrica De Aeronaves": "industria",
    "Estaleiro": "industria", "Container Modular": "industria", "Pátio De Veículos": "industria",
    "Startup": "tecnologia", "Servidor Em Nuvem": "tecnologia",
    "Data Center": "tecnologia", "Empresa De Desenvolvimento De Software": "tecnologia",
    "Empresa De Jogos Digitais": "tecnologia", "Empresa De Telecomunicações": "tecnologia",
    "Plataforma De Redes Sociais": "tecnologia", "Marketplace Online": "tecnologia",
    "Plataforma De Streaming": "tecnologia", "Fábrica De Smartphones": "tecnologia",
    "Fábrica De Computadores": "tecnologia", "Fábrica De Consoles De Jogos": "tecnologia",
    "Fábrica De Dispositivos Vestíveis": "tecnologia", "Instituto De Tecnologia Alimentar": "tecnologia",
    "Centro De Pesquisa Agrícola": "tecnologia", "Instituto De Biotecnologia": "tecnologia",
    "Laboratório De Nanotecnologia": "tecnologia", "Centro De Pesquisa Em Eletrônicos": "tecnologia",
    "Laboratório De Design De Produtos": "tecnologia", "Centro De Pesquisa Química": "tecnologia",
    "Centro De Pesquisa Em Fusão Nuclear": "tecnologia", "Laboratório De Novos Combustíveis": "tecnologia",
    "Centro De Pesquisa Aeroespacial": "tecnologia", "Centro De Engenharia Avançada": "tecnologia",
    "Centro De Pesquisa Em Materiais": "tecnologia", "Centro De Pesquisa Em Robótica": "tecnologia",
    "Centro De Pesquisa Em IA": "tecnologia",
    "Feira": "comercio", "Loja De Móveis": "comercio", "Restaurante": "comercio",
    "Livraria": "comercio", "Mercado": "comercio", "Adega": "comercio",
    "Câmara Fria": "comercio", "Padaria": "comercio", "Açougue": "comercio",
    "Loja De Conveniência": "comercio", "Posto De Combustíveis": "comercio",
    "Rede De Fast-Food": "comercio", "Petshop": "comercio", "Farmácia": "comercio",
    "Cafeteria": "comercio", "Loja De Departamentos": "comercio",
    "Loja De Calçados": "comercio", "Loja De Vestuário": "comercio",
    "Loja De Gadgets E Wearables": "comercio", "Loja De Games": "comercio",
    "Loja De Celulares": "comercio", "Loja De Informática": "comercio",
    "Loja De Eletrônicos": "comercio", "Joalheria": "comercio",
    "Concessionária De Veículos": "comercio", "Shopping Popular": "comercio",
    "Shopping Center": "comercio", "Centro De Transporte E Entrega": "comercio",
    "Centro De Distribuição": "comercio", "Armazém Logístico": "comercio",
    "Transporte Petrolífero": "comercio",
    "Cartório E Licenças": "imobiliario", "Terraplanagem E Pavimentação": "imobiliario",
    "Construtora De Pequenas Obras": "imobiliario", "Escritório De Design De Interiores": "imobiliario",
    "Escritório De Arquitetura": "imobiliario", "Consultoria Em Engenharia Civil": "imobiliario",
    "Construtora": "imobiliario", "Imobiliária Residencial": "imobiliario",
    "Imobiliária Comercial": "imobiliario", "Construtora De Infraestruturas": "imobiliario",
    "Aeroporto": "imobiliario", "Porto": "imobiliario",
    "Mineradora": "imobiliario", "Mineradora Radioativa": "imobiliario",
    "Mineradora De Pedras Preciosas": "imobiliario", "Mega Mercado": "imobiliario",
    "Prédio De Alto Padrão": "imobiliario", "Centro De Coleta De Biomassa": "imobiliario",
    "Tanque De Armazenamento De Fluidos": "imobiliario", "Plataforma De Petróleo": "imobiliario",
    "Hangar": "imobiliario",
    "Subestação De Energia": "energia", "Rede De Distribuição Elétrica": "energia",
    "Fábrica De Turbinas Eólicas": "energia", "Fábrica De Baterias": "energia",
    "Empresa De Comércio Energético": "energia", "Empresa De Consultoria Energética": "energia",
    "Estação De Carregamento": "energia", "Centro De Pesquisa Em Energias Renováveis": "energia",
    "Centro De Pesquisa Energética": "energia", "Centro De Reciclagem De Baterias": "energia",
    "Usina Termelétrica A Biocombustíveis": "energia", "Usina De Biomassa": "energia",
    "Usina Hidrelétrica": "energia", "Parque Eólico": "energia",
    "Usina Termelétrica": "energia", "Reator Nuclear Convencional": "energia",
    "Usina De Fusão Nuclear": "energia",
};

const getSetor = (nome) => mapaSetor[nome] || "outros";
const getSetorLabel = (setorId) => SETORES_CONFIG[setorId]?.label || setorId;

// ═══════════════════════════════════════════════════════════════════
// 1. RESOLVER CORES DOS PACOTES
// ═══════════════════════════════════════════════════════════════════
const mesclarCores = (setorA, setorB) => {
    const a = SETORES_CONFIG[setorA] || SETORES_CONFIG.outros;
    const b = SETORES_CONFIG[setorB] || SETORES_CONFIG.outros;
    return { cor1: a.cor1, cor2: b.cor2, cor3: a.cor3, cor4: b.cor4 };
};

const obterCoresPacote = (pacote) => {
    if (!pacote) return { ...SETORES_CONFIG.outros };

    if (pacote.categoria === "setorial" && Array.isArray(pacote.setoresIds) && pacote.setoresIds.length >= 2) {
        const [setorA, setorB] = pacote.setoresIds;
        return { ...pacote, ...mesclarCores(setorA, setorB), setorA, setorB };
    }

    if (pacote.cor1 || pacote.cor2 || pacote.cor3 || pacote.cor4) {
        return {
            ...pacote,
            cor1: pacote.cor1 || SETORES_CONFIG.outros.cor1,
            cor2: pacote.cor2 || SETORES_CONFIG.outros.cor2,
            cor3: pacote.cor3 || SETORES_CONFIG.outros.cor3,
            cor4: pacote.cor4 || SETORES_CONFIG.outros.cor4,
        };
    }

    const setor = pacote.setorId || pacote.setor || (Array.isArray(pacote.setoresIds) ? pacote.setoresIds[0] : null);
    const config = SETORES_CONFIG[setor] || SETORES_CONFIG.outros;
    return { ...pacote, ...config };
};

// ═══════════════════════════════════════════════════════════════════
// 2. RANKS DOS EDIFÍCIOS
// ═══════════════════════════════════════════════════════════════════
const RankS = ["Usina Hidrelétrica", "Reator Nuclear Convencional", "Usina De Fusão Nuclear", "Shopping Popular", "Shopping Center", "Fábrica De Computadores", "Construtora De Infraestruturas", "Aeroporto", "Porto", "Mineradora Radioativa", "Plataforma De Petróleo", "Montadora De Veículos Elétricos", "Fábrica De Automóveis", "Refinaria", "Fábrica De Chips", "Fábrica De Semicondutores", "Fábrica De Robôs", "Fábrica De Motores", "Fábrica De Foguetes", "Fábrica De Aeronaves"];
const RankA = ["Cooperativa Agrícola", "Usina De Biomassa", "Transporte Petrolífero", "Marketplace Online", "Plataforma De Streaming", "Fábrica De Smartphones", "Fábrica De Consoles De Jogos", "Fábrica De Dispositivos Vestíveis", "Centro De Pesquisa Em Fusão Nuclear", "Centro De Pesquisa Aeroespacial", "Centro De Engenharia Avançada", "Centro De Pesquisa Em Materiais", "Centro De Pesquisa Em IA", "Mineradora De Pedras Preciosas", "Mega Mercado", "Prédio De Alto Padrão", "Tanque De Armazenamento Biocombustível", "Fábrica De Químicos Especializados", "Alto-Forno", "Usina Siderúrgica", "Fundição De Alumínio", "Fábrica De Ligas Metálicas", "Fábrica De Peças Automotivas", "Refinaria De Biocombustíveis", "Biofábrica", "Fábrica De Eletrônicos", "Empresa De Automação Industrial", "Estaleiro"];
const RankB = ["Centro De Comércio De Plantações", "Empresa De Comércio Energético", "Empresa De Consultoria Energética", "Centro De Pesquisa Em Energias Renováveis", "Centro De Pesquisa Energética", "Usina Termelétrica A Biocombustíveis", "Usina Termelétrica", "Joalheria", "Concessionária De Veículos", "Centro De Distribuição", "Armazém Logístico", "Servidor Em Nuvem", "Data Center", "Empresa De Desenvolvimento De Software", "Empresa De Jogos Digitais", "Empresa De Telecomunicações", "Plataforma De Redes Sociais", "Marketplace Online", "Instituto De Tecnologia Alimentar", "Centro De Pesquisa Agrícola", "Instituto De Biotecnologia", "Laboratório De Nanotecnologia", "Centro De Pesquisa Em Eletrônicos", "Laboratório De Design De Produtos", "Laboratório De Novos Combustíveis", "Centro De Engenharia Avançada", "Centro De Pesquisa Em Robótica", "Construtora", "Imobiliária Residencial", "Imobiliária Comercial", "Mineradora", "Centro De Coleta De Biomassa", "Fábrica De Fertilizantes", "Fábrica De Medicamentos", "Laboratório Farmacêutico", "Fábrica De Plásticos", "Indústria De Componentes Mecânicos", "Fábrica De Chapas Metálicas", "Fábrica De Estruturas Metálicas", "Fábrica De Placas Eletrônicas"];
const RankC = ["Plantação De Grãos", "Plantação De Vegetais", "Pomares", "Fazenda Administrativa", "Fazenda De Vacas", "Granja De Aves", "Criação De Ovinos", "Armazém", "Silo", "Depósito De Resíduos Orgânicos", "Madeireira", "Área Florestal", "Terreno De Mineração", "Plantação De Eucalipto", "Plantação De Plantas Medicinais", "Subestação De Energia", "Rede De Distribuição Elétrica", "Usina Solar", "Fábrica De Turbinas Eólicas", "Fábrica De Painéis Solares", "Fábrica De Baterias", "Estação De Carregamento", "Centro De Reciclagem De Baterias", "Parque Eólico", "Feira", "Loja De Móveis", "Restaurante", "Livraria", "Mercado", "Adega", "Padaria", "Açougue", "Loja De Conveniência", "Posto De Combustíveis", "Rede De Fast-Food", "Petshop", "Farmácia", "Cafeteria", "Loja De Departamentos", "Loja De Calçados", "Loja De Vestuário", "Loja De Gadgets E Wearables", "Loja De Games", "Loja De Celulares", "Loja De Informática", "Loja De Eletrônicos", "Centro De Transporte E Entrega", "Startup", "Centro De Pesquisa Química", "Cartório E Licenças", "Terraplanagem E Pavimentação", "Construtora De Pequenas Obras", "Escritório De Design De Interiores", "Escritório De Arquitetura", "Consultoria Em Engenharia Civil", "Fábrica De Móveis", "Fábrica De Rações", "Fábrica De Embalagens", "Fábrica De Bebidas", "Fábrica De Pães", "Fábrica Têxtil", "Fábrica De Calçados", "Fábrica De Roupas", "Fábrica De Celulose", "Fábrica De Papel", "Fábrica De Livros"];

// ═══════════════════════════════════════════════════════════════════
// 3. FUNÇÕES DE SORTEIO
// ═══════════════════════════════════════════════════════════════════
const sortearRank = (probabilidades) => {
    const rand = Math.random() * 100;
    let acumulado = 0;
    for (const [rank, prob] of Object.entries(probabilidades)) {
        acumulado += prob;
        if (rand <= acumulado) return rank;
    }
    return "C";
};

const sortearCartaDoRank = (rank) => {
    let pool = [];
    switch (rank) {
        case "S": pool = [...RankS]; break;
        case "A": pool = [...RankA]; break;
        case "B": pool = [...RankB]; break;
        case "C": pool = [...RankC]; break;
        default: pool = [...RankC];
    }
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
};

const sortearCartasDoPacote = (pacote) => {
    const config = pacote.probabilidades || { S: 0, A: 0, B: 10, C: 90 };
    const quantidades = pacote.quantidade || 3;
    const cartasSorteadas = [];
    const usedCards = new Set();

    for (let i = 0; i < quantidades; i++) {
        let tentativas = 0;
        let carta = null;
        let rank = null;

        while (tentativas < 20) {
            rank = sortearRank(config);
            carta = sortearCartaDoRank(rank);
            if (carta && !usedCards.has(carta)) {
                usedCards.add(carta);
                break;
            }
            tentativas++;
            carta = null;
        }

        if (!carta) {
            for (const r of ["C", "B", "A", "S"]) {
                const tentativa = sortearCartaDoRank(r);
                if (tentativa && !usedCards.has(tentativa)) {
                    carta = tentativa;
                    rank = r;
                    usedCards.add(carta);
                    break;
                }
            }
        }

        if (carta) {
            cartasSorteadas.push({ nome: carta, rank: rank || "C" });
        }
    }

    return cartasSorteadas;
};

const gerarUpgrades = (cartas) => {
    return cartas.map(({ nome, rank }) => ({
        nome,
        rank,
        fatu: Math.floor(Math.random() * 10) + 1,
        redImposto: Math.floor(Math.random() * 10) + 1,
    }));
};

// ═══════════════════════════════════════════════════════════════════
// 4. COMPONENTE VISUAL DO PACOTE (miniatura na lista da loja)
// ═══════════════════════════════════════════════════════════════════
const PacoteVisual = ({ pacote, onClick }) => {
    const tema = {
        cor1: pacote.cor1 || "#ffffff",
        cor2: pacote.cor2 || "#3e3a44",
        cor3: pacote.cor3 || "#fde4ce",
        cor4: pacote.cor4 || "#1f014e",
    };

    const packGradient = `linear-gradient(160deg, ${tema.cor1} 0%, ${tema.cor2} 25%, ${tema.cor3} 50%, ${tema.cor2} 75%, ${tema.cor1} 100%)`;
    const metallicSheen = `linear-gradient(135deg, transparent 0%, ${tema.cor4}15 30%, ${tema.cor4}30 50%, ${tema.cor4}15 70%, transparent 100%)`;
    const logoSizePercent = "45%";

    return (
        <motion.div
            className="relative w-full aspect-[3/4] rounded-lg flex flex-col items-center justify-center shadow-md border border-white/10 overflow-hidden transition-transform group-active:scale-95"
            style={{ cursor: "pointer", perspective: 1200 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
        >
            <motion.div
                style={{
                    position: "absolute", inset: "-15%", borderRadius: "30px",
                    background: `radial-gradient(circle at 50% 40%, ${tema.cor4}44, ${tema.cor4}11 60%, transparent 80%)`,
                    filter: "blur(15px)", opacity: 0.4, pointerEvents: "none",
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: packGradient, overflow: "hidden" }}>
                <div style={{
                    position: "absolute", inset: 0, borderRadius: 8,
                    backgroundImage: `repeating-linear-gradient(0deg, ${tema.cor4}06 0px, ${tema.cor4}06 1px, transparent 1px, transparent 5px), repeating-linear-gradient(90deg, ${tema.cor4}04 0px, ${tema.cor4}04 1px, transparent 1px, transparent 5px)`,
                }} />
                <motion.div
                    style={{ position: "absolute", inset: 0, borderRadius: 8, background: metallicSheen }}
                    animate={{ x: [-30, 30, -30], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
            <div style={{
                position: "relative", width: logoSizePercent, aspectRatio: "1/1",
                borderRadius: "50%",
                background: `radial-gradient(circle at 30% 30%, ${tema.cor2} 0%, ${tema.cor1} 80%, ${tema.cor3} 100%)`,
                border: `2px solid ${tema.cor4}88`,
                boxShadow: `inset 0 -8px 20px rgba(0,0,0,0.2), 0 8px 30px ${tema.cor4}33`,
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
            }}>
                <img
                    src={logo}
                    className="rounded-full"
                    alt="Logo"
                    style={{ width: "75%", height: "75%", objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}
                />
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════
// 5. COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export const ModalShop = ({ onCancelar, pacotes = [], moedas = 0 }) => {
    const { isMobile } = useDeviceDetection();

    const [erro, setErro] = useState("");
    const [saldoLocal, setSaldoLocal] = useState(moedas);

    // Quando preenchido, a loja inteira "some" e só o overlay de
    // abertura é renderizado em tela cheia.
    const [pacoteAbrindo, setPacoteAbrindo] = useState(null);

    useEffect(() => {
        setSaldoLocal(moedas);
    }, [moedas]);

    const comprarEAbirPacote = useCallback((pacote) => {
        const preco = pacote.preco || 0;

        if (saldoLocal < preco) {
            setErro(`Saldo insuficiente! R$ ${preco.toLocaleString("pt-BR")}`);
            setTimeout(() => setErro(""), 3000);
            return;
        }

        const pacoteComTema = obterCoresPacote(pacote);

        const cartasSorteadasRank = sortearCartasDoPacote(pacoteComTema);
        if (cartasSorteadasRank.length === 0) {
            setErro("Nenhuma carta sorteada.");
            setTimeout(() => setErro(""), 3000);
            return;
        }

        // Debita o saldo já na compra, antes da animação de abertura
        setSaldoLocal((prev) => prev - preco);

        // Enriquece cada carta com setor/setorLabel para o CardPack
        const cartasComSetor = gerarUpgrades(cartasSorteadasRank).map((carta) => {
            const setor = getSetor(carta.nome);
            return { ...carta, setor, setorLabel: getSetorLabel(setor) };
        });

        // Dispara o overlay de abertura em tela cheia — a loja fica
        // fora da árvore de render enquanto isso estiver setado.
        setPacoteAbrindo({
            nome: pacoteComTema.nome,
            tema: {
                cor1: pacoteComTema.cor1,
                cor2: pacoteComTema.cor2,
                cor3: pacoteComTema.cor3,
                cor4: pacoteComTema.cor4,
            },
            cartas: cartasComSetor,
        });
    }, [saldoLocal]);

    // Fecha a loja inteira (botão X)
    const handleFechar = () => {
        setErro("");
        setPacoteAbrindo(null);
        if (onCancelar) onCancelar();
    };

    // Fecha só o overlay de abertura, voltando para a lista de pacotes
    const handleFecharAbertura = () => {
        setPacoteAbrindo(null);
    };

    // ═════════════════════════════════════════════════════════════
    // Se um pacote estiver sendo aberto, a loja não é renderizada —
    // só o overlay de abertura, em tela cheia.
    // ═════════════════════════════════════════════════════════════
    if (pacoteAbrindo) {
        return (
            <PackOpeningOverlay
                pacoteNome={pacoteAbrindo.nome}
                tema={pacoteAbrindo.tema}
                cartas={pacoteAbrindo.cartas}
                onClose={handleFecharAbertura}
            />
        );
    }

    // ═════════════════════════════════════════════════════════════
    // PACOTES
    // ═════════════════════════════════════════════════════════════
    const renderPacotes = () => {
        const principais = pacotes.filter((p) => p.categoria === "principal");
        const setoriais = pacotes.filter((p) => p.categoria === "setorial");
        const customizacao = pacotes.filter((p) => p.categoria === "customizacao");

        const renderSecao = (titulo, listaPacotes, subtitulo = "") => {
            if (listaPacotes.length === 0) return null;

            return (
                <div className="mb-6">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-white">
                        {titulo}
                        {subtitulo && (
                            <span className="text-[10px] text-white/60 font-normal">{subtitulo}</span>
                        )}
                    </h3>

                    <div className="flex flex-col gap-3">
                        {listaPacotes.map((pacote) => {
                            const coresPacote = obterCoresPacote(pacote);

                            return (
                                <motion.div
                                    key={pacote.id}
                                    whileHover={!isMobile ? { scale: 1.02, y: -2 } : {}}
                                    className="flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                                >
                                    <div className="w-16 flex-shrink-0">
                                        <PacoteVisual
                                            pacote={coresPacote}
                                            onClick={() => comprarEAbirPacote(coresPacote)}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-white">{pacote.nome}</p>
                                        <p className="text-[11px] text-white/70 leading-tight">
                                            {pacote.conteudo || pacote.setores || pacote.descricao}
                                        </p>
                                        <p className="text-[10px] text-white/50 mt-1 italic">{pacote.descricao}</p>

                                        <div className="flex items-center gap-3 mt-2">
                                            <p className="text-sm font-bold" style={{ color: coresPacote.cor4 }}>
                                                {(pacote.preco || 0).toLocaleString("pt-BR")} Moedas
                                            </p>

                                            <button
                                                onClick={() => comprarEAbirPacote(coresPacote)}
                                                className="text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md hover:brightness-110 transition-all active:scale-95 whitespace-nowrap"
                                                style={{
                                                    background: `linear-gradient(90deg, ${coresPacote.cor3}, ${coresPacote.cor4})`,
                                                }}
                                            >
                                                COMPRAR
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            );
        };

        return (
            <div>
                {renderSecao("PACOTES PRINCIPAIS", principais, "(POPULAR)")}
                {renderSecao("PACOTES SETORIAIS", setoriais, "(Cartas direcionadas por área urbana)")}
                {renderSecao("CUSTOMIZAÇÃO & EXPANSÕES", customizacao, "(Exposição dos Prédios e Skins)")}
            </div>
        );
    };

    // ═════════════════════════════════════════════════════════════
    // RENDER PRINCIPAL (loja)
    // ═════════════════════════════════════════════════════════════
    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10 my-8 bg-gradient-to-br from-[#6411D9] to-[#350973] overflow-hidden"
            >
                <button
                    onClick={handleFechar}
                    className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-20"
                >
                    <X size={20} className="text-white" />
                </button>

                <div className="flex flex-col items-center gap-2 mb-6">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={22} className="text-white" />
                        <h2 className="text-xl font-bold text-white">LOJA DE PACOTES & CUSTOMIZAÇÃO</h2>
                    </div>
                    <p className="text-xs text-white/70 text-center">
                        Evolua sua cidade com novos prédios e expansões
                    </p>
                </div>

                <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-xl p-3 mb-6 border border-white/10">
                    <div className="flex items-center gap-2">
                        <Coins size={16} className="text-yellow-400" />
                        <span className="text-sm font-bold text-white">
                            Seu Saldo: {saldoLocal.toLocaleString("pt-BR")} Moedas
                        </span>
                    </div>
                    <button className="bg-gradient-to-r from-orange-500 to-[#F27405] text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-md">
                        + MOEDAS
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-1">
                    {erro && (
                        <div className="mb-2 p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-center text-xs">
                            {erro}
                        </div>
                    )}
                    {renderPacotes()}
                </div>
            </motion.div>
        </div>
    );
};