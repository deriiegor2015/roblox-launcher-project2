import React, { useState } from "react";
import { ExplorerNode, RobloxPart, WorkspaceStateVersion } from "../types";
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  Cpu, 
  MapPin, 
  Lightbulb, 
  Users, 
  HardDrive, 
  FileCode, 
  Layers,
  Sparkles,
  Settings,
  History,
  Plus,
  RotateCcw,
  Trash2,
  Clock,
  Check
} from "lucide-react";

interface ExplorerProps {
  explorerData: ExplorerNode;
  selectedPartId: string | null;
  selectedScriptId: string | null;
  onSelectPart: (id: string | null) => void;
  onSelectScript: (id: string | null) => void;
  parts: RobloxPart[];
  // History tab props
  historyVersions: WorkspaceStateVersion[];
  onRestoreVersion: (version: WorkspaceStateVersion) => void;
  onCreateCheckpoint: (description: string) => void;
  onClearHistory: () => void;
}

export default function Explorer({
  explorerData,
  selectedPartId,
  selectedScriptId,
  onSelectPart,
  onSelectScript,
  parts,
  historyVersions,
  onRestoreVersion,
  onCreateCheckpoint,
  onClearHistory
}: ExplorerProps) {
  const [activeTab, setActiveTab] = useState<"explorer" | "history">("explorer");
  const [checkpointName, setCheckpointName] = useState("");

  // Recursively render explorer nodes
  const renderNode = (node: ExplorerNode, depth = 0) => {
    const isExpanded = node.expanded !== false;
    const hasChildren = (node.children && node.children.length > 0) || node.type === "Workspace";

    // Handle dynamic children for Workspace
    let childrenToRender = node.children || [];
    if (node.type === "Workspace") {
      // Generate node list based on active parts in state
      childrenToRender = parts.map((part) => ({
        id: `exp-${part.id}`,
        name: part.name,
        type: "Part",
        partId: part.id,
      }));
    }

    // Determine selection state
    const isSelectedPart = node.partId ? selectedPartId === node.partId : false;
    const isSelectedScript = node.id.startsWith("script-") && selectedScriptId === node.id;
    const isSelected = isSelectedPart || isSelectedScript;

    const handleNodeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (node.partId) {
        onSelectPart(node.partId);
      } else if (node.id.startsWith("script-") || node.type === "Script") {
        onSelectScript(node.id);
      } else {
        onSelectPart(null);
      }
    };

    // Icon Selection
    const getIcon = () => {
      switch (node.type) {
        case "Workspace":
          return <Cpu className="w-3.5 h-3.5 text-brand" />;
        case "Players":
          return <Users className="w-3.5 h-3.5 text-[#00FF88]" />;
        case "Lighting":
          return <Lightbulb className="w-3.5 h-3.5 text-amber-400" />;
        case "ReplicatedStorage":
          return <HardDrive className="w-3.5 h-3.5 text-purple-400" />;
        case "ServerScriptService":
          return <Folder className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/10" />;
        case "StarterGui":
          return <Layers className="w-3.5 h-3.5 text-pink-400" />;
        case "Part":
          // Special types get custom icons
          const targetPart = parts.find((p) => p.id === node.partId);
          if (targetPart?.specialType === "spawn") return <MapPin className="w-3.5 h-3.5 text-yellow-400" />;
          if (targetPart?.specialType === "coin") return <Sparkles className="w-3.5 h-3.5 text-brand" />;
          return <Layers className="w-3.5 h-3.5 text-sky-400" />;
        case "Script":
          return <FileCode className="w-3.5 h-3.5 text-brand" />;
        case "Folder":
        default:
          return <Folder className="w-3.5 h-3.5 text-text-dim" />;
      }
    };

    return (
      <div key={node.id} className="select-none">
        {/* Node item row */}
        <div
          onClick={handleNodeClick}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          className={`flex items-center gap-2 py-1 px-2.5 text-[11px] font-mono transition-all border-l-2 cursor-pointer ${
            isSelected
              ? "bg-brand-dim border-brand text-brand font-bold"
              : "text-text-mid border-transparent hover:bg-white/5 hover:text-white"
          }`}
          id={`explorer-node-${node.id}`}
        >
          {/* Collapse/Expand arrow placeholder */}
          <span className="w-3.5 h-3.5 flex items-center justify-center">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-text-dim" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-text-dim" />
              )
            ) : null}
          </span>

          {/* Node Icon */}
          <span className="flex-shrink-0">{getIcon()}</span>

          {/* Node Name */}
          <span className="truncate">{node.name}</span>
        </div>

        {/* Node Children */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {childrenToRender.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-panel border border-border-custom rounded-xl flex flex-col h-full overflow-hidden shadow-xl" id="explorer-panel">
      {/* Header Panel */}
      <div className="p-3 bg-dark border-b border-border-custom flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Провідник (Explorer)</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] bg-brand-dim border border-brand/20 text-brand px-2 py-0.5 rounded font-mono">
            game
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-custom bg-dark/40 shrink-0">
        <button
          onClick={() => setActiveTab("explorer")}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${
            activeTab === "explorer" 
              ? "border-brand text-brand bg-panel-light/30" 
              : "border-transparent text-text-dim hover:text-white"
          }`}
        >
          Об'єкти
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "history" 
              ? "border-brand text-brand bg-panel-light/30" 
              : "border-transparent text-text-dim hover:text-white"
          }`}
        >
          <History className="w-3 h-3" />
          <span>Історія ({historyVersions.length})</span>
        </button>
      </div>

      {/* Explorer Tree Body */}
      {activeTab === "explorer" && (
        <div className="p-2 overflow-y-auto flex-1 font-mono text-[11px] space-y-0.5 scrollbar-thin">
          {renderNode(explorerData)}
        </div>
      )}

      {/* History Body */}
      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin flex flex-col min-h-0">
          {/* Create Checkpoint Input */}
          <div className="bg-dark/40 border border-border-custom rounded-lg p-2.5 space-y-2 shrink-0">
            <span className="text-[9px] text-text-dim font-bold font-mono tracking-wider block uppercase">Створити точку збереження</span>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Назва точки (напр. Побудував дім)..."
                value={checkpointName}
                onChange={(e) => setCheckpointName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && checkpointName.trim()) {
                    onCreateCheckpoint(checkpointName.trim());
                    setCheckpointName("");
                  }
                }}
                className="flex-1 min-w-0 px-2 py-1.5 bg-dark border border-border-custom text-white rounded text-[11px] focus:border-brand focus:outline-none font-sans"
              />
              <button
                onClick={() => {
                  if (checkpointName.trim()) {
                    onCreateCheckpoint(checkpointName.trim());
                    setCheckpointName("");
                  }
                }}
                disabled={!checkpointName.trim()}
                className="px-2.5 py-1.5 bg-brand disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-bright text-black font-bold text-[10px] rounded uppercase transition-all flex items-center gap-1 shrink-0 cursor-pointer font-sans"
                title="Зберегти поточний стан"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Зберегти</span>
              </button>
            </div>
          </div>

          {/* Versions List */}
          <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
            <span className="text-[9px] text-text-dim font-bold font-mono tracking-wider block uppercase">Історія змін</span>
            
            {historyVersions.length === 0 ? (
              <div className="text-center py-8 text-[11px] text-text-dim font-sans italic">
                Немає збережених станів.
              </div>
            ) : (
              <div className="space-y-1.5">
                {historyVersions.map((version) => {
                  const isActive = JSON.stringify(parts) === JSON.stringify(version.parts);
                  return (
                    <div
                      key={version.id}
                      className={`p-2.5 rounded-lg border transition-all bg-dark/60 flex flex-col gap-1.5 ${
                        isActive
                          ? "border-brand shadow-[0_0_8px_rgba(0,255,136,0.1)]"
                          : "border-border-custom hover:border-brand/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-white block truncate leading-tight font-sans">
                            {version.description}
                          </span>
                          <span className="text-[9px] text-text-dim font-mono block mt-0.5">
                            {version.timestamp} • {version.parts.length} об'єктів
                          </span>
                        </div>

                        {isActive ? (
                          <span className="text-[9px] text-brand bg-brand-dim border border-brand/20 font-bold px-1.5 py-0.5 rounded font-mono shrink-0 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Активний
                          </span>
                        ) : (
                          <button
                            onClick={() => onRestoreVersion(version)}
                            className="text-[9px] bg-white/5 hover:bg-brand/10 border border-white/10 hover:border-brand/30 text-white hover:text-brand font-bold px-2 py-1 rounded font-mono transition-all uppercase shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            Відновити
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Info / Actions Box */}
      <div className="p-2.5 border-t border-border-custom bg-dark flex items-center justify-between text-[11px] text-text-dim font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-text-dim" />
          <span>{activeTab === "explorer" ? "Ієрархія сумісна з Luau" : "Автозбереження кожні 3с"}</span>
        </div>
        {activeTab === "history" && historyVersions.length > 1 && (
          <button
            onClick={onClearHistory}
            className="text-[9px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Очистити історію"
          >
            <Trash2 className="w-3 h-3" />
            Очистити
          </button>
        )}
      </div>
    </div>
  );
}
