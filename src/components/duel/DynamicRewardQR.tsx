"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { RefreshCw, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { duelAudio } from "@/lib/duel-audio";

interface Props {
  rewardCode: string;
  expiresAt: number;
  sessionId: string;
  tierLabel: string;
  onRefreshCode: () => Promise<void>;
}

export const DynamicRewardQR: React.FC<Props> = ({
  rewardCode,
  expiresAt,
  tierLabel,
  onRefreshCode,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [timeLeftSec, setTimeLeftSec] = useState<number>(90);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate QR Canvas Image
  useEffect(() => {
    if (!rewardCode) return;
    QRCode.toDataURL(rewardCode, {
      width: 260,
      margin: 1,
      color: {
        dark: "#0B1220",
        light: "#FFFFFF",
      },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [rewardCode]);

  // Expiration countdown
  useEffect(() => {
    const updateCountdown = () => {
      const remainingMs = Math.max(0, expiresAt - Date.now());
      setTimeLeftSec(Math.ceil(remainingMs / 1000));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const isExpired = timeLeftSec <= 0;

  const handleRefresh = async () => {
    duelAudio.playClick();
    setIsRefreshing(true);
    try {
      await onRefreshCode();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-[#0B1220] border-2 border-[#FAC775] rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAC775]/20 text-[#FAC775] border border-[#FAC775]/40 text-xs font-extrabold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Mã Đổi Thưởng Động 1 Lần</span>
        </div>
        <h4 className="text-sm font-extrabold text-white">{tierLabel}</h4>
      </div>

      {/* QR Code Container */}
      <div className="relative p-3 rounded-2xl bg-white shadow-xl flex items-center justify-center">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="Dynamic Reward QR"
            className={`w-48 h-48 object-contain transition-opacity duration-300 ${
              isExpired ? "opacity-20 blur-xs" : "opacity-100"
            }`}
          />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        )}

        {/* Expired Overlay */}
        {isExpired && (
          <div className="absolute inset-0 rounded-2xl bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-500 animate-bounce" />
            <p className="text-xs font-bold text-white">Mã QR đã hết hạn!</p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0091EA] to-[#4CE0D2] text-[#0B1220] font-black text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Tạo Lại Mã Mới</span>
            </button>
          </div>
        )}
      </div>

      {/* Countdown & Security Bar */}
      {!isExpired ? (
        <div className="space-y-1.5 w-full">
          <div className="flex items-center justify-between text-xs px-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#4CE0D2]" />
              Thời gian hiệu lực:
            </span>
            <span className="font-mono font-black text-[#FAC775] text-sm">
              {formatTime(timeLeftSec)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4CE0D2] via-[#FAC775] to-[#EF4444] transition-all duration-1000"
              style={{ width: `${(timeLeftSec / 90) * 100}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-300 font-mono tracking-wider pt-1">
            Mã Token: <span className="text-white font-bold">{rewardCode}</span>
          </p>
        </div>
      ) : (
        <p className="text-xs text-rose-400 font-medium">
          Mã QR đã hết hạn. Hãy bấm nút tạo lại mã để đối chiếu tại quầy!
        </p>
      )}

      {/* Instructions */}
      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 text-left space-y-1 w-full">
        <p className="font-bold text-[#FAC775]">📍 Hướng dẫn nhận quà:</p>
        <p>1. Mang màn hình điện thoại này đến quầy check-in FU-DEVER.</p>
        <p>2. Admin quét mã và gửi tặng bạn phần thưởng tương ứng!</p>
      </div>
    </div>
  );
};
