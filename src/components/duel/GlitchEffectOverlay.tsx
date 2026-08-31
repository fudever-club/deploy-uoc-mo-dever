"use client";

import React, { useEffect, useState } from "react";

interface Props {
  active: boolean;
  onDone?: () => void;
}

export const GlitchEffectOverlay: React.FC<Props> = ({ active, onDone }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDone) onDone();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [active, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-xs">
      {/* Glitch Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40 animate-pulse" />

      {/* Cyber Shock Banner */}
      <div className="relative text-center p-8 rounded-3xl bg-[#0B1220]/95 border-2 border-[#E14CE8] shadow-[0_0_50px_rgba(225,76,232,0.6)] animate-in zoom-in-95 duration-200">
        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4CE0D2] via-[#E14CE8] to-[#FAC775] tracking-wider uppercase drop-shadow-[0_0_20px_rgba(76,224,210,0.8)]">
          ⚡ SYSTEM GLITCH OVERRIDE ⚡
        </h2>
        <p className="text-sm sm:text-base text-white/90 font-mono font-bold mt-2">
          GOD MODE ACTIVATED BY FU-DEVER ADMIN!
        </p>
        <p className="text-xs text-[#FAC775] font-semibold mt-1">
          Hệ thống đang nhân đôi vận may cho các đấu thủ tại sảnh trường!
        </p>
      </div>
    </div>
  );
};
