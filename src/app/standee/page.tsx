"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Download, QrCode, Sparkles, ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { EVENT_INFO } from "@/lib/constants";

export default function StandeeGeneratorPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageUrl, setPageUrl] = useState("");
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

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col items-center justify-center">
      {/* Top Controls (Hidden during print) */}
      <div className="w-full max-w-2xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/admin"
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#fac775] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang Admin</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0091ea]" />
            <span>Tải QR HD</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#993c1d] hover:bg-[#712b13] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Standee Poster</span>
          </button>
        </div>
      </div>

      {/* Standee Poster Preview (Print-Ready Layout 60x160 ratio) */}
      <div
        ref={posterRef}
        className="w-full max-w-md aspect-[1/2.2] bg-gradient-to-b from-[#12203A] via-[#712b13] to-[#12203A] border-4 border-[#fac775] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between text-center relative overflow-hidden text-[#faeeda]"
      >
        {/* Background decorative glowing moon & stars */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#fac775]/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#0091ea]/20 blur-2xl pointer-events-none" />

        {/* 1. Header & University Logos */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="relative w-12 h-12">
              <Image
                src="/assets/logo/logo-dever-white.png"
                alt="FU-DEVER Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#85b7eb]">
            CLB LẬP TRÌNH FU-DEVER · ĐẠI HỌC FPT ĐÀ NẴNG
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fac775]/20 text-[#fac775] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FPTU Club Day 2026</span>
          </div>

          <h1 className="text-3xl font-black text-[#fac775] tracking-tight drop-shadow-md">
            DEPLOY ƯỚC MƠ 🏮
          </h1>

          <p className="text-xs text-white/90 font-medium max-w-xs mx-auto">
            Thả đèn lồng ước mơ lên màn hình ngày hội và nhận ngay thiệp Story 9:16 độc quyền!
          </p>
        </div>

        {/* 2. Middle: Large Standee QR Code Frame */}
        <div className="relative z-10 my-4 bg-white/95 rounded-3xl p-5 shadow-2xl border-2 border-[#fac775] text-[#12203a] flex flex-col items-center">
          <div className="text-xs font-black uppercase tracking-wider text-[#993c1d] mb-2 flex items-center gap-1">
            <QrCode className="w-4 h-4" />
            <span>Quét Mã Tham Gia Ngay</span>
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

          <div className="mt-3 text-[10px] font-mono font-bold text-slate-500 truncate max-w-xs">
            {pageUrl}
          </div>
        </div>

        {/* 3. Three-Step Instruction Icons */}
        <div className="relative z-10 grid grid-cols-3 gap-2 text-left bg-black/30 rounded-2xl p-3 border border-[#fac775]/30">
          <div className="flex flex-col items-center text-center">
            <span className="text-lg mb-0.5">📱</span>
            <span className="text-[10px] font-bold text-[#fac775]">1. Quét QR</span>
            <span className="text-[9px] text-white/70">bằng camera điện thoại</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-lg mb-0.5">✍️</span>
            <span className="text-[10px] font-bold text-[#fac775]">2. Viết ước mơ</span>
            <span className="text-[9px] text-white/70">chọn biểu cảm Buggy</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-lg mb-0.5">🏮</span>
            <span className="text-[10px] font-bold text-[#fac775]">3. Thắp sáng</span>
            <span className="text-[9px] text-white/70">ngắm đèn lồng bay lên</span>
          </div>
        </div>

        {/* 4. Mascot Buggy Footer Accent */}
        <div className="relative z-10 pt-2 flex items-center justify-between border-t border-[#fac775]/30 text-left">
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
              <span className="text-[10px] font-bold text-[#fac775]">Thời gian & Địa điểm</span>
              <span className="text-[9px] text-white/80">{EVENT_INFO.eventDate} · {EVENT_INFO.eventLocation}</span>
            </div>
          </div>

          <span className="text-[10px] font-extrabold text-[#00f5d4]">
            #FUDEVER
          </span>
        </div>
      </div>
    </div>
  );
}
