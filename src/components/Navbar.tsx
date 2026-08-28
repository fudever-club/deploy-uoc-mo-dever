"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Sparkles, Monitor, Shield, QrCode, Trophy } from "lucide-react";
import { StandeeQRModal } from "./StandeeQRModal";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [showQRModal, setShowQRModal] = useState(false);

  // In display mode, hide the top navbar for clean fullscreen presentation
  if (pathname === "/display") {
    return null;
  }

  return (
    <>
      <header className="w-full sticky top-3 z-40 px-4 transition-all">
        <div className="max-w-4xl mx-auto h-14 px-4 rounded-full bg-white/85 backdrop-blur-xl border border-[#fac775]/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#993c1d] to-[#12203a] shadow-xs p-1 border border-[#fac775]/50 group-hover:scale-105 transition-transform">
              <Image
                src="/assets/logo/logo-dever-white.png"
                alt="FU-DEVER Logo"
                width={26}
                height={26}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-xs tracking-wider text-[#993c1d] font-display">FU-DEVER</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#fac775] text-[#712b13]">K22</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 tracking-tight">Deploy Ước Mơ</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                pathname === "/"
                  ? "bg-gradient-to-r from-[#993c1d] to-[#712b13] text-white shadow-sm"
                  : "text-slate-600 hover:text-[#993c1d] hover:bg-[#fac775]/20"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gửi ước mơ</span>
            </Link>

            <Link
              href="/display"
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                pathname === "/display"
                  ? "bg-[#fac775] text-[#12203a] shadow-sm"
                  : "text-slate-600 hover:text-[#993c1d] hover:bg-[#fac775]/20"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-[#0091ea]" />
              <span className="hidden sm:inline">Bầu trời</span>
              <span className="sm:hidden">Sky</span>
            </Link>

            <Link
              href="/standee"
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                pathname === "/standee"
                  ? "bg-[#0091ea] text-white"
                  : "text-slate-500 hover:text-[#0091ea] hover:bg-sky-50"
              }`}
              title="Poster Standee"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Standee</span>
            </Link>

            <Link
              href="/admin/lucky-draw"
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                pathname === "/admin/lucky-draw"
                  ? "bg-amber-500 text-white"
                  : "text-slate-500 hover:text-amber-600 hover:bg-amber-50"
              }`}
              title="Vòng quay may mắn"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Minigame</span>
            </Link>

            <Link
              href="/admin"
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                pathname === "/admin"
                  ? "bg-[#12203a] text-[#fac775]"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
              title="Quản trị viên"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin</span>
            </Link>
          </nav>
        </div>
      </header>

      <StandeeQRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </>
  );
};
