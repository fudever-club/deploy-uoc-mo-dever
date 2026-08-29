"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Sparkles, Monitor, Shield, QrCode, Trophy, Info } from "lucide-react";
import { StandeeQRModal } from "./StandeeQRModal";
import { AboutModal } from "./AboutModal";
import { playTactileClick } from "@/lib/audio-synthesizer";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // In display mode, hide the top navbar for clean fullscreen presentation
  if (pathname === "/display") {
    return null;
  }

  return (
    <>
      <header suppressHydrationWarning className="w-full sticky top-2 sm:top-3 z-40 px-2 sm:px-4 transition-all max-w-full overflow-hidden">
        <div suppressHydrationWarning className="max-w-5xl mx-auto h-13 sm:h-14 px-2 sm:px-4 rounded-full bg-white/95 backdrop-blur-xl border border-[#fac775]/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-between gap-1">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#993c1d] to-[#12203a] shadow-xs p-1 border border-[#fac775]/50 group-hover:scale-105 transition-transform">
              <Image
                src="/assets/logo/logo-dever-white.png"
                alt="FU-DEVER Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 leading-none">
                <span className="font-extrabold text-[11px] sm:text-xs tracking-wider text-[#993c1d] font-display">FU-DEVER</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#fac775] text-[#712b13]">K22</span>
              </div>
              <span className="hidden md:inline-block text-[10px] font-medium text-slate-500 tracking-tight">Deploy Ước Mơ</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            <Link
              href="/"
              className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
                pathname === "/"
                  ? "bg-gradient-to-r from-[#993c1d] to-[#712b13] text-white shadow-sm"
                  : "text-slate-600 hover:text-[#993c1d] hover:bg-[#fac775]/20"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Gửi ước mơ</span>
              <span className="sm:hidden text-[11px]">Gửi</span>
            </Link>

            <Link
              href="/display"
              className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
                pathname === "/display"
                  ? "bg-[#fac775] text-[#12203a] shadow-sm"
                  : "text-slate-600 hover:text-[#993c1d] hover:bg-[#fac775]/20"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-[#0091ea] shrink-0" />
              <span className="hidden sm:inline">Bầu trời</span>
              <span className="sm:hidden text-[11px]">Sky</span>
            </Link>

            <Link
              href="/standee"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold items-center gap-1 transition-all hidden xs:flex ${
                pathname === "/standee"
                  ? "bg-[#0091ea] text-white"
                  : "text-slate-600 hover:text-[#0091ea] hover:bg-slate-100"
              }`}
              title="Poster Standee"
            >
              <QrCode className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Standee</span>
            </Link>

            <Link
              href="/admin/lucky-draw"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold items-center gap-1 transition-all hidden sm:flex ${
                pathname === "/admin/lucky-draw"
                  ? "bg-amber-500 text-white"
                  : "text-slate-600 hover:text-amber-700 hover:bg-slate-100"
              }`}
              title="Vòng quay may mắn"
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Minigame</span>
            </Link>

            {/* Official About FU-DEVER Trigger Button */}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setShowAboutModal(true);
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-[#993c1d] hover:bg-slate-100 flex items-center gap-1 transition-all cursor-pointer"
              title="Về CLB Lập Trình FU-DEVER"
              aria-label="Về CLB FU-DEVER"
            >
              <Info className="w-3.5 h-3.5 text-[#993c1d] shrink-0" />
              <span className="hidden md:inline">Về CLB</span>
            </button>

            <Link
              href="/admin"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                pathname === "/admin"
                  ? "bg-[#12203a] text-[#fac775]"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
              title="Quản trị viên"
              aria-label="Admin"
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Admin</span>
            </Link>
          </nav>
        </div>
      </header>

      <StandeeQRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
    </>
  );
};
