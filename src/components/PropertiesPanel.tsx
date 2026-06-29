import React from "react";
import { RobloxPart, PartMaterial } from "../types";
import { Sliders, Box } from "lucide-react";

interface PropertiesPanelProps {
  selectedPart: RobloxPart | null;
  onChangePart: (part: RobloxPart) => void;
}

const MATERIALS: PartMaterial[] = [
  "Plastic",
  "SmoothPlastic",
  "Wood",
  "Slate",
  "Neon",
  "Glass",
  "Metal",
  "Grass",
  "Ice",
  "Fabric"
];

const COLORS = [
  { name: "Bright red", value: "#f44336" },
  { name: "Bright blue", value: "#2196f3" },
  { name: "Bright yellow", value: "#ffca28" },
  { name: "Lime green", value: "#4caf50" },
  { name: "Neon orange", value: "#ff9800" },
  { name: "Med stone grey", value: "#9e9e9e" },
  { name: "Gold", value: "#ffd700" },
  { name: "Deep purple", value: "#9c27b0" },
  { name: "Pastel white", value: "#ffffff" },
  { name: "Slate black", value: "#212121" }
];

export default function PropertiesPanel({
  selectedPart,
  onChangePart,
}: PropertiesPanelProps) {
  if (!selectedPart) {
    return (
      <div className="bg-panel border border-border-custom rounded-xl flex flex-col h-full overflow-hidden shadow-xl select-none" id="properties-panel-empty">
        <div className="p-3 bg-dark border-b border-border-custom flex items-center gap-2">
          <Sliders className="w-4 h-4 text-text-dim" />
          <h3 className="text-xs font-bold text-text-dim uppercase tracking-wider font-sans">Властивості (Properties)</h3>
        </div>
        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center text-text-dim font-mono">
          <Box className="w-8 h-8 text-border-glow mb-2 animate-pulse" />
          <p className="text-[11px] leading-relaxed max-w-[200px]">Виберіть деталь у списку або натисніть на неї у 3D-сцені, щоб редагувати властивості.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof RobloxPart, value: any) => {
    onChangePart({
      ...selectedPart,
      [field]: value,
    });
  };

  const handleCoordinateChange = (axis: "x" | "y" | "z", value: number, category: "position" | "size") => {
    const original = [...selectedPart[category]] as [number, number, number];
    const index = axis === "x" ? 0 : axis === "y" ? 1 : 2;
    const fallback = category === "size" ? 1 : 0;
    original[index] = isNaN(value) ? fallback : value;
    handleInputChange(category, original);
  };

  const getInputValue = (val: number | undefined, fallback = 0) => {
    if (val === undefined || val === null || isNaN(val)) return fallback;
    return parseFloat(val.toFixed(1));
  };

  return (
    <div className="bg-panel border border-border-custom rounded-xl flex flex-col h-full overflow-hidden shadow-xl select-none" id="properties-panel">
      {/* Panel Header */}
      <div className="p-3 bg-dark border-b border-border-custom flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Властивості ({selectedPart.name})</h3>
        </div>
        <span className="text-[10px] bg-brand-dim border border-brand/20 text-brand px-2 py-0.5 rounded font-mono">
          {selectedPart.shape.toUpperCase()}
        </span>
      </div>

      {/* Properties Scrollable Form */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-mono scrollbar-thin">
        
        {/* SECTION: Identity */}
        <div className="space-y-2">
          <span className="text-[9px] text-text-dim font-bold tracking-widest uppercase">ІДЕНТИФІКАЦІЯ (Identity)</span>
          <div className="grid grid-cols-3 items-center gap-2">
            <span className="text-text-mid">Name</span>
            <input
              type="text"
              id="prop-input-name"
              value={selectedPart.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="col-span-2 px-2.5 py-1.5 bg-dark border border-border-custom text-white rounded focus:border-brand focus:outline-none text-[11px]"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <span className="text-text-mid">Parent</span>
            <span className="col-span-2 text-text-dim text-[11px] px-2.5 py-1.5 bg-panel-light rounded border border-border-custom">Workspace</span>
          </div>
        </div>

        <div className="h-px bg-border-custom" />

        {/* SECTION: Appearance */}
        <div className="space-y-2">
          <span className="text-[9px] text-text-dim font-bold tracking-widest uppercase">ЗОВНІШНІЙ ВИГЛЯД (Appearance)</span>
          
          {/* Material Select */}
          <div className="grid grid-cols-3 items-center gap-2">
            <span className="text-text-mid">Material</span>
            <select
              id="prop-select-material"
              value={selectedPart.material}
              onChange={(e) => handleInputChange("material", e.target.value as PartMaterial)}
              className="col-span-2 px-2 py-1.5 bg-dark border border-border-custom text-white rounded focus:border-brand focus:outline-none text-[11px] cursor-pointer"
            >
              {MATERIALS.map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
          </div>

          {/* Color swatches and Color Picker */}
          <div className="space-y-2">
            <span className="text-text-mid">BrickColor</span>
            <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-dark border border-border-custom rounded-lg">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleInputChange("color", c.value)}
                  className={`h-4 w-full rounded border transition-all cursor-pointer ${
                    selectedPart.color === c.value
                      ? "border-brand scale-110 shadow"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
            {/* Custom hex color input */}
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={selectedPart.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                className="w-7 h-7 rounded border border-border-custom cursor-pointer p-0 bg-transparent"
              />
              <input
                type="text"
                id="prop-input-hex"
                value={selectedPart.color.toUpperCase()}
                onChange={(e) => handleInputChange("color", e.target.value)}
                placeholder="#HEX"
                maxLength={7}
                className="flex-1 px-2.5 py-1.5 bg-dark border border-border-custom text-white rounded text-center focus:border-brand focus:outline-none text-[11px]"
              />
            </div>
          </div>

          {/* Transparency Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-text-mid">
              <span>Transparency</span>
              <span className="text-brand">{getInputValue(selectedPart.transparency, 0).toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={getInputValue(selectedPart.transparency, 0)}
              onChange={(e) => handleInputChange("transparency", parseFloat(e.target.value) || 0)}
              className="w-full accent-brand"
            />
          </div>
        </div>

        <div className="h-px bg-border-custom" />

        {/* SECTION: Transformations */}
        <div className="space-y-3">
          <span className="text-[9px] text-text-dim font-bold tracking-widest uppercase">ГЕОМЕТРІЯ (Transform)</span>
          
          {/* Position inputs */}
          <div className="space-y-1.5">
            <span className="text-text-mid">Position (studs)</span>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex bg-dark border border-border-custom rounded overflow-hidden">
                <span className="bg-red-500/10 px-2 py-1 text-red-400 text-[10px] font-bold flex items-center">X</span>
                <input
                  type="number"
                  value={getInputValue(selectedPart.position[0], 0)}
                  onChange={(e) => handleCoordinateChange("x", parseFloat(e.target.value), "position")}
                  className="w-full bg-transparent px-1.5 py-1 text-white text-[11px] outline-none text-right"
                />
              </div>
              <div className="flex bg-dark border border-border-custom rounded overflow-hidden">
                <span className="bg-brand-dim px-2 py-1 text-brand text-[10px] font-bold flex items-center">Y</span>
                <input
                  type="number"
                  value={getInputValue(selectedPart.position[1], 0)}
                  onChange={(e) => handleCoordinateChange("y", parseFloat(e.target.value), "position")}
                  className="w-full bg-transparent px-1.5 py-1 text-white text-[11px] outline-none text-right"
                />
              </div>
              <div className="flex bg-dark border border-border-custom rounded overflow-hidden">
                <span className="bg-blue-500/10 px-2 py-1 text-blue-400 text-[10px] font-bold flex items-center">Z</span>
                <input
                  type="number"
                  value={getInputValue(selectedPart.position[2], 0)}
                  onChange={(e) => handleCoordinateChange("z", parseFloat(e.target.value), "position")}
                  className="w-full bg-transparent px-1.5 py-1 text-white text-[11px] outline-none text-right"
                />
              </div>
            </div>
          </div>

          {/* Size inputs */}
          <div className="space-y-1.5">
            <span className="text-text-mid">Size (studs)</span>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex bg-dark border border-border-custom rounded overflow-hidden">
                <span className="bg-white/5 px-1.5 py-1 text-text-mid text-[10px] font-bold flex items-center">W</span>
                <input
                  type="number"
                  min="0.1"
                  value={getInputValue(selectedPart.size[0], 1)}
                  onChange={(e) => handleCoordinateChange("x", parseFloat(e.target.value), "size")}
                  className="w-full bg-transparent px-1.5 py-1 text-white text-[11px] outline-none text-right"
                />
              </div>
              <div className="flex bg-dark border border-border-custom rounded overflow-hidden">
                <span className="bg-white/5 px-1.5 py-1 text-text-mid text-[10px] font-bold flex items-center">H</span>
                <input
                  type="number"
                  min="0.1"
                  value={getInputValue(selectedPart.size[1], 1)}
                  onChange={(e) => handleCoordinateChange("y", parseFloat(e.target.value), "size")}
                  className="w-full bg-transparent px-1.5 py-1 text-white text-[11px] outline-none text-right"
                />
              </div>
              <div className="flex bg-dark border border-border-custom rounded overflow-hidden">
                <span className="bg-white/5 px-1.5 py-1 text-text-mid text-[10px] font-bold flex items-center">D</span>
                <input
                  type="number"
                  min="0.1"
                  value={getInputValue(selectedPart.size[2], 1)}
                  onChange={(e) => handleCoordinateChange("z", parseFloat(e.target.value), "size")}
                  className="w-full bg-transparent px-1.5 py-1 text-white text-[11px] outline-none text-right"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border-custom" />

        {/* SECTION: Physics Behavior */}
        <div className="space-y-3">
          <span className="text-[9px] text-text-dim font-bold tracking-widest uppercase">ФІЗИКА (Behavior)</span>
          
          <div className="flex items-center justify-between">
            <span className="text-text-mid" title="Зафіксований об'єкт (не падає)">Anchored</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPart.anchored}
                onChange={(e) => handleInputChange("anchored", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-dim after:border-border-custom after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-brand peer-checked:after:bg-black peer-checked:after:border-transparent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-mid" title="Колізія (гравці можуть доторкатися)">CanCollide</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPart.canCollide}
                onChange={(e) => handleInputChange("canCollide", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-dim after:border-border-custom after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-brand peer-checked:after:bg-black peer-checked:after:border-transparent"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
