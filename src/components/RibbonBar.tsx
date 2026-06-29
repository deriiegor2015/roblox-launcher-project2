import React from "react";
import { ActiveRibbonTab, PartShape } from "../types";
import { 
  Play, 
  Square, 
  Grid, 
  RefreshCcw, 
  Trash2, 
  Wand2, 
  Layers, 
  Plus, 
  Cuboid as Cube, 
  Circle, 
  Database,
  Bug,
  Volume2,
  Globe,
  Camera
} from "lucide-react";

interface RibbonBarProps {
  activeTab: ActiveRibbonTab;
  setActiveTab: (tab: ActiveRibbonTab) => void;
  onAddPart: (shape: PartShape) => void;
  physicsActive: boolean;
  setPhysicsActive: (val: boolean) => void;
  gridVisible: boolean;
  setGridVisible: (val: boolean) => void;
  autoRotate: boolean;
  setAutoRotate: (val: boolean) => void;
  onClearWorkspace: () => void;
  onGenerateAICommand: (prompt: string) => void;
  onResetDemo: () => void;
  onStartTesting: () => void;
  vcVolume: number;
  onVcVolumeChange: (val: number) => void;
  onPublishGame?: () => void;
}

export default function RibbonBar({
  activeTab,
  setActiveTab,
  onAddPart,
  physicsActive,
  setPhysicsActive,
  gridVisible,
  setGridVisible,
  autoRotate,
  setAutoRotate,
  onClearWorkspace,
  onGenerateAICommand,
  onResetDemo,
  onStartTesting,
  vcVolume,
  onVcVolumeChange,
  onPublishGame,
}: RibbonBarProps) {
  const tabs: ActiveRibbonTab[] = ["Home", "Model", "Test", "View", "AI Assistant"];

  return (
    <div className="bg-panel border border-border-custom rounded-xl shadow-xl flex flex-col overflow-hidden">
      {/* Tab Selectors */}
      <div className="flex bg-dark border-b border-border-custom px-4 items-center justify-between">
        <div className="flex gap-1 pt-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider border-t-2 transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-panel text-brand border-brand font-bold"
                  : "text-text-dim border-transparent hover:text-white hover:bg-white/5"
              }`}
              id={`tab-selector-${tab.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {tab === "Home" && "ГОЛОВНА (Home)"}
              {tab === "Model" && "МОДЕЛЬ (Model)"}
              {tab === "Test" && "ТЕСТ (Test)"}
              {tab === "View" && "ВИГЛЯД (View)"}
              {tab === "AI Assistant" && "AI ПОМІЧНИК"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-brand/80 font-mono bg-brand-dim border border-brand/20 px-3 py-1 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <span className="tracking-widest">STUDIO_ONLINE v1.0.4</span>
        </div>
      </div>

      {/* Tab Contents Ribbon */}
      <div className="p-4 bg-panel min-h-[82px] flex items-center justify-between gap-6 overflow-x-auto">
        {/* HOME TAB CONTROLS */}
        {activeTab === "Home" && (
          <div className="flex items-center gap-4 divide-x divide-border-custom w-full" id="ribbon-home-tab">
            {/* Clipboard / Action Group */}
            <div className="flex flex-col gap-1.5 pr-4 shrink-0">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">СИСТЕМА</span>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-reset-scene"
                  onClick={onResetDemo}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark border border-border-custom hover:border-brand/40 hover:bg-brand-dim text-xs font-mono uppercase text-white transition-all cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5 text-brand" />
                  <span>Перезапуск</span>
                </button>
                <button
                  id="btn-clear-workspace"
                  onClick={onClearWorkspace}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900/30 text-rose-400 text-xs font-mono uppercase transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Очистити</span>
                </button>
              </div>
            </div>

            {/* Part Inserters */}
            <div className="flex flex-col gap-1.5 pl-4 pr-4 shrink-0" id="ribbon-insert-group">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">ВСТАВИТИ ДЕТАЛЬ (Part)</span>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-add-block"
                  onClick={() => onAddPart("block")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark border border-border-custom hover:border-brand/50 text-white text-xs font-mono transition-all cursor-pointer"
                  title="Додати блок"
                >
                  <Cube className="w-3.5 h-3.5 text-brand" />
                  <span>Блок</span>
                </button>
                <button
                  id="btn-add-sphere"
                  onClick={() => onAddPart("sphere")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark border border-border-custom hover:border-brand/50 text-white text-xs font-mono transition-all cursor-pointer"
                  title="Додати кулю"
                >
                  <Circle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Куля</span>
                </button>
                <button
                  id="btn-add-cylinder"
                  onClick={() => onAddPart("cylinder")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark border border-border-custom hover:border-brand/50 text-white text-xs font-mono transition-all cursor-pointer"
                  title="Додати циліндр"
                >
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>Циліндр</span>
                </button>
                <button
                  id="btn-add-wedge"
                  onClick={() => onAddPart("wedge")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark border border-border-custom hover:border-brand/50 text-white text-xs font-mono transition-all cursor-pointer"
                  title="Додати клин"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Клин</span>
                </button>
              </div>
            </div>

            {/* Test Simulation Group */}
            <div className="flex flex-col gap-1.5 pl-4 pr-4 shrink-0" id="ribbon-simulation-group">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">ФІЗИКА (Physics)</span>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-toggle-physics"
                  onClick={() => setPhysicsActive(!physicsActive)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    physicsActive
                      ? "bg-brand text-black border-brand font-bold"
                      : "bg-dark border-border-custom hover:border-brand text-white"
                  }`}
                >
                  {physicsActive ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-black text-black" />
                      <span>Зупинити (Stop)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-brand text-brand" />
                      <span>Запустити (Run)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Immersive Play Test Group */}
            <div className="flex flex-col gap-1.5 pl-4 shrink-0" id="ribbon-play-group">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">ГРА (Play Test)</span>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-start-play-mode"
                  onClick={onStartTesting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00FF88] text-black font-bold text-xs font-mono uppercase tracking-wider transition-all hover:bg-[#00dd77] hover:scale-[1.03] active:scale-[0.98] cursor-pointer rounded shadow-lg"
                  title="Тестувати гру на весь екран"
                >
                  <Play className="w-3.5 h-3.5 fill-black text-black" />
                  <span>Грати (Play)</span>
                </button>
              </div>
            </div>

            {/* Publish Game Group */}
            <div className="flex flex-col gap-1.5 pl-4 shrink-0" id="ribbon-publish-group">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">ХМАРА (Roblox Cloud)</span>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-publish-game"
                  onClick={onPublishGame}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00A2FF] text-white font-bold text-xs font-mono uppercase tracking-wider transition-all hover:bg-[#0088dd] hover:scale-[1.03] active:scale-[0.98] cursor-pointer rounded shadow-lg"
                  title="Опублікувати гру у хмару Roblox"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Опублікувати (Publish)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODEL TAB CONTROLS */}
        {activeTab === "Model" && (
          <div className="flex items-center gap-4 divide-x divide-border-custom w-full" id="ribbon-model-tab">
            {/* Snap / Transform adjustments */}
            <div className="flex flex-col gap-1.5 pr-4 shrink-0">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">ПАРАМЕТРИ ПРИВ'ЯЗКИ</span>
              <div className="flex items-center gap-3 text-xs font-mono text-text-mid">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                  <input type="checkbox" defaultChecked className="rounded border-border-custom bg-dark text-brand focus:ring-0 focus:ring-offset-0" />
                  <span>Прив'язка до сітки (Snap to Grid)</span>
                </label>
                <div className="w-px h-3 bg-border-custom" />
                <span>Крок: 1 stud</span>
              </div>
            </div>

            {/* Pivot Point options */}
            <div className="flex flex-col gap-1.5 pl-4 shrink-0">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">МАТЕРІАЛИ ТА КОЛІР</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white bg-dark border border-border-custom px-2 py-1">Plastic</span>
                <span className="w-5 h-5 border border-border-custom bg-sky-500" />
                <span className="text-xs font-mono text-text-dim">Створює стандартні блоки 4x1x4 studs</span>
              </div>
            </div>
          </div>
        )}

        {/* TEST TAB CONTROLS */}
        {activeTab === "Test" && (
          <div className="flex items-center gap-4 divide-x divide-border-custom w-full" id="ribbon-test-tab">
            {/* Simulation settings */}
            <div className="flex flex-col gap-1.5 pr-4 shrink-0">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">РЕЖИМИ ТЕСТУВАННЯ</span>
              <div className="flex gap-2">
                <button 
                  id="btn-play-full"
                  onClick={onStartTesting} 
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00FF88] text-black font-bold text-xs font-mono uppercase tracking-wider transition-all hover:bg-[#00dd77] cursor-pointer rounded"
                >
                  <Play className="w-3.5 h-3.5 fill-black text-black" />
                  <span>Грати (Play Game)</span>
                </button>
                <button 
                  id="btn-play-here"
                  onClick={() => {
                    setPhysicsActive(true);
                    setActiveTab("Home");
                  }} 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark border border-border-custom hover:border-brand text-white text-xs font-mono uppercase transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-brand text-brand" />
                  <span>Симуляція (Run Physics)</span>
                </button>
              </div>
            </div>

            {/* Debugging / Console utilities */}
            <div className="flex flex-col gap-1.5 pl-4 shrink-0">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">ДІАГНОСТИКА СЕРВЕРА</span>
              <div className="flex items-center gap-3 text-xs font-mono text-text-mid">
                <span className="flex items-center gap-1 text-brand">
                  <Bug className="w-3.5 h-3.5" />
                  <span>Аудит Luau: ОК</span>
                </span>
                <div className="w-px h-3 bg-border-custom" />
                <span>Uptime: <span className="text-brand">14:02:44</span></span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW TAB CONTROLS */}
        {activeTab === "View" && (
          <div className="flex items-center gap-4 divide-x divide-border-custom w-full" id="ribbon-view-tab">
            {/* Toggle panels */}
            <div className="flex flex-col gap-1.5 pr-4 shrink-0">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">ЕЛЕМЕНТИ ІНТЕРФЕЙСУ</span>
              <div className="flex gap-1.5">
                <button
                  id="btn-toggle-grid"
                  onClick={() => setGridVisible(!gridVisible)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono transition-all cursor-pointer ${
                    gridVisible
                      ? "bg-brand/10 border-brand text-brand font-semibold"
                      : "bg-dark border-border-custom hover:border-brand text-white"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Сітка: {gridVisible ? "ВКЛ" : "ВИКЛ"}</span>
                </button>

                <button
                  id="btn-toggle-autorotate"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono transition-all cursor-pointer ${
                    autoRotate
                      ? "bg-brand/10 border-brand text-brand font-semibold"
                      : "bg-dark border-border-custom hover:border-brand text-white"
                  }`}
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Обертання коїнів: {autoRotate ? "ВКЛ" : "ВИКЛ"}</span>
                </button>
              </div>
            </div>

            {/* Screenshot Group */}
            <div className="flex flex-col gap-1.5 pl-4 pr-4 shrink-0" id="ribbon-view-screenshot">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">ЗНІМОК ЕКРАНА (SCREENSHOT)</span>
              <div className="flex items-center">
                <button
                  id="btn-take-screenshot"
                  onClick={() => window.dispatchEvent(new CustomEvent("take-screenshot"))}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00FF88]/10 border border-[#00FF88]/30 hover:border-[#00FF88] hover:bg-[#00FF88]/20 text-[#00FF88] text-xs font-mono font-bold uppercase transition-all cursor-pointer rounded shadow-[0_0_10px_rgba(0,255,136,0.1)] hover:scale-[1.02]"
                  title="Зробити знімок 3D-сцени та завантажити як PNG"
                >
                  <Camera className="w-3.5 h-3.5 animate-pulse" />
                  <span>Зробити знімок (Screenshot)</span>
                </button>
              </div>
            </div>

            {/* Floating Camera indicators */}
            <div className="flex flex-col gap-1.5 pl-4 pr-4 shrink-0">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">ВІЗУАЛЬНІ ХЕЛПЕРИ</span>
              <div className="flex items-center gap-3 text-xs font-mono text-text-mid h-[34px]">
                <span>Координатна сітка: АКТИВНА</span>
                <div className="w-px h-3 bg-border-custom" />
                <span>Освітлення: СТУДІЙНЕ</span>
              </div>
            </div>

            {/* Settings section */}
            <div className="flex flex-col gap-1.5 pl-4 shrink-0" id="ribbon-view-settings">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">НАЛАШТУВАННЯ (SETTINGS)</span>
              <div className="flex items-center gap-3 text-xs font-mono text-white bg-dark border border-border-custom px-3 py-1.5 h-[34px] rounded">
                <Volume2 className="w-3.5 h-3.5 text-brand" />
                <span className="text-text-mid">Голос ботів:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vcVolume}
                  onChange={(e) => onVcVolumeChange(Number(e.target.value))}
                  className="w-24 accent-brand cursor-pointer bg-border-custom h-1 rounded-lg appearance-none"
                  id="bot-vc-volume-slider"
                />
                <span className="text-brand font-bold w-10 text-right">{vcVolume}%</span>
              </div>
            </div>
          </div>
        )}

        {/* AI ASSISTANT QUICK PROMPTS */}
        {activeTab === "AI Assistant" && (
          <div className="flex items-center gap-4 divide-x divide-border-custom w-full" id="ribbon-ai-tab">
            {/* Quick procedural generation prompt presets */}
            <div className="flex flex-col gap-1.5 pr-4 shrink-0">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">ГЕНЕРАЦІЯ 3D КОДОМ ВІД AI</span>
              <div className="flex gap-1.5">
                <button
                  id="btn-build-tower"
                  onClick={() => onGenerateAICommand("Створи вежу з 5 поверхів з гвинтовими сходами та ліхтарем на даху")}
                  className="flex items-center gap-1 px-3 py-1.5 bg-brand-dim border border-brand/20 hover:border-brand text-brand text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Збудувати Вежу</span>
                </button>
                <button
                  id="btn-build-obby"
                  onClick={() => onGenerateAICommand("Створи складну смугу перешкод (Obby) з червоними лава-блоками (Killbrick), синіми батутами, та золотою монетою в кінці")}
                  className="flex items-center gap-1 px-3 py-1.5 bg-brand-dim border border-brand/20 hover:border-brand text-brand text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Збудувати Obby</span>
                </button>
                <button
                  id="btn-build-forest"
                  onClick={() => onGenerateAICommand("Створи лісову галявину: 5 дерев у різних точках, Spawn location посередині та 3 золоті монетки")}
                  className="flex items-center gap-1 px-3 py-1.5 bg-brand-dim border border-brand/20 hover:border-brand text-brand text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Збудувати Галявину</span>
                </button>
              </div>
            </div>

            {/* AI Assistant guidance hint */}
            <div className="flex flex-col gap-1.5 pl-4 text-xs font-mono text-text-mid max-w-[280px] shrink-0">
              <span className="text-[9px] text-text-dim font-mono tracking-[0.15em] uppercase">ІНСТРУКЦІЯ</span>
              <p className="leading-snug text-[11px]">Клікніть на пресет або введіть свій запит в асистенті для авто-побудови!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
