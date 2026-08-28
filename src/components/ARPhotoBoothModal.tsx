"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Camera, RefreshCw, Download, Sparkles, AlertCircle, SwitchCamera } from "lucide-react";
import { playCelebrationFanfare, playTactileClick } from "@/lib/audio-synthesizer";

interface ARPhotoBoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  dreamName?: string;
  dreamContent?: string;
}

const FONT_SANS = "-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Segoe UI', Roboto, sans-serif";

function cleanText(str?: string): string {
  if (!str) return "";
  return str.normalize("NFC").trim();
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
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize and maintain camera stream
  const startCamera = useCallback(async (mode: "user" | "environment") => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCamError("Trình duyệt không hỗ trợ camera hoặc cần kết nối HTTPS an toàn.");
      return;
    }

    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      setCamError(null);

      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          facingMode: mode,
        },
        audio: false,
      });

      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCamError("Không thể mở camera. Vui lòng cấp quyền truy cập camera trên thiết bị của bạn nhé!");
    }
  }, [stream]);

  // Handle open / close
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

    startCamera(facingMode);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]);

  // Re-attach stream whenever video element is re-mounted (e.g. after clicking 'Chụp Lại')
  useEffect(() => {
    if (videoRef.current && stream && !capturedUrl) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, capturedUrl]);

  // Flip camera between front (selfie) and back
  const handleToggleFacingMode = () => {
    playTactileClick();
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
  };

  const handleRetake = () => {
    playTactileClick();
    setCapturedUrl(null);
  };

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

    // 1. CENTER CROP (Object-fit: cover) to prevent aspect ratio distortion/stretching
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    const minDim = Math.min(vw, vh);
    const sx = (vw - minDim) / 2;
    const sy = (vh - minDim) / 2;

    ctx.save();
    // Mirror only for front-facing selfie camera
    if (facingMode === "user") {
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }

    // Draw pristine undistorted camera center square
    ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, size, size);
    ctx.restore();

    // 2. VIGNETTE & FESTIVAL GRADIENT OVERLAY
    const grad = ctx.createLinearGradient(0, size * 0.55, 0, size);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.7, "rgba(18, 32, 58, 0.75)");
    grad.addColorStop(1, "rgba(18, 32, 58, 0.96)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Top subtle vignette
    const topGrad = ctx.createLinearGradient(0, 0, 0, 140);
    topGrad.addColorStop(0, "rgba(18, 32, 58, 0.75)");
    topGrad.addColorStop(1, "transparent");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, size, 140);

    // 3. GOLDEN FESTIVAL BORDER FRAME
    ctx.strokeStyle = "#FAC775";
    ctx.lineWidth = 14;
    ctx.strokeRect(18, 18, size - 36, size - 36);

    ctx.strokeStyle = "#993C1D";
    ctx.lineWidth = 3.5;
    ctx.strokeRect(32, 32, size - 64, size - 64);

    // 4. HEADER BADGE (FU-DEVER CLUB DAY 2026)
    ctx.fillStyle = "rgba(18, 32, 58, 0.90)";
    ctx.beginPath();
    ctx.roundRect(50, 48, 440, 68, 20);
    ctx.fill();
    ctx.strokeStyle = "#FAC775";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = "#FAC775";
    ctx.font = `bold 24px ${FONT_SANS}`;
    ctx.fillText("🏮 FU-DEVER · CLUB DAY 2026", 75, 90);

    // 5. WISH & PARTICIPANT TEXT AT BOTTOM
    const cleanPassenger = cleanText(dreamName || "TÂN SINH VIÊN K22");
    const cleanWish = cleanText(dreamContent || "Deploy Ước Mơ cùng CLB Lập trình FU-DEVER!");

    ctx.fillStyle = "#FAC775";
    ctx.font = `900 32px ${FONT_SANS}`;
    ctx.fillText(`✨ ${cleanPassenger}`, 60, size - 145);

    ctx.fillStyle = "#FAEEDA";
    ctx.font = `600 24px ${FONT_SANS}`;
    const displayWish = cleanWish.length > 50 ? `${cleanWish.substring(0, 47)}...` : cleanWish;
    ctx.fillText(`“${displayWish}”`, 60, size - 100);

    ctx.fillStyle = "#00F5D4";
    ctx.font = `bold 18px ${FONT_SANS}`;
    ctx.fillText("#FUDEVER   #DeployUocMo   #FPTUDaNang", 60, size - 58);

    // 6. DRAW BUGGY MASCOT STICKER ON BOTTOM RIGHT
    const stickerImg = new window.Image();
    stickerImg.crossOrigin = "anonymous";
    stickerImg.src = "/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png";
    stickerImg.onload = () => {
      ctx.drawImage(stickerImg, size - 220, size - 220, 175, 175);
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
    link.download = `FU_DEVER_Polaroid_${Date.now()}.png`;
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
          aria-label="Đóng"
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
          <p className="text-xs text-[#faeeda]/80">Cắt ảnh tỷ lệ chuẩn không méo mặt · Lưu khoảnh khắc rực rỡ</p>
        </div>

        {/* Cam Viewport (1:1 Ratio) */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#fac775]/50 bg-black flex items-center justify-center shadow-2xl">
          {camError ? (
            <div className="p-6 text-center text-xs text-red-300 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <span>{camError}</span>
              <button
                onClick={() => startCamera(facingMode)}
                className="mt-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử lại</span>
              </button>
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
                className={`w-full h-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`}
              />

              {/* Decorative Camera Overlay Frame */}
              <div className="absolute inset-3 border-2 border-dashed border-[#fac775]/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex items-center justify-between text-[11px] text-[#fac775] font-bold bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-xs w-fit">
                  <span>🏮 DEVER HD Live Cam</span>
                </div>
                <div className="text-center text-xs text-amber-200 font-bold bg-black/50 px-3 py-1 rounded-lg backdrop-blur-xs">
                  {dreamName ? `✨ ${dreamName}` : "✨ Tân Sinh Viên K22"}
                </div>
              </div>

              {/* Camera Switch Button (Mobile / Laptop) */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-amber-300 border border-amber-300/40 backdrop-blur-md transition-transform active:scale-90 cursor-pointer"
                title="Đổi camera trước/sau"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>

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
                onClick={handleRetake}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
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
