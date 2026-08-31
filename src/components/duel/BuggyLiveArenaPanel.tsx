"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { LeaderboardEntry, LiveDuelBroadcast } from "@/types/duel";
import { Trophy, Flame, Swords, Sparkles, Medal, ShieldAlert } from "lucide-react";

interface Props {
  liveDuel: LiveDuelBroadcast | null;
  leaderboard: LeaderboardEntry[];
}

export const BuggyLiveArenaPanel: React.FC<Props> = ({
  liveDuel,
  leaderboard,
}) => {
  const [activeComment, setActiveComment] = useState(
    "Buggy đang chờ đón các cao thủ IT K22 bước vào so tài tại /duel!"
  );

  useEffect(() => {
    if (liveDuel?.buggyComment) {
      setActiveComment(liveDuel.buggyComment);
    }
  }, [liveDuel?.buggyComment]);

  return (
    <div className="h-full w-full bg-[#0B1220]/95 backdrop-blur-xl border-l-2 border-[#4CE0D2]/40 p-4 sm:p-5 flex flex-col justify-between text-slate-100 overflow-y-auto scrollbar-none shadow-2xl space-y-4">
      {/* 1. ARENA TOP HEADER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0091EA] to-[#E14CE8] p-1 flex items-center justify-center border border-[#FAC775] shadow-[0_0_15px_rgba(76,224,210,0.5)]">
              <Swords className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-[#4CE0D2] text-[#0B1220]">
                  LIVE ARENA
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight mt-0.5">
                Buggy AI Arena
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block">
              Quét QR chơi:
            </span>
            <span className="text-xs font-mono font-black text-[#FAC775]">
              /duel
            </span>
          </div>
        </div>

        {/* 2. LIVE MATCH STATUS CARD */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#12203A] to-[#1a2d4f] border border-[#4CE0D2]/40 shadow-lg space-y-2">
          {liveDuel && Date.now() - liveDuel.timestamp < 60000 ? (
            <div className="space-y-1.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#4CE0D2] flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5" />
                  Đang đấu: {liveDuel.nickname}
                </span>
                <span className="text-[#FAC775] font-mono">
                  {liveDuel.currentScore ?? 0} pts
                </span>
              </div>

              {liveDuel.streak && liveDuel.streak > 1 ? (
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#E14CE8]">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Streak x{liveDuel.streak} liên tiếp!</span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-[#12203A] border border-[#4CE0D2] p-1 shrink-0">
                <Image
                  src="/assets/buggy/11.png"
                  alt="Buggy"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">
                  Đang chờ đấu thủ tiếp theo...
                </div>
                <div className="text-[10px] text-slate-400">
                  Truy cập /duel trên điện thoại để thách đấu Buggy!
                </div>
              </div>
            </div>
          )}

          {/* Buggy Live Commentary */}
          <div className="pt-1 border-t border-white/10 text-[11px] text-[#FAC775] italic leading-relaxed">
            &ldquo;{activeComment}&rdquo;
          </div>
        </div>
      </div>

      {/* 3. TOP 10 REALTIME LEADERBOARD */}
      <div className="flex-1 space-y-2 flex flex-col justify-start min-h-0">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <div className="flex items-center gap-1 text-[#FAC775]">
            <Trophy className="w-4 h-4" />
            <span>Top 10 Bảng Vàng Trong Ngày</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {leaderboard.length} Đấu thủ
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
          {leaderboard.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 rounded-2xl bg-white/5 border border-white/5">
              Chưa có ai đấu — bạn sẽ là người đầu tiên ghi danh?
            </div>
          ) : (
            leaderboard.map((item, idx) => {
              const isTop1 = idx === 0;
              const isTop3 = idx < 3;

              let rankStyle = "bg-white/5 border-white/10 text-slate-300";
              let badgeColor = "bg-slate-700 text-slate-300";

              if (isTop1) {
                rankStyle =
                  "bg-gradient-to-r from-amber-500/20 to-amber-900/40 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(250,199,117,0.25)]";
                badgeColor = "bg-[#FAC775] text-[#0B1220]";
              } else if (idx === 1) {
                rankStyle =
                  "bg-gradient-to-r from-cyan-500/20 to-slate-800/40 border-cyan-400/60 text-cyan-200";
                badgeColor = "bg-[#4CE0D2] text-[#0B1220]";
              } else if (idx === 2) {
                rankStyle =
                  "bg-gradient-to-r from-rose-500/20 to-slate-800/40 border-rose-400/60 text-rose-200";
                badgeColor = "bg-rose-400 text-[#0B1220]";
              }

              return (
                <div
                  key={item.id || idx}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-xs font-bold ${rankStyle}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono font-black text-[10px] shrink-0 ${badgeColor}`}
                    >
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[120px]">
                      {item.nickname}
                    </span>
                    {item.tier === 2 && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-[#FAC775] shrink-0">
                        👑 5/5
                      </span>
                    )}
                  </div>

                  <span className="font-mono font-black text-right shrink-0">
                    {item.score} <span className="text-[9px] opacity-70">pts</span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. FOOTER NOTE */}
      <div className="pt-2 border-t border-white/10 text-[10px] text-slate-500 text-center">
        🏆 Top 5 nhận phần quà đặc biệt trao tay lúc 11:30!
      </div>
    </div>
  );
};
