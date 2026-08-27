"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Download, QrCode, Sparkles, ArrowLeft, Printer, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { EVENT_INFO } from "@/lib/constants";

export default function StandeeGeneratorPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageUrl, setPageUrl] = useState("");
  const [standeeTheme, setStandeeTheme] = useState<"daylight" | "night">("night");
  const posterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setPageUrl(`${origin}/`);
    fetch(`/api/qr?url=${encodeURIComponent(`${origin}/`)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQrDataUrl(data.qrDataUrl);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("QR load error:", err);
        setLoading(false);
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = "QR_Standee_Deploy_Uoc_Mo_1000px.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isDaylight = standeeTheme === "daylight";

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col items-center justify-center">
      {/* Top Controls (Hidden during print) */}
      <div className="w-full max-w-md mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/admin"
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#fac775] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Admin</span>
        </Link>

        {/* Theme Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-white/10 border border-white/20">
          <button
            onClick={() => setStandeeTheme("night")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              !isDaylight ? "bg-[#fac775] text-[#12203a] font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Đêm Hội</span>
          </button>
          <button
            onClick={() => setStandeeTheme("daylight")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              isDaylight ? "bg-[#0091ea] text-white font-bold" : "text-white/60 hover:text-white"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Nắng Sớm</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1 transition-colors cursor-pointer"
            title="Tải ảnh QR HD"
          >
            <Download className="w-4 h-4 text-[#0091ea]" />
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#993c1d] hover:bg-[#712b13] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Poster</span>
          </button>
        </div>
      </div>

      {/* Standee Poster Preview (Print-Ready Layout 60x160 ratio) */}
      <div
        ref={posterRef}
        className={`w-full max-w-md aspect-[1/2.2] border-4 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between text-center relative overflow-hidden transition-colors duration-500 ${
          isDaylight
            ? "bg-gradient-to-b from-[#e8f4fd] via-[#ffffff] to-[#e8f4fd] border-[#0091ea] text-[#12203a]"
            : "bg-gradient-to-b from-[#12203A] via-[#712b13] to-[#12203A] border-[#fac775] text-[#faeeda]"
        }`}
      >
        {/* Ambient Glow */}
        {isDaylight ? (
          <>
            <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-[#4fa3e3]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full bg-[#ffb800]/20 blur-3xl pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#fac775]/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#0091ea]/20 blur-2xl pointer-events-none" />
          </>
        )}

        {/* 1. TẦM MẮT (140-160cm): Header & Official Logo */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="relative w-14 h-14">
              <Image
                src={isDaylight ? "/assets/logo/logo-dever.png" : "/assets/logo/logo-dever-white.png"}
                alt="FU-DEVER Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className={`text-[11px] font-extrabold uppercase tracking-widest ${isDaylight ? "text-[#0055a5]" : "text-[#85b7eb]"}`}>
            CLB LẬP TRÌNH FU-DEVER · ĐẠI HỌC FPT ĐÀ NẴNG
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            isDaylight ? "bg-[#0091ea]/15 text-[#0055a5]" : "bg-[#fac775]/20 text-[#fac775]"
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>FPTU Club Day 2026</span>
          </div>

          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm ${
            isDaylight ? "text-[#0055a5]" : "text-[#fac775]"
          }`}>
            DEPLOY ƯỚC MƠ 🏮
          </h1>

          <p className={`text-xs font-medium max-w-xs mx-auto ${isDaylight ? "text-slate-600" : "text-white/90"}`}>
            Thả đèn lồng ước mơ lên màn hình ngày hội và nhận ngay thiệp Story 9:16 độc quyền!
          </p>
        </div>

        {/* 2. TẦM TAY (80-120cm): Grand QR Station & Buggy Mascot */}
        <div className={`relative z-10 my-3 rounded-3xl p-5 shadow-2xl border-2 text-[#12203a] flex flex-col items-center ${
          isDaylight
            ? "bg-white border-[#0091ea] shadow-[0_15px_35px_rgba(0,145,234,0.15)]"
            : "bg-white/95 border-[#fac775] shadow-[0_15px_35px_rgba(250,199,117,0.2)]"
        }`}>
          <div className="flex items-center justify-between w-full mb-2 px-1">
            <div className={`text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
              isDaylight ? "text-[#0055a5]" : "text-[#993c1d]"
            }`}>
              <QrCode className="w-4 h-4" />
              <span>Quét Mã Tham Gia Ngay</span>
            </div>

            <div className="relative w-7 h-7">
              <Image
                src="/assets/buggy/1.png"
                alt="Buggy Happy"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="bg-white p-2 rounded-2xl shadow-inner border border-slate-200">
            {loading ? (
              <div className="w-44 h-44 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-[#993c1d] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt="Standee QR"
                width={190}
                height={190}
                className="rounded-xl"
                unoptimized
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-xs text-red-500">
                Lỗi tải mã QR
              </div>
            )}
          </div>

          <div className="mt-2.5 text-[11px] font-mono font-bold text-slate-500 truncate max-w-xs">
            {pageUrl}
          </div>
        </div>

        {/* 3. Three-Step Guide */}
        <div className={`relative z-10 grid grid-cols-3 gap-2 text-left rounded-2xl p-3 border ${
          isDaylight
            ? "bg-slate-100/80 border-slate-200 text-slate-800"
            : "bg-black/30 border-[#fac775]/30 text-white"
        }`}>
          <div className="flex flex-col items-center text-center">
            <span className="text-lg mb-0.5">📱</span>
            <span className={`text-[10px] font-bold ${isDaylight ? "text-[#0055a5]" : "text-[#fac775]"}`}>
              1. Quét QR
            </span>
            <span className={`text-[9px] ${isDaylight ? "text-slate-500" : "text-white/70"}`}>
              mở camera điện thoại
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-lg mb-0.5">✍️</span>
            <span className={`text-[10px] font-bold ${isDaylight ? "text-[#0055a5]" : "text-[#fac775]"}`}>
              2. Viết ước mơ
            </span>
            <span className={`text-[9px] ${isDaylight ? "text-slate-500" : "text-white/70"}`}>
              chọn biểu cảm Buggy
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-lg mb-0.5">🏮</span>
            <span className={`text-[10px] font-bold ${isDaylight ? "text-[#0055a5]" : "text-[#fac775]"}`}>
              3. Thắp sáng
            </span>
            <span className={`text-[9px] ${isDaylight ? "text-slate-500" : "text-white/70"}`}>
              ngắm đèn lồng bay lên
            </span>
          </div>
        </div>

        {/* 4. TẦM CHÂN (20-60cm): Large URL & Metadata */}
        <div className={`relative z-10 pt-2 flex items-center justify-between border-t text-left ${
          isDaylight ? "border-slate-200" : "border-[#fac775]/30"
        }`}>
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <Image
                src="/assets/buggy/5.png"
                alt="Buggy Mascot"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] font-bold ${isDaylight ? "text-[#0055a5]" : "text-[#fac775]"}`}>
                {EVENT_INFO.eventDate}
              </span>
              <span className={`text-[9px] ${isDaylight ? "text-slate-600" : "text-white/80"}`}>
                {EVENT_INFO.eventLocation}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-sm font-black tracking-wider ${
              isDaylight ? "text-[#0091ea]" : "text-[#00f5d4]"
            }`}>
              FUDEVER.COM
            </span>
            <span className={`text-[9px] block ${isDaylight ? "text-slate-400" : "text-white/60"}`}>
              #DeployUocMo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
