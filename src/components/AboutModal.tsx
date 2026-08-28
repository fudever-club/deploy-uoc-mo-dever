"use client";

import React from "react";
import Image from "next/image";
import { X, Sparkles, Heart, Code2, Users, Rocket, ExternalLink, Globe, Mail } from "lucide-react";
import { playTactileClick } from "@/lib/audio-synthesizer";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#12203A] border-2 border-[#fac775]/60 rounded-3xl shadow-2xl p-5 sm:p-6 text-[#faeeda] flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            playTactileClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors cursor-pointer z-10"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Logo */}
        <div className="text-center mb-4">
          <div className="relative mx-auto w-16 h-16 mb-2.5 rounded-full bg-gradient-to-tr from-[#993c1d] via-[#12203A] to-[#0091ea] p-1 border-2 border-[#fac775] shadow-[0_0_25px_rgba(250,199,117,0.4)] flex items-center justify-center">
            <Image
              src="/assets/logo/logo-dever-white.png"
              alt="FU-DEVER Official Logo"
              width={46}
              height={46}
              className="object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fac775]/20 text-[#fac775] text-[11px] font-black uppercase tracking-wider mb-1 border border-[#fac775]/30">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>FPT University Da Nang</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
            CLB LẬP TRÌNH FU-DEVER 🏮
          </h2>
          <p className="text-xs text-[#faeeda]/90 mt-1.5 leading-relaxed max-w-sm mx-auto">
            Không gian kết nối đam mê lập trình &amp; gửi gắm ước mơ của các bạn tân sinh viên <strong>K22</strong> cùng <strong>FU-DEVER</strong> tại Club Day 2026.
          </p>
        </div>

        {/* Live Vercel App Link Pill */}
        <div className="mb-4">
          <a
            href="https://fu-dever-landingpage-v2.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#0091ea]/25 via-emerald-500/20 to-[#0091ea]/25 hover:from-[#0091ea]/35 hover:to-emerald-500/30 border border-emerald-400/50 text-xs font-bold text-white transition-all shadow-md group"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Khám phá Website chính thức của FU-DEVER</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-3 gap-2 mb-3.5 text-center">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <Code2 className="w-4 h-4 mx-auto text-[#00f5d4] mb-0.5" />
            <span className="block text-[11px] font-bold text-white">Chuyên Môn</span>
            <span className="text-[9px] text-slate-300">Web · Mobile · AI</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <Rocket className="w-4 h-4 mx-auto text-[#fac775] mb-0.5" />
            <span className="block text-[11px] font-bold text-white">Thực Chiến</span>
            <span className="text-[9px] text-slate-300">Hackathon &amp; ICPC</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <Users className="w-4 h-4 mx-auto text-[#85b7eb] mb-0.5" />
            <span className="block text-[11px] font-bold text-white">Đồng Đội</span>
            <span className="text-[9px] text-slate-300">Gắn kết &amp; Sẻ chia</span>
          </div>
        </div>

        {/* Mascot lore banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#993c1d]/35 to-[#712b13]/35 border border-[#fac775]/30 mb-3.5 flex items-center gap-2.5">
          <div className="shrink-0 w-10 h-10 rounded-full bg-[#12203A] border border-[#fac775] p-1 flex items-center justify-center">
            <Image
              src="/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png"
              alt="Linh vật Buggy"
              width={34}
              height={34}
              className="object-contain"
            />
          </div>
          <div className="text-[11px]">
            <span className="font-extrabold text-amber-300">Linh vật Buggy: </span>
            <span className="text-slate-300">
              Người bạn đồng hành gánh team, bắt bug và tiếp lửa đam mê lập trình cho các thế hệ DEVER!
            </span>
          </div>
        </div>

        {/* Social & Contact links */}
        <div className="space-y-1.5 mb-3.5">
          <a
            href="https://www.facebook.com/FPTUDever"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all group"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 fill-[#0091ea]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-[11px]">facebook.com/FPTUDever</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
          </a>

          <a
            href="https://github.com/fudever-club"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all group"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 fill-[#fac775]" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="text-[11px]">github.com/fudever-club</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
          </a>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-slate-300">Email: club.dever@gmail.com</span>
            </div>
            <span className="text-[9px] text-[#fac775] font-mono">OFFICIAL</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1 text-[#fac775]">
            <Heart className="w-3 h-3 fill-current text-red-500" />
            <span>Deploy Ước Mơ · Club Day 2026</span>
          </div>
          <span>FU-DEVER Club</span>
        </div>
      </div>
    </div>
  );
};
