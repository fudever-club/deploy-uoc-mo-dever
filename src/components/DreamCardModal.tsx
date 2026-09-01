"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Share2,
  Sparkles,
  Check,
  Eye,
  Scroll,
  Plane,
  ExternalLink,
} from "lucide-react";
import { Dream, CardTheme } from "@/types/dream";
import {
  DEVER_STAMPS,
  getBuggyMascotUrl,
} from "@/lib/constants";
import {
  renderDreamCardToDataUrl,
  renderBoardingPassCardToDataUrl,
  downloadDreamCard,
} from "@/lib/dream-card-canvas";
import { playTactileClick } from "@/lib/audio-synthesizer";

interface DreamCardModalProps {
  dream: Dream;
  isOpen: boolean;
  onClose: () => void;
}

export const DreamCardModal: React.FC<DreamCardModalProps> = ({
  dream,
  isOpen,
  onClose,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>((dream.theme as CardTheme) || "classic");
  const [selectedMascot, setSelectedMascot] = useState<string>(String(dream.mascotIndex || "11"));
  const [selectedStamp, setSelectedStamp] = useState<string>(dream.stampVariant || "lantern");
  const [cardFormat, setCardFormat] = useState<"boarding_pass" | "postcard">("boarding_pass");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);

  // Render high-res 9:16 Canvas preview whenever customization changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPreview(true);

    const generatePreview = async () => {
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

        if (isMounted) {
          setPreviewDataUrl(dataUrl);
          setIsLoadingPreview(false);
        }
      } catch (err) {
        console.error("Preview generation error:", err);
        if (isMounted) setIsLoadingPreview(false);
      }
    };

    const timer = setTimeout(generatePreview, 120);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [dream, selectedTheme, selectedMascot, selectedStamp, cardFormat]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  /**
   * Share / Post to Facebook Story & Feed
   */
  const handleFacebookShare = async () => {
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

      // 1. Download card automatically
      const fileName = cardFormat === "boarding_pass" ? "Boarding_Pass_FU_DEVER_K22.png" : "Dream_Card_FU_DEVER_2026.png";
      downloadDreamCard(dataUrl, fileName);

      // 2. Copy caption & hashtags to clipboard
      const caption = `🏮 Ước mơ của tôi tại Ngày hội FU-DEVER 2026: "${dream.content}"\n🚀 Cùng cất cánh với CLB Lập trình FU-DEVER!\n#FUDEVER #ClubDay2026 #DeployUocMo #FPTU_DaNang`;
      await navigator.clipboard.writeText(caption);
      setCopied(true);

      // 3. Try Web Share API with File (Mobile devices - opens native Facebook/Instagram)
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Ước mơ & Vé lên tàu FU-DEVER Club Day 2026",
            text: caption,
            files: [file],
          });
          setShareNotice("✅ Đã mở bảng chia sẻ ứng dụng!");
          setTimeout(() => setShareNotice(null), 3500);
          return;
        }
      } catch {
        // Continue to direct Facebook web opener
      }

      // 4. Open Facebook Story Creator / Web Sharer in a new tab
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const fbUrl = isMobile
        ? "https://m.facebook.com/stories/create"
        : "https://www.facebook.com/stories/create";

      window.open(fbUrl, "_blank", "noopener,noreferrer");

      setShareNotice("✅ Đã lưu ảnh Story HD & sao chép caption! Đang mở Facebook Story...");
      setTimeout(() => {
        setCopied(false);
        setShareNotice(null);
      }, 4000);
    } catch (err) {
      console.error("Facebook share error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Universal Web Share / Copy Link
   */
  const handleUniversalShare = async () => {
    playTactileClick();
    try {
      const caption = `🏮 Ước mơ của tôi tại Ngày hội FU-DEVER 2026: "${dream.content}"\n🚀 #FUDEVER #ClubDay2026 #DeployUocMo #FPTU_DaNang\n🌐 https://fudever.com`;
      const currentUrl = typeof window !== "undefined" ? window.location.origin : "https://fudever.com";

      if (navigator.share) {
        await navigator.share({
          title: "Deploy Ước Mơ — FU-DEVER Club Day 2026",
          text: caption,
          url: currentUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(`${caption}\n${currentUrl}`);
      setCopied(true);
      setShareNotice("✅ Đã sao chép link & hashtag vào bộ nhớ tạm!");
      setTimeout(() => {
        setCopied(false);
        setShareNotice(null);
      }, 3000);
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto overflow-x-hidden">
      <div className="relative w-full max-w-4xl bg-[#12203A] border-2 border-[#fac775]/50 rounded-2xl sm:rounded-3xl shadow-2xl p-3.5 sm:p-6 text-[#faeeda] my-auto max-w-full overflow-x-hidden">
        {/* Modal Header & Close Button */}
        <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4 relative">
          <div className="flex-1 min-w-0 pr-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fac775]/20 text-[#fac775] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 border border-[#fac775]/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Story Card Studio (9:16)</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white font-display leading-tight">
              Thiệp Ước Mơ & Vé Lên Tàu Vũ Trụ K22
            </h3>
            <p className="text-[11px] sm:text-xs text-[#faeeda]/80 mt-0.5">
              Tùy biến phong cách thẻ & lưu ảnh chất lượng cao đăng Story Instagram / Facebook / TikTok
            </p>
          </div>

          <button
            id="btn-close-card-modal"
            onClick={onClose}
            className="relative z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {shareNotice && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{shareNotice}</span>
          </div>
        )}

        {/* 2-COLUMN / MOBILE-FIRST LAYOUT: PREVIEW ON TOP FOR MOBILE, CUSTOMIZER AS CHIPS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-6 items-start">
          {/* WYSIWYG REAL-TIME PREVIEW (First on Mobile, Right on Desktop) */}
          <div className="md:col-span-5 order-first md:order-last flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-none aspect-[9/16] max-h-[360px] sm:max-h-[520px] rounded-2xl border-2 border-[#fac775]/60 bg-[#060c18] flex items-center justify-center p-1.5 sm:p-2 shadow-2xl overflow-hidden">
              {isLoadingPreview && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75 z-20 backdrop-blur-xs">
                  <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
                  <span className="text-[11px] text-amber-200 font-bold">Đang cập nhật thiệp...</span>
                </div>
              )}

              {previewDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewDataUrl}
                  alt="Story Card Preview"
                  className="w-auto h-full max-h-[350px] sm:max-h-[500px] aspect-[9/16] object-contain rounded-xl shadow-2xl transition-all duration-200 animate-in zoom-in-95 fade-in select-none"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Eye className="w-8 h-8 opacity-40" />
                  <span className="text-xs">Đang tải bản xem trước...</span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-[#fac775]/80 font-mono mt-1 text-center">
              ✦ Chuẩn Story 9:16 (1080×1920) ✦
            </span>
          </div>

          {/* CUSTOMIZATION CONTROLS */}
          <div className="md:col-span-7 space-y-3 sm:space-y-4 text-left">
            {/* 1. Format Switcher */}
            <div>
              <label className="block text-[11px] font-bold text-[#fac775] uppercase tracking-wider mb-1">
                1. Định dạng thẻ (9:16):
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setCardFormat("boarding_pass");
                  }}
                  className={`min-h-[40px] py-1.5 px-2 rounded-lg text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    cardFormat === "boarding_pass"
                      ? "bg-gradient-to-r from-[#0091ea] to-[#00f5d4] text-[#051329] shadow-md scale-[1.01]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Vé Tàu Vũ Trụ</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setCardFormat("postcard");
                  }}
                  className={`min-h-[40px] py-1.5 px-2 rounded-lg text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    cardFormat === "postcard"
                      ? "bg-gradient-to-r from-[#993c1d] via-[#fac775] to-[#993c1d] text-[#12203A] shadow-md scale-[1.01]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <Scroll className="w-3.5 h-3.5" />
                  <span>Thiệp Hoa Đăng</span>
                </button>
              </div>
            </div>

            {/* 2. Theme Selector */}
            <div>
              <label className="block text-[11px] font-bold text-[#fac775] uppercase tracking-wider mb-1">
                🎨 2. Màu sắc chủ đạo:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "classic" as CardTheme, label: "Gấm Đỏ", color: "from-[#993c1d] to-[#712b13]", border: "border-[#fac775]" },
                  { id: "tech" as CardTheme, label: "Cyber", color: "from-[#0055a5] to-[#0091ea]", border: "border-[#00f5d4]" },
                  { id: "gold" as CardTheme, label: "Hoàng Kim", color: "from-[#b8860b] via-[#ffd166] to-[#b8860b]", border: "border-[#ffe8a3]" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      playTactileClick();
                      setSelectedTheme(t.id);
                    }}
                    className={`min-h-[40px] py-1.5 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border cursor-pointer ${
                      selectedTheme === t.id
                        ? `bg-gradient-to-r ${t.color} text-white ${t.border} shadow-md scale-[1.02] ring-2 ring-white/30`
                        : "bg-white/5 text-[#faeeda]/80 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {t.id === "classic" && "🏮 "}
                    {t.id === "tech" && "🚀 "}
                    {t.id === "gold" && "👑 "}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Mascot Buggy Picker (Horizontal Scroll on mobile) */}
            <div>
              <label className="block text-[11px] font-bold text-[#fac775] uppercase tracking-wider mb-1">
                3. Linh vật Buggy:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                {[
                  { id: "11", label: "Thả Tim ❤️", src: "/assets/buggy/11.png" },
                  { id: "19", label: "Bắn Tim 🥰", src: "/assets/buggy/19.png" },
                  { id: "04_buggy_chu_cuoi_coder.png", label: "Chú Cuội", src: "/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png" },
                  { id: "10_buggy_hang_nga_fairy.png", label: "Hằng Nga", src: "/assets/buggy/trung-thu/10_buggy_hang_nga_fairy.png" },
                  { id: "01_buggy_lantern_parade.png", label: "Rước Đèn", src: "/assets/buggy/trung-thu/01_buggy_lantern_parade.png" },
                  { id: "02_buggy_mooncake_feast.png", label: "Ăn Bánh", src: "/assets/buggy/trung-thu/02_buggy_mooncake_feast.png" },
                  { id: "03_buggy_lion_dance.png", label: "Múa Lân", src: "/assets/buggy/trung-thu/03_buggy_lion_dance.png" },
                  { id: "05_buggy_moon_rabbit_hug.png", label: "Thỏ Ngọc", src: "/assets/buggy/trung-thu/05_buggy_moon_rabbit_hug.png" },
                  { id: "6", label: "Cool Ngầu 😎", src: "/assets/buggy/6.png" },
                  { id: "8", label: "Cà Phê ☕", src: "/assets/buggy/8.png" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      playTactileClick();
                      setSelectedMascot(m.id);
                    }}
                    className={`min-w-[54px] min-h-[50px] p-1 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all cursor-pointer shrink-0 ${
                      selectedMascot === m.id
                        ? "bg-[#fac775]/30 border-[#fac775] ring-2 ring-[#fac775]/60 scale-105"
                        : "bg-white/5 border-white/10 hover:bg-white/10 opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getBuggyMascotUrl(m.id)}
                      alt={m.label}
                      className="w-6 h-6 object-contain drop-shadow-xs"
                    />
                    <span className="text-[9px] font-bold text-slate-200 truncate w-full text-center">
                      {m.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. DEVER Seal & Stamp Selector */}
            <div>
              <label className="block text-[11px] font-bold text-[#fac775] uppercase tracking-wider mb-1">
                🔏 4. Con dấu DEVER:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {DEVER_STAMPS.map((stamp) => (
                  <button
                    key={stamp.id}
                    onClick={() => {
                      playTactileClick();
                      setSelectedStamp(stamp.id);
                    }}
                    className={`min-h-[44px] p-1.5 sm:p-2 rounded-xl flex items-center gap-1.5 border text-left transition-all cursor-pointer ${
                      selectedStamp === stamp.id
                        ? "bg-white/20 border-[#fac775] ring-2 ring-[#fac775]/50 shadow-md"
                        : "bg-white/5 border-white/10 hover:bg-white/10 opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stamp.image}
                      alt={stamp.label}
                      className="w-6 h-6 object-contain drop-shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-[11px] font-bold text-white truncate">{stamp.label}</div>
                      <div className="text-[8px] sm:text-[9px] text-[#faeeda]/60 truncate">{stamp.sublabel}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                {/* 1. Download Story HD */}
                <button
                  id="btn-download-dream-card"
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="flex-1 min-h-[48px] py-3 px-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#0091ea] to-[#fac775] hover:opacity-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu ảnh...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Lưu Ảnh Story (HD)</span>
                    </>
                  )}
                </button>

                {/* 2. Direct Facebook Share / Story */}
                <button
                  id="btn-share-facebook-story"
                  onClick={handleFacebookShare}
                  disabled={isExporting}
                  className="min-h-[48px] py-3 px-3.5 rounded-xl sm:rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer shrink-0"
                  title="Tải ảnh và mở Facebook Story"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Story FB</span>
                </button>
              </div>

              {/* 3. Secondary Universal Share / Copy */}
              <button
                onClick={handleUniversalShare}
                className="w-full min-h-[38px] py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#faeeda] font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Đã sao chép caption & link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#fac775]" />
                    <span>Chia sẻ Zalo / Instagram / TikTok (Sao chép)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
