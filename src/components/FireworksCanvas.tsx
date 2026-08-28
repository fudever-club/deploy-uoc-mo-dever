"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { LiveReaction } from "@/types/dream";
import { playFireworkBurstSound, playReactionSound, playCelebrationFanfare } from "@/lib/audio-synthesizer";

interface FireworkSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
}

interface FireworkRocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  emoji?: string;
}

interface FloatingEmojiParticle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  alpha: number;
  emoji: string;
}

interface FireworksCanvasProps {
  latestReaction?: LiveReaction | null;
  soundEnabled?: boolean;
}

const FIREWORK_COLORS = [
  "#FAC775", // Amber Gold
  "#FFD166", // Warm Yellow
  "#00F5D4", // Cyber Cyan
  "#0091EA", // DEVER Blue
  "#E63946", // Lantern Red
  "#993C1D", // Deep Crimson
  "#FF70A6", // Sakura Pink
  "#8B5CF6", // Purple Neon
];

const MAX_SPARKS = 160;
const MAX_ROCKETS = 4;
const MAX_EMOJIS = 22;

export const FireworksCanvas: React.FC<FireworksCanvasProps> = ({
  latestReaction,
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rocketsRef = useRef<FireworkRocket[]>([]);
  const sparksRef = useRef<FireworkSpark[]>([]);
  const emojiParticlesRef = useRef<FloatingEmojiParticle[]>([]);
  const lastSoundTimeRef = useRef<number>(0);

  const [crowdCombo, setCrowdCombo] = useState<number>(0);
  const [showSupernovaBanner, setShowSupernovaBanner] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Throttled sound player (prevents audio buffer congestion & CPU spikes)
  const playThrottledBurstSound = useCallback(() => {
    if (!soundEnabled) return;
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 110) {
      playFireworkBurstSound();
      lastSoundTimeRef.current = now;
    }
  }, [soundEnabled]);

  // Spawn firework rocket from bottom (capped by MAX_ROCKETS)
  const launchFirework = useCallback((targetX?: number, targetY?: number, emoji?: string) => {
    if (rocketsRef.current.length >= MAX_ROCKETS) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const startX = targetX ?? Math.random() * (width * 0.8) + width * 0.1;
    const endY = targetY ?? Math.random() * (height * 0.45) + height * 0.15;
    const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

    rocketsRef.current.push({
      x: startX,
      y: height,
      targetY: endY,
      vy: -15 - Math.random() * 3,
      color,
      emoji,
    });
  }, []);

  // Trigger explosion with Dynamic Level of Detail (LOD)
  const explodeFirework = useCallback((x: number, y: number, color: string) => {
    playThrottledBurstSound();

    const currentSparks = sparksRef.current.length;
    // Dynamic LOD: Fewer sparks if canvas is already busy
    const sparkCount = currentSparks > 90 ? 12 : currentSparks > 45 ? 20 : 32;

    // Prune oldest if near limit
    if (currentSparks + sparkCount > MAX_SPARKS) {
      sparksRef.current.splice(0, currentSparks + sparkCount - MAX_SPARKS);
    }

    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 4.5 + 2.0;

      sparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        decay: Math.random() * 0.022 + 0.016, // quick fade to avoid lingering
        color,
        size: Math.random() * 2.0 + 1.2,
      });
    }
  }, [playThrottledBurstSound]);

  // Trigger Supernova Celebration (Spaced out to prevent frame drops)
  const triggerSupernova = useCallback(() => {
    playCelebrationFanfare();
    setShowSupernovaBanner(true);

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const x = Math.random() * (width * 0.8) + width * 0.1;
        const y = Math.random() * (height * 0.4) + height * 0.15;
        launchFirework(x, y);
      }, i * 220);
    }

    setTimeout(() => {
      setShowSupernovaBanner(false);
    }, 6000);
  }, [launchFirework]);

  // Respond to new reaction events with batched count
  useEffect(() => {
    if (!latestReaction) return;
    const count = latestReaction.count || 1;

    // Increment crowd combo with count
    setCrowdCombo((prev) => {
      const next = prev + count;
      if (Math.floor(next / 30) > Math.floor(prev / 30)) {
        triggerSupernova();
      }
      return next;
    });

    const width = window.innerWidth;
    const startX = (latestReaction.x / 100) * width || Math.random() * width * 0.8 + width * 0.1;

    // Spawn floating emoji particle (capped by MAX_EMOJIS)
    const currentEmojis = emojiParticlesRef.current.length;
    if (currentEmojis < MAX_EMOJIS) {
      emojiParticlesRef.current.push({
        x: startX,
        y: window.innerHeight - 40,
        vy: -Math.random() * 3.2 - 2.2,
        vx: (Math.random() - 0.5) * 1.2,
        size: Math.random() * 10 + 26,
        alpha: 1.0,
        emoji: latestReaction.emoji,
      });
    }

    // Launch rocket (if reaction count is high, launch 1 rocket instead of spamming 10)
    if (latestReaction.emoji === "🎆" || latestReaction.emoji === "🚀" || Math.random() > 0.45) {
      launchFirework(startX, undefined, latestReaction.emoji);
    } else {
      if (soundEnabled) {
        const now = Date.now();
        if (now - lastSoundTimeRef.current > 100) {
          playReactionSound(latestReaction.emoji);
          lastSoundTimeRef.current = now;
        }
      }
    }
  }, [latestReaction, launchFirework, triggerSupernova, soundEnabled]);

  // Decay combo slowly when inactive
  useEffect(() => {
    const timer = setInterval(() => {
      setCrowdCombo((prev) => (prev > 0 ? prev - 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Main High-Performance Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render & Update Rockets
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const rocket = rocketsRef.current[i];
        rocket.y += rocket.vy;

        ctx.fillStyle = rocket.color;
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (rocket.y <= rocket.targetY || rocket.vy >= 0) {
          explodeFirework(rocket.x, rocket.y, rocket.color);
          rocketsRef.current.splice(i, 1);
        }
      }

      // 2. Render & Update Sparks (Batch optimized)
      const sparks = sparksRef.current;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.07; // gravity
        s.vx *= 0.97; // drag
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Render & Update Floating Emoji Particles
      const emojis = emojiParticlesRef.current;
      for (let i = emojis.length - 1; i >= 0; i--) {
        const p = emojis[i];
        p.y += p.vy;
        p.x += p.vx;
        p.alpha -= 0.012;

        if (p.alpha <= 0 || p.y < -40) {
          emojis.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.font = `${p.size}px -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(p.emoji, p.x, p.y);
      }

      ctx.globalAlpha = 1.0;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [explodeFirework]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-25 overflow-hidden"
      />

      {/* Crowd Energy Combo Pill Top Right */}
      {crowdCombo > 0 && (
        <div className="absolute top-20 right-6 z-35 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12203A]/90 border border-[#FAC775]/50 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-sm animate-pulse">🔥</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
              Năng Lượng Đám Đông
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, (crowdCombo % 30) * 3.33)}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-white">x{crowdCombo}</span>
            </div>
          </div>
        </div>
      )}

      {/* Supernova Milestone Banner */}
      {showSupernovaBanner && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none text-center animate-in zoom-in-75 fade-in duration-500">
          <div className="px-8 py-5 rounded-3xl bg-gradient-to-r from-[#993C1D]/95 via-[#12203A]/95 to-[#712B13]/95 border-2 border-[#FAC775] shadow-[0_0_60px_rgba(250,199,117,0.7)] backdrop-blur-2xl">
            <div className="text-4xl mb-2 animate-float">🎆 🚀 🏮</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#FAC775] drop-shadow-md font-display uppercase tracking-wider">
              CROWD SUPERNOVA!
            </h2>
            <p className="text-sm font-bold text-white mt-1">
              Đám đông đã thắp sáng toàn bộ bầu trời FU-DEVER!
            </p>
          </div>
        </div>
      )}
    </>
  );
};
