import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, Copy, Check, Loader2, Lightbulb, Play, Mic, MicOff, Globe, Users } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

interface AIAssistantProps {
  onInsertCode: (code: string) => void;
  onGenerateAICommand: (prompt: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export default function AIAssistant({
  onInsertCode,
  onGenerateAICommand,
  isLoading,
  setIsLoading,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Привіт! Я твій розумний AI-помічник Roblox Luau. Я можу пояснювати поняття скриптингу, писати код, створювати об'єкти на 3D-сцені за допомогою команд або допомагати у розробці гри.\n\n**Спробуй запитати мене:**\n* \"Як написати систему телепорту на Luau?\"\n* \"Як зробити лідерборд (leaderstats) у грі?\"\n* \"Напиши скрипт для зникнення лави\"\n\n**Або скористайся швидкими кнопками генерації 3D у верхній вкладці!**",
    },
  ]);
  const [activeTab, setActiveTab] = useState<"ai" | "global">("ai");
  const [globalInputValue, setGlobalInputValue] = useState("");
  const [globalMessages, setGlobalMessages] = useState<any[]>([
    {
      id: "g-1",
      sender: "LuaGuru 🚀",
      text: "Хлопці, хтось пробував створювати обертові платформи за допомогою TweenService?",
      time: "10:15"
    },
    {
      id: "g-2",
      sender: "RobloxianDev 🎨",
      text: "Так, це супер легко! Тільки не забувайте вимикати CanCollide у тимчасових частинах.",
      time: "10:17"
    },
    {
      id: "g-3",
      sender: "BuildMaster 🔨",
      text: "Я щойно закінчив проектувати нову лобі карту у Studio! Виглядає дико круто з новим освітленням.",
      time: "10:20"
    }
  ]);

  // Dialogue index tracking for Global Chat bots
  const globalChatIndexRef = useRef<Record<string, number>>({
    "LuaGuru 🚀": 0,
    "RobloxianDev 🎨": 0,
    "BuildMaster 🔨": 0
  });

  const [inputValue, setInputValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Simulated Global Dev chat conversation loop in Studio
  useEffect(() => {
    const devDialogues: Record<string, string[]> = {
      "LuaGuru 🚀": [
        "Сьогодні пишу скрипт для лідерборду на сервері. 📝",
        "Фух, закінчив писати код лідерборду! Тепер додаю збереження через DataStore Service. Хтось користувався?",
        "Також налаштував автозбереження у хмару Roblox Cloud! Працює бездоганно.",
        "Тепер створюю систему телепортів за допомогою значень CFrame. Код стає все чистішим!"
      ],
      "RobloxianDev 🎨": [
        "А я малюю іконки для GamePass та оновлюю текстури. 🎨",
        "Готово! Всі іконки для геймпасів завантажено в хмару Roblox Cloud! Які кольори краще обрати для металевого кубка?",
        "Вирішив використати золотистий градієнт з блумом. Шейдери роблять картинку неймовірною!",
        "Налаштовую анімацію бігу для кастомного аватара. Виглядає дуже плавно!"
      ],
      "BuildMaster 🔨": [
        "Почав збирати каркас для оббі паркуру. Треба розставити лаву. 🔨",
        "Круто! Я закінчив будувати всі рівні оббі! Тепер тестую точки спавну та систему чекпоінтів у Studio.",
        "Зберіг гру в Roblox Cloud! Всі деталі та моделі завантажились успішно.",
        "Пропробував додати нові обертові деталі та неонове підсвічування для нічного режиму!"
      ]
    };

    const interval = setInterval(() => {
      const devs = ["LuaGuru 🚀", "RobloxianDev 🎨", "BuildMaster 🔨"];
      const randomDev = devs[Math.floor(Math.random() * devs.length)];
      
      const currentIndex = globalChatIndexRef.current[randomDev] || 0;
      const dialogues = devDialogues[randomDev];
      const text = dialogues[currentIndex % dialogues.length];
      
      // Advance stage index
      globalChatIndexRef.current[randomDev] = currentIndex + 1;

      const newMsg = {
        id: `g-sim-${Date.now()}`,
        sender: randomDev,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setGlobalMessages((prev) => [...prev, newMsg]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Голосове введення не підтримується у цьому браузері. Будь ласка, використовуйте Chrome або Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "uk-UA";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, globalMessages, activeTab]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = inputValue.trim();
    if (!prompt || isLoading || localLoading) return;

    // Add user message
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: prompt }]);
    setInputValue("");
    setLocalLoading(true);
    setIsLoading(true);

    try {
      const payload = {
        messages: [
          { role: "user", content: prompt }
        ]
      };

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Не вдалося зв'язатися з AI.");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: data.text || "Перепрошую, сталася помилка при обробці запиту.",
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: `⚠️ Помилка з'єднання: ${err.message || "Невідома помилка"}. Будь ласка, переконайтеся, що dev-сервер активний та API ключ налаштовано.`,
        },
      ]);
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  const handleSendGlobalMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = globalInputValue.trim();
    if (!text) return;

    // Add user's message with nickname or default "Developer"
    const username = localStorage.getItem("roblox_persona_username") || "Robloxian Dev";
    const userMsg = {
      id: `g-user-${Date.now()}`,
      sender: `${username} ⚒️`,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setGlobalMessages((prev) => [...prev, userMsg]);
    setGlobalInputValue("");

    // Make a simulated developer reply after a brief timeout!
    setTimeout(() => {
      const devReplies = [
        "Вау, крута думка! Я якраз думав про це.",
        "Повністю згоден, у Студії це реалізувати набагато простіше тепер. 👍",
        "Дякую за пораду! Спробую додати це у свій проект хмари.",
        "Класний коментар! Luau дійсно потужна мова скриптингу.",
        "Супер! Спробуй перевірити це також у Roblox Launcher (Play)."
      ];
      const devs = ["LuaGuru 🚀", "RobloxianDev 🎨", "BuildMaster 🔨"];
      const randomDev = devs[Math.floor(Math.random() * devs.length)];
      const randomReply = devReplies[Math.floor(Math.random() * devReplies.length)];

      const devReplyMsg = {
        id: `g-sim-reply-${Date.now()}`,
        sender: randomDev,
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setGlobalMessages((prev) => [...prev, devReplyMsg]);
    }, 1200 + Math.random() * 1200);
  };

  // Safe and elegant Custom Markdown parser for Roblox scripting code blocks
  const renderMessageText = (text: string, msgId: string) => {
    const parts = text.split(/(```lua|```)/g);
    let isCodeBlock = false;
    let blockIndex = 0;

    return parts.map((part, index) => {
      if (part === "```lua") {
        isCodeBlock = true;
        return null;
      }
      if (part === "```") {
        isCodeBlock = false;
        return null;
      }

      if (isCodeBlock) {
        blockIndex++;
        const currentBlockCode = part.trim();
        const copyKey = `${msgId}-${blockIndex}`;

        return (
          <div key={index} className="my-3 border border-border-custom rounded-lg overflow-hidden bg-dark shadow-lg font-mono text-xs">
            {/* Code header bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-panel-light border-b border-border-custom select-none text-[11px] text-text-mid font-mono">
              <span className="flex items-center gap-1.5 font-sans font-medium text-brand">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                <span>ROBLOX LUAU SCRIPT</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentBlockCode);
                    setCopiedId(copyKey);
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId === copyKey ? <Check className="w-3.5 h-3.5 text-brand" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === copyKey ? "Скопійовано" : "Копіювати"}</span>
                </button>
                <div className="w-px h-3 bg-border-custom" />
                <button
                  onClick={() => onInsertCode(currentBlockCode)}
                  className="flex items-center gap-1 text-brand hover:text-white transition-colors cursor-pointer"
                  title="Вставити цей код в активний Lua-редактор"
                >
                  <Play className="w-3.5 h-3.5 fill-brand text-brand" />
                  <span>Вставити в редактор</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <pre className="p-3 overflow-x-auto text-white font-mono leading-relaxed select-text scrollbar-thin">
              <code>{currentBlockCode}</code>
            </pre>
          </div>
        );
      }

      // Simple formatting for bold **text** and bullet lists
      const lines = part.split("\n");
      return (
        <div key={index} className="space-y-1.5">
          {lines.map((line, lIdx) => {
            let renderedLine: React.ReactNode = line;

            // Bullet list items
            if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
              const cleaned = line.replace(/^[\s*-]+/, "");
              renderedLine = (
                <li className="list-disc list-inside ml-2.5 text-text-mid">
                  {parseInlineFormatting(cleaned)}
                </li>
              );
            } else {
              renderedLine = <p>{parseInlineFormatting(line)}</p>;
            }

            return <React.Fragment key={lIdx}>{renderedLine}</React.Fragment>;
          })}
        </div>
      );
    });
  };

  // Helper to parse inline bolding **word**
  const parseInlineFormatting = (line: string): React.ReactNode => {
    const boldParts = line.split(/\*\*([^*]+)\*\*/g);
    return boldParts.map((bPart, bIdx) => {
      if (bIdx % 2 === 1) {
        return <strong key={bIdx} className="font-bold text-brand">{bPart}</strong>;
      }
      return bPart;
    });
  };

  return (
    <div className="bg-panel border border-border-custom rounded-xl flex flex-col h-full overflow-hidden shadow-xl" id="ai-assistant-panel">
      
      {/* Header info */}
      <div className="p-3 bg-dark border-b border-border-custom flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4.5 h-4.5 text-brand" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">AI Студія Асистент</h3>
            <p className="text-[10px] text-text-mid leading-tight font-mono">Gemini Pro · Luau розробник</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
          <span className="text-[10px] text-[#00FF88] font-mono font-medium tracking-widest">ONLINE</span>
        </div>
      </div>

      {/* Tab switch buttons */}
      <div className="flex border-b border-border-custom bg-dark-light">
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "ai"
              ? "border-brand text-brand bg-brand/5"
              : "border-transparent text-text-dim hover:text-white"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>ШІ Асистент 🤖</span>
        </button>
        <button
          onClick={() => setActiveTab("global")}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "global"
              ? "border-brand text-brand bg-brand/5"
              : "border-transparent text-text-dim hover:text-white"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Global Chat 🌐</span>
        </button>
      </div>

      {activeTab === "ai" ? (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-dark/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border select-none text-[11px] font-mono ${
                  msg.sender === "user" 
                    ? "bg-text-dim border-border-custom text-white" 
                    : "bg-brand-dim border-brand/20 text-brand"
                }`}>
                  {msg.sender === "user" ? "Я" : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message Body */}
                <div className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed border font-sans ${
                  msg.sender === "user"
                    ? "bg-panel-light border-border-custom text-white"
                    : "bg-dark border-border-custom text-text-mid"
                }`}>
                  {renderMessageText(msg.text, msg.id)}
                </div>
              </div>
            ))}
            {(isLoading || localLoading) && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded bg-brand-dim border border-brand/20 text-brand flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="max-w-[85%] rounded-lg p-3 text-xs bg-dark border border-border-custom text-text-dim flex items-center gap-2 font-mono">
                  <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />
                  <span>Зв'язуюсь з сервером Gemini...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 bg-dark border-t border-border-custom space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading || localLoading}
                placeholder="Запитайте Luau код або напишіть 3D команду..."
                className="flex-1 bg-panel border border-border-custom rounded-lg px-3.5 py-2 text-xs text-white placeholder-text-dim focus:border-brand focus:outline-none focus:ring-0 disabled:opacity-50 font-mono"
                id="ai-chat-input"
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isLoading || localLoading}
                  className={`p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 border ${
                    isListening
                      ? "bg-rose-500 text-white border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-pulse"
                      : "bg-panel hover:bg-panel-light text-text-mid hover:text-white border-border-custom"
                  }`}
                  id="btn-voice-to-text"
                  title={isListening ? "Зупинити запис голосу" : "Почати голосове введення (українською)"}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-white animate-pulse" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || localLoading}
                className="p-2.5 bg-brand text-black hover:bg-brand/80 disabled:bg-panel-light disabled:text-text-dim rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
                id="btn-ai-chat-send"
              >
                <Send className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Quick Help Tip or Recording Status */}
            {isListening ? (
              <div className="flex items-center gap-1.5 px-2 text-[10px] text-rose-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>🎤 Запис голосу активовано... Говоріть команду українською мовою.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 text-[10px] text-text-dim font-mono">
                <Lightbulb className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="truncate">AI розмовляє українською мовою та створює готові скрипти.</span>
              </div>
            )}
          </form>
        </>
      ) : (
        <>
          {/* Global Chat messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-dark/20">
            {globalMessages.map((msg) => (
              <div key={msg.id} className="flex gap-2.5">
                {/* Dev initials or cool icon */}
                <div className="w-7 h-7 rounded bg-panel-light border border-border-custom text-text-mid flex items-center justify-center shrink-0 text-[10px] font-bold">
                  {msg.sender.charAt(0)}
                </div>
                <div className="max-w-[85%] rounded-lg p-3 text-xs bg-dark border border-border-custom text-white font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-1 mb-1 font-mono text-[9px] text-text-dim">
                    <span className="font-bold text-brand">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Global Input Box */}
          <form onSubmit={handleSendGlobalMessage} className="p-3 bg-dark border-t border-border-custom space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={globalInputValue}
                onChange={(e) => setGlobalInputValue(e.target.value)}
                placeholder="Напишіть у загальний чат розробників..."
                className="flex-1 bg-panel border border-border-custom rounded-lg px-3.5 py-2 text-xs text-white placeholder-text-dim focus:border-brand focus:outline-none focus:ring-0 font-sans"
              />
              <button
                type="submit"
                disabled={!globalInputValue.trim()}
                className="p-2.5 bg-brand text-black hover:bg-brand/80 disabled:bg-panel-light disabled:text-text-dim rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4 fill-current" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 px-2 text-[10px] text-text-dim font-mono">
              <Users className="w-3.5 h-3.5 text-brand shrink-0" />
              <span className="truncate">Глобальний канал розробників. Спілкуйтеся з іншими творцями!</span>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
