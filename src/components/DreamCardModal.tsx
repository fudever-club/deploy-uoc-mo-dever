"use client";

import React, { useState, useEffect } from "react";
import { Dream, CardTheme } from "@/types/dream";
import { getBuggyMascotUrl, DEVER_STAMPS } from "@/lib/constants";
import { downloadDreamCard, renderDreamCardToDataUrl, renderBoardingPassCardToDataUrl } from "@/lib/dream-card-canvas";
import { playTactileClick } from "@/lib/audio-synthesizer";
import { Download, Share2, X, Sparkles, Check, Palette, Ticket, Layers, Stamp, Eye } from "lucide-react";
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
  { id: "trung-thu/01_buggy_lantern_parade.png", label: "Rước Đèn", src: "/assets/buggy/trung-thu/01_buggy_lantern_parade.png" },
  { id: "trung-thu/02_buggy_mooncake_feast.png", label: "Ăn Bánh", src: "/assets/buggy/trung-thu/02_buggy_mooncake_feast.png" },
  { id: "trung-thu/03_buggy_lion_dance.png", label: "Múa Lân", src: "/assets/buggy/trung-thu/03_buggy_lion_dance.png" },
  { id: "trung-thu/05_buggy_moon_rabbit_hug.png", label: "Thỏ Ngọc", src: "/assets/buggy/trung-thu/05_buggy_moon_rabbit_hug.png" },
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
  const [selectedStamp, setSelectedStamp] = useState<string>(dream.stampVariant || "lantern");
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate Master HD 1080x1920 Story Card Preview
  useEffect(() => {
    if (!isOpen || !dream) return;
    let active = true;
    setIsLoadingPreview(true);

    const customizedDream: Dream = {
      ...dream,
      theme: selectedTheme,
      mascotIndex: selectedMascot,
      stampVariant: selectedStamp,
    };

    const generatePreview = async () => {
      try {
        // Always render at master 1080x1920 to maintain exact layout geometry
        const url =
          cardFormat === "boarding_pass"
            ? await renderBoardingPassCardToDataUrl(customizedDream, { width: 1080, height: 1920 })
            : await renderDreamCardToDataUrl(customizedDream, { width: 1080, height: 1920 });
        if (active) {
          setPreviewDataUrl(url);
          setIsLoadingPreview(false);
        }
      } catch (err) {
        console.error("Preview render failed:", err);
        if (active) setIsLoadingPreview(false);
      }
    };

    generatePreview();
    return () => {
      active = false;
    };
  }, [isOpen, dream, cardFormat, selectedTheme, selectedMascot, selectedStamp]);

  if (!isOpen || !dream) return null;

  const handleDownload = async () => {
    playTactileClick();
    setIsExporting(true);
    try {
      const customizedDream: Dream = {
        ...dream,
        theme: selectedTheme,
        mascotIndex: selectedMascot,
        stampVariant: selectedStamp,
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
        stampVariant: selectedStamp,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#12203A] border-2 border-[#fac775]/50 rounded-3xl shadow-2xl p-4 sm:p-6 text-[#faeeda] my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors cursor-pointer z-30"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center md:text-left mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fac775]/20 text-[#fac775] text-[11px] font-bold uppercase tracking-wider mb-1 border border-[#fac775]/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Story Card Studio (9:16)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-display">
            Thiệp Ước Mơ & Vé Lên Tàu Vũ Trụ K22
          </h3>
          <p className="text-xs text-[#faeeda]/80">
            Tùy biến phong cách thẻ & lưu ảnh chất lượng cao đăng Story Instagram / Facebook / TikTok
          </p>
        </div>

        {/* 2-COLUMN RESPONSIVE LAYOUT (CONTROLS ON LEFT, PREVIEW ON RIGHT) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: CUSTOMIZATION CONTROLS */}
          <div className="md:col-span-7 space-y-3.5 flex flex-col justify-between">
            {/* Format Switcher */}
            <div>
              <span className="block text-[11px] font-bold text-[#fac775] uppercase tracking-wider mb-1.5">
                1. Chọn định dạng thẻ (9:16):
              </span>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/10 border border-[#fac775]/30">
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
            </div>

            {/* Customization Options Container */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10 space-y-3">
              {/* Theme Selector */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#fac775] uppercase tracking-wider mb-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>2. Chọn phong cách màu sắc:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setSelectedTheme("classic");
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      selectedTheme === "classic"
                        ? "bg-gradient-to-r from-[#993c1d] to-[#712b13] text-white border border-[#fac775] shadow-xs"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <span>🏮</span>
                    <span>Thư Gấm Đỏ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setSelectedTheme("tech");
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      selectedTheme === "tech"
                        ? "bg-gradient-to-r from-[#0091ea] to-[#0055a5] text-white border border-[#00f5d4] shadow-xs"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <span>🚀</span>
                    <span>Cyber Space</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setSelectedTheme("gold");
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                <span className="block text-[11px] font-bold text-[#fac775] uppercase tracking-wider mb-1.5">
                  3. Chọn linh vật Buggy gắn kèm:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
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
                      <span className="text-[9px] text-[#faeeda] font-medium truncate max-w-[56px]">
                        {mood.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DEVER Stamp Selector */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#fac775] uppercase tracking-wider mb-1.5">
                  <Stamp className="w-3.5 h-3.5" />
                  <span>4. Chọn con dấu DEVER đóng mộc:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {DEVER_STAMPS.map((stamp) => (
                    <button
                      key={stamp.id}
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        setSelectedStamp(stamp.id);
                      }}
                      className={`p-1.5 rounded-xl border flex items-center gap-1.5 text-left transition-all cursor-pointer ${
                        selectedStamp === stamp.id
                          ? "bg-[#fac775]/25 border-[#fac775] shadow-xs scale-[1.02] ring-1 ring-[#fac775]"
                          : "bg-white/5 border-transparent hover:bg-white/10 opacity-75 hover:opacity-100"
                      }`}
                      title={stamp.sublabel}
                    >
                      <Image
                        src={stamp.image}
                        alt={stamp.label}
                        width={26}
                        height={26}
                        className="object-contain shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="text-[10px] font-black text-white truncate">{stamp.label}</div>
                        <div className="text-[8px] text-slate-300 truncate">{stamp.sublabel}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#0091ea] to-[#fac775] hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xuất ảnh Story HD...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Lưu Ảnh Story (1080x1920)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-[#faeeda] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Đã chép hashtag!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-[#fac775]" />
                    <span>Chia Sẻ Story</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: 100% WYSIWYG REAL-TIME PREVIEW */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[9/16] max-h-[480px] sm:max-h-[540px] rounded-2xl border-2 border-[#fac775]/50 bg-[#060c18] flex items-center justify-center p-2 shadow-2xl overflow-hidden">
              {isLoadingPreview && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 z-20 backdrop-blur-xs">
                  <Sparkles className="w-7 h-7 text-amber-400 animate-spin" />
                  <span className="text-xs text-amber-200 font-bold">Đang kiến tạo thẻ Story HD...</span>
                </div>
              )}

              {previewDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewDataUrl}
                  alt="Story Card Preview"
                  className="w-auto h-full max-h-[510px] aspect-[9/16] object-contain rounded-xl shadow-2xl transition-all duration-300 animate-in zoom-in-95 fade-in select-none"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Eye className="w-8 h-8 opacity-40" />
                  <span className="text-xs">Đang tải bản xem trước...</span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-[#fac775]/70 font-mono mt-1.5 text-center">
              ✦ Chuẩn tỷ lệ 9:16 (1080x1920) Instagram / Facebook / TikTok Story ✦
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
