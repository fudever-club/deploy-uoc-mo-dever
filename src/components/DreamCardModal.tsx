"use client";

import React, { useEffect, useState } from "react";
import { Dream, CardTheme } from "@/types/dream";
import { BUGGY_MOODS } from "@/lib/constants";
import { downloadDreamCard, renderDreamCardToDataUrl } from "@/lib/dream-card-canvas";
import { Download, Share2, X, Sparkles, Check, Palette } from "lucide-react";
import Image from "next/image";

interface DreamCardModalProps {
  dream: Dream;
  isOpen: boolean;
  onClose: () => void;
}

export const DreamCardModal: React.FC<DreamCardModalProps> = ({ dream, isOpen, onClose }) => {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(dream.theme || "classic");
  const [selectedMascot, setSelectedMascot] = useState<number>(dream.mascotIndex || 1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && dream) {
      setLoading(true);
      const customizedDream: Dream = {
        ...dream,
        theme: selectedTheme,
        mascotIndex: selectedMascot,
      };

      renderDreamCardToDataUrl(customizedDream)
        .then((url) => {
          setImageUrl(url);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to render dream card:", err);
          setLoading(false);
        });
    }
  }, [isOpen, dream, selectedTheme, selectedMascot]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (imageUrl) {
      const fileName = `Dream_Card_${dream.name ? dream.name.replace(/\s+/g, "_") : "FU_DEVER"}_${selectedTheme}_2026.png`;
      downloadDreamCard(imageUrl, fileName);
    }
  };

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText("#FUDEVER #ClubDay2026 #DeployUocMo");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12203A] border border-[#fac775]/40 rounded-3xl shadow-2xl p-4 sm:p-6 text-[#faeeda] max-h-[96vh] flex flex-col overflow-y-auto">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fac775]/20 text-[#fac775] text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Story Card Studio (9:16)</span>
          </div>
          <h3 className="text-lg font-extrabold text-white">Thiệp Ước Mơ Cá Nhân Hoá</h3>
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
                onClick={() => setSelectedTheme("classic")}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                onClick={() => setSelectedTheme("tech")}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                onClick={() => setSelectedTheme("gold")}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                  onClick={() => setSelectedMascot(mood.index)}
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

        {/* Card Preview Container */}
        <div className="relative flex-1 min-h-[300px] max-h-[440px] overflow-hidden rounded-2xl border border-[#fac775]/30 bg-[#070d17]/80 flex items-center justify-center p-2 shadow-inner">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 border-3 border-[#fac775] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#fac775]">Đang render thiệp HD...</p>
            </div>
          ) : imageUrl ? (
            <div className="relative h-full aspect-[9/16] shadow-2xl rounded-xl overflow-hidden border border-[#fac775]/40 animate-in fade-in zoom-in-95 duration-200">
              <Image
                src={imageUrl}
                alt="Dream Card Preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <p className="text-xs text-red-400">Không thể tạo ảnh, vui lòng thử lại.</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={handleDownload}
            disabled={loading || !imageUrl}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#0091ea] to-[#fac775] hover:opacity-90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải Ảnh Về Máy (Chuẩn HD Story 9:16)</span>
          </button>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={handleCopyHashtags}
              className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-[#fac775] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Đã copy Hashtags!" : "Copy Hashtags Story"}</span>
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
