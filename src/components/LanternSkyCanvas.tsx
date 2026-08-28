"use client";

import React, { useEffect, useRef } from "react";

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

// Signature FU-DEVER Night Sky Palette (Ultra-lightweight, 0 runtime theme switching overhead)
const SKY_PALETTE = ["#FAC775", "#FAEEDA", "#85B7EB", "#00F5D4", "#FFD166"];

export const LanternSkyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
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

    // Stardust & Warm Firefly Particles (Lightweight & high performance)
    const particleCount = Math.min(45, Math.floor((width * height) / 32000));
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        radius: Math.random() * 2.0 + 0.8,
        alpha: Math.random() * 0.7 + 0.3,
        alphaSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: SKY_PALETTE[Math.floor(Math.random() * SKY_PALETTE.length)],
      });
    }

    // Shooting Stars
    const shootingStars: ShootingStar[] = [];
    const spawnShootingStar = () => {
      if (Math.random() < 0.015 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * width * 0.85,
          y: Math.random() * (height * 0.4),
          length: Math.random() * 80 + 35,
          speed: Math.random() * 7 + 8,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          opacity: 0.9,
          active: true,
        });
      }
    };

    // Interactive Click Ripple Trigger
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      ripplesRef.current.push({
        x: clientX,
        y: clientY,
        radius: 4,
        maxRadius: 80,
        opacity: 0.75,
        color: "#FAC775",
      });

      // Spawn small burst of stardust
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.8 + 0.8;
        particlesRef.current.push({
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.0 + 1,
          alpha: 0.9,
          alphaSpeed: -0.02,
          color: SKY_PALETTE[Math.floor(Math.random() * SKY_PALETTE.length)],
        });
      }
    };

    window.addEventListener("click", handleClick);

    // Main Ultra-Fast Render Loop (Zero ShadowBlur overhead)
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = Math.max(0, r.opacity);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        r.radius += 2.2;
        r.opacity -= 0.025;

        if (r.radius >= r.maxRadius || r.opacity <= 0) {
          ripplesRef.current.splice(i, 1);
        }
      }

      // Render Particles with crisp glowing halo
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaSpeed;

        if (p.alpha > 0.9 || p.alpha < 0.2) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = Math.max(0, Math.min(1, p.alpha));

        // Soft outer glow halo (fast 2-circle technique)
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Expire burst particles
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
        gradient.addColorStop(0, `rgba(250, 199, 117, ${star.opacity})`);
        gradient.addColorStop(1, "rgba(250, 199, 117, 0)");

        ctx.strokeStyle = gradient;
        ctx.globalAlpha = 1;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.022;

        if (star.opacity <= 0 || star.y > height || star.x > width) {
          shootingStars.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-5"
    />
  );
};
