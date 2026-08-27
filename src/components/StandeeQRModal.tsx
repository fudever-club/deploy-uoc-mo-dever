"use client";

import React, { useEffect, useState } from "react";
import { QrCode, Download, X, Copy, Check } from "lucide-react";
import Image from "next/image";

interface StandeeQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandeeQRModal: React.FC<StandeeQRModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
      setPageUrl(`${currentOrigin}/`);
      fetch(`/api/qr?url=${encodeURIComponent(`${currentOrigin}/`)}`)
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (qrDataUrl) {
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = "QR_Standee_Deploy_Uoc_Mo_FU_DEVER.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#12203A] border border-[#fac775]/40 rounded-2xl shadow-2xl p-6 text-[#faeeda] text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fac775]/20 text-[#fac775] text-xs font-semibold uppercase tracking-wider mb-2">
          <QrCode className="w-3.5 h-3.5" />
          <span>Mã QR Standee</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Mã QR Quét Ước Mơ</h3>
        <p className="text-xs text-[#faeeda]/80 mb-4">
          In Standee hoặc hiển thị tại gian hàng để tân sinh viên K22 quét tham gia.
        </p>

        <div className="bg-white p-4 rounded-xl inline-block shadow-inner mb-4 border-2 border-[#fac775]/50">
          {loading ? (
            <div className="w-48 h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#993c1d] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt="Standee QR Code"
              width={200}
              height={200}
              className="rounded-lg"
              unoptimized
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-red-500 text-xs">
              Lỗi tạo QR
            </div>
          )}
        </div>

        <div className="bg-white/5 rounded-lg p-2.5 mb-4 text-xs font-mono text-[#fac775] truncate flex items-center justify-between gap-2 border border-white/10">
          <span className="truncate">{pageUrl}</span>
          <button
            onClick={handleCopyLink}
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          onClick={handleDownload}
          disabled={loading || !qrDataUrl}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#993c1d] to-[#fac775] hover:from-[#712b13] hover:to-[#e5b360] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Tải Mã QR Bản In Standee (HD 1000px)</span>
        </button>
      </div>
    </div>
  );
};
