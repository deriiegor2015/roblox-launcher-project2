export type PartShape = "block" | "sphere" | "cylinder" | "wedge";

export type PartMaterial = 
  | "Plastic" 
  | "SmoothPlastic" 
  | "Wood" 
  | "Slate" 
  | "Neon" 
  | "Glass" 
  | "Metal" 
  | "Grass" 
  | "Ice" 
  | "Fabric";

export interface RobloxPart {
  id: string;
  name: string;
  shape: PartShape;
  color: string; // Hex color
  position: [number, number, number]; // [X, Y, Z]
  size: [number, number, number]; // [W, H, D]
  material: PartMaterial;
  anchored: boolean;
  canCollide: boolean;
  transparency: number; // 0 to 1
  locked?: boolean;
  // Dynamic properties for special game elements
  specialType?: "spawn" | "killbrick" | "trampoline" | "speedpad" | "coin" | "tree" | "zombie" | "light" | "checkpoint" | "custom_obj";
  velocity?: [number, number, number]; // for physics simulation
  objData?: { vertices: number[]; faces: number[]; name?: string };
}

export type ActiveRibbonTab = "Home" | "Model" | "Test" | "View" | "AI Assistant";

export interface ConsoleLog {
  id: string;
  type: "info" | "warn" | "error" | "lua" | "success";
  text: string;
  timestamp: string;
}

export interface ExplorerNode {
  id: string;
  name: string;
  type: "Workspace" | "Players" | "Lighting" | "ReplicatedStorage" | "ServerScriptService" | "StarterGui" | "Part" | "Folder" | "Script";
  children?: ExplorerNode[];
  partId?: string; // Links explorer item to RobloxPart
  expanded?: boolean;
}

export interface ToolboxItem {
  name: string;
  description: string;
  icon: string; // Lucide icon name
  specialType: RobloxPart["specialType"];
  color: string;
  shape: PartShape;
  size: [number, number, number];
  material: PartMaterial;
  anchored: boolean;
  canCollide: boolean;
  objData?: { vertices: number[]; faces: number[]; name?: string };
}

export interface WorkspaceStateVersion {
  id: string;
  timestamp: string;
  description: string;
  parts: RobloxPart[];
}

