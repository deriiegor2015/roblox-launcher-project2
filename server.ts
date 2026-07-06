import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

// Ensure Gemini API key is available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI features will run in mock mode.");
}

// Robust retry wrapper for Gemini generateContent to handle 503/429 errors
async function generateContentWithRetry(params: any, retries = 2, delayMs = 1500): Promise<any> {
  if (!ai) throw new Error("AI is not initialized");
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      console.warn(`[Gemini API] Attempt ${attempt} failed:`, error.message || error);
      if (attempt <= retries) {
        const errMsg = String(error.message || "").toUpperCase();
        const isRetryable = error.status === 503 || error.status === 429 || 
                            errMsg.includes("503") || errMsg.includes("429") || 
                            errMsg.includes("UNAVAILABLE") || errMsg.includes("HIGH DEMAND") || 
                            errMsg.includes("FETCH") || errMsg.includes("TEMPORARY");
        if (isRetryable) {
          console.log(`[Gemini API] Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 2; // exponential backoff
          continue;
        }
      }
      throw error;
    }
  }
}

// Procedural high-quality Fallback Game Level Generator
function generateProceduralGame(prompt: string) {
  const themes = [
    { title: "Лавовий Паркур", emoji: "🌋", colors: ["#ff3300", "#ff6600", "#2c2c2c"], mats: ["Slate", "Neon"] },
    { title: "Космічна Станція", emoji: "🚀", colors: ["#00d2ff", "#0a1525", "#ffffff"], mats: ["Metal", "Glass"] },
    { title: "Зачарований Ліс", emoji: "🌳", colors: ["#2e7d32", "#8d6e63", "#4caf50"], mats: ["Wood", "Grass"] },
    { title: "Кіберпанк Обі", emoji: "🌐", colors: ["#e91e63", "#00e5ff", "#0a0a0f"], mats: ["Neon", "Metal"] }
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  let theme = themes[0];
  if (lowerPrompt.includes("косм") || lowerPrompt.includes("зірк") || lowerPrompt.includes("space") || lowerPrompt.includes("космос")) {
    theme = themes[1];
  } else if (lowerPrompt.includes("ліс") || lowerPrompt.includes("дерев") || lowerPrompt.includes("forest") || lowerPrompt.includes("сад") || lowerPrompt.includes("дерево")) {
    theme = themes[2];
  } else if (lowerPrompt.includes("кібер") || lowerPrompt.includes("cyber") || lowerPrompt.includes("неон") || lowerPrompt.includes("neon")) {
    theme = themes[3];
  } else {
    const hash = prompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    theme = themes[hash % themes.length];
  }

  const title = `ШШІ: ${prompt.charAt(0).toUpperCase() + prompt.slice(1)}`;
  const description = `Побудовано процедурно у зв'язку з високим навантаженням на ШІ-сервери (503). Неймовірний світ "${prompt}" готовий до запусків!`;
  
  const parts: any[] = [];
  
  // Baseplate
  parts.push({
    id: "fb-base",
    name: "Baseplate",
    shape: "block",
    color: theme.colors[2] || "#1e1e1e",
    position: [0, -1, 0],
    size: [120, 2, 120],
    material: theme.mats[0] || "Slate",
    anchored: true,
    canCollide: true,
    transparency: 0,
    locked: true
  });

  // SpawnLocation
  parts.push({
    id: "fb-spawn",
    name: "SpawnLocation",
    shape: "cylinder",
    color: "#ffca28",
    position: [0, 0.1, 40],
    size: [6, 0.2, 6],
    material: "Metal",
    anchored: true,
    canCollide: true,
    transparency: 0,
    specialType: "spawn"
  });

  let currentY = 0.5;
  let currentZ = 30;
  let currentX = 0;
  
  const partCount = 14 + (prompt.length % 6);
  for (let i = 0; i < partCount; i++) {
    currentZ -= 7;
    currentX += (Math.sin(i * 1.5) * 6);
    currentY += 1.2;

    let specialType: string | undefined = undefined;
    let color = theme.colors[i % theme.colors.length];
    let mat = theme.mats[i % theme.mats.length];
    let name = `Платформа ${i + 1}`;
    let size = [5, 0.8, 5];

    const step = i % 4;
    if (step === 1) {
      specialType = "killbrick";
      color = "#f44336";
      mat = "Neon";
      name = "Лазерна Перешкода";
    } else if (step === 2) {
      specialType = "trampoline";
      color = "#00bcd4";
      mat = "Fabric";
      name = "Супер Батут";
      size = [6, 1, 6];
    } else if (step === 3) {
      specialType = "speedpad";
      color = "#4caf50";
      mat = "Neon";
      name = "Прискорювач";
    }

    // Spawn a coin above normal platforms occasionally
    if (!specialType && i % 3 === 0) {
      parts.push({
        id: `fb-coin-${i}`,
        name: "Монета",
        shape: "sphere",
        color: "#ffd700",
        position: [currentX, currentY + 2.5, currentZ],
        size: [1.8, 1.8, 1.8],
        material: "Metal",
        anchored: true,
        canCollide: false,
        transparency: 0,
        specialType: "coin"
      });
    }

    parts.push({
      id: `fb-part-${i}`,
      name: name,
      shape: "block",
      color: color,
      position: [currentX, currentY, currentZ],
      size: size,
      material: mat,
      anchored: true,
      canCollide: specialType !== "coin",
      transparency: 0,
      specialType: specialType
    });
  }

  // Finishing glory coin
  parts.push({
    id: "fb-coin-end",
    name: "Фінішна Золота Зірка",
    shape: "sphere",
    color: "#ffd700",
    position: [currentX, currentY + 3, currentZ - 12],
    size: [3, 3, 3],
    material: "Metal",
    anchored: true,
    canCollide: false,
    transparency: 0,
    specialType: "coin"
  });

  return {
    title,
    description,
    emoji: theme.emoji,
    parts
  };
}

// Procedural Fallback Avatar Skin Generator
function generateProceduralSkin(prompt: string) {
  const tones = ["#FFD13B", "#FFCDA0", "#E0A96D", "#8C6239", "#563F2E"];
  const faces = ["smile", "winning-smile", "beast-mode", "chill", "man-face"];
  const hats = ["classic-cap", "fedora", "crown", "valkyrie", "dominus", "none"];
  const shirts = ["roblox-hoodie", "tuxedo", "superhero", "neon-tech", "armor", "none"];
  const pants = ["jeans", "cargo", "cyber-legs", "rainbow", "gold-knight", "none"];
  const backs = ["cape", "swords", "jetpack", "wings", "none"];

  const hash = prompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return {
    skinTone: tones[hash % tones.length],
    face: faces[(hash + 1) % faces.length],
    hat: hats[(hash + 2) % hats.length],
    shirt: shirts[(hash + 3) % shirts.length],
    pants: pants[(hash + 4) % pants.length],
    back: backs[(hash + 5) % backs.length],
    animation: "idle",
    themeDescription: `Стильний образ за запитом "${prompt}", згенерований процедурно через навантаження серверу ШІ.`
  };
}

// Procedural Fallback Clothing Generator
function generateProceduralClothing(prompt: string) {
  const types = ["hat", "shirt", "pants", "back"];
  const rarities = ["Common", "Rare", "Epic", "Legendary"];
  const hash = prompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const type = types[hash % types.length];
  const rarity = rarities[(hash + 1) % rarities.length];
  const price = 25 + (hash % 10) * 10;

  return {
    type,
    name: `Спеціальний ${prompt.charAt(0).toUpperCase() + prompt.slice(1)}`,
    emoji: type === "hat" ? "🎩" : type === "shirt" ? "👕" : type === "pants" ? "👖" : "🎒",
    rarity,
    price,
    description: `Унікальний предмет "${prompt}" лімітованої серії.`
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Chat Assistant for Roblox Luau
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages format. Expected an array." });
      }

      if (!ai) {
        // Fallback mock response when API key is missing
        return res.json({
          text: "Привіт! Я твій помічник з Roblox Studio. (Для роботи AI підключіть API ключ у налаштуваннях). Ось приклад коду для створення блоку:\n\n```lua\nlocal part = Instance.new(\"Part\")\npart.Size = Vector3.new(4, 4, 4)\npart.Position = Vector3.new(0, 10, 0)\npart.BrickColor = BrickColor.new(\"Bright red\")\npart.Parent = workspace\n```"
        });
      }

      // Convert messages to Gemini SDK friendly format
      // We take the last message and provide previous context in systemInstruction
      const lastMessage = messages[messages.length - 1]?.content || "";
      
      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: lastMessage,
        config: {
          systemInstruction: "You are an expert Roblox Luau scripting and game design tutor. You are helping a Ukrainian developer who is building their first Roblox Studio online project. Answer in Ukrainian. Keep explanations encouraging, easy to understand, and visually clear. Provide clean, well-commented Luau code snippets inside markdown blocks. Highlight Roblox best practices. Be concise, don't write overly long essays unless requested.",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      res.json({
        text: `Привіт! Наш ШІ-асистент наразі відчуває велику кількість запитів (503). Проте ось базова шпаргалка з Luau скриптингу для тебе:\n\n\`\`\`lua\n-- Як змінити властивості об'єкта:\nlocal part = script.Parent\npart.Color = Color3.fromRGB(0, 255, 136) -- Гарний неоновий колір\npart.Material = Enum.Material.Neon\npart.Anchored = true\n\n-- Функція при дотику:\npart.Touched:Connect(function(otherPart)\n    local character = otherPart.Parent\n    local humanoid = character:FindFirstChildOfClass("Humanoid")\n    if humanoid then\n        print("Гравець наступив на блок!")\n    end\nend)\n\`\`\`\n\nСпробуй пізніше, коли сервери розвантажаться!`
      });
    }
  });

  // API Route: AI Build Command (Natural Language to 3D parts list)
  app.post("/api/ai/build", async (req, res) => {
    const { prompt } = req.body;
    try {
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!ai) {
        // Fallback mock build for "obby" or general prompt
        return res.json({
          parts: [
            {
              name: "BasePlate",
              shape: "block",
              color: "#31593c",
              position: [0, -0.5, 0],
              size: [100, 1, 100],
              material: "Grass",
              anchored: true,
              canCollide: true,
              transparency: 0
            },
            {
              name: "StartPlatform",
              shape: "block",
              color: "#555555",
              position: [0, 0.5, -20],
              size: [8, 1, 8],
              material: "Slate",
              anchored: true,
              canCollide: true,
              transparency: 0
            },
            {
              name: "Checkpoint1",
              shape: "cylinder",
              color: "#ffd700",
              position: [0, 1.1, -20],
              size: [4, 0.2, 4],
              material: "Neon",
              anchored: true,
              canCollide: true,
              transparency: 0
            }
          ]
        });
      }

      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: `Create a collection of 3D primitive parts representing: "${prompt}". 
Ensure parts are placed logically, for example starting on the ground (Y is the vertical axis, Y=0 is ground level) and stacked or arranged nicely. 
Keep the total part count reasonable (under 40 parts). Choose appropriate shapes, colors, materials, and sizes to make it look great!`,
        config: {
          systemInstruction: "You are a procedural Roblox building engine. Your output MUST be valid JSON containing a list of 3D parts representing the user's prompt. Supported shapes are 'block', 'sphere', 'cylinder', and 'wedge'. Supported materials are 'Plastic', 'SmoothPlastic', 'Wood', 'Slate', 'Neon', 'Glass', 'Metal'. Position coordinates represent [X, Y, Z] (Y is height, where Y=0 is ground level). Sizes represent [Width, Height, Depth]. Anchor everything unless it should fall down. All sizes should be positive numbers.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              parts: {
                type: Type.ARRAY,
                description: "List of 3D parts to spawn in the Roblox world",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the part" },
                    shape: { 
                      type: Type.STRING, 
                      description: "Shape of the part. Must be one of: 'block', 'sphere', 'cylinder', 'wedge'" 
                    },
                    color: { type: Type.STRING, description: "Hex color code, e.g., '#ff0000'" },
                    position: { 
                      type: Type.ARRAY, 
                      description: "3D coordinates [X, Y, Z]",
                      items: { type: Type.NUMBER } 
                    },
                    size: { 
                      type: Type.ARRAY, 
                      description: "3D dimensions [Width, Height, Depth]",
                      items: { type: Type.NUMBER } 
                    },
                    material: { 
                      type: Type.STRING, 
                      description: "Material of the part. Must be one of: 'Plastic', 'SmoothPlastic', 'Wood', 'Slate', 'Neon', 'Glass', 'Metal'" 
                    },
                    anchored: { type: Type.BOOLEAN, description: "Whether the part stays fixed in space" },
                    canCollide: { type: Type.BOOLEAN, description: "Whether other objects can pass through it" },
                    transparency: { type: Type.NUMBER, description: "Transparency value from 0 (solid) to 1 (invisible)" }
                  },
                  required: ["name", "shape", "color", "position", "size", "material", "anchored"]
                }
              }
            },
            required: ["parts"]
          }
        }
      });

      const resultText = response.text || "{}";
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.warn("AI Build error (falling back to procedural):", error);
      // Fallback procedural build
      const fallback = generateProceduralGame(prompt);
      res.json({ parts: fallback.parts });
    }
  });

  // API Route: AI Game Generator (Creates complete custom cloud game)
  app.post("/api/ai/generate-game", async (req, res) => {
    const { prompt } = req.body;
    try {
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!ai) {
        // Fallback mock game when API key is missing
        return res.json({
          success: true,
          game: {
            title: `AI ${prompt.slice(0, 15)}...`,
            description: `Ігровий всесвіт за запитом "${prompt}", згенерований за допомогою штучного інтелекту в демо-режимі.`,
            emoji: "🚀",
            parts: [
              {
                id: "bg-base",
                name: "Baseplate",
                shape: "block",
                color: "#1e1e1e",
                position: [0, -1, 0],
                size: [60, 2, 60],
                material: "Slate",
                anchored: true,
                canCollide: true,
                transparency: 0,
                locked: true
              },
              {
                id: "bg-spawn",
                name: "SpawnLocation",
                shape: "cylinder",
                color: "#ffca28",
                position: [0, 0.1, 0],
                size: [6, 0.2, 6],
                material: "Metal",
                anchored: true,
                canCollide: true,
                transparency: 0,
                specialType: "spawn"
              },
              {
                id: "bg-tramp",
                name: "Trampoline",
                shape: "block",
                color: "#00bcd4",
                position: [0, 1, -15],
                size: [6, 1, 6],
                material: "Fabric",
                anchored: true,
                canCollide: true,
                transparency: 0,
                specialType: "trampoline"
              },
              {
                id: "bg-kill",
                name: "KillBrick",
                shape: "block",
                color: "#f44336",
                position: [0, 8, -25],
                size: [8, 0.5, 4],
                material: "Neon",
                anchored: true,
                canCollide: true,
                transparency: 0,
                specialType: "killbrick"
              },
              {
                id: "bg-coin",
                name: "FinishingCoin",
                shape: "sphere",
                color: "#ffd700",
                position: [0, 15, -35],
                size: [2.5, 2.5, 2.5],
                material: "Metal",
                anchored: true,
                canCollide: false,
                transparency: 0,
                specialType: "coin"
              }
            ]
          }
        });
      }

      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: `Generate a fully functional Roblox game representation for: "${prompt}".
Output a title, description, appropriate fun emoji, and a list of 3D Parts (around 10-25 parts) with logical spatial layout starting around Y=0.
Make sure to include critical gameplay elements such as:
1. One SpawnLocation (with specialType="spawn", cylinder shape, positioned at Y=0.1, color gold/yellow).
2. Several intermediate platforms, steps, obstacles, speedpads (with specialType="speedpad"), trampolines (with specialType="trampoline"), or killbricks (with specialType="killbrick").
3. Checkpoints (with specialType="checkpoint") to save progress.
4. Collectible coins (with specialType="coin", metal material, shape sphere, size [1.5, 1.5, 1.5]).
Ensure X, Y, Z coordinates form a playable map (like an obby or parkour) where the player can realistically jump from one part to the next. Part sizes must be positive, e.g., [4, 1, 4].`,
        config: {
          systemInstruction: "You are an expert game level designer. Your output MUST be valid JSON containing the game title (string, in Ukrainian), description (string, in Ukrainian describing the game lore and instructions), a single fun emoji representing the theme, and a list of parts to build the map.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Title of the generated game in Ukrainian" },
              description: { type: Type.STRING, description: "Description of the generated game in Ukrainian" },
              emoji: { type: Type.STRING, description: "A single representative emoji (e.g., 🌋, 🏎️, 🚀)" },
              parts: {
                type: Type.ARRAY,
                description: "List of parts comprising the game map",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the part" },
                    shape: { 
                      type: Type.STRING, 
                      description: "Shape of the part: 'block', 'sphere', 'cylinder', 'wedge'" 
                    },
                    color: { type: Type.STRING, description: "Hex color code, e.g., '#ff0000'" },
                    position: { 
                      type: Type.ARRAY, 
                      description: "3D coordinates [X, Y, Z] where Y is height",
                      items: { type: Type.NUMBER } 
                    },
                    size: { 
                      type: Type.ARRAY, 
                      description: "3D dimensions [Width, Height, Depth]",
                      items: { type: Type.NUMBER } 
                    },
                    material: { 
                      type: Type.STRING, 
                      description: "Material of the part: 'Plastic', 'SmoothPlastic', 'Wood', 'Slate', 'Neon', 'Glass', 'Metal', 'Fabric'" 
                    },
                    anchored: { type: Type.BOOLEAN, description: "True if fixed in space" },
                    canCollide: { type: Type.BOOLEAN, description: "True if solid" },
                    transparency: { type: Type.NUMBER, description: "Transparency 0 to 1" },
                    specialType: { 
                      type: Type.STRING, 
                      description: "Special functional type of the block if applicable: 'spawn', 'killbrick', 'trampoline', 'speedpad', 'coin', 'checkpoint', 'tree', 'zombie', 'light'" 
                    }
                  },
                  required: ["name", "shape", "color", "position", "size", "material", "anchored"]
                }
              }
            },
            required: ["title", "description", "emoji", "parts"]
          }
        }
      });

      const resultText = response.text || "{}";
      const parsed = JSON.parse(resultText);
      res.json({
        success: true,
        game: parsed
      });
    } catch (error: any) {
      console.warn("AI Game Generator error (falling back to procedural):", error);
      const fallbackGame = generateProceduralGame(prompt);
      res.json({
        success: true,
        game: fallbackGame
      });
    }
  });

  // API Route: AI Avatar/Skin Generator
  app.post("/api/ai/generate-skin", async (req, res) => {
    const { prompt } = req.body;
    try {
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!ai) {
        // Fallback mock skin when API key is missing
        return res.json({
          success: true,
          avatar: {
            skinTone: "#FFD13B",
            face: "chill",
            hat: "classic-cap",
            shirt: "roblox-hoodie",
            pants: "jeans",
            back: "wings",
            animation: "idle",
            themeDescription: "Класичний стиль (Демо режим, підключіть API ключ)."
          }
        });
      }

      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: `Generate a Roblox Avatar configuration for the prompt: "${prompt}".
Choose matching skin tones and accessory IDs that best represent this look.
Available Hat IDs: "classic-cap", "fedora", "crown", "valkyrie", "dominus", "none".
Available Shirt IDs: "roblox-hoodie", "tuxedo", "superhero", "neon-tech", "armor", "none".
Available Pants IDs: "jeans", "cargo", "cyber-legs", "rainbow", "gold-knight", "none".
Available Back IDs: "cape", "swords", "jetpack", "wings", "none".
Available Face IDs: "smile", "winning-smile", "beast-mode", "chill", "man-face".
Available Animation IDs: "idle", "wave", "dance", "ninja".
Select a high-quality skinTone (hex code) and provide a nice Ukrainian description of the aesthetic.`,
        config: {
          systemInstruction: "You are a creative character customizer for Roblox. You select accessories that match the user's prompt style.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skinTone: { type: Type.STRING, description: "Matching hex color code for skin tone, e.g. '#FFD13B'" },
              face: { type: Type.STRING, description: "Face ID matching smile, winning-smile, beast-mode, chill, or man-face" },
              hat: { type: Type.STRING, description: "Hat ID matching classic-cap, fedora, crown, valkyrie, dominus, or none" },
              shirt: { type: Type.STRING, description: "Shirt ID matching roblox-hoodie, tuxedo, superhero, neon-tech, armor, or none" },
              pants: { type: Type.STRING, description: "Pants ID matching jeans, cargo, cyber-legs, rainbow, gold-knight, or none" },
              back: { type: Type.STRING, description: "Back ID matching cape, swords, jetpack, wings, or none" },
              animation: { type: Type.STRING, description: "Animation ID matching idle, wave, dance, or ninja" },
              themeDescription: { type: Type.STRING, description: "A creative description of the aesthetic in Ukrainian" }
            },
            required: ["skinTone", "face", "hat", "shirt", "pants", "back", "animation", "themeDescription"]
          }
        }
      });

      const resultText = response.text || "{}";
      const parsed = JSON.parse(resultText);
      res.json({
        success: true,
        avatar: parsed
      });
    } catch (error: any) {
      console.warn("AI Skin Generator error (falling back to procedural):", error);
      const fallbackSkin = generateProceduralSkin(prompt);
      res.json({
        success: true,
        avatar: fallbackSkin
      });
    }
  });

  // API Route: AI Clothing Catalog Generator
  app.post("/api/ai/generate-clothing", async (req, res) => {
    const { prompt } = req.body;
    try {
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!ai) {
        // Fallback mock clothing when API key is missing
        return res.json({
          success: true,
          clothing: {
            type: "shirt",
            name: "Неоновий Шпигун",
            emoji: "🌐",
            rarity: "Epic",
            price: 50,
            desc: "Випромінює таємниче блакитне світло (Демо-режим, підключіть API ключ).",
            description: "Випромінює таємниче блакитне світло (Демо-режим, підключіть API ключ)."
          }
        });
      }

      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: `Create a custom Roblox catalog accessory based on the prompt: "${prompt}".
Determine the best type ("hat", "shirt", "pants", or "back"), assign an elegant name in Ukrainian, select a matching visual emoji, choose a rarity ("Common", "Rare", "Epic", "Legendary"), specify a price in Robux, and write a fun, detailed description in Ukrainian.`,
        config: {
          systemInstruction: "You are an imaginative Roblox UGC catalog clothing designer. You create awesome customized items for players.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "Item type: 'hat', 'shirt', 'pants', 'back'" },
              name: { type: Type.STRING, description: "Item name in Ukrainian" },
              emoji: { type: Type.STRING, description: "A representative emoji" },
              rarity: { type: Type.STRING, description: "Rarity: 'Common', 'Rare', 'Epic', 'Legendary'" },
              price: { type: Type.NUMBER, description: "Price of the item in Robux (integer, e.g., 100)" },
              description: { type: Type.STRING, description: "Creative item lore/description in Ukrainian" }
            },
            required: ["type", "name", "emoji", "rarity", "price", "description"]
          }
        }
      });

      const resultText = response.text || "{}";
      const parsed = JSON.parse(resultText);
      res.json({
        success: true,
        clothing: {
          ...parsed,
          desc: parsed.desc || parsed.description || ""
        }
      });
    } catch (error: any) {
      console.warn("AI Clothing Generator error (falling back to procedural):", error);
      const fallbackClothing = generateProceduralClothing(prompt);
      res.json({
        success: true,
        clothing: {
          ...fallbackClothing,
          desc: fallbackClothing.description
        }
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // Create real-time Socket.io server
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
  });

  interface Player {
    id: string;
    username: string;
    avatarConfig: any;
    roomId: string;
    position: [number, number, number];
    rotation: [number, number, number];
  }

  const clients = new Map<string, { player: Player, socketId: string }>();

  io.on("connection", (socket) => {
    console.log(`New player connected via Socket.io: ${socket.id}`);

    socket.on("join", (data) => {
      try {
        const player: Player = {
          id: data.id || Math.random().toString(36).substring(2, 9),
          username: data.username || "Guest",
          avatarConfig: data.avatarConfig,
          roomId: data.roomId || "lobby",
          position: data.position || [0, 5, 0],
          rotation: data.rotation || [0, 0, 0]
        };
        
        clients.set(socket.id, { player, socketId: socket.id });
        
        // Join the Socket.io room natively
        socket.join(player.roomId);
        console.log(`Player ${player.username} joined room ${player.roomId} (Socket: ${socket.id})`);

        // Send list of other players in the same room to the joining player
        const roomPlayers: Player[] = [];
        clients.forEach((c) => {
          if (c.socketId !== socket.id && c.player.roomId === player.roomId) {
            roomPlayers.push(c.player);
          }
        });

        socket.emit("room_state", {
          players: roomPlayers
        });

        // Notify everyone in the same room about the new player
        socket.to(player.roomId).emit("player_joined", {
          player: player
        });
      } catch (err) {
        console.error("Error handling join:", err);
      }
    });

    socket.on("move", (data) => {
      try {
        const client = clients.get(socket.id);
        if (client) {
          client.player.position = data.position || client.player.position;
          client.player.rotation = data.rotation || client.player.rotation;

          // Broadcast movement to all other clients in the same room
          socket.to(client.player.roomId).emit("player_moved", {
            id: client.player.id,
            username: client.player.username,
            position: client.player.position,
            rotation: client.player.rotation
          });
        }
      } catch (err) {
        console.error("Error handling move:", err);
      }
    });

    socket.on("chat", (data) => {
      try {
        const client = clients.get(socket.id);
        if (client) {
          // Broadcast chat to all clients in the same room (including sender via io.to to confirm delivery)
          io.to(client.player.roomId).emit("player_chatted", {
            id: client.player.id,
            username: client.player.username,
            message: data.message
          });
        }
      } catch (err) {
        console.error("Error handling chat:", err);
      }
    });

    socket.on("update_avatar", (data) => {
      try {
        const client = clients.get(socket.id);
        if (client) {
          client.player.avatarConfig = data.avatarConfig;

          // Broadcast avatar update to all other clients in the same room
          socket.to(client.player.roomId).emit("player_avatar_updated", {
            id: client.player.id,
            avatarConfig: client.player.avatarConfig
          });
        }
      } catch (err) {
        console.error("Error handling update_avatar:", err);
      }
    });

    socket.on("stats_update", (data) => {
      try {
        const client = clients.get(socket.id);
        if (client) {
          // Can track other stats or broadcast if needed
          console.log(`Stats updated for ${client.player.username}: Coins=${data.coins}, Deaths=${data.deaths}`);
        }
      } catch (err) {
        console.error("Error handling stats_update:", err);
      }
    });

    socket.on("disconnect", () => {
      try {
        const client = clients.get(socket.id);
        if (client) {
          clients.delete(socket.id);
          console.log(`Player ${client.player.username} disconnected`);

          // Notify other players in the same room
          socket.to(client.player.roomId).emit("player_left", {
            id: client.player.id,
            username: client.player.username
          });
        }
      } catch (err) {
        console.error("Error handling disconnect:", err);
      }
    });
  });
}

startServer();
