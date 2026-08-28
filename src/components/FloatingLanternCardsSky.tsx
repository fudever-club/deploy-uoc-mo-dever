"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Dream, DreamCategory } from "@/types/dream";
import { DREAM_CATEGORIES } from "@/lib/constants";
import { SkyTheme } from "@/components/LanternSkyCanvas";
import { LanternSVG, LanternShape } from "@/components/LanternSVG";
import { playPoemMagicSound, playTactileClick } from "@/lib/audio-synthesizer";

export type FlightMode = "carousel" | "drift";

interface FloatingLanternItem extends Dream {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  z: number; // 3D depth -1 to +1
  vx: number;
  vy: number;
  scale: number;
  swaySpeed: number;
  swayOffset: number;
  bobSpeed: number;
  bobOffset: number;
  orbitAngle: number;
  depth: "foreground" | "midground" | "background";
}

interface FloatingLanternCardsSkyProps {
  dreams: Dream[];
  theme?: SkyTheme;
  flightMode?: FlightMode;
  selectedTagFilter?: string;
  onSelectDream: (dream: Dream) => void;
}

export const FloatingLanternCardsSky: React.FC<FloatingLanternCardsSkyProps> = ({
  dreams,
  theme = "midnight",
  flightMode = "carousel",
  selectedTagFilter = "all",
  onSelectDream,
}) => {
  const [lanternList, setLanternList] = useState<FloatingLanternItem[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const lanternsRef = useRef<FloatingLanternItem[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const orbitBaseAngleRef = useRef(0);

  // Initialize floating lanterns with organic positions, velocities, and 3D depth
  useEffect(() => {
    const visibleDreams = dreams.filter((d) => !d.hidden);
    if (visibleDreams.length === 0) {
      setLanternList([]);
      lanternsRef.current = [];
      return;
    }

    const total = visibleDreams.length;

    const items: FloatingLanternItem[] = visibleDreams.map((d, idx) => {
      const angle = (idx / total) * Math.PI * 2;

      // 3 Depth layers: foreground (clear & big), midground, background (smaller & distant)
      const depthType: "foreground" | "midground" | "background" =
        idx % 5 === 0 ? "foreground" : idx % 3 === 0 ? "midground" : "foreground";

      const scale = depthType === "foreground" ? 1 : depthType === "midground" ? 0.85 : 0.72;

      // Drift grid initial distribution
      const cols = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(total * 2))));
      const row = Math.floor(idx / cols);
      const col = idx % cols;

      const baseX = 8 + (col / cols) * 84 + (Math.random() * 8 - 4);
      const baseY = 15 + ((row * 24) % 65) + (Math.random() * 10 - 5);

      return {
        ...d,
        x: Math.min(92, Math.max(8, baseX)),
        y: Math.min(82, Math.max(12, baseY)),
        z: Math.sin(angle),
        vx: (Math.random() - 0.5) * 0.035 + (idx % 2 === 0 ? 0.015 : -0.015),
        vy: -Math.random() * 0.02 - 0.008, // gentle upward buoyancy
        scale,
        swaySpeed: Math.random() * 0.002 + 0.0015,
        swayOffset: Math.random() * Math.PI * 2,
        bobSpeed: Math.random() * 0.0018 + 0.001,
        bobOffset: Math.random() * Math.PI * 2,
        orbitAngle: angle,
        depth: depthType,
      };
    });

    lanternsRef.current = items;
    setLanternList([...items]);
  }, [dreams]);

  // Continuous 60fps Animation Loop (Handles both Carousel Orbit & Drift modes)
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      const items = lanternsRef.current;

      if (flightMode === "carousel") {
        // 3D REVOLVING ORBIT: Every card rotates gracefully from background to foreground!
        orbitBaseAngleRef.current += 0.00035 * delta;
        const baseAngle = orbitBaseAngleRef.current;
        const total = items.length;

        items.forEach((item, idx) => {
          const theta = baseAngle + (idx / Math.max(1, total)) * Math.PI * 2;
          item.orbitAngle = theta;

          // 3D Orbit projection
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);

          const radiusX = 40; // horizontal ellipse radius %
          const radiusY = 22; // vertical ellipse radius %

          item.x = 50 + cosT * radiusX;
          item.y = 44 + sinT * radiusY * 0.6; // tilted orbital plane
          item.z = sinT; // -1 (back) to +1 (front stage)

          // Front-stage cards get enhanced scale for 100% crystal-clear readability
          const depthMultiplier = 0.7 + (sinT + 1) * 0.28; // 0.7x back -> 1.26x front
          item.scale = depthMultiplier;

          item.swayOffset += item.swaySpeed * delta;
          item.bobOffset += item.bobSpeed * delta;
        });
      } else {
        // ORGANIC DRIFT MODE
        items.forEach((item) => {
          item.swayOffset += item.swaySpeed * delta;
          item.bobOffset += item.bobSpeed * delta;

          item.x += item.vx * (delta / 16);
          item.y += item.vy * (delta / 16);

          // Boundaries wrap
          if (item.y < -15) {
            item.y = 102;
            item.x = Math.random() * 84 + 8;
          }
          if (item.x < -8) item.x = 104;
          if (item.x > 104) item.x = -8;
        });
      }

      setLanternList([...items]);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [flightMode]);

  const filteredList = lanternList.filter(
    (l) => selectedTagFilter === "all" || l.tag === selectedTagFilter
  );

  return (
    <div className="absolute inset-0 z-15 overflow-hidden select-none pointer-events-none">
      {filteredList.map((item) => {
        const category = DREAM_CATEGORIES.find((c) => c.id === item.tag);
        const isHovered = hoveredId === item.id;
        const isTech = item.theme === "tech" || theme === "cyber";

        // Dynamic pendulum sway calculation
        const swayDeg = Math.sin(item.swayOffset) * 4.5;
        const bobPx = Math.sin(item.bobOffset) * 6;

        // Determine shape: explicitly selected or mapped from theme/category
        const shape: LanternShape =
          (item.lanternShape as LanternShape) ||
          (isTech ? "cyber_dever" : item.tag === "big_dream" ? "star" : item.tag === "career" ? "keoquan" : item.tag === "travel" ? "carp_dragon" : "hoian_lotus");

        // Compute 3D layer depth, opacity, and scale
        const isFrontStage = flightMode === "carousel" ? item.z > 0.1 : item.depth === "foreground";
        const currentZIndex = isHovered ? 60 : Math.floor((item.z + 1) * 20) + 10;
        const currentOpacity = isHovered ? 1 : Math.max(0.65, Math.min(1, (item.z + 1.2) / 2.2));

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
              zIndex: currentZIndex,
              opacity: currentOpacity,
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

              {/* 2. THE GLOWING HIGH-DEFINITION SVG LANTERN */}
              <div className="relative">
                <LanternSVG
                  shape={shape}
                  size={isFrontStage ? 66 : 52}
                  glow={true}
                  className={`transition-transform duration-300 ${isHovered ? "scale-115 brightness-125" : "animate-glow"}`}
                />

                {/* Buggy Mascot Sticker Badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#12203A] border border-[#fac775] p-0.5 shadow-md">
                  <Image
                    src={`/assets/buggy/${item.mascotIndex || 1}.png`}
                    alt="Buggy Sticker"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* 3. TETHER STRING CONNECTING LANTERN TO WISH CARD */}
              <div className="w-0.5 h-5 bg-gradient-to-b from-[#fac775] via-amber-200 to-[#fac775] border-l border-dashed border-amber-400" />

              {/* 4. THE HANGING PARCHMENT WISH CARD TAG (Thẻ Ước Nguyện Treo Đèn) */}
              <div
                className={`relative w-44 sm:w-56 p-3 rounded-2xl transition-all ${
                  isTech
                    ? "bg-[#0a162b]/95 border-2 border-[#00f5d4]/80 shadow-[0_8px_25px_rgba(0,245,212,0.3)] text-[#00f5d4]"
                    : "bg-[#fffdf8]/95 border-2 border-[#fac775] shadow-[0_8px_30px_rgba(153,60,29,0.35)] text-[#1f2937]"
                } backdrop-blur-xl group-hover:shadow-[0_12px_40px_rgba(250,199,117,0.6)] ${isFrontStage ? "ring-2 ring-[#fac775]/40" : ""}`}
              >
                {/* Traditional Tag Hanging Ringlet Top */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-2 rounded-t-full border-t-2 border-x-2 border-[#fac775] bg-transparent" />

                {/* Front-stage Spotlight Indicator Dot */}
                {isFrontStage && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}

                {/* Tag Header: Name + Emoji */}
                <div className="flex items-center justify-between text-[11px] font-black mb-1 pb-1 border-b border-amber-200/50">
                  <span className={`truncate max-w-[130px] ${isTech ? "text-white" : "text-[#993c1d]"}`}>
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
