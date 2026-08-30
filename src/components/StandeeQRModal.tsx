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
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
      setPageUrl(`${currentOrigin}/`);

      fetch(`/api/qr?url=${encodeURIComponent(`${currentOrigin}/`)}&width=360`)
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

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Request HD 1000px version for crisp standee printing
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`/api/qr?url=${encodeURIComponent(`${currentOrigin}/`)}&width=1000`);
      const data = await res.json();
      const downloadUrl = data.success ? data.qrDataUrl : qrDataUrl;

      if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "QR_Standee_Deploy_Uoc_Mo_FU_DEVER_HD.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Download HD QR error:", err);
    } finally {
      setIsDownloading(false);
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
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors cursor-pointer"
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
              style={{ width: "auto", height: "auto" }}
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
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <button
          onClick={handleDownload}
          disabled={loading || !qrDataUrl || isDownloading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#993c1d] to-[#fac775] hover:from-[#712b13] hover:to-[#e5b360] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {isDownloading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isDownloading ? "Đang chuẩn bị bản in..." : "Tải Mã QR Bản In Standee (HD)"}</span>
        </button>
      </div>
    </div>
  );
};
