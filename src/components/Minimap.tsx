import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RobloxPart } from "../types";
import { Compass, ZoomIn, ZoomOut, Navigation } from "lucide-react";

interface MinimapProps {
  parts: RobloxPart[];
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  characterRotationRef: React.MutableRefObject<number>;
  npcsRef: React.MutableRefObject<any[]>;
}

export default function Minimap({ parts, playerPosRef, characterRotationRef, npcsRef }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(2.0); // pixels per meter
  const [isRotating, setIsRotating] = useState<boolean>(false); // whether map rotates with player direction

  useEffect(() => {
    let animationFrameId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    const render = () => {
      // Clear canvas with a nice dark glassmorphism styling
      ctx.fillStyle = "rgba(10, 14, 22, 0.85)";
      ctx.fillRect(0, 0, width, height);

      const px = playerPosRef.current.x;
      const pz = playerPosRef.current.z;
      const py = playerPosRef.current.y;
      const pRot = characterRotationRef.current; // radian angle

      // 1. Draw Grid Background relative to player position
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 10; // 10 meters grid lines
      const gridOffsetMultiplier = zoom * gridSize;

      // Calculate where the grid lines start
      const startX = ((-px * zoom) % gridOffsetMultiplier) - gridOffsetMultiplier;
      const startY = ((-pz * zoom) % gridOffsetMultiplier) - gridOffsetMultiplier;

      // Draw vertical lines
      for (let x = startX; x < width + gridOffsetMultiplier; x += gridOffsetMultiplier) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = startY; y < height + gridOffsetMultiplier; y += gridOffsetMultiplier) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw all parts
      parts.forEach((part) => {
        // Position relative to player
        const rx = part.position[0] - px;
        const rz = part.position[2] - pz;

        // Size scaled by zoom
        const pw = part.size[0] * zoom;
        const pd = part.size[2] * zoom;

        // Canvas coordinates
        const mapX = cx + rx * zoom;
        const mapY = cy + rz * zoom;

        // Skip drawing if completely out of bounds of our minimap
        if (
          mapX < -pw &&
          mapX > width + pw &&
          mapY < -pd &&
          mapY > height + pd
        ) {
          return;
        }

        // Color styling based on specialType or part color
        if (part.specialType === "killbrick") {
          ctx.fillStyle = "rgba(239, 68, 68, 0.8)"; // Red glowing danger
          ctx.strokeStyle = "#ef4444";
        } else if (part.specialType === "spawn") {
          ctx.fillStyle = "rgba(245, 158, 11, 0.6)"; // Orange spawn point
          ctx.strokeStyle = "#f59e0b";
        } else if (part.specialType === "checkpoint") {
          ctx.fillStyle = "rgba(59, 130, 246, 0.6)"; // Blue checkpoint
          ctx.strokeStyle = "#3b82f6";
        } else if (part.specialType === "trampoline") {
          ctx.fillStyle = "rgba(168, 85, 247, 0.6)"; // Purple trampoline
          ctx.strokeStyle = "#a855f7";
        } else if (part.specialType === "coin") {
          ctx.fillStyle = "rgba(251, 191, 36, 0.9)"; // Golden coin circle
          ctx.strokeStyle = "#fbbf24";
        } else {
          ctx.fillStyle = part.color || "rgba(100, 116, 139, 0.4)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        }

        ctx.lineWidth = 1;

        if (part.specialType === "coin") {
          // Draw round coins
          ctx.beginPath();
          ctx.arc(mapX, mapY, Math.max(2, 0.6 * zoom), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          // Draw standard rectangle parts
          ctx.beginPath();
          ctx.rect(mapX - pw / 2, mapY - pd / 2, pw, pd);
          ctx.fill();
          ctx.stroke();
        }
      });

      // 3. Draw NPCs (bots)
      const npcs = npcsRef.current || [];
      npcs.forEach((npc) => {
        const rx = npc.position.x - px;
        const rz = npc.position.z - pz;

        const mapX = cx + rx * zoom;
        const mapY = cy + rz * zoom;

        // Skip if out of bounds
        if (mapX < 0 || mapX > width || mapY < 0 || mapY > height) return;

        // Bot circle
        ctx.beginPath();
        ctx.arc(mapX, mapY, 5, 0, Math.PI * 2);
        ctx.fillStyle = npc.role === "Guest_Builderman" ? "#f59e0b" : "#3b82f6";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label for NPC initials
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        const initial = npc.role === "Guest_Builderman" ? "BM" : npc.role === "Guest_Noob" ? "NB" : "G7";
        ctx.fillText(initial, mapX, mapY - 8);
      });

      // 4. Draw Player in the center
      // A glowing FOV Cone or pointer triangle
      ctx.save();
      ctx.translate(cx, cy);
      // characterRotation is in radians. We can rotate the pointer to match character angle.
      // Three.js rotation of character has opposite direction sometimes, so let's adjust direction
      ctx.rotate(-pRot - Math.PI); 

      // Draw FOV view sector (transparent glow)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 30, -Math.PI / 6, Math.PI / 6);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 255, 136, 0.15)";
      ctx.fill();

      // Draw player pointer triangle
      ctx.beginPath();
      ctx.moveTo(0, -6); // nose
      ctx.lineTo(-5, 5); // left corner
      ctx.lineTo(5, 5);  // right corner
      ctx.closePath();
      ctx.fillStyle = "#00FF88";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      // Add small inner pulse circle for player position
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // 5. Draw Compass Ring Overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, width / 2 - 3, 0, Math.PI * 2);
      ctx.stroke();

      // Draw North (N) Marker at the top
      ctx.fillStyle = "#ef4444"; // Red for north
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("N", cx, 10);

      // Draw South (S) Marker at the bottom
      ctx.fillStyle = "#ffffff";
      ctx.fillText("S", cx, height - 10);

      // Draw West (W) and East (E)
      ctx.fillText("W", 10, cy);
      ctx.fillText("E", width - 10, cy);

      // Coordinates text at bottom center
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "8px monospace";
      ctx.fillText(
        `X: ${px.toFixed(1)} Z: ${pz.toFixed(1)}`,
        cx,
        height - 22
      );

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [parts, zoom, isRotating]);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/15 p-2.5 rounded-2xl flex flex-col items-center gap-1.5 shadow-2xl relative select-none w-[172px]" id="hud-minimap-container">
      {/* Header Info */}
      <div className="flex items-center justify-between w-full text-[10px] text-gray-300 px-1 font-bold font-mono">
        <span className="flex items-center gap-1 text-[#00FF88]">
          <Compass className="w-3 h-3 animate-spin-slow" />
          <span>MINIMAP</span>
        </span>
        <span className="text-[9px] text-gray-500">1:{(50 / zoom).toFixed(0)}</span>
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-full overflow-hidden border border-white/10 bg-[#0d1017] shadow-inner">
        <canvas
          ref={canvasRef}
          width={150}
          height={150}
          className="block rounded-full"
        />

        {/* Small zoom buttons floating inside map */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
          <button
            onClick={() => setZoom((prev) => Math.min(5.0, prev + 0.5))}
            className="w-5 h-5 bg-black/75 hover:bg-black border border-white/15 hover:border-brand text-white flex items-center justify-center rounded-full text-[10px] font-bold cursor-pointer transition-all active:scale-90"
            title="Приближати"
          >
            <ZoomIn className="w-3 h-3 text-brand" />
          </button>
          <button
            onClick={() => setZoom((prev) => Math.max(0.8, prev - 0.5))}
            className="w-5 h-5 bg-black/75 hover:bg-black border border-white/15 hover:border-brand text-white flex items-center justify-center rounded-full text-[10px] font-bold cursor-pointer transition-all active:scale-90"
            title="Віддаляти"
          >
            <ZoomOut className="w-3 h-3 text-brand" />
          </button>
        </div>
      </div>
    </div>
  );
}
