"use client";

import React, { useMemo } from "react";
import { Dream } from "@/types/dream";
import { Sparkles, Hash } from "lucide-react";

interface WordCloudProps {
  dreams: Dream[];
}

const STOP_WORDS = new Set([
  "và", "là", "của", "được", "các", "cho", "trong", "với", "có", "để",
  "một", "mình", "khi", "em", "con", "bạn", "tôi", "sẽ", "đã", "đang",
  "những", "nhiều", "rất", "luôn", "thật", "nhất", "này", "đó", "ở", "về",
  "cùng", "nhé", "nha", "ạ", "ơi", "mong", "muốn", "chúc", "ước", "ngày",
  "hội", "năm", "tháng", "k22", "k21", "k20"
]);

const COLOR_PALETTE = [
  "#FAC775", // Amber Gold
  "#0091EA", // DEVER Blue
  "#00F5D4", // Cyber Cyan
  "#FFD166", // Bright Gold
  "#85B7EB", // Sky Blue
  "#FA8072", // Coral Red
  "#E0AA4E", // Warm Ochre
];

export const WordCloudVisualizer: React.FC<WordCloudProps> = ({ dreams }) => {
  const wordFrequency = useMemo(() => {
    const counts: Record<string, number> = {};

    dreams.forEach((d) => {
      if (d.hidden) return;
      // Clean and tokenize text
      const words = d.content
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“”]/g, " ")
        .split(/\s+/);

      words.forEach((w) => {
        const cleaned = w.trim();
        if (cleaned.length >= 3 && !STOP_WORDS.has(cleaned) && isNaN(Number(cleaned))) {
          // Capitalize first letter
          const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
          counts[capitalized] = (counts[capitalized] || 0) + 1;
        }
      });
    });

    const sorted = Object.entries(counts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 24);

    return sorted;
  }, [dreams]);

  if (wordFrequency.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
        Chưa đủ dữ liệu để phân tích từ khóa phổ biến.
      </div>
    );
  }

  const maxCount = Math.max(...wordFrequency.map((w) => w.count), 1);

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-[#993c1d]" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Từ Khóa Ước Mơ Xu Hướng (Word Cloud)
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-semibold">
          {wordFrequency.length} từ khóa nổi bật
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-gradient-to-br from-[#12203A] to-[#0a1222] rounded-2xl border border-[#fac775]/30 min-h-[160px]">
        {wordFrequency.map((item, idx) => {
          const ratio = item.count / maxCount;
          // Scale font size between 11px and 22px
          const fontSize = Math.max(11, Math.min(22, 11 + ratio * 11));
          const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];

          return (
            <div
              key={item.word}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-default select-none animate-in zoom-in-90"
              style={{
                borderColor: `${color}40`,
                borderWidth: "1px",
              }}
            >
              <span
                className="font-extrabold tracking-wide"
                style={{
                  fontSize: `${fontSize}px`,
                  color: color,
                  textShadow: `0 0 10px ${color}60`,
                }}
              >
                #{item.word}
              </span>
              <span className="text-[10px] text-white/50 font-bold ml-0.5">
                ({item.count})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
