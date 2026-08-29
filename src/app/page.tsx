"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import confetti from "canvas-confetti";
import { DREAM_CATEGORIES, BUGGY_MOODS, INSPIRATION_PROMPTS } from "@/lib/constants";
import { Dream, DreamCategory, CardTheme } from "@/types/dream";
import { generatePoem } from "@/lib/poem-generator";
import { LanternSVG, LANTERN_SHAPES, LanternShape } from "@/components/LanternSVG";
import { playLanternAscendChime, playPoemMagicSound, playTactileClick } from "@/lib/audio-synthesizer";
import { ReactionBar } from "@/components/ReactionBar";
import { useRealtimeDreams } from "@/lib/use-realtime-dreams";
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Lightbulb,
  Palette,
  Flame,
  Camera,
  Feather,
  Layers,
} from "lucide-react";

// Dynamically lazy-load heavy interactive modals to minimize initial bundle size on mobile devices
const DreamCardModal = dynamic(
  () => import("@/components/DreamCardModal").then((mod) => mod.DreamCardModal),
  { ssr: false }
);

const ARPhotoBoothModal = dynamic(
  () => import("@/components/ARPhotoBoothModal").then((mod) => mod.ARPhotoBoothModal),
  { ssr: false }
);

const BuggyCatcherModal = dynamic(
  () => import("@/components/BuggyCatcherModal").then((mod) => mod.BuggyCatcherModal),
  { ssr: false }
);

export default function WishSubmissionPage() {
  const [step, setStep] = useState<"intro" | "form" | "thankyou">("intro");

  // Form State
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<DreamCategory>("career");
  const [mascotIndex, setMascotIndex] = useState<number | string>("11");
  const [theme, setTheme] = useState<CardTheme>("classic");
  const [lanternShape, setLanternShape] = useState<LanternShape>("hoian_lotus");
  const [consent, setConsent] = useState(true);

  // Status & Response
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdDream, setCreatedDream] = useState<Dream | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showPhotoBooth, setShowPhotoBooth] = useState(false);
  const [showBuggyGame, setShowBuggyGame] = useState(false);

  // Live Realtime Dream Count synchronized with Supabase / SSE / Polling
  const { totalCount, setTotalCount } = useRealtimeDreams();

  // Easter Egg tap counter
  const [buggyTapCount, setBuggyTapCount] = useState(0);

  // AI Poem Generator state
  const [generatedPoem, setGeneratedPoem] = useState<{ title: string; lines: string[]; badge: string } | null>(null);

  // Haptic feedback helper for mobile touch ergonomics
  const triggerHaptic = (pattern: number | number[] = 35) => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore on unsupported browsers
      }
    }
  };

  const handleBuggyTap = () => {
    playTactileClick();
    triggerHaptic(25);
    const nextCount = buggyTapCount + 1;
    setBuggyTapCount(nextCount);
    if (nextCount >= 5) {
      setBuggyTapCount(0);
      setShowBuggyGame(true);
      triggerHaptic([40, 60, 80]);
    }
  };

  const handleApplyPrompt = (promptText: string) => {
    playTactileClick();
    triggerHaptic(30);
    setContent(promptText);
  };

  const handleGeneratePoem = () => {
    playPoemMagicSound();
    triggerHaptic([30, 40, 50]);
    const poem = generatePoem(name, tag);
    setGeneratedPoem(poem);
    setContent(poem.lines.join("\n"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!content.trim()) {
      setErrorMsg("Vui lòng viết nội dung ước mơ của bạn nhé!");
      triggerHaptic([80, 50, 80]);
      return;
    }

    if (!consent) {
      setErrorMsg("Vui lòng đồng ý chia sẻ ước mơ để tiếp tục!");
      triggerHaptic([80, 50, 80]);
      return;
    }

    setIsSubmitting(true);
    triggerHaptic(40);

    try {
      const res = await fetch("/api/dreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          content: content.trim(),
          tag,
          mascotIndex,
          theme,
          lanternShape,
          consent,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Không thể gửi ước mơ, vui lòng thử lại!");
      }

      setCreatedDream(json.data);
      setTotalCount((prev) => (prev !== null ? prev + 1 : 1));
      setStep("thankyou");

      // Ascending audio chime & celebration haptic pulse
      playLanternAscendChime();
      triggerHaptic([60, 50, 100, 50, 150]);

      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#FAC775", "#993C1D", "#0091EA", "#00F5D4", "#FAEEDA"],
      });
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Đã có lỗi xảy ra, vui lòng thử lại.");
      triggerHaptic([100, 50, 100]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    playTactileClick();
    triggerHaptic(30);
    setName("");
    setContent("");
    setTag("career");
    setMascotIndex("11");
    setTheme("classic");
    setLanternShape("hoian_lotus");
    setConsent(true);
    setGeneratedPoem(null);
    setCreatedDream(null);
    setStep("form");
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-full flex-1 flex flex-col items-center justify-center px-2.5 sm:px-4 py-4 sm:py-10 bg-radial from-[#fffcf7] via-[#fff5e3] to-[#f5ead6] relative overflow-x-clip max-w-full"
    >
      {/* Decorative Warm Ambient Light Orbs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#fac775]/25 blur-3xl pointer-events-none overflow-hidden" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#993c1d]/15 blur-3xl pointer-events-none overflow-hidden" />
      <div className="absolute top-1/2 -right-20 w-60 h-60 rounded-full bg-[#0091ea]/10 blur-3xl pointer-events-none overflow-hidden" />

      <div suppressHydrationWarning className="w-full max-w-[440px] mx-auto relative z-10">
        {/* STEP PROGRESS BAR */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3.5 sm:mb-5">
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all ${
              step === "intro"
                ? "bg-[#993c1d] text-white shadow-sm"
                : "bg-white/80 text-slate-500 border border-slate-200"
            }`}
          >
            <span>1</span>
            <span className="hidden sm:inline">Chào Đón</span>
          </div>
          <span className="text-slate-300 text-xs">➔</span>
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all ${
              step === "form"
                ? "bg-[#993c1d] text-white shadow-sm"
                : "bg-white/80 text-slate-500 border border-slate-200"
            }`}
          >
            <span>2</span>
            <span>Soạn Ước Mơ</span>
          </div>
          <span className="text-slate-300 text-xs">➔</span>
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all ${
              step === "thankyou"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white/80 text-slate-500 border border-slate-200"
            }`}
          >
            <span>3</span>
            <span>Thắp Sáng</span>
          </div>
        </div>

        {/* STEP 1: INTRO SCREEN */}
        {step === "intro" && (
          <div className="bg-white/95 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-[0_20px_50px_rgba(153,60,29,0.08)] border border-[#fac775]/50 backdrop-blur-xl text-center animate-in fade-in zoom-in-95 duration-300 max-w-full overflow-hidden">
            {/* Mascot Buggy Badge with Easter Egg Tap */}
            <div
              onClick={handleBuggyTap}
              className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4 flex items-center justify-center cursor-pointer group select-none"
              title="Chạm 5 lần vào Buggy để mở minigame bí mật!"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#fac775]/50 via-[#0091ea]/30 to-[#993c1d]/30 rounded-full animate-pulse blur-xs group-hover:scale-110 transition-transform" />
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-[#993c1d] to-[#712b13] p-1.5 shadow-xl flex items-center justify-center border-2 border-[#fac775]">
                <Image
                  src="/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png"
                  alt="Linh vật Buggy FU-DEVER"
                  width={64}
                  height={64}
                  className="object-contain drop-shadow-md animate-float"
                  priority
                />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="inline-flex items-center gap-1 px-3 py-0.5 sm:py-1 rounded-full bg-[#fac775]/25 text-[#712b13] text-[11px] sm:text-xs font-black uppercase tracking-wider mb-2 border border-[#fac775]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#993c1d]" />
              <span>FU-DEVER Club Day 2026</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#993c1d] tracking-tight mb-2 font-display">
              DEPLOY ƯỚC MƠ 🏮
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6 leading-relaxed">
              Chào mừng tân sinh viên <strong>K22</strong> đến với gian hàng <strong>FU-DEVER</strong>! Cùng thắp sáng hoài bão của bạn tại Club Day 2026, thả chiếc đèn lồng số hóa lên bầu trời đêm và nhận ngay thiệp <strong>Dream Card</strong> mang dấu ấn riêng.
            </p>

            {/* Live Count Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] sm:text-xs font-bold mb-4 sm:mb-6 shadow-xs max-w-full">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse shrink-0" />
              <span className="truncate">Đã có <strong>{totalCount !== null ? totalCount : "..."}</strong> ngọn đèn ước mơ cùng hội tụ!</span>
            </div>

            {/* Highlight Feature Cards */}
            <div className="grid grid-cols-1 gap-2 sm:gap-2.5 text-left mb-4 sm:mb-6">
              <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-[#fac775]/40 text-xs text-[#712b13]">
                <span className="text-xl shrink-0">🌌</span>
                <div>
                  <strong className="block text-[#993c1d]">Bầu Trời Đèn Lồng Trực Tiếp</strong>
                  <span className="text-slate-600 text-[11px] sm:text-xs">Ước mơ của bạn sẽ lập tức bay lượn và tỏa sáng trên màn hình lớn của gian hàng.</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 text-xs text-[#0055a5]">
                <span className="text-xl shrink-0">🎨</span>
                <div>
                  <strong className="block text-[#0055a5]">Tấm Thiệp Dream Card Story 9:16</strong>
                  <span className="text-slate-600 text-[11px] sm:text-xs">Thiệp phong cách hoàng kim, triện may mắn, sẵn sàng tải về khoe story.</span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              id="btn-start-dream"
              onClick={() => {
                playTactileClick();
                setStep("form");
              }}
              className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#712b13] to-[#993c1d] hover:opacity-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(153,60,29,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Thắp Sáng Ước Mơ Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: FORM SUBMISSION SCREEN */}
        {step === "form" && (
          <div className="bg-white/95 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-[0_20px_50px_rgba(153,60,29,0.08)] border border-[#fac775]/50 backdrop-blur-xl animate-in fade-in duration-300 max-w-full overflow-hidden">
            <div className="text-center mb-4 sm:mb-6">
              <span className="text-2xl animate-float inline-block">✍️</span>
              <h2 className="text-xl sm:text-2xl font-black text-[#993c1d] tracking-tight font-display">
                Gửi Gắm Ước Mơ K22
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                Gửi gắm mục tiêu, dự định hoặc điều bạn ấp ủ nhất thời sinh viên cùng <strong>FU-DEVER</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Field: Name */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tên của bạn hoặc Biệt danh <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Quang Nhật K22 (để trống nếu muốn ẩn danh)"
                  maxLength={40}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#993c1d] focus:ring-3 focus:ring-[#993c1d]/15 outline-none text-xs sm:text-sm text-slate-800 transition-all"
                />
              </div>

              {/* Field: Category Tags */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Chủ đề ước mơ:
                </label>
                <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                  {DREAM_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setTag(cat.id);
                      }}
                      className={`py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        tag === cat.id
                          ? "bg-[#993c1d] text-white border border-[#fac775] shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      <span className="shrink-0">{cat.emoji}</span>
                      <span className="truncate">{cat.shortLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* LANTERN TEMPLATE SHAPE PICKER */}
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#993c1d]" />
                  <span>Chọn dáng Đèn Lồng Trung Thu:</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5">
                  {LANTERN_SHAPES.map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setLanternShape(shape.id);
                      }}
                      className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer border ${
                        lanternShape === shape.id
                          ? "bg-[#fac775]/25 border-2 border-[#993c1d] scale-105 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                      }`}
                      title={shape.description}
                    >
                      <LanternSVG shape={shape.id} size={28} glow={false} />
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 truncate w-full text-center">
                        {shape.name.split(" ")[1] || shape.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Prompts & AI Poem Engine */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <div className="flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">Gợi ý 1 chạm (Nhấn để điền):</span>
                  </div>

                  {/* AI Poem Generator Button */}
                  <button
                    type="button"
                    onClick={handleGeneratePoem}
                    className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
                    title="Gieo vần thơ Trung Thu DEVER"
                  >
                    <Feather className="w-3 h-3" />
                    <span>✨ Gieo Vần Thơ</span>
                  </button>
                </div>

                {/* Horizontal Scrollable Touch Chips on Mobile */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                  {INSPIRATION_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPrompt(p)}
                      className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 border border-amber-300/80 text-[11px] font-medium transition-all text-left whitespace-nowrap shrink-0 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field: Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nội dung ước mơ <span className="text-[#993c1d]">*</span>
                  </label>
                  {content.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        triggerHaptic(20);
                        setContent("");
                      }}
                      className="text-[10px] text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                    >
                      Xóa nội dung
                    </button>
                  )}
                </div>
                <textarea
                  id="content-input"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Viết điều bạn mong ước (VD: Đạt GPA 3.8, vô địch Hackathon, trở thành Lead Dev và có nhiều bạn thân tại DEVER!)..."
                  rows={3}
                  maxLength={300}
                  required
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#993c1d] focus:ring-3 focus:ring-[#993c1d]/15 outline-none text-base sm:text-sm text-slate-800 transition-all resize-none font-sans leading-relaxed"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5 font-medium">
                  <span className="text-slate-500">💡 Gợi ý: Viết ngắn gọn, súc tích để thẻ hiển thị đẹp nhất!</span>
                  <span>{content.length}/300 ký tự</span>
                </div>
              </div>

              {/* LIVE MINI PREVIEW CARD WITH SELECTED LANTERN */}
              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#12203A] to-[#0a1222] border border-[#fac775]/40 text-[#faeeda] shadow-inner relative overflow-hidden flex items-center gap-2.5 sm:gap-3">
                <div className="shrink-0 flex flex-col items-center">
                  <LanternSVG shape={lanternShape} size={38} glow={true} className="animate-glow" />
                  <div className="w-0.5 h-2.5 bg-[#fac775]" />
                  <div className="w-2 h-2 rounded-full bg-[#993c1d] border border-[#fac775]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#fac775] font-bold mb-0.5">
                    <span className="truncate">Thẻ treo: {name || "Ẩn danh K22"}</span>
                    <span>{DREAM_CATEGORIES.find((c) => c.id === tag)?.emoji}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-white/90 italic font-medium line-clamp-2 whitespace-pre-line leading-tight">
                    &ldquo;{content || "Nội dung ước mơ của bạn sẽ xuất hiện lung linh tại đây..."}&rdquo;
                  </p>
                  {generatedPoem && (
                    <div className="mt-0.5 text-[9px] sm:text-[10px] text-amber-300 font-bold truncate">
                      🏮 {generatedPoem.badge}
                    </div>
                  )}
                </div>
              </div>

              {/* Customizer: Mascot & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                {/* Mascot Buggy Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sticker Buggy Trung Thu:
                  </label>
                  <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                    {[
                      { id: "11", label: "Thả Tim ❤️", src: "/assets/buggy/11.png" },
                      { id: "19", label: "Bắn Tim 🥰", src: "/assets/buggy/19.png" },
                      { id: "04_buggy_chu_cuoi_coder.png", label: "Chú Cuội", src: "/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png" },
                      { id: "10_buggy_hang_nga_fairy.png", label: "Hằng Nga", src: "/assets/buggy/trung-thu/10_buggy_hang_nga_fairy.png" },
                      { id: "01_buggy_lantern_parade.png", label: "Rước Đèn", src: "/assets/buggy/trung-thu/01_buggy_lantern_parade.png" },
                      { id: "02_buggy_mooncake_feast.png", label: "Bánh Trăng", src: "/assets/buggy/trung-thu/02_buggy_mooncake_feast.png" },
                      { id: "03_buggy_lion_dance.png", label: "Múa Lân", src: "/assets/buggy/trung-thu/03_buggy_lion_dance.png" },
                      { id: "05_buggy_moon_rabbit_hug.png", label: "Thỏ Ngọc", src: "/assets/buggy/trung-thu/05_buggy_moon_rabbit_hug.png" },
                    ].map((mood) => (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          triggerHaptic(20);
                          setMascotIndex(mood.id);
                        }}
                        className={`min-h-[44px] p-1 sm:p-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          String(mascotIndex) === String(mood.id)
                            ? "bg-[#fac775]/40 border-2 border-[#993c1d] scale-105 shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 border border-slate-200"
                        }`}
                        title={mood.label}
                      >
                        <Image
                          src={mood.src}
                          alt={mood.label}
                          width={26}
                          height={26}
                          className="object-contain"
                        />
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 truncate max-w-full">
                          {mood.label.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Theme Picker */}
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    <Palette className="w-3.5 h-3.5 text-[#0091ea]" />
                    <span>Phong cách thiệp:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        triggerHaptic(20);
                        setTheme("classic");
                      }}
                      className={`min-h-[44px] py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                        theme === "classic"
                          ? "bg-gradient-to-r from-[#993c1d] to-[#712b13] text-white border border-[#fac775] shadow-xs"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      🏮 Cổ Điển
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        triggerHaptic(20);
                        setTheme("tech");
                      }}
                      className={`min-h-[44px] py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                        theme === "tech"
                          ? "bg-gradient-to-r from-[#0091ea] to-[#0055a5] text-white border border-[#00f5d4] shadow-xs"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      🚀 Tech
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        triggerHaptic(20);
                        setTheme("gold");
                      }}
                      className={`min-h-[44px] py-2 px-1 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                        theme === "gold"
                          ? "bg-gradient-to-r from-[#b8860b] via-[#ffd166] to-[#b8860b] text-[#2b1700] border border-[#fff3d1] shadow-[0_0_10px_rgba(255,209,102,0.5)]"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      👑 Gold
                    </button>
                  </div>
                </div>
              </div>

              {/* Field: Consent Checkbox */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    id="consent-checkbox"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#993c1d] focus:ring-[#993c1d] accent-[#993c1d] shrink-0"
                  />
                  <span className="text-[11px] sm:text-xs text-slate-700 leading-relaxed">
                    Tôi đồng ý hiển thị ước mơ lên màn hình ngày hội và cùng lan toả tinh thần <strong>FU-DEVER</strong>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-dream"
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="w-full min-h-[48px] py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#712b13] to-[#993c1d] hover:opacity-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(153,60,29,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang thả đèn lồng...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Thả Đèn Lồng Ước Mơ</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* MOBILE STICKY FLOATING QUICK SUBMIT BAR (Triggered when user has typed content) */}
        {step === "form" && content.trim().length > 0 && (
          <div className="fixed bottom-3 inset-x-3 z-40 sm:hidden animate-in slide-in-from-bottom duration-300 pointer-events-auto pb-safe">
            <div className="p-2 rounded-2xl bg-[#12203A]/95 backdrop-blur-xl border-2 border-[#fac775] shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 pl-2 text-white min-w-0">
                <LanternSVG shape={lanternShape} size={24} glow={false} className="shrink-0" />
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[11px] font-bold text-[#fac775] truncate">{name || "Tân sinh viên K22"}</span>
                  <span className="text-[9px] text-white/70 truncate">{content.length}/300 ký tự</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#993c1d] to-[#fac775] text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Thả Ngay 🏮</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: THANK YOU & CELEBRATION SCREEN */}
        {step === "thankyou" && createdDream && (
          <div className="bg-white/95 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-[0_20px_50px_rgba(153,60,29,0.08)] border border-[#fac775]/50 backdrop-blur-xl text-center animate-in zoom-in-95 duration-300 max-w-full overflow-hidden">
            {/* Selected Lantern SVG Floating in Victory */}
            <div className="relative mx-auto mb-2 flex items-center justify-center">
              <LanternSVG
                shape={(createdDream.lanternShape as LanternShape) || lanternShape}
                size={64}
                glow={true}
                className="animate-float"
              />
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-0.5 sm:py-1 rounded-full bg-[#fac775]/30 text-[#712b13] text-[11px] sm:text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#993c1d]" />
              <span>Đã cất cánh</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-[#993c1d] mb-1.5 sm:mb-2 font-display">
              Đèn Lồng Đã Cất Cánh! 🏮
            </h2>

            <p className="text-xs text-slate-600 mb-4 sm:mb-5 leading-relaxed max-w-sm mx-auto">
              Đèn lồng mang tâm nguyện của <strong>{createdDream.name || "bạn"}</strong> đã bay lên bầu trời đêm. Hãy nhìn lên màn hình lớn tại gian hàng để đón chờ chiếc đèn của mình nhé!
            </p>

            {/* Snippet Card */}
            <div className="bg-[#12203A] border border-[#fac775]/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left mb-3 sm:mb-4 text-[#faeeda] shadow-inner relative overflow-hidden">
              <div className="text-[10px] sm:text-[11px] text-[#fac775] font-bold mb-1 flex items-center justify-between">
                <span className="truncate">{createdDream.name || "Ẩn danh"}</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full shrink-0">
                  {DREAM_CATEGORIES.find((c) => c.id === createdDream.tag)?.emoji}{" "}
                  {DREAM_CATEGORIES.find((c) => c.id === createdDream.tag)?.shortLabel}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium italic text-white line-clamp-3 whitespace-pre-line leading-relaxed">
                &ldquo;{createdDream.content}&rdquo;
              </p>
            </div>

            {/* Live Reaction Bar */}
            <ReactionBar />

            {/* Action Buttons */}
            <div className="space-y-2 mt-4 sm:mt-5">
              <button
                id="btn-view-card"
                onClick={() => {
                  playTactileClick();
                  setShowCardModal(true);
                }}
                className="w-full py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#993c1d] to-[#fac775] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Xem & Tải Dream Card (Story 9:16)</span>
              </button>

              <button
                onClick={() => {
                  playTactileClick();
                  setShowPhotoBooth(true);
                }}
                className="w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0091ea] to-[#00f5d4] hover:opacity-95 text-[#051329] font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Chụp Ảnh Polaroid Kỷ Niệm (Photo Booth)</span>
              </button>

              <button
                onClick={resetForm}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Gửi thêm một ước mơ khác</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dream Card Modal - Lazy Loaded */}
      {createdDream && showCardModal && (
        <DreamCardModal
          dream={createdDream}
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
        />
      )}

      {/* AR Photo Booth Modal - Lazy Loaded */}
      {showPhotoBooth && (
        <ARPhotoBoothModal
          isOpen={showPhotoBooth}
          onClose={() => setShowPhotoBooth(false)}
          dreamName={createdDream?.name || undefined}
          dreamContent={createdDream?.content || undefined}
        />
      )}

      {/* Buggy Catcher Minigame Easter Egg Modal - Lazy Loaded */}
      {showBuggyGame && (
        <BuggyCatcherModal
          isOpen={showBuggyGame}
          onClose={() => setShowBuggyGame(false)}
        />
      )}
    </div>
  );
}
