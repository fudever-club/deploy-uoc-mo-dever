"use client";

import React, { useState, useRef } from "react";
import { Dream, CardTheme } from "@/types/dream";
import { BUGGY_MOODS, DREAM_CATEGORIES } from "@/lib/constants";
import { downloadDreamCard, renderDreamCardToDataUrl } from "@/lib/dream-card-canvas";
import { LanternSVG, LanternShape } from "@/components/LanternSVG";
import { playPoemMagicSound, playTactileClick } from "@/lib/audio-synthesizer";
import { Download, Share2, X, Sparkles, Check, Palette, Sparkle } from "lucide-react";
import Image from "next/image";

interface DreamCardModalProps {
  dream: Dream;
  isOpen: boolean;
  onClose: () => void;
}

export const DreamCardModal: React.FC<DreamCardModalProps> = ({ dream, isOpen, onClose }) => {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(dream.theme || "classic");
  const [selectedMascot, setSelectedMascot] = useState<number>(dream.mascotIndex || 1);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !dream) return null;

  const categoryInfo = DREAM_CATEGORIES.find((c) => c.id === dream.tag);
  const shape = (dream.lanternShape as LanternShape) || "hoian_lotus";

  const handleDownload = async () => {
    playTactileClick();
    setIsExporting(true);
    try {
      const customizedDream: Dream = {
        ...dream,
        theme: selectedTheme,
        mascotIndex: selectedMascot,
      };
      const dataUrl = await renderDreamCardToDataUrl(customizedDream, { width: 1080, height: 1920 });
      const fileName = `Dream_Card_${dream.name ? dream.name.replace(/\s+/g, "_") : "FU_DEVER"}_${selectedTheme}_2026.png`;
      downloadDreamCard(dataUrl, fileName);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    playTactileClick();
    try {
      const customizedDream: Dream = {
        ...dream,
        theme: selectedTheme,
        mascotIndex: selectedMascot,
      };
      const dataUrl = await renderDreamCardToDataUrl(customizedDream, { width: 1080, height: 1920 });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "Dream_Card_FU_DEVER_2026.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Ước mơ của tôi tại FU-DEVER Club Day 2026",
          text: "Tôi vừa thả đèn lồng ước mơ cùng CLB Lập trình FU-DEVER! #FUDEVER #DeployUocMo",
          files: [file],
        });
        return;
      }
    } catch {
      // Fallback
    }

    navigator.clipboard.writeText("#FUDEVER #ClubDay2026 #DeployUocMo #FPTU");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12203A] border-2 border-[#fac775]/50 rounded-3xl shadow-2xl p-4 sm:p-6 text-[#faeeda] max-h-[96vh] flex flex-col overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fac775]/20 text-[#fac775] text-[11px] font-bold uppercase tracking-wider mb-1 border border-[#fac775]/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Story Card Studio (9:16)</span>
          </div>
          <h3 className="text-xl font-black text-white font-display">Thiệp Ước Mơ Cá Nhân Hoá</h3>
          <p className="text-xs text-[#faeeda]/80">Tùy biến phong cách và lưu ảnh chất lượng cao</p>
        </div>

        {/* Theme & Mascot Selectors */}
        <div className="bg-white/5 rounded-2xl p-3 mb-3 border border-white/10 space-y-2.5">
          {/* Theme Selector */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#fac775] uppercase tracking-wider mb-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Chọn phong cách thiệp:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setSelectedTheme("classic");
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTheme === "classic"
                    ? "bg-[#993c1d] text-white border border-[#fac775] shadow-xs"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <span>🏮</span>
                <span>Cổ Điển</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setSelectedTheme("tech");
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTheme === "tech"
                    ? "bg-[#0091ea] text-white border border-[#00f5d4] shadow-xs"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <span>🚀</span>
                <span>DEVER Tech</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setSelectedTheme("gold");
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTheme === "gold"
                    ? "bg-[#712b13] text-[#fac775] border border-[#fac775] shadow-xs"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <span>👑</span>
                <span>Hoàng Kim</span>
              </button>
            </div>
          </div>

          {/* Mascot Selector */}
          <div>
            <span className="block text-[11px] font-bold text-[#fac775] uppercase tracking-wider mb-1">
              Sticker Buggy gắn kèm:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {BUGGY_MOODS.map((mood) => (
                <button
                  key={mood.index}
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setSelectedMascot(mood.index);
                  }}
                  className={`p-1 rounded-xl shrink-0 transition-all cursor-pointer border ${
                    selectedMascot === mood.index
                      ? "bg-[#fac775]/25 border-[#fac775] scale-110 shadow-xs"
                      : "bg-white/5 border-transparent hover:bg-white/10 opacity-70 hover:opacity-100"
                  }`}
                  title={mood.label}
                >
                  <Image
                    src={`/assets/buggy/${mood.index}.png`}
                    alt={mood.label}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CRISP REAL-TIME LIVE 9:16 DREAM CARD PREVIEW (NO BLACK SCREEN) */}
        <div className="relative flex-1 min-h-[380px] max-h-[460px] overflow-hidden rounded-2xl border-2 border-[#fac775]/40 bg-[#060c18] flex items-center justify-center p-3 shadow-2xl">
          <div
            className={`relative w-full max-w-[260px] aspect-[9/16] rounded-2xl p-4 flex flex-col justify-between text-center overflow-hidden shadow-2xl border ${
              selectedTheme === "tech"
                ? "bg-gradient-to-b from-[#08101e] via-[#0f203c] to-[#002244] border-[#00f5d4] text-[#00f5d4]"
                : selectedTheme === "gold"
                ? "bg-gradient-to-b from-[#3a1306] via-[#712b13] to-[#993c1d] border-[#fac775] text-[#fac775]"
                : "bg-gradient-to-b from-[#4a1204] via-[#712b13] to-[#993c1d] border-[#fac775] text-[#faeeda]"
            }`}
          >
            {/* Background Ambient Glow & Star Orbs */}
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-red-600/20 blur-2xl pointer-events-none" />

            {/* Inner Border Trim */}
            <div className="absolute inset-1.5 border border-white/20 rounded-xl pointer-events-none" />

            {/* 1. Header: Event Info */}
            <div className="relative z-10">
              <span className="text-[8px] tracking-widest font-black uppercase text-amber-300 block">
                🏮 FU-DEVER CLUB DAY 2026 🏮
              </span>
              <h4 className="text-sm font-black text-white tracking-wider font-display drop-shadow-md">
                DEPLOY ƯỚC MƠ
              </h4>
              <div className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-white/10 text-[8px] font-bold text-amber-200">
                {categoryInfo?.emoji} {categoryInfo?.shortLabel}
              </div>
            </div>

            {/* 2. Middle: Selected Lantern + Name + Content + Seal */}
            <div className="relative z-10 my-auto py-2">
              {/* Floating Lantern SVG */}
              <div className="flex justify-center mb-1.5">
                <LanternSVG shape={shape} size={42} glow={true} className="animate-glow" />
              </div>

              {/* Dreamer Name */}
              <div className="text-xs font-black text-white drop-shadow-sm mb-1">
                ✨ {dream.name || "Tân Sinh Viên K22"} ✨
              </div>

              {/* Wish Content Box */}
              <div className="p-2.5 rounded-xl bg-black/35 border border-white/15 backdrop-blur-md">
                <p className="text-[10px] sm:text-[11px] italic font-medium text-white/95 line-clamp-4 leading-snug whitespace-pre-line">
                  &ldquo;{dream.content}&rdquo;
                </p>
              </div>

              {/* Red Traditional Seal & Buggy Mascot Stamp */}
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="px-2 py-0.5 rounded-md border border-red-400 bg-red-900/60 text-red-300 text-[8px] font-black tracking-wider transform -rotate-6">
                  {selectedTheme === "tech" ? "DEVER" : "ĐỖ ĐẠT"}
                </div>
                <div className="w-8 h-8 rounded-full bg-[#12203A] border border-[#fac775] p-0.5 shadow-md">
                  <Image
                    src={`/assets/buggy/${selectedMascot}.png`}
                    alt="Buggy"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* 3. Footer: Brand Logo & Hashtags */}
            <div className="relative z-10 border-t border-white/15 pt-1.5">
              <div className="text-[8px] font-bold text-white/80">
                CLB LẬP TRÌNH FU-DEVER · FPTU
              </div>
              <div className="text-[7px] text-amber-300 font-mono">
                #FUDEVER #DeployUocMo
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#0091ea] to-[#fac775] hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xuất ảnh HD 1080x1920...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Tải Ảnh Về Máy (Chuẩn HD Story 9:16)</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-[#fac775] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Đã copy Hashtags!" : "Chia sẻ Story / Mạng xã hội"}</span>
            </button>
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
