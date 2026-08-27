"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { Dream, LanternItem, BroadcastAnnouncement, LiveReaction } from "@/types/dream";
import { DREAM_CATEGORIES, EVENT_INFO } from "@/lib/constants";
import { playLanternChime } from "@/lib/audio";
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
  Pause,
} from "lucide-react";
import { StandeeQRModal } from "@/components/StandeeQRModal";
import { LanternSkyCanvas } from "@/components/LanternSkyCanvas";

export default function DisplaySkyPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [lanterns, setLanterns] = useState<LanternItem[]>([]);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");
  const [activeAnnouncement, setActiveAnnouncement] = useState<BroadcastAnnouncement | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [isAutoSpotlight, setIsAutoSpotlight] = useState<boolean>(true);
  const [reactions, setReactions] = useState<LiveReaction[]>([]);

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

  // Compute position for lanterns in virtual grid
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
            playLanternChime();
          }
        }
      } catch (e) {
        console.error("SSE insert parse error:", e);
      }
    });

    eventSource.addEventListener("update", (event) => {
      try {
        const updated = JSON.parse(event.data) as Dream;
        setDreams((prev) => {
          let next;
          if (updated.hidden) {
            next = prev.filter((d) => d.id !== updated.id);
          } else {
            next = prev.map((d) => (d.id === updated.id ? updated : d));
          }
          updateLanternsFromDreams(next);
          return next;
        });
      } catch (e) {
        console.error("SSE update parse error:", e);
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
        console.error("SSE delete parse error:", e);
      }
    });

    eventSource.addEventListener("announcement", (event) => {
      try {
        const ann = JSON.parse(event.data) as BroadcastAnnouncement | null;
        setActiveAnnouncement(ann);
      } catch (e) {
        console.error("SSE announcement error:", e);
      }
    });

    eventSource.addEventListener("reaction", (event) => {
      try {
        const react = JSON.parse(event.data) as LiveReaction;
        setReactions((prev) => [...prev.slice(-15), react]);
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== react.id));
        }, 4000);
      } catch (e) {
        console.error("SSE reaction error:", e);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [soundEnabled]);

  // Spotlight Auto-Rotation
  useEffect(() => {
    if (!isAutoSpotlight || lanterns.length === 0) return;
    const interval = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % lanterns.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [isAutoSpotlight, lanterns.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleUserGesture = () => {
    audioUnlocked.current = true;
  };

  // Filtered lanterns
  const displayedLanterns = lanterns.filter((item) => {
    if (selectedTagFilter === "all") return true;
    return item.tag === selectedTagFilter;
  });

  const spotlightDream = lanterns[spotlightIndex] || null;

  return (
    <div
      onClick={handleUserGesture}
      className="relative w-screen h-screen overflow-hidden bg-[#12203A] text-[#faeeda] select-none font-sans"
    >
      {/* 1. NIGHT SKY BACKGROUND & STARS */}
      <div className="absolute inset-0 bg-radial from-[#1e345e] via-[#12203A] to-[#0a1222]" />
      <LanternSkyCanvas />

      {/* Glowing Full Moon */}
      <div className="absolute top-6 right-16 w-32 h-32 rounded-full bg-gradient-to-br from-[#fac775] via-[#faeeda] to-[#e5b360] shadow-[0_0_80px_rgba(250,199,117,0.6)] animate-moon opacity-90 pointer-events-none flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-[#e0aa4e]/30 absolute top-6 left-8" />
        <div className="w-10 h-10 rounded-full bg-[#e0aa4e]/20 absolute bottom-6 right-7" />
        <div className="w-4 h-4 rounded-full bg-[#e0aa4e]/30 absolute bottom-12 left-10" />
      </div>

      {/* Sparkling Stars */}
      {staticStars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-[#faeeda] animate-twinkle pointer-events-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* 2. TOP BAR OVERLAY */}
      <div className="absolute top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between pointer-events-none">
        {/* Top-Left: Event Tag */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-[#fac775]/30 shadow-lg pointer-events-auto">
          <span className="text-xl animate-bounce">🏮</span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#fac775] uppercase tracking-wider">
              Deploy Ước Mơ · Club Day 2026
            </span>
            <span className="text-[10px] text-white/80">CLB LẬP TRÌNH FU-DEVER · FPTU ĐÀ NẴNG</span>
          </div>
        </div>

        {/* Top-Right: Wish Counter & Utility Controls */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Realtime Counter Pill */}
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

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-[#fac775]/30 text-[#fac775] transition-colors shadow-md cursor-pointer"
            title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
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

      {/* 3. FLOATING LANTERNS SKY LAYER */}
      <div className="absolute inset-0 z-10 p-4">
        {lanterns.length === 0 ? (
          /* Empty Initial State */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-700">
            <div className="w-20 h-20 mb-4 rounded-full bg-[#fac775]/20 border border-[#fac775] flex items-center justify-center text-3xl animate-float shadow-[0_0_30px_rgba(250,199,117,0.4)]">
              🏮
            </div>
            <h2 className="text-2xl font-extrabold text-[#fac775] mb-2 drop-shadow-md">
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
            const isTech = item.theme === "tech";
            return (
              <div
                key={item.id}
                onClick={() => setSelectedDream(item)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-500 hover:scale-115 hover:z-40"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `scale(${item.scale})`,
                  animation: `floatSlow 6s ease-in-out infinite`,
                  animationDelay: `${item.delay}s`,
                }}
              >
                {/* Lantern Visual Container */}
                <div className="relative group flex flex-col items-center">
                  {/* Top Lantern Hanger String */}
                  <div className="w-0.5 h-3 bg-[#fac775]/60 mb-0.5" />

                  {/* Lantern Body Card */}
                  <div
                    className={`relative px-3.5 py-2.5 rounded-2xl border-2 shadow-[0_0_20px_rgba(250,199,117,0.35)] backdrop-blur-xs text-left min-w-[150px] max-w-[200px] transition-all group-hover:shadow-[0_0_30px_rgba(250,199,117,0.8)] ${
                      isTech
                        ? "bg-gradient-to-b from-[#08101e] to-[#0f203c] border-[#0091ea]/80 group-hover:border-[#00f5d4]"
                        : "bg-gradient-to-b from-[#993c1d] to-[#712b13] border-[#fac775]/70 group-hover:border-[#fac775]"
                    }`}
                  >
                    {/* Glowing Candle Core */}
                    <div
                      className={`absolute inset-x-4 top-1 h-2 rounded-full blur-xs pointer-events-none ${
                        isTech ? "bg-[#00f5d4]/40" : "bg-[#fac775]/40"
                      }`}
                    />

                    {/* Sender Name & Category */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1 truncate max-w-[125px]">
                        <span className={`text-xs font-extrabold truncate ${isTech ? "text-[#00f5d4]" : "text-[#fac775]"}`}>
                          {item.name || "Ẩn danh"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.mascotIndex && (
                          <div className="relative w-4 h-4 shrink-0">
                            <Image
                              src={`/assets/buggy/${item.mascotIndex}.png`}
                              alt="Buggy"
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span className="text-xs">{category?.emoji || "✨"}</span>
                      </div>
                    </div>

                    {/* Truncated Wish Excerpt */}
                    <p className="text-[11px] text-[#faeeda] font-medium leading-snug line-clamp-2 italic">
                      &ldquo;{item.content}&rdquo;
                    </p>

                    {/* Bottom Lantern Fringe */}
                    <div
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 rounded-b-md shadow-xs ${
                        isTech ? "bg-[#0091ea]" : "bg-[#fac775]"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3.5 SPOTLIGHT SHOWCASE OVERLAY (BOTTOM CENTER) */}
      {isAutoSpotlight && spotlightDream && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-25 max-w-lg w-full px-4 pointer-events-none">
          <div className="bg-[#12203A]/90 border border-[#fac775]/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in zoom-in-95 duration-500 pointer-events-auto">
            <div className="w-10 h-10 rounded-full bg-[#fac775]/20 border border-[#fac775] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#fac775]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#fac775] mb-0.5">
                <span>🏮 Spotlight: {spotlightDream.name || "Ẩn danh"}</span>
                <span className="text-white/60">
                  {DREAM_CATEGORIES.find((c) => c.id === spotlightDream.tag)?.emoji}
                </span>
              </div>
              <p className="text-xs text-white italic truncate font-medium">
                &ldquo;{spotlightDream.content}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3.6 LIVE FLOATING REACTIONS STREAM */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute text-4xl sm:text-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 transition-all drop-shadow-[0_0_15px_rgba(250,199,117,0.8)]"
            style={{
              left: `${r.x}%`,
              bottom: "10%",
              animation: "floatSlow 4s ease-out forwards",
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* 4. FOOTER OVERLAY (LOGO, CATEGORY FILTER & QR) */}
      <div className="absolute bottom-4 left-6 right-6 z-30 flex items-end justify-between pointer-events-none">
        {/* Left: FU-DEVER Official Logo */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
          <div className="relative w-9 h-9">
            <Image
              src="/assets/logo/logo-dever-white.png"
              alt="FU-DEVER Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-[#85b7eb] tracking-wide">
              CLB LẬP TRÌNH FU-DEVER
            </span>
            <span className="text-[10px] text-white/70">FPT University Da Nang</span>
          </div>
        </div>

        {/* Center: Category Filter Pills */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
          <button
            onClick={() => setSelectedTagFilter("all")}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedTagFilter === "all"
                ? "bg-[#fac775] text-[#12203a] font-bold"
                : "text-white/70 hover:text-white"
            }`}
          >
            Tất cả ({lanterns.length})
          </button>
          {DREAM_CATEGORIES.map((c) => {
            const count = lanterns.filter((l) => l.tag === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedTagFilter(c.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  selectedTagFilter === c.id
                    ? "bg-[#993c1d] text-white border border-[#fac775]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <span>{c.emoji}</span>
                <span>{c.shortLabel}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Right: Scan QR Prompt */}
        <div
          onClick={() => setShowQRModal(true)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#993c1d]/90 to-[#712b13]/90 border border-[#fac775]/50 shadow-xl backdrop-blur-md cursor-pointer pointer-events-auto hover:scale-105 transition-all"
        >
          <div className="p-1 rounded-md bg-white text-[#12203a]">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-[#fac775]">Quét QR tại gian hàng</span>
            <span className="text-[10px] text-[#faeeda]/80">Gửi ước mơ của bạn bay lên</span>
          </div>
        </div>
      </div>

      {/* 5. MODAL: DETAILED LANTERN INSPECTION */}
      {selectedDream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#712b13] via-[#12203A] to-[#0a1222] border-2 border-[#fac775] rounded-3xl p-6 shadow-2xl text-[#faeeda]">
            <button
              onClick={() => setSelectedDream(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#fac775] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="relative w-16 h-16 mx-auto mb-2 rounded-full bg-[#fac775]/20 border-2 border-[#fac775] flex items-center justify-center shadow-[0_0_25px_rgba(250,199,117,0.5)]">
                {selectedDream.mascotIndex ? (
                  <Image
                    src={`/assets/buggy/${selectedDream.mascotIndex}.png`}
                    alt="Buggy Mascot"
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-2xl">🏮</span>
                )}
              </div>

              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/10 text-xs text-[#fac775] font-semibold mb-1">
                <span>{DREAM_CATEGORIES.find((c) => c.id === selectedDream.tag)?.emoji}</span>
                <span>{DREAM_CATEGORIES.find((c) => c.id === selectedDream.tag)?.label}</span>
              </div>

              <h3 className="text-xl font-extrabold text-[#fac775]">
                {selectedDream.name || "Ẩn danh"}
              </h3>
              <p className="text-[11px] text-white/60">
                {new Date(selectedDream.created_at).toLocaleString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })}
              </p>
            </div>

            <div className="bg-black/40 rounded-2xl p-5 border border-[#fac775]/30 mb-5 max-h-60 overflow-y-auto shadow-inner">
              <p className="text-base text-white font-medium italic leading-relaxed text-center">
                &ldquo;{selectedDream.content}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#fac775]/80 px-2">
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                <span>FU-DEVER Club Day 2026</span>
              </div>
              <button
                onClick={() => setSelectedDream(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standee QR Code Modal */}
      <StandeeQRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </div>
  );
}
