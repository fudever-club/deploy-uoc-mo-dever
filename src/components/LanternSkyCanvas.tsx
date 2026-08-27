"use client";

import React, { useEffect, useRef } from "react";

export type SkyTheme = "midnight" | "cyber" | "dawn";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  alphaSpeed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

interface LanternSkyCanvasProps {
  theme?: SkyTheme;
}

export const LanternSkyCanvas: React.FC<LanternSkyCanvasProps> = ({ theme = "midnight" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Color Palettes by Theme
    const getPalette = () => {
      switch (theme) {
        case "cyber":
          return ["#00F5D4", "#0091EA", "#85B7EB", "#FFFFFF", "#7000FF"];
        case "dawn":
          return ["#FAC775", "#FFB800", "#FF6B6B", "#FAEEDA", "#E0AA4E"];
        case "midnight":
        default:
          return ["#FAC775", "#FAEEDA", "#85B7EB", "#00F5D4", "#FFD166"];
      }
    };

    // 1. Fireflies / Stardust Particles
    const colors = getPalette();
    const particleCount = Math.min(75, Math.floor((width * height) / 20000));
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -Math.random() * 0.55 - 0.15,
        radius: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.8 + 0.2,
        alphaSpeed: (Math.random() * 0.02 + 0.006) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // 2. Shooting Stars
    const shootingStars: ShootingStar[] = [];
    const spawnShootingStar = () => {
      if (Math.random() < 0.02 && shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * width * 0.85,
          y: Math.random() * (height * 0.4),
          length: Math.random() * 90 + 40,
          speed: Math.random() * 8 + 10,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
          opacity: 1,
          active: true,
        });
      }
    };

    // 3. Interactive Click Ripple Trigger
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      ripplesRef.current.push({
        x: clientX,
        y: clientY,
        radius: 5,
        maxRadius: 100,
        opacity: 0.8,
        color: theme === "cyber" ? "#00F5D4" : "#FAC775",
      });

      // Spawn small burst of extra particles
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        particlesRef.current.push({
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.5 + 1,
          alpha: 1,
          alphaSpeed: -0.025,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    window.addEventListener("click", handleClick);

    // 4. Main Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        ctx.save();
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = Math.max(0, r.opacity);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        r.radius += 2.5;
        r.opacity -= 0.02;

        if (r.radius >= r.maxRadius || r.opacity <= 0) {
          ripplesRef.current.splice(i, 1);
        }
      }

      // Render Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaSpeed;

        if (p.alpha > 0.95 || p.alpha < 0.15) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Expire transient burst particles
        if (p.alphaSpeed < 0 && p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Spawn & Render Shooting Stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        if (!star.active) continue;

        const endX = star.x - Math.cos(star.angle) * star.length;
        const endY = star.y - Math.sin(star.angle) * star.length;

        const gradient = ctx.createLinearGradient(star.x, star.y, endX, endY);
        const starColor = theme === "cyber" ? "0, 245, 212" : "250, 199, 117";
        gradient.addColorStop(0, `rgba(${starColor}, ${star.opacity})`);
        gradient.addColorStop(1, `rgba(${starColor}, 0)`);

        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.02;

        if (star.opacity <= 0 || star.y > height || star.x > width) {
          shootingStars.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-5"
    />
  );
};
