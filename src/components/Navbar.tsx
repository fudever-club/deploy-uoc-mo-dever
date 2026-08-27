"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Sparkles, Monitor, Shield, QrCode } from "lucide-react";
import { StandeeQRModal } from "./StandeeQRModal";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [showQRModal, setShowQRModal] = useState(false);

  // In display mode, hide the top navbar for clean presentation display
  if (pathname === "/display") {
    return null;
  }

  const isNight = pathname === "/display";

  return (
    <>
      <header
        className={`w-full sticky top-0 z-40 transition-colors backdrop-blur-md border-b ${
          isNight
            ? "bg-[#12203A]/85 border-[#fac775]/20 text-[#faeeda]"
            : "bg-white/90 border-[#993c1d]/15 text-[#2c2c2a] shadow-xs"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-xs border border-amber-200/40 p-0.5">
              <Image
                src="/assets/logo/logo-icon.png"
                alt="FU-DEVER Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-[#993c1d]">FU-DEVER</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#fac775]/30 text-[#712b13]">K22</span>
              </div>
              <span className="text-[11px] font-medium text-[#5f5e5a] tracking-tight">Deploy Ước Mơ</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                pathname === "/"
                  ? "bg-[#993c1d] text-white shadow-xs"
                  : "text-[#5f5e5a] hover:text-[#993c1d] hover:bg-[#fac775]/15"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gửi ước mơ</span>
            </Link>

            <Link
              href="/display"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                pathname === "/display"
                  ? "bg-[#fac775] text-[#12203a] shadow-xs font-bold"
                  : "text-[#5f5e5a] hover:text-[#993c1d] hover:bg-[#fac775]/15"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Bầu trời</span>
              <span className="sm:hidden">Display</span>
            </Link>

            <button
              onClick={() => setShowQRModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#5f5e5a] hover:text-[#993c1d] hover:bg-[#fac775]/15 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Xem QR Standee"
            >
              <QrCode className="w-3.5 h-3.5 text-[#0091ea]" />
              <span className="hidden md:inline">QR Standee</span>
            </button>

            <Link
              href="/admin"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                pathname === "/admin"
                  ? "bg-[#12203a] text-[#fac775]"
                  : "text-[#5f5e5a] hover:text-[#12203a] hover:bg-black/5"
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
