"use client";

import React from "react";
import Image from "next/image";
import { BuggyMood } from "@/types/duel";

interface Props {
  mood: BuggyMood;
  line: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  title?: string;
}

// Map mood to appropriate Buggy mascot asset
function getBuggyMoodAsset(mood: BuggyMood): string {
  switch (mood) {
    case "happy":
      return "/assets/buggy/11.png"; // Heart eyes/happy
    case "smug":
      return "/assets/buggy/6.png"; // Cool sunglasses
    case "shocked":
      return "/assets/buggy/8.png"; // Coffee panic / surprised
    case "victory":
      return "/assets/buggy/9.png"; // Celebrate
    case "crying":
      return "/assets/buggy/4.png";
    case "thinking":
      return "/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png";
    default:
      return "/assets/buggy/11.png";
  }
}

export const BuggyAvatarDialogue: React.FC<Props> = ({
  mood,
  line,
  size = "md",
  animate = true,
  title,
}) => {
  const assetUrl = getBuggyMoodAsset(mood);

  const avatarDimensions =
    size === "sm" ? "w-12 h-12" : size === "lg" ? "w-20 h-20" : "w-16 h-16";

  return (
    <div className="flex items-start gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Buggy Mascot Avatar */}
      <div
        className={`relative shrink-0 rounded-2xl bg-gradient-to-br from-[#0091EA]/30 to-[#12203A] border-2 border-[#4CE0D2] p-1.5 shadow-[0_0_15px_rgba(76,224,210,0.3)] flex items-center justify-center ${avatarDimensions} ${
          animate ? "animate-float" : ""
        }`}
      >
        <Image
          src={assetUrl}
          alt="Buggy Mascot"
          width={64}
          height={64}
          style={{ width: "auto", height: "auto" }}
          className="object-contain"
        />
        {/* Glow Tag */}
        <span className="absolute -bottom-1.5 -right-1 bg-[#4CE0D2] text-[#0B1220] text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
          Buggy
        </span>
      </div>

      {/* Cyber Speech Bubble */}
      <div className="relative flex-1 bg-[#12203A]/90 backdrop-blur-md border border-[#4CE0D2]/50 rounded-2xl p-3 shadow-lg">
        {/* Speech Pointer */}
        <div className="absolute top-4 -left-1.5 w-3 h-3 bg-[#12203A] border-l border-b border-[#4CE0D2]/50 transform rotate-45" />

        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-black text-[#4CE0D2] uppercase tracking-wider">
            {title || "Lời Bình Từ Buggy"}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#4CE0D2] animate-ping" />
        </div>

        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed italic">
          &ldquo;{line}&rdquo;
        </p>
      </div>
    </div>
  );
};
