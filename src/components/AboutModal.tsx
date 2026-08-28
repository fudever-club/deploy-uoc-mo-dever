"use client";

import React from "react";
import Image from "next/image";
import { X, Sparkles, Heart, Code2, Users, Rocket, ExternalLink, Github, Facebook, Globe, ShieldCheck } from "lucide-react";
import { playTactileClick } from "@/lib/audio-synthesizer";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#12203A] border-2 border-[#fac775]/60 rounded-3xl shadow-2xl p-5 sm:p-7 text-[#faeeda] flex flex-col max-h-[92vh] overflow-y-auto">
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

        {/* Club Logo Header */}
        <div className="text-center mb-5">
          <div className="relative mx-auto w-20 h-20 mb-3 rounded-full bg-gradient-to-tr from-[#993c1d] via-[#12203A] to-[#0091ea] p-1.5 border-2 border-[#fac775] shadow-[0_0_30px_rgba(250,199,117,0.4)] flex items-center justify-center">
            <Image
              src="/assets/logo/logo-dever-white.png"
              alt="FU-DEVER Official Logo"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fac775]/20 text-[#fac775] text-xs font-black uppercase tracking-wider mb-1.5 border border-[#fac775]/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>FPT University Da Nang</span>
          </div>

          <h2 className="text-2xl font-black text-white font-display tracking-tight">
            CLB LẬP TRÌNH FU-DEVER 🏮
          </h2>
          <p className="text-xs text-[#faeeda]/80 mt-1">
            Nơi kết nối đam mê công nghệ, ươm mầm tài năng và cùng nhau phát triển
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <Code2 className="w-5 h-5 mx-auto text-[#00f5d4] mb-1" />
            <span className="block text-xs font-bold text-white">Chuyên Môn</span>
            <span className="text-[10px] text-slate-400">Web, AI, Mobile & ICPC</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <Rocket className="w-5 h-5 mx-auto text-[#fac775] mb-1" />
            <span className="block text-xs font-bold text-white">Dự Án Thực Chiến</span>
            <span className="text-[10px] text-slate-400">Hackathon & Products</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <Users className="w-5 h-5 mx-auto text-[#85b7eb] mb-1" />
            <span className="block text-xs font-bold text-white">Gia Đình DEVER</span>
            <span className="text-[10px] text-slate-400">Đồng đội & Kỷ niệm</span>
          </div>
        </div>

        {/* Storytelling & Mascot Lore */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#993c1d]/40 to-[#712b13]/40 border border-[#fac775]/40 mb-4 flex items-center gap-3">
          <div className="shrink-0 w-12 h-12 rounded-full bg-[#12203A] border border-[#fac775] p-1 shadow-md flex items-center justify-center">
            <Image
              src="/assets/buggy/1.png"
              alt="Buggy Mascot"
              width={38}
              height={38}
              className="object-contain"
            />
          </div>
          <div className="text-xs">
            <h4 className="font-extrabold text-amber-300">Linh vật Buggy &quot;Bọ Cánh Cam&quot;</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Sứ giả diệt bug và thắp sáng ước mơ của DEVER. Chúc các tân sinh viên <strong>K22</strong> một hành trình đại học rực rỡ!
            </p>
          </div>
        </div>

        {/* Social & Community Links */}
        <div className="space-y-2 mb-4">
          <a
            href="https://www.facebook.com/fudever.club"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl bg-[#0091ea]/20 hover:bg-[#0091ea]/30 border border-[#0091ea]/50 text-xs font-bold text-white transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Facebook className="w-4 h-4 text-[#0091ea]" />
              <span>Fanpage Chính Thức: facebook.com/fudever.club</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          </a>

          <a
            href="https://github.com/fudever-club"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Github className="w-4 h-4 text-[#fac775]" />
              <span>GitHub Organization: github.com/fudever-club</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          </a>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1 text-[#fac775]">
            <Heart className="w-3 h-3 fill-current text-red-500" />
            <span>Deploy Ước Mơ · Club Day 2026</span>
          </div>
          <span>Made with ❤️ by FU-DEVER</span>
        </div>
      </div>
    </div>
  );
};
