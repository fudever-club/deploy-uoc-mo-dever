"use client";

import React, { useState } from "react";
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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
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
    <div className="min-h-full flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 bg-radial from-[#fffbf4] via-[#fff8eb] to-[#f7efe1]">
      <div className="w-full max-w-lg mx-auto">
        {/* STEP 1: INTRO SCREEN */}
        {step === "intro" && (
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border border-[#fac775]/40 backdrop-blur-md text-center animate-in fade-in zoom-in-95 duration-300">
            {/* Mascot / Icon Badge */}
            <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#fac775]/40 via-[#0091ea]/20 to-[#993c1d]/20 rounded-full animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-[#993c1d] to-[#712b13] p-1.5 shadow-md flex items-center justify-center border-2 border-[#fac775]">
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fac775]/25 text-[#712b13] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#993c1d]" />
              <span>FU-DEVER Club Day 2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#993c1d] tracking-tight mb-2">
              Deploy Ước Mơ 🏮
            </h1>

            <p className="text-sm text-[#5f5e5a] mb-6 leading-relaxed">
              Chào mừng tân sinh viên <strong>K22</strong> đến với gian hàng <strong>FU-DEVER</strong>! Hãy gửi gắm ước mơ của bạn bay lên bầu trời đêm và nhận ngay <strong>Dream Card</strong> độc quyền.
            </p>

            {/* Highlight Box */}
            <div className="bg-[#faeeda]/60 border border-[#fac775]/50 rounded-2xl p-4 text-left mb-6 text-xs text-[#712b13] space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-base">🚀</span>
                <span>Ước mơ hiển thị tức thì lên <strong>màn hình Bầu Trời Đèn Lồng</strong> tại gian hàng.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">✨</span>
                <span>Nhận ngay <strong>Dream Card (Story 9:16)</strong> cá nhân hoá xinh đẹp để lưu kỷ niệm.</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              id="btn-start-dream"
              onClick={() => setStep("form")}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#b84a26] to-[#fac775] text-white font-bold text-base shadow-lg shadow-[#993c1d]/25 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Bắt đầu viết ước mơ</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 2: FORM SCREEN */}
        {step === "form" && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border border-[#fac775]/40 backdrop-blur-md animate-in fade-in duration-300"
          >
            <div className="flex items-center justify-between mb-5 border-b border-[#fac775]/20 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-[#993c1d] flex items-center gap-2">
                  <span>Gửi gắm ước mơ</span>
                  <span className="text-base">🏮</span>
                </h2>
                <p className="text-xs text-[#5f5e5a]">Thắp sáng ước mơ của bạn tại gian hàng</p>
              </div>
              <button
                type="button"
                onClick={() => setStep("intro")}
                className="text-xs text-[#5f5e5a] hover:text-[#993c1d] transition-colors cursor-pointer"
              >
                Quay lại
              </button>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Field: Name */}
            <div className="mb-4">
              <label htmlFor="name-input" className="block text-xs font-bold text-[#2c2c2a] uppercase tracking-wider mb-1.5">
                Tên của bạn <span className="text-[#5f5e5a] font-normal lowercase">(tuỳ chọn)</span>
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nhật Minh K22 (có thể để trống để ẩn danh)"
                maxLength={40}
                className="w-full px-4 py-3 rounded-xl bg-[#fffbf4] border border-[#fac775]/60 focus:border-[#993c1d] focus:ring-2 focus:ring-[#993c1d]/20 outline-none text-sm transition-all placeholder:text-[#5f5e5a]/60"
              />
            </div>

            {/* Field: Quick Inspiration Prompts */}
            <div className="mb-4">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#712b13] uppercase tracking-wider mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Gợi ý chọn nhanh nội dung:</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                {INSPIRATION_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPrompt(p)}
                    className="px-2.5 py-1 rounded-lg bg-[#faeeda]/60 hover:bg-[#faeeda] border border-[#fac775]/40 text-[11px] text-[#712b13] shrink-0 transition-colors cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Wish Content */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="content-input" className="block text-xs font-bold text-[#2c2c2a] uppercase tracking-wider">
                  Nội dung ước mơ <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-[#5f5e5a]">{content.length}/300</span>
              </div>
              <textarea
                id="content-input"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="VD: Đạt GPA 3.6, làm đồ án tốt nghiệp xuất sắc và tham gia ban chuyên môn FU-DEVER..."
                maxLength={300}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#fffbf4] border border-[#fac775]/60 focus:border-[#993c1d] focus:ring-2 focus:ring-[#993c1d]/20 outline-none text-sm transition-all resize-none placeholder:text-[#5f5e5a]/60 leading-relaxed"
              />
            </div>

            {/* Field: Category Tags */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#2c2c2a] uppercase tracking-wider mb-2">
                Chủ đề ước mơ
              </label>
              <div className="flex flex-wrap gap-2">
                {DREAM_CATEGORIES.map((cat) => {
                  const isSelected = tag === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTag(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#993c1d] text-[#faeeda] shadow-xs border border-[#712b13] scale-102"
                          : "bg-[#faeeda]/50 text-[#5f5e5a] hover:bg-[#faeeda] border border-[#fac775]/40"
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field: Mascot Sticker & Theme Selection */}
            <div className="mb-5 bg-[#faeeda]/30 rounded-2xl p-3 border border-[#fac775]/30 space-y-3">
              {/* Mascot picker */}
              <div>
                <label className="block text-[11px] font-bold text-[#712b13] uppercase tracking-wider mb-1.5">
                  Chọn biểu cảm Buggy gắn cùng đèn lồng:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {BUGGY_MOODS.map((mood) => (
                    <button
                      key={mood.index}
                      type="button"
                      onClick={() => setMascotIndex(mood.index)}
                      className={`p-1 rounded-xl shrink-0 transition-all cursor-pointer border ${
                        mascotIndex === mood.index
                          ? "bg-[#fac775] border-[#993c1d] scale-110 shadow-xs"
                          : "bg-white/60 border-transparent hover:bg-white opacity-80"
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

              {/* Card Theme Picker */}
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold text-[#712b13] uppercase tracking-wider mb-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#0091ea]" />
                  <span>Màu sắc thiệp:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme("classic")}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      theme === "classic"
                        ? "bg-[#993c1d] text-white border border-[#fac775] shadow-xs"
                        : "bg-white/70 text-[#5f5e5a] border border-[#fac775]/30"
                    }`}
                  >
                    <span>🏮 Cổ Điển</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("tech")}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      theme === "tech"
                        ? "bg-[#0091ea] text-white border border-[#00f5d4] shadow-xs"
                        : "bg-white/70 text-[#5f5e5a] border border-[#fac775]/30"
                    }`}
                  >
                    <span>🚀 Tech Blue</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("gold")}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      theme === "gold"
                        ? "bg-[#712b13] text-[#fac775] border border-[#fac775] shadow-xs"
                        : "bg-white/70 text-[#5f5e5a] border border-[#fac775]/30"
                    }`}
                  >
                    <span>👑 Hoàng Kim</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Field: Consent Checkbox */}
            <div className="mb-6 bg-[#faeeda]/40 border border-[#fac775]/40 rounded-xl p-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  id="consent-checkbox"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#993c1d] focus:ring-[#993c1d] accent-[#993c1d]"
                />
                <span className="text-xs text-[#2c2c2a] leading-relaxed">
                  Tôi đồng ý hiển thị ước mơ lên màn hình ngày hội và cùng lan toả tinh thần <strong>FU-DEVER</strong>.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="btn-submit-dream"
              type="submit"
              disabled={isSubmitting || !content.trim() || !consent}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#993c1d] to-[#fac775] hover:from-[#712b13] hover:to-[#e5b360] text-white font-bold text-sm shadow-lg shadow-[#993c1d]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang thắp sáng ước mơ...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Thắp Sáng & Gửi Ước Mơ</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: THANK YOU SCREEN */}
        {step === "thankyou" && createdDream && (
          <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border border-[#fac775]/40 backdrop-blur-md text-center animate-in fade-in zoom-in-95 duration-300">
            {/* Success Mascot */}
            <div className="relative mx-auto w-20 h-20 mb-3 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#faeeda] border-2 border-[#fac775] text-[#993c1d] flex items-center justify-center shadow-md">
                <Image
                  src={`/assets/buggy/${createdDream.mascotIndex || 1}.png`}
                  alt="Buggy Happy"
                  width={48}
                  height={48}
                  className="object-contain animate-bounce"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fac775]/30 text-[#712b13] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#993c1d]" />
              <span>Thành công rực rỡ</span>
            </div>

            <h2 className="text-2xl font-extrabold text-[#993c1d] mb-2">
              Ước mơ đã bay lên! 🏮
            </h2>

            <p className="text-xs text-[#5f5e5a] mb-5 leading-relaxed max-w-sm mx-auto">
              Cảm ơn <strong>{createdDream.name || "bạn"}</strong> đã gửi gắm ước mơ. Hãy nhìn lên màn hình tại gian hàng để ngắm chiếc đèn lồng của mình nhé!
            </p>

            {/* Snippet Card */}
            <div className="bg-[#12203A] border border-[#fac775]/40 rounded-2xl p-4 text-left mb-6 text-[#faeeda] shadow-inner relative overflow-hidden">
              <div className="text-[11px] text-[#fac775] font-semibold mb-1 flex items-center justify-between">
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
            <div className="space-y-3 mt-4">
              <button
                id="btn-view-card"
                onClick={() => setShowCardModal(true)}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#993c1d] to-[#fac775] hover:from-[#712b13] hover:to-[#e5b360] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Xem & Tải Dream Card (Story 9:16)</span>
              </button>

              <button
                onClick={resetForm}
                className="w-full py-2.5 px-4 rounded-xl bg-[#faeeda]/50 hover:bg-[#faeeda] text-[#712b13] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Gửi thêm một ước mơ khác</span>
              </button>
            </div>

            {/* Club Social Footnote */}
            <div className="mt-6 pt-4 border-t border-[#fac775]/20 flex items-center justify-center gap-1.5 text-[11px] text-[#5f5e5a]">
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
