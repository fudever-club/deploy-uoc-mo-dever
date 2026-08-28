"use client";

import React, { useEffect, useState, useRef } from "react";
import { MysteryDrop } from "@/types/dream";
import { playMysteryDropChime, playCelebrationFanfare } from "@/lib/audio-synthesizer";
import { Gift, Sparkles, Clock, Crown, X, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface MysteryDropBannerProps {
  drop: MysteryDrop | null;
  onClose?: () => void;
  soundEnabled?: boolean;
}

export const MysteryDropBanner: React.FC<MysteryDropBannerProps> = ({
  drop,
  onClose,
  soundEnabled = true,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const playedSoundRef = useRef<string | null>(null);
  const claimedFanfareRef = useRef<boolean>(false);

  // Sound triggers
  useEffect(() => {
    if (!drop) {
      playedSoundRef.current = null;
      claimedFanfareRef.current = false;
      return;
    }

    // Play initial mystery drop arrival sound
    if (playedSoundRef.current !== drop.id && soundEnabled) {
      playedSoundRef.current = drop.id;
      playMysteryDropChime();
    }

    // Play celebration fanfare when claimed
    if (drop.claimed && !claimedFanfareRef.current) {
      claimedFanfareRef.current = true;
      if (soundEnabled) {
        playCelebrationFanfare();
      }
    }
  }, [drop, soundEnabled]);

  // Countdown timer
  useEffect(() => {
    if (!drop || drop.claimed) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((drop.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0 && onClose) {
        onClose();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [drop, onClose]);

  // Fetch QR Code for Claim URL
  useEffect(() => {
    if (!drop) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const claimUrl = `${origin}/claim?dropId=${drop.id}`;

    fetch(`/api/qr?url=${encodeURIComponent(claimUrl)}&width=280`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.qrDataUrl) {
          setQrDataUrl(json.qrDataUrl);
        }
      })
      .catch(() => {});
  }, [drop]);

  if (!drop) return null;

  return (
    <div className="fixed top-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 max-w-xl w-full select-none animate-in slide-in-from-top-6 fade-in duration-500">
      <div
        className={`relative rounded-3xl p-5 sm:p-6 border-2 shadow-[0_0_50px_rgba(250,199,117,0.5)] backdrop-blur-xl transition-all duration-500 ${
          drop.claimed
            ? "bg-gradient-to-br from-[#12203A]/95 via-[#091a38]/95 to-[#0055a5]/95 border-emerald-400 text-white"
            : "bg-gradient-to-br from-[#280505]/95 via-[#12203A]/95 to-[#712B13]/95 border-[#FAC775] text-[#faeeda]"
        }`}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Pulsating Glowing Lantern Badge Top Center */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-2xl animate-bounce">
          {drop.claimed ? "🏆" : "🎁"}
        </div>

        {!drop.claimed ? (
          /* UNCLAIMED ACTIVE MYSTERY DROP */
          <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
            {/* Left QR Code Box */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="p-2.5 rounded-2xl bg-white border-2 border-amber-300 shadow-xl relative group">
                {qrDataUrl ? (
                  <Image
                    src={qrDataUrl}
                    alt="Quét mã nhận quà"
                    width={130}
                    height={130}
                    className="rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-[130px] h-[130px] flex items-center justify-center text-xs text-slate-500">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-7 h-7 rounded-full bg-[#12203A] border-2 border-white flex items-center justify-center text-[10px] text-amber-300 font-bold shadow-md">
                    DEV
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider mt-1.5 animate-pulse">
                Quét QR Trên Điện Thoại
              </span>
            </div>

            {/* Right Information Details */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-[10px] font-black uppercase tracking-wider">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Duy nhất 1 người nhanh tay nhất!</span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white font-display leading-snug">
                {drop.rewardEmoji} {drop.rewardName}
              </h3>

              <p className="text-xs text-[#faeeda]/80 line-clamp-2">
                {drop.description}
              </p>

              {/* Progress Countdown Bar */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Đếm ngược kết thúc:
                  </span>
                  <span className="font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                    {timeLeft}s
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300 transition-all duration-500 ease-linear"
                    style={{ width: `${Math.min(100, (timeLeft / 25) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CLAIMED VICTORY CELEBRATION */
          <div className="text-center pt-3 pb-1 space-y-2 animate-in zoom-in-95 duration-300">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ĐÃ CÓ CHỦ NHÂN MỞ KHÓA!</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-display">
              👑 Chúc mừng <span className="text-amber-300">{drop.claimedBy}</span>
            </h3>

            <p className="text-sm font-bold text-emerald-200">
              Đã nhanh tay nhận phần quà: <span className="text-white underline">{drop.rewardName}</span>
            </p>

            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-[#faeeda] font-mono">
              Mã nhận quà: <span className="text-amber-300 font-bold">{drop.rewardCode}</span> · Hãy ghé Bàn Check-in FU-DEVER để nhận ngay!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
