"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { playReactionSound } from "@/lib/audio-synthesizer";

export const ReactionBar: React.FC = () => {
  const [lastSent, setLastSent] = useState<string | null>(null);
  const queueRef = useRef<{ [emoji: string]: number }>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSoundTimeRef = useRef<number>(0);

  const emojis = [
    { emoji: "🏮", label: "Đèn lồng" },
    { emoji: "❤️", label: "Thả tim" },
    { emoji: "✨", label: "Ngôi sao" },
    { emoji: "🚀", label: "Bay cao" },
    { emoji: "🐞", label: "Buggy" },
    { emoji: "🔥", label: "Nhiệt huyết" },
  ];

  // Flush batched reactions to server (max 4 network requests/sec)
  const flushQueue = useCallback(async () => {
    const queue = { ...queueRef.current };
    queueRef.current = {};
    timerRef.current = null;

    const entries = Object.entries(queue);
    if (entries.length === 0) return;

    for (const [emoji, count] of entries) {
      try {
        await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji, count }),
        });
      } catch {
        // ignore network error
      }
    }
  }, []);

  const handleSendReaction = (emoji: string) => {
    // Mobile haptic feedback pulse
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore
      }
    }

    // Instant local audio throttle (max 1 sound per 90ms)
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 90) {
      playReactionSound(emoji);
      lastSoundTimeRef.current = now;
    }

    // Instant local visual feedback
    setLastSent(emoji);
    setTimeout(() => setLastSent(null), 300);

    // Queue for network batching
    queueRef.current[emoji] = (queueRef.current[emoji] || 0) + 1;

    // Schedule flush if not already scheduled
    if (!timerRef.current) {
      timerRef.current = setTimeout(flushQueue, 220);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto mt-4 p-2.5 rounded-2xl bg-white/90 border border-[#fac775]/50 backdrop-blur-md shadow-xs text-center">
      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#712b13] mb-1.5 uppercase tracking-wider">
        <Sparkles className="w-3 h-3 text-amber-500" />
        <span>Gửi cảm xúc lên Bầu Trời Đèn Lồng</span>
      </div>

      <div className="flex items-center justify-around gap-1">
        {emojis.map((item) => (
          <button
            key={item.emoji}
            onClick={() => handleSendReaction(item.emoji)}
            className={`min-w-[44px] min-h-[44px] p-2 rounded-xl text-2xl hover:bg-[#faeeda] active:scale-135 transition-transform cursor-pointer select-none flex items-center justify-center ${
              lastSent === item.emoji ? "scale-135 bg-[#fac775]/40 shadow-xs" : ""
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
