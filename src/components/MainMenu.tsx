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
  Wrench,
  ShoppingBag,
  Lock,
  Unlock,
  Link as LinkIcon,
  Radio,
  Plus,
  ArrowRight
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
  onPlayPremadeGame: (game: any, roomId?: string) => void;
  cloudGames?: any[];
  onDeleteCloudGame?: (id: string) => void;
  onEditCloudGame?: (game: any) => void;
  onSaveCloudGame?: (newGame: any) => void;
}

export default function MainMenu({ 
  onStartStudio, 
  onPlayPremadeGame,
  cloudGames = [],
  onDeleteCloudGame,
  onEditCloudGame,
  onSaveCloudGame
}: MainMenuProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"Home" | "Games" | "Develop" | "Settings" | "Avatar" | "Catalog" | "Communities">("Home");

  // Custom AI UGC catalog items
  const [customCatalogItems, setCustomCatalogItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("roblox_custom_catalog_items");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Merge static lists with custom AI generated UGC catalog items
  const allHats = [...HATS, ...customCatalogItems.filter(i => i.type === "hat")];
  const allShirts = [...SHIRTS, ...customCatalogItems.filter(i => i.type === "shirt")];
  const allPants = [...PANTS, ...customCatalogItems.filter(i => i.type === "pants")];
  const allBacks = [...BACKS, ...customCatalogItems.filter(i => i.type === "back")];

  // AI Game Generator States
  const [aiGamePrompt, setAiGamePrompt] = useState("");
  const [isGeneratingGame, setIsGeneratingGame] = useState(false);
  const [generatedGameSuccess, setGeneratedGameSuccess] = useState<string | null>(null);
  const [generatedGameError, setGeneratedGameError] = useState<string | null>(null);

  // AI Skin Generator States
  const [aiSkinPrompt, setAiSkinPrompt] = useState("");
  const [isGeneratingSkin, setIsGeneratingSkin] = useState(false);
  const [generatedSkinSuccess, setGeneratedSkinSuccess] = useState(false);
  const [showAISkinModal, setShowAISkinModal] = useState(false);
  const [generatedSkinError, setGeneratedSkinError] = useState<string | null>(null);

  // AI Clothing UGC States
  const [aiClothingPrompt, setAiClothingPrompt] = useState("");
  const [isGeneratingClothing, setIsGeneratingClothing] = useState(false);
  const [generatedClothingSuccess, setGeneratedClothingSuccess] = useState<string | null>(null);
  const [generatedClothingError, setGeneratedClothingError] = useState<string | null>(null);
  const [aiModalTab, setAiModalTab] = useState<"skin" | "clothing">("skin");

  // Account Switcher and Robux State
  const [currentAccount, setCurrentAccount] = useState<"Yegor" | "RobloxLAUNCHER">(() => {
    const saved = localStorage.getItem("roblox_current_account") as "Yegor" | "RobloxLAUNCHER";
    return saved === "Yegor" || saved === "RobloxLAUNCHER" ? saved : "RobloxLAUNCHER";
  });

  const [hasHiddenPremium, setHasHiddenPremium] = useState<boolean>(() => {
    const saved = localStorage.getItem("roblox_hidden_premium");
    return saved !== "false"; // default to true
  });

  const [robuxBalance, setRobuxBalance] = useState<number>(999999999);

  // Sync active account and nickname
  useEffect(() => {
    localStorage.setItem("roblox_current_account", currentAccount);
    localStorage.setItem("roblox_persona_username", currentAccount);
    setAvatarConfig((prev) => ({
      ...prev,
      nickname: currentAccount
    }));
  }, [currentAccount]);

  useEffect(() => {
    localStorage.setItem("roblox_hidden_premium", hasHiddenPremium ? "true" : "false");
  }, [hasHiddenPremium]);

  // Owned Clothing Items
  const [ownedItems, setOwnedItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("roblox_owned_items");
      return saved ? JSON.parse(saved) : ["classic-cap", "roblox-hoodie", "jeans", "none"];
    } catch (e) {
      return ["classic-cap", "roblox-hoodie", "jeans", "none"];
    }
  });

  // Shop Notification
  const [catalogNotification, setCatalogNotification] = useState<string | null>(null);

  const buyItem = (itemId: string, price: number, itemName: string) => {
    if (ownedItems.includes(itemId)) {
      setCatalogNotification(`Ви вже володієте цим елементом "${itemName}"!`);
      setTimeout(() => setCatalogNotification(null), 3000);
      return;
    }
    const updated = [...ownedItems, itemId];
    setOwnedItems(updated);
    localStorage.setItem("roblox_owned_items", JSON.stringify(updated));
    setCatalogNotification(`🎉 Успішно куплено "${itemName}" за ${price} Robux! Одягніть його в Редакторі Аватара.`);
    setTimeout(() => setCatalogNotification(null), 4000);
  };

  // Real Friends List with Profiles and Clickable Links
  const [friendsList, setFriendsList] = useState<any[]>([
    {
      id: "friend-builderman",
      name: "Builderman_CEO",
      avatar: "🛠️",
      online: true,
      statusText: "В мережі — грає в Natural Disaster Sandbox",
      playingGameId: "natural-disaster",
      desc: "Офіційний засновник Roblox. Люблю створювати ігри та допомагати юним розробникам!",
      profileLink: "https://roblox.com/users/1/profile",
      personalGames: ["Natural Disaster Sandbox", "Crossroads Battleground"]
    },
    {
      id: "friend-yegorpro",
      name: "Yegor_Dev_2026",
      avatar: "🪐",
      online: true,
      statusText: "В мережі — грає в Tower of Hell (Lite)",
      playingGameId: "tower-of-hell",
      desc: "Професійний Luau розробник, творець Tower of Hell (Lite) та систем безпеки хмари.",
      profileLink: "https://roblox.com/users/2026/profile",
      personalGames: ["Tower of Hell (Lite)", "Roblox Cloud Admin Hub"]
    },
    {
      id: "friend-david",
      name: "DavidBaszucki",
      avatar: "👔",
      online: true,
      statusText: "В мережі — грає в Speed Run (V)",
      playingGameId: "speed-run",
      desc: "Генеральний директор Roblox Corporation. Завжди онлайн у ваших думках!",
      profileLink: "https://roblox.com/users/2/profile",
      personalGames: ["Bloxburg Architects", "Classic Crossroads"]
    },
    {
      id: "friend-telamon",
      name: "Telamon",
      avatar: "💣",
      online: false,
      statusText: "Офлайн (У школі, скоро зайде!)",
      desc: "Поціновувач хаосу, вибухівки та смаженої курки. Творець класичних карт.",
      profileLink: "https://roblox.com/users/104/profile",
      personalGames: ["Doomspire Brickbattle", "Chaos Canyon"]
    }
  ]);

  // Profile View Modal State
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  // Communities state
  const [communities, setCommunities] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("roblox_communities");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "com-luau",
        name: "Luau Devs Union",
        description: "Найбільша спільнота Luau програмістів у Sandbox! Створюємо скрипти, обговорюємо оптимізацію та ділимося досвідом.",
        creator: "Yegor_Dev_2026",
        membersCount: 1250,
        emoji: "💻",
        comments: [
          { sender: "Guest_77", text: "Як налаштувати силу батута?", time: "12:30" },
          { sender: "Yegor_Dev_2026", text: "Поміняй параметр розміру або додай вектор швидкості!", time: "12:45" }
        ]
      },
      {
        id: "com-toh",
        name: "Tower of Hell Champions",
        description: "Для справжніх хардкорних гравців! Обговорення проходження веж без чекпоінтів та спідранів.",
        creator: "RobloxLAUNCHER",
        membersCount: 840,
        emoji: "🗼",
        comments: [
          { sender: "Classic_Noob", text: "Я впав знову на останньому поверсі :(", time: "14:10" }
        ]
      }
    ];
  });

  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("roblox_joined_communities");
      return saved ? JSON.parse(saved) : ["com-luau"];
    } catch (e) {
      return ["com-luau"];
    }
  });

  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState<boolean>(false);
  const [newCommunityName, setNewCommunityName] = useState<string>("");
  const [newCommunityDesc, setNewCommunityDesc] = useState<string>("");
  const [newCommunityEmoji, setNewCommunityEmoji] = useState<string>("👥");

  const [viewingCommunity, setViewingCommunity] = useState<any | null>(null);
  const [communityComment, setCommunityComment] = useState<string>("");

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityName.trim()) return;

    // Costs 2 Robux. With Hidden Premium it's always successful!
    const newCom = {
      id: `com-${Date.now()}`,
      name: newCommunityName.trim(),
      description: newCommunityDesc.trim() || "Спільнота однодумців Roblox Sandbox.",
      creator: currentAccount,
      membersCount: 1,
      emoji: newCommunityEmoji,
      comments: []
    };

    const updated = [newCom, ...communities];
    setCommunities(updated);
    localStorage.setItem("roblox_communities", JSON.stringify(updated));

    const updatedJoined = [...joinedCommunities, newCom.id];
    setJoinedCommunities(updatedJoined);
    localStorage.setItem("roblox_joined_communities", JSON.stringify(updatedJoined));

    setShowCreateCommunityModal(false);
    setNewCommunityName("");
    setNewCommunityDesc("");
    setCatalogNotification(`👥 Спільноту "${newCom.name}" успішно створено за 2 Robux!`);
    setTimeout(() => setCatalogNotification(null), 3000);
  };

  const handleJoinCommunity = (comId: string) => {
    if (joinedCommunities.includes(comId)) {
      // Leave
      const updated = joinedCommunities.filter(id => id !== comId);
      setJoinedCommunities(updated);
      localStorage.setItem("roblox_joined_communities", JSON.stringify(updated));
      
      // Decrease members count
      setCommunities(prev => prev.map(c => c.id === comId ? { ...c, membersCount: Math.max(1, c.membersCount - 1) } : c));
    } else {
      // Join
      const updated = [...joinedCommunities, comId];
      setJoinedCommunities(updated);
      localStorage.setItem("roblox_joined_communities", JSON.stringify(updated));

      // Increase members count
      setCommunities(prev => prev.map(c => c.id === comId ? { ...c, membersCount: c.membersCount + 1 } : c));
    }
  };

  const handlePostCommunityComment = (e: React.FormEvent, comId: string) => {
    e.preventDefault();
    if (!communityComment.trim()) return;

    const newComment = {
      sender: currentAccount,
      text: communityComment.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setCommunities(prev => {
      const updated = prev.map(c => {
        if (c.id === comId) {
          return {
            ...c,
            comments: [...c.comments, newComment]
          };
        }
        return c;
      });
      localStorage.setItem("roblox_communities", JSON.stringify(updated));
      // Update local modal if open
      if (viewingCommunity && viewingCommunity.id === comId) {
        setViewingCommunity(updated.find(c => c.id === comId));
      }
      return updated;
    });

    setCommunityComment("");
  };

  // Roblox Cloud Games Moderation Scanner
  const [gamesTab, setGamesTab] = useState<"public" | "cloud">("public");
  const [moderationScanId, setModerationScanId] = useState<string | null>(null);
  const [scannedGames, setScannedGames] = useState<Record<string, { status: "approved" | "suspicious" | "pending"; reasons: string[] }>>(() => {
    try {
      const saved = localStorage.getItem("roblox_cloud_scans");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const runModerationScan = (gameId: string, title: string, description: string, parts: any[]) => {
    setModerationScanId(gameId);
    setTimeout(() => {
      // Search for suspicious words
      const reasons: string[] = [];
      const contentToScan = (title + " " + description).toLowerCase();
      
      const suspiciousWords = ["cheat", "unlimited", "free robux", "hack", "virus", "kill", "lava", "exploit", "robux", "noob"];
      suspiciousWords.forEach(word => {
        if (contentToScan.includes(word)) {
          reasons.push(`Знайдено підозріле слово в тексті: "${word}"`);
        }
      });

      // Scan parts list for dangerous traps or script hacks
      parts.forEach((part: any) => {
        if (part.name && suspiciousWords.some(w => part.name.toLowerCase().includes(w))) {
          reasons.push(`Знайдено деталь з підозрілою назвою: "${part.name}"`);
        }
        if (part.specialType === "killbrick") {
          reasons.push(`Знайдено смертельну пастку: "Killbrick"`);
        }
      });

      const status = reasons.length > 0 ? "suspicious" : "approved";
      
      setScannedGames(prev => {
        const updated = {
          ...prev,
          [gameId]: { status, reasons }
        };
        localStorage.setItem("roblox_cloud_scans", JSON.stringify(updated));
        return updated;
      });
      setModerationScanId(null);
    }, 1500);
  };

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

  // AI Game Generator Handler
  const handleGenerateAIGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGamePrompt.trim() || isGeneratingGame) return;

    setIsGeneratingGame(true);
    setGeneratedGameSuccess(null);
    setGeneratedGameError(null);

    try {
      const response = await fetch("/api/ai/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiGamePrompt }),
      });

      if (!response.ok) {
        throw new Error("Не вдалося згенерувати гру. Спробуйте ще раз.");
      }

      const data = await response.json();
      if (!data.success || !data.game) {
        throw new Error(data.error || "Невідома помилка при генерації гри.");
      }

      const gameData = data.game;
      const finalGame = {
        id: `cloud-ai-${Date.now()}`,
        title: gameData.title || "AI Generated World",
        creator: currentAccount,
        description: gameData.description || "Згенеровано штучним інтелектом у Roblox Studio Sandbox.",
        parts: gameData.parts || [],
        isAiGenerated: true,
        likes: "100%",
        playersCount: "0",
        iconBg: "from-amber-500 via-purple-600 to-indigo-700",
        emoji: gameData.emoji || "🤖",
        difficulty: gameData.difficulty || "Середня"
      };

      if (onSaveCloudGame) {
        onSaveCloudGame(finalGame);
      } else {
        const saved = localStorage.getItem("roblox_cloud_games");
        const list = saved ? JSON.parse(saved) : [];
        localStorage.setItem("roblox_cloud_games", JSON.stringify([finalGame, ...list]));
      }

      setGeneratedGameSuccess(`🎉 Гру "${finalGame.title}" успішно згенеровано AI та збережено у вашому Roblox Cloud!`);
      setAiGamePrompt("");
    } catch (err: any) {
      console.error(err);
      setGeneratedGameError(err.message || "Сталася помилка з'єднання з AI сервером.");
    } finally {
      setIsGeneratingGame(false);
    }
  };

  // AI Skin Generator Handler
  const handleGenerateAISkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSkinPrompt.trim() || isGeneratingSkin) return;

    setIsGeneratingSkin(true);
    setGeneratedSkinSuccess(false);
    setGeneratedSkinError(null);

    try {
      const response = await fetch("/api/ai/generate-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiSkinPrompt }),
      });

      if (!response.ok) {
        throw new Error("Не вдалося згенерувати скін. Спробуйте ще раз.");
      }

      const data = await response.json();
      if (!data.success || !data.avatar) {
        throw new Error(data.error || "Невідома помилка при генерації скіна.");
      }

      const skinData = data.avatar;
      
      const newConfig: RobloxAvatarConfig = {
        ...avatarConfig,
        bodyType: skinData.bodyType || "R6",
        skinTone: skinData.skinTone || "#FFD13B",
        face: skinData.face || "smile",
        hat: skinData.hat || "classic-cap",
        shirt: skinData.shirt || "roblox-hoodie",
        pants: skinData.pants || "jeans",
        back: skinData.back || "none",
        animation: skinData.animation || "idle"
      };

      setAvatarConfig(newConfig);
      localStorage.setItem("roblox_user_avatar", JSON.stringify(newConfig));

      const itemsToUnlock = [skinData.hat, skinData.shirt, skinData.pants, skinData.back].filter(id => id && id !== "none");
      if (itemsToUnlock.length > 0) {
        setOwnedItems(prev => {
          const updated = [...new Set([...prev, ...itemsToUnlock])];
          localStorage.setItem("roblox_owned_items", JSON.stringify(updated));
          return updated;
        });
      }

      setGeneratedSkinSuccess(true);
      setAiSkinPrompt("");
      setTimeout(() => {
        setShowAISkinModal(false);
        setGeneratedSkinSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setGeneratedSkinError(err.message || "Сталася помилка зв'язку з AI сервером.");
    } finally {
      setIsGeneratingSkin(false);
    }
  };

  // AI Clothing UGC Handler
  const handleGenerateAIClothing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiClothingPrompt.trim() || isGeneratingClothing) return;

    setIsGeneratingClothing(true);
    setGeneratedClothingSuccess(null);
    setGeneratedClothingError(null);

    try {
      const response = await fetch("/api/ai/generate-clothing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiClothingPrompt }),
      });

      if (!response.ok) {
        throw new Error("Не вдалося створити одяг. Спробуйте ще раз.");
      }

      const data = await response.json();
      if (!data.success || !data.clothing) {
        throw new Error(data.error || "Невідома помилка при розробці одягу.");
      }

      const newItem = data.clothing;
      const uniqueId = `ai-item-${Date.now()}`;
      const finalItem = {
        id: uniqueId,
        type: newItem.type || "shirt",
        name: newItem.name || "AI Designer Outfit",
        emoji: newItem.emoji || "👕",
        rarity: newItem.rarity || "Epic",
        price: newItem.price || 0,
        desc: newItem.desc || "Створено штучним інтелектом у Roblox Studio Sandbox.",
        isAiGenerated: true
      };

      const updatedList = [finalItem, ...customCatalogItems];
      setCustomCatalogItems(updatedList);
      localStorage.setItem("roblox_custom_catalog_items", JSON.stringify(updatedList));

      const updatedOwned = [...new Set([...ownedItems, uniqueId])];
      setOwnedItems(updatedOwned);
      localStorage.setItem("roblox_owned_items", JSON.stringify(updatedOwned));

      setGeneratedClothingSuccess(`🎉 Одяг "${finalItem.name}" успішно розроблено AI! Він безкоштовно доданий у ваш інвентар та доступний у каталозі.`);
      setAiClothingPrompt("");
    } catch (err: any) {
      console.error(err);
      setGeneratedClothingError(err.message || "Сталася помилка з'єднання з AI UGC сервером.");
    } finally {
      setIsGeneratingClothing(false);
    }
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
          <div className="relative w-9 h-9 transform rotate-6 hover:rotate-12 transition-transform duration-300">
            <img 
              src="/logo512.jpg" 
              alt="Roblox Sandbox Icon" 
              className="w-full h-full object-cover rounded-lg border border-[#00FF88]/40 shadow-[0_0_12px_rgba(0,255,136,0.25)]" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight block text-white uppercase">ROBLOX SANDBOX</span>
              <span className="text-[9px] bg-brand text-black font-extrabold px-1.5 py-0.5 rounded border border-brand/20 flex items-center gap-0.5">
                <span>App Store</span>
                <span className="bg-black text-brand px-1 py-0.2 rounded text-[8px]">4+</span>
              </span>
            </div>
            <span className="text-[10px] text-[#00FF88] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              🟢 Live Engine Active v2.6.0 • Опубліковано в App Store
            </span>
          </div>
        </div>

        {/* Global User info & Blue Verification status */}
        <div className="flex items-center gap-4">
          {/* Robux Balance Indicator */}
          <div className="bg-[#1a1f29] border border-brand/20 rounded-lg py-1.5 px-3 flex items-center gap-2 text-xs font-bold text-amber-400 font-mono shadow-md" title="Баланс Robux з Прихованим Преміумом">
            <span className="text-[11px] bg-amber-400 text-black px-1 py-0.5 rounded font-black leading-none font-sans">R$</span>
            <span className="text-sm">{hasHiddenPremium ? "∞" : "25,000"}</span>
            <span className="text-[9px] text-brand uppercase bg-brand/10 border border-brand/20 px-1 py-0.2 rounded font-sans tracking-wide">Premium</span>
          </div>

          {/* Account Selector */}
          <div className="flex items-center gap-1.5 bg-[#1a1f29] border border-white/10 rounded-lg py-1 px-2.5 text-xs text-white">
            <span className="text-gray-400">Акаунт:</span>
            <select
              value={currentAccount}
              onChange={(e) => {
                const val = e.target.value as "Yegor" | "RobloxLAUNCHER";
                setCurrentAccount(val);
              }}
              className="bg-transparent border-none text-[#00FF88] font-bold focus:ring-0 focus:outline-none cursor-pointer pr-1"
            >
              <option value="RobloxLAUNCHER" className="bg-[#12151b] text-white">RobloxLAUNCHER (Public)</option>
              <option value="Yegor" className="bg-[#12151b] text-white">Yegor (Private)</option>
            </select>
          </div>

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
              id="sidebar-tab-catalog"
              onClick={() => setActiveTab("Catalog")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "Catalog" 
                  ? "bg-brand text-black shadow-lg shadow-brand/15" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Магазин одягу (Catalog)</span>
            </button>

            <button
              id="sidebar-tab-communities"
              onClick={() => setActiveTab("Communities")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "Communities" 
                  ? "bg-brand text-black shadow-lg shadow-brand/15" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Спільноти (Communities)</span>
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
          <div className="bg-black/20 border border-white/5 p-3 rounded-lg text-[10px] text-gray-500 font-mono space-y-1.5">
            <span className="text-gray-400 block font-bold">Спільнота Roblox</span>
            <p>Проєкт створено для тестування скриптів Luau та 3D об'єктів.</p>
            <div className="pt-1.5 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] text-gray-400">Віковий ценз:</span>
              <span className="bg-white/10 text-white font-black px-1.5 py-0.5 rounded text-[9px] border border-white/10">4+</span>
            </div>
            <div className="flex items-center gap-1 text-[8px] text-brand/80 font-semibold bg-brand/5 p-1 rounded border border-brand/10">
              ⚡ Офіційний реліз в App Store
            </div>
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

              {/* Account Profile & Friends List Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Account card */}
                <div className="bg-[#12151b] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-bright rounded-full flex items-center justify-center text-2xl border-2 border-white/10 shadow-lg">
                      {currentAccount === "Yegor" ? "🪐" : "🚀"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-white text-base">{currentAccount}</span>
                        <span className="bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30 px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wide uppercase">Active</span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">ID: {currentAccount === "Yegor" ? "SECRET_USER_99" : "ROBLOX_LAUNCHER_01"}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="bg-brand/10 border border-brand/20 p-3 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand uppercase font-mono">
                        <Crown className="w-3.5 h-3.5" />
                        <span>Прихований Преміум</span>
                      </div>
                      <p className="text-[10px] text-gray-300 leading-relaxed">
                        Безмежні робукси активовано для обох акаунтів Yegor та RobloxLAUNCHER. Ви маєте повний безкоштовний доступ до всіх ексклюзивних предметів та створення спільнот!
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase font-mono block">Текст статусу в профілі</span>
                      <p className="text-xs text-gray-300 bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono">
                        {currentAccount === "Yegor" 
                          ? "Привіт! Я Єгор, розробник цього Roblox Launcher Sandbox. Мій приватний акаунт для тестів." 
                          : "Офіційний запускний клієнт Roblox Launcher. Спробуйте пограти в наші круті паркури!"
                        }
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase font-mono block">Посилання у вашому профілі</span>
                      <a 
                        href="#dev-link" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCatalogNotification(`🔗 Посилання в профілі веде на: ${currentAccount === "Yegor" ? "https://roblox.com/developers/yegor" : "https://roblox.com/launcher/home"}`);
                          setTimeout(() => setCatalogNotification(null), 3000);
                        }}
                        className="text-brand hover:underline text-xs flex items-center gap-1 font-mono cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>{currentAccount === "Yegor" ? "roblox.com/developers/yegor" : "roblox.com/launcher/home"}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Friends list card */}
                <div className="bg-[#12151b] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="font-bold text-xs text-gray-400 font-mono uppercase tracking-wider">СПИСОК ДРУЗІВ (Real Friends)</span>
                    <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full font-mono font-bold">
                      {friendsList.filter((f) => f.online).length} / {friendsList.length} Online
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                    {friendsList.map((friend) => (
                      <div key={friend.id} className="bg-black/20 hover:bg-black/45 border border-white/5 p-2.5 rounded-xl flex items-center justify-between transition-all">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-[#1a1f29] border border-white/5 rounded-full flex items-center justify-center text-lg relative">
                            {friend.avatar}
                            {friend.online && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00FF88] rounded-full border border-black animate-ping" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-black block text-gray-200">{friend.name}</span>
                            <span className={`text-[9px] font-mono font-bold block ${
                              friend.online ? "text-[#00FF88]" : "text-amber-500"
                            }`}>
                              {friend.online ? "🟢 " : "🕒 "} {friend.statusText}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {friend.online && friend.playingGameId && (
                            <button
                              id={`friend-join-btn-${friend.id}`}
                              onClick={() => {
                                const targetGame = PREMADE_GAMES.find(g => g.id === friend.playingGameId);
                                if (targetGame) {
                                  onPlayPremadeGame(targetGame, friend.playingGameId);
                                }
                              }}
                              className="px-2.5 py-1.5 bg-[#00FF88] hover:bg-[#00dd77] text-black font-extrabold text-[10px] rounded transition-all cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
                              title={`Приєднатися до мультиплеєру ${friend.name}`}
                            >
                              <Play className="w-3 h-3 fill-black text-black" />
                              <span>Приєднатися</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedProfile(friend)}
                            className="px-2 py-1.5 bg-brand/10 hover:bg-brand text-brand hover:text-black font-bold text-[10px] rounded transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Профіль</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-gray-500 italic text-center font-mono pt-1">
                    «Запрошуйте друзів до вашого сервера, використовуючи посилання публікації!»
                  </p>
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
                  <p className="text-xs text-gray-400">Оберіть категорію ігор: грайте в офіційні симуляції або досліджуйте сховище Roblox Cloud!</p>
                </div>
                
                {/* Search bar decoration */}
                <div className="bg-[#12151b] border border-white/10 rounded-lg py-1.5 px-3 flex items-center gap-2 text-xs text-gray-400 min-w-[220px]">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Пошук симуляцій..." className="bg-transparent border-none outline-none text-white w-full text-xs" disabled />
                </div>
              </div>

              {/* Category Selector Tabs */}
              <div className="flex border-b border-white/5 gap-2">
                <button
                  onClick={() => setGamesTab("public")}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    gamesTab === "public"
                      ? "border-[#00FF88] text-[#00FF88] font-black bg-white/5 rounded-t-lg"
                      : "border-transparent text-gray-400 hover:text-white hover:bg-white/2"
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Грати в ігри (Public Games)</span>
                </button>
                <button
                  onClick={() => setGamesTab("cloud")}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    gamesTab === "cloud"
                      ? "border-brand text-brand font-black bg-white/5 rounded-t-lg"
                      : "border-transparent text-gray-400 hover:text-white hover:bg-white/2"
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>Roblox Cloud (Приватні & Хмарні ігри)</span>
                </button>
                <button
                  onClick={() => setGamesTab("ai")}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    gamesTab === "ai"
                      ? "border-amber-400 text-amber-400 font-black bg-white/5 rounded-t-lg"
                      : "border-transparent text-gray-400 hover:text-white hover:bg-white/2"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Генерація Ігор 🤖</span>
                </button>
              </div>

              {/* Public Games List Tab */}
              {gamesTab === "public" && (
                <div className="space-y-4">
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
                </div>
              )}

              {/* Roblox Cloud Tab */}
              {gamesTab === "cloud" && (
                <div className="space-y-4">
                  <div className="bg-[#12151b] border border-brand/20 p-4 rounded-xl space-y-1">
                    <h3 className="text-xs font-bold text-brand uppercase tracking-wider font-mono">Сховище Roblox Cloud</h3>
                    <p className="text-[10px] text-gray-400">
                      Тут назавжди зберігаються всі ваші приватні та публічні проекти. Згідно з правилами безпеки Roblox, деякі проекти проходять автоматичну систему модерації на підозрілі Luau скрипти або шкідливі блоки (Killbricks).
                    </p>
                  </div>

                  {cloudGames.length === 0 ? (
                    <div className="bg-[#12151b]/40 border border-dashed border-white/10 p-12 rounded-xl text-center space-y-3">
                      <p className="text-xs text-gray-400">У хмарі Roblox Cloud поки що немає завантажених вами ігор.</p>
                      <button
                        onClick={onStartStudio}
                        className="px-5 py-2 bg-brand hover:bg-brand-bright text-black font-bold text-[10px] uppercase tracking-wider rounded transition-all cursor-pointer font-sans shadow-md"
                      >
                        Опублікувати першу гру з Roblox Studio ⚒️
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cloudGames.map((game: any) => {
                        const scanResult = scannedGames[game.id];
                        const isScanning = moderationScanId === game.id;

                        return (
                          <div 
                            key={game.id} 
                            className="bg-[#12151b] border border-brand/10 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-brand/30 transition-all relative group"
                          >
                            <div className={`bg-gradient-to-br ${game.iconBg} p-5 flex items-center justify-between relative overflow-hidden`}>
                              <span className="text-5xl filter drop-shadow-lg z-10">{game.emoji || "🕹️"}</span>
                              <div className="flex flex-col items-end gap-1.5 z-10">
                                <span className="bg-brand/95 backdrop-blur px-2 py-0.5 rounded text-[8px] font-mono text-black font-bold uppercase tracking-wider shadow-sm">
                                  {game.privacy === "public" ? "Публічна" : "Приватна"}
                                </span>
                                
                                {/* Moderation Badge */}
                                {isScanning ? (
                                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase animate-pulse">
                                    🔄 Скан...
                                  </span>
                                ) : scanResult ? (
                                  scanResult.status === "approved" ? (
                                    <span className="bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase shadow-sm">
                                      ✅ Безпечна
                                    </span>
                                  ) : (
                                    <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase shadow-sm">
                                      ⚠️ Підозріла
                                    </span>
                                  )
                                ) : (
                                  <span className="bg-gray-500/20 text-gray-300 border border-gray-500/30 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase">
                                    🔍 Не перевірено
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-bold text-sm text-white truncate max-w-[170px]" title={game.title}>{game.title}</h4>
                                  <span className="text-[10px] text-gray-400 font-mono shrink-0">by {game.creator}</span>
                                </div>
                                <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 h-8 overflow-hidden">{game.description}</p>
                                <div className="text-[9px] text-gray-500 font-mono">Збережено в хмару: {game.savedAt}</div>

                                {/* Scanned Details Alert Box */}
                                {scanResult && scanResult.status === "suspicious" && (
                                  <div className="bg-red-500/5 border border-red-500/15 p-2 rounded-lg space-y-1 mt-2">
                                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block font-mono">⚠️ Звіт модератора:</span>
                                    {scanResult.reasons.slice(0, 2).map((reason, idx) => (
                                      <p key={idx} className="text-[9px] text-gray-300">• {reason}</p>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono border-t border-white/5 pt-3">
                                <div className="flex items-center gap-1.5">
                                  {onDeleteCloudGame && (
                                    <button
                                      onClick={() => onDeleteCloudGame(game.id)}
                                      className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 rounded transition-all cursor-pointer"
                                      title="Видалити з хмари"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  
                                  {/* Moderation trigger button */}
                                  <button
                                    onClick={() => runModerationScan(game.id, game.title, game.description, game.parts || [])}
                                    disabled={isScanning}
                                    className={`p-1.5 rounded border transition-all cursor-pointer text-[10px] font-bold font-sans ${
                                      isScanning 
                                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30" 
                                        : "bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 border-blue-500/20"
                                    }`}
                                    title="Запустити перевірку коду та тригерів"
                                  >
                                    🔍 Скан
                                  </button>

                                  {onEditCloudGame && (
                                    <button
                                      onClick={() => onEditCloudGame(game)}
                                      className="p-1.5 bg-brand/10 hover:bg-brand hover:text-black text-brand border border-brand/20 rounded transition-all cursor-pointer font-sans text-[10px] font-bold flex items-center gap-1"
                                      title="Завантажити у Roblox Studio"
                                    >
                                      <Wrench className="w-3 h-3" />
                                      <span>РЕДАКТОР</span>
                                    </button>
                                  )}
                                </div>
                                
                                <button
                                  onClick={() => onPlayPremadeGame(game)}
                                  className="px-3.5 py-1.5 bg-[#00FF88] hover:bg-[#00dd77] text-black font-bold rounded flex items-center gap-1 cursor-pointer font-sans transition-all text-[11px] hover:scale-105 active:scale-95 animate-pulse"
                                >
                                  <Play className="w-3 h-3 fill-black text-black" />
                                  <span>ГРАТИ (PLAY)</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* AI Game Generator Tab */}
              {gamesTab === "ai" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-[#12151b] border border-amber-500/20 p-5 rounded-xl space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Генерація гри штучним інтелектом</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Опишіть ідею вашої майбутньої гри Roblox українською або англійською мовою. Наш інтегрований AI (Gemini 1.5 Flash) автоматично спроектує гру, підготує розширену тривимірну карту деталей, задасть фізику, спавни, чекпоінти, та додасть Luau скрипти для інтерактивності!
                    </p>
                  </div>

                  <form onSubmit={handleGenerateAIGame} className="bg-[#12151b] border border-white/5 p-6 rounded-xl space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider block">Опишіть світ, перешкоди чи сценарій:</label>
                      <textarea
                        value={aiGamePrompt}
                        onChange={(e) => setAiGamePrompt(e.target.value)}
                        placeholder="Наприклад: 'Неоновий паркур у хмарах з великою кількістю батутів, рухомих платформ та смертельною лавою червоного кольору'"
                        className="w-full h-24 bg-[#171a21] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-400 transition-all resize-none"
                        disabled={isGeneratingGame}
                      />
                    </div>

                    {generatedGameSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-3 px-4 rounded-lg">
                        {generatedGameSuccess}
                      </div>
                    )}

                    {generatedGameError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-3 px-4 rounded-lg">
                        {generatedGameError}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isGeneratingGame || !aiGamePrompt.trim()}
                        className={`px-5 py-2.5 rounded-lg text-xs font-bold font-sans flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                          isGeneratingGame 
                            ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 cursor-not-allowed" 
                            : !aiGamePrompt.trim()
                            ? "bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed"
                            : "bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-500/10"
                        }`}
                      >
                        {isGeneratingGame ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                            <span>Проектування світу AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Згенерувати гру</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
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
                    onClick={() => {
                      setAiModalTab("skin");
                      setShowAISkinModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-105"
                    title="Згенерувати скін чи одяг за допомогою штучного інтелекту"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>AI Генератор 🤖</span>
                  </button>

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
                          {allHats.map((h) => (
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
                          {allShirts.map((s) => (
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
                          {allPants.map((p) => (
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
                          {allBacks.map((b) => (
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

          {/* ================== CATALOG (SHOP) TAB ================== */}
          {activeTab === "Catalog" && (
            <div className="max-w-4xl space-y-6 animate-fade-in" id="tab-content-catalog">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">Магазин одягу та аксесуарів (Roblox Catalog)</h2>
                  <p className="text-xs text-gray-400">Купуйте ексклюзивні речі за Robux та екіпіруйте їх у Редакторі Аватара!</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setAiModalTab("clothing");
                      setShowAISkinModal(true);
                    }}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 transition-all"
                    title="Створити власний UGC одяг за допомогою штучного інтелекту"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>AI UGC Дизайнер 🎨</span>
                  </button>
                  <div className="bg-amber-400/10 text-amber-400 border border-amber-400/25 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    <span>Прихований Преміум: Необмежено</span>
                  </div>
                </div>
              </div>

              {/* Catalog Notifications */}
              {catalogNotification && (
                <div className="bg-[#00FF88]/15 border border-[#00FF88]/30 text-white text-xs px-4 py-3 rounded-xl flex items-center justify-between animate-bounce">
                  <span>{catalogNotification}</span>
                  <span className="text-[10px] bg-[#00FF88]/20 text-[#00FF88] px-1.5 py-0.5 rounded font-bold uppercase font-mono">Успішно</span>
                </div>
              )}

              {/* Items Catalog Grid */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xs text-gray-400 font-mono tracking-wider uppercase mb-3">ДОСТУПНІ ПРЕДМЕТИ</h3>
                  
                  {/* Category grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Hats Category */}
                    {allHats.filter(h => h.id !== "none").map(hat => {
                      const isOwned = ownedItems.includes(hat.id);
                      // Define mock prices for premium catalog items
                      const price = hat.rarity === "Legendary" ? 500 : hat.rarity === "Epic" ? 150 : hat.rarity === "Rare" ? 50 : 0;
                      
                      return (
                        <div key={hat.id} className="bg-[#12151b] border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-4 hover:border-brand/30 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-3xl border border-white/5">
                              {hat.emoji}
                            </div>
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                              hat.rarity === "Legendary" ? "bg-red-500/10 text-red-400" :
                              hat.rarity === "Epic" ? "bg-purple-500/10 text-purple-400" :
                              hat.rarity === "Rare" ? "bg-blue-500/10 text-blue-400" :
                              "bg-gray-500/10 text-gray-400"
                            }`}>
                              {hat.rarity}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-white">{hat.name}</h4>
                            <p className="text-[10px] text-gray-500">Аксесуар: Головний убір</p>
                          </div>

                          <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-0.5">
                              🪙 {price === 0 ? "Безкоштовно" : `${price} R$`}
                            </span>

                            {isOwned ? (
                              <span className="bg-white/5 text-gray-400 border border-white/10 px-3 py-1.5 rounded text-[10px] font-bold">
                                Куплено ✅
                              </span>
                            ) : (
                              <button
                                onClick={() => buyItem(hat.id, price, hat.name)}
                                className="px-3 py-1.5 bg-brand hover:bg-brand-bright text-black font-bold rounded text-[10px] cursor-pointer transition-all hover:scale-105 active:scale-95"
                              >
                                Придбати 🛒
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Shirts Category */}
                    {allShirts.filter(s => s.id !== "none").map(shirt => {
                      const isOwned = ownedItems.includes(shirt.id);
                      const price = shirt.rarity === "Legendary" ? 400 : shirt.rarity === "Epic" ? 100 : shirt.rarity === "Rare" ? 40 : 0;

                      return (
                        <div key={shirt.id} className="bg-[#12151b] border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-4 hover:border-brand/30 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-3xl border border-white/5">
                              {shirt.emoji}
                            </div>
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                              shirt.rarity === "Legendary" ? "bg-red-500/10 text-red-400" :
                              shirt.rarity === "Epic" ? "bg-purple-500/10 text-purple-400" :
                              shirt.rarity === "Rare" ? "bg-blue-500/10 text-blue-400" :
                              "bg-gray-500/10 text-gray-400"
                            }`}>
                              {shirt.rarity}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-white">{shirt.name}</h4>
                            <p className="text-[10px] text-gray-500">Аксесуар: Верхній одяг</p>
                          </div>

                          <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-0.5">
                              🪙 {price === 0 ? "Безкоштовно" : `${price} R$`}
                            </span>

                            {isOwned ? (
                              <span className="bg-white/5 text-gray-400 border border-white/10 px-3 py-1.5 rounded text-[10px] font-bold">
                                Куплено ✅
                              </span>
                            ) : (
                              <button
                                onClick={() => buyItem(shirt.id, price, shirt.name)}
                                className="px-3 py-1.5 bg-brand hover:bg-brand-bright text-black font-bold rounded text-[10px] cursor-pointer transition-all hover:scale-105 active:scale-95"
                              >
                                Придбати 🛒
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Pants Category */}
                    {allPants.filter(p => p.id !== "none").map(pants => {
                      const isOwned = ownedItems.includes(pants.id);
                      const price = pants.rarity === "Legendary" ? 300 : pants.rarity === "Epic" ? 80 : pants.rarity === "Rare" ? 30 : 0;

                      return (
                        <div key={pants.id} className="bg-[#12151b] border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-4 hover:border-brand/30 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-3xl border border-white/5">
                              {pants.emoji}
                            </div>
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                              pants.rarity === "Legendary" ? "bg-red-500/10 text-red-400" :
                              pants.rarity === "Epic" ? "bg-purple-500/10 text-purple-400" :
                              pants.rarity === "Rare" ? "bg-blue-500/10 text-blue-400" :
                              "bg-gray-500/10 text-gray-400"
                            }`}>
                              {pants.rarity}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-white">{pants.name}</h4>
                            <p className="text-[10px] text-gray-500">Аксесуар: Штани та взуття</p>
                          </div>

                          <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-0.5">
                              🪙 {price === 0 ? "Безкоштовно" : `${price} R$`}
                            </span>

                            {isOwned ? (
                              <span className="bg-white/5 text-gray-400 border border-white/10 px-3 py-1.5 rounded text-[10px] font-bold">
                                Куплено ✅
                              </span>
                            ) : (
                              <button
                                onClick={() => buyItem(pants.id, price, pants.name)}
                                className="px-3 py-1.5 bg-brand hover:bg-brand-bright text-black font-bold rounded text-[10px] cursor-pointer transition-all hover:scale-105 active:scale-95"
                              >
                                Придбати 🛒
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Back Category */}
                    {allBacks.filter(b => b.id !== "none").map(back => {
                      const isOwned = ownedItems.includes(back.id);
                      const price = back.rarity === "Legendary" ? 500 : back.rarity === "Epic" ? 120 : back.rarity === "Rare" ? 50 : 0;

                      return (
                        <div key={back.id} className="bg-[#12151b] border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-4 hover:border-brand/30 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-3xl border border-white/5">
                              {back.emoji}
                            </div>
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                              back.rarity === "Legendary" ? "bg-red-500/10 text-red-400" :
                              back.rarity === "Epic" ? "bg-purple-500/10 text-purple-400" :
                              back.rarity === "Rare" ? "bg-blue-500/10 text-blue-400" :
                              "bg-gray-500/10 text-gray-400"
                            }`}>
                              {back.rarity}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-white">{back.name}</h4>
                            <p className="text-[10px] text-gray-500">Аксесуар: Предмет на спину</p>
                          </div>

                          <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-0.5">
                              🪙 {price === 0 ? "Безкоштовно" : `${price} R$`}
                            </span>

                            {isOwned ? (
                              <span className="bg-white/5 text-gray-400 border border-white/10 px-3 py-1.5 rounded text-[10px] font-bold">
                                Куплено ✅
                              </span>
                            ) : (
                              <button
                                onClick={() => buyItem(back.id, price, back.name)}
                                className="px-3 py-1.5 bg-brand hover:bg-brand-bright text-black font-bold rounded text-[10px] cursor-pointer transition-all hover:scale-105 active:scale-95"
                              >
                                Придбати 🛒
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================== COMMUNITIES TAB ================== */}
          {activeTab === "Communities" && (
            <div className="max-w-4xl space-y-6 animate-fade-in" id="tab-content-communities">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">Спільноти та Клуби (Roblox Communities)</h2>
                  <p className="text-xs text-gray-400 font-sans">Знаходьте клуби розробників, діліться Luau скриптами або створіть власний за 2 Robux!</p>
                </div>
                <button
                  onClick={() => setShowCreateCommunityModal(true)}
                  className="px-4 py-2 bg-brand hover:bg-brand-bright text-black font-bold text-xs rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Створити спільноту (2 R$)</span>
                </button>
              </div>

              {/* Shop Notifications */}
              {catalogNotification && (
                <div className="bg-[#00FF88]/15 border border-[#00FF88]/30 text-white text-xs px-4 py-3 rounded-xl flex items-center justify-between animate-bounce">
                  <span>{catalogNotification}</span>
                  <span className="text-[10px] bg-[#00FF88]/20 text-[#00FF88] px-1.5 py-0.5 rounded font-bold uppercase font-mono">Успішно</span>
                </div>
              )}

              {/* Communities list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communities.map((com) => {
                  const isJoined = joinedCommunities.includes(com.id);

                  return (
                    <div key={com.id} className="bg-[#12151b] border border-white/5 hover:border-brand/20 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all shadow-xl">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-3xl filter drop-shadow">{com.emoji}</span>
                            <h4 className="font-black text-sm text-white">{com.name}</h4>
                          </div>
                          <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded font-mono">
                            {com.membersCount} учасників
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 leading-relaxed min-h-[40px]">{com.description}</p>
                        <div className="text-[9px] text-gray-500 font-mono">Засновник спільноти: <span className="text-[#00FF88] font-bold">{com.creator}</span></div>
                      </div>

                      <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-2">
                        {/* Discussion wall button */}
                        <button
                          onClick={() => setViewingCommunity(com)}
                          className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded transition-all cursor-pointer font-sans"
                        >
                          💬 Стіна обговорень
                        </button>

                        <button
                          onClick={() => handleJoinCommunity(com.id)}
                          className={`px-4 py-2 font-bold text-xs rounded transition-all cursor-pointer font-sans hover:scale-105 active:scale-95 ${
                            isJoined
                              ? "bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20"
                              : "bg-[#00FF88] hover:bg-[#00dd77] text-black"
                          }`}
                        >
                          {isJoined ? "Покинути ❌" : "Приєднатись ✅"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View Community Wall Modal inside launcher layout */}
              {viewingCommunity && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
                  <div className="bg-[#12151b] border border-brand/20 p-6 rounded-2xl max-w-xl w-full shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{viewingCommunity.emoji}</span>
                        <div>
                          <h3 className="font-black text-base text-white">{viewingCommunity.name}</h3>
                          <p className="text-[10px] text-gray-400">Стіна обговорень та Luau коди</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingCommunity(null)}
                        className="w-8 h-8 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full flex items-center justify-center transition-all cursor-pointer text-gray-400 font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Messages Container */}
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto bg-black/20 p-3 rounded-xl border border-white/5">
                      {viewingCommunity.comments.length === 0 ? (
                        <p className="text-xs text-gray-500 italic text-center py-6">На стіні ще немає коментарів. Будьте першим!</p>
                      ) : (
                        viewingCommunity.comments.map((msg: any, idx: number) => (
                          <div key={idx} className="bg-white/2 hover:bg-white/5 p-2.5 rounded-lg space-y-1 border border-white/2">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="font-bold text-[#00FF88]">{msg.sender}</span>
                              <span className="text-gray-500">{msg.time}</span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">{msg.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Post comment form */}
                    <div className="space-y-2">
                      <textarea
                        value={communityComment}
                        onChange={(e) => setCommunityComment(e.target.value)}
                        placeholder="Напишіть коментар або Luau скрипт на стіну спільноти..."
                        rows={2}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand transition-all resize-none font-sans"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => handlePostCommunityComment(e as any, viewingCommunity.id)}
                          className="px-4 py-1.5 bg-brand hover:bg-brand-bright text-black font-black text-xs rounded transition-all cursor-pointer"
                        >
                          Надіслати 🚀
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Create Community Modal */}
              {showCreateCommunityModal && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCreateCommunity(e);
                    }}
                    className="bg-[#12151b] border border-brand/20 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="font-black text-sm uppercase tracking-wider text-brand">Створення спільноти (2 R$)</h3>
                      <button
                        type="button"
                        onClick={() => setShowCreateCommunityModal(false)}
                        className="w-8 h-8 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full flex items-center justify-center transition-all cursor-pointer text-gray-400 font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-gray-400 block font-mono">Назва спільноти</label>
                        <input
                          type="text"
                          required
                          value={newCommunityName}
                          onChange={(e) => setNewCommunityName(e.target.value)}
                          placeholder="Наприклад: Roblox Studio Masters"
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-400 block font-mono">Опис спільноти</label>
                        <textarea
                          value={newCommunityDesc}
                          onChange={(e) => setNewCommunityDesc(e.target.value)}
                          placeholder="Опишіть цілі, правила або концепцію спільноти..."
                          rows={3}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand transition-all resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-gray-400 block font-mono">Емодзі спільноти</label>
                        <select
                          value={newCommunityEmoji}
                          onChange={(e) => setNewCommunityEmoji(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand cursor-pointer"
                        >
                          <option value="👥">👥 Люди / Гравці</option>
                          <option value="💻">💻 Luau Програмісти</option>
                          <option value="🗼">🗼 Спідраннери Tower of Hell</option>
                          <option value="🛠️">🛠️ Конструктори Roblox</option>
                          <option value="🌋">🌋 Виживальники Natural Disaster</option>
                          <option value="✨">✨ Магія / Ексклюзив</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-amber-400/10 border border-amber-400/20 p-3 rounded-lg text-[10px] text-gray-300">
                      Створення спільноти спише **2 Robux** з вашого балансу. Завдяки Прихованому Преміуму платіж пройде миттєво і успішно!
                    </div>

                    <div className="border-t border-white/5 pt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateCommunityModal(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded transition-all cursor-pointer"
                      >
                        Скасувати
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand hover:bg-brand-bright text-black font-black text-xs rounded transition-all cursor-pointer"
                      >
                        Створити 🚀
                      </button>
                    </div>
                  </form>
                </div>
              )}

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

      {/* --- AI GENERATOR STUDIO MODAL --- */}
      {showAISkinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#12151b] border-2 border-amber-500/20 rounded-2xl p-6 shadow-2xl text-white relative animate-fade-in">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowAISkinModal(false);
                setGeneratedSkinSuccess(false);
                setGeneratedSkinError(null);
                setGeneratedClothingSuccess(null);
                setGeneratedClothingError(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full flex items-center justify-center transition-all cursor-pointer text-gray-300 font-bold z-10"
            >
              ✕
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
              <div className="w-10 h-10 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight">AI Roblox Creator Hub 🤖</h3>
                <p className="text-xs text-gray-400">Генеруйте унікальні образи та лімітований UGC одяг за допомогою штучного інтелекту</p>
              </div>
            </div>

            {/* Modal Subtabs */}
            <div className="flex gap-2 border-b border-white/5 py-3">
              <button
                onClick={() => setAiModalTab("skin")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  aiModalTab === "skin"
                    ? "bg-amber-400 text-black font-black border-amber-400"
                    : "bg-white/2 hover:bg-white/5 text-gray-400 border-transparent"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>AI Генератор Скінів 👤</span>
              </button>
              <button
                onClick={() => setAiModalTab("clothing")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  aiModalTab === "clothing"
                    ? "bg-amber-400 text-black font-black border-amber-400"
                    : "bg-white/2 hover:bg-white/5 text-gray-400 border-transparent"
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>AI Дизайнер Одягу (UGC) 🎨</span>
              </button>
            </div>

            {/* TAB CONTENT: SKIN CREATOR */}
            {aiModalTab === "skin" && (
              <form onSubmit={handleGenerateAISkin} className="space-y-4 pt-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Опишіть бажану тему, стиль, фракцію чи характер вашого скіна. AI підбере колір шкіри, вираз обличчя та автоматично одягне вашого персонажа у відповідні аксесуари!
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider block">Опишіть вигляд скіна:</label>
                  <textarea
                    value={aiSkinPrompt}
                    onChange={(e) => setAiSkinPrompt(e.target.value)}
                    placeholder="Наприклад: 'Темний ніндзя кіберпанку з червоними очима, неоновим шоломом та катанами на спині'"
                    className="w-full h-20 bg-[#171a21] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-400 transition-all resize-none"
                    disabled={isGeneratingSkin}
                  />
                </div>

                {generatedSkinSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-3 px-4 rounded-lg">
                    🎉 **Скін успішно згенеровано!** Повністю налаштовано колір шкіри, обличчя та аксесуари. Перевірте 3D-аватар на екрані редактора!
                  </div>
                )}

                {generatedSkinError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-3 px-4 rounded-lg">
                    ⚠️ {generatedSkinError}
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAISkinModal(false);
                      setGeneratedSkinSuccess(false);
                      setGeneratedSkinError(null);
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                  >
                    Закрити
                  </button>
                  <button
                    type="submit"
                    disabled={isGeneratingSkin || !aiSkinPrompt.trim()}
                    className={`px-5 py-2 rounded-lg text-xs font-bold font-sans flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                      isGeneratingSkin 
                        ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 cursor-not-allowed" 
                        : !aiSkinPrompt.trim()
                        ? "bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed"
                        : "bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-500/10"
                    }`}
                  >
                    {isGeneratingSkin ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                        <span>Конструювання скіна...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Згенерувати скін</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: CLOTHING DESIGNER */}
            {aiModalTab === "clothing" && (
              <form onSubmit={handleGenerateAIClothing} className="space-y-4 pt-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Створюйте власні лімітовані речі для Roblox магазину! Опишіть дизайн предмета, і штучний інтелект додасть нову річ до каталогу та вашого гардероба.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider block">Опишіть дизайн вашого UGC предмета:</label>
                  <textarea
                    value={aiClothingPrompt}
                    onChange={(e) => setAiClothingPrompt(e.target.value)}
                    placeholder="Наприклад: 'Магічний вогняний шолом дракона, що палає яскраво-оранжевим світлом'"
                    className="w-full h-20 bg-[#171a21] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-400 transition-all resize-none"
                    disabled={isGeneratingClothing}
                  />
                </div>

                {generatedClothingSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-3 px-4 rounded-lg">
                    🎨 **UGC річ успішно створена!** Предмет додано у вашу колекцію, Магазин Каталогу та Редактор Аватарів. Можете екіпірувати її прямо зараз!
                  </div>
                )}

                {generatedClothingError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-3 px-4 rounded-lg">
                    ⚠️ {generatedClothingError}
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAISkinModal(false);
                      setGeneratedClothingSuccess(null);
                      setGeneratedClothingError(null);
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                  >
                    Закрити
                  </button>
                  <button
                    type="submit"
                    disabled={isGeneratingClothing || !aiClothingPrompt.trim()}
                    className={`px-5 py-2 rounded-lg text-xs font-bold font-sans flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                      isGeneratingClothing 
                        ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 cursor-not-allowed" 
                        : !aiClothingPrompt.trim()
                        ? "bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed"
                        : "bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-500/10"
                    }`}
                  >
                    {isGeneratingClothing ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                        <span>Швейний цех AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Створити предмет одягу</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================== FRIEND/USER PROFILE MODAL ================== */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-[#12151b] border border-brand/30 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-5">
            {/* Header / Top banner */}
            <div className="relative bg-gradient-to-r from-brand/25 to-[#00FF88]/10 p-5 rounded-xl border border-white/5 flex items-center gap-4">
              <div className="w-16 h-16 bg-[#1a1f29] border-2 border-brand rounded-full flex items-center justify-center text-3xl shadow-lg">
                {selectedProfile.avatar}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white">{selectedProfile.name}</h3>
                  <span className="bg-amber-400/20 text-amber-400 border border-amber-400/30 px-1.5 py-0.2 rounded text-[8px] font-mono font-black uppercase">Offline</span>
                </div>
                <p className="text-[10px] text-brand font-mono">ID: {selectedProfile.id}</p>
                <div className="text-[10px] text-gray-400 italic">"{selectedProfile.statusText}"</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full flex items-center justify-center transition-all cursor-pointer text-gray-300 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Profile Bio */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase font-mono block">Про себе (About me)</span>
              <p className="text-xs text-gray-300 leading-relaxed bg-black/40 border border-white/5 p-3 rounded-xl font-sans">
                {selectedProfile.bio || "Цей гравець вирішив залишити свій опис секретним..."}
              </p>
            </div>

            {/* Created Games & Contributions */}
            <div className="space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase font-mono block">Проекти користувача (Created Games)</span>
              <div className="bg-black/20 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-2 hover:border-brand/20 transition-all">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <h4 className="font-bold text-xs text-white">{selectedProfile.createdGame || "My Cool Parkour Obby"}</h4>
                    <span className="text-[9px] text-gray-500 font-mono">Останнє оновлення: 2 дні тому</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProfile(null);
                    setActiveTab("Games");
                    setCatalogNotification(`🎮 Перейдіть у вкладку "Грати в ігри", щоб протестувати проекти спільноти!`);
                    setTimeout(() => setCatalogNotification(null), 4000);
                  }}
                  className="px-3 py-1 bg-[#00FF88] hover:bg-[#00dd77] text-black font-bold text-[10px] rounded transition-all cursor-pointer"
                >
                  Грати 🚀
                </button>
              </div>
            </div>

            {/* Link navigation */}
            <div className="space-y-1.5 border-t border-white/5 pt-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase font-mono block">Посилання у профілі (Profile Link)</span>
              <a 
                href="#profile-url"
                onClick={(e) => {
                  e.preventDefault();
                  setCatalogNotification(`🔗 Ви перейшли за зовнішнім посиланням: ${selectedProfile.url || "https://roblox.com/users/" + selectedProfile.id}`);
                  setTimeout(() => setCatalogNotification(null), 3000);
                }}
                className="text-brand hover:underline text-xs flex items-center gap-1 font-mono cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{selectedProfile.url || `roblox.com/users/${selectedProfile.id}`}</span>
              </a>
            </div>

            {/* Bottom Status text */}
            <p className="text-[9px] text-gray-500 italic text-center font-mono">
              «Зараз гравець не в мережі. Завтра він обов'язково зайде знову!»
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
