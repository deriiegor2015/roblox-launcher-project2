import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RobloxPart, PartShape } from "../types";
import { 
  X, 
  Gamepad2, 
  CornerDownLeft, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ShieldAlert, 
  MessageSquare,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Skull,
  Mic,
  MicOff,
  ShieldCheck,
  Award,
  Lock,
  Compass,
  Globe
} from "lucide-react";

// Custom high-fidelity color correction, contrast, and vignette shader
const StudioColorCorrectionShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    brightness: { value: 0.02 },
    contrast: { value: 1.06 },
    saturation: { value: 1.08 },
    vignetteDarkness: { value: 1.1 },
    vignetteOffset: { value: 1.05 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float brightness;
    uniform float contrast;
    uniform float saturation;
    uniform float vignetteDarkness;
    uniform float vignetteOffset;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // 1. Brightness
      color += brightness;

      // 2. Contrast
      color = (color - 0.5) * contrast + 0.5;

      // 3. Saturation (luminance mapping)
      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luma), color, saturation);

      // 4. Elegant Vignette
      vec2 uv = vUv - 0.5;
      float d = length(uv);
      float vignette = smoothstep(vignetteOffset, vignetteOffset - vignetteDarkness, d);
      color *= mix(1.0, vignette, 0.45); // Smooth 45% vignette

      gl_FragColor = vec4(color, texel.a);
    }
  `
};

interface GameTestModeProps {
  parts: RobloxPart[];
  onLeaveGame: () => void;
  vcVolume?: number;
  onVcVolumeChange?: (val: number) => void;
}

interface ChatMessage {
  id: string;
  sender: "System" | "Server" | "Player" | "Guest_Noob" | "Guest_Builderman" | "Guest_77" | string;
  text: string;
  time: string;
}

interface NPCState {
  id: string;
  name: string;
  color: string;
  role: "Guest_Noob" | "Guest_Builderman" | "Guest_77";
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  mesh?: THREE.Group;
  isGrounded: boolean;
  voiceActive: boolean;
  isVerified: boolean;
  bubbleMesh?: THREE.Sprite;
  voiceIndicatorMesh?: THREE.Mesh | THREE.Group;
  speakingTimer?: any;
}

// Banned words list for Roblox Chat Moderation (Ukrainian + English)
const BANNED_WORDS = [
  "noob", "hack", "admin", "scam", "cheat", "dumb", "idiot", "fools", "loser",
  "дурак", "чітер", "лох", "какашка", "тупий", "придурок", "хак", "адмін", "чити", "сука", "бля", "хер"
];

// Moderation function replacing toxic words with ####
function moderateText(text: string): string {
  let moderated = text;
  BANNED_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b|${word}`, "gi");
    moderated = moderated.replace(regex, "#".repeat(Math.max(3, word.length)));
  });
  return moderated;
}

// Speak voice synthesis out loud with distinctive pitches and rates simulating real voice chat
function speakNPCMessage(role: string, text: string, volumePercentage: number = 80) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancel any currently speaking utterance to keep it snappy and responsive
  window.speechSynthesis.cancel();

  // Strip emojis from reading
  const cleanText = text.replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, "");
  if (!cleanText.trim()) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  const voices = window.speechSynthesis.getVoices();
  // Prefer Ukrainian, fall back to Slavic accents, then English/default
  const ukVoice = voices.find(v => v.lang.startsWith("uk") || v.lang.startsWith("UA"));
  const ruVoice = voices.find(v => v.lang.startsWith("ru") || v.lang.startsWith("RU"));
  
  if (ukVoice) {
    utterance.voice = ukVoice;
  } else if (ruVoice) {
    utterance.voice = ruVoice;
  }

  const volRatio = volumePercentage / 100;

  // Assign distinct pitches & rates based on character persona
  if (role === "Guest_Noob") {
    utterance.pitch = 1.6; // High pitch kid voice
    utterance.rate = 1.15;
    utterance.volume = 0.95 * volRatio;
  } else if (role === "Guest_77") {
    utterance.pitch = 1.05; // Teen voice
    utterance.rate = 0.95;
    utterance.volume = 0.9 * volRatio;
  } else if (role === "Guest_Builderman") {
    utterance.pitch = 0.7; // Deep/mature programmer voice
    utterance.rate = 0.85;
    utterance.volume = 1.0 * volRatio;
  } else if (role === "Player") {
    utterance.pitch = 1.25; // Energetic player voice
    utterance.rate = 1.05;
    utterance.volume = 0.95 * volRatio;
  }

  window.speechSynthesis.speak(utterance);
}

// Create Canvas-based elegant billboard 3D text speech bubble
function createSpeechBubbleTexture(text: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 512, 128);

  // Rounded rectangle path for the bubble
  ctx.fillStyle = "rgba(10, 15, 25, 0.92)";
  ctx.strokeStyle = "#00FF88";
  ctx.lineWidth = 4;
  
  const r = 16;
  const x = 10, y = 10, w = 492, h = 85;
  
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  
  // Downward pointer tail
  ctx.lineTo(256 + 15, y + h);
  ctx.lineTo(256, y + h + 18);
  ctx.lineTo(256 - 15, y + h);
  
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White text styling
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Wrap text lines
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  const maxWidth = 450;
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // Render text lines centered in the bubble
  if (lines.length === 1) {
    ctx.fillText(lines[0].trim(), 256, 52);
  } else {
    ctx.fillText(lines[0].trim(), 256, 36);
    ctx.fillText(lines[1].trim(), 256, 68);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export default function GameTestMode({ parts, onLeaveGame, vcVolume = 80, onVcVolumeChange }: GameTestModeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States for stats and metrics
  const [coins, setCoins] = useState<number>(0);
  const [deaths, setDeaths] = useState<number>(0);
  const [health, setHealth] = useState<number>(100);
  const [spawnLocation, setSpawnLocation] = useState<[number, number, number]>([0, 5, 0]);

  // UI state toggles
  const [isEscMenuOpen, setIsEscMenuOpen] = useState<boolean>(false);
  const [escTab, setEscTab] = useState<"Game" | "Settings" | "Players">("Game");
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState<boolean>(false);
  const [isChatFocused, setIsChatFocused] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "System",
      text: "Вітаємо у віртуальному Roblox Sandbox! Керування: WASD - рух, SPACE - Стрибок.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    },
    {
      id: "welcome-2",
      sender: "System",
      text: "Крутіть КОЛЕСО МИШКИ для наближення/віддалення (від 1-ї до 3-ї особи). Перетягуйте мишкою по екрану для обертання камери!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  ]);
  // Shaders (EffectComposer) state and ref
  const [cinematicMode, setCinematicModeState] = useState<boolean>(true);
  const cinematicModeRef = useRef<boolean>(true);
  const composerRef = useRef<EffectComposer | null>(null);

  const setCinematicMode = (val: boolean) => {
    cinematicModeRef.current = val;
    setCinematicModeState(val);
  };

  // Stateful chat indexes for each NPC to ensure non-repetitive dialogue progression
  const npcChatIndexRef = useRef<Record<string, number>>({
    Guest_Noob: 0,
    Guest_77: 0,
    Guest_Builderman: 0
  });

  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [oofAnimationActive, setOofAnimationActive] = useState<boolean>(false);
  const [currentCheckpointName, setCurrentCheckpointName] = useState<string>("Початковий спавн");

  // Voice Chat active states
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [voiceVisualizerLevels, setVoiceVisualizerLevels] = useState<number[]>([2, 5, 3, 8, 4, 1, 6, 2]);

  // Load saved avatar config from local storage
  const avatarConfig = (() => {
    try {
      const saved = localStorage.getItem("roblox_user_avatar");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
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
  })();

  // Is Player Verified? (Checked from local storage)
  const isVerifiedDev = (() => {
    return localStorage.getItem("roblox_persona_verified") === "true" || localStorage.getItem("roblox_skip_verification") === "true";
  })();

  // Keyboard and mouse look state tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  
  // Camera angles (orbital relative to player)
  const cameraDistance = useRef<number>(15); // Zoom level. 0 means first person!
  const theta = useRef<number>(Math.PI); // Horizontal orbit angle
  const phi = useRef<number>(Math.PI / 4); // Vertical orbit angle
  const isMouseDown = useRef<boolean>(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // ThreeJS References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const playerBubbleMesh = useRef<THREE.Sprite | undefined>(undefined);
  const playerVoiceIndicatorMesh = useRef<THREE.Mesh | THREE.Group | undefined>(undefined);
  const playerSpeakingTimer = useRef<any>(null);

  // Character physical state
  const playerPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 5, 0));
  const playerVel = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isGrounded = useRef<boolean>(false);
  const characterRotation = useRef<number>(0);

  // Multi-player Guests simulated states
  const npcsRef = useRef<NPCState[]>([
    { id: "npc-1", name: "Classic_Noob 👤", color: "#ffd54f", role: "Guest_Noob", position: new THREE.Vector3(5, 2, -5), velocity: new THREE.Vector3(0, 0, 0), direction: new THREE.Vector3(1, 0, 0), isGrounded: false, voiceActive: false, isVerified: false },
    { id: "npc-2", name: "Guest_77 🧢", color: "#3f51b5", role: "Guest_77", position: new THREE.Vector3(-8, 2, -10), velocity: new THREE.Vector3(0, 0, 0), direction: new THREE.Vector3(0, 0, 1), isGrounded: false, voiceActive: false, isVerified: false },
    { id: "npc-3", name: "Builderman_CEO 🛠️", color: "#ff9800", role: "Guest_Builderman", position: new THREE.Vector3(10, 2, 5), velocity: new THREE.Vector3(0, 0, 0), direction: new THREE.Vector3(-1, 0, 0), isGrounded: false, voiceActive: true, isVerified: true }
  ]);

  // Game assets references for collision
  const physicsItemsRef = useRef<Array<{
    id: string;
    mesh: THREE.Object3D;
    part: RobloxPart;
  }>>([]);

  const isDying = useRef<boolean>(false);

  // Find initial spawn point among workspace parts
  useEffect(() => {
    const spawnPart = parts.find(p => p.specialType === "spawn");
    if (spawnPart) {
      const pos: [number, number, number] = [
        spawnPart.position[0],
        spawnPart.position[1] + spawnPart.size[1] / 2 + 1.5,
        spawnPart.position[2]
      ];
      setSpawnLocation(pos);
      playerPos.current.set(pos[0], pos[1], pos[2]);
    } else {
      playerPos.current.set(0, 5, 0);
    }
  }, [parts]);

  // Handle ESC key listener for Esc-Leave-Leave workflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        if (showLeaveConfirmation) {
          setShowLeaveConfirmation(false);
        } else {
          setIsEscMenuOpen(prev => !prev);
          setIsChatFocused(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showLeaveConfirmation]);

  // Advanced Voice Chat with real microphone analyzer & interactive NPC responses
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    let animationId: number;
    let fallbackInterval: any;

    if (isVoiceActive) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            micStreamRef.current = stream;
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const audioCtx = new AudioCtx();
              audioContextRef.current = audioCtx;
              const source = audioCtx.createMediaStreamSource(stream);
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 64; // Small fft for 8 bars
              source.connect(analyser);
              analyserRef.current = analyser;
              
              const bufferLength = analyser.frequencyBinCount;
              const dataArray = new Uint8Array(bufferLength);
              dataArrayRef.current = dataArray;

              let speakTriggerCounter = 0;
              let isPlayerSpeaking = false;

              const updateVoiceData = () => {
                if (!analyserRef.current || !dataArrayRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                
                // Map the FFT bin data to 8 visualizer bars
                const levels: number[] = [];
                let totalAmp = 0;
                for (let i = 0; i < 8; i++) {
                  const binIndex = Math.floor((i / 8) * bufferLength);
                  const val = dataArrayRef.current[binIndex] || 0;
                  // Map 0-255 to 1-12
                  levels.push(Math.max(1, Math.floor((val / 255) * 12)));
                  totalAmp += val;
                }
                setVoiceVisualizerLevels(levels);

                // Detect if player is actually speaking (average amplitude above threshold)
                const avgAmp = totalAmp / 8;
                if (avgAmp > 20) { // Threshold for speech
                  speakTriggerCounter++;
                  // Glow player 3D VC indicator extra when active speaking is detected
                  if (playerVoiceIndicatorMesh.current) {
                    playerVoiceIndicatorMesh.current.scale.set(1.4, 1.4, 1.4);
                  }
                  if (speakTriggerCounter > 15 && !isPlayerSpeaking) {
                    isPlayerSpeaking = true;
                  }
                } else {
                  if (isPlayerSpeaking) {
                    // Player finished speaking! Let's trigger a realistic NPC speech response!
                    isPlayerSpeaking = false;
                    speakTriggerCounter = 0;
                    
                    setTimeout(() => {
                      const npcList = ["Guest_Noob", "Guest_Builderman", "Guest_77"];
                      const randomRole = npcList[Math.floor(Math.random() * npcList.length)];
                      
                      const npcReplies: Record<string, string[]> = {
                        Guest_Noob: [
                          "Ого, привіт! Твій мікрофон звучить дуже круто! 🎤",
                          "Я тебе чую! Давай грати разом на цьому сервері! 🤠",
                          "Твій голос такий чіткий! Мені подобається твоє налаштування!",
                          "Привіт! Я люблю паркурити під твою мову!"
                        ],
                        Guest_77: [
                          "Йоу, друже! Твій голос звучить мега чисто.",
                          "Привіт! Гарний мікрофон у тебе! 🎧",
                          "О, привіт! Реальний голосовий чат працює на повну!",
                          "Я чую твій мікрофон, звук супер!"
                        ],
                        Guest_Builderman: [
                          "Вітаю! Дякую, що тестуєш голосовий чат.",
                          "Чудово, мікрофон працює з дуже низькою затримкою!",
                          "Сигнал отримано! Твій голос передається відмінно у Roblox Launcher.",
                          "Класний спіч! Розробка голосового чату завершена успішно."
                        ]
                      };

                      const replies = npcReplies[randomRole];
                      const randomText = replies[Math.floor(Math.random() * replies.length)];
                      addChatMessage(randomRole as any, randomText);
                    }, 1000);
                  }
                  speakTriggerCounter = Math.max(0, speakTriggerCounter - 1);
                }

                animationId = requestAnimationFrame(updateVoiceData);
              };

              updateVoiceData();
            }
          })
          .catch(err => {
            console.warn("Could not access microphone, using simulated voice levels", err);
            // Fallback to simulated
            fallbackInterval = setInterval(() => {
              setVoiceVisualizerLevels(Array.from({ length: 8 }, () => Math.floor(Math.random() * 10) + 1));
            }, 100);
          });
      } else {
        // Fallback to simulated
        fallbackInterval = setInterval(() => {
          setVoiceVisualizerLevels(Array.from({ length: 8 }, () => Math.floor(Math.random() * 10) + 1));
        }, 100);
      }
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
        audioContextRef.current = null;
      }
    };
  }, [isVoiceActive]);

  // Simulated Voice triggers & NPC messages
  useEffect(() => {
    // Defined chat stages for each NPC
    const npcDialogues: Record<string, string[]> = {
      Guest_Noob: [
        "Всім привіт! Я перший раз на цій карті, виглядає круто! 🗺️",
        "Ой, я впав з лави! Ця червона лава гаряча! 🌋",
        "Хтось знає, як пройти через ті обертові циліндри? Чутливість миші занадто висока!",
        "Я нарешті зрозумів, треба просто тримати Shift або бігти без зупинки!",
        "УРААА! Я закінчив цей оббі! Я більше не нуб! 🏆", // This is index 4, meaning completed!
        "Тепер я про-гравець! Хто хоче навчу проходити швидше?",
        "Граю під кінематографічну музику, атмосфера просто космос!",
        "А ви пробували будувати свої карти у Studio? Хмари синхронізуються миттєво!"
      ],
      Guest_77: [
        "Йоу! Налаштував аватар, тепер я готовий до справжнього паркуру.",
        "Зібрав першу золоту монетку! Хто більше? 🪙",
        "Ці хмари виглядають неймовірно з увімкненими шейдерами ✨",
        "Хлопці, активуйте код /freecoins в чаті, це реально дає монети!",
        "ЄЄЄ! Я закінчив проходження карти і зібрав купу монет! 😎", // This is index 4, meaning completed!
        "Пробую ставити нові рекорди швидкості. Хто за мною?",
        "Цей сервер такий живий, обожнюю ком'юніті.",
        "Опублікував свій проєкт у Roblox Cloud! Зацініть у вкладці меню."
      ],
      Guest_Builderman: [
        "Вітаю колеги! Дизайн цієї арени дійсно відповідає стандартам Roblox Studio.",
        "Слухайте, я перевірив фізику стрибків - таймінги ідеально збалансовані.",
        "Хто хоче протестувати голосовий чат? Просто затисніть іконку мікрофона на HUD!",
        "Я майже дійшов до фінального чекпоінту. Напруга зростає!",
        "Чудово! Проект повністю завершено та протестовано. Фінішна лінія пройдена успішно. 🛠️", // This is index 4, meaning completed!
        "Розробка цього паркуру зайняла певний час, але результат вартий зусиль.",
        "Тепер я працюю над новою скриптовою механікою. Буде гаряче!",
        "Не забувайте зберігати свої світи у хмару Roblox Cloud."
      ]
    };

    const globalSenders = [
      "[Global] SkyLord",
      "[Global] ObbyQueen",
      "[Global] DevWizard",
      "[Global] LuaGod",
      "[Global] RobloxFan",
      "[Global] XenonCoder"
    ];

    const globalMessages = [
      "Хтось уже грав у новий оббі? Там круті шейдери з блумом! ✨",
      "Привіт з іншого сервера! Тут розробники тестують збереження в хмару Roblox Cloud 🌐",
      "Створив паркур на 50 рівнів, Roblox Cloud реально рятує проєкти!",
      "У когось працює голосовий мікрофон? Це фіча просто бомба! 🎤",
      "Спробуйте написати команди /speed або /gravity в чат, це весело 😂",
      "Гей, розробники! Новий інструмент ШІ-асистента в Studio допомагає писати скрипти за секунди.",
      "Всі зберегли свої карти в хмару? Сьогодні велике оновлення!",
      "Вау, у Studio тепер можна вмикати кінематографічні шейдери однією кнопкою!"
    ];

    const chatInterval = setInterval(() => {
      // 30% chance to trigger a Global Chat message instead of an NPC local message!
      if (Math.random() < 0.35) {
        const randomSender = globalSenders[Math.floor(Math.random() * globalSenders.length)];
        const randomMsg = globalMessages[Math.floor(Math.random() * globalMessages.length)];
        addChatMessage(randomSender, randomMsg);
        return;
      }

      // Choose a random NPC
      const npcList: ("Guest_Noob" | "Guest_Builderman" | "Guest_77")[] = ["Guest_Noob", "Guest_Builderman", "Guest_77"];
      const randomRole = npcList[Math.floor(Math.random() * npcList.length)];
      const npc = npcsRef.current.find(n => n.role === randomRole);
      
      if (npc) {
        // Get dialogue list and current index
        const dialogues = npcDialogues[npc.role] || [];
        let currentIndex = npcChatIndexRef.current[npc.role] || 0;

        let rawText = dialogues[currentIndex % dialogues.length];

        // If the NPC has reached index 4, they have "finished"!
        if (currentIndex === 4) {
          playSynthSound("checkpoint");
          // Add system note
          addChatMessage("Server", `🎉 Гравець ${npc.name.split(" ")[0]} пройшов всю карту до фінішу!`);
        }

        let safeText = moderateText(rawText);

        // Advance index
        npcChatIndexRef.current[npc.role] = currentIndex + 1;

        npc.voiceActive = Math.random() > 0.4;
        addChatMessage(npc.role, safeText);
      }
    }, 8000);

    return () => clearInterval(chatInterval);
  }, []);

  // Audio simulation synth helper (Oof sound, coin chimes, jump pops, voice static beeps)
  const playSynthSound = (type: "oof" | "coin" | "jump" | "bounce" | "checkpoint" | "beep") => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "coin") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.08); // E6
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === "oof") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(130, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === "jump") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === "bounce") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(320, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === "checkpoint") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } else if (type === "beep") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      }
    } catch (e) {
      console.warn("AudioContext failed", e);
    }
  };

  // Respawns character
  const triggerRespawn = (diedOfLava: boolean = true) => {
    if (isDying.current) return;
    isDying.current = true;
    
    setOofAnimationActive(true);
    playSynthSound("oof");
    setDeaths(prev => prev + 1);
    setHealth(0);

    addChatMessage(
      "Server", 
      diedOfLava 
        ? "💥 Гравець наступив на небезпечний блок та розпався на детальки!" 
        : "💥 Гравець полетів у чорну діру (Void)!"
    );

    setTimeout(() => {
      playerPos.current.set(spawnLocation[0], spawnLocation[1] + 2, spawnLocation[2]);
      playerVel.current.set(0, 0, 0);
      setHealth(100);
      setOofAnimationActive(false);
      isDying.current = false;
    }, 1200);
  };

  // Chat logger helper
  const addChatMessage = (sender: ChatMessage["sender"], text: string) => {
    const newMessage: ChatMessage = {
      id: `chat-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setChatMessages(prev => [...prev.slice(-40), newMessage]);

    // Real voice chat and floating 3D speech bubble integration
    if (sender === "Guest_Noob" || sender === "Guest_77" || sender === "Guest_Builderman") {
      const npc = npcsRef.current.find(n => n.role === sender);
      if (npc && npc.mesh) {
        if (soundEnabled) {
          speakNPCMessage(sender, text, vcVolume);
        }
        
        npc.voiceActive = true;

        if (npc.bubbleMesh) {
          npc.mesh.remove(npc.bubbleMesh);
          npc.bubbleMesh.material.dispose();
          npc.bubbleMesh = undefined;
        }
        if (npc.voiceIndicatorMesh) {
          npc.mesh.remove(npc.voiceIndicatorMesh);
          npc.voiceIndicatorMesh = undefined;
        }

        // Floating speech bubble billboard
        const bubbleTex = createSpeechBubbleTexture(text);
        if (bubbleTex) {
          const spriteMat = new THREE.SpriteMaterial({ map: bubbleTex, transparent: true });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.position.set(0, 4.8, 0);
          sprite.scale.set(4.5, 1.25, 1);
          npc.mesh.add(sprite);
          npc.bubbleMesh = sprite;
        }

        // Floating mic and orbital ring indicator
        const indicatorGroup = new THREE.Group();
        indicatorGroup.position.set(0, 3.8, 0);

        const micGeo = new THREE.SphereGeometry(0.18, 8, 8);
        const micMat = new THREE.MeshBasicMaterial({ color: "#00FF88" });
        const micMesh = new THREE.Mesh(micGeo, micMat);
        indicatorGroup.add(micMesh);

        const ringGeo = new THREE.RingGeometry(0.25, 0.28, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: "#00FF88", side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        indicatorGroup.add(ringMesh);

        npc.mesh.add(indicatorGroup);
        npc.voiceIndicatorMesh = indicatorGroup;

        if (npc.speakingTimer) clearTimeout(npc.speakingTimer);
        npc.speakingTimer = setTimeout(() => {
          npc.voiceActive = false;
          if (npc.mesh) {
            if (npc.bubbleMesh) {
              npc.mesh.remove(npc.bubbleMesh);
              npc.bubbleMesh.material.dispose();
              npc.bubbleMesh = undefined;
            }
            if (npc.voiceIndicatorMesh) {
              npc.mesh.remove(npc.voiceIndicatorMesh);
              npc.voiceIndicatorMesh = undefined;
            }
          }
        }, 4500);
      }
    } else if (sender === "Player") {
      if (playerGroupRef.current) {
        if (soundEnabled) {
          speakNPCMessage("Player", text, vcVolume);
        }

        setIsVoiceActive(true);

        if (playerBubbleMesh.current) {
          playerGroupRef.current.remove(playerBubbleMesh.current);
          playerBubbleMesh.current.material.dispose();
          playerBubbleMesh.current = undefined;
        }
        if (playerVoiceIndicatorMesh.current) {
          playerGroupRef.current.remove(playerVoiceIndicatorMesh.current);
          playerVoiceIndicatorMesh.current = undefined;
        }

        // Floating speech bubble billboard for player
        const bubbleTex = createSpeechBubbleTexture(text);
        if (bubbleTex) {
          const spriteMat = new THREE.SpriteMaterial({ map: bubbleTex, transparent: true });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.position.set(0, 4.8, 0);
          sprite.scale.set(4.5, 1.25, 1);
          playerGroupRef.current.add(sprite);
          playerBubbleMesh.current = sprite;
        }

        // Floating mic and ring for player
        const indicatorGroup = new THREE.Group();
        indicatorGroup.position.set(0, 3.8, 0);

        const micGeo = new THREE.SphereGeometry(0.18, 8, 8);
        const micMat = new THREE.MeshBasicMaterial({ color: "#00FF88" });
        const micMesh = new THREE.Mesh(micGeo, micMat);
        indicatorGroup.add(micMesh);

        const ringGeo = new THREE.RingGeometry(0.25, 0.28, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: "#00FF88", side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        indicatorGroup.add(ringMesh);

        playerGroupRef.current.add(indicatorGroup);
        playerVoiceIndicatorMesh.current = indicatorGroup;

        if (playerSpeakingTimer.current) clearTimeout(playerSpeakingTimer.current);
        playerSpeakingTimer.current = setTimeout(() => {
          setIsVoiceActive(false);
          if (playerGroupRef.current) {
            if (playerBubbleMesh.current) {
              playerGroupRef.current.remove(playerBubbleMesh.current);
              playerBubbleMesh.current.material.dispose();
              playerBubbleMesh.current = undefined;
            }
            if (playerVoiceIndicatorMesh.current) {
              playerGroupRef.current.remove(playerVoiceIndicatorMesh.current);
              playerVoiceIndicatorMesh.current = undefined;
            }
          }
        }, 4500);
      }
    }
  };

  // Process user custom chat messages and special easter eggs commands
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    // Moderation check on input before rendering
    const rawInput = chatInput.trim();
    const moderatedInput = moderateText(rawInput);
    
    addChatMessage("Player", moderatedInput);
    setChatInput("");
    setIsChatFocused(false);

    // Command Parser
    if (rawInput.startsWith("/")) {
      const lowerCmd = rawInput.toLowerCase();
      if (lowerCmd.startsWith("/speed")) {
        const parts = lowerCmd.split(" ");
        const multiplier = parts[1] ? parseFloat(parts[1]) : 2;
        if (!isNaN(multiplier) && multiplier > 0 && multiplier <= 5) {
          setSpeedMultiplier(multiplier);
          addChatMessage("System", `⚡ Швидкість змінено. Мультиплікатор: x${multiplier}`);
        } else {
          addChatMessage("System", "❌ Швидкість має бути числом від 0.1 до 5. Приклад: /speed 2.5");
        }
      } 
      else if (lowerCmd === "/reset") {
        triggerRespawn(false);
        addChatMessage("System", "🔄 Персонажа скинуто за запитом.");
      } 
      else if (lowerCmd === "/gravity") {
        addChatMessage("System", "🌕 Активовано надстрибки!");
        playerVel.current.y += 20;
      } 
      else if (lowerCmd === "/admin" || lowerCmd === "/freecoins") {
        setCoins(prev => prev + 100);
        addChatMessage("System", "🎉 Код активовано! +100 монет 🪙.");
        playSynthSound("checkpoint");
      }
      else if (lowerCmd === "/leave") {
        onLeaveGame();
      }
      else if (lowerCmd === "/help") {
        addChatMessage("System", "Доступні чіт-коди: /speed <коефіцієнт>, /reset, /gravity, /freecoins");
      }
      else {
        addChatMessage("System", "❓ Невідома команда. Напишіть /help для списку.");
      }
    } else {
      // Smart response
      setTimeout(() => {
        const responses = [
          "Хаха, круто сказано!",
          "Давай пройдемо це разом!",
          "Хто вміє літати в першій особі?",
          "Вау, у тебе є синій бейдж верифікації!",
          "Крута фізика, блоки відмінно взаємодіють!",
          "Хтось розмовляє у Voice Chat? 🟢"
        ];
        const randomResp = moderateText(responses[Math.floor(Math.random() * responses.length)]);
        
        // Choose random guest NPC
        const roles: ChatMessage["sender"][] = ["Guest_Noob", "Guest_77", "Guest_Builderman"];
        addChatMessage(roles[Math.floor(Math.random() * roles.length)], randomResp);
      }, 1500);
    }
  };

  // Helper function to build blocky NPC meshes
  const createBlockyNPC = (scene: THREE.Scene, npc: NPCState) => {
    const npcGroup = new THREE.Group();
    
    // Standard blocky character meshes
    const skinMat = new THREE.MeshStandardMaterial({ color: npc.color, roughness: 0.6 });
    const torsoMat = new THREE.MeshStandardMaterial({ 
      color: npc.role === "Guest_Noob" ? "#2196f3" : npc.role === "Guest_Builderman" ? "#e65100" : "#d32f2f", 
      roughness: 0.4 
    });
    const legsMat = new THREE.MeshStandardMaterial({ 
      color: npc.role === "Guest_Noob" ? "#4caf50" : npc.role === "Guest_Builderman" ? "#263238" : "#1976d2", 
      roughness: 0.5 
    });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 0.8), torsoMat);
    torso.position.y = 1.0;
    torso.castShadow = true;
    npcGroup.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), skinMat);
    head.position.y = 2.5;
    head.castShadow = true;
    npcGroup.add(head);

    // Eyes
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
    eyeL.position.set(-0.25, 2.6, 0.51);
    npcGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
    eyeR.position.set(0.25, 2.6, 0.51);
    npcGroup.add(eyeR);

    // Smiley face
    const smile = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
    smile.position.set(0, 2.35, 0.51);
    npcGroup.add(smile);

    // Orange Builderman hat
    if (npc.role === "Guest_Builderman") {
      const helmet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), new THREE.MeshStandardMaterial({ color: "#ff9800" }));
      helmet.position.set(0, 3.1, 0);
      npcGroup.add(helmet);
      const brim = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 1.4), new THREE.MeshStandardMaterial({ color: "#ff9800" }));
      brim.position.set(0, 2.95, 0.1);
      npcGroup.add(brim);
    } else if (npc.role === "Guest_77") {
      // Blue cap
      const visor = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: "#3f51b5" }));
      visor.position.set(0, 3.0, 0.4);
      npcGroup.add(visor);
      const dome = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 1.1), new THREE.MeshStandardMaterial({ color: "#3f51b5" }));
      dome.position.set(0, 3.2, 0);
      npcGroup.add(dome);
    }

    // Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.0, 0.7), torsoMat);
    armL.position.set(-1.15, 1.0, 0);
    npcGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.0, 0.7), torsoMat);
    armR.position.set(1.15, 1.0, 0);
    npcGroup.add(armR);

    // Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.0, 0.75), legsMat);
    legL.position.set(-0.425, -1.0, 0);
    npcGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.0, 0.75), legsMat);
    legR.position.set(0.425, -1.0, 0);
    npcGroup.add(legR);

    // Raise meshes
    npcGroup.children.forEach(child => {
      child.position.y += 1.0;
    });

    npcGroup.position.copy(npc.position);
    scene.add(npcGroup);
    npc.mesh = npcGroup;
  };

  // Main 3D Engine Initialization Loop
  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    // 1. Create Scene & Atmospheric properties
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0d131a"); // Beautiful celestial twilight glow
    scene.fog = new THREE.FogExp2("#0d131a", 0.007);
    sceneRef.current = scene;

    // 2. Create camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Create post-processing EffectComposer pipeline
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;

    // Render Pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Unreal Bloom Pass (subtle futuristic neon glow)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.35,  // strength
      0.4,   // radius
      0.15   // threshold
    );
    composer.addPass(bloomPass);

    // Studio Color Correction & Vignette Shader Pass
    const colorPass = new ShaderPass(StudioColorCorrectionShader);
    composer.addPass(colorPass);

    // Output Pass
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // 4. Lights Setup
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#fff4e8", 1.3);
    sunLight.position.set(40, 80, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 250;
    const d = 80;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight("#b1d3ff", "#29323d", 0.4);
    scene.add(hemiLight);

    // 5. Ground Baseplate Plane
    const baseplateGeo = new THREE.BoxGeometry(250, 2, 250);
    const baseplateMat = new THREE.MeshStandardMaterial({
      color: "#21252d",
      roughness: 0.85,
      metalness: 0.1,
    });
    const baseplate = new THREE.Mesh(baseplateGeo, baseplateMat);
    baseplate.position.set(0, -1, 0); // Top surface is at Y = 0
    baseplate.receiveShadow = true;
    baseplate.name = "Baseplate";
    scene.add(baseplate);

    const gridHelper = new THREE.GridHelper(250, 100, "#424b5a", "#1a1f26");
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);

    // Spawning 3 multiplayer guests in the 3D space
    npcsRef.current.forEach(npc => {
      createBlockyNPC(scene, npc);
    });

    // 6. Spawn the Roblox Character (R6 style Blocky character!)
    const playerGroup = new THREE.Group();
    playerGroupRef.current = playerGroup;
    scene.add(playerGroup);

    const skinColor = avatarConfig.skinTone || "#FFD13B";
    let shirtColorHex = "#2196f3";
    if (avatarConfig.shirt === "none") shirtColorHex = skinColor;
    else if (avatarConfig.shirt === "roblox-hoodie") shirtColorHex = "#262626";
    else if (avatarConfig.shirt === "tuxedo") shirtColorHex = "#111111";
    else if (avatarConfig.shirt === "superhero") shirtColorHex = "#1565C0";
    else if (avatarConfig.shirt === "neon-tech") shirtColorHex = "#060D1A";
    else if (avatarConfig.shirt === "armor") shirtColorHex = "#78909C";

    let pantsColorHex = "#2c3e50";
    if (avatarConfig.pants === "none") pantsColorHex = skinColor;
    else if (avatarConfig.pants === "jeans") pantsColorHex = "#1976D2";
    else if (avatarConfig.pants === "cargo") pantsColorHex = "#388E3C";
    else if (avatarConfig.pants === "cyber-legs") pantsColorHex = "#1A237E";
    else if (avatarConfig.pants === "rainbow") pantsColorHex = "#9c27b0";
    else if (avatarConfig.pants === "gold-knight") pantsColorHex = "#F57F17";

    const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColorHex, roughness: 0.4 });
    const armMat = torsoMat;
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColorHex, roughness: 0.5 });
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 0.8), torsoMat);
    torso.position.y = 1.0;
    torso.castShadow = true;
    torso.receiveShadow = true;
    playerGroup.add(torso);

    // Roblox logo badge on shirt
    if (avatarConfig.shirt === "roblox-hoodie") {
      const logoMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.7, 0.05),
        new THREE.MeshBasicMaterial({ color: "#ffffff" })
      );
      logoMesh.position.set(0, 1.15, 0.41);
      playerGroup.add(logoMesh);
    } else if (avatarConfig.shirt === "superhero") {
      const starMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.05),
        new THREE.MeshBasicMaterial({ color: "#ffd700" })
      );
      starMesh.position.set(0, 1.15, 0.41);
      playerGroup.add(starMesh);
    }

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), skinMat);
    head.position.y = 2.5;
    head.castShadow = true;
    playerGroup.add(head);

    // Smiley face details
    if (avatarConfig.face === "beast-mode") {
      const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.1), new THREE.MeshBasicMaterial({ color: "#ff0000" }));
      eyeL.position.set(-0.25, 2.6, 0.51);
      playerGroup.add(eyeL);

      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.1), new THREE.MeshBasicMaterial({ color: "#ff0000" }));
      eyeR.position.set(0.25, 2.6, 0.51);
      playerGroup.add(eyeR);

      const redSmile = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.1), new THREE.MeshBasicMaterial({ color: "#ff0000" }));
      redSmile.position.set(0, 2.32, 0.51);
      playerGroup.add(redSmile);
    } else if (avatarConfig.face === "chill") {
      // Sunglasses
      const sunglasses = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 0.12), new THREE.MeshBasicMaterial({ color: "#1a1a1a" }));
      sunglasses.position.set(0, 2.6, 0.51);
      playerGroup.add(sunglasses);

      const smile = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
      smile.position.set(0.1, 2.35, 0.51);
      playerGroup.add(smile);
    } else if (avatarConfig.face === "winning-smile") {
      const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
      eyeL.position.set(-0.25, 2.6, 0.51);
      playerGroup.add(eyeL);

      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
      eyeR.position.set(0.25, 2.6, 0.51);
      playerGroup.add(eyeR);

      // White smiley mouth
      const bigSmile = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.25, 0.08), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
      bigSmile.position.set(0, 2.32, 0.51);
      playerGroup.add(bigSmile);
    } else if (avatarConfig.face === "man-face") {
      const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
      eyeL.position.set(-0.25, 2.58, 0.51);
      playerGroup.add(eyeL);

      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
      eyeR.position.set(0.25, 2.58, 0.51);
      playerGroup.add(eyeR);

      // Eyebrows
      const eyebrowL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
      eyebrowL.position.set(-0.25, 2.7, 0.51);
      eyebrowL.rotation.z = -0.15;
      playerGroup.add(eyebrowL);

      const eyebrowR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
      eyebrowR.position.set(0.25, 2.7, 0.51);
      eyebrowR.rotation.z = 0.25;
      playerGroup.add(eyebrowR);

      const smile = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
      smile.position.set(0.1, 2.36, 0.51);
      playerGroup.add(smile);
    } else {
      const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
      eyeL.position.set(-0.25, 2.6, 0.51);
      playerGroup.add(eyeL);

      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
      eyeR.position.set(0.25, 2.6, 0.51);
      playerGroup.add(eyeR);

      const smile = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.1), new THREE.MeshBasicMaterial({ color: "#000000" }));
      smile.position.set(0, 2.35, 0.51);
      playerGroup.add(smile);
    }

    // Hats Configuration
    if (avatarConfig.hat === "classic-cap") {
      const capVisor = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: "#e91e63" }));
      capVisor.position.set(0, 3.0, 0.45);
      playerGroup.add(capVisor);

      const capDome = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 1.1), new THREE.MeshStandardMaterial({ color: "#00ff88" }));
      capDome.position.set(0, 3.2, 0);
      playerGroup.add(capDome);
    } else if (avatarConfig.hat === "fedora") {
      const brim = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.5), new THREE.MeshStandardMaterial({ color: "#1f1f1f" }));
      brim.position.set(0, 3.0, 0);
      playerGroup.add(brim);

      const fedoraCrown = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 1.0), new THREE.MeshStandardMaterial({ color: "#1f1f1f" }));
      fedoraCrown.position.set(0, 3.3, 0);
      playerGroup.add(fedoraCrown);

      const redStripe = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.1, 1.02), new THREE.MeshStandardMaterial({ color: "#d32f2f" }));
      redStripe.position.set(0, 3.1, 0);
      playerGroup.add(redStripe);
    } else if (avatarConfig.hat === "crown") {
      const crownRing = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 16), new THREE.MeshStandardMaterial({ color: "#ffd700", metalness: 0.9, roughness: 0.1 }));
      crownRing.position.set(0, 3.1, 0);
      playerGroup.add(crownRing);

      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 4), new THREE.MeshStandardMaterial({ color: "#ffd700", metalness: 0.9, roughness: 0.1 }));
        spike.position.set(Math.sin(angle) * 0.5, 3.35, Math.cos(angle) * 0.5);
        spike.rotation.y = angle;
        playerGroup.add(spike);
      }
    } else if (avatarConfig.hat === "valkyrie") {
      const helm = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.3, 1.05), new THREE.MeshStandardMaterial({ color: "#78909c", metalness: 0.7, roughness: 0.2 }));
      helm.position.set(0, 3.1, 0);
      playerGroup.add(helm);

      const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.5), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9 }));
      wingL.position.set(-0.6, 3.3, 0.1);
      wingL.rotation.z = 0.25;
      wingL.rotation.y = 0.15;
      playerGroup.add(wingL);

      const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.5), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9 }));
      wingR.position.set(0.6, 3.3, 0.1);
      wingR.rotation.z = -0.25;
      wingR.rotation.y = -0.15;
      playerGroup.add(wingR);
    } else if (avatarConfig.hat === "dominus") {
      const hood = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: "#311B92", roughness: 0.5 }));
      hood.position.set(0, 2.5, 0);
      playerGroup.add(hood);

      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.1), new THREE.MeshBasicMaterial({ color: "#070212" }));
      shield.position.set(0, 2.5, 0.56);
      playerGroup.add(shield);

      const glowL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: "#ffd700" }));
      glowL.position.set(-0.2, 2.6, 0.62);
      playerGroup.add(glowL);

      const glowR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: "#ffd700" }));
      glowR.position.set(0.2, 2.6, 0.62);
      playerGroup.add(glowR);
    } else {
      // Hair for None option
      const hair = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.3, 1.02), new THREE.MeshStandardMaterial({ color: "#4e342e", roughness: 0.8 }));
      hair.position.set(0, 3.05, -0.05);
      playerGroup.add(hair);
    }

    // Back Accessories
    if (avatarConfig.back === "wings") {
      const leftWing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 0.08), new THREE.MeshStandardMaterial({ color: "#e0f7fa", transparent: true, opacity: 0.8 }));
      leftWing.position.set(-1.2, 1.2, -0.6);
      leftWing.rotation.y = 0.3;
      leftWing.rotation.z = 0.2;
      playerGroup.add(leftWing);

      const rightWing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 0.08), new THREE.MeshStandardMaterial({ color: "#e0f7fa", transparent: true, opacity: 0.8 }));
      rightWing.position.set(1.2, 1.2, -0.6);
      rightWing.rotation.y = -0.3;
      rightWing.rotation.z = -0.2;
      playerGroup.add(rightWing);
    } else if (avatarConfig.back === "cape") {
      const cape = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.08), new THREE.MeshStandardMaterial({ color: "#b71c1c", roughness: 0.6 }));
      cape.position.set(0, 0.6, -0.46);
      cape.rotation.x = 0.08;
      playerGroup.add(cape);
    } else if (avatarConfig.back === "swords") {
      const sword1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.4, 0.1), new THREE.MeshStandardMaterial({ color: "#cfd8dc", metalness: 0.8, roughness: 0.2 }));
      sword1.position.set(-0.3, 1.1, -0.5);
      sword1.rotation.z = 0.6;
      playerGroup.add(sword1);

      const sword2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.4, 0.1), new THREE.MeshStandardMaterial({ color: "#cfd8dc", metalness: 0.8, roughness: 0.2 }));
      sword2.position.set(0.3, 1.1, -0.5);
      sword2.rotation.z = -0.6;
      playerGroup.add(sword2);
    } else if (avatarConfig.back === "jetpack") {
      const pack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, 0.5), new THREE.MeshStandardMaterial({ color: "#455a64", metalness: 0.5 }));
      pack.position.set(0, 1.0, -0.65);
      playerGroup.add(pack);

      const thrusterL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.4), new THREE.MeshStandardMaterial({ color: "#37474f" }));
      thrusterL.position.set(-0.4, 0.3, -0.65);
      playerGroup.add(thrusterL);

      const thrusterR = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.4), new THREE.MeshStandardMaterial({ color: "#37474f" }));
      thrusterR.position.set(0.4, 0.3, -0.65);
      playerGroup.add(thrusterR);
    }

    // Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.0, 0.7), armMat);
    armL.position.set(-1.15, 1.0, 0);
    armL.castShadow = true;
    armL.name = "armL";
    playerGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.0, 0.7), armMat);
    armR.position.set(1.15, 1.0, 0);
    armR.castShadow = true;
    armR.name = "armR";
    playerGroup.add(armR);

    // Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.0, 0.75), pantsMat);
    legL.position.set(-0.425, -1.0, 0);
    legL.castShadow = true;
    legL.name = "legL";
    playerGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.0, 0.75), pantsMat);
    legR.position.set(0.425, -1.0, 0);
    legR.castShadow = true;
    legR.name = "legR";
    playerGroup.add(legR);

    // Pivot adjustments (feet at bottom Y = 0)
    playerGroup.children.forEach(child => {
      child.position.y += 1.0;
    });

    // 7. Load all current Roblox parts into the 3D scene
    physicsItemsRef.current = [];

    parts.forEach((part) => {
      if (part.name.toLowerCase() === "baseplate") return;

      let partGeometry: THREE.BufferGeometry;

      // Check if it's a custom imported OBJ model
      if (part.specialType === "custom_obj" && part.objData) {
        // Construct geometry from parsed OBJ points
        partGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(part.objData.vertices);
        const indices = part.objData.faces;

        partGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        if (indices && indices.length > 0) {
          partGeometry.setIndex(indices);
        }
        partGeometry.computeVertexNormals();
        partGeometry.computeBoundingBox();
      } else {
        // Standard geometric shapes
        switch (part.shape) {
          case "sphere":
            partGeometry = new THREE.SphereGeometry(0.5, 24, 24);
            break;
          case "cylinder":
            partGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 24);
            partGeometry.rotateX(Math.PI / 2);
            break;
          case "wedge":
            partGeometry = new THREE.BufferGeometry();
            const wedgeVertices = new Float32Array([
              -0.5, -0.5,  0.5,
               0.5, -0.5,  0.5,
              -0.5,  0.5,  0.5,
              -0.5, -0.5, -0.5,
               0.5, -0.5, -0.5,
              -0.5,  0.5, -0.5,
            ]);
            const wedgeIndices = [
              0, 1, 2,  5, 4, 3,
              0, 3, 4,  0, 4, 1,
              1, 4, 5,  1, 5, 2,
              2, 5, 3,  2, 3, 0
            ];
            partGeometry.setAttribute('position', new THREE.BufferAttribute(wedgeVertices, 3));
            partGeometry.setIndex(wedgeIndices);
            partGeometry.computeVertexNormals();
            break;
          case "block":
          default:
            partGeometry = new THREE.BoxGeometry(1, 1, 1);
            break;
        }
      }

      const partColor = new THREE.Color(part.color);
      let partMat: THREE.Material;

      const matConfig = {
        color: partColor,
        transparent: part.transparency > 0,
        opacity: 1 - part.transparency,
      };

      if (part.specialType === "killbrick") {
        partMat = new THREE.MeshStandardMaterial({
          color: "#f44336",
          emissive: "#b71c1c",
          emissiveIntensity: 1.4,
          roughness: 0.1,
        });
      } else if (part.specialType === "speedpad") {
        partMat = new THREE.MeshStandardMaterial({
          color: "#00e5ff",
          emissive: "#008ba3",
          emissiveIntensity: 1.1,
          roughness: 0.2,
        });
      } else if (part.specialType === "trampoline") {
        partMat = new THREE.MeshStandardMaterial({
          color: "#d500f9",
          roughness: 0.1,
          metalness: 0.4,
        });
      } else if (part.specialType === "coin") {
        partMat = new THREE.MeshStandardMaterial({
          color: "#ffd700",
          metalness: 0.9,
          roughness: 0.1,
        });
      } else if (part.material === "Neon") {
        partMat = new THREE.MeshStandardMaterial({
          ...matConfig,
          emissive: partColor,
          emissiveIntensity: 1.3,
        });
      } else {
        partMat = new THREE.MeshStandardMaterial({
          ...matConfig,
          roughness: part.material === "SmoothPlastic" ? 0.15 : 0.8,
          metalness: part.material === "Metal" ? 0.9 : 0.1,
        });
      }

      let visualMesh: THREE.Object3D;

      if (part.specialType === "tree") {
        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 6, 12), new THREE.MeshStandardMaterial({ color: "#5d4037", roughness: 0.9 }));
        trunk.position.y = 3;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        const leafSphere = new THREE.Mesh(new THREE.SphereGeometry(2.5, 12, 12), new THREE.MeshStandardMaterial({ color: "#2e7d32", roughness: 0.8 }));
        leafSphere.position.y = 6;
        leafSphere.castShadow = true;
        treeGroup.add(leafSphere);

        treeGroup.position.set(part.position[0], part.position[1], part.position[2]);
        scene.add(treeGroup);
        visualMesh = treeGroup;
      } 
      else if (part.specialType === "light") {
        const lightGroup = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 7, 8), new THREE.MeshStandardMaterial({ color: "#37474f" }));
        pole.position.y = 3.5;
        lightGroup.add(pole);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), new THREE.MeshBasicMaterial({ color: "#00e5ff" }));
        bulb.position.set(0, 7, 0.2);
        lightGroup.add(bulb);

        const localLight = new THREE.PointLight("#00e5ff", 1.8, 18);
        localLight.position.set(0, 7, 0.2);
        lightGroup.add(localLight);

        lightGroup.position.set(part.position[0], part.position[1], part.position[2]);
        scene.add(lightGroup);
        visualMesh = lightGroup;
      }
      else {
        const mesh = new THREE.Mesh(partGeometry, partMat);
        mesh.scale.set(part.size[0], part.size[1], part.size[2]);
        mesh.position.set(part.position[0], part.position[1], part.position[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        visualMesh = mesh;
      }

      physicsItemsRef.current.push({
        id: part.id,
        mesh: visualMesh,
        part
      });
    });

    // 8. Track keyboard buttons with Cyrillic and layout-agnostic codes
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      const key = e.key.toLowerCase();
      const code = e.code;

      if (key === "w" || code === "KeyW" || key === "ц") {
        keysPressed.current["w"] = true;
      }
      if (key === "s" || code === "KeyS" || key === "і" || key === "ы") {
        keysPressed.current["s"] = true;
      }
      if (key === "a" || code === "KeyA" || key === "ф") {
        keysPressed.current["a"] = true;
      }
      if (key === "d" || code === "KeyD" || key === "в") {
        keysPressed.current["d"] = true;
      }
      if (key === " " || code === "Space") {
        keysPressed.current[" "] = true;
      }

      if (key === "arrowup" || code === "ArrowUp") {
        keysPressed.current["w"] = true;
      }
      if (key === "arrowdown" || code === "ArrowDown") {
        keysPressed.current["s"] = true;
      }
      if (key === "arrowleft" || code === "ArrowLeft") {
        keysPressed.current["a"] = true;
      }
      if (key === "arrowright" || code === "ArrowRight") {
        keysPressed.current["d"] = true;
      }

      if (["space", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key) || ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(code)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code;

      if (key === "w" || code === "KeyW" || key === "ц") {
        keysPressed.current["w"] = false;
      }
      if (key === "s" || code === "KeyS" || key === "і" || key === "ы") {
        keysPressed.current["s"] = false;
      }
      if (key === "a" || code === "KeyA" || key === "ф") {
        keysPressed.current["a"] = false;
      }
      if (key === "d" || code === "KeyD" || key === "в") {
        keysPressed.current["d"] = false;
      }
      if (key === " " || code === "Space") {
        keysPressed.current[" "] = false;
      }

      if (key === "arrowup" || code === "ArrowUp") {
        keysPressed.current["w"] = false;
      }
      if (key === "arrowdown" || code === "ArrowDown") {
        keysPressed.current["s"] = false;
      }
      if (key === "arrowleft" || code === "ArrowLeft") {
        keysPressed.current["a"] = false;
      }
      if (key === "arrowright" || code === "ArrowRight") {
        keysPressed.current["d"] = false;
      }
    };

    // Mouse orbital dragging events on canvas
    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      // Adjust angles
      theta.current -= deltaX * 0.007;
      phi.current = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi.current + deltaY * 0.007));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
    };

    // Mouse scroll wheel zooming
    const handleWheel = (e: WheelEvent) => {
      // Zoom logic
      cameraDistance.current = Math.max(0, Math.min(30, cameraDistance.current + e.deltaY * 0.025));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel, { passive: true });

    // Initial positioning
    playerPos.current.set(spawnLocation[0], spawnLocation[1], spawnLocation[2]);
    playerVel.current.set(0, 0, 0);

    // 9. Main Animation loop & platformer physical calculations
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1); // Cap delta to prevent crazy clipping
      lastTime = time;

      // Skip updates if game is paused in menu
      if (isEscMenuOpen) {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          if (cinematicModeRef.current && composerRef.current) {
            composerRef.current.render();
          } else {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        }
        return;
      }

      // ---- PHYSICS & CHARACTER CALCULATIONS ----
      
      const moveVec = new THREE.Vector3(0, 0, 0);
      
      if (keysPressed.current["w"]) {
        moveVec.z -= 1;
      }
      if (keysPressed.current["s"]) {
        moveVec.z += 1;
      }
      if (keysPressed.current["a"]) {
        moveVec.x -= 1;
      }
      if (keysPressed.current["d"]) {
        moveVec.x += 1;
      }

      moveVec.normalize();

      // Align movement vector relative to camera yaw rotation!
      // This makes camera controls extremely modern and intuitive!
      if (cameraRef.current) {
        const camYaw = theta.current;
        const forward = new THREE.Vector3(Math.sin(camYaw), 0, Math.cos(camYaw));
        const right = new THREE.Vector3(Math.sin(camYaw - Math.PI/2), 0, Math.cos(camYaw - Math.PI/2));

        const relativeMove = new THREE.Vector3()
          .addScaledVector(forward, -moveVec.z)
          .addScaledVector(right, -moveVec.x);
        
        relativeMove.normalize();

        let activeSpeed = 16 * speedMultiplier;
        playerVel.current.x = relativeMove.x * activeSpeed;
        playerVel.current.z = relativeMove.z * activeSpeed;

        if (relativeMove.lengthSq() > 0) {
          characterRotation.current = Math.atan2(relativeMove.x, relativeMove.z);
          playerGroup.rotation.y = characterRotation.current;

          const swing = Math.sin(time * 0.01) * 0.45;
          const leftArmMesh = playerGroup.getObjectByName("armL");
          const rightArmMesh = playerGroup.getObjectByName("armR");
          const leftLegMesh = playerGroup.getObjectByName("legL");
          const rightLegMesh = playerGroup.getObjectByName("legR");

          if (leftArmMesh) leftArmMesh.rotation.x = swing;
          if (rightArmMesh) rightArmMesh.rotation.x = -swing;
          if (leftLegMesh) leftLegMesh.rotation.x = -swing;
          if (rightLegMesh) rightLegMesh.rotation.x = swing;
        } else {
          const leftArmMesh = playerGroup.getObjectByName("armL");
          const rightArmMesh = playerGroup.getObjectByName("armR");
          const leftLegMesh = playerGroup.getObjectByName("legL");
          const rightLegMesh = playerGroup.getObjectByName("legR");

          if (leftArmMesh) leftArmMesh.rotation.x = 0;
          if (rightArmMesh) rightArmMesh.rotation.x = 0;
          if (leftLegMesh) leftLegMesh.rotation.x = 0;
          if (rightLegMesh) rightLegMesh.rotation.x = 0;
        }
      }

      // Gravitational force pull
      const gravity = -35; 
      playerVel.current.y += gravity * delta;

      // Jump request
      if (keysPressed.current[" "] && isGrounded.current && !isDying.current) {
        playerVel.current.y = 16.5; 
        isGrounded.current = false;
        playSynthSound("jump");
      }

      // Update position coordinates
      playerPos.current.x += playerVel.current.x * delta;
      playerPos.current.y += playerVel.current.y * delta;
      playerPos.current.z += playerVel.current.z * delta;

      // --- NPC GUEST MULTIPLAYER SIMULATED MOVEMENT ---
      npcsRef.current.forEach((npc, idx) => {
        if (!npc.mesh) return;

        // Simple random AI walking around
        const npcSpeed = 5;
        if (Math.random() < 0.02) {
          // Change direction randomly
          const angle = Math.random() * Math.PI * 2;
          npc.direction.set(Math.cos(angle), 0, Math.sin(angle));
        }

        // Apply jump simulation
        if (Math.random() < 0.015 && npc.isGrounded) {
          npc.velocity.y = 14;
          npc.isGrounded = false;
        }

        npc.velocity.y += gravity * delta;
        
        npc.position.x += npc.direction.x * npcSpeed * delta;
        npc.position.z += npc.direction.z * npcSpeed * delta;
        npc.position.y += npc.velocity.y * delta;

        // Baseplate ground check for NPC
        if (npc.position.y <= 0) {
          npc.position.y = 0;
          npc.velocity.y = 0;
          npc.isGrounded = true;
        }

        npc.mesh.position.copy(npc.position);
        npc.mesh.rotation.y = Math.atan2(npc.direction.x, npc.direction.z);

        // Spin and pulse the 3D VC indicator above the NPC head
        if (npc.voiceIndicatorMesh) {
          npc.voiceIndicatorMesh.rotation.y += 0.05;
          const scale = 1.0 + Math.sin(time * 0.02) * 0.15;
          npc.voiceIndicatorMesh.scale.set(scale, scale, scale);
        }

        // Gentle limb swinging for NPC
        const npcSwing = Math.sin(time * 0.008 + idx * 10) * 0.45;
        if (npc.mesh.children[8]) npc.mesh.children[8].rotation.x = npcSwing;
        if (npc.mesh.children[9]) npc.mesh.children[9].rotation.x = -npcSwing;
        if (npc.mesh.children[12]) npc.mesh.children[12].rotation.x = -npcSwing;
        if (npc.mesh.children[13]) npc.mesh.children[13].rotation.x = npcSwing;
      });

      // Spin and pulse the player's 3D VC indicator above the head
      if (playerVoiceIndicatorMesh.current) {
        playerVoiceIndicatorMesh.current.rotation.y += 0.05;
        const scale = 1.0 + Math.sin(time * 0.02) * 0.15;
        playerVoiceIndicatorMesh.current.scale.set(scale, scale, scale);
      }

      // --- ADVANCED 3D COLLISION DETECTION ---
      isGrounded.current = false;

      // Floor boundary limit (Baseplate surface is at Y = 0)
      if (playerPos.current.y <= 0) {
        playerPos.current.y = 0;
        playerVel.current.y = 0;
        isGrounded.current = true;
      }

      // Out of bounds check
      if (playerPos.current.y < -25) {
        triggerRespawn(false);
      }

      const playerRadius = 0.75;
      const playerHeight = 3.0;

      // Check collision against other scene parts
      physicsItemsRef.current.forEach((item) => {
        const { part, mesh } = item;

        if (!part.canCollide && part.specialType !== "coin" && part.specialType !== "killbrick") return;

        const halfX = part.size[0] / 2;
        const halfY = part.size[1] / 2;
        const halfZ = part.size[2] / 2;

        // AABB check
        const overlapX = (halfX + playerRadius) - Math.abs(playerPos.current.x - part.position[0]);
        const overlapZ = (halfZ + playerRadius) - Math.abs(playerPos.current.z - part.position[2]);
        
        // Player Y goes from playerPos.current.y (feet) to playerPos.current.y + playerHeight (head)
        const overlapYTop = (part.position[1] + halfY) - playerPos.current.y;
        const overlapYBottom = (playerPos.current.y + playerHeight) - (part.position[1] - halfY);
        const isOverlappingY = overlapYTop > 0 && overlapYBottom > 0;

        const isColliding = overlapX > 0 && overlapZ > 0 && isOverlappingY;

        if (isColliding) {
          
          if (part.specialType === "coin" && mesh.visible) {
            mesh.visible = false;
            setCoins(prev => prev + 1);
            playSynthSound("coin");
            addChatMessage("Server", `🪙 Гравець зібрав золоту монету!`);
            return;
          }

          if (part.specialType === "killbrick") {
            triggerRespawn(true);
            return;
          }

          if (part.specialType === "trampoline") {
            playerVel.current.y = 35; 
            isGrounded.current = false;
            playSynthSound("bounce");
            return;
          }

          if (part.specialType === "speedpad") {
            playerVel.current.x *= 1.8;
            playerVel.current.z *= 1.8;
            return;
          }

          if (part.specialType === "checkpoint") {
            const nextSpawn: [number, number, number] = [part.position[0], part.position[1] + halfY + 1.5, part.position[2]];
            if (spawnLocation[0] !== nextSpawn[0] || spawnLocation[2] !== nextSpawn[2]) {
              setSpawnLocation(nextSpawn);
              setCurrentCheckpointName(part.name);
              addChatMessage("Server", `🚩 Точка збереження активована: ${part.name}!`);
              playSynthSound("checkpoint");
            }
          }

          // Resolve collidable block pushback forces
          if (part.canCollide) {
            const overlapY = overlapYTop < overlapYBottom ? overlapYTop : overlapYBottom;

            if (overlapY < overlapX && overlapY < overlapZ) {
              if (overlapYTop < overlapYBottom) {
                // Standing on top of the block
                playerPos.current.y = part.position[1] + halfY;
                playerVel.current.y = 0;
                isGrounded.current = true;
              } else {
                // Hitting head on bottom
                playerPos.current.y = part.position[1] - halfY - playerHeight;
                playerVel.current.y = -1;
              }
            } else if (overlapX < overlapZ) {
              const dx = playerPos.current.x - part.position[0];
              playerPos.current.x += dx > 0 ? overlapX : -overlapX;
              playerVel.current.x = 0;
            } else {
              const dz = playerPos.current.z - part.position[2];
              playerPos.current.z += dz > 0 ? overlapZ : -overlapZ;
              playerVel.current.z = 0;
            }
          }
        }
      });

      // Update character mesh coordinates
      playerGroup.position.set(playerPos.current.x, playerPos.current.y, playerPos.current.z);

      // Spin animated coins
      physicsItemsRef.current.forEach((item) => {
        if (item.part.specialType === "coin" && item.mesh.visible) {
          item.mesh.rotation.y += delta * 2.5;
        }
      });

      // ---- FIRST PERSON VS THIRD PERSON CAMERA SYSTEM ----
      if (cameraDistance.current === 0) {
        // --- 1st PERSON MODE ---
        // Hide character parts so we see from their face
        playerGroup.children.forEach(child => {
          child.visible = false;
        });

        // Camera locked exactly at player head
        camera.position.set(
          playerPos.current.x,
          playerPos.current.y + 2.5,
          playerPos.current.z
        );

        // Direction vector from angles
        const targetX = playerPos.current.x + Math.sin(theta.current) * Math.cos(phi.current);
        const targetY = playerPos.current.y + 2.5 + Math.sin(phi.current);
        const targetZ = playerPos.current.z + Math.cos(theta.current) * Math.cos(phi.current);
        camera.lookAt(new THREE.Vector3(targetX, targetY, targetZ));

      } else {
        // --- 3rd PERSON MODE ---
        // Show all character parts
        playerGroup.children.forEach(child => {
          child.visible = true;
        });

        // Spherical orbital coordinates relative to player center
        const offset = new THREE.Vector3(
          cameraDistance.current * Math.sin(theta.current) * Math.cos(phi.current),
          cameraDistance.current * Math.sin(phi.current) + 2, // Slight height elevation
          cameraDistance.current * Math.cos(theta.current) * Math.cos(phi.current)
        );

        const targetCamPos = playerPos.current.clone().add(offset);
        camera.position.lerp(targetCamPos, 0.2); 
        camera.lookAt(playerPos.current.clone().add(new THREE.Vector3(0, 1.8, 0)));
      }

      // Render the frame scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        if (cinematicModeRef.current && composerRef.current) {
          composerRef.current.render();
        } else {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      if (composerRef.current) {
        composerRef.current.setSize(w, h);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [parts, spawnLocation, speedMultiplier, soundEnabled, coins]);

  return (
    <div 
      className="fixed inset-0 w-screen h-screen bg-black z-[999] select-none font-sans overflow-hidden flex flex-col"
      id="roblox-gameplay-root"
      ref={mountRef}
    >
      {/* 3D WEBGL GRAPHICS CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* ROBLOX RED FLASH DEATH / OOF EFFECT */}
      {oofAnimationActive && (
        <div className="absolute inset-0 bg-red-600/30 border-4 border-red-600 animate-pulse pointer-events-none z-[100] flex items-center justify-center">
          <div className="text-white text-5xl font-black tracking-widest uppercase drop-shadow-[0_5px_5px_rgba(0,0,0,1)] bg-black/40 px-8 py-4 rounded-xl border border-red-500 font-mono">
            OOF!
          </div>
        </div>
      )}

      {/* HUD OVERLAY - STYLED EXACTLY LIKE ROBLOX */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-40">
        
        {/* TOP HUD SECTION */}
        <div className="flex items-start justify-between w-full">
          {/* Top-Left: Core GUI Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Roblox menu trigger */}
            <button 
              id="hud-btn-roblox-menu"
              onClick={() => {
                setIsEscMenuOpen(!isEscMenuOpen);
                setShowLeaveConfirmation(false);
              }}
              className="w-11 h-11 rounded-lg bg-black/60 hover:bg-black/80 border border-white/10 flex items-center justify-center transition-all cursor-pointer group shadow-lg"
              title="Перемикнути меню (ESC)"
            >
              <div className="w-6 h-6 border-4 border-white transform rotate-12 flex items-center justify-center font-black rounded-sm group-hover:scale-105 transition-transform" />
            </button>

            {/* Chat button */}
            <button 
              id="hud-btn-chat-toggle"
              onClick={() => setIsChatFocused(!isChatFocused)}
              className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isChatFocused 
                  ? "bg-white text-black border-white" 
                  : "bg-black/60 hover:bg-black/80 text-white border-white/10"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            {/* Simulated Voice Chat trigger */}
            <button 
              id="hud-btn-voice-toggle"
              onClick={() => {
                setIsVoiceActive(!isVoiceActive);
                playSynthSound("beep");
              }}
              className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isVoiceActive 
                  ? "bg-[#00FF88] text-black border-[#00FF88]" 
                  : "bg-black/60 hover:bg-black/80 text-white border-white/10"
              }`}
              title="Перемикнути голосовий зв'язок"
            >
              {isVoiceActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Sound Toggler */}
            <button 
              id="hud-btn-sound"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-11 h-11 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-lg"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-[#00FF88]" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
            </button>

            {/* Shaders Toggler */}
            <button 
              id="hud-btn-shaders"
              onClick={() => {
                setCinematicMode(!cinematicMode);
                playSynthSound("beep");
              }}
              className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                cinematicMode 
                  ? "bg-brand text-black border-brand shadow-[0_0_10px_rgba(0,162,255,0.4)]" 
                  : "bg-black/60 hover:bg-black/80 text-white border-white/10"
              }`}
              title={cinematicMode ? "Вимкнути шейдери" : "Увімкнути кінематографічні шейдери"}
            >
              <Sparkles className={`w-5 h-5 ${cinematicMode ? "text-black animate-pulse" : "text-white"}`} />
            </button>
          </div>

          {/* Top-Right: Roblox Leaderboard (Leaderstats) */}
          <div className="flex flex-col gap-1 pointer-events-auto items-end">
            <div className="bg-black/65 backdrop-blur-md border border-white/10 p-3 rounded-xl text-white font-mono text-xs shadow-2xl min-w-[240px]" id="roblox-leaderboard">
              <div className="border-b border-white/10 pb-1.5 mb-2 flex items-center justify-between font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-brand" /> Гравці</span>
                <span>Таблиця лідерів</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#00FF88]">
                  <span className="flex items-center gap-1">
                    {isVerifiedDev && <ShieldCheck className="w-3.5 h-3.5 text-brand fill-brand/20 inline" />}
                    <span>{avatarConfig.nickname}</span>
                    {isVoiceActive && <span className="text-[10px] bg-[#00FF88]/20 text-[#00FF88] px-1 rounded font-mono animate-pulse">MIC</span>}
                  </span>
                  <div className="flex items-center gap-2 text-white">
                    <span className="flex items-center gap-0.5">🪙 {coins}</span>
                    <span className="flex items-center gap-0.5 text-rose-400">💀 {deaths}</span>
                  </div>
                </div>

                {/* Simulated multiplayer players list */}
                {npcsRef.current.map(npc => (
                  <div key={npc.id} className="flex items-center justify-between text-gray-300 text-[11px] border-t border-white/5 pt-1.5">
                    <span className="flex items-center gap-1">
                      {npc.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-brand fill-brand/20 inline" />}
                      <span>{npc.name}</span>
                      {npc.voiceActive && <span className="text-[9px] bg-brand/20 text-brand px-1 rounded animate-pulse">VC</span>}
                    </span>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>🪙 {npc.role === "Guest_Builderman" ? coins + 5 : Math.floor(coins * 0.4)}</span>
                      <span className="text-rose-500">💀 {npc.role === "Guest_Noob" ? deaths + 3 : 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkpoint Badge Indicator */}
            <div className="bg-black/60 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-white font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span>Збережено: <strong>{currentCheckpointName}</strong></span>
            </div>

            {/* Camera Perspective Indicator */}
            <div className="bg-black/60 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] text-gray-300 font-mono flex items-center gap-1.5 uppercase">
              <Compass className="w-3.5 h-3.5 text-brand" />
              <span>Камера: <strong>{cameraDistance.current === 0 ? "1-ша особа (FP)" : "3-тя особа (Orbit)"}</strong></span>
            </div>
          </div>
        </div>

        {/* BOTTOM HUD SECTION */}
        <div className="flex items-end justify-between w-full">
          
          {/* Bottom-Left: Standard Floating Chat Messages box */}
          <div className="flex flex-col gap-2 w-[420px] pointer-events-auto">
            {/* Messages Stream Container */}
            <div className="bg-black/60 backdrop-blur-sm border border-white/10 p-3.5 rounded-xl h-48 overflow-y-auto flex flex-col gap-1.5 font-mono text-xs shadow-inner scrollbar-thin">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="leading-snug">
                  {msg.sender === "System" && (
                    <span className="text-amber-400 font-semibold">[СИСТЕМА] {msg.text}</span>
                  )}
                  {msg.sender === "Server" && (
                    <span className="text-cyan-400 font-semibold">[СЕРВЕР] {msg.text}</span>
                  )}
                  {msg.sender === "Player" && (
                    <span className="text-white">
                      {isVerifiedDev && <ShieldCheck className="w-3 h-3 text-brand fill-brand/20 inline mr-1" />}
                      <strong className="text-[#00FF88]">{avatarConfig.nickname}:</strong> {msg.text}
                    </span>
                  )}
                  {msg.sender === "Guest_Noob" && (
                    <span className="text-gray-300"><strong className="text-yellow-400">Classic_Noob:</strong> {msg.text}</span>
                  )}
                  {msg.sender === "Guest_77" && (
                    <span className="text-gray-300"><strong className="text-sky-400">Guest_77:</strong> {msg.text}</span>
                  )}
                  {msg.sender === "Guest_Builderman" && (
                    <span className="text-gray-300">
                      <ShieldCheck className="w-3 h-3 text-brand fill-brand/20 inline mr-1" />
                      <strong className="text-amber-400">Builderman_CEO:</strong> {msg.text}
                    </span>
                  )}
                  {msg.sender.startsWith("[Global]") && (
                    <span className="text-gray-300">
                      <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black text-[8px] px-1 py-0.2 rounded mr-1">GLOBAL</span>
                      <strong className="text-cyan-300">{msg.sender.replace("[Global] ", "")}:</strong> {msg.text}
                    </span>
                  )}
                  <span className="text-[9px] text-gray-500 ml-1.5">({msg.time})</span>
                </div>
              ))}
            </div>

            {/* Chat input box */}
            <div className="flex gap-2 items-center w-full bg-black/70 border border-white/10 rounded-xl p-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onFocus={() => setIsChatFocused(true)}
                onBlur={() => setTimeout(() => setIsChatFocused(false), 250)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendChatMessage();
                }}
                placeholder="Введіть повідомлення або чіт-код (напр., /gravity)..." 
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs px-2 py-1.5 focus:ring-0"
              />
              <button 
                id="btn-send-chat"
                onClick={handleSendChatMessage}
                className="bg-brand hover:bg-brand-bright text-black font-black font-mono text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1 transition-all"
              >
                <span>Надіслати</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Bottom-Right: Voice indicators & Health bar */}
          <div className="flex flex-col gap-2 pointer-events-auto items-end">
            
            {/* Live voice chat simulated frequency bars */}
            {isVoiceActive && (
              <div className="bg-black/80 border border-[#00FF88]/20 p-2.5 rounded-lg flex items-center gap-2 text-[10px] font-mono text-[#00FF88] shadow-lg animate-pulse">
                <Mic className="w-4 h-4 text-[#00FF88]" />
                <span>VOICE ACTIVE</span>
                <div className="flex items-end gap-0.5 h-3 w-16">
                  {voiceVisualizerLevels.map((val, i) => (
                    <div 
                      key={i} 
                      className="bg-[#00FF88] w-1.5 rounded-t-sm transition-all duration-100" 
                      style={{ height: `${val * 10}%` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Interactive Health bar */}
            <div className="bg-black/70 border border-white/10 p-3.5 rounded-xl w-64 shadow-2xl flex flex-col gap-1.5 font-mono text-xs">
              <div className="flex justify-between items-center text-white">
                <span className="font-bold flex items-center gap-1">♥️ Здоров'я</span>
                <span className={health > 30 ? "text-[#00FF88]" : "text-red-400 animate-pulse"}>{health}%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full transition-all duration-300 ${
                    health > 60 ? "bg-[#00FF88]" : health > 30 ? "bg-amber-400" : "bg-red-500 animate-pulse"
                  }`}
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- IN-GAME ESCAPE SYSTEM MENU (EXACTLY LIKE ROBLOX ESC MENU) --- */}
      {isEscMenuOpen && (
        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#14171d] border-2 border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px]">
            {/* Esc Menu Tabs Header */}
            <div className="bg-[#111318] border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setEscTab("Game")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    escTab === "Game" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Ігровий процес (Game)
                </button>
                <button 
                  onClick={() => setEscTab("Settings")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    escTab === "Settings" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Налаштування (Settings)
                </button>
                <button 
                  onClick={() => setEscTab("Players")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    escTab === "Players" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Гравці (Players)
                </button>
              </div>

              <button 
                id="btn-close-esc-menu"
                onClick={() => setIsEscMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Esc Menu Core panels */}
            <div className="flex-1 p-6 overflow-y-auto text-white">
              {escTab === "Game" && (
                <div className="space-y-6">
                  <div className="bg-[#1a1f29] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">Бажаєте повернутися до редактора?</h4>
                      <p className="text-xs text-gray-400 mt-1">Ви вийдете з ігрового процесу та повернетеся в Roblox Studio.</p>
                    </div>

                    <button
                      id="esc-leave-button"
                      onClick={() => setShowLeaveConfirmation(true)}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white rounded-lg cursor-pointer transition-all uppercase tracking-wider"
                    >
                      Покинути гру (Leave)
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] text-gray-500 font-bold uppercase font-mono tracking-wider">Параметри гри</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#12151a] border border-white/5 p-4 rounded-xl">
                        <span className="text-xs font-bold block">Зібрані Монети</span>
                        <span className="text-2xl font-black text-[#ffd700] mt-1 block">🪙 {coins}</span>
                      </div>
                      <div className="bg-[#12151a] border border-white/5 p-4 rounded-xl">
                        <span className="text-xs font-bold block">Поразки гравця</span>
                        <span className="text-2xl font-black text-rose-400 mt-1 block">💀 {deaths}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {escTab === "Settings" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <span className="text-xs font-bold block">Швидкість пересування</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">Встановіть ігровий мультиплікатор швидкості</p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#12151a] p-1.5 rounded-lg border border-white/10">
                      <button 
                        onClick={() => setSpeedMultiplier(Math.max(0.5, speedMultiplier - 0.5))}
                        className="px-2 py-1 bg-white/5 text-xs font-bold rounded"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold px-2">{speedMultiplier}x</span>
                      <button 
                        onClick={() => setSpeedMultiplier(Math.min(5, speedMultiplier + 0.5))}
                        className="px-2 py-1 bg-white/5 text-xs font-bold rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <span className="text-xs font-bold block">Синтезатор звуків</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">Увімкнути/вимкнути ретро звукові ефекти</p>
                    </div>
                    <button 
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg ${
                        soundEnabled ? "bg-[#00FF88] text-black" : "bg-white/5 text-gray-400"
                      }`}
                    >
                      {soundEnabled ? "УВІМКНЕНО" : "ВИМКНЕНО"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <span className="text-xs font-bold block">Гучність голосового чату ботів</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">Встановіть гучність синтезованого мовлення ботів</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={vcVolume}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (onVcVolumeChange) onVcVolumeChange(val);
                        }}
                        className="w-24 accent-[#00FF88] cursor-pointer bg-white/10 h-1 rounded-lg appearance-none"
                        id="esc-bot-vc-volume-slider"
                      />
                      <span className="text-[#00FF88] font-mono font-bold text-xs w-10 text-right">{vcVolume}%</span>
                    </div>
                  </div>
                </div>
              )}

              {escTab === "Players" && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400">Гравці на цьому локальному сервері:</h4>
                  <div className="space-y-2">
                    <div className="bg-[#12151a] border border-white/5 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        {isVerifiedDev && <ShieldCheck className="w-4 h-4 text-brand fill-brand/20" />}
                        <span>{avatarConfig.nickname} (Ви)</span>
                      </span>
                      <span className="text-[10px] text-gray-500">PING: 12ms</span>
                    </div>

                    {npcsRef.current.map(npc => (
                      <div key={npc.id} className="bg-[#12151a] border border-white/5 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          {npc.isVerified && <ShieldCheck className="w-4 h-4 text-brand fill-brand/20" />}
                          <span>{npc.name}</span>
                        </span>
                        <span className="text-[10px] text-[#00FF88]">ONLINE</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resume game buttons bar */}
            <div className="bg-[#111318] border-t border-white/5 p-4 flex gap-3">
              <button
                id="btn-resume-game"
                onClick={() => setIsEscMenuOpen(false)}
                className="flex-1 py-3 bg-[#00FF88] hover:bg-[#00dd77] text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all"
              >
                Продовжити гру (Resume)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL OF LEAVING THE SERVER (ESC WORKFLOW) --- */}
      {showLeaveConfirmation && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#181b22] border-2 border-red-500/20 rounded-2xl p-6 shadow-2xl text-center text-white space-y-4">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-base">Бажаєте покинути сервер?</h4>
              <p className="text-xs text-gray-400">Весь прогрес та зібрані монети буде збережено у вашій поточній сесії.</p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                id="btn-leave-cancel"
                onClick={() => setShowLeaveConfirmation(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                Назад (Cancel)
              </button>
              <button
                id="btn-leave-confirm"
                onClick={onLeaveGame}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-lg transition-all uppercase cursor-pointer"
              >
                Вийти (Leave Game)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
