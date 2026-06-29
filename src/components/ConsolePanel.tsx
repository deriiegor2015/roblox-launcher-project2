import React, { useEffect, useRef } from "react";
import { ConsoleLog } from "../types";
import { Terminal, Trash2, ShieldAlert, CircleAlert, Sparkles, Code2 } from "lucide-react";

interface ConsolePanelProps {
  logs: ConsoleLog[];
  onClearLogs: () => void;
}

export default function ConsolePanel({ logs, onClearLogs }: ConsolePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyle = (type: ConsoleLog["type"]) => {
    switch (type) {
      case "error":
        return {
          bg: "bg-rose-950/10 border-rose-900/20",
          text: "text-rose-400",
          label: "Помилка",
          icon: <ShieldAlert className="w-3.5 h-3.5" />
        };
      case "warn":
        return {
          bg: "bg-amber-950/10 border-amber-900/20",
          text: "text-amber-400",
          label: "Попередження",
          icon: <CircleAlert className="w-3.5 h-3.5" />
        };
      case "lua":
        return {
          bg: "bg-brand-dim border-brand/10",
          text: "text-brand font-medium",
          label: "Lua Output",
          icon: <Code2 className="w-3.5 h-3.5 text-brand" />
        };
      case "success":
        return {
          bg: "bg-brand-dim border-brand/20",
          text: "text-brand font-bold",
          label: "Виконано",
          icon: <Sparkles className="w-3.5 h-3.5" />
        };
      case "info":
      default:
        return {
          bg: "bg-white/5 border-white/5",
          text: "text-text-mid",
          label: "Система",
          icon: <Terminal className="w-3.5 h-3.5 text-text-dim" />
        };
    }
  };

  return (
    <div className="bg-panel border border-border-custom rounded-xl flex flex-col h-full overflow-hidden shadow-xl select-none" id="console-panel">
      {/* Console Header */}
      <div className="p-3 bg-dark border-b border-border-custom flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Консоль виводу (Output)</h3>
        </div>
        <button
          onClick={onClearLogs}
          title="Очистити консоль"
          className="p-1 hover:bg-white/10 hover:text-rose-400 text-text-dim rounded transition-all cursor-pointer"
          id="btn-clear-console"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Logs container */}
      <div
        ref={containerRef}
        className="p-3 flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] scrollbar-thin bg-dark/40"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-dim italic">
            Консоль порожня. Запустіть Lua скрипт, щоб побачити вивід.
          </div>
        ) : (
          logs.map((log) => {
            const style = getLogStyle(log.type);
            return (
              <div
                key={log.id}
                className={`flex items-start gap-2.5 px-3 py-1.5 border transition-all ${style.bg}`}
              >
                {/* Time */}
                <span className="text-[10px] text-text-dim select-none pt-0.5">{log.timestamp}</span>

                {/* Badge Type */}
                <span className={`flex items-center gap-1 select-none font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-dark border border-border-custom ${style.text}`}>
                  {style.icon}
                  <span>{style.label}</span>
                </span>

                {/* Message Text */}
                <span className={`flex-1 leading-relaxed break-all whitespace-pre-wrap ${style.text}`}>
                  {log.text}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
