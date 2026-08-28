"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Camera, RefreshCw, Download, Sparkles, AlertCircle } from "lucide-react";
import { playCelebrationFanfare, playTactileClick } from "@/lib/audio-synthesizer";

interface ARPhotoBoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  dreamName?: string;
  dreamContent?: string;
}

export const ARPhotoBoothModal: React.FC<ARPhotoBoothModalProps> = ({
  isOpen,
  onClose,
  dreamName,
  dreamContent,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [camError, setCamError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize WebRTC Camera
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setCapturedUrl(null);
      setCamError(null);
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCamError("Trình duyệt không hỗ trợ truy cập camera hoặc cần kết nối HTTPS an toàn.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 1080 }, height: { ideal: 1080 }, facingMode: "user" },
        audio: false,
      })
      .then((s) => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setCamError("Không thể truy cập camera. Vui lòng cấp quyền truy cập camera trên trình duyệt của bạn nhé!");
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const handleStartCapture = () => {
    playTactileClick();
    setIsCounting(true);
    setCountdown(3);

    let current = 3;
    const interval = setInterval(() => {
      current--;
      if (current <= 0) {
        clearInterval(interval);
        setIsCounting(false);
        takeSnapshot();
      } else {
        setCountdown(current);
        playTactileClick();
      }
    }, 1000);
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = 1080;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw Camera Frame (mirrored for selfie)
    ctx.save();
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, size, size);
    ctx.restore();

    // 2. Draw Vignette & Festival Overlay Frame
    const grad = ctx.createLinearGradient(0, size * 0.65, 0, size);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, "rgba(18, 32, 58, 0.92)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // 3. Golden Festival Border Frame
    ctx.strokeStyle = "#FAC775";
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, size - 40, size - 40);

    // Inner subtle crimson rim
    ctx.strokeStyle = "#993C1D";
    ctx.lineWidth = 4;
    ctx.strokeRect(34, 34, size - 68, size - 68);

    // 4. Header Badge
    ctx.fillStyle = "rgba(18, 32, 58, 0.85)";
    ctx.beginPath();
    ctx.roundRect(60, 50, 420, 70, 24);
    ctx.fill();
    ctx.strokeStyle = "#FAC775";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#FAC775";
    ctx.font = "bold 26px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("🏮 FU-DEVER · Club Day 2026", 80, 95);

    // 5. Wish Text Box at Bottom
    ctx.fillStyle = "#FAC775";
    ctx.font = "bold 32px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(dreamName ? `✨ ${dreamName}` : "✨ Tân Sinh Viên K22", 60, size - 140);

    ctx.fillStyle = "#FAEEDA";
    ctx.font = "italic 24px 'Plus Jakarta Sans', sans-serif";
    const content = dreamContent || "Deploy Ước Mơ cùng CLB Lập trình FU-DEVER!";
    ctx.fillText(`“${content.length > 55 ? content.substring(0, 52) + "..." : content}”`, 60, size - 95);

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("#FUDEVER #DeployUocMo #FPTUDaNang", 60, size - 55);

    // 6. Draw Mid-Autumn Buggy Mascot Sticker on bottom right
    const stickerImg = new window.Image();
    stickerImg.crossOrigin = "anonymous";
    stickerImg.src = "/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png";
    stickerImg.onload = () => {
      ctx.drawImage(stickerImg, size - 200, size - 200, 160, 160);
      const dataUrl = canvas.toDataURL("image/png");
      setCapturedUrl(dataUrl);
      playCelebrationFanfare();
    };
    stickerImg.onerror = () => {
      const dataUrl = canvas.toDataURL("image/png");
      setCapturedUrl(dataUrl);
      playCelebrationFanfare();
    };
  };

  const handleDownload = () => {
    if (!capturedUrl) return;
    const link = document.createElement("a");
    link.download = `FU_DEVER_PhotoBooth_${Date.now()}.png`;
    link.href = capturedUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12203A] border-2 border-[#fac775]/60 rounded-3xl shadow-2xl p-5 text-[#faeeda] flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#fac775]/20 text-[#fac775] text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Booth Dream Photo Cam</span>
          </div>
          <h3 className="text-xl font-black text-white font-display">Chụp Ảnh Kỷ Niệm Polaroid</h3>
        </div>

        {/* Cam Viewport */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#fac775]/40 bg-black flex items-center justify-center shadow-inner">
          {camError ? (
            <div className="p-6 text-center text-xs text-red-300 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <span>{camError}</span>
            </div>
          ) : capturedUrl ? (
            <Image
              src={capturedUrl}
              alt="Captured Souvenir"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />

              {/* Decorative Camera Overlay Frame */}
              <div className="absolute inset-4 border-2 border-dashed border-[#fac775]/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex items-center justify-between text-[11px] text-[#fac775] font-bold bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs w-fit">
                  <span>🏮 DEVER Live Cam</span>
                </div>
                <div className="text-center text-xs text-amber-200 font-bold bg-black/40 px-3 py-1 rounded-md backdrop-blur-xs">
                  {dreamName ? `✨ ${dreamName}` : "✨ Tân Sinh Viên K22"}
                </div>
              </div>

              {/* Countdown Overlay */}
              {isCounting && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                  <span className="text-7xl font-black text-[#fac775] animate-ping">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Actions */}
        <div className="w-full mt-4 flex flex-col gap-2">
          {capturedUrl ? (
            <>
              <button
                onClick={handleDownload}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#993c1d] to-[#fac775] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Ảnh Kỷ Niệm Polaroid Về Máy</span>
              </button>

              <button
                onClick={() => setCapturedUrl(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Chụp Lại Bức Khác</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleStartCapture}
              disabled={isCounting || !!camError}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#993c1d] via-[#fac775] to-[#993c1d] hover:opacity-95 text-[#12203a] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>{isCounting ? "Chuẩn bị cười thật tươi..." : "Chụp Ảnh Ngay (3s)"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
