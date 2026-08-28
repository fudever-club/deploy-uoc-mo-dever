"use client";

import React, { useEffect, useRef, memo, useCallback, useState } from "react";
import Image from "next/image";
import { Dream } from "@/types/dream";
import { DREAM_CATEGORIES, getBuggyMascotUrl } from "@/lib/constants";
import { LanternSVG, LanternShape } from "@/components/LanternSVG";
import { playPoemMagicSound, playTactileClick } from "@/lib/audio-synthesizer";

export type FlightMode = "carousel" | "drift";

interface LanternPhysicsItem {
  id: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  z: number; // 3D depth -1 to +1
  vx: number;
  vy: number;
  baseScale: number;
  currentScale: number;
  swaySpeed: number;
  swayOffset: number;
  bobSpeed: number;
  bobOffset: number;
  orbitAngle: number;
  depth: "foreground" | "midground" | "background";
}

interface FloatingLanternCardsSkyProps {
  dreams: Dream[];
  flightMode?: FlightMode;
  selectedTagFilter?: string;
  onSelectDream: (dream: Dream) => void;
  onIdleChange?: (isIdle: boolean) => void;
}

interface SingleLanternCardProps {
  dream: Dream;
  flightMode: FlightMode;
  isIdle: boolean;
  onSelect: (dream: Dream) => void;
  onHoverStart: (id: string) => void;
  onHoverEnd: (id: string) => void;
  setRef: (id: string, el: HTMLDivElement | null) => void;
  setSwayRef: (id: string, el: HTMLDivElement | null) => void;
}

const SingleLanternCard = memo(function SingleLanternCard({
  dream,
  isIdle,
  onSelect,
  onHoverStart,
  onHoverEnd,
  setRef,
  setSwayRef,
}: SingleLanternCardProps) {
  const category = DREAM_CATEGORIES.find((c) => c.id === dream.tag);
  const isTech = dream.theme === "tech";

  const shape: LanternShape =
    (dream.lanternShape as LanternShape) ||
    (isTech
      ? "cyber_dever"
      : dream.tag === "big_dream"
      ? "star"
      : dream.tag === "career"
      ? "keoquan"
      : dream.tag === "travel"
      ? "carp_dragon"
      : "hoian_lotus");

  const handleClick = useCallback(() => {
    playPoemMagicSound();
    onSelect(dream);
  }, [dream, onSelect]);

  const handleMouseEnter = useCallback(() => {
    if (isIdle) return;
    playTactileClick();
    onHoverStart(dream.id);
  }, [dream.id, onHoverStart, isIdle]);

  const handleMouseLeave = useCallback(() => {
    onHoverEnd(dream.id);
  }, [dream.id, onHoverEnd]);

  return (
    <div
      ref={(el) => setRef(dream.id, el)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      className={`absolute top-0 left-0 ${
        isIdle ? "pointer-events-none" : "pointer-events-auto"
      } cursor-pointer will-change-transform select-none`}
      style={{
        transform: "translate3d(-1000px, -1000px, 0)",
        transformOrigin: "center center",
      }}
    >
      {/* LANTERN & HANGING WISH CARD ASSEMBLY */}
      <div
        ref={(el) => setSwayRef(dream.id, el)}
        className="flex flex-col items-center group transition-transform duration-200"
        style={{
          transformOrigin: "top center",
          willChange: "transform",
        }}
      >
        {/* 1. TOP SUSPENSION CORD */}
        <div className="w-0.5 h-5 sm:h-6 bg-gradient-to-b from-amber-300/20 via-amber-300/80 to-[#fac775]" />

        {/* 2. THE GLOWING HIGH-DEFINITION SVG LANTERN */}
        <div className="relative group-hover:scale-110 transition-transform duration-200">
          <LanternSVG
            shape={shape}
            size={56}
            glow={true}
            className="transition-transform duration-200"
          />

          {/* Buggy Mascot Sticker Badge */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#12203A] border border-[#fac775] p-0.5 shadow-md">
            <Image
              src={getBuggyMascotUrl(dream.mascotIndex)}
              alt="Buggy Sticker"
              width={20}
              height={20}
              className="object-contain"
              priority={false}
            />
          </div>
        </div>

        {/* 3. TETHER STRING CONNECTING LANTERN TO WISH CARD */}
        <div className="w-0.5 h-4 sm:h-5 bg-gradient-to-b from-[#fac775] via-amber-200 to-[#fac775] border-l border-dashed border-amber-400" />

        {/* 4. THE HANGING PARCHMENT WISH CARD TAG (Thẻ Ước Nguyện Treo Đèn) */}
        <div
          className={`relative w-44 sm:w-56 p-2.5 sm:p-3 rounded-2xl transition-all ${
            isTech
              ? "bg-[#0a162b]/95 border-2 border-[#00f5d4]/80 shadow-[0_6px_20px_rgba(0,245,212,0.25)] text-[#00f5d4]"
              : "bg-[#fffdf8]/95 border-2 border-[#fac775] shadow-[0_6px_25px_rgba(153,60,29,0.3)] text-[#1f2937]"
          } backdrop-blur-md group-hover:shadow-[0_10px_35px_rgba(250,199,117,0.5)] group-hover:scale-105`}
        >
          {/* Traditional Tag Hanging Ringlet Top */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-2 rounded-t-full border-2 border-b-0 border-[#fac775] bg-transparent" />

          {/* Tag Header: Name + Emoji */}
          <div className="flex items-center justify-between text-[11px] font-black mb-1 pb-1 border-b border-amber-200/50">
            <span className={`truncate max-w-[130px] ${isTech ? "text-white" : "text-[#993c1d]"}`}>
              ✨ {dream.name || "Tân Sinh Viên K22"}
            </span>
            <span className="text-xs">{category?.emoji}</span>
          </div>

          {/* Wish Content Snippet */}
          <p
            className={`text-[11px] sm:text-xs font-semibold italic line-clamp-2 leading-tight ${
              isTech ? "text-white/90 font-mono" : "text-slate-800 font-serif-festive"
            }`}
          >
            &ldquo;{dream.content}&rdquo;
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
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-[#fac775] to-amber-600 border border-white shadow-xs" />
          {/* Silk Fringe Tassel */}
          <div className="w-1.5 h-6 sm:h-8 bg-gradient-to-b from-[#993c1d] via-[#c8411b] to-[#712b13] rounded-b-full shadow-md" />
        </div>
      </div>
    </div>
  );
});

export const FloatingLanternCardsSky: React.FC<FloatingLanternCardsSkyProps> = ({
  dreams,
  flightMode = "carousel",
  selectedTagFilter = "all",
  onSelectDream,
  onIdleChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const swayElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const physicsMapRef = useRef<Map<string, LanternPhysicsItem>>(new Map());

  const [isIdle, setIsIdle] = useState(false);
  const isMouseActiveRef = useRef(true);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isHoveredRef = useRef(false);
  const hoveredDreamIdRef = useRef<string | null>(null);
  const currentSpeedFactorRef = useRef(1.0);

  const animFrameRef = useRef<number | null>(null);
  const orbitBaseAngleRef = useRef(0);
  const flightModeRef = useRef<FlightMode>(flightMode);
  flightModeRef.current = flightMode;

  // 8.5s Idle Detection (Booth Screen-Saver Protection)
  useEffect(() => {
    const handleActivity = () => {
      isMouseActiveRef.current = true;
      setIsIdle(false);
      onIdleChange?.(false);

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = setTimeout(() => {
        // Idle for 8.5 seconds: lock hover interactions so passing lanterns don't trigger
        isMouseActiveRef.current = false;
        setIsIdle(true);
        onIdleChange?.(true);
        isHoveredRef.current = false;
        hoveredDreamIdRef.current = null;
      }, 8500);
    };

    // Initial 8.5s idle timer
    idleTimerRef.current = setTimeout(() => {
      isMouseActiveRef.current = false;
      setIsIdle(true);
      onIdleChange?.(true);
      isHoveredRef.current = false;
      hoveredDreamIdRef.current = null;
    }, 8500);

    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("mousedown", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [onIdleChange]);

  const handleHoverStart = useCallback((id: string) => {
    if (!isMouseActiveRef.current) return;
    isHoveredRef.current = true;
    hoveredDreamIdRef.current = id;
  }, []);

  const handleHoverEnd = useCallback((id: string) => {
    if (hoveredDreamIdRef.current === id) {
      isHoveredRef.current = false;
      hoveredDreamIdRef.current = null;
    }
  }, []);

  const setCardRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      cardElementsRef.current.set(id, el);
    } else {
      cardElementsRef.current.delete(id);
    }
  }, []);

  const setSwayRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      swayElementsRef.current.set(id, el);
    } else {
      swayElementsRef.current.delete(id);
    }
  }, []);

  const visibleDreams = dreams.filter(
    (d) => !d.hidden && (selectedTagFilter === "all" || d.tag === selectedTagFilter)
  );

  // Initialize or update physics positions
  useEffect(() => {
    const total = visibleDreams.length;
    const currentPhysics = physicsMapRef.current;
    const newPhysics = new Map<string, LanternPhysicsItem>();

    visibleDreams.forEach((d, idx) => {
      const angle = (idx / Math.max(1, total)) * Math.PI * 2;
      const depthType: "foreground" | "midground" | "background" =
        idx % 4 === 0 ? "foreground" : idx % 2 === 0 ? "midground" : "background";

      const scale = depthType === "foreground" ? 1 : depthType === "midground" ? 0.88 : 0.76;

      const cols = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(total * 2))));
      const row = Math.floor(idx / cols);
      const col = idx % cols;

      const baseX = 8 + (col / cols) * 82 + ((idx * 13) % 7 - 3.5);
      const baseY = 15 + ((row * 24) % 65) + ((idx * 11) % 8 - 4);

      const existing = currentPhysics.get(d.id);
      if (existing) {
        existing.orbitAngle = angle;
        newPhysics.set(d.id, existing);
      } else {
        newPhysics.set(d.id, {
          id: d.id,
          x: Math.min(92, Math.max(8, baseX)),
          y: Math.min(82, Math.max(12, baseY)),
          z: Math.sin(angle),
          vx: (Math.random() - 0.5) * 0.03 + (idx % 2 === 0 ? 0.015 : -0.015),
          vy: -Math.random() * 0.018 - 0.008,
          baseScale: scale,
          currentScale: scale,
          swaySpeed: Math.random() * 0.0018 + 0.0012,
          swayOffset: Math.random() * Math.PI * 2,
          bobSpeed: Math.random() * 0.0015 + 0.001,
          bobOffset: Math.random() * Math.PI * 2,
          orbitAngle: angle,
          depth: depthType,
        });
      }
    });

    physicsMapRef.current = newPhysics;
  }, [visibleDreams]);

  // High-Performance 60-120fps Animation Loop with Direct DOM Transform
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      const container = containerRef.current;
      const width = container?.clientWidth || window.innerWidth;
      const height = container?.clientHeight || window.innerHeight;

      const mode = flightModeRef.current;
      const physicsMap = physicsMapRef.current;
      const cardElements = cardElementsRef.current;
      const swayElements = swayElementsRef.current;

      const isHovered = isHoveredRef.current;
      const hoveredId = hoveredDreamIdRef.current;

      // Smooth inertia lerping speed: 0.22x slow-mo on hover, 1.0x normally
      const targetSpeed = isHovered ? 0.22 : 1.0;
      currentSpeedFactorRef.current +=
        (targetSpeed - currentSpeedFactorRef.current) * Math.min(1, 0.12 * (delta / 16));
      const speedFactor = currentSpeedFactorRef.current;

      if (mode === "carousel") {
        // Base rotation speed 0.8x original (0.00028 * speedFactor * delta)
        orbitBaseAngleRef.current += 0.00028 * speedFactor * delta;
        const baseAngle = orbitBaseAngleRef.current;
        const total = physicsMap.size;
        let idx = 0;

        physicsMap.forEach((item) => {
          const theta = baseAngle + (idx / Math.max(1, total)) * Math.PI * 2;
          idx++;

          item.orbitAngle = theta;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);

          const radiusX = width * 0.38;
          const radiusY = height * 0.22;

          const centerX = width * 0.5;
          const centerY = height * 0.44;

          const posX = centerX + cosT * radiusX;
          const posY = centerY + sinT * radiusY * 0.6;
          item.z = sinT;

          const depthMultiplier = 0.72 + (sinT + 1) * 0.26;
          item.currentScale = depthMultiplier;

          item.swayOffset += item.swaySpeed * speedFactor * delta * 0.8;
          item.bobOffset += item.bobSpeed * speedFactor * delta * 0.8;

          const bobPx = Math.sin(item.bobOffset) * 5;
          const swayDeg = Math.sin(item.swayOffset) * 4;

          const el = cardElements.get(item.id);
          if (el) {
            const isThisHovered = item.id === hoveredId;
            const zIndex = isThisHovered ? 999 : Math.floor((sinT + 1) * 25) + 10;

            // Spotlight focus: hovered card stands out 100%, background cards softly dim
            let opacity = Math.max(0.65, Math.min(1, (sinT + 1.25) / 2.25));
            if (isThisHovered) {
              opacity = 1;
            } else if (isHovered) {
              opacity = opacity * 0.45;
            }

            const scale = isThisHovered ? depthMultiplier * 1.15 : depthMultiplier;
            const filter = isThisHovered
              ? "drop-shadow(0 0 24px rgba(250, 199, 117, 0.85)) drop-shadow(0 15px 35px rgba(0, 0, 0, 0.6))"
              : isHovered
              ? "blur(0.5px)"
              : "none";

            el.style.transform = `translate3d(${posX}px, ${posY + bobPx}px, 0) translate(-50%, -50%) scale(${scale})`;
            el.style.zIndex = `${zIndex}`;
            el.style.opacity = `${opacity}`;
            el.style.filter = filter;
          }

          const swayEl = swayElements.get(item.id);
          if (swayEl) {
            swayEl.style.transform = `rotate(${swayDeg}deg)`;
          }
        });
      } else {
        // DRIFT MODE
        physicsMap.forEach((item) => {
          item.swayOffset += item.swaySpeed * speedFactor * delta * 0.8;
          item.bobOffset += item.bobSpeed * speedFactor * delta * 0.8;

          item.x += item.vx * (delta / 16) * 0.8 * speedFactor;
          item.y += item.vy * (delta / 16) * 0.8 * speedFactor;

          if (item.y < -12) {
            item.y = 104;
            item.x = Math.random() * 80 + 10;
          }
          if (item.x < -8) item.x = 104;
          if (item.x > 104) item.x = -8;

          const posX = (item.x / 100) * width;
          const posY = (item.y / 100) * height;
          const bobPx = Math.sin(item.bobOffset) * 6;
          const swayDeg = Math.sin(item.swayOffset) * 4.5;

          const el = cardElements.get(item.id);
          if (el) {
            const isThisHovered = item.id === hoveredId;
            const zIndex = isThisHovered ? 999 : item.depth === "foreground" ? 35 : item.depth === "midground" ? 25 : 15;

            let opacity = item.depth === "foreground" ? 1 : item.depth === "midground" ? 0.88 : 0.72;
            if (isThisHovered) {
              opacity = 1;
            } else if (isHovered) {
              opacity = opacity * 0.45;
            }

            const scale = isThisHovered ? item.baseScale * 1.15 : item.baseScale;
            const filter = isThisHovered
              ? "drop-shadow(0 0 24px rgba(250, 199, 117, 0.85)) drop-shadow(0 15px 35px rgba(0, 0, 0, 0.6))"
              : isHovered
              ? "blur(0.5px)"
              : "none";

            el.style.transform = `translate3d(${posX}px, ${posY + bobPx}px, 0) translate(-50%, -50%) scale(${scale})`;
            el.style.zIndex = `${zIndex}`;
            el.style.opacity = `${opacity}`;
            el.style.filter = filter;
          }

          const swayEl = swayElements.get(item.id);
          if (swayEl) {
            swayEl.style.transform = `rotate(${swayDeg}deg)`;
          }
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-15 overflow-hidden select-none pointer-events-none"
      style={{ perspective: "1200px" }}
    >
      {visibleDreams.map((dream) => (
        <SingleLanternCard
          key={dream.id}
          dream={dream}
          flightMode={flightMode}
          isIdle={isIdle}
          onSelect={onSelectDream}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
          setRef={setCardRef}
          setSwayRef={setSwayRef}
        />
      ))}
    </div>
  );
};
