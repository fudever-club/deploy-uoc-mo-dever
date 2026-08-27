"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Dream } from "@/types/dream";
import { DREAM_CATEGORIES } from "@/lib/constants";
import {
  Trophy,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Gift,
  PartyPopper,
  Crown,
} from "lucide-react";

export default function LuckyDrawPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDisplayDream, setCurrentDisplayDream] = useState<Dream | null>(null);
  const [winner, setWinner] = useState<Dream | null>(null);
  const [winnerHistory, setWinnerHistory] = useState<Dream[]>([]);

  const spinInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/dreams")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setDreams(data.data);
          if (data.data.length > 0) {
            setCurrentDisplayDream(data.data[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Load dreams for lucky draw error:", err);
        setLoading(false);
      });
  }, []);

  const handleStartSpin = () => {
    if (dreams.length === 0 || isSpinning) return;
    setIsSpinning(true);
    setWinner(null);

    let speed = 50;
    let counter = 0;
    const totalSpins = 40 + Math.floor(Math.random() * 20);

    const spin = () => {
      const randomIndex = Math.floor(Math.random() * dreams.length);
      setCurrentDisplayDream(dreams[randomIndex]);
      counter++;

      if (counter < totalSpins) {
        if (counter > totalSpins - 15) {
          speed += 25; // decelerate smoothly
        }
        spinInterval.current = setTimeout(spin, speed);
      } else {
        // Winner selected!
        const selectedWinner = dreams[randomIndex];
        setWinner(selectedWinner);
        setWinnerHistory((prev) => [selectedWinner, ...prev]);
        setIsSpinning(false);

        // Confetti Celebration
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#FAC775", "#993C1D", "#0091EA", "#00F5D4", "#FFD166"],
        });
      }
    };

    spin();
  };

  const handleReset = () => {
    setWinner(null);
    if (dreams.length > 0) {
      setCurrentDisplayDream(dreams[0]);
    }
  };

  return (
    <div className="min-h-screen bg-radial from-[#1e345e] via-[#12203A] to-[#0a1222] text-[#faeeda] p-4 sm:p-8 flex flex-col justify-between">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/admin"
          className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#fac775] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang Admin</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fac775]/20 border border-[#fac775]/40 text-[#fac775] text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-[#fac775]" />
          <span>Minigame Vòng Quay Ước Mơ</span>
        </div>
      </div>

      {/* Main Lucky Draw Arena */}
      <div className="max-w-2xl w-full mx-auto my-6 bg-white/5 border-2 border-[#fac775]/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md text-center relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute inset-x-0 -top-20 h-40 bg-[#fac775]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#fac775]/20 border-2 border-[#fac775] flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(250,199,117,0.5)]">
            🎁
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#fac775] tracking-tight mb-1">
            VÒNG QUAY MAY MẮN
          </h1>
          <p className="text-xs text-[#faeeda]/80">
            Quay ngẫu nhiên người gửi ước mơ may mắn nhận phần quà đặc biệt từ <strong>FU-DEVER</strong>
          </p>
        </div>

        {/* Slot Machine Card Box */}
        <div
          className={`relative z-10 min-h-[220px] rounded-3xl p-6 border-2 transition-all flex flex-col items-center justify-center ${
            winner
              ? "bg-gradient-to-b from-[#993c1d] to-[#712b13] border-[#fac775] shadow-[0_0_40px_rgba(250,199,117,0.7)] animate-in zoom-in-95 duration-300"
              : isSpinning
              ? "bg-black/50 border-[#0091ea] shadow-[0_0_30px_rgba(0,145,234,0.5)] animate-pulse"
              : "bg-black/30 border-white/20"
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-[#fac775] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[#fac775]">Đang tải danh sách ước mơ...</span>
            </div>
          ) : currentDisplayDream ? (
            <div className="space-y-3 max-w-lg">
              {winner && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fac775] text-[#12203a] text-xs font-black uppercase tracking-wider animate-bounce">
                  <Crown className="w-3.5 h-3.5" />
                  <span>XIN CHÚC MỪNG BẠN MAY MẮN!</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                  {currentDisplayDream.name || "Ẩn danh"}
                </span>
                <span className="text-xl">
                  {DREAM_CATEGORIES.find((c) => c.id === currentDisplayDream.tag)?.emoji || "🏮"}
                </span>
              </div>

              <p className="text-sm font-medium italic text-[#faeeda] line-clamp-3 leading-relaxed">
                &ldquo;{currentDisplayDream.content}&rdquo;
              </p>

              <div className="text-[11px] text-[#fac775] font-semibold">
                {DREAM_CATEGORIES.find((c) => c.id === currentDisplayDream.tag)?.label}
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/60">Chưa có ước mơ nào trong hệ thống.</p>
          )}
        </div>

        {/* Action Controls */}
        <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleStartSpin}
            disabled={isSpinning || dreams.length === 0}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#0091ea] to-[#fac775] hover:opacity-95 text-white font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSpinning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang quay số...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Quay Số Ngay!</span>
              </>
            )}
          </button>

          {winner && (
            <button
              onClick={handleReset}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#faeeda] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Quay Lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Winner History Log */}
      {winnerHistory.length > 0 && (
        <div className="max-w-2xl w-full mx-auto bg-white/5 border border-white/10 rounded-3xl p-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#fac775] mb-2">
            <PartyPopper className="w-4 h-4" />
            <span>Danh sách bạn đã trúng thưởng ({winnerHistory.length}):</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {winnerHistory.map((w, idx) => (
              <div
                key={`${w.id}-${idx}`}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-white">{w.name || "Ẩn danh"}</span>
                  <span className="text-white/60 truncate max-w-xs">&ldquo;{w.content}&rdquo;</span>
                </div>
                <span className="text-[10px] text-[#fac775] font-semibold shrink-0">
                  {DREAM_CATEGORIES.find((c) => c.id === w.tag)?.shortLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-[11px] text-white/50 py-2">
        FU-DEVER Club Day 2026 · Minigame trao quà gian hàng
      </div>
    </div>
  );
}
