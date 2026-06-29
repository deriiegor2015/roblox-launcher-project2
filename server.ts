import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

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
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: lastMessage,
        config: {
          systemInstruction: "You are an expert Roblox Luau scripting and game design tutor. You are helping a Ukrainian developer who is building their first Roblox Studio online project. Answer in Ukrainian. Keep explanations encouraging, easy to understand, and visually clear. Provide clean, well-commented Luau code snippets inside markdown blocks. Highlight Roblox best practices. Be concise, don't write overly long essays unless requested.",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route: AI Build Command (Natural Language to 3D parts list)
  app.post("/api/ai/build", async (req, res) => {
    try {
      const { prompt } = req.body;
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

      const response = await ai.models.generateContent({
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
      console.error("AI Build error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
