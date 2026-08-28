"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Dream, DreamCategory } from "@/types/dream";
import { DREAM_CATEGORIES } from "@/lib/constants";
import { SkyTheme } from "@/components/LanternSkyCanvas";
import { playPoemMagicSound, playTactileClick } from "@/lib/audio-synthesizer";

interface FloatingLanternItem extends Dream {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  vx: number;
  vy: number;
  scale: number;
  swaySpeed: number;
  swayOffset: number;
  bobSpeed: number;
  bobOffset: number;
  depth: "foreground" | "midground" | "background";
}

interface FloatingLanternCardsSkyProps {
  dreams: Dream[];
  theme?: SkyTheme;
  selectedTagFilter?: string;
  onSelectDream: (dream: Dream) => void;
}

export const FloatingLanternCardsSky: React.FC<FloatingLanternCardsSkyProps> = ({
  dreams,
  theme = "midnight",
  selectedTagFilter = "all",
  onSelectDream,
}) => {
  const [lanternList, setLanternList] = useState<FloatingLanternItem[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const lanternsRef = useRef<FloatingLanternItem[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  // Initialize floating lanterns with organic positions, velocities, and 3D depth
  useEffect(() => {
    const visibleDreams = dreams.filter((d) => !d.hidden);
    if (visibleDreams.length === 0) {
      setLanternList([]);
      lanternsRef.current = [];
      return;
    }

    const items: FloatingLanternItem[] = visibleDreams.map((d, idx) => {
      // 3 Depth layers: foreground (clear & big), midground, background (smaller & distant)
      const depthType: "foreground" | "midground" | "background" =
        idx % 5 === 0 ? "foreground" : idx % 3 === 0 ? "midground" : "foreground";

      const scale = depthType === "foreground" ? 1 : depthType === "midground" ? 0.85 : 0.72;

      // Distribute evenly across viewport with random stagger
      const cols = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(visibleDreams.length * 2))));
      const row = Math.floor(idx / cols);
      const col = idx % cols;

      const baseX = 8 + (col / cols) * 84 + (Math.random() * 8 - 4);
      const baseY = 15 + ((row * 24) % 65) + (Math.random() * 10 - 5);

      return {
        ...d,
        x: Math.min(92, Math.max(8, baseX)),
        y: Math.min(82, Math.max(12, baseY)),
        vx: (Math.random() - 0.5) * 0.035 + (idx % 2 === 0 ? 0.015 : -0.015),
        vy: -Math.random() * 0.02 - 0.008, // gentle upward buoyancy
        scale,
        swaySpeed: Math.random() * 0.002 + 0.0015,
        swayOffset: Math.random() * Math.PI * 2,
        bobSpeed: Math.random() * 0.0018 + 0.001,
        bobOffset: Math.random() * Math.PI * 2,
        depth: depthType,
      };
    });

    lanternsRef.current = items;
    setLanternList([...items]);
  }, [dreams]);

  // Continuous 60fps Drift & Sway Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      const items = lanternsRef.current;

      items.forEach((item) => {
        // Natural swaying & bobbing physics
        item.swayOffset += item.swaySpeed * delta;
        item.bobOffset += item.bobSpeed * delta;

        // Position update
        item.x += item.vx * (delta / 16);
        item.y += item.vy * (delta / 16);

        // Gentle wrap-around boundaries
        if (item.y < -15) {
          item.y = 102;
          item.x = Math.random() * 84 + 8;
        }
        if (item.x < -8) item.x = 104;
        if (item.x > 104) item.x = -8;
      });

      setLanternList([...items]);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const filteredList = lanternList.filter(
    (l) => selectedTagFilter === "all" || l.tag === selectedTagFilter
  );

  return (
    <div
      onPointerMove={handlePointerMove}
      className="absolute inset-0 z-15 overflow-hidden select-none pointer-events-none"
    >
      {filteredList.map((item) => {
        const category = DREAM_CATEGORIES.find((c) => c.id === item.tag);
        const isHovered = hoveredId === item.id;
        const isTech = item.theme === "tech" || theme === "cyber";
        const isGold = item.theme === "gold" || theme === "dawn";

        // Dynamic pendulum sway calculation
        const swayDeg = Math.sin(item.swayOffset) * 4.5;
        const bobPx = Math.sin(item.bobOffset) * 6;

        return (
          <div
            key={item.id}
            onClick={() => {
              playPoemMagicSound();
              onSelectDream(item);
            }}
            onMouseEnter={() => {
              playTactileClick();
              setHoveredId(item.id);
            }}
            onMouseLeave={() => setHoveredId(null)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-all duration-300"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate3d(0, ${bobPx}px, 0) scale(${isHovered ? item.scale * 1.25 : item.scale})`,
              zIndex: isHovered ? 50 : item.depth === "foreground" ? 30 : 20,
              opacity: item.depth === "background" && !isHovered ? 0.75 : 1,
            }}
          >
            {/* LANTERN & HANGING WISH CARD ASSEMBLY */}
            <div
              className="flex flex-col items-center group"
              style={{
                transform: `rotate(${swayDeg}deg)`,
                transformOrigin: "top center",
                transition: "transform 0.1s linear",
              }}
            >
              {/* 1. TOP SUSPENSION CORD */}
              <div className="w-0.5 h-6 bg-gradient-to-b from-amber-300/20 via-amber-300/80 to-[#fac775]" />

              {/* 2. THE GLOWING MID-AUTUMN LANTERN BULB */}
              <div className="relative">
                {/* Lantern Top Wooden Cap */}
                <div className="w-10 h-2 mx-auto rounded-t-md bg-[#fac775] border-t border-x border-amber-200 shadow-xs flex items-center justify-center">
                  <div className="w-4 h-1 rounded-full bg-[#993c1d]/40" />
                </div>

                {/* Lantern Body (Red Silk / Cyber / Gold) with Candle Glow */}
                <div
                  className={`relative w-16 h-18 rounded-[2rem] flex items-center justify-center p-1 shadow-2xl transition-all ${
                    isTech
                      ? "bg-gradient-to-b from-[#0091ea] via-[#0055a5] to-[#002244] border-2 border-[#00f5d4] shadow-[0_0_30px_rgba(0,245,212,0.6)]"
                      : isGold
                      ? "bg-gradient-to-b from-[#ffb800] via-[#993c1d] to-[#712b13] border-2 border-[#fac775] shadow-[0_0_35px_rgba(250,199,117,0.7)]"
                      : "bg-gradient-to-b from-[#c8411b] via-[#993c1d] to-[#631f0a] border-2 border-[#fac775] shadow-[0_0_35px_rgba(250,199,117,0.6)]"
                  } ${isHovered ? "brightness-125 scale-105" : ""}`}
                >
                  {/* Subtle vertical lantern rib lines */}
                  <div className="absolute inset-x-2 inset-y-0.5 border-x border-white/20 rounded-full pointer-events-none" />
                  <div className="absolute inset-x-4 inset-y-0.5 border-x border-white/10 rounded-full pointer-events-none" />

                  {/* Inner Warm Flame Core */}
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-300 via-amber-200 to-white animate-pulse shadow-[0_0_20px_#FAC775] flex items-center justify-center text-xs">
                    🏮
                  </div>

                  {/* Mascot Badge Ring on Lantern */}
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#12203A] border border-[#fac775] p-0.5 shadow-md">
                    <Image
                      src={`/assets/buggy/${item.mascotIndex || 1}.png`}
                      alt="Buggy Sticker"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Lantern Bottom Wooden Base */}
                <div className="w-10 h-2 mx-auto rounded-b-md bg-[#fac775] border-b border-x border-amber-200 shadow-xs" />
              </div>

              {/* 3. TETHER STRING CONNECTING LANTERN TO WISH CARD */}
              <div className="w-0.5 h-5 bg-gradient-to-b from-[#fac775] via-amber-200 to-[#fac775] border-l border-dashed border-amber-400" />

              {/* 4. THE HANGING PARCHMENT WISH CARD TAG (Thẻ Ước Nguyện Treo Đèn) */}
              <div
                className={`relative w-44 sm:w-52 p-3 rounded-2xl transition-all ${
                  isTech
                    ? "bg-[#0a162b]/95 border-2 border-[#00f5d4]/80 shadow-[0_8px_25px_rgba(0,245,212,0.3)] text-[#00f5d4]"
                    : "bg-[#fffdf8]/95 border-2 border-[#fac775] shadow-[0_8px_30px_rgba(153,60,29,0.35)] text-[#1f2937]"
                } backdrop-blur-xl group-hover:shadow-[0_12px_40px_rgba(250,199,117,0.6)]`}
              >
                {/* Traditional Tag Hanging Ringlet Top */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-2 rounded-t-full border-t-2 border-x-2 border-[#fac775] bg-transparent" />

                {/* Tag Header: Name + Emoji */}
                <div className="flex items-center justify-between text-[11px] font-black mb-1 pb-1 border-b border-amber-200/50">
                  <span className={`truncate max-w-[120px] ${isTech ? "text-white" : "text-[#993c1d]"}`}>
                    ✨ {item.name || "Tân Sinh Viên K22"}
                  </span>
                  <span className="text-xs">{category?.emoji}</span>
                </div>

                {/* Wish Content Snippet */}
                <p
                  className={`text-[11px] sm:text-xs font-semibold italic line-clamp-2 leading-tight ${
                    isTech ? "text-white/90 font-mono" : "text-slate-800 font-serif-festive"
                  }`}
                >
                  &ldquo;{item.content}&rdquo;
                </p>

                {/* Tag Footer Note */}
                <div className="mt-1 pt-1 flex items-center justify-between text-[9px] font-bold text-amber-700/80">
                  <span>{category?.shortLabel}</span>
                  <span className="font-mono">#FUDEVER</span>
                </div>
              </div>

              {/* 5. DANGLING RED SILK TASSELS (Tua Rua Treo Đèn Truyền Thống) */}
              <div className="flex flex-col items-center mt-0.5">
                {/* Golden Knot Ornament */}
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#fac775] to-amber-600 border border-white shadow-xs" />
                {/* Silk Fringe Tassel */}
                <div className="w-1.5 h-8 bg-gradient-to-b from-[#993c1d] via-[#c8411b] to-[#712b13] rounded-b-full shadow-md" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
