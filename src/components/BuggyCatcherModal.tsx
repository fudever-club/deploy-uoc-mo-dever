"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { playReactionSound, playCelebrationFanfare, playTactileClick } from "@/lib/audio-synthesizer";
import { X, Trophy, Sparkles, Timer, Flame, RotateCcw } from "lucide-react";

interface LanternItem {
  id: number;
  x: number; // %
  y: number; // %
  speed: number;
  type: "gold" | "red" | "buggy";
  points: number;
  size: number;
}

interface BuggyCatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuggyCatcherModal: React.FC<BuggyCatcherModalProps> = ({ isOpen, onClose }) => {
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [lanterns, setLanterns] = useState<LanternItem[]>([]);
  const [highScore, setHighScore] = useState(0);

  const nextIdRef = useRef(1);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("buggy_catcher_high_score");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setLanterns([]);
    setGameState("playing");
    playReactionSound("🚀");
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState("gameover");
          playCelebrationFanfare();
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
            colors: ["#FAC775", "#993C1D", "#0091EA", "#00F5D4"],
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Update high score on game over
  useEffect(() => {
    if (gameState === "gameover" && score > highScore) {
      setHighScore(score);
      localStorage.setItem("buggy_catcher_high_score", score.toString());
    }
  }, [gameState, score, highScore]);

  // Lantern spawn and float loop
  useEffect(() => {
    if (gameState !== "playing") return;

    let lastSpawn = Date.now();

    const loop = () => {
      const now = Date.now();
      if (now - lastSpawn > 450) {
        lastSpawn = now;
        const rand = Math.random();
        const type: "gold" | "red" | "buggy" = rand > 0.85 ? "buggy" : rand > 0.4 ? "gold" : "red";
        const points = type === "buggy" ? 50 : type === "gold" ? 20 : 10;

        setLanterns((prev) => [
          ...prev,
          {
            id: nextIdRef.current++,
            x: Math.random() * 80 + 10,
            y: 105,
            speed: Math.random() * 0.7 + 0.5,
            type,
            points,
            size: type === "buggy" ? 48 : 42,
          },
        ]);
      }

      setLanterns((prev) =>
        prev
          .map((l) => ({ ...l, y: l.y - l.speed }))
          .filter((l) => l.y > -15)
      );

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState]);

  const handleCatch = (id: number, points: number, type: string) => {
    playReactionSound(type === "buggy" ? "🐞" : "✨");
    setScore((prev) => prev + points);
    setLanterns((prev) => prev.filter((l) => l.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-[#12203A] border-2 border-[#fac775]/60 rounded-3xl shadow-2xl p-5 text-[#faeeda] flex flex-col h-[520px] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* READY SCREEN */}
        {gameState === "ready" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-20 h-20 rounded-full bg-[#fac775]/20 border-2 border-[#fac775] flex items-center justify-center p-2 mb-3 shadow-xl">
              <Image
                src="/assets/buggy/1.png"
                alt="Buggy Mascot"
                width={56}
                height={56}
                className="object-contain animate-bounce"
              />
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#fac775]/20 text-[#fac775] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Minigame Phụ Bí Mật</span>
            </div>

            <h3 className="text-2xl font-black text-[#fac775] mb-2 font-display">
              Bắt Đèn Lồng Cùng Buggy 🏮
            </h3>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Dùng tay hoặc chuột chạm vào đèn lồng đang bay lên trong <strong>15 giây</strong> để tích điểm rinh quà tại gian hàng FU-DEVER!
            </p>

            <div className="flex items-center justify-center gap-4 text-xs font-bold text-amber-200 mb-6">
              <span>🏮 Đỏ (+10đ)</span>
              <span>✨ Vàng (+20đ)</span>
              <span>🐞 Buggy (+50đ)</span>
            </div>

            <button
              onClick={startGame}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#fac775] to-[#993c1d] hover:opacity-95 text-[#12203a] font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              Bắt Đầu Chơi Ngay!
            </button>
          </div>
        )}

        {/* PLAYING SCREEN */}
        {gameState === "playing" && (
          <div className="relative flex-1 flex flex-col">
            {/* Top HUD */}
            <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold z-10">
              <div className="flex items-center gap-1.5 text-amber-300">
                <Timer className="w-4 h-4 text-orange-400 animate-pulse" />
                <span>Thời gian: {timeLeft}s</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Điểm: {score}</span>
              </div>
            </div>

            {/* Playfield Area */}
            <div className="relative flex-1 w-full h-full overflow-hidden">
              {lanterns.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleCatch(item.id, item.points, item.type)}
                  className="absolute transition-transform active:scale-125 cursor-pointer animate-float"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: `${item.size}px`,
                    height: `${item.size}px`,
                  }}
                >
                  {item.type === "buggy" ? (
                    <Image
                      src="/assets/buggy/3.png"
                      alt="Buggy Bonus"
                      width={item.size}
                      height={item.size}
                      className="object-contain drop-shadow-[0_0_12px_#00F5D4]"
                    />
                  ) : item.type === "gold" ? (
                    <div className="w-full h-full rounded-full bg-gradient-to-t from-amber-500 to-yellow-200 flex items-center justify-center text-xl shadow-[0_0_15px_#FAC775] border border-white/60">
                      🏮
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-t from-red-600 to-orange-400 flex items-center justify-center text-xl shadow-[0_0_15px_#993C1D] border border-amber-300/60">
                      🏮
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GAMEOVER SCREEN */}
        {gameState === "gameover" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-in zoom-in-95 duration-200">
            <Trophy className="w-16 h-16 text-[#fac775] mb-2 animate-bounce" />

            <h3 className="text-2xl font-black text-[#fac775] mb-1 font-display">
              Chúc Mừng Chiến Binh DEVER!
            </h3>

            <p className="text-xs text-slate-300 mb-4">
              Bạn đã hoàn thành xuất sắc minigame bắt đèn lồng.
            </p>

            <div className="p-4 rounded-2xl bg-white/10 border border-[#fac775]/40 text-center w-full max-w-xs mb-4">
              <span className="block text-xs uppercase font-bold text-amber-300">Tổng điểm đạt được</span>
              <span className="text-4xl font-black text-white">{score} <span className="text-base text-amber-300">điểm</span></span>
              <div className="mt-2 text-[11px] text-slate-300">
                Kỷ lục cao nhất: <strong>{highScore} điểm</strong>
              </div>
            </div>

            {/* Secret Booth Voucher */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#993c1d] to-[#712b13] border border-[#fac775] text-xs text-amber-100 font-bold mb-5 max-w-xs">
              🎁 Mã Nhận Sticker Gian Hàng: <strong className="text-white bg-black/40 px-2 py-0.5 rounded-md">DEVER_K22_VIP</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={startGame}
                className="py-2.5 px-5 rounded-xl bg-[#fac775] hover:bg-[#ffd166] text-[#12203a] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi Lại</span>
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white transition-colors cursor-pointer"
              >
                Đóng Minigame
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
