"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { DREAM_CATEGORIES, BUGGY_MOODS, INSPIRATION_PROMPTS, EVENT_INFO } from "@/lib/constants";
import { Dream, DreamCategory, CardTheme } from "@/types/dream";
import { playLanternChime } from "@/lib/audio";
import { DreamCardModal } from "@/components/DreamCardModal";
import { ReactionBar } from "@/components/ReactionBar";
import {
  Sparkles,
  Send,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  HeartHandshake,
  Lightbulb,
  Palette,
  Eye,
  Flame,
} from "lucide-react";

export default function WishSubmissionPage() {
  const [step, setStep] = useState<"intro" | "form" | "thankyou">("intro");

  // Form State
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<DreamCategory>("career");
  const [mascotIndex, setMascotIndex] = useState<number>(1);
  const [theme, setTheme] = useState<CardTheme>("classic");
  const [consent, setConsent] = useState(true);

  // Status & Response
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdDream, setCreatedDream] = useState<Dream | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(18);

  useEffect(() => {
    fetch("/api/dreams")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setTotalCount(Math.max(18, json.data.length));
        }
      })
      .catch(() => {});
  }, []);

  const handleApplyPrompt = (promptText: string) => {
    setContent(promptText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!content.trim()) {
      setErrorMsg("Vui lòng viết nội dung ước mơ của bạn nhé!");
      return;
    }

    if (!consent) {
      setErrorMsg("Vui lòng đồng ý chia sẻ ước mơ để tiếp tục!");
      return;
    }

    setIsSubmitting(true);

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
          consent,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Không thể gửi ước mơ, vui lòng thử lại!");
      }

      setCreatedDream(json.data);
      setStep("thankyou");

      // Audio chime
      playLanternChime();

      // Confetti burst
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FAC775", "#993C1D", "#0091EA", "#00F5D4", "#FAEEDA"],
      });
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Đã có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setContent("");
    setTag("career");
    setMascotIndex(1);
    setTheme("classic");
    setConsent(true);
    setCreatedDream(null);
    setStep("form");
  };

  return (
    <div className="min-h-full flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 bg-radial from-[#fffcf7] via-[#fff5e3] to-[#f5ead6] relative overflow-hidden">
      {/* Decorative Warm Ambient Light Orbs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#fac775]/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#993c1d]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-60 h-60 rounded-full bg-[#0091ea]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg mx-auto relative z-10">
        {/* STEP PROGRESS BAR */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              step === "intro"
                ? "bg-[#993c1d] text-white shadow-sm"
                : "bg-white/80 text-slate-500 border border-slate-200"
            }`}
          >
            <span>1</span>
            <span className="hidden sm:inline">Chào Đón</span>
          </div>
          <span className="text-slate-300">➔</span>
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              step === "form"
                ? "bg-[#993c1d] text-white shadow-sm"
                : "bg-white/80 text-slate-500 border border-slate-200"
            }`}
          >
            <span>2</span>
            <span>Soạn Ước Mơ</span>
          </div>
          <span className="text-slate-300">➔</span>
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
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
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(153,60,29,0.08)] border border-[#fac775]/50 backdrop-blur-xl text-center animate-in fade-in zoom-in-95 duration-300">
            {/* Mascot / Icon Badge */}
            <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#fac775]/50 via-[#0091ea]/30 to-[#993c1d]/30 rounded-full animate-pulse blur-xs" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-[#993c1d] to-[#712b13] p-1.5 shadow-xl flex items-center justify-center border-2 border-[#fac775]">
                <Image
                  src="/assets/buggy/1.png"
                  alt="Buggy Mascot"
                  width={64}
                  height={64}
                  className="object-contain drop-shadow-md animate-float"
                />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fac775]/25 text-[#712b13] text-xs font-black uppercase tracking-wider mb-2 border border-[#fac775]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#993c1d]" />
              <span>FU-DEVER Club Day 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#993c1d] tracking-tight mb-2 font-display">
              DEPLOY ƯỚC MƠ 🏮
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Chào mừng tân sinh viên <strong>K22</strong> đến với gian hàng <strong>FU-DEVER</strong>! Hãy gửi gắm ước mơ của bạn bay lên bầu trời đêm và nhận ngay <strong>Dream Card Story</strong> độc quyền.
            </p>

            {/* Live Count Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-6 shadow-xs">
              <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
              <span>Đã có <strong>{totalCount}</strong> ước mơ đang thắp sáng bầu trời FPTU!</span>
            </div>

            {/* Highlight Feature Cards */}
            <div className="grid grid-cols-1 gap-2.5 text-left mb-6">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-[#fac775]/40 text-xs text-[#712b13]">
                <span className="text-xl">🌌</span>
                <div>
                  <strong className="block text-[#993c1d]">Chiếu trực tiếp lên Màn hình lớn</strong>
                  <span className="text-slate-600 text-[11px]">Đèn lồng mang tên bạn bay lượn trên bầu trời đêm gian hàng.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 text-xs text-[#0055a5]">
                <span className="text-xl">🎨</span>
                <div>
                  <strong className="block text-[#0055a5]">Nhận Dream Card Story 9:16</strong>
                  <span className="text-slate-600 text-[11px]">Đóng dấu triện đỏ & linh vật Buggy để chia sẻ lên Instagram/Facebook.</span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              id="btn-start-dream"
              onClick={() => setStep("form")}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#712b13] to-[#993c1d] hover:opacity-95 text-white font-black text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(153,60,29,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Thả Đèn Lồng Ước Mơ Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: FORM SUBMISSION SCREEN */}
        {step === "form" && (
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(153,60,29,0.08)] border border-[#fac775]/50 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="text-center mb-6">
              <span className="text-2xl animate-bounce inline-block">✍️</span>
              <h2 className="text-2xl font-black text-[#993c1d] tracking-tight font-display">
                Gửi Gắm Ước Mơ K22
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Hãy viết những điều bạn mong muốn chinh phục cùng <strong>FU-DEVER</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field: Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên của bạn hoặc Biệt danh <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Quang Nhật K22 (để trống nếu muốn ẩn danh)"
                  maxLength={40}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#993c1d] focus:ring-3 focus:ring-[#993c1d]/15 outline-none text-xs sm:text-sm text-slate-800 transition-all"
                />
              </div>

              {/* Field: Category Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Chủ đề ước mơ:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {DREAM_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTag(cat.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        tag === cat.id
                          ? "bg-[#993c1d] text-white border border-[#fac775] shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span className="truncate">{cat.shortLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Inspiration Prompts */}
              <div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gợi ý ước mơ nhanh:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {INSPIRATION_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPrompt(p.text)}
                      className="px-2.5 py-1 rounded-full bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-medium transition-all text-left truncate max-w-full cursor-pointer active:scale-95"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field: Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nội dung ước mơ <span className="text-[#993c1d]">*</span>
                </label>
                <textarea
                  id="content-input"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Viết điều bạn mong ước (VD: Đạt GPA 3.8, vô địch Hackathon, trở thành Lead Dev và có nhiều bạn thân tại DEVER!)..."
                  rows={3}
                  maxLength={300}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#993c1d] focus:ring-3 focus:ring-[#993c1d]/15 outline-none text-xs sm:text-sm text-slate-800 transition-all resize-none"
                />
                <div className="text-right text-[10px] text-slate-400 mt-1 font-medium">
                  {content.length}/300 ký tự
                </div>
              </div>

              {/* LIVE MINI PREVIEW CARD */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#12203A] to-[#0a1222] border border-[#fac775]/40 text-[#faeeda] shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-[#fac775] font-bold mb-1">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem trước đèn lồng: {name || "Ẩn danh"}</span>
                  </div>
                  <span>{DREAM_CATEGORIES.find((c) => c.id === tag)?.emoji}</span>
                </div>
                <p className="text-xs text-white/90 italic font-medium line-clamp-2">
                  &ldquo;{content || "Nội dung ước mơ của bạn sẽ xuất hiện lung linh tại đây..."}&rdquo;
                </p>
              </div>

              {/* Customizer: Mascot & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Mascot Buggy Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Biểu cảm Mascot Buggy:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {BUGGY_MOODS.map((mood) => (
                      <button
                        key={mood.index}
                        type="button"
                        onClick={() => setMascotIndex(mood.index)}
                        className={`p-1 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          mascotIndex === mood.index
                            ? "bg-[#fac775]/40 border-2 border-[#993c1d] scale-105 shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 border border-slate-200"
                        }`}
                        title={mood.label}
                      >
                        <Image
                          src={`/assets/buggy/${mood.index}.png`}
                          alt={mood.label}
                          width={26}
                          height={26}
                          className="object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Theme Picker */}
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#0091ea]" />
                    <span>Phong cách thiệp:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setTheme("classic")}
                      className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        theme === "classic"
                          ? "bg-[#993c1d] text-white border border-[#fac775]"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      🏮 Cổ Điển
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("tech")}
                      className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        theme === "tech"
                          ? "bg-[#0091ea] text-white border border-[#00f5d4]"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      🚀 Tech
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("gold")}
                      className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        theme === "gold"
                          ? "bg-[#712b13] text-[#fac775] border border-[#fac775]"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      👑 Hoàng Kim
                    </button>
                  </div>
                </div>
              </div>

              {/* Field: Consent Checkbox */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    id="consent-checkbox"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#993c1d] focus:ring-[#993c1d] accent-[#993c1d]"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    Tôi đồng ý hiển thị ước mơ lên màn hình ngày hội và cùng lan toả tinh thần <strong>FU-DEVER</strong>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-dream"
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#712b13] to-[#993c1d] hover:opacity-95 text-white font-black text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(153,60,29,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

        {/* STEP 3: THANK YOU & CELEBRATION SCREEN */}
        {step === "thankyou" && createdDream && (
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(153,60,29,0.08)] border border-[#fac775]/50 backdrop-blur-xl text-center animate-in zoom-in-95 duration-300">
            {/* Success Mascot */}
            <div className="relative mx-auto w-20 h-20 mb-3 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#faeeda] border-2 border-[#fac775] text-[#993c1d] flex items-center justify-center shadow-lg">
                <Image
                  src={`/assets/buggy/${createdDream.mascotIndex || 1}.png`}
                  alt="Buggy Happy"
                  width={48}
                  height={48}
                  className="object-contain animate-bounce"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fac775]/30 text-[#712b13] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#993c1d]" />
              <span>Thành công rực rỡ</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#993c1d] mb-2 font-display">
              Ước Mơ Đã Bay Lên! 🏮
            </h2>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed max-w-sm mx-auto">
              Cảm ơn <strong>{createdDream.name || "bạn"}</strong> đã gửi gắm ước mơ. Hãy nhìn lên màn hình tại gian hàng để ngắm chiếc đèn lồng của mình nhé!
            </p>

            {/* Snippet Card */}
            <div className="bg-[#12203A] border border-[#fac775]/40 rounded-2xl p-4 text-left mb-4 text-[#faeeda] shadow-inner relative overflow-hidden">
              <div className="text-[11px] text-[#fac775] font-bold mb-1 flex items-center justify-between">
                <span>{createdDream.name || "Ẩn danh"}</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
                  {DREAM_CATEGORIES.find((c) => c.id === createdDream.tag)?.emoji}{" "}
                  {DREAM_CATEGORIES.find((c) => c.id === createdDream.tag)?.shortLabel}
                </span>
              </div>
              <p className="text-sm font-medium italic text-white line-clamp-3">
                &ldquo;{createdDream.content}&rdquo;
              </p>
            </div>

            {/* Live Reaction Bar */}
            <ReactionBar />

            {/* Action Buttons */}
            <div className="space-y-2.5 mt-5">
              <button
                id="btn-view-card"
                onClick={() => setShowCardModal(true)}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#993c1d] to-[#fac775] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Xem & Tải Dream Card (Story 9:16)</span>
              </button>

              <button
                onClick={resetForm}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Gửi thêm một ước mơ khác</span>
              </button>
            </div>

            {/* Club Social Footnote */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <HeartHandshake className="w-3.5 h-3.5 text-[#993c1d]" />
              <span>Chào mừng bạn đến với đại gia đình <strong>FU-DEVER</strong>!</span>
            </div>
          </div>
        )}
      </div>

      {/* Dream Card Modal */}
      {createdDream && (
        <DreamCardModal
          dream={createdDream}
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
        />
      )}
    </div>
  );
}
