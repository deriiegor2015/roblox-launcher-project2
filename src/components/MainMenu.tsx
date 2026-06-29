import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Gamepad2, 
  Play, 
  Sliders, 
  UserCheck, 
  Globe, 
  Sparkles, 
  Search, 
  HelpCircle, 
  Upload, 
  Briefcase, 
  FileCode, 
  Clock, 
  CheckCircle2, 
  Users, 
  Star,
  Flame,
  Award,
  Heart,
  Settings as SettingsIcon,
  ShieldAlert,
  User,
  Palette,
  Shirt,
  Crown,
  Check,
  RotateCcw,
  Save,
  Dribbble,
  Trash2,
  Wrench
} from "lucide-react";
import { RobloxPart } from "../types";

// Premade games block configurations
export interface PremadeGame {
  id: string;
  title: string;
  creator: string;
  description: string;
  playersCount: string;
  likes: string;
  iconBg: string;
  emoji: string;
  difficulty: "Легка" | "Середня" | "Екстремальна";
  parts: RobloxPart[];
}

export interface RobloxAvatarConfig {
  nickname: string;
  bodyType: "R6" | "R15";
  skinTone: string;
  face: string;
  hat: string;
  shirt: string;
  pants: string;
  back: string;
  animation: string;
}

const SKIN_TONES = [
  { id: "classic", name: "Класичний жовтий", hex: "#FFD13B" },
  { id: "peach", name: "Світлий персиковий", hex: "#FCE1C6" },
  { id: "tan", name: "Засмага", hex: "#DDA47E" },
  { id: "dark-tan", name: "Темна засмага", hex: "#7A5230" },
  { id: "alien-green", name: "Прибулець зелений", hex: "#00FF88" },
  { id: "noob-blue", name: "Помічник блакитний", hex: "#00E5FF" },
  { id: "purple", name: "Магічний фіолетовий", hex: "#A020F0" },
  { id: "red", name: "Рубіновий червоний", hex: "#FF4D4D" },
];

const FACES = [
  { id: "smile", name: "Classic Smile", emoji: "🙂", desc: "Класична добра усмішка" },
  { id: "winning-smile", name: "Winning Smile", emoji: "😀", desc: "Усмішка переможця (мем)" },
  { id: "beast-mode", name: "Beast Mode", emoji: "😡", desc: "Режим звіра з палаючими червоними очима" },
  { id: "chill", name: "Chill Face", emoji: "😎", desc: "Розслаблене обличчя в окулярах" },
  { id: "man-face", name: "Man Face", emoji: "😏", desc: "Легендарне мужнє обличчя" },
];

const HATS = [
  { id: "none", name: "Без головного убору", emoji: "🧑", rarity: "Common" },
  { id: "classic-cap", name: "Roblox Cap", emoji: "🧢", rarity: "Common" },
  { id: "fedora", name: "Black Fedora", emoji: "🎩", rarity: "Rare" },
  { id: "crown", name: "King's Crown", emoji: "👑", rarity: "Epic" },
  { id: "valkyrie", name: "Valkyrie Helmet", emoji: "⚔️", rarity: "Legendary" },
  { id: "dominus", name: "Dominus Hood", emoji: "🔮", rarity: "Legendary" },
];

const SHIRTS = [
  { id: "none", name: "Без сорочки (Noob Style)", emoji: "👕", rarity: "Common" },
  { id: "roblox-hoodie", name: "Roblox Hoodie", emoji: "🧥", rarity: "Common" },
  { id: "tuxedo", name: "Classic Tuxedo", emoji: "👔", rarity: "Rare" },
  { id: "superhero", name: "Superhero Suit", emoji: "🦸", rarity: "Epic" },
  { id: "neon-tech", name: "Neon Matrix Tech", emoji: "🌐", rarity: "Epic" },
  { id: "armor", name: "Knight Armor", emoji: "🛡️", rarity: "Legendary" },
];

const PANTS = [
  { id: "none", name: "Без штанів", emoji: "🩳", rarity: "Common" },
  { id: "jeans", name: "Classic Jeans", emoji: "👖", rarity: "Common" },
  { id: "cargo", name: "Military Cargo", emoji: "🪖", rarity: "Rare" },
  { id: "cyber-legs", name: "Cyberpunk Legs", emoji: "🦾", rarity: "Epic" },
  { id: "rainbow", name: "Rainbow Shorts", emoji: "🏳️‍🌈", rarity: "Epic" },
  { id: "gold-knight", name: "Royal Greaves", emoji: "✨", rarity: "Legendary" },
];

const BACKS = [
  { id: "none", name: "Нічого", emoji: "❌", rarity: "Common" },
  { id: "cape", name: "Dev's Red Cape", emoji: "🧣", rarity: "Rare" },
  { id: "swords", name: "Dual Katanas", emoji: "⚔️", rarity: "Epic" },
  { id: "jetpack", name: "Cyber Jetpack", emoji: "🚀", rarity: "Legendary" },
  { id: "wings", name: "Angel Wings", emoji: "👼", rarity: "Legendary" },
];

const ANIMATIONS = [
  { id: "idle", name: "Idle (Спокій)", desc: "Стандартна стійка аватара" },
  { id: "wave", name: "Wave (Привітання)", desc: "Постійно махає рукою" },
  { id: "dance", name: "Dance (Танець)", desc: "Робо-танець вашого аватара!" },
  { id: "ninja", name: "Ninja Jump", desc: "Ніндзя-стійка з підстрибуванням" },
];

const PREMADE_GAMES: PremadeGame[] = [
  {
    id: "tower-of-hell",
    title: "Tower of Hell (Lite)",
    creator: "Yegor_Dev_2026",
    description: "Підніміться на вершину підступної неонової вежі! Смертельна лава (Killbricks) чекає на кожну помилку. Стрибайте на батутах і досягніть кубка!",
    playersCount: "1.4K",
    likes: "94%",
    iconBg: "from-purple-600 to-rose-600",
    emoji: "🗼",
    difficulty: "Екстремальна",
    parts: [
      // Spawn point
      { id: "toh-spawn", name: "Спавн Вежі", shape: "block", color: "#3f51b5", position: [0, 1, 0], size: [8, 1, 8], material: "SmoothPlastic", anchored: true, canCollide: true, transparency: 0, specialType: "spawn" },
      // Checkpoint 1
      { id: "toh-cp1", name: "Чекпоінт Стіна 1", shape: "block", color: "#4caf50", position: [0, 6, -10], size: [6, 1, 6], material: "SmoothPlastic", anchored: true, canCollide: true, transparency: 0, specialType: "checkpoint" },
      // Obstacle 1: Bouncy pad
      { id: "toh-tramp1", name: "Супер Батут", shape: "block", color: "#d500f9", position: [0, 1.5, -5], size: [4, 1, 4], material: "Neon", anchored: true, canCollide: true, transparency: 0, specialType: "trampoline" },
      // Obstacle 2: Killbrick block
      { id: "toh-kill1", name: "Лава Плита", shape: "block", color: "#f44336", position: [-5, 8, -10], size: [3, 0.5, 3], material: "Neon", anchored: true, canCollide: true, transparency: 0, specialType: "killbrick" },
      { id: "toh-kill2", name: "Лава Стіна", shape: "block", color: "#f44336", position: [5, 10, -10], size: [3, 0.5, 3], material: "Neon", anchored: true, canCollide: true, transparency: 0, specialType: "killbrick" },
      // Next stage
      { id: "toh-cp2", name: "Етап 2 Платформа", shape: "block", color: "#ff9800", position: [0, 13, -10], size: [6, 1, 6], material: "SmoothPlastic", anchored: true, canCollide: true, transparency: 0, specialType: "checkpoint" },
      // High speed pad
      { id: "toh-speed1", name: "Буст Пад", shape: "block", color: "#00e5ff", position: [0, 13.5, -10], size: [2, 0.2, 2], material: "Neon", anchored: true, canCollide: true, transparency: 0, specialType: "speedpad" },
      // High jump to target
      { id: "toh-tramp2", name: "Мега Батут", shape: "block", color: "#d500f9", position: [0, 14, -14], size: [4, 0.8, 4], material: "Neon", anchored: true, canCollide: true, transparency: 0, specialType: "trampoline" },
      // Trophy room at the top
      { id: "toh-trophy", name: "Золотий Трофей", shape: "cylinder", color: "#ffd700", position: [0, 32, -14], size: [2, 2, 2], material: "Metal", anchored: true, canCollide: true, transparency: 0, specialType: "coin" },
      { id: "toh-trophy-base", name: "П'єдестал Перемоги", shape: "block", color: "#9e9e9e", position: [0, 30, -14], size: [8, 1, 8], material: "Slate", anchored: true, canCollide: true, transparency: 0 }
    ]
  },
  {
    id: "speed-run",
    title: "Speed Run (V)",
    creator: "Zxc_Roblox_Pro",
    description: "Швидкісна траса! Активовуйте блакитні прискорювачі та пролітайте крізь неонові прірви на швидкості світла.",
    playersCount: "3.1K",
    likes: "97%",
    iconBg: "from-cyan-500 to-blue-600",
    emoji: "⚡",
    difficulty: "Середня",
    parts: [
      { id: "sr-spawn", name: "Старт Траси", shape: "block", color: "#2196f3", position: [0, 1, 0], size: [10, 1, 10], material: "SmoothPlastic", anchored: true, canCollide: true, transparency: 0, specialType: "spawn" },
      // Speed path blocks
      { id: "sr-speed1", name: "Гіпер Буст 1", shape: "block", color: "#00e5ff", position: [0, 1, -12], size: [6, 1, 12], material: "Neon", anchored: true, canCollide: true, transparency: 0, specialType: "speedpad" },
      { id: "sr-gap1", name: "Платформа після стрибка", shape: "block", color: "#4caf50", position: [0, 1, -34], size: [8, 1, 8], material: "SmoothPlastic", anchored: true, canCollide: true, transparency: 0, specialType: "checkpoint" },
      // Speed ramp
      { id: "sr-speed2", name: "Гіпер Буст 2", shape: "block", color: "#00e5ff", position: [0, 3, -50], size: [6, 2, 12], material: "Neon", anchored: true, canCollide: true, transparency: 0, specialType: "speedpad" },
      // Trampoline gap
      { id: "sr-tramp1", name: "Трамплін Прискорення", shape: "block", color: "#d500f9", position: [0, 1, -70], size: [4, 1, 4], material: "Neon", anchored: true, canCollide: true, transparency: 0, specialType: "trampoline" },
      // Final platform with coin
      { id: "sr-finish-base", name: "Фініш Остров", shape: "block", color: "#ff9800", position: [0, 12, -100], size: [12, 1, 12], material: "SmoothPlastic", anchored: true, canCollide: true, transparency: 0 },
      { id: "sr-finish-coin", name: "Фінішний Кубок", shape: "sphere", color: "#ffd700", position: [0, 14, -100], size: [3, 3, 3], material: "Metal", anchored: true, canCollide: true, transparency: 0, specialType: "coin" }
    ]
  },
  {
    id: "natural-disaster",
    title: "Natural Disaster Sandbox",
    creator: "Builderman_Official",
    description: "Виживайте на платформі під час падіння метеоритів та руйнування будівель! Монети постійно з'являються навколо.",
    playersCount: "7.8K",
    likes: "92%",
    iconBg: "from-amber-600 to-red-700",
    emoji: "🌪️",
    difficulty: "Легка",
    parts: [
      { id: "nd-spawn", name: "Центр Виживання", shape: "block", color: "#263238", position: [0, 1, 0], size: [24, 1, 24], material: "Slate", anchored: true, canCollide: true, transparency: 0, specialType: "spawn" },
      // Obstacle blocks for shelter
      { id: "nd-wall1", name: "Захисна Стіна", shape: "block", color: "#9e9e9e", position: [-10, 4, 0], size: [2, 6, 12], material: "Wood", anchored: true, canCollide: true, transparency: 0 },
      { id: "nd-wall2", name: "Захисна Стіна", shape: "block", color: "#9e9e9e", position: [10, 4, 0], size: [2, 6, 12], material: "Wood", anchored: true, canCollide: true, transparency: 0 },
      // Checkpoint
      { id: "nd-cp1", name: "Внутрішній Бункер", shape: "block", color: "#2196f3", position: [0, 1.2, 0], size: [4, 0.4, 4], material: "SmoothPlastic", anchored: true, canCollide: true, transparency: 0, specialType: "checkpoint" },
      // Lava brick in corners
      { id: "nd-kill1", name: "Зруйновані Уламки", shape: "block", color: "#f44336", position: [-11, 1.2, -11], size: [4, 0.4, 4], material: "Neon", anchored: true, canCollide: true, transparency: 0, specialType: "killbrick" },
      { id: "nd-kill2", name: "Зруйновані Уламки", shape: "block", color: "#f44336", position: [11, 1.2, 11], size: [4, 0.4, 4], material: "Neon", anchored: true, canCollide: true, transparency: 0, specialType: "killbrick" },
      // Interactive Coins
      { id: "nd-coin1", name: "Монетка 1", shape: "sphere", color: "#ffd700", position: [-6, 3, 6], size: [1.2, 1.2, 1.2], material: "Metal", anchored: true, canCollide: true, transparency: 0, specialType: "coin" },
      { id: "nd-coin2", name: "Монетка 2", shape: "sphere", color: "#ffd700", position: [6, 3, -6], size: [1.2, 1.2, 1.2], material: "Metal", anchored: true, canCollide: true, transparency: 0, specialType: "coin" },
      { id: "nd-coin3", name: "Монетка 3", shape: "sphere", color: "#ffd700", position: [0, 8, 0], size: [1.2, 1.2, 1.2], material: "Metal", anchored: true, canCollide: true, transparency: 0, specialType: "coin" }
    ]
  }
];

interface MainMenuProps {
  onStartStudio: () => void;
  onPlayPremadeGame: (game: any) => void;
  cloudGames?: any[];
  onDeleteCloudGame?: (id: string) => void;
  onEditCloudGame?: (game: any) => void;
}

export default function MainMenu({ 
  onStartStudio, 
  onPlayPremadeGame,
  cloudGames = [],
  onDeleteCloudGame,
  onEditCloudGame
}: MainMenuProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"Home" | "Games" | "Develop" | "Settings" | "Avatar">("Home");

  // Avatar Editor State
  const [avatarConfig, setAvatarConfig] = useState<RobloxAvatarConfig>(() => {
    const saved = localStorage.getItem("roblox_user_avatar");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      nickname: localStorage.getItem("roblox_persona_username") || "Robloxian",
      bodyType: "R6",
      skinTone: "#FFD13B",
      face: "smile",
      hat: "classic-cap",
      shirt: "roblox-hoodie",
      pants: "jeans",
      back: "none",
      animation: "idle"
    };
  });
  const [avatarSaveSuccess, setAvatarSaveSuccess] = useState<boolean>(false);
  const [activeAvatarSubTab, setActiveAvatarSubTab] = useState<"skin" | "face" | "hat" | "shirt" | "pants" | "back" | "anim">("skin");

  const handleSaveAvatar = () => {
    localStorage.setItem("roblox_user_avatar", JSON.stringify(avatarConfig));
    setAvatarSaveSuccess(true);
    setTimeout(() => setAvatarSaveSuccess(false), 3000);
  };

  const handleResetAvatar = () => {
    const fresh = {
      nickname: localStorage.getItem("roblox_persona_username") || "Robloxian",
      bodyType: "R6" as const,
      skinTone: "#FFD13B",
      face: "smile",
      hat: "classic-cap",
      shirt: "roblox-hoodie",
      pants: "jeans",
      back: "none",
      animation: "idle"
    };
    setAvatarConfig(fresh);
    localStorage.setItem("roblox_user_avatar", JSON.stringify(fresh));
  };

  // Persona Verification State
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    return localStorage.getItem("roblox_persona_verified") === "true";
  });
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [personaName, setPersonaName] = useState<string>("");
  const [personaAge, setPersonaAge] = useState<string>("");
  const [personaCheckbox, setPersonaCheckbox] = useState<boolean>(true); // Active developer agreement
  const [verificationError, setVerificationError] = useState<string>("");

  // Settings bypass check state
  const [skipVerification, setSkipVerification] = useState<boolean>(() => {
    return localStorage.getItem("roblox_skip_verification") === "true";
  });

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personaName.trim()) {
      setVerificationError("Будь ласка, вкажіть ваш унікальний нікнейм Roblox.");
      return;
    }
    const ageNum = parseInt(personaAge);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setVerificationError("Вкажіть реальний вік (число від 1 до 120).");
      return;
    }

    // Success
    localStorage.setItem("roblox_persona_verified", "true");
    localStorage.setItem("roblox_persona_username", personaName.trim());
    setIsVerified(true);
    setShowVerifyModal(false);
    setVerificationError("");
    setAvatarConfig((prev) => {
      const updated = { ...prev, nickname: personaName.trim() };
      localStorage.setItem("roblox_user_avatar", JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleSkipVerification = (val: boolean) => {
    setSkipVerification(val);
    localStorage.setItem("roblox_skip_verification", val ? "true" : "false");
  };

  return (
    <div className="fixed inset-0 bg-[#0d0f12] text-white z-[9999] font-sans overflow-hidden flex flex-col selection:bg-brand selection:text-black" id="roblox-main-menu-root">
      
      {/* GLOWING AMBIENT HEADER */}
      <header className="bg-[#12151b] border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0 shadow-xl relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-4 border-brand transform rotate-12 flex items-center justify-center font-black rounded-sm shadow-md bg-black">
            <span className="text-white text-[10px] transform -rotate-12">R</span>
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight block">ROBLOX LAUNCHER</span>
            <span className="text-[10px] text-[#00FF88] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              🟢 Live Engine Active v2.6.0
            </span>
          </div>
        </div>

        {/* Global User info & Blue Verification status */}
        <div className="flex items-center gap-4">
          <div className="bg-[#1a1f29] border border-white/10 rounded-lg py-1.5 px-3 flex items-center gap-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] animate-pulse" />
            <span className="text-gray-300">Статус:</span>
            {isVerified || skipVerification ? (
              <span className="text-brand flex items-center gap-1 font-bold">
                <ShieldCheck className="w-4 h-4 text-brand fill-brand/20" /> ВЕРИФІКОВАНО
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-amber-400" /> ПОТРЕБУЄ ДІЇ
              </span>
            )}
          </div>

          <button 
            id="header-btn-verify"
            onClick={() => setShowVerifyModal(true)}
            className="px-3.5 py-1.5 bg-brand hover:bg-brand-bright text-black font-bold text-xs rounded transition-all flex items-center gap-1 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isVerified ? "Оновити Persona" : "Верифікуватись"}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <nav className="w-64 bg-[#111317] border-r border-white/5 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-1.5">
            <div className="text-[9px] text-gray-500 font-bold font-mono tracking-widest uppercase px-3 mb-2.5">
              НАВІГАЦІЯ
            </div>

            <button
              id="sidebar-tab-home"
              onClick={() => setActiveTab("Home")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "Home" 
                  ? "bg-brand text-black shadow-lg shadow-brand/15" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Огляд та Статус (Home)</span>
            </button>

            <button
              id="sidebar-tab-games"
              onClick={() => setActiveTab("Games")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "Games" 
                  ? "bg-brand text-black shadow-lg shadow-brand/15" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Грати в ігри (Roblox Client)</span>
            </button>

            <button
              id="sidebar-tab-develop"
              onClick={() => setActiveTab("Develop")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "Develop" 
                  ? "bg-brand text-black shadow-lg shadow-brand/15" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Створити гру (Roblox Studio)</span>
            </button>

            <button
              id="sidebar-tab-avatar"
              onClick={() => setActiveTab("Avatar")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "Avatar" 
                  ? "bg-brand text-black shadow-lg shadow-brand/15" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Редактор аватару (Avatar)</span>
            </button>

            <button
              id="sidebar-tab-settings"
              onClick={() => setActiveTab("Settings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "Settings" 
                  ? "bg-brand text-black shadow-lg shadow-brand/15" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Параметри та Persona</span>
            </button>
          </div>

          {/* Footer of Sidebar */}
          <div className="bg-black/20 border border-white/5 p-3 rounded-lg text-[10px] text-gray-500 font-mono space-y-1">
            <span className="text-gray-400 block font-bold">Спільнота Roblox</span>
            <p>Проєкт створено для тестування скриптів Luau та 3D об'єктів.</p>
          </div>
        </nav>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#0a0c0e]">
          
          {/* ================== HOME TAB ================== */}
          {activeTab === "Home" && (
            <div className="max-w-4xl space-y-6" id="tab-content-home">
              <div className="bg-gradient-to-r from-brand/15 to-[#00FF88]/5 border border-brand/20 p-6 rounded-2xl flex items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="bg-brand/20 text-brand px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-wider">
                    Спеціальна версія 2026
                  </span>
                  <h1 className="text-2xl font-black tracking-tight">Ласкаво просимо в Sandbox Roblox Universe!</h1>
                  <p className="text-xs text-gray-300 max-w-xl">
                    Унікальна платформа, яка об'єднує повноцінну інтерактивну середу розробника <strong>Roblox Studio</strong> з клієнтом <strong>Roblox Player</strong> для запуску симуляцій.
                  </p>
                </div>
                <div className="text-6xl shrink-0 filter drop-shadow-2xl">🤖</div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#12151b] border border-white/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold font-mono">PERSONA VERIFICATION</span>
                    <Award className="w-4 h-4 text-brand" />
                  </div>
                  <div className="text-lg font-black">
                    {isVerified || skipVerification ? "Активний девелопер" : "Не верифіковано"}
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Дає вам унікальний синій щит розробника в чаті і серверах.
                  </p>
                </div>

                <div className="bg-[#12151b] border border-white/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold font-mono">ДОСТУПНІ ІГРИ</span>
                    <Gamepad2 className="w-4 h-4 text-[#00FF88]" />
                  </div>
                  <div className="text-lg font-black">{PREMADE_GAMES.length} Симуляцій</div>
                  <p className="text-[10px] text-gray-500">
                    Готові складні світи з фізикою, монетами та перешкодами.
                  </p>
                </div>

                <div className="bg-[#12151b] border border-white/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold font-mono">РЕЖИМ РОЗРОБКИ</span>
                    <FileCode className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-lg font-black">Roblox Studio</div>
                  <p className="text-[10px] text-gray-500">
                    Повний редактор деталей, Luau-кодів та імпорту власних .OBJ.
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-gray-400 font-mono tracking-wider">ШВИДКИЙ СТАРТ</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={onStartStudio}
                    className="bg-[#151a22] border border-white/5 hover:border-brand p-5 rounded-xl flex items-center justify-between text-left group transition-all cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-brand block uppercase font-mono">Develop Studio</span>
                      <span className="text-sm font-black text-white group-hover:text-brand transition-colors">Відкрити Roblox Studio Редактор</span>
                      <p className="text-[10px] text-gray-400">Створюйте блоки, ставте тригери лави чи батути, пишіть скрипти.</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-gray-500 group-hover:text-brand transition-colors" />
                  </button>

                  <button
                    onClick={() => setActiveTab("Games")}
                    className="bg-[#151a22] border border-white/5 hover:border-[#00FF88] p-5 rounded-xl flex items-center justify-between text-left group transition-all cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#00FF88] block uppercase font-mono">Roblox Player</span>
                      <span className="text-sm font-black text-white group-hover:text-[#00FF88] transition-colors">Перейти до списку ігор</span>
                      <p className="text-[10px] text-gray-400">Випробуйте паркур у Tower of Hell або виживання у метеоритному дощі.</p>
                    </div>
                    <Play className="w-8 h-8 text-gray-500 group-hover:text-[#00FF88] fill-transparent group-hover:fill-[#00FF88]/10 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================== GAMES TAB ================== */}
          {activeTab === "Games" && (
            <div className="max-w-4xl space-y-6" id="tab-content-games">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-xl font-black">Каталог ігор (Roblox Player)</h2>
                  <p className="text-xs text-gray-400">Оберіть готову гру розробників спільноти та пограйте з іншими гравцями!</p>
                </div>
                
                {/* Search bar decoration */}
                <div className="bg-[#12151b] border border-white/10 rounded-lg py-1.5 px-3 flex items-center gap-2 text-xs text-gray-400 min-w-[220px]">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Пошук симуляцій..." className="bg-transparent border-none outline-none text-white w-full text-xs" disabled />
                </div>
              </div>

              {/* List of custom Games */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PREMADE_GAMES.map((game) => (
                  <div 
                    key={game.id} 
                    className="bg-[#12151b] border border-white/5 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between hover:scale-[1.01] transition-all"
                  >
                    <div className={`bg-gradient-to-br ${game.iconBg} p-6 flex items-center justify-between relative overflow-hidden`}>
                      <span className="text-5xl filter drop-shadow-lg z-10">{game.emoji}</span>
                      <div className="absolute right-2 bottom-2 bg-black/60 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-white font-bold tracking-wider">
                        {game.difficulty} складність
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-white">{game.title}</h3>
                          <span className="text-[10px] text-gray-400 font-mono">by {game.creator}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{game.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono border-t border-white/5 pt-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[#00FF88]">👍 {game.likes}</span>
                          <span className="flex items-center gap-1 text-gray-400">👤 {game.playersCount} онлайн</span>
                        </div>
                        
                        <button
                          id={`game-play-btn-${game.id}`}
                          onClick={() => onPlayPremadeGame(game)}
                          className="px-4 py-1.5 bg-[#00FF88] hover:bg-[#00dd77] text-black font-bold rounded flex items-center gap-1 cursor-pointer font-sans transition-all text-[11px] hover:scale-105 active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-black text-black" />
                          <span>Грати (Play)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* My Roblox Cloud Saved Games */}
              <div className="pt-8 border-t border-white/5 space-y-4">
                <div>
                  <h3 className="text-md font-bold tracking-tight text-brand flex items-center gap-2">
                    <Globe className="w-4.5 h-4.5 text-brand animate-pulse" />
                    <span>Хмарне сховище Roblox Cloud (My Cloud Projects)</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">Всі ваші власні 3D-проекти, опубліковані у хмару Roblox Cloud за допомогою Studio.</p>
                </div>

                {cloudGames.length === 0 ? (
                  <div className="bg-[#12151b]/40 border border-dashed border-white/10 p-6 rounded-xl text-center space-y-3">
                    <p className="text-xs text-gray-400">Ви ще не опублікували жодної гри у хмару Roblox Cloud.</p>
                    <button
                      onClick={onStartStudio}
                      className="px-4 py-1.5 bg-brand hover:bg-brand-bright text-black font-bold text-[10px] uppercase tracking-wider rounded transition-all cursor-pointer font-sans"
                    >
                      Створити гру в Studio ⚒️
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cloudGames.map((game: any) => (
                      <div 
                        key={game.id} 
                        className="bg-[#12151b] border border-brand/20 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-brand/40 transition-all relative group"
                      >
                        <div className={`bg-gradient-to-br ${game.iconBg} p-6 flex items-center justify-between relative overflow-hidden`}>
                          <span className="text-5xl filter drop-shadow-lg z-10">{game.emoji || "🕹️"}</span>
                          <span className="absolute right-2 bottom-2 bg-brand/95 backdrop-blur px-2.5 py-0.5 rounded text-[9px] font-mono text-black font-bold uppercase tracking-wider">
                            {game.privacy === "public" ? "Публічна" : "Приватна"}
                          </span>
                        </div>
                        
                        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-white truncate max-w-[180px]" title={game.title}>{game.title}</h4>
                              <span className="text-[10px] text-gray-400 font-mono shrink-0">by {game.creator}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 h-8 overflow-hidden">{game.description}</p>
                            <div className="text-[9px] text-gray-500 font-mono pt-1">Опубліковано: {game.savedAt}</div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono border-t border-white/5 pt-3">
                            <div className="flex items-center gap-1.5">
                              {onDeleteCloudGame && (
                                <button
                                  onClick={() => onDeleteCloudGame(game.id)}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 rounded transition-all cursor-pointer"
                                  title="Видалити з хмари Roblox Cloud"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onEditCloudGame && (
                                <button
                                  onClick={() => onEditCloudGame(game)}
                                  className="p-1.5 bg-brand/10 hover:bg-brand hover:text-black text-brand border border-brand/20 rounded transition-all cursor-pointer font-sans text-[10px] font-bold flex items-center gap-1"
                                  title="Продовжити редагування у Roblox Studio"
                                >
                                  <Wrench className="w-3 h-3" />
                                  <span>СТУДІЯ</span>
                                </button>
                              )}
                            </div>
                            
                            <button
                              onClick={() => onPlayPremadeGame(game)}
                              className="px-3.5 py-1.5 bg-[#00FF88] hover:bg-[#00dd77] text-black font-bold rounded flex items-center gap-1 cursor-pointer font-sans transition-all text-[11px] hover:scale-105 active:scale-95"
                            >
                              <Play className="w-3 h-3 fill-black text-black" />
                              <span>ГРАТИ (PLAY)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================== DEVELOP TAB ================== */}
          {activeTab === "Develop" && (
            <div className="max-w-4xl space-y-6" id="tab-content-develop">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-xl font-black">Середовище розробника (Roblox Studio)</h2>
                <p className="text-xs text-gray-400">Тут ви маєте повну творчу свободу: конструюйте з 3D деталей, використовуйте інструмент AI Assistant та імпортуйте власні 3D моделі.</p>
              </div>

              <div className="bg-[#12151b] border border-white/5 p-6 rounded-xl flex items-start gap-4">
                <div className="p-4 bg-brand/10 border border-brand/20 rounded-xl text-brand shrink-0">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="font-bold text-sm">Сцена за замовчуванням: Roblox Studio Sandbox Map</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Ви можете створювати будь-яку кількість деталей, фарбувати їх у неонові або класичні пластикові текстури, налаштовувати фізичні бар'єри (CanCollide) та писати повноцінний Luau-код вбудованих скриптів!
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      id="develop-start-studio-btn"
                      onClick={onStartStudio}
                      className="px-5 py-2 bg-brand hover:bg-brand-bright text-black font-black text-xs rounded transition-all cursor-pointer hover:scale-105"
                    >
                      Редагувати в Studio ⚒️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================== AVATAR EDIT TAB ================== */}
          {activeTab === "Avatar" && (
            <div className="max-w-5xl space-y-6" id="tab-content-avatar">
              <style>{`
                @keyframes roblox-idle {
                  0%, 100% { transform: translateY(0) scaleY(1); }
                  50% { transform: translateY(-4px) scaleY(1.02); }
                }
                @keyframes roblox-wave-right-arm {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(-135deg) translateY(-8px) translateX(-4px); }
                }
                @keyframes roblox-dance-torso {
                  0%, 100% { transform: rotate(0deg) translateY(0); }
                  25% { transform: rotate(-4deg) translateY(-6px) translateX(-2px); }
                  50% { transform: rotate(0deg) translateY(0); }
                  75% { transform: rotate(4deg) translateY(-6px) translateX(2px); }
                }
                @keyframes roblox-dance-left-arm {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(45deg); }
                }
                @keyframes roblox-dance-right-arm {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(-60deg); }
                }
                @keyframes roblox-ninja-torso {
                  0%, 100% { transform: translateY(0) rotate(-8deg); }
                  50% { transform: translateY(-12px) rotate(-8deg); }
                }
                .avatar-animate-idle {
                  animation: roblox-idle 3s ease-in-out infinite;
                }
                .avatar-animate-wave .right-arm-pivot {
                  animation: roblox-wave-right-arm 1.4s ease-in-out infinite;
                  transform-origin: top center;
                }
                .avatar-animate-dance {
                  animation: roblox-dance-torso 2s ease-in-out infinite;
                }
                .avatar-animate-dance .left-arm-pivot {
                  animation: roblox-dance-left-arm 1s ease-in-out infinite;
                  transform-origin: top center;
                }
                .avatar-animate-dance .right-arm-pivot {
                  animation: roblox-dance-right-arm 1s ease-in-out infinite;
                  transform-origin: top center;
                }
                .avatar-animate-ninja {
                  animation: roblox-ninja-torso 1.6s ease-in-out infinite;
                }
              `}</style>

              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand" /> Редактор Аватарів Roblox (Avatar Customizer)
                  </h2>
                  <p className="text-xs text-gray-400">Створіть свій неповторний 3D образ для подорожей світами Roblox Sandbox!</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleResetAvatar}
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                    title="Скинути до початкових налаштувань"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Скинути</span>
                  </button>

                  <button
                    onClick={handleSaveAvatar}
                    className="px-4 py-1.5 bg-brand hover:bg-brand-bright text-black font-black text-xs rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand/10 hover:scale-105"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Зберегти Аватар</span>
                  </button>
                </div>
              </div>

              {avatarSaveSuccess && (
                <div className="bg-[#00FF88]/10 border border-[#00FF88]/20 p-3 rounded-xl text-[#00FF88] text-xs font-bold flex items-center gap-2 animate-pulse font-sans">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Ваш унікальний Roblox аватар успішно збережено в хмару Sandbox! Скін буде активовано при вході в клієнт.</span>
                </div>
              )}

              {/* TWO COLUMN GRID FOR BUILDER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: 3D PREVIEW CHAMBER */}
                <div className="lg:col-span-5 bg-[#12151b] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-between relative overflow-hidden h-[460px] shadow-2xl">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#384252_1px,transparent_1px),linear-gradient(to_bottom,#384252_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                  
                  {/* Spotlights */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-brand/5 to-transparent blur-xl pointer-events-none" />

                  {/* Top Badge */}
                  <div className="relative z-10 w-full flex items-center justify-between">
                    <span className="text-[9px] text-[#00FF88] font-bold font-mono uppercase tracking-wider bg-[#00FF88]/10 px-2 py-0.5 rounded border border-[#00FF88]/20 animate-pulse">
                      🟢 3D Preview Active
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold font-mono">
                      {avatarConfig.bodyType} Body Engine
                    </span>
                  </div>

                  {/* THE CHARACTER BOX */}
                  <div className="relative w-full flex-1 flex items-center justify-center pt-8">
                    {/* Character Container with dynamic animation class */}
                    <div className={`relative w-[220px] h-[340px] flex items-center justify-center transition-all ${
                      avatarConfig.animation === "idle" ? "avatar-animate-idle" : ""
                    } ${
                      avatarConfig.animation === "wave" ? "avatar-animate-wave" : ""
                    } ${
                      avatarConfig.animation === "dance" ? "avatar-animate-dance" : ""
                    } ${
                      avatarConfig.animation === "ninja" ? "avatar-animate-ninja" : ""
                    }`}>
                      
                      {/* 1. BACK ACCESSORY */}
                      {avatarConfig.back === "wings" && (
                        <div className="absolute left-1/2 top-[120px] -translate-x-1/2 -translate-y-1/2 w-[260px] h-[150px] flex justify-between pointer-events-none z-0">
                          {/* Left Wing */}
                          <svg viewBox="0 0 100 100" className="w-28 h-28 text-cyan-200 fill-cyan-100/40 filter drop-shadow-[0_0_12px_rgba(186,230,253,0.7)] transform rotate-12">
                            <path d="M 100 80 C 60 70, 20 50, 0 20 C 10 50, 40 80, 100 80 Z" />
                            <path d="M 100 80 C 70 75, 40 65, 20 45" stroke="#fff" strokeWidth="2.5" fill="none" />
                            <path d="M 100 80 C 80 80, 60 75, 40 60" stroke="#fff" strokeWidth="2.5" fill="none" />
                          </svg>
                          {/* Right Wing */}
                          <svg viewBox="0 0 100 100" className="w-28 h-28 text-cyan-200 fill-cyan-100/40 filter drop-shadow-[0_0_12px_rgba(186,230,253,0.7)] transform -scale-x-100 -rotate-12">
                            <path d="M 100 80 C 60 70, 20 50, 0 20 C 10 50, 40 80, 100 80 Z" />
                            <path d="M 100 80 C 70 75, 40 65, 20 45" stroke="#fff" strokeWidth="2.5" fill="none" />
                            <path d="M 100 80 C 80 80, 60 75, 40 60" stroke="#fff" strokeWidth="2.5" fill="none" />
                          </svg>
                        </div>
                      )}

                      {avatarConfig.back === "cape" && (
                        <div className="absolute left-1/2 top-[110px] -translate-x-1/2 w-16 h-36 bg-red-600 rounded-b-xl z-0 border-2 border-red-800 shadow-xl transform origin-top rotate-1 flex flex-col items-center pt-6">
                          <div className="w-5 h-5 rounded-full bg-amber-400 border border-amber-600 flex items-center justify-center text-[7px] text-black font-bold">🛠️</div>
                        </div>
                      )}

                      {avatarConfig.back === "swords" && (
                        <div className="absolute left-1/2 top-[100px] -translate-x-1/2 w-32 h-32 pointer-events-none z-0">
                          {/* Sword 1 */}
                          <div className="absolute top-0 left-4 w-2.5 h-28 bg-gray-300 border border-gray-500 rounded transform rotate-45 origin-center">
                            <div className="absolute bottom-4 inset-x-[-3px] h-1.5 bg-amber-500 rounded" />
                            <div className="absolute bottom-0 inset-x-[1.5px] h-3 bg-red-700 rounded-b" />
                          </div>
                          {/* Sword 2 */}
                          <div className="absolute top-0 right-4 w-2.5 h-28 bg-gray-300 border border-gray-500 rounded transform -rotate-45 origin-center">
                            <div className="absolute bottom-4 inset-x-[-3px] h-1.5 bg-amber-500 rounded" />
                            <div className="absolute bottom-0 inset-x-[1.5px] h-3 bg-red-700 rounded-b" />
                          </div>
                        </div>
                      )}

                      {avatarConfig.back === "jetpack" && (
                        <div className="absolute left-1/2 top-[110px] -translate-x-1/2 w-20 h-20 bg-slate-700 border-2 border-slate-500 rounded-xl z-0 flex justify-between p-1">
                          <div className="w-4 h-16 bg-amber-500 border border-amber-600 rounded-full flex flex-col justify-end items-center pb-1">
                            <span className="text-[6px] animate-bounce">🔥</span>
                          </div>
                          <div className="w-4 h-16 bg-amber-500 border border-amber-600 rounded-full flex flex-col justify-end items-center pb-1">
                            <span className="text-[6px] animate-bounce">🔥</span>
                          </div>
                        </div>
                      )}

                      {/* MAIN AVATAR LAYER GROUP */}
                      <div className="relative w-full h-full flex flex-col items-center">
                        
                        {/* 2. HEAD */}
                        <div 
                          className="absolute w-[50px] h-[50px] rounded-lg border-2 border-black/20 z-20 flex items-center justify-center shadow-md"
                          style={{ 
                            backgroundColor: avatarConfig.skinTone,
                            top: "40px"
                          }}
                        >
                          {/* Face Expression */}
                          <div className="w-10 h-10 select-none">
                            {avatarConfig.face === "smile" && (
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                <circle cx="33" cy="38" r="5" fill="#000" />
                                <circle cx="67" cy="38" r="5" fill="#000" />
                                <path d="M 28 62 Q 50 82 72 62" stroke="#000" strokeWidth="5.5" fill="none" strokeLinecap="round" />
                              </svg>
                            )}

                            {avatarConfig.face === "winning-smile" && (
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                <ellipse cx="28" cy="34" rx="7" ry="11" fill="#000" />
                                <ellipse cx="72" cy="34" rx="7" ry="11" fill="#000" />
                                <ellipse cx="28" cy="34" rx="2.5" ry="4.5" fill="#fff" />
                                <ellipse cx="72" cy="34" rx="2.5" ry="4.5" fill="#fff" />
                                <path d="M 18 54 Q 50 84 82 54 Z" fill="#fff" stroke="#000" strokeWidth="4" />
                                <path d="M 18 54 Q 50 84 82 54" stroke="#000" strokeWidth="4" fill="none" />
                                <path d="M 21 59 Q 50 78 79 59" stroke="#000" strokeWidth="2" fill="none" />
                              </svg>
                            )}

                            {avatarConfig.face === "beast-mode" && (
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                <polygon points="18,22 43,32 43,37 18,27" fill="#ff0000" />
                                <polygon points="82,22 57,32 57,37 82,27" fill="#ff0000" />
                                <circle cx="30" cy="40" r="7" fill="#ff0000" />
                                <circle cx="70" cy="40" r="7" fill="#ff0000" />
                                <polygon points="28,63 33,53 38,63 43,53 48,63 53,53 58,63 63,53 68,63" fill="none" stroke="#ff0000" strokeWidth="3.5" strokeLinecap="round" />
                                <path d="M 23 48 Q 50 73 77 48" stroke="#ff0000" strokeWidth="3.5" fill="none" />
                              </svg>
                            )}

                            {avatarConfig.face === "chill" && (
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                <polygon points="12,28 48,28 43,46 18,46" fill="#111" />
                                <polygon points="52,28 88,28 83,46 58,46" fill="#111" />
                                <line x1="12" y1="28" x2="88" y2="28" stroke="#111" strokeWidth="3.5" />
                                <path d="M 38 63 Q 58 68 68 58" stroke="#000" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                              </svg>
                            )}

                            {avatarConfig.face === "man-face" && (
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                <path d="M 12,23 Q 32,20 42,30" stroke="#000" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                                <path d="M 88,23 Q 68,20 58,30" stroke="#000" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                                <ellipse cx="28" cy="38" rx="7" ry="3.5" fill="#000" />
                                <ellipse cx="72" cy="38" rx="7" ry="3.5" fill="#000" />
                                <ellipse cx="28" cy="38" rx="2" ry="1.5" fill="#fff" />
                                <ellipse cx="72" cy="38" rx="2" ry="1.5" fill="#fff" />
                                <path d="M 32 63 Q 52 73 72 58" stroke="#000" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                                <path d="M 43 78 Q 48 81 53 78" stroke="#000" strokeWidth="2.2" fill="none" />
                              </svg>
                            )}
                          </div>

                          {/* 2b. HAT LAYER ON TOP */}
                          {avatarConfig.hat === "classic-cap" && (
                            <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 w-14 h-5 bg-red-600 rounded-t-xl z-30 flex items-center justify-center border-b border-black/10 shadow-sm">
                              <span className="text-[7px] font-black text-white">R</span>
                              <div className="absolute -right-1.5 bottom-0.5 w-4 h-1 bg-red-700 rounded-r-lg" />
                            </div>
                          )}

                          {avatarConfig.hat === "fedora" && (
                            <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                              <div className="w-12 h-6 bg-[#1f1f1f] rounded-t-md relative border-b border-red-600">
                                <div className="absolute bottom-0 inset-x-0 h-1 bg-red-600" />
                              </div>
                              <div className="w-[72px] h-1.5 bg-[#1f1f1f] rounded-full -mt-[2px] shadow-sm" />
                            </div>
                          )}

                          {avatarConfig.hat === "crown" && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-11 h-5 z-30 flex items-end">
                              <svg viewBox="0 0 100 50" className="w-full h-full text-amber-400 fill-current drop-shadow">
                                <polygon points="0,50 15,10 30,35 50,0 70,35 85,10 100,50" />
                              </svg>
                              <div className="absolute bottom-0 inset-x-1 h-1 flex justify-around px-0.5">
                                <span className="w-0.5 h-0.5 rounded-full bg-red-500" />
                                <span className="w-0.5 h-0.5 rounded-full bg-blue-500" />
                                <span className="w-0.5 h-0.5 rounded-full bg-green-500" />
                              </div>
                            </div>
                          )}

                          {avatarConfig.hat === "valkyrie" && (
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-11.5 h-3 bg-slate-400 rounded-full z-30">
                              <div className="absolute -left-5 -top-3.5 w-5 h-7 bg-white border border-gray-300 rounded-l-full origin-bottom-right rotate-12 flex flex-col gap-0.5 p-0.5">
                                <div className="h-0.5 bg-amber-400 rounded-l-full" />
                                <div className="h-0.5 bg-amber-400 rounded-l-full" />
                              </div>
                              <div className="absolute -right-5 -top-3.5 w-5 h-7 bg-white border border-gray-300 rounded-r-full origin-bottom-left -rotate-12 flex flex-col gap-0.5 p-0.5 items-end">
                                <div className="h-0.5 bg-amber-400 rounded-r-full" />
                                <div className="h-0.5 bg-amber-400 rounded-r-full" />
                              </div>
                            </div>
                          )}

                          {avatarConfig.hat === "dominus" && (
                            <div className="absolute -top-3 inset-x-[-3px] bottom-[-1.5px] bg-[#311B92] rounded-t-xl rounded-b-md border border-[#1A237E] z-10 flex items-center justify-center">
                              <div className="w-[36px] h-[36px] bg-[#070212] rounded-md relative flex items-center justify-center">
                                <div className="absolute -left-2.5 top-4.5 w-2 h-4 bg-amber-400 rounded-full border border-yellow-600 rotate-12" />
                                <div className="absolute -right-2.5 top-4.5 w-2 h-4 bg-amber-400 rounded-full border border-yellow-600 -rotate-12" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 3. TORSO */}
                        <div 
                          className="absolute w-[94px] h-[105px] rounded border-2 border-black/20 z-10 overflow-hidden shadow-sm"
                          style={{ 
                            top: "92px",
                            backgroundColor: avatarConfig.shirt === "none" ? avatarConfig.skinTone : "#1e293b" 
                          }}
                        >
                          {/* Inner Shirt Graphic Overlay */}
                          {avatarConfig.shirt === "roblox-hoodie" && (
                            <div className="absolute inset-0 bg-[#262626] flex flex-col justify-between p-2">
                              <div className="h-2.5 bg-cyan-500/10 rounded border border-cyan-400/20 text-[6px] font-mono text-cyan-300 font-bold flex items-center justify-center tracking-tighter">
                                ROBLOX
                              </div>
                              <div className="w-10 h-10 border border-white/5 rounded-full self-center bg-zinc-800 flex items-center justify-center text-xs font-black text-brand select-none">
                                R
                              </div>
                              <div className="h-1.5 bg-cyan-400 rounded" />
                            </div>
                          )}

                          {avatarConfig.shirt === "tuxedo" && (
                            <div className="absolute inset-0 bg-[#111111] flex flex-col items-center">
                              {/* Collar triangle */}
                              <div className="w-8 h-10 bg-white rounded-b-xl flex flex-col items-center pt-1">
                                <div className="w-4 h-2 bg-red-600 rounded-sm flex justify-around p-0.5">
                                  <div className="w-1 h-1 bg-white rounded-full" />
                                  <div className="w-1 h-1 bg-white rounded-full" />
                                </div>
                                <div className="w-0.5 h-4 bg-black/10 mt-1" />
                              </div>
                            </div>
                          )}

                          {avatarConfig.shirt === "superhero" && (
                            <div className="absolute inset-0 bg-[#1565C0] flex flex-col items-center justify-center p-2 border-2 border-[#1E88E5]">
                              <div className="w-9 h-9 rounded-full bg-amber-400 border border-amber-600 flex items-center justify-center font-bold text-sm text-black shadow-lg select-none">
                                ★
                              </div>
                            </div>
                          )}

                          {avatarConfig.shirt === "neon-tech" && (
                            <div className="absolute inset-0 bg-[#060D1A] overflow-hidden flex flex-col justify-between p-1.5">
                              <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#00FF88_1px,transparent_1px),linear-gradient(to_bottom,#00FF88_1px,transparent_1px)] bg-[size:8px_8px]" />
                              <div className="h-1 bg-[#00FF88] shadow-[0_0_8px_#00FF88] rounded-full animate-pulse" />
                              <div className="text-[7px] font-mono text-[#00FF88] text-center tracking-widest font-bold">CYBER_SYS</div>
                              <div className="h-1 bg-[#00FF88] shadow-[0_0_8px_#00FF88] rounded-full" />
                            </div>
                          )}

                          {avatarConfig.shirt === "armor" && (
                            <div className="absolute inset-0 bg-[#78909C] border-2 border-[#455A64] flex flex-col justify-between p-1">
                              <div className="flex justify-between">
                                <span className="w-1 h-1 bg-amber-400 rounded-full" />
                                <span className="w-1 h-1 bg-amber-400 rounded-full" />
                              </div>
                              <div className="w-5 h-7 bg-red-600 border border-amber-400 self-center rounded-sm flex items-center justify-center text-white text-[8px] font-bold">✝</div>
                              <div className="flex justify-between">
                                <span className="w-1 h-1 bg-amber-400 rounded-full" />
                                <span className="w-1 h-1 bg-amber-400 rounded-full" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 4. LEFT ARM (Pivot for waving/dancing) */}
                        <div className="absolute left-1/2 top-[92px] -translate-x-[82px] left-arm-pivot z-15">
                          <div 
                            className="w-[30px] h-[98px] rounded border-2 border-black/20"
                            style={{ 
                              backgroundColor: avatarConfig.shirt === "none" 
                                ? avatarConfig.skinTone 
                                : avatarConfig.shirt === "roblox-hoodie" ? "#262626"
                                : avatarConfig.shirt === "tuxedo" ? "#111111"
                                : avatarConfig.shirt === "superhero" ? "#1565C0"
                                : avatarConfig.shirt === "neon-tech" ? "#060D1A"
                                : avatarConfig.shirt === "armor" ? "#78909C"
                                : avatarConfig.skinTone
                            }}
                          >
                            {/* Glove/Sleeve cut */}
                            {avatarConfig.shirt !== "none" && (
                              <div 
                                className="w-full h-[30px] rounded-b border-t border-black/10 absolute bottom-0 left-0"
                                style={{ backgroundColor: avatarConfig.skinTone }}
                              />
                            )}
                          </div>
                        </div>

                        {/* 5. RIGHT ARM (Pivot for waving/dancing) */}
                        <div className="absolute left-1/2 top-[92px] translate-x-[52px] right-arm-pivot z-15">
                          <div 
                            className="w-[30px] h-[98px] rounded border-2 border-black/20"
                            style={{ 
                              backgroundColor: avatarConfig.shirt === "none" 
                                ? avatarConfig.skinTone 
                                : avatarConfig.shirt === "roblox-hoodie" ? "#262626"
                                : avatarConfig.shirt === "tuxedo" ? "#111111"
                                : avatarConfig.shirt === "superhero" ? "#1565C0"
                                : avatarConfig.shirt === "neon-tech" ? "#060D1A"
                                : avatarConfig.shirt === "armor" ? "#78909C"
                                : avatarConfig.skinTone
                            }}
                          >
                            {/* Glove/Sleeve cut */}
                            {avatarConfig.shirt !== "none" && (
                              <div 
                                className="w-full h-[30px] rounded-b border-t border-black/10 absolute bottom-0 left-0"
                                style={{ backgroundColor: avatarConfig.skinTone }}
                              />
                            )}
                          </div>
                        </div>

                        {/* 6. LEFT LEG */}
                        <div className="absolute left-1/2 top-[200px] -translate-x-[45px] z-10">
                          <div 
                            className="w-[43px] h-[95px] rounded border-2 border-black/20 relative overflow-hidden"
                            style={{ 
                              backgroundColor: avatarConfig.pants === "none" 
                                ? avatarConfig.skinTone 
                                : avatarConfig.pants === "jeans" ? "#1976D2"
                                : avatarConfig.pants === "cargo" ? "#388E3C"
                                : avatarConfig.pants === "cyber-legs" ? "#1A237E"
                                : avatarConfig.pants === "rainbow" ? "#9c27b0"
                                : avatarConfig.pants === "gold-knight" ? "#F57F17"
                                : avatarConfig.skinTone
                            }}
                          >
                            {/* Rainbow gradient */}
                            {avatarConfig.pants === "rainbow" && (
                              <div className="absolute inset-0 bg-gradient-to-b from-red-500 via-green-500 to-blue-500 opacity-60" />
                            )}
                            {/* Cyber stripes */}
                            {avatarConfig.pants === "cyber-legs" && (
                              <div className="absolute top-6 inset-x-0 h-1.5 bg-[#00FF88] shadow-[0_0_6px_#00FF88]" />
                            )}
                            {/* Kneepad details */}
                            {avatarConfig.pants === "gold-knight" && (
                              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-400 border border-amber-600 rounded" />
                            )}
                            {/* Shoes cuffs */}
                            <div className="w-full h-4 bg-zinc-800 border-t border-black/20 absolute bottom-0 left-0" />
                          </div>
                        </div>

                        {/* 7. RIGHT LEG */}
                        <div className="absolute left-1/2 top-[200px] translate-x-[2px] z-10">
                          <div 
                            className="w-[43px] h-[95px] rounded border-2 border-black/20 relative overflow-hidden"
                            style={{ 
                              backgroundColor: avatarConfig.pants === "none" 
                                ? avatarConfig.skinTone 
                                : avatarConfig.pants === "jeans" ? "#1976D2"
                                : avatarConfig.pants === "cargo" ? "#388E3C"
                                : avatarConfig.pants === "cyber-legs" ? "#1A237E"
                                : avatarConfig.pants === "rainbow" ? "#9c27b0"
                                : avatarConfig.pants === "gold-knight" ? "#F57F17"
                                : avatarConfig.skinTone
                            }}
                          >
                            {/* Rainbow gradient */}
                            {avatarConfig.pants === "rainbow" && (
                              <div className="absolute inset-0 bg-gradient-to-b from-red-500 via-green-500 to-blue-500 opacity-60" />
                            )}
                            {/* Cyber stripes */}
                            {avatarConfig.pants === "cyber-legs" && (
                              <div className="absolute top-6 inset-x-0 h-1.5 bg-[#00FF88] shadow-[0_0_6px_#00FF88]" />
                            )}
                            {/* Kneepad details */}
                            {avatarConfig.pants === "gold-knight" && (
                              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-400 border border-amber-600 rounded" />
                            )}
                            {/* Shoes cuffs */}
                            <div className="w-full h-4 bg-zinc-800 border-t border-black/20 absolute bottom-0 left-0" />
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>

                  {/* Character Pedestal */}
                  <div className="w-48 h-5 bg-gradient-to-r from-brand/40 to-[#00FF88]/40 border border-brand/40 rounded-full blur-[3px] -mt-1.5 pointer-events-none" />
                  <div className="w-44 h-2 bg-brand border border-brand/50 rounded-full -mt-2 pointer-events-none shadow-lg shadow-brand/20 relative z-10" />

                  {/* Username Display Label */}
                  <div className="mt-3 relative z-10 w-full flex items-center justify-center">
                    <div className="bg-[#1a1f29]/90 border border-white/10 rounded-lg py-1 px-4 text-xs font-mono font-bold text-center shadow-lg flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00FF88]" />
                      <span className="text-white select-none">{avatarConfig.nickname}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: CATEGORY CONTROLS & ITEM GRIDS */}
                <div className="lg:col-span-7 space-y-4 flex flex-col">
                  
                  {/* Category Selection Subtabs */}
                  <div className="flex items-center gap-1.5 bg-[#111317] border border-white/5 p-1 rounded-xl shrink-0 overflow-x-auto scrollbar-none">
                    <button
                      onClick={() => setActiveAvatarSubTab("skin")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        activeAvatarSubTab === "skin" ? "bg-brand text-black" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Тіло / Шкіра</span>
                    </button>

                    <button
                      onClick={() => setActiveAvatarSubTab("face")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        activeAvatarSubTab === "face" ? "bg-brand text-black" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Обличчя</span>
                    </button>

                    <button
                      onClick={() => setActiveAvatarSubTab("hat")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        activeAvatarSubTab === "hat" ? "bg-brand text-black" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Капелюхи</span>
                    </button>

                    <button
                      onClick={() => setActiveAvatarSubTab("shirt")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        activeAvatarSubTab === "shirt" ? "bg-brand text-black" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Shirt className="w-3.5 h-3.5" />
                      <span>Сорочки</span>
                    </button>

                    <button
                      onClick={() => setActiveAvatarSubTab("pants")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        activeAvatarSubTab === "pants" ? "bg-brand text-black" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Штани</span>
                    </button>

                    <button
                      onClick={() => setActiveAvatarSubTab("back")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        activeAvatarSubTab === "back" ? "bg-brand text-black" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Аксесуар спини</span>
                    </button>

                    <button
                      onClick={() => setActiveAvatarSubTab("anim")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        activeAvatarSubTab === "anim" ? "bg-brand text-black" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Анімації</span>
                    </button>
                  </div>

                  {/* Options Display Container */}
                  <div className="bg-[#12151b] border border-white/5 rounded-2xl p-5 min-h-[395px] max-h-[395px] overflow-y-auto space-y-4 scrollbar-thin">
                    
                    {/* SKIN TONE OPTION LIST */}
                    {activeAvatarSubTab === "skin" && (
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Оберіть колір шкіри вашого Robloxian</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {SKIN_TONES.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setAvatarConfig((prev) => ({ ...prev, skinTone: t.hex }))}
                              className={`p-3 bg-[#171a21] border rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                                avatarConfig.skinTone === t.hex 
                                  ? "border-brand bg-brand/5 shadow-[0_0_12px_rgba(0,255,136,0.15)]" 
                                  : "border-white/5 hover:border-white/20 hover:bg-white/5"
                              }`}
                            >
                              <span className="w-7 h-7 rounded-full border border-black/20 shrink-0 shadow" style={{ backgroundColor: t.hex }} />
                              <span className="text-[11px] font-bold text-white text-left leading-tight">{t.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FACES OPTION LIST */}
                    {activeAvatarSubTab === "face" && (
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Оберіть вираз обличчя</span>
                        <div className="space-y-2.5">
                          {FACES.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => setAvatarConfig((prev) => ({ ...prev, face: f.id }))}
                              className={`w-full p-3.5 bg-[#171a21] border rounded-xl flex items-center justify-between transition-all text-left cursor-pointer ${
                                avatarConfig.face === f.id 
                                  ? "border-brand bg-brand/5 shadow-[0_0_12px_rgba(0,255,136,0.15)]" 
                                  : "border-white/5 hover:border-white/20 hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-3xl filter drop-shadow select-none">{f.emoji}</span>
                                <div>
                                  <span className="text-xs font-black text-white block">{f.name}</span>
                                  <p className="text-[10px] text-gray-400">{f.desc}</p>
                                </div>
                              </div>
                              {avatarConfig.face === f.id && <Check className="w-4 h-4 text-brand shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* HATS OPTION LIST */}
                    {activeAvatarSubTab === "hat" && (
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Оберіть капелюхи та аксесуари</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {HATS.map((h) => (
                            <button
                              key={h.id}
                              onClick={() => setAvatarConfig((prev) => ({ ...prev, hat: h.id }))}
                              className={`p-3.5 bg-[#171a21] border rounded-xl flex items-center justify-between transition-all text-left cursor-pointer ${
                                avatarConfig.hat === h.id 
                                  ? "border-brand bg-brand/5 shadow-[0_0_12px_rgba(0,255,136,0.15)]" 
                                  : "border-white/5 hover:border-white/20 hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl shrink-0 select-none">{h.emoji}</span>
                                <div>
                                  <span className="text-xs font-black text-white block leading-tight">{h.name}</span>
                                  <span className={`text-[8px] font-mono font-bold uppercase tracking-wide block ${
                                    h.rarity === "Legendary" ? "text-amber-400" :
                                    h.rarity === "Epic" ? "text-purple-400" :
                                    h.rarity === "Rare" ? "text-sky-400" : "text-gray-500"
                                  }`}>
                                    {h.rarity}
                                  </span>
                                </div>
                              </div>
                              {avatarConfig.hat === h.id && <Check className="w-4 h-4 text-brand shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SHIRTS OPTION LIST */}
                    {activeAvatarSubTab === "shirt" && (
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Оберіть сорочку розробника</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SHIRTS.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setAvatarConfig((prev) => ({ ...prev, shirt: s.id }))}
                              className={`p-3.5 bg-[#171a21] border rounded-xl flex items-center justify-between transition-all text-left cursor-pointer ${
                                avatarConfig.shirt === s.id 
                                  ? "border-brand bg-brand/5 shadow-[0_0_12px_rgba(0,255,136,0.15)]" 
                                  : "border-white/5 hover:border-white/20 hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl shrink-0 select-none">{s.emoji}</span>
                                <div>
                                  <span className="text-xs font-black text-white block leading-tight">{s.name}</span>
                                  <span className={`text-[8px] font-mono font-bold uppercase tracking-wide block ${
                                    s.rarity === "Legendary" ? "text-amber-400" :
                                    s.rarity === "Epic" ? "text-purple-400" :
                                    s.rarity === "Rare" ? "text-sky-400" : "text-gray-500"
                                  }`}>
                                    {s.rarity}
                                  </span>
                                </div>
                              </div>
                              {avatarConfig.shirt === s.id && <Check className="w-4 h-4 text-brand shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PANTS OPTION LIST */}
                    {activeAvatarSubTab === "pants" && (
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Оберіть штани чи низький одяг</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {PANTS.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setAvatarConfig((prev) => ({ ...prev, pants: p.id }))}
                              className={`p-3.5 bg-[#171a21] border rounded-xl flex items-center justify-between transition-all text-left cursor-pointer ${
                                avatarConfig.pants === p.id 
                                  ? "border-brand bg-brand/5 shadow-[0_0_12px_rgba(0,255,136,0.15)]" 
                                  : "border-white/5 hover:border-white/20 hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl shrink-0 select-none">{p.emoji}</span>
                                <div>
                                  <span className="text-xs font-black text-white block leading-tight">{p.name}</span>
                                  <span className={`text-[8px] font-mono font-bold uppercase tracking-wide block ${
                                    p.rarity === "Legendary" ? "text-amber-400" :
                                    p.rarity === "Epic" ? "text-purple-400" :
                                    p.rarity === "Rare" ? "text-sky-400" : "text-gray-500"
                                  }`}>
                                    {p.rarity}
                                  </span>
                                </div>
                              </div>
                              {avatarConfig.pants === p.id && <Check className="w-4 h-4 text-brand shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BACK ACCESSORIES OPTION LIST */}
                    {activeAvatarSubTab === "back" && (
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Оберіть аксесуар на спину</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {BACKS.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => setAvatarConfig((prev) => ({ ...prev, back: b.id }))}
                              className={`p-3.5 bg-[#171a21] border rounded-xl flex items-center justify-between transition-all text-left cursor-pointer ${
                                avatarConfig.back === b.id 
                                  ? "border-brand bg-brand/5 shadow-[0_0_12px_rgba(0,255,136,0.15)]" 
                                  : "border-white/5 hover:border-white/20 hover:bg-white/5"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl shrink-0 select-none">{b.emoji}</span>
                                <div>
                                  <span className="text-xs font-black text-white block leading-tight">{b.name}</span>
                                  <span className={`text-[8px] font-mono font-bold uppercase tracking-wide block ${
                                    b.rarity === "Legendary" ? "text-amber-400" :
                                    b.rarity === "Epic" ? "text-purple-400" :
                                    b.rarity === "Rare" ? "text-sky-400" : "text-gray-500"
                                  }`}>
                                    {b.rarity}
                                  </span>
                                </div>
                              </div>
                              {avatarConfig.back === b.id && <Check className="w-4 h-4 text-brand shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ANIMATIONS OPTION LIST */}
                    {activeAvatarSubTab === "anim" && (
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Тестуйте анімації та поведінку 3D аватара</span>
                        <div className="space-y-2.5">
                          {ANIMATIONS.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => setAvatarConfig((prev) => ({ ...prev, animation: a.id }))}
                              className={`w-full p-3.5 bg-[#171a21] border rounded-xl flex items-center justify-between transition-all text-left cursor-pointer ${
                                avatarConfig.animation === a.id 
                                  ? "border-brand bg-brand/5 shadow-[0_0_12px_rgba(0,255,136,0.15)]" 
                                  : "border-white/5 hover:border-white/20 hover:bg-white/5"
                              }`}
                            >
                              <div>
                                <span className="text-xs font-black text-white block">{a.name}</span>
                                <p className="text-[10px] text-gray-400">{a.desc}</p>
                              </div>
                              {avatarConfig.animation === a.id && <Check className="w-4 h-4 text-brand shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================== SETTINGS TAB ================== */}
          {activeTab === "Settings" && (
            <div className="max-w-4xl space-y-6" id="tab-content-settings">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-xl font-black">Параметри безпеки та Persona Verification</h2>
                <p className="text-xs text-gray-400">Налаштуйте ваш профіль Roblox та рівень верифікації для доступу до чату та модерації.</p>
              </div>

              <div className="space-y-4">
                {/* Persona verification bypass configuration */}
                <div className="bg-[#12151b] border border-white/5 p-5 rounded-xl space-y-3">
                  <h3 className="font-bold text-sm text-brand flex items-center gap-1">
                    <Sliders className="w-4 h-4" /> Налаштування перевірки профілю (Persona)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Ви можете повністю обійти або відключити обов'язкову верифікацію особи за допомогою опції нижче.
                  </p>

                  <label className="flex items-start gap-3 bg-[#0a0c0e] border border-white/5 p-3 rounded-lg cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={skipVerification}
                      onChange={(e) => handleToggleSkipVerification(e.target.checked)}
                      className="mt-0.5 accent-brand w-4 h-4 cursor-pointer" 
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Пропустити / Вимкнути обов'язкову верифікацію (Bypass)</span>
                      <p className="text-[10px] text-gray-500">Якщо встановлено прапорець, ви автоматично отримаєте статус Верифікованого Розробника без необхідності заповнювати форму.</p>
                    </div>
                  </label>
                </div>

                {/* Status card */}
                <div className="bg-[#12151b] border border-white/5 p-5 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 block">ПОТОЧНИЙ СТАТУС ВЕРИФІКАЦІЇ</span>
                    {isVerified ? (
                      <span className="text-[#00FF88] text-sm font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Верифікація успішно пройдена!
                      </span>
                    ) : skipVerification ? (
                      <span className="text-brand text-sm font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-brand" /> Верифікацію вимкнено в параметрах (Bypass)
                      </span>
                    ) : (
                      <span className="text-amber-400 text-sm font-bold flex items-center gap-1">
                        <ShieldAlert className="w-4 h-4 text-amber-400" /> Профіль не підтверджено
                      </span>
                    )}
                  </div>

                  <button
                    id="settings-btn-modal-open"
                    onClick={() => setShowVerifyModal(true)}
                    className="px-4 py-2 bg-brand hover:bg-brand-bright text-black font-bold text-xs rounded transition-all cursor-pointer"
                  >
                    {isVerified ? "Змінити дані" : "Верифікуватися зараз"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- PERSONA VERIFICATION POPUP MODAL --- */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12151b] border-2 border-white/10 rounded-2xl p-6 shadow-2xl text-white relative animate-fade-in">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2 border-b border-white/5 pb-3">
              <UserCheck className="text-brand w-5 h-5" />
              <span>Persona Verification</span>
            </h3>

            <p className="text-xs text-gray-400 mt-3 mb-4 leading-relaxed">
              Вкажіть дані свого унікального аватара Roblox, щоб ми могли підтвердити вашу особу та присвоїти статус розробника в серверах чату!
            </p>

            {verificationError && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-xs font-mono mb-4">
                ⚠️ {verificationError}
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">
                  Ваш унікальний Roblox Нікнейм
                </label>
                <input 
                  type="text" 
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  placeholder="напр., Yegor_Gamer_99"
                  className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">
                  Ваш Вік
                </label>
                <input 
                  type="number" 
                  value={personaAge}
                  onChange={(e) => setPersonaAge(e.target.value)}
                  placeholder="напр., 14"
                  className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-brand"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={personaCheckbox}
                  onChange={(e) => setPersonaCheckbox(e.target.checked)}
                  className="mt-0.5 accent-brand rounded cursor-pointer"
                />
                <span className="text-[10px] text-gray-400 leading-normal">
                  Я погоджуюсь з правилами модерації Roblox Sandbox та зобов'язуюсь не використовувати заборонені слова в чатах.
                </span>
              </label>

              <div className="flex gap-2.5 pt-2">
                <button
                  id="verify-modal-cancel"
                  type="button"
                  onClick={() => {
                    setShowVerifyModal(false);
                    setVerificationError("");
                  }}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded transition-all cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  id="verify-modal-submit"
                  type="submit"
                  className="flex-1 py-2 bg-brand hover:bg-brand-bright text-black font-black text-xs rounded transition-all cursor-pointer"
                >
                  Підтвердити
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
