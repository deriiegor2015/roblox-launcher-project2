import React, { useState, useEffect } from "react";
import { TOOLBOX_ITEMS } from "../data";
import { ToolboxItem } from "../types";
import { 
  Sparkles, 
  MapPin, 
  Flame, 
  ArrowUpCircle, 
  Zap, 
  Coins, 
  Trees, 
  Skull, 
  Lightbulb, 
  Flag,
  Wrench,
  Upload,
  Layers,
  PlusCircle,
  HelpCircle,
  Info
} from "lucide-react";

interface ToolboxPanelProps {
  onSpawnItem: (item: ToolboxItem) => void;
  customItems: ToolboxItem[];
  onAddCustomItem: (item: ToolboxItem) => void;
}

// Creative 3D OBJ templates
const OCTAHEDRON_CRYSTAL_VERTICES = [
  0, 2, 0,    // Top point (Index 0)
  1, 0, 1,    // Corner 1 (Index 1)
  -1, 0, 1,   // Corner 2 (Index 2)
  -1, 0, -1,  // Corner 3 (Index 3)
  1, 0, -1,   // Corner 4 (Index 4)
  0, -2, 0    // Bottom point (Index 5)
];
const OCTAHEDRON_CRYSTAL_FACES = [
  0, 1, 2,   0, 2, 3,   0, 3, 4,   0, 4, 1,
  5, 2, 1,   5, 3, 2,   5, 4, 3,   5, 1, 4
];

const SWORD_VERTICES = [
  0, 4, 0,     // Tip (0)
  0.4, 0, 0.1,  // Blade Right (1)
  -0.4, 0, 0.1, // Blade Left (2)
  0, 0, -0.2,   // Blade Back (3)
  0, -1.5, 0    // Hilt Bottom (4)
];
const SWORD_FACES = [
  0, 1, 2,   0, 2, 3,   0, 3, 1,
  1, 4, 2,   2, 4, 3,   3, 4, 1
];

const CROWN_VERTICES = [
  -1.2, 0, -1.2,   1.2, 0, -1.2,   1.2, 0, 1.2,   -1.2, 0, 1.2,  // Base (0-3)
  0, 1.8, 0,       // Center tip (4)
  -1.2, 1.2, 0,    // Peak Left (5)
  1.2, 1.2, 0      // Peak Right (6)
];
const CROWN_FACES = [
  0, 1, 4,   1, 2, 4,   2, 3, 4,   3, 0, 4,
  0, 5, 3,   1, 6, 2
];

export default function ToolboxPanel({ onSpawnItem, customItems, onAddCustomItem }: ToolboxPanelProps) {
  const [activeTab, setActiveTab] = useState<"standard" | "custom">("standard");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "MapPin":
        return <MapPin className="w-4 h-4 text-amber-400" />;
      case "Flame":
        return <Flame className="w-4 h-4 text-red-500" />;
      case "ArrowUpCircle":
        return <ArrowUpCircle className="w-4 h-4 text-cyan-400" />;
      case "Zap":
        return <Zap className="w-4 h-4 text-brand" />;
      case "Coins":
        return <Coins className="w-4 h-4 text-yellow-400" />;
      case "Trees":
        return <Trees className="w-4 h-4 text-[#00FF88]" />;
      case "Skull":
        return <Skull className="w-4 h-4 text-rose-500" />;
      case "Lightbulb":
        return <Lightbulb className="w-4 h-4 text-yellow-300" />;
      case "Flag":
        return <Flag className="w-4 h-4 text-sky-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand" />;
    }
  };

  // OBJ File Upload parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n");
        const vertices: number[] = [];
        const faces: number[] = [];

        for (let line of lines) {
          line = line.trim();
          if (line.startsWith("v ")) {
            const parts = line.split(/\s+/).slice(1).map(Number);
            if (parts.length >= 3 && !parts.some(isNaN)) {
              vertices.push(parts[0], parts[1], parts[2]);
            }
          } else if (line.startsWith("f ")) {
            const parts = line.split(/\s+/).slice(1);
            // OBJ indices are 1-indexed. Subtract 1 to make them 0-indexed for ThreeJS.
            const faceIndices = parts.map(p => {
              const firstVal = p.split("/")[0];
              return parseInt(firstVal) - 1;
            }).filter(num => !isNaN(num));

            if (faceIndices.length === 3) {
              faces.push(faceIndices[0], faceIndices[1], faceIndices[2]);
            } else if (faceIndices.length === 4) {
              // Triangulate quad
              faces.push(faceIndices[0], faceIndices[1], faceIndices[2]);
              faces.push(faceIndices[0], faceIndices[2], faceIndices[3]);
            }
          }
        }

        if (vertices.length === 0) {
          setUploadError("Не вдалося розпарсити вершини. Переконайтеся, що файл містить рядки типу 'v x y z'.");
          return;
        }

        const newModel: ToolboxItem = {
          name: file.name.replace(".obj", "") || "My custom model",
          description: `Імпортований користувачем .obj (${vertices.length / 3} вершин)`,
          icon: "Sparkles",
          specialType: "custom_obj",
          color: "#00FF88",
          shape: "block",
          size: [3, 3, 3],
          material: "Metal",
          anchored: true,
          canCollide: true,
          objData: { vertices, faces, name: file.name }
        };

        onAddCustomItem(newModel);
        setUploadError(null);
        // Automatically switch to custom tab to view the item!
        setActiveTab("custom");
      } catch (err) {
        setUploadError("Помилка зчитування файлу .obj. Перевірте формат.");
      }
    };
    reader.readAsText(file);
  };

  // Add a pre-made template as custom asset
  const handleLoadTemplate = (type: "crystal" | "sword" | "crown") => {
    let name = "";
    let description = "";
    let color = "";
    let vertices: number[] = [];
    let faces: number[] = [];

    if (type === "crystal") {
      name = "Легендарний Рубін (Gem)";
      description = "3D кристал утворений подвійною пірамідою.";
      color = "#ff1744";
      vertices = OCTAHEDRON_CRYSTAL_VERTICES;
      faces = OCTAHEDRON_CRYSTAL_FACES;
    } else if (type === "sword") {
      name = "Меч Переможця Obby";
      description = "Гостра Luau 3D модель меча.";
      color = "#2979ff";
      vertices = SWORD_VERTICES;
      faces = SWORD_FACES;
    } else {
      name = "Корона Короля (Lord Crown)";
      description = "Преміальна золота корона розробника.";
      color = "#ffd700";
      vertices = CROWN_VERTICES;
      faces = CROWN_FACES;
    }

    const newTemplateItem: ToolboxItem = {
      name,
      description,
      icon: "Sparkles",
      specialType: "custom_obj",
      color,
      shape: "block",
      size: [3, 3, 3],
      material: "Metal",
      anchored: true,
      canCollide: true,
      objData: { vertices, faces, name }
    };

    onAddCustomItem(newTemplateItem);
    setActiveTab("custom");
  };

  return (
    <div className="bg-panel border border-border-custom rounded-xl flex flex-col h-full overflow-hidden shadow-xl select-none" id="toolbox-panel">
      {/* Toolbox Header */}
      <div className="p-3 bg-dark border-b border-border-custom flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-brand" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Інструменти (Toolbox)</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-dim border border-brand/20 px-2.5 py-0.5 rounded text-[10px] text-brand font-mono">
          <Sparkles className="w-3 h-3 text-brand animate-pulse" />
          <span>3D ASSETS</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-custom bg-dark/40 shrink-0">
        <button
          onClick={() => setActiveTab("standard")}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
            activeTab === "standard" 
              ? "border-brand text-brand bg-panel-light/30" 
              : "border-transparent text-text-dim hover:text-white"
          }`}
        >
          Основні блоки
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
            activeTab === "custom" 
              ? "border-brand text-brand bg-panel-light/30" 
              : "border-transparent text-text-dim hover:text-white"
          }`}
        >
          Власні .OBJ ({customItems.length})
        </button>
      </div>

      {/* Main lists */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        
        {activeTab === "standard" && (
          <div className="space-y-2">
            {TOOLBOX_ITEMS.map((item) => (
              <button
                key={item.name}
                onClick={() => onSpawnItem(item)}
                className="w-full text-left bg-dark border border-border-custom hover:border-brand/40 hover:bg-panel-light rounded-lg p-2.5 flex gap-3 transition-all cursor-pointer group"
                id={`toolbox-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-9 h-9 bg-panel border border-border-custom flex items-center justify-center shrink-0 group-hover:border-brand/50 transition-colors">
                  {getIconComponent(item.icon)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate group-hover:text-brand transition-colors font-mono">
                      {item.name}
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-panel border border-border-custom text-text-dim font-mono shrink-0 scale-95 origin-right">
                      {item.material}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-dim leading-relaxed mt-1 truncate font-sans">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "custom" && (
          <div className="space-y-4">
            
            {/* OBJ Uploader zone */}
            <div className="bg-dark/60 border border-dashed border-border-custom rounded-xl p-4 text-center space-y-3">
              <Upload className="w-6 h-6 text-brand mx-auto" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">Завантажити власну модель</span>
                <p className="text-[9px] text-text-dim max-w-[200px] mx-auto font-sans leading-relaxed">
                  Оберіть ваш 3D файл у форматі <strong>.obj</strong> з комп'ютера, ми автоматично розпарсимо його вершини!
                </p>
              </div>

              {uploadError && (
                <div className="text-[10px] text-red-400 font-mono bg-red-950/20 p-2 rounded border border-red-500/20">
                  {uploadError}
                </div>
              )}

              <label className="inline-block px-3.5 py-1.5 bg-brand hover:bg-brand-bright text-black font-bold text-[10px] rounded cursor-pointer uppercase transition-all">
                <span>Вибрати .obj</span>
                <input 
                  type="file" 
                  accept=".obj" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Template Presets */}
            <div className="space-y-2">
              <span className="text-[9px] text-text-dim font-bold font-mono tracking-wider block uppercase">Швидкі 3D шаблони</span>
              
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleLoadTemplate("crystal")}
                  className="bg-dark hover:bg-panel-light border border-border-custom p-2 rounded-lg text-center cursor-pointer transition-all hover:border-[#ff1744]/40"
                >
                  <span className="text-lg block">💎</span>
                  <span className="text-[9px] text-white block font-semibold font-mono mt-1">Кристал</span>
                </button>

                <button
                  onClick={() => handleLoadTemplate("sword")}
                  className="bg-dark hover:bg-panel-light border border-border-custom p-2 rounded-lg text-center cursor-pointer transition-all hover:border-[#2979ff]/40"
                >
                  <span className="text-lg block">⚔️</span>
                  <span className="text-[9px] text-white block font-semibold font-mono mt-1">Меч</span>
                </button>

                <button
                  onClick={() => handleLoadTemplate("crown")}
                  className="bg-dark hover:bg-panel-light border border-border-custom p-2 rounded-lg text-center cursor-pointer transition-all hover:border-yellow-400/40"
                >
                  <span className="text-lg block">👑</span>
                  <span className="text-[9px] text-white block font-semibold font-mono mt-1">Корона</span>
                </button>
              </div>
            </div>

            {/* Custom loaded items list */}
            <div className="space-y-2">
              <span className="text-[9px] text-text-dim font-bold font-mono tracking-wider block uppercase">Ваша бібліотека ({customItems.length})</span>
              
              {customItems.length === 0 ? (
                <div className="text-center p-6 text-[10px] text-text-dim font-sans italic">
                  Поки немає збережених моделей. Завантажте .obj або виберіть один із пресетів вище!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {customItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSpawnItem(item)}
                      className="w-full text-left bg-dark/80 border border-border-custom hover:border-brand hover:bg-panel-light p-2 rounded-lg flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <div>
                          <span className="text-xs font-bold text-white block truncate font-mono max-w-[130px]">{item.name}</span>
                          <span className="text-[9px] text-text-dim font-mono">{item.objData?.vertices ? item.objData.vertices.length / 3 : 0} вершин</span>
                        </div>
                      </div>
                      <span className="text-[9px] bg-brand/10 text-brand font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">Спавн</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Footer bar */}
      <div className="p-2.5 bg-dark border-t border-border-custom text-[9px] text-text-dim text-center font-mono tracking-wider flex items-center justify-center gap-1.5 uppercase">
        <Info className="w-3 h-3 text-brand" />
        <span>Збереження: Локальна БД (Toolbox)</span>
      </div>
    </div>
  );
}
