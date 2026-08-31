"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { LeaderboardEntry, LiveDuelEvent } from "@/types/duel";
import { getBuggyLine } from "@/lib/duel-scorer";
import { playDuelGlitchSound } from "@/lib/duel-audio";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import QRCode from "qrcode";
import {
  Trophy,
  Flame,
  Zap,
  Crown,
  Medal,
  Award,
  Sparkles,
  QrCode,
  Users,
  Radio,
} from "lucide-react";

interface BuggyLiveArenaProps {
  soundEnabled?: boolean;
}

const BUGGY_ARENA_VARIANTS = [
  { src: "/assets/buggy/arena/buggy_arena_champion.png", mood: "Quán Quân Arena 👑" },
  { src: "/assets/buggy/arena/buggy_arena_cyber_hacker.png", mood: "Thần Đồng Coder 100x ⚡" },
  { src: "/assets/buggy/arena/buggy_arena_streak_fire.png", mood: "Chuỗi Thắng Bùng Cháy 🔥" },
  { src: "/assets/buggy/arena/buggy_arena_duel_swords.png", mood: "Đấu Sĩ Quyết Đấu ⚔️" },
  { src: "/assets/buggy/arena/buggy_arena_cheerleader.png", mood: "Cổ Động Viên K22 🎉" },
  { src: "/assets/buggy/arena/buggy_arena_gemini_mindreader.png", mood: "Nhà Tiên Tri AI 🧠" },
  { src: "/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png", mood: "Chú Cuội Coder 🏮" },
  { src: "/assets/buggy/trung-thu/03_buggy_lion_dance.png", mood: "Múa Lân Rộn Ràng 🦁" },
];

export const BuggyLiveArena: React.FC<BuggyLiveArenaProps> = ({ soundEnabled = true }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [liveEvent, setLiveEvent] = useState<LiveDuelEvent | null>(null);
  const [idleLine, setIdleLine] = useState<string>("");
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [duelQrUrl, setDuelQrUrl] = useState<string | null>(null);
  const [mascotVariantIdx, setMascotVariantIdx] = useState<number>(0);
  const [isBouncing, setIsBouncing] = useState<boolean>(false);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const liveExpireTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/duel/leaderboard?limit=10", {
        headers: { "Cache-Control": "no-cache" },
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLeaderboard(json.data);
      }
    } catch (err) {
      console.error("Fetch leaderboard error:", err);
    }
  }, []);

  // Generate QR for /duel
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const duelUrl = `${origin}/duel`;
    QRCode.toDataURL(duelUrl, {
      width: 140,
      margin: 1,
      color: { dark: "#0B1220", light: "#4CE0D2" },
      errorCorrectionLevel: "M",
    })
      .then((url) => setDuelQrUrl(url))
      .catch(() => {});
  }, []);

  // Rotate idle line and mascot variant every 7s
  useEffect(() => {
    setIdleLine(getBuggyLine("idle"));
    idleTimerRef.current = setInterval(() => {
      setIdleLine(getBuggyLine("idle"));
      setMascotVariantIdx((prev) => (prev + 1) % BUGGY_ARENA_VARIANTS.length);
    }, 7000);

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, []);

  // Realtime subscription via Supabase and local event polling
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 4000);

    const client = getSupabaseBrowserClient();
    if (client) {
      try {
        const channel = client.channel("dreams-live-channel");
        channel
          .on("broadcast", { event: "duel_live_update" }, ({ payload }) => {
            if (payload) {
              setLiveEvent(payload as LiveDuelEvent);
              // Auto reset live event after 15s if no more updates
              if (liveExpireTimerRef.current) clearTimeout(liveExpireTimerRef.current);
              liveExpireTimerRef.current = setTimeout(() => {
                setLiveEvent(null);
              }, 15000);
            }
          })
          .on("broadcast", { event: "duel_finished" }, () => {
            fetchLeaderboard();
          })
          .on("broadcast", { event: "duel_claimed" }, () => {
            fetchLeaderboard();
          })
          .on("broadcast", { event: "duel_glitch" }, () => {
            triggerGlitch();
          })
          .subscribe();

        return () => {
          clearInterval(interval);
          if (liveExpireTimerRef.current) clearTimeout(liveExpireTimerRef.current);
          client.removeChannel(channel);
        };
      } catch (err) {
        console.warn("Supabase live arena subscribe error:", err);
      }
    }

    return () => {
      clearInterval(interval);
      if (liveExpireTimerRef.current) clearTimeout(liveExpireTimerRef.current);
    };
  }, [fetchLeaderboard]);

  const triggerGlitch = () => {
    setIsGlitching(true);
    if (soundEnabled) playDuelGlitchSound();
    setTimeout(() => {
      setIsGlitching(false);
    }, 1200);
  };

  return (
    <aside
      className={`h-full flex flex-col justify-between p-3.5 sm:p-4 bg-[#0B1220]/95 backdrop-blur-xl border-l-2 border-[#4CE0D2]/40 text-white select-none overflow-y-auto relative transition-all ${
        isGlitching ? "animate-pulse invert hue-rotate-90" : ""
      }`}
    >
      {/* Background Neon Grid Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4ce0d208_1px,transparent_1px),linear-gradient(to_bottom,#4ce0d208_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />

      {/* 1. TOP BRANDING & LIVE STATUS BADGE */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0091EA] via-[#4CE0D2] to-[#E14CE8] p-0.5 shadow-[0_0_15px_rgba(76,224,210,0.5)]">
              <div className="w-full h-full rounded-full bg-[#0B1220] flex items-center justify-center p-1">
                <Image
                  src="/assets/buggy/11.png"
                  alt="Buggy Mascot"
                  width={24}
                  height={24}
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <h3 className="text-xs sm:text-sm font-black text-white font-display tracking-tight">
                  BUGGY LIVE ARENA
                </h3>
                <span className="text-[9px] bg-rose-500/30 text-rose-300 border border-rose-400/50 px-1.5 py-0.2 rounded-full font-extrabold animate-pulse">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-[#4CE0D2] font-semibold">Đấu Trí 60s Nhận Quà</p>
            </div>
          </div>

          {/* QR Code Quick Scan for Mobile Spectators */}
          {duelQrUrl && (
            <div className="flex items-center gap-2 bg-[#12203A] p-1.5 rounded-xl border border-[#4CE0D2]/40 shadow-md">
              <Image
                src={duelQrUrl}
                alt="Scan to duel"
                width={38}
                height={38}
                style={{ width: "auto", height: "auto" }}
                className="rounded"
                unoptimized
              />
              <div className="text-[9px] leading-tight font-extrabold text-[#4CE0D2]">
                <div>QUÉT ĐỂ</div>
                <div className="text-white">THÁCH ĐẤU</div>
              </div>
            </div>
          )}
        </div>

        {/* 2. LIVE MATCH STATUS TICKER OR IDLE GREETING */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#12203A] to-[#1a2b4c] border border-[#4CE0D2]/40 shadow-lg">
          {liveEvent && liveEvent.status === "playing" ? (
            /* ACTIVE DUEL IN PROGRESS */
            <div className="space-y-1.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-400 animate-ping" />
                  <span className="font-extrabold text-white truncate max-w-[130px]">
                    {liveEvent.nickname}
                  </span>
                </div>
                <span className="text-[10px] font-black text-[#4CE0D2] bg-[#4CE0D2]/20 px-2 py-0.5 rounded-full">
                  Câu {liveEvent.currentQuestionIndex}/{liveEvent.totalQuestions}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                <div className="flex items-center gap-1 text-[#FAC775] font-black">
                  <span>Điểm: {liveEvent.score}</span>
                </div>

                {liveEvent.streak >= 2 && (
                  <div className="flex items-center gap-1 text-rose-400 font-extrabold text-[11px]">
                    <Flame className="w-3 h-3 fill-rose-400" />
                    <span>STREAK X{liveEvent.streak}</span>
                  </div>
                )}
              </div>

              {liveEvent.latestBuggyLine && (
                <p className="text-[11px] text-[#FAC775] italic line-clamp-2 pt-1 border-t border-white/5">
                  &ldquo;{liveEvent.latestBuggyLine}&rdquo;
                </p>
              )}
            </div>
          ) : (
            /* IDLE STATE: BUGGY WAITING FOR CHALLENGERS WITH DYNAMIC JOYFUL MASCOT */
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsBouncing(true);
                  setIdleLine(getBuggyLine("idle"));
                  setMascotVariantIdx((prev) => (prev + 1) % BUGGY_ARENA_VARIANTS.length);
                  setTimeout(() => setIsBouncing(false), 800);
                }}
                className={`relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0091EA] via-[#4CE0D2] to-[#E14CE8] p-0.5 shadow-[0_0_20px_rgba(76,224,210,0.6)] cursor-pointer shrink-0 transition-transform active:scale-90 hover:scale-105 ${
                  isBouncing ? "scale-110 rotate-6" : ""
                }`}
                title="Chạm vào Buggy để đổi biểu cảm!"
              >
                <div className="w-full h-full rounded-2xl bg-[#0B1220] flex items-center justify-center p-1 overflow-hidden">
                  <Image
                    key={BUGGY_ARENA_VARIANTS[mascotVariantIdx].src}
                    src={BUGGY_ARENA_VARIANTS[mascotVariantIdx].src}
                    alt="Buggy Mascot"
                    width={40}
                    height={40}
                    style={{ width: "auto", height: "auto" }}
                    className="object-contain animate-in fade-in zoom-in-75 duration-300 rounded-xl"
                  />
                </div>
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 leading-none mb-1">
                  <span className="text-[10px] font-black text-[#4CE0D2] uppercase">
                    Buggy Arena
                  </span>
                  <span className="text-[9px] bg-[#FAC775]/20 text-[#FAC775] font-bold px-1.5 py-0.5 rounded-full border border-[#FAC775]/40">
                    {BUGGY_ARENA_VARIANTS[mascotVariantIdx].mood}
                  </span>
                </div>
                <p className="text-xs text-[#FAC775] italic line-clamp-2 leading-tight">
                  &ldquo;{idleLine}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. DAILY TOP 10 LEADERBOARD */}
      <div className="relative z-10 flex-1 flex flex-col justify-start my-3 min-h-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#FAC775] tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-[#FAC775]" />
            <span>BẢNG XẾP HẠNG TOP 10</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Hôm nay</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          {leaderboard.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs">
              <Users className="w-6 h-6 mb-1 text-slate-500" />
              <span>Chưa có ai thách đấu hôm nay!</span>
              <span className="text-[10px] text-[#4CE0D2] font-bold mt-1">
                Quét mã QR để trở thành Top 1 ngay!
              </span>
            </div>
          ) : (
            leaderboard.map((entry) => {
              const isTop1 = entry.rank === 1;
              const isTop2 = entry.rank === 2;
              const isTop3 = entry.rank === 3;

              let rankBadgeStyle = "bg-white/10 text-slate-300 border-white/10";
              let rowStyle = "bg-white/5 border-white/10";

              if (isTop1) {
                rankBadgeStyle = "bg-gradient-to-tr from-amber-500 to-yellow-300 text-[#12203A] font-black border-amber-300";
                rowStyle = "bg-gradient-to-r from-amber-500/20 via-[#12203A] to-[#12203A] border-amber-400/60 shadow-md";
              } else if (isTop2) {
                rankBadgeStyle = "bg-slate-300 text-[#12203A] font-black border-slate-200";
                rowStyle = "bg-slate-500/15 border-slate-400/40";
              } else if (isTop3) {
                rankBadgeStyle = "bg-amber-700 text-white font-black border-amber-600";
                rowStyle = "bg-amber-900/15 border-amber-700/40";
              }

              return (
                <div
                  key={entry.id}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${rowStyle}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 border ${rankBadgeStyle}`}
                    >
                      {isTop1 ? "👑" : entry.rank}
                    </span>

                    <div className="min-w-0">
                      <div className="font-extrabold text-white truncate max-w-[110px] sm:max-w-[130px]">
                        {entry.nickname}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span>{entry.correct_count}/5 câu</span>
                        {entry.tier >= 2 && (
                          <span className="text-[#FAC775] font-black text-[9px] bg-amber-400/20 px-1 rounded">
                            HACKER
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-[#FAC775] text-sm">{entry.score}</div>
                    <div className="text-[9px] text-slate-400">điểm</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. FOOTER NOTE */}
      <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
        <span>⚡ 60s Solo Challenge</span>
        <span className="text-[#4CE0D2] font-semibold">#FUDEVER_ARENA</span>
      </div>
    </aside>
  );
};
