"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { Dream, BroadcastAnnouncement, LiveReaction } from "@/types/dream";
import { DREAM_CATEGORIES } from "@/lib/constants";
import { playLanternAscendChime, playReactionSound, playPoemMagicSound, playTactileClick } from "@/lib/audio-synthesizer";
import { ambientSound } from "@/lib/ambient-sound";
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
  Sun,
  Moon,
  Zap,
  RotateCw,
  Wind,
  Globe2,
} from "lucide-react";
import { StandeeQRModal } from "@/components/StandeeQRModal";
import { LanternSkyCanvas, SkyTheme } from "@/components/LanternSkyCanvas";
import { ConstellationGalaxyView } from "@/components/ConstellationGalaxyView";
import { FloatingLanternCardsSky, FlightMode } from "@/components/FloatingLanternCardsSky";

export default function DisplaySkyPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");
  const [activeAnnouncement, setActiveAnnouncement] = useState<BroadcastAnnouncement | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [isAutoSpotlight, setIsAutoSpotlight] = useState<boolean>(true);
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const [skyTheme, setSkyTheme] = useState<SkyTheme>("midnight");

  // Flight Mode: "carousel" (Xoay vòng 3D) vs "drift" (Trôi tự do) vs "galaxy" (Chòm sao)
  const [flightMode, setFlightMode] = useState<FlightMode>("carousel");
  const [viewMode, setViewMode] = useState<"lanterns" | "galaxy">("lanterns");

  const audioUnlocked = useRef(false);

  const fetchDreams = async () => {
    try {
      const res = await fetch("/api/dreams");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDreams(json.data);
      }
    } catch (err) {
      console.error("Failed to load dreams:", err);
    }
  };

  // Real-time SSE listener
  useEffect(() => {
    fetchDreams();

    const eventSource = new EventSource("/api/dreams/stream");

    eventSource.addEventListener("connected", (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.activeAnnouncement) {
          setActiveAnnouncement(payload.activeAnnouncement);
        }
      } catch (e) {
        console.debug("SSE connect payload error:", e);
      }
    });

    eventSource.addEventListener("insert", (event) => {
      try {
        const newDream = JSON.parse(event.data) as Dream;
        if (!newDream.hidden) {
          setDreams((prev) => [newDream, ...prev.filter((d) => d.id !== newDream.id)]);

          if (soundEnabled && audioUnlocked.current) {
            playLanternAscendChime();
          }
        }
      } catch (e) {
        console.error("SSE insert error:", e);
      }
    });

    eventSource.addEventListener("update", (event) => {
      try {
        const updated = JSON.parse(event.data) as Dream;
        setDreams((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      } catch (e) {
        console.error("SSE update error:", e);
      }
    });

    eventSource.addEventListener("delete", (event) => {
      try {
        const { id } = JSON.parse(event.data) as { id: string };
        setDreams((prev) => prev.filter((d) => d.id !== id));
      } catch (e) {
        console.error("SSE delete error:", e);
      }
    });

    eventSource.addEventListener("announcement", (event) => {
      try {
        const announcement = JSON.parse(event.data) as BroadcastAnnouncement;
        setActiveAnnouncement(announcement);
      } catch (e) {
        console.error("SSE announcement error:", e);
      }
    });

    eventSource.addEventListener("reaction", (event) => {
      try {
        const react = JSON.parse(event.data) as LiveReaction;
        setReactions((prev) => [...prev.slice(-15), react]);

        if (soundEnabled && audioUnlocked.current) {
          playReactionSound(react.emoji);
        }
      } catch (e) {
        console.error("SSE reaction error:", e);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [soundEnabled]);

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
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#12203A] text-[#faeeda]">
      {/* 1. BACKGROUND PARTICLES & SKY LAYER */}
      <LanternSkyCanvas theme={skyTheme} />

      {/* 2. DYNAMIC FLOATING LANTERN WISH CARDS (OR CONSTELLATION GALAXY) */}
      {viewMode === "lanterns" ? (
        <FloatingLanternCardsSky
          dreams={dreams}
          theme={skyTheme}
          flightMode={flightMode}
          selectedTagFilter={selectedTagFilter}
          onSelectDream={(d) => setSelectedDream(d)}
        />
      ) : (
        <ConstellationGalaxyView
          dreams={dreams}
          onSelectDream={(d) => setSelectedDream(d)}
        />
      )}

      {/* 3. TOP FLOATING CONTROL DOCK */}
      <div className="absolute top-4 inset-x-4 z-40 flex items-center justify-between pointer-events-none">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#993c1d] to-[#12203A] p-1 border-2 border-[#fac775] shadow-lg flex items-center justify-center">
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
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight drop-shadow-md flex items-center gap-1.5 font-display">
              <span>Deploy Ước Mơ · Club Day 2026</span>
              <span className="text-xs">🏮</span>
            </h1>
          </div>
        </div>

        {/* Action Controls Dock */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
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
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
              title="Chế độ Chòm Sao Thiên Hà"
            >
              <Globe2 className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden md:inline">Chòm Sao</span>
            </button>
          </div>

          {/* SKY THEME SWITCHER */}
          {viewMode === "lanterns" && (
            <div className="hidden lg:flex items-center p-1 rounded-full bg-white/10 backdrop-blur-md border border-[#fac775]/30 shadow-lg">
              <button
                onClick={() => {
                  playTactileClick();
                  setSkyTheme("midnight");
                }}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  skyTheme === "midnight" ? "bg-[#fac775] text-[#12203A]" : "text-white/60 hover:text-white"
                }`}
                title="Trời đêm Trăng Rằm"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  playTactileClick();
                  setSkyTheme("cyber");
                }}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  skyTheme === "cyber" ? "bg-[#00f5d4] text-[#050914]" : "text-white/60 hover:text-white"
                }`}
                title="DEVER Cyber Neon"
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  playTactileClick();
                  setSkyTheme("dawn");
                }}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  skyTheme === "dawn" ? "bg-[#ffb800] text-[#3a1306]" : "text-white/60 hover:text-white"
                }`}
                title="Bình Minh K22"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
            <Megaphone className="w-5 h-5 text-[#fac775] shrink-0 animate-bounce" />
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
                src={`/assets/buggy/${selectedDream.mascotIndex || 1}.png`}
                alt="Mascot"
                width={48}
                height={48}
                className="object-contain animate-bounce"
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
