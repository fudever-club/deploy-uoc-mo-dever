"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { Dream, LanternItem, BroadcastAnnouncement, LiveReaction } from "@/types/dream";
import { DREAM_CATEGORIES, EVENT_INFO } from "@/lib/constants";
import { playLanternAscendChime, playReactionSound, playPoemMagicSound } from "@/lib/audio-synthesizer";
import { ambientSound } from "@/lib/ambient-sound";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  QrCode,
  Heart,
  X,
  Megaphone,
  Radio,
  Play,
  Sun,
  Moon,
  Zap,
  Layers,
  Globe2,
} from "lucide-react";
import { StandeeQRModal } from "@/components/StandeeQRModal";
import { LanternSkyCanvas, SkyTheme } from "@/components/LanternSkyCanvas";
import { ConstellationGalaxyView } from "@/components/ConstellationGalaxyView";

export default function DisplaySkyPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [lanterns, setLanterns] = useState<LanternItem[]>([]);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [hoveredDream, setHoveredDream] = useState<LanternItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");
  const [activeAnnouncement, setActiveAnnouncement] = useState<BroadcastAnnouncement | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [isAutoSpotlight, setIsAutoSpotlight] = useState<boolean>(true);
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const [skyTheme, setSkyTheme] = useState<SkyTheme>("midnight");

  // View Mode: Classic Lantern Sky vs Constellation Galaxy
  const [viewMode, setViewMode] = useState<"lanterns" | "galaxy">("lanterns");

  const audioUnlocked = useRef(false);

  // Pre-generate static background stars
  const staticStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      stars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 90,
        size: Math.random() * 2.5 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5,
      });
    }
    return stars;
  }, []);

  const calculateLanternPosition = (index: number, total: number): { x: number; y: number; delay: number; scale: number } => {
    const cols = total > 50 ? 10 : total > 25 ? 7 : 5;
    const colIndex = index % cols;
    const rowIndex = Math.floor(index / cols);

    const cellWidth = 84 / cols;
    const cellHeight = 65 / Math.max(1, Math.ceil(total / cols));

    const jitterX = (Math.sin(index * 99) * 0.4 + 0.5) * (cellWidth * 0.6);
    const jitterY = (Math.cos(index * 77) * 0.4 + 0.5) * (cellHeight * 0.6);

    const x = 7 + colIndex * cellWidth + jitterX;
    const y = 16 + rowIndex * cellHeight + jitterY;

    const scale = total > 60 ? 0.72 : total > 35 ? 0.82 : 0.95;
    const delay = (index % 10) * 0.2;

    return { x, y: Math.min(y, 80), delay, scale };
  };

  const updateLanternsFromDreams = (dreamList: Dream[]) => {
    const visibleList = dreamList.filter((d) => !d.hidden);
    const total = visibleList.length;

    const mapped: LanternItem[] = visibleList.map((dream, idx) => {
      const pos = calculateLanternPosition(idx, total);
      return {
        ...dream,
        x: pos.x,
        y: pos.y,
        delay: pos.delay,
        scale: pos.scale,
      };
    });

    setLanterns(mapped);
  };

  const fetchDreams = async () => {
    try {
      const res = await fetch("/api/dreams");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDreams(json.data);
        updateLanternsFromDreams(json.data);
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
          setDreams((prev) => {
            const next = [newDream, ...prev.filter((d) => d.id !== newDream.id)];
            updateLanternsFromDreams(next);
            return next;
          });

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
        setDreams((prev) => {
          const next = prev.map((d) => (d.id === updated.id ? updated : d));
          updateLanternsFromDreams(next);
          return next;
        });
      } catch (e) {
        console.error("SSE update error:", e);
      }
    });

    eventSource.addEventListener("delete", (event) => {
      try {
        const { id } = JSON.parse(event.data) as { id: string };
        setDreams((prev) => {
          const next = prev.filter((d) => d.id !== id);
          updateLanternsFromDreams(next);
          return next;
        });
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
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      ambientSound.start();
    } else {
      ambientSound.stop();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Filter lanterns by category
  const displayedLanterns = useMemo(() => {
    if (selectedTagFilter === "all") return lanterns;
    return lanterns.filter((l) => l.tag === selectedTagFilter);
  }, [lanterns, selectedTagFilter]);

  // Auto-spotlight rotation every 12 seconds
  useEffect(() => {
    if (!isAutoSpotlight || displayedLanterns.length === 0) return;

    const timer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % displayedLanterns.length);
    }, 12000);

    return () => clearInterval(timer);
  }, [isAutoSpotlight, displayedLanterns.length]);

  const currentSpotlightDream = displayedLanterns[spotlightIndex] || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#12203A] text-[#faeeda]">
      {/* 1. BACKGROUND CANVAS & STARS */}
      {viewMode === "lanterns" ? (
        <LanternSkyCanvas theme={skyTheme} />
      ) : (
        <ConstellationGalaxyView
          dreams={dreams}
          onSelectDream={(d) => {
            setSelectedDream(d);
            playPoemMagicSound();
          }}
        />
      )}

      {/* 2. TOP FLOATING CONTROL DOCK */}
      <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between pointer-events-none">
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
          {/* VIEW MODE SWITCHER (Lanterns vs Galaxy) */}
          <div className="flex items-center p-1 rounded-full bg-white/10 backdrop-blur-md border border-[#fac775]/40 shadow-lg">
            <button
              onClick={() => setViewMode("lanterns")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "lanterns"
                  ? "bg-[#993c1d] text-white shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
              title="Chế độ Bầu Trời Đèn Lồng"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đèn Lồng</span>
            </button>
            <button
              onClick={() => setViewMode("galaxy")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "galaxy"
                  ? "bg-[#0091ea] text-white shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
              title="Chế độ Chòm Sao Thiên Hà"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chòm Sao</span>
            </button>
          </div>

          {/* SKY THEME SWITCHER */}
          {viewMode === "lanterns" && (
            <div className="hidden md:flex items-center p-1 rounded-full bg-white/10 backdrop-blur-md border border-[#fac775]/30 shadow-lg">
              <button
                onClick={() => setSkyTheme("midnight")}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  skyTheme === "midnight" ? "bg-[#fac775] text-[#12203A]" : "text-white/60 hover:text-white"
                }`}
                title="Trời đêm Trăng Rằm"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSkyTheme("cyber")}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  skyTheme === "cyber" ? "bg-[#00f5d4] text-[#050914]" : "text-white/60 hover:text-white"
                }`}
                title="DEVER Cyber Neon"
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSkyTheme("dawn")}
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
              {lanterns.length}
            </span>
            <span className="text-xs text-[#faeeda]/90 font-medium">
              <span className="inline sm:hidden">ước mơ</span>
              <span className="hidden sm:inline">ước mơ đã bay lên</span>
            </span>
          </div>

          {/* Standee QR Code Button */}
          <button
            onClick={() => setShowQRModal(true)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-[#fac775]/30 text-[#fac775] transition-colors shadow-md cursor-pointer"
            title="Mở mã QR Standee"
          >
            <QrCode className="w-4 h-4 text-[#0091ea]" />
          </button>

          {/* Auto-Spotlight Toggle */}
          <button
            onClick={() => setIsAutoSpotlight(!isAutoSpotlight)}
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

      {/* 2.5 BROADCAST ANNOUNCEMENT BANNER IF ACTIVE */}
      {activeAnnouncement && activeAnnouncement.active && (
        <div className="absolute top-18 inset-x-6 z-30 pointer-events-none flex justify-center animate-in slide-in-from-top duration-300">
          <div className="max-w-2xl px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#993c1d]/95 via-[#0091ea]/90 to-[#993c1d]/95 border-2 border-[#fac775] shadow-2xl backdrop-blur-md flex items-center gap-3 text-white text-xs sm:text-sm font-bold">
            <Megaphone className="w-5 h-5 text-[#fac775] shrink-0 animate-bounce" />
            <span className="truncate">{activeAnnouncement.message}</span>
          </div>
        </div>
      )}

      {/* 3. FLOATING LANTERNS SKY LAYER (When in Lanterns view mode) */}
      {viewMode === "lanterns" && (
        <div className="absolute inset-0 z-10 p-4">
          {lanterns.length === 0 ? (
            /* Empty Initial State */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-700">
              <div className="w-20 h-20 mb-4 rounded-full bg-[#fac775]/20 border border-[#fac775] flex items-center justify-center text-3xl animate-float shadow-[0_0_30px_rgba(250,199,117,0.4)]">
                🏮
              </div>
              <h2 className="text-2xl font-extrabold text-[#fac775] mb-2 drop-shadow-md font-display">
                Bầu Trời Đèn Lồng Đang Chờ Đón K22
              </h2>
              <p className="text-sm text-[#faeeda]/80 max-w-md leading-relaxed mb-6">
                Hãy là người đầu tiên quét mã QR tại gian hàng <strong>FU-DEVER</strong> để gửi ước mơ thắp sáng màn đêm!
              </p>
              <button
                onClick={() => setShowQRModal(true)}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#993c1d] to-[#fac775] text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Quét mã gửi ước mơ ngay</span>
              </button>
            </div>
          ) : (
            /* Floating Lanterns Grid */
            displayedLanterns.map((item) => {
              const category = DREAM_CATEGORIES.find((c) => c.id === item.tag);
              const isTech = item.theme === "tech" || skyTheme === "cyber";
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedDream(item);
                    playPoemMagicSound();
                  }}
                  onMouseEnter={() => setHoveredDream(item)}
                  onMouseLeave={() => setHoveredDream(null)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-500 hover:scale-115 hover:z-40"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: `scale(${item.scale})`,
                    animationDelay: `${item.delay}s`,
                  }}
                >
                  {/* Glowing Lantern Card */}
                  <div
                    className={`relative p-3 rounded-2xl transition-all duration-300 ${
                      isTech
                        ? "bg-[#002244]/90 border border-[#00f5d4] shadow-[0_0_20px_rgba(0,245,212,0.35)]"
                        : "bg-gradient-to-b from-[#993c1d]/90 to-[#712b13]/90 border border-[#fac775]/70 shadow-[0_0_25px_rgba(250,199,117,0.4)]"
                    } backdrop-blur-md max-w-[180px] sm:max-w-[220px] text-center`}
                  >
                    {/* Lantern Top Ring */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 rounded-t-full border-t border-x border-[#fac775]/80 bg-transparent" />

                    {/* Sender Name & Category */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#fac775] mb-1">
                      <span className="truncate max-w-[100px]">{item.name || "Ẩn danh K22"}</span>
                      <span>{category?.emoji}</span>
                    </div>

                    {/* Wish Snippet */}
                    <p className="text-xs text-white/95 line-clamp-2 italic font-medium leading-tight">
                      &ldquo;{item.content}&rdquo;
                    </p>

                    {/* Mascot Sticker */}
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#12203A] border border-[#fac775] p-0.5 shadow-sm">
                      <Image
                        src={`/assets/buggy/${item.mascotIndex || 1}.png`}
                        alt="Buggy"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. LIVE REACTIONS RISING FLOAT STREAM */}
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

      {/* 5. SPOTLIGHT CAROUSEL BANNER (Bottom-left card) */}
      {currentSpotlightDream && isAutoSpotlight && (
        <div
          onClick={() => setSelectedDream(currentSpotlightDream)}
          className="absolute bottom-6 left-6 z-30 max-w-sm p-4 rounded-3xl bg-[#12203A]/90 border border-[#fac775] backdrop-blur-xl shadow-2xl cursor-pointer hover:scale-105 transition-all animate-in slide-in-from-bottom duration-500"
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

      {/* 6. CATEGORY FILTER BAR (Bottom Center) */}
      {viewMode === "lanterns" && (
        <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
          <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-[#12203A]/85 backdrop-blur-xl border border-[#fac775]/40 shadow-2xl pointer-events-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedTagFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedTagFilter === "all"
                  ? "bg-[#fac775] text-[#12203a] shadow-xs"
                  : "text-[#faeeda]/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Tất cả ({lanterns.length})
            </button>

            {DREAM_CATEGORIES.map((cat) => {
              const count = lanterns.filter((l) => l.tag === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedTagFilter(cat.id)}
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

      {/* 7. SPOTLIGHT DREAM DETAIL MODAL */}
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
