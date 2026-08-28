"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Dream } from "@/types/dream";
import { DREAM_CATEGORIES, MID_AUTUMN_BUGGY_REWARDS, MidAutumnBuggyReward } from "@/lib/constants";
import { playSlotTickSound, playCelebrationFanfare, playTactileClick } from "@/lib/audio-synthesizer";
import {
  Trophy,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Gift,
  PartyPopper,
  Crown,
  Download,
  ExternalLink,
  Eye,
  X,
  Printer,
} from "lucide-react";

interface WinnerRecord {
  dream: Dream;
  reward: MidAutumnBuggyReward;
  timestamp: number;
}

export default function LuckyDrawPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDisplayDream, setCurrentDisplayDream] = useState<Dream | null>(null);
  const [currentReward, setCurrentReward] = useState<MidAutumnBuggyReward | null>(null);
  const [winner, setWinner] = useState<Dream | null>(null);
  const [winnerReward, setWinnerReward] = useState<MidAutumnBuggyReward | null>(null);
  const [winnerHistory, setWinnerHistory] = useState<WinnerRecord[]>([]);
  const [previewReward, setPreviewReward] = useState<MidAutumnBuggyReward | null>(null);

  const spinInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/dreams")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setDreams(data.data);
          if (data.data.length > 0) {
            setCurrentDisplayDream(data.data[0]);
            setCurrentReward(MID_AUTUMN_BUGGY_REWARDS[0]);
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
    setWinnerReward(null);

    let speed = 45;
    let counter = 0;
    const totalSpins = 40 + Math.floor(Math.random() * 20);

    const spin = () => {
      const randomDreamIndex = Math.floor(Math.random() * dreams.length);
      const randomRewardIndex = Math.floor(Math.random() * MID_AUTUMN_BUGGY_REWARDS.length);

      setCurrentDisplayDream(dreams[randomDreamIndex]);
      setCurrentReward(MID_AUTUMN_BUGGY_REWARDS[randomRewardIndex]);
      playSlotTickSound();
      counter++;

      if (counter < totalSpins) {
        if (counter > totalSpins - 15) {
          speed += 25; // decelerate smoothly
        }
        spinInterval.current = setTimeout(spin, speed);
      } else {
        // Winner selected!
        const selectedWinner = dreams[randomDreamIndex];
        const selectedReward = MID_AUTUMN_BUGGY_REWARDS[randomRewardIndex];

        setWinner(selectedWinner);
        setWinnerReward(selectedReward);
        setWinnerHistory((prev) => [
          { dream: selectedWinner, reward: selectedReward, timestamp: Date.now() },
          ...prev,
        ]);
        setIsSpinning(false);
        playCelebrationFanfare();

        // Confetti Celebration
        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.45 },
          colors: ["#FAC775", "#993C1D", "#0091EA", "#00F5D4", "#FFD166", "#E63946"],
        });
      }
    };

    spin();
  };

  const handleReset = () => {
    playTactileClick();
    setWinner(null);
    setWinnerReward(null);
    if (dreams.length > 0) {
      setCurrentDisplayDream(dreams[0]);
    }
  };

  const handleExportWinnersCSV = () => {
    if (winnerHistory.length === 0) return;
    const headers = "STT,Tên người trúng,Nội dung ước mơ,Chủ đề,Phần thưởng Sticker Buggy,Thời gian\n";
    const rows = winnerHistory
      .map(
        (w, idx) =>
          `${idx + 1},"${w.dream.name || "Ẩn danh"}","${w.dream.content.replace(/"/g, '""')}","${
            w.dream.tag
          }","${w.reward.name}","${new Date(w.timestamp).toLocaleTimeString("vi-VN")}"`
      )
      .join("\n");
    const csvContent = "\uFEFF" + headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Danh_Sach_Trung_Thuong_FU_DEVER_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-radial from-[#1e345e] via-[#12203A] to-[#0a1222] text-[#faeeda] p-4 sm:p-8 flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/admin"
          className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#fac775] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang Admin</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fac775]/20 border border-[#fac775]/40 text-[#fac775] text-xs font-black uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-[#fac775]" />
          <span>Vòng Quay May Mắn · Quà Tặng Sticker Buggy</span>
        </div>
      </div>

      {/* Main Lucky Draw Arena */}
      <div className="max-w-3xl w-full mx-auto my-6 bg-white/5 border-2 border-[#fac775]/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute inset-x-0 -top-20 h-40 bg-[#fac775]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 mb-6">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-[#fac775]/20 border-2 border-[#fac775] flex items-center justify-center p-2 shadow-[0_0_35px_rgba(250,199,117,0.5)]">
            <Image
              src="/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png"
              alt="Buggy Chu Cuoi"
              width={64}
              height={64}
              className="object-contain animate-bounce"
            />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#fac775] tracking-tight mb-1 font-display">
            VÒNG QUAY MAY MẮN TRUNG THU 🏮
          </h1>
          <p className="text-xs sm:text-sm text-[#faeeda]/85">
            Quay ngẫu nhiên bạn gửi ước mơ may mắn & nhận <strong>Phần thưởng Sticker Buggy Trung Thu</strong> độc quyền từ <strong>FU-DEVER</strong>!
          </p>
        </div>

        {/* Slot Machine Display Area */}
        <div
          className={`relative z-10 min-h-[260px] rounded-3xl p-6 sm:p-8 border-2 transition-all flex flex-col items-center justify-center ${
            winner
              ? "bg-gradient-to-b from-[#993c1d] via-[#712b13] to-[#12203A] border-[#fac775] shadow-[0_0_50px_rgba(250,199,117,0.8)] animate-in zoom-in-95 duration-300"
              : isSpinning
              ? "bg-black/50 border-[#0091ea] shadow-[0_0_35px_rgba(0,145,234,0.6)] animate-pulse"
              : "bg-black/35 border-white/20"
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-[#fac775] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[#fac775]">Đang tải danh sách ước mơ...</span>
            </div>
          ) : currentDisplayDream ? (
            <div className="space-y-4 max-w-xl w-full">
              {winner && (
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fac775] text-[#12203a] text-xs sm:text-sm font-black uppercase tracking-wider animate-bounce shadow-lg">
                  <Crown className="w-4 h-4" />
                  <span>XIN CHÚC MỪNG BẠN ĐÃ TRÚNG THƯỞNG!</span>
                </div>
              )}

              {/* Winner Name & Category */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                  {currentDisplayDream.name || "Ẩn danh"}
                </span>
                <span className="text-xl">
                  {DREAM_CATEGORIES.find((c) => c.id === currentDisplayDream.tag)?.emoji || "🏮"}
                </span>
              </div>

              {/* Dream Content */}
              <p className="text-xs sm:text-sm font-medium italic text-[#faeeda] line-clamp-3 leading-relaxed whitespace-pre-line bg-black/20 p-3 rounded-2xl border border-white/10">
                &ldquo;{currentDisplayDream.content}&rdquo;
              </p>

              {/* REWARD CARD SHOWCASE */}
              {(winnerReward || (isSpinning && currentReward)) && (
                <div className="mt-4 p-4 rounded-2xl bg-white/10 border border-[#fac775]/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-black/40 border border-[#fac775]/50 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                      <Image
                        src={(winnerReward || currentReward)!.image}
                        alt={(winnerReward || currentReward)!.name}
                        width={56}
                        height={56}
                        className="object-contain drop-shadow-md"
                      />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#fac775] text-[#12203a] uppercase">
                          🎁 {(winnerReward || currentReward)!.rarity}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#fac775]">
                        {(winnerReward || currentReward)!.name}
                      </h4>
                      <p className="text-[11px] text-[#faeeda]/80">
                        {(winnerReward || currentReward)!.subtitle}
                      </p>
                    </div>
                  </div>

                  {winnerReward && (
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={winnerReward.downloadUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-[#fac775] hover:bg-[#fac775]/90 text-[#12203a] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải Sticker HD</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setPreviewReward(winnerReward)}
                        className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-[#faeeda] transition-colors"
                        title="Xem phóng to"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
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
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#0091ea] to-[#fac775] hover:opacity-95 text-white font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSpinning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang quay thưởng...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Quay Thưởng May Mắn!</span>
              </>
            )}
          </button>

          {winner && (
            <button
              onClick={handleReset}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#faeeda] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Quay Lượt Tiếp Theo</span>
            </button>
          )}
        </div>
      </div>

      {/* MID-AUTUMN BUGGY STICKER COLLECTION SHOWCASE */}
      <div className="max-w-5xl w-full mx-auto my-6 bg-white/5 border border-white/15 rounded-3xl p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#fac775] uppercase tracking-wider">
              <Gift className="w-4 h-4 text-[#fac775]" />
              <span>Bộ Sưu Tập Sticker Buggy Trung Thu (DEVER Collection)</span>
            </div>
            <p className="text-[11px] text-white/70">
              Nhấp vào bất kỳ mẫu sticker nào để xem độ phân giải cao hoặc tải về in ấn tặng bạn đọc gian hàng!
            </p>
          </div>

          <a
            href="/assets/buggy/trung-thu/buggy_midautumn_stickers_sheet_3x3.png"
            target="_blank"
            download
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#fac775] flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Tải Trọn Bộ Sheet In A4 (300 DPI)</span>
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MID_AUTUMN_BUGGY_REWARDS.map((reward) => (
            <div
              key={reward.id}
              onClick={() => {
                playTactileClick();
                setPreviewReward(reward);
              }}
              className="group p-3 rounded-2xl bg-black/25 hover:bg-black/40 border border-white/10 hover:border-[#fac775]/60 transition-all cursor-pointer flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-xl bg-white/5 p-1.5 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Image
                  src={reward.image}
                  alt={reward.name}
                  width={70}
                  height={70}
                  className="object-contain drop-shadow-md"
                />
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-[#fac775] mb-1">
                {reward.rarity}
              </span>
              <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#fac775] transition-colors">
                {reward.name}
              </h5>
              <p className="text-[10px] text-white/60 line-clamp-1 mt-0.5">{reward.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Winner History Log */}
      {winnerHistory.length > 0 && (
        <div className="max-w-5xl w-full mx-auto bg-white/5 border border-white/10 rounded-3xl p-4 text-xs">
          <div className="flex items-center justify-between font-bold text-[#fac775] mb-2">
            <div className="flex items-center gap-1.5">
              <PartyPopper className="w-4 h-4" />
              <span>Danh sách bạn đã trúng thưởng ({winnerHistory.length}):</span>
            </div>
            <button
              onClick={handleExportWinnersCSV}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] text-[#fac775] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất CSV</span>
            </button>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {winnerHistory.map((w, idx) => (
              <div
                key={`${w.dream.id}-${idx}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 gap-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-white shrink-0">{w.dream.name || "Ẩn danh"}</span>
                  <span className="text-white/60 truncate">&ldquo;{w.dream.content}&rdquo;</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#fac775]/20 text-[#fac775]">
                    🎁 {w.reward.name}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {new Date(w.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PREVIEW STICKER MODAL */}
      {previewReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#12203A] border-2 border-[#fac775] rounded-3xl p-6 text-center text-[#faeeda] shadow-2xl">
            <button
              onClick={() => setPreviewReward(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-44 h-44 mx-auto mb-4 p-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Image
                src={previewReward.image}
                alt={previewReward.name}
                width={160}
                height={160}
                className="object-contain drop-shadow-xl"
              />
            </div>

            <span className="inline-block text-xs font-black px-3 py-0.5 rounded-full bg-[#fac775] text-[#12203a] uppercase mb-2">
              🎁 {previewReward.rarity}
            </span>
            <h3 className="text-lg font-black text-white mb-1 font-display">{previewReward.name}</h3>
            <p className="text-xs text-[#faeeda]/80 mb-6">{previewReward.subtitle}</p>

            <div className="flex items-center justify-center gap-3">
              <a
                href={previewReward.downloadUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#993c1d] to-[#fac775] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
              >
                <Download className="w-4 h-4" />
                <span>Tải Ảnh Sticker HD</span>
              </a>
              {previewReward.printablePdf && (
                <a
                  href={previewReward.printablePdf}
                  target="_blank"
                  download
                  className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-[#fac775] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="Tải file PDF in ấn chuẩn A4"
                >
                  <Printer className="w-4 h-4" />
                  <span>PDF In A4</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-[11px] text-white/50 py-3">
        FU-DEVER Club Day 2026 · Minigame trao quà gian hàng & DEVER Collection
      </div>
    </div>
  );
}
