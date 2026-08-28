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

export const FireworksCanvas: React.FC<FireworksCanvasProps> = ({
  latestReaction,
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rocketsRef = useRef<FireworkRocket[]>([]);
  const sparksRef = useRef<FireworkSpark[]>([]);
  const emojiParticlesRef = useRef<FloatingEmojiParticle[]>([]);

  const [crowdCombo, setCrowdCombo] = useState<number>(0);
  const [showSupernovaBanner, setShowSupernovaBanner] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Spawn firework rocket from bottom
  const launchFirework = useCallback((targetX?: number, targetY?: number, emoji?: string) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const startX = targetX ?? Math.random() * (width * 0.8) + width * 0.1;
    const endY = targetY ?? Math.random() * (height * 0.45) + height * 0.15;
    const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

    rocketsRef.current.push({
      x: startX,
      y: height,
      targetY: endY,
      vy: -14 - Math.random() * 4,
      color,
      emoji,
    });
  }, []);

  // Trigger explosion at target
  const explodeFirework = useCallback((x: number, y: number, color: string) => {
    if (soundEnabled) {
      playFireworkBurstSound();
    }

    const sparkCount = 45 + Math.floor(Math.random() * 25);
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const speed = Math.random() * 5.5 + 2.5;

      sparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        decay: Math.random() * 0.018 + 0.012,
        color,
        size: Math.random() * 2.5 + 1.5,
      });
    }
  }, [soundEnabled]);

  // Trigger Supernova Celebration (10+ simultaneous fireworks)
  const triggerSupernova = useCallback(() => {
    playCelebrationFanfare();
    setShowSupernovaBanner(true);

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const x = Math.random() * (width * 0.85) + width * 0.075;
        const y = Math.random() * (height * 0.45) + height * 0.15;
        launchFirework(x, y);
      }, i * 160);
    }

    setTimeout(() => {
      setShowSupernovaBanner(false);
    }, 6500);
  }, [launchFirework]);

  // Respond to new reaction events
  useEffect(() => {
    if (!latestReaction) return;

    // Increment crowd combo
    setCrowdCombo((prev) => {
      const next = prev + 1;
      if (next % 30 === 0) {
        triggerSupernova();
      }
      return next;
    });

    const width = window.innerWidth;
    const startX = (latestReaction.x / 100) * width || Math.random() * width * 0.8 + width * 0.1;

    // Spawn floating emoji particle
    emojiParticlesRef.current.push({
      x: startX,
      y: window.innerHeight - 40,
      vy: -Math.random() * 3.5 - 2.5,
      vx: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 14 + 28,
      alpha: 1.0,
      emoji: latestReaction.emoji,
    });

    // Launch matching firework rocket
    if (latestReaction.emoji === "🎆" || latestReaction.emoji === "🚀" || Math.random() > 0.4) {
      launchFirework(startX, undefined, latestReaction.emoji);
    } else {
      if (soundEnabled) {
        playReactionSound(latestReaction.emoji);
      }
    }
  }, [latestReaction, launchFirework, triggerSupernova, soundEnabled]);

  // Decay combo slowly when inactive
  useEffect(() => {
    const timer = setInterval(() => {
      setCrowdCombo((prev) => (prev > 0 ? prev - 1 : 0));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render & Update Rockets
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const rocket = rocketsRef.current[i];
        rocket.y += rocket.vy;

        // Spark trail
        ctx.fillStyle = rocket.color;
        ctx.shadowColor = rocket.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
        ctx.fill();

        if (rocket.y <= rocket.targetY || rocket.vy >= 0) {
          explodeFirework(rocket.x, rocket.y, rocket.color);
          rocketsRef.current.splice(i, 1);
        }
      }

      ctx.shadowBlur = 0;

      // 2. Render & Update Sparks
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08; // gravity
        s.vx *= 0.98; // air drag
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Render & Update Floating Emoji Particles
      for (let i = emojiParticlesRef.current.length - 1; i >= 0; i--) {
        const p = emojiParticlesRef.current[i];
        p.y += p.vy;
        p.x += p.vx;
        p.alpha -= 0.009;

        if (p.alpha <= 0 || p.y < -50) {
          emojiParticlesRef.current.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.font = `${p.size}px sans-serif`;
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
          <span className="text-sm animate-bounce">🔥</span>
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
            <div className="text-4xl mb-2 animate-bounce">🎆 🚀 🏮</div>
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
