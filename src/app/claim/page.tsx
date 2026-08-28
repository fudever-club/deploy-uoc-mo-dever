"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MysteryDrop } from "@/types/dream";
import { playCelebrationFanfare, playTactileClick } from "@/lib/audio-synthesizer";
import { Gift, Sparkles, Trophy, ArrowRight, Clock, AlertCircle, CheckCircle2, Home } from "lucide-react";
import Link from "next/link";

function ClaimContent() {
  const searchParams = useSearchParams();
  const dropId = searchParams.get("dropId");

  const [drop, setDrop] = useState<MysteryDrop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [claimantName, setClaimantName] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [claimedSuccess, setClaimedSuccess] = useState<MysteryDrop | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [winnerName, setWinnerName] = useState<string | null>(null);

  // Fetch initial drop details
  useEffect(() => {
    const fetchDrop = async () => {
      try {
        const res = await fetch("/api/mystery-drop", { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data) {
          setDrop(json.data);
          if (json.data.claimed) {
            setWinnerName(json.data.claimedBy);
          }
        }
      } catch (err) {
        console.error("Fetch drop error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrop();
  }, [dropId]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimantName.trim() || !dropId) return;

    playTactileClick();
    setSubmitting(true);
    setErrorMessage(null);

    const displayName = studentId.trim()
      ? `${claimantName.trim()} (${studentId.trim().toUpperCase()})`
      : claimantName.trim();

    try {
      const res = await fetch("/api/mystery-drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "claim",
          dropId,
          claimantName: displayName,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setClaimedSuccess(json.data);
        playCelebrationFanfare();
      } else {
        setErrorMessage(json.error || "Rất tiếc, đã có người nhận quà trước bạn!");
        if (json.winner) {
          setWinnerName(json.winner);
        }
      }
    } catch {
      setErrorMessage("Lỗi kết nối mạng, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#12203A] text-white flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-bold text-[#FAC775]">Đang kết nối Bầu Trời Ước Mơ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#12203A] bg-gradient-to-b from-[#0a162b] via-[#12203A] to-[#1a0a0a] text-[#faeeda] flex flex-col items-center justify-center p-4 selection:bg-[#FAC775] selection:text-[#12203A]">
      {/* Decorative Moon & Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#12203A]/90 border-2 border-[#FAC775]/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-5">
        {/* Brand Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CLB Lập Trình FU-DEVER · Club Day</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
            Săn Đèn Lồng Bí Ẩn
          </h1>
          <p className="text-xs text-[#faeeda]/80 mt-1">
            Mở khóa phần quà độc quyền tại gian hàng FU-DEVER
          </p>
        </div>

        {claimedSuccess ? (
          /* SUCCESS SCREEN */
          <div className="space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-3xl">
              🏆
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>BẠN LÀ NGƯỜI NHANH TAY NHẤT!</span>
            </div>

            <h2 className="text-xl font-black text-white">
              Chúc mừng <span className="text-amber-300">{claimedSuccess.claimedBy}</span>
            </h2>

            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1c2e4f] to-[#0d1829] border border-amber-400/60 shadow-lg text-left space-y-2">
              <div className="text-xs text-slate-400 font-bold uppercase">Phần thưởng của bạn:</div>
              <div className="text-base font-black text-amber-300 flex items-center gap-2">
                <span>{claimedSuccess.rewardEmoji}</span>
                <span>{claimedSuccess.rewardName}</span>
              </div>
              <p className="text-xs text-white/80">{claimedSuccess.description}</p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">Mã nhận quà:</span>
                <span className="font-mono font-black text-amber-300 text-base bg-black/40 px-2 py-0.5 rounded">
                  {claimedSuccess.rewardCode}
                </span>
              </div>
            </div>

            <p className="text-xs text-emerald-300 font-medium">
              👉 Hãy mang màn hình này đến <strong>Bàn Check-in FU-DEVER</strong> để nhận quà ngay nhé!
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-amber-300" />
              <span>Quay về trang chủ Deploy Ước Mơ</span>
            </Link>
          </div>
        ) : errorMessage || (drop && drop.claimed && winnerName) ? (
          /* CONFLICT / ALREADY CLAIMED SCREEN */
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-3xl">
              ⚡
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 text-xs font-black uppercase">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>RẤT TIẾC, BẠN CHẬM MỘT CHÚT!</span>
            </div>

            <p className="text-sm font-bold text-white leading-relaxed">
              {errorMessage || `Bạn ${winnerName || "một bạn khác"} đã nhanh tay mở khóa phần quà này trước bạn vài giây!`}
            </p>

            <p className="text-xs text-[#faeeda]/70">
              Đừng nản lòng! Hãy giữ điện thoại sẵn sàng và quan sát màn hình lớn gian hàng để đón đợt đèn tiếp theo nhé!
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#993C1D] to-[#FAC775] text-white font-black text-sm shadow-xl transition-all cursor-pointer active:scale-95"
            >
              <span>🏮 Thả Ước Mơ Của Bạn Lên Trời</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : !drop || !drop.active ? (
          /* EXPIRED SCREEN */
          <div className="space-y-4">
            <div className="text-4xl">🏮</div>
            <h3 className="text-lg font-black text-white">Đợt Thả Đèn Đã Kết Thúc</h3>
            <p className="text-xs text-[#faeeda]/80">
              Chiếc đèn lồng bí ẩn đã bay cao vào bầu trời. Hãy chú ý màn hình gian hàng để đón đợt tiếp theo nhé!
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
            >
              <span>Quay về trang chủ</span>
            </Link>
          </div>
        ) : (
          /* ACTIVE CLAIM FORM */
          <form onSubmit={handleClaim} className="space-y-4 text-left">
            {/* Prize Highlight Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-300/40 text-center">
              <div className="text-2xl mb-1">{drop.rewardEmoji}</div>
              <div className="text-sm font-black text-white">{drop.rewardName}</div>
              <div className="text-[11px] text-amber-200/90 mt-0.5">{drop.description}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Họ và tên của bạn: *
                </label>
                <input
                  type="text"
                  required
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FAC775] text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Mã số sinh viên (MSSV - tùy chọn):
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Ví dụ: QE180001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FAC775] text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !claimantName.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-600 to-amber-400 hover:opacity-95 text-white font-black text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang mở khóa phần quà...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>🔥 NHẬN QUÀ NGAY (CHỈ 1 NGƯỜI)!</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#12203A] text-white flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClaimContent />
    </Suspense>
  );
}
