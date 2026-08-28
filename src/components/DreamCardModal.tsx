"use client";

import React, { useState } from "react";
import { Dream, CardTheme } from "@/types/dream";
import { DREAM_CATEGORIES, getBuggyMascotUrl } from "@/lib/constants";
import { downloadDreamCard, renderDreamCardToDataUrl, renderBoardingPassCardToDataUrl } from "@/lib/dream-card-canvas";
import { LanternSVG, LanternShape } from "@/components/LanternSVG";
import { playTactileClick } from "@/lib/audio-synthesizer";
import { Download, Share2, X, Sparkles, Check, Palette, Ticket, Layers } from "lucide-react";
import Image from "next/image";

interface DreamCardModalProps {
  dream: Dream;
  isOpen: boolean;
  onClose: () => void;
}

const BUGGY_STICKER_OPTIONS = [
  { id: "11", label: "Thả Tim ❤️", src: "/assets/buggy/11.png" },
  { id: "19", label: "Bắn Tim 🥰", src: "/assets/buggy/19.png" },
  { id: "trung-thu/04_buggy_chu_cuoi_coder.png", label: "Chú Cuội Coder", src: "/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png" },
  { id: "trung-thu/10_buggy_hang_nga_fairy.png", label: "Hằng Nga Tiên Nữ", src: "/assets/buggy/trung-thu/10_buggy_hang_nga_fairy.png" },
  { id: "trung-thu/01_buggy_lantern_parade.png", label: "Rước Đèn Ông Sao", src: "/assets/buggy/trung-thu/01_buggy_lantern_parade.png" },
  { id: "trung-thu/02_buggy_mooncake_feast.png", label: "Ăn Bánh Trung Thu", src: "/assets/buggy/trung-thu/02_buggy_mooncake_feast.png" },
  { id: "trung-thu/03_buggy_lion_dance.png", label: "Múa Lân Rộn Ràng", src: "/assets/buggy/trung-thu/03_buggy_lion_dance.png" },
  { id: "trung-thu/05_buggy_moon_rabbit_hug.png", label: "Ôm Thỏ Ngọc", src: "/assets/buggy/trung-thu/05_buggy_moon_rabbit_hug.png" },
  { id: "6", label: "Cool Ngầu 😎", src: "/assets/buggy/6.png" },
  { id: "8", label: "Cà Phê Code ☕", src: "/assets/buggy/8.png" },
  { id: "4", label: "Ý Tưởng 💡", src: "/assets/buggy/4.png" },
  { id: "9", label: "Ăn Mừng 🎉", src: "/assets/buggy/9.png" },
];

export const DreamCardModal: React.FC<DreamCardModalProps> = ({ dream, isOpen, onClose }) => {
  const [cardFormat, setCardFormat] = useState<"boarding_pass" | "postcard">("boarding_pass");
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(dream.theme || "classic");
  const [selectedMascot, setSelectedMascot] = useState<number | string>(
    dream.mascotIndex || "11"
  );
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
      const dataUrl =
        cardFormat === "boarding_pass"
          ? await renderBoardingPassCardToDataUrl(customizedDream, { width: 1080, height: 1920 })
          : await renderDreamCardToDataUrl(customizedDream, { width: 1080, height: 1920 });

      const prefix = cardFormat === "boarding_pass" ? "Boarding_Pass_K22" : "Dream_Card";
      const fileName = `${prefix}_${dream.name ? dream.name.replace(/\s+/g, "_") : "FU_DEVER"}_${selectedTheme}_2026.png`;
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
      const dataUrl =
        cardFormat === "boarding_pass"
          ? await renderBoardingPassCardToDataUrl(customizedDream, { width: 1080, height: 1920 })
          : await renderDreamCardToDataUrl(customizedDream, { width: 1080, height: 1920 });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const fileName = cardFormat === "boarding_pass" ? "Boarding_Pass_FU_DEVER_K22.png" : "Dream_Card_FU_DEVER_2026.png";
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Ước mơ & Vé lên tàu FU-DEVER Club Day 2026",
          text: "Tôi vừa nhận Vé Lên Tàu Vũ Trụ cùng CLB Lập trình FU-DEVER! #FUDEVER #DeployUocMo",
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
          <h3 className="text-xl font-black text-white font-display">Thiệp Ước Mơ & Vé Lên Tàu K22</h3>
          <p className="text-xs text-[#faeeda]/80">Tùy biến phong cách & lưu ảnh đăng Story Instagram/TikTok</p>
        </div>

        {/* Format Switcher (Boarding Pass vs Postcard) */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/10 border border-[#fac775]/30 mb-3">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setCardFormat("boarding_pass");
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              cardFormat === "boarding_pass"
                ? "bg-gradient-to-r from-[#0091ea] to-[#00f5d4] text-[#050914] shadow-md scale-[1.02]"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Vé Lên Tàu Vũ Trụ K22</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setCardFormat("postcard");
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              cardFormat === "postcard"
                ? "bg-gradient-to-r from-[#993c1d] to-[#fac775] text-white shadow-md scale-[1.02]"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Thiệp Lụa Hoa Đăng</span>
          </button>
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
                    ? "bg-gradient-to-r from-[#993c1d] to-[#712b13] text-white border border-[#fac775] shadow-xs"
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
                    ? "bg-gradient-to-r from-[#0091ea] to-[#0055a5] text-white border border-[#00f5d4] shadow-xs"
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
                className={`py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTheme === "gold"
                    ? "bg-gradient-to-r from-[#b8860b] via-[#ffd166] to-[#b8860b] text-[#2b1700] border border-[#fff3d1] shadow-[0_0_12px_rgba(255,209,102,0.5)] scale-[1.02]"
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
              Sticker Buggy Trung Thu gắn kèm:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
              {BUGGY_STICKER_OPTIONS.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setSelectedMascot(mood.id);
                  }}
                  className={`p-1.5 rounded-xl shrink-0 transition-all cursor-pointer border flex flex-col items-center gap-0.5 ${
                    String(selectedMascot) === String(mood.id)
                      ? "bg-[#fac775]/25 border-[#fac775] scale-105 shadow-xs ring-1 ring-[#fac775]"
                      : "bg-white/5 border-transparent hover:bg-white/10 opacity-75 hover:opacity-100"
                  }`}
                  title={mood.label}
                >
                  <Image
                    src={mood.src}
                    alt={mood.label}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <span className="text-[9px] text-[#faeeda] font-medium truncate max-w-[54px]">
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CRISP REAL-TIME LIVE 9:16 DREAM CARD / BOARDING PASS PREVIEW */}
        <div className="relative flex-1 min-h-[380px] max-h-[470px] overflow-hidden rounded-2xl border-2 border-[#fac775]/40 bg-[#060c18] flex items-center justify-center p-3 shadow-2xl">
          {cardFormat === "boarding_pass" ? (
            /* BOARDING PASS LIVE PREVIEW */
            <div className="relative w-full max-w-[260px] aspect-[9/16] rounded-2xl bg-white text-slate-900 flex flex-col justify-between overflow-hidden shadow-2xl border-2 border-amber-300 select-none">
              {/* Top Airline Header */}
              <div
                className={`p-2.5 text-white ${
                  selectedTheme === "tech"
                    ? "bg-gradient-to-r from-[#0091ea] to-[#00f5d4]"
                    : selectedTheme === "gold"
                    ? "bg-gradient-to-r from-[#b87c12] to-[#ffd166]"
                    : "bg-gradient-to-r from-[#993c1d] to-[#e63946]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-wider uppercase font-mono">
                    FU-DEVER SPACEWAYS
                  </span>
                  <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded bg-white/20 uppercase font-mono">
                    FIRST CLASS
                  </span>
                </div>
                <div className="text-[8px] font-bold text-white/90 font-mono">
                  BOARDING PASS · VÉ LÊN TÀU K22
                </div>
              </div>

              {/* Flight Parameter Grid */}
              <div className="p-2.5 space-y-1.5 text-left text-[9px]">
                <div className="grid grid-cols-3 gap-1 pb-1 border-b border-slate-200">
                  <div>
                    <span className="text-[7px] text-slate-400 font-bold block">FLIGHT</span>
                    <span className="font-mono font-black text-slate-900">DEVER-K22</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-400 font-bold block">GATE</span>
                    <span className="font-mono font-black text-slate-900">01 (FPTU)</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-slate-400 font-bold block">SEAT</span>
                    <span className="font-mono font-black text-slate-900">22A VIP</span>
                  </div>
                </div>

                <div>
                  <span className="text-[7px] text-slate-400 font-bold block">PASSENGER</span>
                  <span className="font-black text-[11px] text-slate-900 truncate block">
                    {dream.name || "TÂN SINH VIÊN K22"}
                  </span>
                </div>

                {/* Route Banner */}
                <div className="p-1 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-[8px] font-black font-mono">
                  <span>FPTU DAD</span>
                  <span className="text-[#993c1d]">✈ ── 🚀 ── 🏮</span>
                  <span className="text-[#0091ea]">DEVER DEV</span>
                </div>

                {/* Wish Content Snippet */}
                <div className="p-1.5 rounded bg-amber-50/70 border border-amber-200/80 relative">
                  <span className="text-[7px] text-[#993c1d] font-bold block uppercase mb-0.5">
                    📜 Lời nguyện cất cánh:
                  </span>
                  <p className="text-[9px] italic text-slate-800 line-clamp-2 leading-tight font-serif">
                    &ldquo;{dream.content}&rdquo;
                  </p>

                  {/* Mascot sticker */}
                  <div className="absolute right-1 bottom-1 w-6 h-6 rounded-full bg-white border border-amber-300 p-0.5 shadow-xs">
                    <Image
                      src={getBuggyMascotUrl(selectedMascot)}
                      alt="Buggy"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Perforated Divider */}
              <div className="relative border-b-2 border-dashed border-slate-300 my-0.5">
                <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-[#060c18]" />
                <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-[#060c18]" />
              </div>

              {/* Bottom Barcode Stub */}
              <div className="p-2 text-center">
                {/* Barcode representation */}
                <div className="h-6 flex items-center justify-center gap-0.5 bg-slate-100 p-1 rounded">
                  {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 3, 2, 5, 2, 4, 2, 6, 1, 4, 3].map((w, i) => (
                    <div key={i} className="h-full bg-slate-900" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <div className="text-[7px] font-mono font-bold text-slate-500 mt-1">
                  SN: DEVER-K22-FPTU
                </div>
                <div className="text-[7px] font-extrabold text-[#993c1d] mt-0.5">
                  #FUDEVER #DeployUocMo
                </div>
              </div>
            </div>
          ) : (
            /* CLASSIC POSTCARD LIVE PREVIEW */
            <div
              className={`relative w-full max-w-[260px] aspect-[9/16] rounded-2xl p-4 flex flex-col justify-between text-center overflow-hidden shadow-2xl border ${
                selectedTheme === "tech"
                  ? "bg-gradient-to-b from-[#030814] via-[#091a38] to-[#0c2856] border-[#00f5d4] text-[#00f5d4]"
                  : selectedTheme === "gold"
                  ? "bg-gradient-to-b from-[#2c1800] via-[#593404] to-[#8c5408] border-[#ffd166] text-[#ffd166] shadow-[0_0_30px_rgba(255,209,102,0.25)]"
                  : "bg-gradient-to-b from-[#280505] via-[#61100b] to-[#993c1d] border-[#fac775] text-[#faeeda]"
              }`}
            >
              {/* Background Ambient Glow & Star Orbs */}
              <div
                className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl pointer-events-none ${
                  selectedTheme === "tech"
                    ? "bg-cyan-500/25"
                    : selectedTheme === "gold"
                    ? "bg-amber-300/35"
                    : "bg-amber-400/20"
                }`}
              />
              <div
                className={`absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
                  selectedTheme === "tech"
                    ? "bg-blue-600/20"
                    : selectedTheme === "gold"
                    ? "bg-yellow-600/30"
                    : "bg-red-600/20"
                }`}
              />

              {/* Inner Border Trim */}
              <div
                className={`absolute inset-1.5 border rounded-xl pointer-events-none ${
                  selectedTheme === "tech"
                    ? "border-[#00f5d4]/40"
                    : selectedTheme === "gold"
                    ? "border-[#ffd166]/60"
                    : "border-white/20"
                }`}
              />

              {/* 1. Header: Lantern & Event Tag */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-1">
                  <LanternSVG shape={shape} size={42} glow={true} />
                </div>
                <span
                  className={`text-[9px] font-black tracking-widest uppercase drop-shadow-sm ${
                    selectedTheme === "tech"
                      ? "text-[#00f5d4]"
                      : selectedTheme === "gold"
                      ? "text-[#ffd166]"
                      : "text-amber-300"
                  }`}
                >
                  DEPLOY ƯỚC MƠ 2026
                </span>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 border ${
                    selectedTheme === "tech"
                      ? "bg-[#00f5d4]/15 border-[#00f5d4]/40 text-[#00f5d4]"
                      : selectedTheme === "gold"
                      ? "bg-[#ffd166]/20 border-[#ffd166]/50 text-[#fff3d1]"
                      : "bg-white/10 border-white/10 text-white/90"
                  }`}
                >
                  <span>{categoryInfo?.emoji || "🏮"}</span>
                  <span>{categoryInfo?.shortLabel || "Ước mơ"}</span>
                </div>
              </div>

              {/* 2. Middle: Content Box with Buggy Mascot */}
              <div
                className={`relative z-10 my-auto rounded-xl p-3 border backdrop-blur-sm ${
                  selectedTheme === "tech"
                    ? "bg-[#030c1a]/85 border-[#00f5d4]/40"
                    : selectedTheme === "gold"
                    ? "bg-[#241402]/90 border-[#ffd166]/60"
                    : "bg-black/40 border-white/15"
                }`}
              >
                <h4
                  className={`text-xs font-black mb-1 truncate ${
                    selectedTheme === "gold" ? "text-[#ffd166]" : "text-white"
                  }`}
                >
                  {dream.name ? `Ước Mơ Của ${dream.name}` : "Ước Nguyện K22"}
                </h4>
                <div className="relative">
                  <span
                    className={`text-xs font-serif opacity-70 ${
                      selectedTheme === "tech"
                        ? "text-[#00f5d4]"
                        : selectedTheme === "gold"
                        ? "text-[#ffd166]"
                        : "text-amber-300"
                    }`}
                  >
                    “
                  </span>
                  <p
                    className={`text-[10px] italic font-medium line-clamp-3 leading-relaxed whitespace-pre-line px-1 ${
                      selectedTheme === "gold" ? "text-[#fff8e7]" : "text-white/95"
                    }`}
                  >
                    {dream.content}
                  </p>
                  <span
                    className={`text-xs font-serif opacity-70 float-right ${
                      selectedTheme === "tech"
                        ? "text-[#00f5d4]"
                        : selectedTheme === "gold"
                        ? "text-[#ffd166]"
                        : "text-amber-300"
                    }`}
                  >
                    ”
                  </span>
                </div>

                {/* Traditional Seal & Buggy Mascot Stamp */}
                <div className="flex items-center justify-between mt-2 px-1">
                  <div
                    className={`px-2 py-0.5 rounded-md border text-[10px] font-black tracking-wider transform -rotate-6 ${
                      selectedTheme === "tech"
                        ? "border-[#00f5d4] bg-[#00f5d4]/20 text-[#00f5d4]"
                        : selectedTheme === "gold"
                        ? "border-[#ffd166] bg-[#ffd166]/20 text-[#ffd166]"
                        : "border-red-400 bg-red-900/60 text-red-300"
                    }`}
                  >
                    {selectedTheme === "tech" ? "DEVER" : selectedTheme === "gold" ? "HOÀNG KIM" : "ĐỖ ĐẠT"}
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full border p-0.5 shadow-md flex items-center justify-center ${
                      selectedTheme === "gold"
                        ? "bg-[#2c1800] border-[#ffd166]"
                        : "bg-[#12203A] border-[#fac775]"
                    }`}
                  >
                    <Image
                      src={getBuggyMascotUrl(selectedMascot)}
                      alt="Buggy Mascot"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Footer: Brand Logo & Hashtags */}
              <div
                className={`relative z-10 border-t pt-1.5 ${
                  selectedTheme === "tech"
                    ? "border-[#00f5d4]/30"
                    : selectedTheme === "gold"
                    ? "border-[#ffd166]/40"
                    : "border-white/15"
                }`}
              >
                <div
                  className={`text-[10px] font-bold ${
                    selectedTheme === "tech"
                      ? "text-[#85b7eb]"
                      : selectedTheme === "gold"
                      ? "text-[#ffeaa7]"
                      : "text-white/80"
                  }`}
                >
                  CLB LẬP TRÌNH FU-DEVER · FPTU
                </div>
                <div
                  className={`text-[9px] font-mono ${
                    selectedTheme === "tech"
                      ? "text-[#00f5d4]"
                      : selectedTheme === "gold"
                      ? "text-[#ffd166]"
                      : "text-amber-300"
                  }`}
                >
                  #FUDEVER #DeployUocMo
                </div>
              </div>
            </div>
          )}
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
                <span>Đang kết xuất ảnh Story 9:16 HD...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Lưu Ảnh Dream Card (Story 9:16)</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-[#faeeda] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Đã sao chép hashtag #FUDEVER!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#fac775]" />
                <span>Chia sẻ lên Instagram / Facebook Story</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
