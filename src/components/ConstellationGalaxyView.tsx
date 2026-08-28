"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dream, DreamCategory } from "@/types/dream";
import { DREAM_CATEGORIES } from "@/lib/constants";
import { playPoemMagicSound, playTactileClick } from "@/lib/audio-synthesizer";
import Image from "next/image";

interface ConstellationGalaxyViewProps {
  dreams: Dream[];
  onSelectDream: (dream: Dream) => void;
}

interface StarNode {
  id: string;
  dream: Dream;
  x: number;
  y: number;
  radius: number;
  color: string;
  pulsePhase: number;
  category: DreamCategory;
}

const CATEGORY_COLORS: Record<DreamCategory, string> = {
  career: "#0091EA",   // DEVER Blue
  study: "#FAC775",    // Amber Gold
  travel: "#10B981",   // Emerald Green
  family: "#E63946",   // Crimson Red
  big_dream: "#8B5CF6",// Cyber Purple
  other: "#FFD166",    // Golden Warm
};

export const ConstellationGalaxyView: React.FC<ConstellationGalaxyViewProps> = ({
  dreams,
  onSelectDream,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<StarNode | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const nodesRef = useRef<StarNode[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize and distribute star nodes in galaxy formation
  useEffect(() => {
    if (!canvasRef.current || dreams.length === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Distribute dreams into circular nebula clusters by category
    const categories: DreamCategory[] = ["career", "tech", "friendship", "academic", "club", "love"];
    const nodes: StarNode[] = [];

    const centerX = width / 2;
    const centerY = height / 2;
    const radiusScale = Math.min(width, height) * 0.38;

    dreams.forEach((dream, idx) => {
      const catIdx = categories.indexOf(dream.tag);
      const angleOffset = (catIdx / categories.length) * Math.PI * 2;
      const angle = angleOffset + ((idx % 6) * 0.22) - 0.45;
      const dist = radiusScale * (0.35 + (idx % 5) * 0.14) + (Math.random() * 40 - 20);

      nodes.push({
        id: dream.id,
        dream,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        radius: 4.5 + (idx % 3) * 1.5,
        color: CATEGORY_COLORS[dream.tag] || "#FAC775",
        pulsePhase: Math.random() * Math.PI * 2,
        category: dream.tag,
      });
    });

    nodesRef.current = nodes;
  }, [dreams]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Background ambient background stars
    const bgStars: Array<{ x: number; y: number; size: number; alpha: number; speed: number }> = [];
    for (let i = 0; i < 160; i++) {
      bgStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.02 + 0.005,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;

      // Dark celestial backdrop
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
      bgGrad.addColorStop(0, "#0e1a30");
      bgGrad.addColorStop(0.6, "#08101e");
      bgGrad.addColorStop(1, "#03060a");

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render ambient background twinkling stars
      bgStars.forEach((star) => {
        const twinkle = Math.sin(time * star.speed * 100 + star.x) * 0.4 + star.alpha;
        ctx.fillStyle = `rgba(250, 238, 218, ${Math.max(0.1, Math.min(1, twinkle))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      const nodes = nodesRef.current;

      // Draw Constellation Lines between nodes of same category
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          if (a.category === b.category) {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 260) {
              const isMatchCat = activeCategory === "all" || activeCategory === a.category;
              const alpha = (1 - dist / 260) * (isMatchCat ? 0.35 : 0.08);

              ctx.strokeStyle = a.color;
              ctx.globalAlpha = alpha;
              ctx.lineWidth = isMatchCat ? 1.5 : 0.8;
              ctx.setLineDash([4, 4]);

              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();

              // Moving energy pulse packet along line
              const pulseT = (time * 0.6 + i * 0.3) % 1;
              const px = a.x + (b.x - a.x) * pulseT;
              const py = a.y + (b.y - a.y) * pulseT;

              ctx.setLineDash([]);
              ctx.fillStyle = "#ffffff";
              ctx.globalAlpha = alpha * 1.5;
              ctx.beginPath();
              ctx.arc(px, py, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      ctx.setLineDash([]);

      // Draw Star Nodes
      nodes.forEach((node) => {
        const isMatchCat = activeCategory === "all" || activeCategory === node.category;
        const isHovered = hoveredNode?.id === node.id;
        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.3 + 1;

        const currentRadius = isHovered ? node.radius * 2.2 : isMatchCat ? node.radius * pulse : node.radius * 0.7;

        // Outer starlight aura glow
        const auraGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, currentRadius * 4);
        auraGrad.addColorStop(0, node.color);
        auraGrad.addColorStop(0.4, `${node.color}66`);
        auraGrad.addColorStop(1, "transparent");

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core bright star
        ctx.fillStyle = isHovered ? "#ffffff" : node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Star Label
        if (isMatchCat || isHovered) {
          ctx.fillStyle = isHovered ? "#ffffff" : "rgba(250, 238, 218, 0.8)";
          ctx.font = isHovered ? "bold 12px 'Plus Jakarta Sans', sans-serif" : "10px 'Plus Jakarta Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(node.dream.name || "Ẩn danh", node.x, node.y + currentRadius + 14);
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeCategory, hoveredNode]);

  // Pointer Interaction
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found: StarNode | null = null;
    for (const node of nodesRef.current) {
      const dx = node.x - mx;
      const dy = node.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 14) {
        found = node;
        break;
      }
    }

    if (found !== hoveredNode) {
      setHoveredNode(found);
      if (found) {
        playTactileClick();
      }
    }
  };

  const handleCanvasClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (hoveredNode) {
      playPoemMagicSound();
      onSelectDream(hoveredNode.dream);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-pointer"
      />

      {/* Category Filter Pills on Galaxy */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-full bg-[#12203A]/85 backdrop-blur-md border border-[#fac775]/40 shadow-xl overflow-x-auto max-w-[95vw]">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            activeCategory === "all"
              ? "bg-[#fac775] text-[#12203a] shadow-xs"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          🌌 Toàn Vũ Trụ ({dreams.length})
        </button>

        {DREAM_CATEGORIES.map((cat) => {
          const count = dreams.filter((d) => d.tag === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                activeCategory === cat.id
                  ? "bg-[#993c1d] text-white border border-[#fac775] shadow-xs"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.shortLabel}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Hovered Dream Tooltip Bubble */}
      {hoveredNode && (
        <div
          className="absolute z-40 pointer-events-none p-3.5 rounded-2xl bg-[#12203A]/95 border border-[#fac775] text-[#faeeda] shadow-2xl backdrop-blur-xl max-w-xs animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${Math.min(window.innerWidth - 300, Math.max(20, hoveredNode.x - 140))}px`,
            top: `${Math.max(80, hoveredNode.y - 120)}px`,
          }}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#fac775] mb-1">
            <span>{hoveredNode.dream.name || "Ẩn danh K22"}</span>
            <span>{DREAM_CATEGORIES.find((c) => c.id === hoveredNode.dream.tag)?.emoji}</span>
          </div>
          <p className="text-xs text-white line-clamp-2 italic font-medium">
            &ldquo;{hoveredNode.dream.content}&rdquo;
          </p>
          <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-amber-300 font-bold flex items-center justify-between">
            <span>✨ Chạm để xem chi tiết thiệp</span>
            <span>#{hoveredNode.dream.tag.toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
