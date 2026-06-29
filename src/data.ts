import { ToolboxItem, RobloxPart, ExplorerNode } from "./types";

export const TOOLBOX_ITEMS: ToolboxItem[] = [
  {
    name: "Spawn Location",
    description: "Точка появи гравців",
    icon: "MapPin",
    specialType: "spawn",
    color: "#ffca28",
    shape: "cylinder",
    size: [6, 0.5, 6],
    material: "Metal",
    anchored: true,
    canCollide: true
  },
  {
    name: "Kill Brick (Лава)",
    description: "Шкода при дотику (зменшує здоров'я)",
    icon: "Flame",
    specialType: "killbrick",
    color: "#f44336",
    shape: "block",
    size: [4, 1, 4],
    material: "Neon",
    anchored: true,
    canCollide: true
  },
  {
    name: "Батут (Trampoline)",
    description: "Підкидає гравця високо вгору",
    icon: "ArrowUpCircle",
    specialType: "trampoline",
    color: "#00bcd4",
    shape: "block",
    size: [5, 1, 5],
    material: "Fabric",
    anchored: true,
    canCollide: true
  },
  {
    name: "Speed Pad (Прискорювач)",
    description: "Збільшує швидкість переміщення",
    icon: "Zap",
    specialType: "speedpad",
    color: "#4caf50",
    shape: "wedge",
    size: [4, 1, 6],
    material: "Neon",
    anchored: true,
    canCollide: true
  },
  {
    name: "Монетка (Coin)",
    description: "Предмет для збору. Обертається та додає бали",
    icon: "Coins",
    specialType: "coin",
    color: "#ffd700",
    shape: "sphere",
    size: [1.5, 1.5, 1.5],
    material: "Metal",
    anchored: true,
    canCollide: false
  },
  {
    name: "Дерево (Tree)",
    description: "Декоративне дерево (стовбур + крона)",
    icon: "Trees",
    specialType: "tree",
    color: "#8d6e63",
    shape: "cylinder",
    size: [1.5, 8, 1.5],
    material: "Wood",
    anchored: true,
    canCollide: true
  },
  {
    name: "Зомбі (Zombie)",
    description: "Моб, який блукає по сцені",
    icon: "Skull",
    specialType: "zombie",
    color: "#388e3c",
    shape: "block",
    size: [3, 5, 2],
    material: "Plastic",
    anchored: false,
    canCollide: true
  },
  {
    name: "Ліхтар (Street Light)",
    description: "Джерело світла на металевій опорі",
    icon: "Lightbulb",
    specialType: "light",
    color: "#b0bec5",
    shape: "cylinder",
    size: [0.8, 12, 0.8],
    material: "Metal",
    anchored: true,
    canCollide: true
  },
  {
    name: "Чекпоінт (Checkpoint)",
    description: "Зберігає прогрес обі (Obby)",
    icon: "Flag",
    specialType: "checkpoint",
    color: "#2196f3",
    shape: "block",
    size: [5, 0.2, 5],
    material: "SmoothPlastic",
    anchored: true,
    canCollide: true
  }
];

export const INITIAL_PARTS: RobloxPart[] = [
  {
    id: "baseplate",
    name: "Baseplate",
    shape: "block",
    color: "#274e13",
    position: [0, -1, 0],
    size: [100, 2, 100],
    material: "Grass",
    anchored: true,
    canCollide: true,
    transparency: 0,
    locked: true
  },
  {
    id: "spawn",
    name: "SpawnLocation",
    shape: "cylinder",
    color: "#7f6000",
    position: [0, 0.1, 0],
    size: [6, 0.2, 6],
    material: "Metal",
    anchored: true,
    canCollide: true,
    transparency: 0,
    specialType: "spawn"
  },
  {
    id: "pillar1",
    name: "DecorativePillar",
    shape: "cylinder",
    color: "#cccccc",
    position: [-15, 5, -15],
    size: [3, 10, 3],
    material: "Slate",
    anchored: true,
    canCollide: true,
    transparency: 0
  },
  {
    id: "sphere1",
    name: "NeonBall",
    shape: "sphere",
    color: "#00ffff",
    position: [15, 3, 15],
    size: [4, 4, 4],
    material: "Neon",
    anchored: true,
    canCollide: true,
    transparency: 0
  }
];

export const INITIAL_EXPLORER: ExplorerNode = {
  id: "root",
  name: "RobloxProject",
  type: "Folder",
  expanded: true,
  children: [
    {
      id: "workspace",
      name: "Workspace",
      type: "Workspace",
      expanded: true,
      children: [
        { id: "exp-baseplate", name: "Baseplate", type: "Part", partId: "baseplate" },
        { id: "exp-spawn", name: "SpawnLocation", type: "Part", partId: "spawn" },
        { id: "exp-pillar1", name: "DecorativePillar", type: "Part", partId: "pillar1" },
        { id: "exp-sphere1", name: "NeonBall", type: "Part", partId: "sphere1" }
      ]
    },
    {
      id: "players",
      name: "Players",
      type: "Players",
      expanded: false,
      children: []
    },
    {
      id: "lighting",
      name: "Lighting",
      type: "Lighting",
      expanded: false,
      children: []
    },
    {
      id: "replicatedstorage",
      name: "ReplicatedStorage",
      type: "ReplicatedStorage",
      expanded: false,
      children: []
    },
    {
      id: "serverscriptservice",
      name: "ServerScriptService",
      type: "ServerScriptService",
      expanded: true,
      children: [
        {
          id: "script-welcome",
          name: "WelcomeScript",
          type: "Script"
        }
      ]
    },
    {
      id: "startergui",
      name: "StarterGui",
      type: "StarterGui",
      expanded: false,
      children: []
    }
  ]
};

export interface ScriptTemplate {
  name: string;
  description: string;
  code: string;
}

export const LUA_TEMPLATES: ScriptTemplate[] = [
  {
    name: "Привітання (Welcome)",
    description: "Друк вітання та приклад роботи зі змінними",
    code: `-- Roblox Studio Online Welcome Script
local players = game:GetService("Players")
print("Ласкаво просимо до Roblox Studio Online!")

local welcomeMessage = "Бажаємо успіху у створенні вашої першої гри!"
print(welcomeMessage)

local partCount = #workspace:GetChildren()
print("Кількість деталей у Workspace: " .. tostring(partCount))
`
  },
  {
    name: "Налаштування батута (Trampoline)",
    description: "Скрипт для виявлення торкання батута та посилення імпульсу Y",
    code: `-- Lua скрипт для підкидання на батуті
local trampoline = workspace:FindFirstChild("Trampoline")

if trampoline then
    print("Знайдено Батут! Підключаємо подію дотику...")
    
    trampoline.Touched:Connect(function(hit)
        local character = hit.Parent
        local humanoid = character:FindFirstChildOfClass("Humanoid")
        
        if humanoid then
            print("Гравець наступив на батут! Швидкість стрибка збільшена!")
            humanoid.JumpPower = 100
            
            -- Візуальний ефект: миготіння кольором
            trampoline.BrickColor = BrickColor.new("Bright cyan")
            task.wait(0.5)
            trampoline.BrickColor = BrickColor.new("Dark stone grey")
        end
    end)
else
    print("Помилка: Створіть об'єкт з іменем 'Trampoline'")
end
`
  },
  {
    name: "Вбивча Лава (Kill Brick)",
    description: "Смертельний блок лави: знімає здоров'я гравця при торканні",
    code: `-- Смертельна лава (Kill Brick)
local lava = workspace:FindFirstChild("KillBrick")

if lava then
    lava.Touched:Connect(function(hit)
        local humanoid = hit.Parent:FindFirstChildOfClass("Humanoid")
        if humanoid then
            print("Oof! Гравець торкнувся лави!")
            humanoid.Health = 0 -- Миттєва смерть
        end
    end)
else
    print("Лава з назвою 'KillBrick' не знайдена!")
end
`
  },
  {
    name: "Автоматичне створення деталей (Loop Parts)",
    description: "Створення 10 деталей по спіралі за допомогою циклу",
    code: `-- Автоматична генерація деталей через цикл
print("Починаємо будівництво сходів...")

for i = 1, 10 do
    local step = Instance.new("Part")
    step.Name = "AutoStep_" .. i
    step.Size = Vector3.new(4, 1, 2)
    step.Position = Vector3.new(0, i, i * 2)
    step.BrickColor = BrickColor.random()
    step.Anchored = true
    step.Parent = workspace
    
    print("Створено сходинку #" .. i)
    task.wait(0.1)
end
`
  },
  {
    name: "Система збору монет (Coin Collect)",
    description: "Збір монет, додавання очок гравцям та зникнення монет",
    code: `-- Збір монет та лідерборд
local coin = workspace:FindFirstChild("Coin")

if coin then
    coin.Touched:Connect(function(hit)
        local player = game.Players:GetPlayerFromCharacter(hit.Parent)
        if player then
            print("Монетка зібрана гравцем " .. player.Name)
            player.leaderstats.Coins.Value = player.leaderstats.Coins.Value + 1
            
            coin:Destroy() -- Видалення зі сцени
        end
    end)
else
    print("Створіть монету 'Coin' для збору!")
end
`
  }
];
