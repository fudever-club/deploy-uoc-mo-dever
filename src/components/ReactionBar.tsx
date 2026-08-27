"use client";

import React, { useState } from "react";
import { Heart, Sparkles } from "lucide-react";

export const ReactionBar: React.FC = () => {
  const [lastSent, setLastSent] = useState<string | null>(null);

  const emojis = [
    { emoji: "🏮", label: "Đèn lồng" },
    { emoji: "❤️", label: "Thả tim" },
    { emoji: "✨", label: "Ngôi sao" },
    { emoji: "🚀", label: "Bay cao" },
    { emoji: "🐞", label: "Buggy" },
    { emoji: "🔥", label: "Nhiệt huyết" },
  ];

  const handleSendReaction = async (emoji: string) => {
    setLastSent(emoji);
    setTimeout(() => setLastSent(null), 1000);

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-4 p-2.5 rounded-2xl bg-white/80 border border-[#fac775]/40 backdrop-blur-md shadow-sm text-center">
      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#712b13] mb-1.5 uppercase tracking-wider">
        <Sparkles className="w-3 h-3 text-amber-500" />
        <span>Gửi cảm xúc lên Bầu Trời Đèn Lồng</span>
      </div>

      <div className="flex items-center justify-around gap-1">
        {emojis.map((item) => (
          <button
            key={item.emoji}
            onClick={() => handleSendReaction(item.emoji)}
            className={`p-2 rounded-xl text-lg hover:bg-[#faeeda] active:scale-125 transition-all cursor-pointer select-none ${
              lastSent === item.emoji ? "scale-125 bg-[#fac775]/30" : ""
            }`}
            title={item.label}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
