"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dream } from "@/types/dream";
import { DREAM_CATEGORIES, getBuggyMascotUrl } from "@/lib/constants";
import { playLanternAscendChime, playReactionSound, playPoemMagicSound, playTactileClick } from "@/lib/audio-synthesizer";
import { ambientSound } from "@/lib/ambient-sound";
import { useRealtimeDreams } from "@/lib/use-realtime-dreams";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  QrCode,
  X,
  Megaphone,
  Radio,
  Play,
  RotateCw,
  Wind,
  Globe2,
  Wifi,
  ArrowLeft,
  Home,
} from "lucide-react";
import { StandeeQRModal } from "@/components/StandeeQRModal";
import { LanternSkyCanvas } from "@/components/LanternSkyCanvas";
import { ConstellationGalaxyView } from "@/components/ConstellationGalaxyView";
import { FloatingLanternCardsSky, FlightMode } from "@/components/FloatingLanternCardsSky";
import { FireworksCanvas } from "@/components/FireworksCanvas";
import { MysteryDropBanner } from "@/components/MysteryDropBanner";
import { LiveReaction } from "@/types/dream";

export default function DisplaySkyPage() {
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [isAutoSpotlight, setIsAutoSpotlight] = useState<boolean>(true);
  const [latestReaction, setLatestReaction] = useState<LiveReaction | null>(null);

  // Flight Mode: "carousel" (Xoay vòng 3D) vs "drift" (Trôi tự do) vs "galaxy" (Chòm sao)
  const [flightMode, setFlightMode] = useState<FlightMode>("carousel");
  const [viewMode, setViewMode] = useState<"lanterns" | "galaxy">("lanterns");

  const audioUnlocked = useRef(false);

  // Sound handlers
  const handleNewDream = useCallback((dream: Dream) => {
    if (soundEnabled && audioUnlocked.current && !dream.hidden) {
      playLanternAscendChime();
    }
  }, [soundEnabled]);

  const handleReaction = useCallback((reaction: { emoji: string; id?: string; x?: number; timestamp?: number }) => {
    const fullReaction: LiveReaction = {
      id: reaction.id || `react-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      emoji: reaction.emoji,
      x: typeof reaction.x === "number" ? reaction.x : Math.random() * 80 + 10,
      timestamp: reaction.timestamp || Date.now(),
    };
    setLatestReaction(fullReaction);
  }, []);

  // Unified Realtime Hook (Direct Supabase Channel + SSE + Resilient Adaptive Polling)
  const {
    dreams,
    activeAnnouncement,
    activeMysteryDrop,
    setActiveMysteryDrop,
    reactions,
    connectionStatus,
  } = useRealtimeDreams({
    onInsert: handleNewDream,
    onReaction: handleReaction,
  });

  // Unlock procedural ambient audio on first user interaction
  useEffect(() => {
    const handleUnlockAudio = () => {
      if (!audioUnlocked.current) {
        audioUnlocked.current = true;
        if (soundEnabled) {
          ambientSound.start();
        }
      }
    };

    window.addEventListener("click", handleUnlockAudio, { once: true });
    window.addEventListener("keydown", handleUnlockAudio, { once: true });

    return () => {
      window.removeEventListener("click", handleUnlockAudio);
      window.removeEventListener("keydown", handleUnlockAudio);
    };
  }, [soundEnabled]);

  const toggleSound = () => {
    playTactileClick();
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      ambientSound.start();
    } else {
      ambientSound.stop();
    }
  };

  const toggleFullscreen = () => {
    playTactileClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const visibleDreams = useMemo(() => dreams.filter((d) => !d.hidden), [dreams]);

  const [isDisplayIdle, setIsDisplayIdle] = useState(false);

  // Auto-spotlight rotation every 12 seconds
  useEffect(() => {
    if (!isAutoSpotlight || visibleDreams.length === 0) return;

    const timer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % visibleDreams.length);
    }, 12000);

    return () => clearInterval(timer);
  }, [isAutoSpotlight, visibleDreams.length]);

  const currentSpotlightDream = visibleDreams[spotlightIndex] || null;

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none bg-[#12203A] text-[#faeeda] ${
        isDisplayIdle ? "cursor-none" : ""
      }`}
    >
      {/* 1. BACKGROUND PARTICLES & SKY LAYER */}
      <LanternSkyCanvas />

      {/* 2. DYNAMIC FLOATING LANTERN WISH CARDS (OR CONSTELLATION GALAXY) */}
      {viewMode === "lanterns" ? (
        <FloatingLanternCardsSky
          dreams={dreams}
          flightMode={flightMode}
          selectedTagFilter={selectedTagFilter}
          onSelectDream={(d) => setSelectedDream(d)}
          onIdleChange={setIsDisplayIdle}
        />
      ) : (
        <ConstellationGalaxyView
          dreams={dreams}
          onSelectDream={(d) => setSelectedDream(d)}
        />
      )}

      {/* 2.5 LIVE CROWD FIREWORKS & REACTIONS OVERLAY */}
      <FireworksCanvas
        latestReaction={latestReaction}
        soundEnabled={soundEnabled}
      />

      {/* 2.6 SECRET MYSTERY DROP BANNER (SINGLE WINNER) */}
      <MysteryDropBanner
        drop={activeMysteryDrop}
        onClose={() => setActiveMysteryDrop(null)}
        soundEnabled={soundEnabled}
      />

      {/* 3. TOP FLOATING CONTROL DOCK */}
      <div className="absolute top-4 inset-x-4 z-40 flex items-center justify-between pointer-events-none">
        {/* Brand Header & Home Link */}
        <Link
          href="/"
          onClick={() => playTactileClick()}
          className="flex items-center gap-3 pointer-events-auto group hover:opacity-95 transition-opacity select-none cursor-pointer"
          title="Quay về trang chủ Deploy Ước Mơ"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#993c1d] to-[#12203A] p-1 border-2 border-[#fac775] shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image
              src="/assets/logo/logo-dever-white.png"
              alt="FU-DEVER Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#fac775] text-[#712b13] uppercase tracking-wider">
                CLB LẬP TRÌNH FU-DEVER
              </span>
              <span className="hidden sm:inline-block text-[11px] text-[#fac775]/90 font-semibold">
                FPT University Da Nang
              </span>
              {/* Connection Status Badge */}
              <span
                className="hidden md:inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-400/40 text-emerald-300 font-mono"
                title={`Kết nối Realtime: ${connectionStatus}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Wifi className="w-2.5 h-2.5" />
                <span>{connectionStatus === "supabase" ? "SUPABASE" : connectionStatus === "sse" ? "SSE LIVE" : "LIVE"}</span>
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight drop-shadow-md flex items-center gap-1.5 font-display">
              <span>Deploy Ước Mơ · Club Day 2026</span>
              <span className="text-xs">🏮</span>
            </h1>
          </div>
        </Link>

        {/* Action Controls Dock */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Back to Home Button */}
          <Link
            href="/"
            onClick={() => playTactileClick()}
            className="px-3 py-2 rounded-full bg-gradient-to-r from-[#993c1d] to-[#712b13] hover:opacity-95 border border-[#fac775]/50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md group cursor-pointer"
            title="Quay về trang gửi ước mơ K22"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#fac775] group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Trang Chủ</span>
          </Link>

          {/* FLIGHT MOTION MODE SWITCHER */}
          <div className="flex items-center p-1 rounded-full bg-white/10 backdrop-blur-md border border-[#fac775]/40 shadow-lg">
            <button
              onClick={() => {
                playTactileClick();
                setViewMode("lanterns");
                setFlightMode("carousel");
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "lanterns" && flightMode === "carousel"
                  ? "bg-gradient-to-r from-[#993c1d] to-[#712b13] text-white shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
              title="Chế độ Bay Xoay Vòng 3D (Đèn Kéo Quân Vũ Trụ - Ai cũng được nhìn thấy)"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">Bay Xoay Vòng</span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                setViewMode("lanterns");
                setFlightMode("drift");
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "lanterns" && flightMode === "drift"
                  ? "bg-gradient-to-r from-[#0091ea] to-[#0055a5] text-white shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
              title="Chế độ Trôi Tự Do Tự Nhiên"
            >
              <Wind className="w-3.5 h-3.5 text-sky-300" />
              <span className="hidden md:inline">Trôi Tự Do</span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                setViewMode("galaxy");
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "galaxy"
                  ? "bg-gradient-to-r from-[#0091ea] to-[#12203a] border border-[#85b7eb]/50 text-white shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
              title="Chế độ Chòm Sao Thiên Hà"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#85b7eb]" />
              <span className="hidden md:inline">Chòm Sao</span>
            </button>
          </div>

          {/* Dream Counter Badge */}
          <div id="counter-pill" className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-[#fac775]/40 shadow-lg">
            <Sparkles className="w-4 h-4 text-[#fac775] animate-pulse" />
            <span className="text-sm font-extrabold text-white">
              {visibleDreams.length}
            </span>
            <span className="text-xs text-[#faeeda]/90 font-medium">
              <span className="inline sm:hidden">ước mơ</span>
              <span className="hidden sm:inline">ước mơ đã bay lên</span>
            </span>
          </div>

          {/* Standee QR Code Button */}
          <button
            onClick={() => {
              playTactileClick();
              setShowQRModal(true);
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-[#fac775]/30 text-[#fac775] transition-colors shadow-md cursor-pointer"
            title="Mở mã QR Standee"
          >
            <QrCode className="w-4 h-4 text-[#0091ea]" />
          </button>

          {/* Auto-Spotlight Toggle */}
          <button
            onClick={() => {
              playTactileClick();
              setIsAutoSpotlight(!isAutoSpotlight);
            }}
            className={`p-2.5 rounded-full border transition-colors shadow-md cursor-pointer ${
              isAutoSpotlight
                ? "bg-[#fac775]/25 border-[#fac775] text-[#fac775]"
                : "bg-white/10 border-white/20 text-white/50"
            }`}
            title={isAutoSpotlight ? "Tạm dừng chiếu tiêu điểm" : "Bật chiếu tiêu điểm tự động"}
          >
            {isAutoSpotlight ? <Radio className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Sound Toggle (Ambient + Chime) */}
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-[#fac775]/30 text-[#fac775] transition-colors shadow-md cursor-pointer"
            title={soundEnabled ? "Tắt âm thanh nhạc nền" : "Bật âm thanh nhạc nền"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-60" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-[#fac775]/30 text-[#fac775] transition-colors shadow-md cursor-pointer"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 4. BROADCAST ANNOUNCEMENT BANNER IF ACTIVE */}
      {activeAnnouncement && activeAnnouncement.active && (
        <div className="absolute top-18 inset-x-6 z-30 pointer-events-none flex justify-center animate-in slide-in-from-top duration-300">
          <div className="max-w-2xl px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#993c1d]/95 via-[#0091ea]/90 to-[#993c1d]/95 border-2 border-[#fac775] shadow-2xl backdrop-blur-md flex items-center gap-3 text-white text-xs sm:text-sm font-bold">
            <Megaphone className="w-5 h-5 text-[#fac775] shrink-0 animate-pulse" />
            <span className="truncate">{activeAnnouncement.message}</span>
          </div>
        </div>
      )}

      {/* 5. LIVE REACTIONS RISING FLOAT STREAM */}
      <div className="absolute inset-x-0 bottom-0 top-1/2 pointer-events-none z-25 overflow-hidden">
        {reactions.map((react, idx) => (
          <div
            key={react.id}
            className="absolute bottom-4 text-3xl animate-in fade-in zoom-in-75 duration-300"
            style={{
              left: `${(idx * 17 + 25) % 85}%`,
              animation: "floatSlow 4.5s ease-out forwards",
            }}
          >
            <span className="drop-shadow-[0_0_12px_rgba(250,199,117,0.8)] select-none">
              {react.emoji}
            </span>
          </div>
        ))}
      </div>

      {/* 6. SPOTLIGHT CAROUSEL BANNER (Bottom-left card) */}
      {currentSpotlightDream && isAutoSpotlight && (
        <div
          onClick={() => {
            playPoemMagicSound();
            setSelectedDream(currentSpotlightDream);
          }}
          className="absolute bottom-6 left-6 z-30 max-w-sm p-4 rounded-3xl bg-[#12203A]/90 border border-[#fac775] backdrop-blur-xl shadow-2xl cursor-pointer hover:scale-105 transition-all animate-in slide-in-from-bottom duration-500 pointer-events-auto"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#fac775] mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Tiêu Điểm Ước Mơ</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
              {DREAM_CATEGORIES.find((c) => c.id === currentSpotlightDream.tag)?.emoji}{" "}
              {DREAM_CATEGORIES.find((c) => c.id === currentSpotlightDream.tag)?.shortLabel}
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-white mb-1">
            {currentSpotlightDream.name || "Tân Sinh Viên K22"}
          </h4>

          <p className="text-xs text-[#faeeda]/90 italic line-clamp-3 leading-relaxed whitespace-pre-line">
            &ldquo;{currentSpotlightDream.content}&rdquo;
          </p>

          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#fac775]">
            <span>✨ Chạm để xem Dream Card Story</span>
            <span>#FUDEVER2026</span>
          </div>
        </div>
      )}

      {/* 7. CATEGORY FILTER BAR (Bottom Center) */}
      {viewMode === "lanterns" && (
        <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
          <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-[#12203A]/85 backdrop-blur-xl border border-[#fac775]/40 shadow-2xl pointer-events-auto overflow-x-auto max-w-full">
            <button
              onClick={() => {
                playTactileClick();
                setSelectedTagFilter("all");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedTagFilter === "all"
                  ? "bg-[#fac775] text-[#12203a] shadow-xs"
                  : "text-[#faeeda]/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Tất cả ({visibleDreams.length})
            </button>

            {DREAM_CATEGORIES.map((cat) => {
              const count = visibleDreams.filter((l) => l.tag === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playTactileClick();
                    setSelectedTagFilter(cat.id);
                  }}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    selectedTagFilter === cat.id
                      ? "bg-[#993c1d] text-white border border-[#fac775] shadow-xs"
                      : "text-[#faeeda]/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="hidden md:inline">{cat.shortLabel}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. SPOTLIGHT DREAM DETAIL MODAL */}
      {selectedDream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#12203A] border-2 border-[#fac775] rounded-3xl shadow-2xl p-6 text-[#faeeda] animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedDream(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mascot */}
            <div className="w-16 h-16 rounded-full bg-[#faeeda] border-2 border-[#fac775] mx-auto mb-3 flex items-center justify-center p-1 shadow-lg">
              <Image
                src={getBuggyMascotUrl(selectedDream.mascotIndex)}
                alt="Mascot"
                width={48}
                height={48}
                className="object-contain animate-float"
              />
            </div>

            <div className="text-center mb-4">
              <span className="inline-block text-[11px] font-bold px-3 py-0.5 rounded-full bg-[#fac775]/20 text-[#fac775] uppercase tracking-wider mb-1">
                {DREAM_CATEGORIES.find((c) => c.id === selectedDream.tag)?.emoji}{" "}
                {DREAM_CATEGORIES.find((c) => c.id === selectedDream.tag)?.label}
              </span>
              <h3 className="text-xl font-extrabold text-white">
                {selectedDream.name || "Tân Sinh Viên K22"}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center mb-6">
              <p className="text-base text-white italic font-medium leading-relaxed whitespace-pre-line">
                &ldquo;{selectedDream.content}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#fac775]/90 border-t border-white/10 pt-3">
              <span>🏮 FU-DEVER Club Day 2026</span>
              <span>FPT University Da Nang</span>
            </div>
          </div>
        </div>
      )}

      {/* Standee QR Modal */}
      <StandeeQRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </div>
  );
}
