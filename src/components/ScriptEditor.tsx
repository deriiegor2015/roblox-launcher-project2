import React, { useState } from "react";
import { LUA_TEMPLATES } from "../data";
import { 
  Play, 
  FileCode, 
  BookOpen, 
  Bug,
  Code
} from "lucide-react";

interface ScriptEditorProps {
  onRunScript: (code: string) => void;
  onInsertCode: (code: string) => void;
  activeScriptCode: string;
  setActiveScriptCode: (code: string) => void;
  onAnalyzeCode: (code: string) => void;
}

export default function ScriptEditor({
  onRunScript,
  onInsertCode,
  activeScriptCode,
  setActiveScriptCode,
  onAnalyzeCode,
}: ScriptEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(LUA_TEMPLATES[0].name);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setSelectedTemplate(name);
    const found = LUA_TEMPLATES.find((t) => t.name === name);
    if (found) {
      setActiveScriptCode(found.code);
    }
  };

  const handleBeautify = () => {
    // Advanced Luau beautifier: split, trim, and indent control flows and nested tables
    const lines = activeScriptCode.split("\n");
    let indent = 0;
    let consecutiveEmptyLines = 0;
    
    const formatted = lines
      .map((line) => {
        let trimmed = line.trim();
        
        if (trimmed === "") {
          consecutiveEmptyLines++;
          if (consecutiveEmptyLines > 1) {
            return null; // Skip duplicate empty lines
          }
          return "";
        }
        consecutiveEmptyLines = 0;

        // Decrease indent for closing structures
        const decreasesIndent = 
          trimmed.startsWith("end") || 
          trimmed.startsWith("elseif") || 
          trimmed.startsWith("else") || 
          trimmed.startsWith("until") ||
          trimmed.startsWith("}") ||
          trimmed.startsWith("]");
          
        if (decreasesIndent) {
          indent = Math.max(0, indent - 1);
        }

        const indentedLine = "    ".repeat(indent) + trimmed;

        // Increase indent for opening structures
        const increasesIndent = 
          (
            (trimmed.startsWith("if ") || trimmed.includes("then") || trimmed.startsWith("for ") || trimmed.startsWith("while ") || trimmed.includes("function") || trimmed.startsWith("else") || trimmed.startsWith("elseif") || trimmed.endsWith("do")) &&
            !trimmed.endsWith("end") && !trimmed.includes(" end")
          ) || 
          trimmed.endsWith("{") || 
          trimmed.endsWith("[");

        if (increasesIndent) {
          indent++;
        }

        return indentedLine;
      })
      .filter((line) => line !== null) as string[];

    setActiveScriptCode(formatted.join("\n"));
  };

  return (
    <div className="bg-panel border border-border-custom rounded-xl flex flex-col h-full overflow-hidden shadow-xl" id="script-editor-panel">
      {/* Editor Header */}
      <div className="p-3 bg-dark border-b border-border-custom flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-brand" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Редактор скриптів (Script Editor)</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAnalyzeCode(activeScriptCode)}
            className="flex items-center gap-1.5 text-[11px] font-mono hover:text-brand text-text-mid bg-dark px-2.5 py-1 rounded border border-border-custom transition-all cursor-pointer"
            id="btn-analyze-code"
          >
            <Bug className="w-3.5 h-3.5 text-amber-400" />
            <span>Перевірити код</span>
          </button>
          <button
            onClick={handleBeautify}
            className="flex items-center gap-1.5 text-[11px] font-mono hover:bg-brand/10 text-brand bg-brand/5 px-2.5 py-1 rounded border border-brand/30 transition-all cursor-pointer hover:border-brand/80 shadow-[0_0_8px_rgba(0,162,255,0.1)]"
            id="btn-format-code"
            title="Автоматично вирівняти відступи та відформатувати код"
          >
            <Code className="w-3.5 h-3.5 text-brand animate-pulse" />
            <span>Format (Форматувати)</span>
          </button>
        </div>
      </div>

      {/* Templates Injector */}
      <div className="p-3 bg-panel-light border-b border-border-custom flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-1.5 text-[11px] text-text-mid font-mono">
          <BookOpen className="w-3.5 h-3.5 text-brand" />
          <span>Шаблони скриптів Luau:</span>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-[280px]">
          <select
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="flex-1 bg-dark border border-border-custom text-xs text-white px-2.5 py-1 rounded focus:outline-none focus:border-brand cursor-pointer text-ellipsis overflow-hidden font-mono"
            id="script-template-select"
          >
            {LUA_TEMPLATES.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative bg-dark/60 min-h-[160px] flex">
        {/* Line Numbers Simulation */}
        <div className="p-3 bg-dark border-r border-border-custom text-right font-mono text-[10px] text-text-dim select-none flex flex-col items-end w-8">
          {Array.from({ length: Math.max(12, activeScriptCode.split("\n").length) }).map((_, i) => (
            <div key={i} className="h-5 flex items-center leading-5">{i + 1}</div>
          ))}
        </div>

        {/* Text Area Code Editor */}
        <textarea
          value={activeScriptCode}
          onChange={(e) => setActiveScriptCode(e.target.value)}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-[#00FF88] font-mono text-xs leading-5 focus:outline-none resize-none h-full overflow-y-auto selection:bg-brand-dim selection:text-white"
          id="script-editor-textarea"
        />
      </div>

      {/* Editor Footer / Run Script */}
      <div className="p-3 bg-dark border-t border-border-custom flex items-center justify-between gap-4">
        <div className="text-[11px] text-text-dim leading-snug font-mono">
          Натисніть <span className="font-semibold text-white">Запустити</span>, щоб симулювати виконання Luau коду.
        </div>
        <button
          onClick={() => onRunScript(activeScriptCode)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/80 text-black font-bold text-xs rounded shadow transition-all cursor-pointer select-none font-mono tracking-wider uppercase"
          id="btn-run-script"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Запустити (Run)</span>
        </button>
      </div>
    </div>
  );
}
