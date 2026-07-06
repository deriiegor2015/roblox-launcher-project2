import React, { useState, useEffect, useRef } from "react";
import { 
  RobloxPart, 
  ActiveRibbonTab, 
  ConsoleLog, 
  ToolboxItem,
  WorkspaceStateVersion
} from "./types";
import { 
  INITIAL_PARTS, 
  INITIAL_EXPLORER, 
  LUA_TEMPLATES 
} from "./data";
import RibbonBar from "./components/RibbonBar";
import Explorer from "./components/Explorer";
import ThreeViewport from "./components/ThreeViewport";
import PropertiesPanel from "./components/PropertiesPanel";
import ScriptEditor from "./components/ScriptEditor";
import ConsolePanel from "./components/ConsolePanel";
import AIAssistant from "./components/AIAssistant";
import ToolboxPanel from "./components/ToolboxPanel";
import GameTestMode from "./components/GameTestMode";
import MainMenu from "./components/MainMenu";
import { Bot, Info, CheckCircle2, ChevronLeft, Keyboard, X, Globe, Play } from "lucide-react";

export default function App() {
  // --- STATE ---
  const [activeView, setActiveView] = useState<"menu" | "studio" | "play">("menu");
  const [parts, setParts] = useState<RobloxPart[]>(INITIAL_PARTS);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>("script-welcome");
  const [activeScriptCode, setActiveScriptCode] = useState<string>(LUA_TEMPLATES[0].code);
  const [activeRibbonTab, setActiveRibbonTab] = useState<ActiveRibbonTab>("Home");
  
  // Real-time multiplayer server states
  const [activeRoomId, setActiveRoomId] = useState<string>("studio-test");
  const [currentGameTitle, setCurrentGameTitle] = useState<string>("Roblox Studio Test Server");

  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      id: "init",
      type: "info",
      text: "Roblox Studio Online успішно ініціалізовано. Консоль готова.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [physicsActive, setPhysicsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  
  // Publishing states
  const [isPublishOpen, setIsPublishOpen] = useState<boolean>(false);
  const [publishName, setPublishName] = useState<string>("Мій Дивовижний 3D Оббі");
  const [publishDesc, setPublishDesc] = useState<string>("Супер крутий паркур з голосовим чатом між ботами та інструментами розробника.");
  const [publishPrivacy, setPublishPrivacy] = useState<"public" | "private">("public");
  const [publishProgress, setPublishProgress] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  
  // Voice Chat Volume setting state
  const [vcVolume, setVcVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("roblox_vc_volume");
      return saved ? Number(saved) : 80;
    } catch (e) {
      return 80;
    }
  });

  const handleVcVolumeChange = (newVolume: number) => {
    setVcVolume(newVolume);
    try {
      localStorage.setItem("roblox_vc_volume", String(newVolume));
    } catch (e) {
      // Ignore
    }
  };

  // Load custom items from local storage
  const [customItems, setCustomItems] = useState<ToolboxItem[]>(() => {
    try {
      const saved = localStorage.getItem("roblox_custom_items");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleAddCustomItem = (newItem: ToolboxItem) => {
    const updated = [...customItems, newItem];
    setCustomItems(updated);
    localStorage.setItem("roblox_custom_items", JSON.stringify(updated));
    addLog(`Власну модель "${newItem.name}" збережено в Toolbox!`, "success");
    setSuccessBanner(`Модель "${newItem.name}" додано до Toolbox!`);
  };

  // --- WORKSPACE STATE HISTORY MANAGEMENT ---
  const [historyVersions, setHistoryVersions] = useState<WorkspaceStateVersion[]>(() => {
    try {
      const saved = localStorage.getItem("roblox_workspace_history");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore
    }
    return [
      {
        id: "initial",
        timestamp: new Date().toLocaleTimeString(),
        description: "Початковий стан (Шаблон)",
        parts: INITIAL_PARTS
      }
    ];
  });

  const lastSavedPartsRef = useRef<RobloxPart[]>(parts);

  const saveHistoryVersion = (description: string, customParts: RobloxPart[]) => {
    const newVersion: WorkspaceStateVersion = {
      id: `ver-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      description,
      parts: JSON.parse(JSON.stringify(customParts))
    };
    
    lastSavedPartsRef.current = customParts;
    
    setHistoryVersions((prev) => {
      const updated = [newVersion, ...prev].slice(0, 15);
      localStorage.setItem("roblox_workspace_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRestoreHistoryVersion = (version: WorkspaceStateVersion) => {
    setParts(version.parts);
    lastSavedPartsRef.current = version.parts;
    setSelectedPartId(null);
    addLog(`Відновлено стан: "${version.description}" від ${version.timestamp}`, "success");
    setSuccessBanner(`Сцену відновлено: ${version.description}`);
  };

  const handleCreateManualCheckpoint = (customDescription: string) => {
    const desc = customDescription.trim() || "Користувацька точка збереження";
    saveHistoryVersion(desc, parts);
    addLog(`Створено точку збереження: "${desc}"`, "success");
    setSuccessBanner(`Створено точку збереження!`);
  };

  const handleClearHistory = () => {
    const initialVer = {
      id: "initial",
      timestamp: new Date().toLocaleTimeString(),
      description: "Початковий стан (Шаблон)",
      parts: INITIAL_PARTS
    };
    setHistoryVersions([initialVer]);
    localStorage.setItem("roblox_workspace_history", JSON.stringify([initialVer]));
    addLog("Історію змін очищено.", "info");
  };

  // Debounced Auto-Save for properties or workspace updates
  useEffect(() => {
    const isDifferent = JSON.stringify(parts) !== JSON.stringify(lastSavedPartsRef.current);
    if (!isDifferent) return;

    const timer = setTimeout(() => {
      if (JSON.stringify(parts) !== JSON.stringify(lastSavedPartsRef.current)) {
        const timestamp = new Date().toLocaleTimeString();
        const newVersion: WorkspaceStateVersion = {
          id: `ver-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp,
          description: "Зміна властивостей / Побудова",
          parts: JSON.parse(JSON.stringify(parts))
        };
        setHistoryVersions((prev) => {
          const updated = [newVersion, ...prev].slice(0, 15);
          localStorage.setItem("roblox_workspace_history", JSON.stringify(updated));
          return updated;
        });
        lastSavedPartsRef.current = parts;
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [parts]);

  // --- ACTIONS ---
  
  // Clear success banner automatically
  useEffect(() => {
    if (successBanner) {
      const timer = setTimeout(() => setSuccessBanner(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successBanner]);

  // Handle custom screenshot saved notifications
  useEffect(() => {
    const handleScreenshotSaved = () => {
      addLog("Знімок 3D-сцени успішно створено та завантажено на пристрій! 📸", "success");
      setSuccessBanner("Знімок екрана збережено!");
    };
    window.addEventListener("screenshot-saved", handleScreenshotSaved);
    return () => window.removeEventListener("screenshot-saved", handleScreenshotSaved);
  }, []);

  // Log append helper
  const addLog = (text: string, type: ConsoleLog["type"] = "info") => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        type,
        text,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // 1. Spawning basic primitive shapes (Block, Sphere, Cylinder, Wedge)
  const handleAddPart = (shape: RobloxPart["shape"]) => {
    const randomOffset = (Math.random() - 0.5) * 8;
    const newPart: RobloxPart = {
      id: `part-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${shape.charAt(0).toUpperCase() + shape.slice(1)}Part`,
      shape,
      color: ["#f44336", "#2196f3", "#ffca28", "#4caf50", "#ff9800", "#9c27b0"][Math.floor(Math.random() * 6)],
      position: [randomOffset, 5, randomOffset],
      size: shape === "sphere" ? [4, 4, 4] : shape === "wedge" ? [4, 3, 5] : [4, 4, 4],
      material: "SmoothPlastic",
      anchored: true,
      canCollide: true,
      transparency: 0
    };

    setParts((prev) => {
      const updated = [...prev, newPart];
      saveHistoryVersion(`Створено деталь ${newPart.name}`, updated);
      return updated;
    });
    setSelectedPartId(newPart.id);
    addLog(`Створено новий об'єкт: ${newPart.name} [${shape}] у Workspace.`, "info");
  };

  // 2. Spawning special prebuilt assets from Toolbox
  const handleSpawnToolboxItem = (item: ToolboxItem) => {
    const randomOffset = (Math.random() - 0.5) * 4;
    
    // Spawn item at a good height
    const newPart: RobloxPart = {
      id: `part-${Date.now()}`,
      name: item.name.split(" ")[0], // Use first word as Roblox name
      shape: item.shape,
      color: item.color,
      position: [randomOffset, item.size[1] / 2 + 0.1, randomOffset],
      size: item.size,
      material: item.material,
      anchored: item.anchored,
      canCollide: item.canCollide,
      transparency: 0,
      specialType: item.specialType,
      objData: item.objData
    };

    setParts((prev) => {
      const updated = [...prev, newPart];
      saveHistoryVersion(`Заспавнено з Toolbox: ${item.name}`, updated);
      return updated;
    });
    setSelectedPartId(newPart.id);
    addLog(`Заспавнено інструмент: ${item.name} у Workspace.`, "success");
    setSuccessBanner(`Успішно заспавнено: ${item.name}!`);
  };

  // 3. Clear workspace parts (keep baseplate)
  const handleClearWorkspace = () => {
    setParts((prev) => {
      const updated = prev.filter((p) => p.locked);
      saveHistoryVersion("Очищено Workspace", updated);
      return updated;
    });
    setSelectedPartId(null);
    addLog("Workspace очищено. Всі створені деталі видалено.", "warn");
  };

  // 4. Reset to Initial Demo Scene
  const handleResetDemo = () => {
    setParts(INITIAL_PARTS);
    saveHistoryVersion("Скинуто до початкового стану", INITIAL_PARTS);
    setSelectedPartId(null);
    setLogs([
      {
        id: `reset-${Date.now()}`,
        type: "info",
        text: "Сцену та Workspace скинуто до початкового стану.",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // 4b. Publish Game logic
  const [cloudGames, setCloudGames] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("roblox_cloud_games");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleSaveCloudGame = (newGame: any) => {
    setCloudGames((prev) => {
      const updated = [newGame, ...prev];
      localStorage.setItem("roblox_cloud_games", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteCloudGame = (id: string) => {
    setCloudGames((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      localStorage.setItem("roblox_cloud_games", JSON.stringify(updated));
      return updated;
    });
    addLog("Гру видалено з хмари Roblox Cloud.", "info");
  };

  const handlePublishGame = () => {
    setIsPublishOpen(true);
    setPublishProgress(null);
    setPublishSuccess(false);
  };

  const handleConfirmPublish = () => {
    setPublishProgress("Збереження структури Workspace...");
    setTimeout(() => {
      setPublishProgress("Компіляція скриптів Luau та метаданих сцен...");
    }, 800);
    setTimeout(() => {
      setPublishProgress("Завантаження 3D-моделей у Roblox Asset Cloud...");
    }, 1600);
    setTimeout(() => {
      setPublishProgress("Генерація публічного ігрового посилання та QR-коду...");
    }, 2400);
    setTimeout(() => {
      setPublishProgress(null);
      setPublishSuccess(true);

      const username = localStorage.getItem("roblox_persona_username") || "Robloxian Dev";
      const newCloudGame = {
        id: `cloud-${Date.now()}`,
        title: publishName,
        creator: username,
        description: publishDesc || "Спеціально створений паркур та 3D об'єкти.",
        playersCount: "0",
        likes: "100%",
        iconBg: ["from-purple-600 to-indigo-600", "from-emerald-500 to-teal-600", "from-amber-500 to-rose-600", "from-cyan-600 to-blue-600"][Math.floor(Math.random() * 4)],
        emoji: ["🕹️", "🚀", "🪐", "🏆", "🌋", "✨", "🔥"][Math.floor(Math.random() * 7)],
        difficulty: parts.length > 25 ? "Екстремальна" : parts.length > 12 ? "Середня" : "Легка",
        parts: JSON.parse(JSON.stringify(parts)),
        privacy: publishPrivacy,
        savedAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()
      };

      handleSaveCloudGame(newCloudGame);
      addLog(`Гру "${publishName}" успішно опубліковано у хмарі Roblox Cloud!`, "success");
    }, 3200);
  };

  // 5. Update properties of a part from Properties Panel
  const handleUpdatePart = (updatedPart: RobloxPart) => {
    setParts((prev) => prev.map((p) => (p.id === updatedPart.id ? updatedPart : p)));
  };

  // 5a. Delete Selected Part
  const handleDeleteSelectedPart = () => {
    if (!selectedPartId) return;
    const targetPart = parts.find((p) => p.id === selectedPartId);
    if (!targetPart) return;
    if (targetPart.locked) {
      addLog(`Неможливо видалити заблокований об'єкт: ${targetPart.name}`, "warn");
      return;
    }

    setParts((prev) => {
      const updated = prev.filter((p) => p.id !== selectedPartId);
      saveHistoryVersion(`Видалено об'єкт ${targetPart.name}`, updated);
      return updated;
    });
    setSelectedPartId(null);
    addLog(`Видалено об'єкт: ${targetPart.name}.`, "info");
  };

  // 5b. Duplicate Selected Part
  const handleDuplicateSelectedPart = () => {
    if (!selectedPartId) return;
    const targetPart = parts.find((p) => p.id === selectedPartId);
    if (!targetPart) return;

    const duplicatedPart: RobloxPart = {
      ...JSON.parse(JSON.stringify(targetPart)),
      id: `part-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${targetPart.name}_Copy`,
      position: [targetPart.position[0] + 3, targetPart.position[1] + 1, targetPart.position[2] + 3],
      locked: false
    };

    setParts((prev) => {
      const updated = [...prev, duplicatedPart];
      saveHistoryVersion(`Дубльовано об'єкт ${targetPart.name}`, updated);
      return updated;
    });
    setSelectedPartId(duplicatedPart.id);
    addLog(`Дубльовано об'єкт: ${targetPart.name} -> ${duplicatedPart.name}.`, "success");
    setSuccessBanner(`Об'єкт "${duplicatedPart.name}" створено!`);
  };

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  useEffect(() => {
    if (isTesting || activeView !== "studio") return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl && (
          activeEl.tagName === "INPUT" || 
          activeEl.tagName === "TEXTAREA" || 
          activeEl.hasAttribute("contenteditable") ||
          activeEl.closest("[contenteditable='true']")
        )
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // 1. Delete / Backspace -> Delete Selected Part
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedPartId) {
          e.preventDefault();
          handleDeleteSelectedPart();
        }
      }

      // 2. Duplicate (Ctrl + D / Cmd + D / Alt + D)
      if ((isCtrlOrCmd && e.key.toLowerCase() === "d") || (e.altKey && e.key.toLowerCase() === "d")) {
        if (selectedPartId) {
          e.preventDefault();
          handleDuplicateSelectedPart();
        }
      }

      // 3. Escape -> Deselect current object
      if (e.key === "Escape") {
        if (selectedPartId) {
          e.preventDefault();
          setSelectedPartId(null);
          addLog("Скасовано вибір об'єкта.", "info");
        }
      }

      // 4. Keyboard letters - Fast Spawning and Toggles
      if (!isCtrlOrCmd && !e.altKey && !e.shiftKey) {
        const key = e.key.toLowerCase();
        if (key === "b") {
          e.preventDefault();
          handleAddPart("block");
        } else if (key === "s") {
          e.preventDefault();
          handleAddPart("sphere");
        } else if (key === "c") {
          e.preventDefault();
          handleAddPart("cylinder");
        } else if (key === "w") {
          e.preventDefault();
          handleAddPart("wedge");
        } else if (key === "p") {
          e.preventDefault();
          setPhysicsActive(!physicsActive);
          addLog(!physicsActive ? "Фізичну симуляцію активовано!" : "Фізичну симуляцію зупинено.", "info");
        } else if (key === "g") {
          e.preventDefault();
          setGridVisible(!gridVisible);
          addLog(!gridVisible ? "Сітку відображено." : "Сітку приховано.", "info");
        } else if (key === "r") {
          e.preventDefault();
          setAutoRotate(!autoRotate);
          addLog(!autoRotate ? "Обертання увімкнено." : "Обертання вимкнено.", "info");
        }
      }

      // 5. F5 -> Start Play Test
      if (e.key === "F5") {
        e.preventDefault();
        setIsTesting(true);
        addLog("Початок тестування: Запуск повноцінного двигуна Roblox...", "success");
      }

      // 6. Switch Tabs (Keys '1' to '5')
      if (!isCtrlOrCmd && !e.altKey && !e.shiftKey) {
        const tabKeys: Record<string, ActiveRibbonTab> = {
          "1": "Home",
          "2": "Model",
          "3": "Test",
          "4": "View",
          "5": "AI Assistant"
        };
        if (tabKeys[e.key]) {
          e.preventDefault();
          setActiveRibbonTab(tabKeys[e.key]);
          addLog(`Переключено вкладку на: ${tabKeys[e.key]}`, "info");
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [
    isTesting,
    activeView,
    selectedPartId,
    parts,
    physicsActive,
    gridVisible,
    autoRotate
  ]);

  // 6. Natural Language 3D Spawning using Gemini API
  const handleGenerateAICommand = async (prompt: string) => {
    setIsLoading(true);
    addLog(`AI аналізує команду для будівництва: "${prompt}"...`, "info");
    setSuccessBanner("AI аналізує та будує 3D сцену...");

    try {
      const response = await fetch("/api/ai/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Не вдалося виконати генерацію.");
      }

      const data = await response.json();
      
      if (data.parts && Array.isArray(data.parts)) {
        const generatedParts: RobloxPart[] = data.parts.map((p: any, idx: number) => ({
          id: `ai-part-${Date.now()}-${idx}`,
          name: p.name || "AIPart",
          shape: p.shape || "block",
          color: p.color || "#ffffff",
          position: p.position || [0, 1, 0],
          size: p.size || [4, 4, 4],
          material: p.material || "Plastic",
          anchored: p.anchored !== undefined ? p.anchored : true,
          canCollide: p.canCollide !== undefined ? p.canCollide : true,
          transparency: p.transparency || 0,
        }));

        // Merge generated parts, keep locked ones
        setParts((prev) => {
          const updated = [...prev.filter((p) => p.locked), ...generatedParts];
          saveHistoryVersion(`AI побудова: "${prompt}"`, updated);
          return updated;
        });
        addLog(`AI успішно згенерував та збудував ${generatedParts.length} деталей!`, "success");
        setSuccessBanner(`AI успішно збудував: ${prompt}!`);
      } else {
        throw new Error("Некоректний формат відповіді від AI.");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Помилка генерації AI: ${err.message || "Невідома помилка"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Interactive Luau Code Interpreter / Simulator
  const handleRunScript = (code: string) => {
    addLog("Запуск Luau скрипта...", "info");
    
    const lines = code.split("\n");
    let hasError = false;
    let localVariables: Record<string, any> = {
      workspace: "workspace",
      game: "game",
    };

    const newSpawnedParts: RobloxPart[] = [];

    lines.forEach((rawLine, idx) => {
      const line = rawLine.trim();
      if (!line || line.startsWith("--")) return;

      try {
        if (line.startsWith("print(")) {
          const contentMatch = line.match(/print\s*\((.*)\)/);
          if (contentMatch) {
            let expr = contentMatch[1].trim();
            if (expr.startsWith('"') && expr.endsWith('"')) {
              addLog(expr.slice(1, -1), "lua");
            } else if (expr.startsWith("'") && expr.endsWith("'")) {
              addLog(expr.slice(1, -1), "lua");
            } else {
              if (expr.includes("..")) {
                const terms = expr.split("..");
                const resolved = terms.map((term) => {
                  const t = term.trim();
                  if (t.startsWith('"') && t.endsWith('"')) return t.slice(1, -1);
                  if (t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1);
                  if (t === "tostring(partCount)") return (parts.length + newSpawnedParts.length).toString();
                  if (localVariables[t] !== undefined) return localVariables[t];
                  return t;
                });
                addLog(resolved.join(""), "lua");
              } else {
                if (expr === "tostring(partCount)") {
                  addLog((parts.length + newSpawnedParts.length).toString(), "lua");
                } else if (localVariables[expr] !== undefined) {
                  addLog(String(localVariables[expr]), "lua");
                } else {
                  addLog(expr, "lua");
                }
              }
            }
          }
        }

        else if (line.startsWith("local ")) {
          const varMatch = line.match(/local\s+(\w+)\s*=\s*(.*)/);
          if (varMatch) {
            const varName = varMatch[1];
            let valExpr = varMatch[2].trim();
            if (valExpr.startsWith('"') && valExpr.endsWith('"')) {
              localVariables[varName] = valExpr.slice(1, -1);
            } else if (valExpr.startsWith("'") && valExpr.endsWith("'")) {
              localVariables[varName] = valExpr.slice(1, -1);
            } else if (!isNaN(Number(valExpr))) {
              localVariables[varName] = Number(valExpr);
            } else {
              localVariables[varName] = valExpr;
            }
          }
        }

        else if (line.includes('Instance.new("Part")') || line.includes("Instance.new('Part')")) {
          const partVarMatch = line.match(/(?:local\s+)?(\w+)\s*=\s*Instance\.new/);
          const varName = partVarMatch ? partVarMatch[1] : "part";

          const simId = `sim-part-${Date.now()}-${idx}`;
          const simPart: RobloxPart = {
            id: simId,
            name: "Part",
            shape: "block",
            color: "#415a77",
            position: [0, 8, 0],
            size: [4, 1, 4],
            material: "Plastic",
            anchored: true,
            canCollide: true,
            transparency: 0
          };

          newSpawnedParts.push(simPart);
          localVariables[varName] = simId;
          addLog(`[Luau] Створено новий екземпляр Instance.new("Part")`, "info");
        }

        else if (line.startsWith("for i = 1, 10 do")) {
          addLog("[Luau Engine] Виявлено цикл побудови сходів! Генеруємо 10 деталей...", "info");
          for (let i = 1; i <= 10; i++) {
            const stairStep: RobloxPart = {
              id: `stair-${Date.now()}-${i}`,
              name: `Stair_${i}`,
              shape: "block",
              color: ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557"][i % 5],
              position: [0, i, i * 2],
              size: [6, 0.8, 2.5],
              material: "Slate",
              anchored: true,
              canCollide: true,
              transparency: 0
            };
            newSpawnedParts.push(stairStep);
          }
        }

        else if (line.includes(".Touched:Connect")) {
          const componentNameMatch = line.match(/(\w+)\.Touched/);
          const varName = componentNameMatch ? componentNameMatch[1] : "part";
          addLog(`[Luau Engine] Подія Touched підключена до об'єкта ${varName}! При торканні відбудеться подія.`, "success");
        }

        else if (line.includes(":Destroy()")) {
          const destroyMatch = line.match(/(\w+):Destroy\(\)/);
          if (destroyMatch) {
            const varName = destroyMatch[1];
            setParts((prev) => {
              const updated = prev.filter((p) => p.name.toLowerCase() !== varName.toLowerCase() && p.specialType !== "coin");
              saveHistoryVersion(`Скрипт видалив об'єкт ${varName}`, updated);
              return updated;
            });
            addLog(`[Luau Engine] Об'єкт ${varName} успішно видалено (:Destroy() викликано)`, "warn");
          }
        }

      } catch (err: any) {
        hasError = true;
        addLog(`Помилка рядка ${idx + 1}: ${err.message}`, "error");
      }
    });

    if (newSpawnedParts.length > 0) {
      setParts((prev) => {
        const updated = [...prev, ...newSpawnedParts];
        saveHistoryVersion(`Luau скрипт: Створено ${newSpawnedParts.length} деталей`, updated);
        return updated;
      });
      addLog(`Luau Engine: Створено ${newSpawnedParts.length} деталей за допомогою скрипта!`, "success");
      setSuccessBanner("Luau скрипт успішно збудував деталі!");
    } else if (!hasError) {
      addLog("Скрипт виконано успішно.", "success");
      setSuccessBanner("Luau скрипт виконано!");
    }
  };

  // 8. Analyze Code trigger (Syntax linter)
  const handleAnalyzeCode = (code: string) => {
    const errorList: string[] = [];
    
    if (!code.includes("end") && (code.includes("function") || code.includes("if ") || code.includes("for "))) {
      errorList.push("Можливо, пропущено ключове слово 'end' для закриття блоку.");
    }
    if (code.includes("pritn(")) {
      errorList.push("Виявлено опечатку: 'pritn' замість 'print'.");
    }
    if (code.includes("Vector3.new") && !code.includes("(")) {
      errorList.push("Перевірте виклик Vector3.new — можливо, пропущені круглі дужки.");
    }

    if (errorList.length > 0) {
      errorList.forEach((err) => addLog(`[Linter] ${err}`, "warn"));
    } else {
      addLog("[Linter] Синтаксичних помилок у Luau коді не виявлено. Код охайний!", "success");
    }
  };

  // 9. Quick insert code callback
  const handleInsertCode = (code: string) => {
    setActiveScriptCode(code);
    addLog("Код з AI Асистента успішно вставлено в редактор скриптів.", "success");
  };

  const selectedPart = parts.find((p) => p.id === selectedPartId) || null;

  if (activeView === "menu") {
    return (
      <MainMenu 
        onStartStudio={() => {
          setActiveView("studio");
          setIsTesting(false);
        }}
        onPlayPremadeGame={(game, customRoomId) => {
          setParts(game.parts);
          setActiveRoomId(customRoomId || game.id);
          setCurrentGameTitle(game.title);
          setIsTesting(true);
          setActiveView("play");
        }}
        cloudGames={cloudGames}
        onDeleteCloudGame={handleDeleteCloudGame}
        onSaveCloudGame={handleSaveCloudGame}
        onEditCloudGame={(game) => {
          setParts(game.parts);
          setActiveView("studio");
          setIsTesting(false);
          setSelectedPartId(null);
          addLog(`Завантажено проєкт "${game.title}" з хмари Roblox Cloud у Studio!`, "success");
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] flex flex-col font-sans select-none overflow-hidden relative" id="app-root-main">
      
      {/* Immersive Roblox Play Test Screen Overlay */}
      {isTesting && (
        <GameTestMode 
          parts={parts} 
          vcVolume={vcVolume}
          onVcVolumeChange={handleVcVolumeChange}
          activeRoomId={activeRoomId}
          currentGameTitle={currentGameTitle}
          onLeaveGame={() => {
            setIsTesting(false);
            if (activeView === "play") {
              setActiveView("menu");
            }
            addLog("Тестування завершено. Повернення в режим редагування Roblox Studio.", "info");
          }} 
        />
      )}

      {/* 3D BUILD CELEBRATION FLOATING SUCCESS BANNER */}
      {successBanner && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-[#00FF88] border border-black/10 text-black font-bold text-xs px-6 py-3 rounded shadow-2xl animate-bounce backdrop-blur-md font-mono tracking-wider">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
            <span>{successBanner}</span>
          </div>
        </div>
      )}

      {/* TOP HEADER STATUS LINE */}
      <header className="p-3 bg-dark border-b border-border-custom flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          {/* Custom Roblox studio logo badge */}
          <div className="w-8 h-8 rounded border border-brand bg-brand-dim flex items-center justify-center shadow">
            <div className="font-bold text-xs tracking-tighter text-brand font-mono">
              RS
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight flex items-center gap-1.5">
              <span>Roblox Studio Online</span>
              <span className="text-[9px] bg-brand-dim border border-brand/20 text-brand px-2 py-0.5 rounded font-mono">
                ONLINE
              </span>
            </h1>
            <p className="text-[10px] text-text-dim font-mono">Мій перший проєкт розробки Roblox Studio у браузері</p>
          </div>

          <div className="w-px h-6 bg-border-custom mx-1 hidden sm:block" />

          <button
            onClick={() => {
              setActiveView("menu");
              setIsTesting(false);
            }}
            className="flex items-center gap-1 px-3 py-1 bg-white/5 hover:bg-brand/10 hover:text-brand border border-white/10 hover:border-brand/40 rounded text-xs text-text-mid transition-all cursor-pointer font-sans"
            title="Повернутися до Головного Меню"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-brand" />
            <span className="font-bold text-[10px] uppercase tracking-wider">У головне меню</span>
          </button>

          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-brand/10 hover:text-brand border border-white/10 hover:border-brand/40 rounded text-xs text-text-mid transition-all cursor-pointer font-sans"
            title="Переглянути гарячі клавіші"
          >
            <Keyboard className="w-3.5 h-3.5 text-brand" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Гарячі клавіші</span>
          </button>
        </div>

        {/* Status indicator badges */}
        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-center gap-2 text-[10px] bg-panel-light border border-border-custom px-3 py-1.5 rounded text-text-mid">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
            <span>LUAU ENGINE: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] bg-panel-light border border-border-custom px-3 py-1.5 rounded text-text-mid">
            <Bot className="w-3.5 h-3.5 text-brand animate-pulse" />
            <span>GEMINI: ACTIVE</span>
          </div>
        </div>
      </header>

      {/* TOP MENUS RIBBON */}
      <section className="p-2.5 bg-panel border-b border-border-custom shadow-inner">
        <RibbonBar
          activeTab={activeRibbonTab}
          setActiveTab={setActiveRibbonTab}
          onAddPart={handleAddPart}
          physicsActive={physicsActive}
          setPhysicsActive={setPhysicsActive}
          gridVisible={gridVisible}
          setGridVisible={setGridVisible}
          autoRotate={autoRotate}
          setAutoRotate={setAutoRotate}
          onClearWorkspace={handleClearWorkspace}
          onGenerateAICommand={handleGenerateAICommand}
          onResetDemo={handleResetDemo}
          vcVolume={vcVolume}
          onVcVolumeChange={handleVcVolumeChange}
          onPublishGame={handlePublishGame}
          onStartTesting={() => {
            setActiveRoomId("studio-test");
            setCurrentGameTitle("Roblox Studio Test Server");
            setIsTesting(true);
            addLog("Початок тестування: Запуск повноцінного двигуна Roblox...", "success");
          }}
        />
      </section>

      {/* MAIN CONTAINER WORKSPACE */}
      <section className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-3 p-3 min-h-0 overflow-y-auto xl:overflow-hidden bg-[#0A0A0A] bg-dot-grid">
        
        {/* LEFT COLUMN: EXPLORER & TOOLBOX (Col span: 3) */}
        <div className="xl:col-span-3 flex flex-col gap-3 min-h-[300px] xl:min-h-0 xl:h-full">
          <div className="flex-1 min-h-[200px] xl:h-1/2">
            <Explorer
              explorerData={INITIAL_EXPLORER}
              selectedPartId={selectedPartId}
              selectedScriptId={selectedScriptId}
              onSelectPart={setSelectedPartId}
              onSelectScript={setSelectedScriptId}
              parts={parts}
              historyVersions={historyVersions}
              onRestoreVersion={handleRestoreHistoryVersion}
              onCreateCheckpoint={handleCreateManualCheckpoint}
              onClearHistory={handleClearHistory}
            />
          </div>
          <div className="flex-1 min-h-[220px] xl:h-1/2">
            <ToolboxPanel 
              onSpawnItem={handleSpawnToolboxItem} 
              customItems={customItems}
              onAddCustomItem={handleAddCustomItem}
            />
          </div>
        </div>

        {/* MIDDLE COLUMN: 3D VIEWPORT & OUTPUT LOGS (Col span: 5) */}
        <div className="xl:col-span-5 flex flex-col gap-3 min-h-[400px] xl:min-h-0 xl:h-full">
          {/* Interactive 3D Canvas rendering */}
          <div className="flex-[3] min-h-[260px] xl:h-[65%] bg-panel border border-border-custom rounded-xl overflow-hidden relative shadow-2xl">
            <ThreeViewport
              parts={parts}
              selectedPartId={selectedPartId}
              onSelectPart={setSelectedPartId}
              autoRotate={autoRotate}
              gridVisible={gridVisible}
              physicsActive={physicsActive}
            />
          </div>

          {/* Console logger panel */}
          <div className="flex-[2] min-h-[140px] xl:h-[35%]">
            <ConsolePanel logs={logs} onClearLogs={() => setLogs([])} />
          </div>
        </div>

        {/* RIGHT COLUMN: SCRIPT EDITOR & PROPERTIES & AI (Col span: 4) */}
        <div className="xl:col-span-4 flex flex-col gap-3 min-h-[420px] xl:min-h-0 xl:h-full">
          
          {/* Dynamic properties based on selection */}
          <div className="flex-1 min-h-[180px] xl:h-[35%]">
            <PropertiesPanel selectedPart={selectedPart} onChangePart={handleUpdatePart} />
          </div>

          {/* Script area & AI Assistant */}
          <div className="flex-[2] flex flex-col gap-3 min-h-[240px] xl:h-[65%]">
            {activeRibbonTab === "AI Assistant" ? (
              <div className="flex-1 h-full min-h-[240px]">
                <AIAssistant
                  onInsertCode={handleInsertCode}
                  onGenerateAICommand={handleGenerateAICommand}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
            ) : (
              <div className="flex-1 h-full min-h-[240px]">
                <ScriptEditor
                  onRunScript={handleRunScript}
                  onInsertCode={handleInsertCode}
                  activeScriptCode={activeScriptCode}
                  setActiveScriptCode={setActiveScriptCode}
                  onAnalyzeCode={handleAnalyzeCode}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER BAR */}
      <footer className="p-3 bg-dark border-t border-border-custom text-[11px] text-text-dim flex items-center justify-between px-4 select-none font-mono">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-brand shrink-0" />
          <span>Спробуйте вкладку <strong className="text-brand font-bold">AI Помічник</strong> для консультації чи генерації 3D сцен.</span>
        </div>
        <div className="text-[10px] font-bold tracking-wider text-text-mid">
          Roblox Studio Web Sandbox · Слава Україні! 🇺🇦
        </div>
      </footer>

      {/* KEYBOARD SHORTCUTS MODAL OVERLAY */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-panel border border-border-custom max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-dark border-b border-border-custom flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-sans">
                  Гарячі клавіші (Keyboard Shortcuts)
                </h3>
              </div>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="p-1.5 hover:bg-white/10 text-text-dim hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Закрити"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 font-sans text-xs text-text-mid scrollbar-thin">
              <p className="text-[11px] text-text-dim leading-relaxed font-sans">
                Використовуйте ці швидкі клавіші для миттєвого редагування, навігації та маніпулювання 3D простором у Roblox Studio. Гарячі клавіші активні лише в режимі редагування.
              </p>

              {/* Group 1: Manipulation */}
              <div className="space-y-2">
                <span className="text-[9px] text-brand font-bold uppercase tracking-wider block font-mono border-b border-brand/20 pb-1">
                  Маніпуляція об'єктами
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="font-medium text-white">Видалити вибраний об'єкт</span>
                    <kbd className="px-2 py-1 bg-dark border border-border-custom rounded text-[10px] text-brand font-mono font-bold shadow">
                      Delete / Backspace
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="font-medium text-white">Дублювати об'єкт у просторі</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-1 bg-dark border border-border-custom rounded text-[10px] text-text-mid font-mono shadow">
                        Ctrl / Cmd + D
                      </kbd>
                      <span className="text-text-dim">або</span>
                      <kbd className="px-1.5 py-1 bg-dark border border-border-custom rounded text-[10px] text-text-mid font-mono shadow">
                        Alt + D
                      </kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="font-medium text-white">Скасувати вибір (Deselect)</span>
                    <kbd className="px-2 py-1 bg-dark border border-border-custom rounded text-[10px] text-text-mid font-mono shadow">
                      Esc
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Group 2: Spawning Primitives */}
              <div className="space-y-2">
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block font-mono border-b border-amber-400/20 pb-1">
                  Швидке додавання деталей (Part Spawning)
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="font-medium text-white">Додати Блок (BlockPart)</span>
                    <kbd className="px-2 py-0.5 bg-dark border border-border-custom rounded text-[10px] text-white font-mono font-bold shadow">
                      B
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="font-medium text-white">Додати Кулю (SpherePart)</span>
                    <kbd className="px-2 py-0.5 bg-dark border border-border-custom rounded text-[10px] text-white font-mono font-bold shadow">
                      S
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="font-medium text-white">Додати Циліндр (CylinderPart)</span>
                    <kbd className="px-2 py-0.5 bg-dark border border-border-custom rounded text-[10px] text-white font-mono font-bold shadow">
                      C
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="font-medium text-white">Додати Клин (WedgePart)</span>
                    <kbd className="px-2 py-0.5 bg-dark border border-border-custom rounded text-[10px] text-white font-mono font-bold shadow">
                      W
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Group 3: Simulation */}
              <div className="space-y-2">
                <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider block font-mono border-b border-sky-400/20 pb-1">
                  Симуляція та Середовище
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="font-medium text-white">Запустити повноцінний Play Test</span>
                    <kbd className="px-2 py-1 bg-dark border border-border-custom rounded text-[10px] text-sky-400 font-mono font-bold shadow">
                      F5
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="font-medium text-white">Перемкнути симуляцію фізики</span>
                    <kbd className="px-2 py-0.5 bg-dark border border-border-custom rounded text-[10px] text-white font-mono font-bold shadow">
                      P
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="font-medium text-white">Показати / приховати 3D сітку</span>
                    <kbd className="px-2 py-0.5 bg-dark border border-border-custom rounded text-[10px] text-white font-mono font-bold shadow">
                      G
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="font-medium text-white">Увімкнути / вимкнути автообертання камери</span>
                    <kbd className="px-2 py-0.5 bg-dark border border-border-custom rounded text-[10px] text-white font-mono font-bold shadow">
                      R
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Group 4: Tabs */}
              <div className="space-y-2">
                <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider block font-mono border-b border-purple-400/20 pb-1">
                  Навігація вкладками меню
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-1">
                    <span className="font-medium text-white">Швидке перемикання вкладок</span>
                    <div className="flex gap-1 items-center">
                      <kbd className="px-2 py-0.5 bg-dark border border-border-custom rounded text-[10px] text-white font-mono font-bold shadow">
                        1
                      </kbd>
                      <span className="text-text-dim text-[10px] font-mono">...</span>
                      <kbd className="px-2 py-0.5 bg-dark border border-border-custom rounded text-[10px] text-white font-mono font-bold shadow">
                        5
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-dark border-t border-border-custom flex justify-end">
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="px-4 py-2 bg-brand hover:bg-brand-bright text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                Зрозуміло
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROBLOX CLOUD PUBLISH MODAL OVERLAY */}
      {isPublishOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-panel border-2 border-[#00A2FF]/30 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] relative animate-fade-in">
            {/* Ambient background glow */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#00A2FF]/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Modal Header */}
            <div className="p-4 bg-dark border-b border-border-custom flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00A2FF] animate-spin-slow" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-sans">
                  Опублікувати гру (Publish Game)
                </h3>
              </div>
              <button
                onClick={() => {
                  if (!publishProgress) setIsPublishOpen(false);
                }}
                disabled={!!publishProgress}
                className="p-1.5 hover:bg-white/10 text-text-dim hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Закрити"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 font-sans text-xs text-text-mid scrollbar-thin relative z-10">
              {publishProgress ? (
                /* LOADING STATE */
                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 border-4 border-[#00A2FF]/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[#00A2FF] border-t-transparent rounded-full animate-spin" />
                    <Globe className="w-6 h-6 text-[#00A2FF] absolute inset-0 m-auto animate-pulse" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-white animate-pulse">{publishProgress}</p>
                    <p className="text-[10px] text-text-dim">Будь ласка, зачекайте. Триває розгортання ігрових серверів Roblox Cloud...</p>
                  </div>

                  <div className="w-full bg-dark border border-border-custom h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00A2FF] to-[#00FF88] rounded-full animate-progress" style={{ width: "100%" }} />
                  </div>
                </div>
              ) : publishSuccess ? (
                /* SUCCESS STATE */
                <div className="flex flex-col items-center justify-center py-4 space-y-5 text-center animate-scale-up">
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 relative">
                    <span className="absolute inset-0 rounded-full bg-emerald-500/5 animate-ping" />
                    <Globe className="w-10 h-10 animate-pulse" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-base font-black text-white">ГРУ УСПІШНО ОПУБЛІКОВАНО! 🎉</h4>
                    <p className="text-xs text-text-dim max-w-sm mx-auto">
                      Вітаємо! Ваш оббі-проєкт тепер доступний мільйонам гравців у всесвіті Roblox!
                    </p>
                  </div>

                  {/* Mock Game Card Details */}
                  <div className="w-full bg-dark border border-border-custom p-4 rounded-xl space-y-3 text-left">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] text-text-dim uppercase tracking-wider font-mono">Назва</span>
                      <span className="text-xs font-bold text-white">{publishName}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] text-text-dim uppercase tracking-wider font-mono">ID гри (PlaceId)</span>
                      <span className="text-xs font-mono font-bold text-[#00A2FF]">#893155{Math.floor(Math.random() * 90 + 10)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] text-text-dim uppercase tracking-wider font-mono">Статус доступу</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        publishPrivacy === "public" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {publishPrivacy === "public" ? "Публічна (Public)" : "Приватна (Private)"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-text-dim uppercase tracking-wider font-mono block">Пряме посилання для друзів</span>
                      <div className="flex items-center gap-2 bg-panel p-2 rounded border border-border-custom font-mono text-[11px] text-white overflow-x-auto select-all">
                        <span>https://roblox.studio/games/893155/{publishName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#00FF88] font-bold flex items-center gap-1">
                    <span>⚡ Глобальний мультиплеєр та голосовий чат ботів активовані!</span>
                  </p>
                </div>
              ) : (
                /* CONFIGURATION STATE */
                <div className="space-y-4">
                  <p className="text-[11px] text-text-dim leading-relaxed">
                    Налаштуйте метадані вашої карти перед тим, як завантажити її на хмару Roblox Cloud. Після публікації ви отримаєте пряме посилання для запуску гри у нашому Roblox Launcher.
                  </p>

                  <div className="space-y-3.5">
                    {/* Game Title */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-text-dim uppercase tracking-wider font-bold font-mono">Назва гри (Title) *</label>
                      <input
                        type="text"
                        value={publishName}
                        onChange={(e) => setPublishName(e.target.value)}
                        placeholder="Введіть назву гри..."
                        className="w-full bg-dark border border-border-custom rounded-lg p-2.5 text-white placeholder-text-dim focus:border-[#00A2FF] focus:ring-1 focus:ring-[#00A2FF]/30 outline-none text-xs transition-all font-sans"
                        maxLength={50}
                        required
                      />
                    </div>

                    {/* Game Description */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-text-dim uppercase tracking-wider font-bold font-mono">Опис проєкту (Description)</label>
                      <textarea
                        value={publishDesc}
                        onChange={(e) => setPublishDesc(e.target.value)}
                        placeholder="Опишіть вашу гру для спільноти..."
                        className="w-full bg-dark border border-border-custom rounded-lg p-2.5 h-20 text-white placeholder-text-dim focus:border-[#00A2FF] focus:ring-1 focus:ring-[#00A2FF]/30 outline-none text-xs resize-none transition-all font-sans"
                        maxLength={200}
                      />
                    </div>

                    {/* Privacy Option */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-text-dim uppercase tracking-wider font-bold font-mono block">Приватність доступу (Privacy)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPublishPrivacy("public")}
                          className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all cursor-pointer ${
                            publishPrivacy === "public"
                              ? "bg-[#00A2FF]/10 border-[#00A2FF] text-white"
                              : "bg-dark border-border-custom hover:border-white/20 text-text-mid"
                          }`}
                        >
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Публічна (Public)</span>
                          </span>
                          <span className="text-[10px] text-text-dim">Кожен може зайти у вашу гру за посиланням</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPublishPrivacy("private")}
                          className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all cursor-pointer ${
                            publishPrivacy === "private"
                              ? "bg-[#00A2FF]/10 border-[#00A2FF] text-white"
                              : "bg-dark border-border-custom hover:border-white/20 text-text-mid"
                          }`}
                        >
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Приватна (Private)</span>
                          </span>
                          <span className="text-[10px] text-text-dim">Гра доступна лише вам та розробникам</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-dark border-t border-border-custom flex justify-between items-center relative z-10">
              {publishSuccess ? (
                <>
                  <button
                    onClick={() => {
                      setIsPublishOpen(false);
                      setActiveRoomId(`cloud-game-${publishName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
                      setCurrentGameTitle(publishName);
                      setIsTesting(true); // Launch GameTestMode immediately!
                      addLog("Запуск опублікованої версії гри у Roblox Launcher...", "success");
                    }}
                    className="px-5 py-2.5 bg-[#00FF88] hover:bg-[#00dd77] text-black font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-lg flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-black text-black" />
                    <span>Зіграти в лаунчері (Play Now)</span>
                  </button>
                  <button
                    onClick={() => setIsPublishOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer border border-white/10"
                  >
                    Закрити
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsPublishOpen(false)}
                    disabled={!!publishProgress}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Скасувати
                  </button>
                  <button
                    onClick={handleConfirmPublish}
                    disabled={!!publishProgress}
                    className="px-5 py-2.5 bg-[#00A2FF] hover:bg-[#0088dd] text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Підтвердити публікацію</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
