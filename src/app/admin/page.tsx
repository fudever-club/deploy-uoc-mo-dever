"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Dream, BroadcastAnnouncement, MysteryDrop } from "@/types/dream";
import { DuelSession, DuelRewardStatus } from "@/types/duel";
import { DREAM_CATEGORIES, EVENT_INFO } from "@/lib/constants";
import { generateDreamsCSV } from "@/lib/csv-export";
import { generateDuelCSV } from "@/lib/duel-csv-export";
import {
  Shield,
  Lock,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Search,
  LogOut,
  Sparkles,
  QrCode,
  CheckCircle2,
  RefreshCw,
  Megaphone,
  PlusCircle,
  FileJson,
  BarChart3,
  Gift,
  VolumeX,
  Swords,
  Flame,
  Zap,
  Clock,
  Phone,
  Check,
  AlertCircle,
  Trophy,
  MessageCircle,
} from "lucide-react";
import { StandeeQRModal } from "@/components/StandeeQRModal";
import { WordCloudVisualizer } from "@/components/WordCloudVisualizer";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Tab State: "dreams" (Deploy Ước Mơ) vs "duel" (Buggy AI Arena)
  const [adminTab, setAdminTab] = useState<"dreams" | "duel">("dreams");

  // Supabase realtime channel for instant browser-to-browser admin commands
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null);
  const supabaseClientRef = useRef<SupabaseClient | null>(null);

  // Deploy Ước Mơ State
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loadingDreams, setLoadingDreams] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showQRModal, setShowQRModal] = useState(false);

  // Announcement Tool State
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [activeAnnouncement, setActiveAnnouncement] = useState<BroadcastAnnouncement | null>(null);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Mystery Drop State
  const [activeMysteryDrop, setActiveMysteryDrop] = useState<MysteryDrop | null>(null);
  const [triggeringDrop, setTriggeringDrop] = useState(false);
  const [generatingMocks, setGeneratingMocks] = useState(false);

  // ==========================================
  // BUGGY AI ARENA ADMIN STATE
  // ==========================================
  const [duelSessions, setDuelSessions] = useState<DuelSession[]>([]);
  const [loadingDuels, setLoadingDuels] = useState(false);
  const [claimCodeInput, setClaimCodeInput] = useState("");
  const [claimPhoneInput, setClaimPhoneInput] = useState("");
  const [claimingReward, setClaimingReward] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState<{
    success: boolean;
    message: string;
    session?: DuelSession;
  } | null>(null);
  const [generatingDuelMocks, setGeneratingDuelMocks] = useState(false);
  const [clearingDuels, setClearingDuels] = useState(false);
  const [triggeringGlitch, setTriggeringGlitch] = useState(false);
  const [duelSearchQuery, setDuelSearchQuery] = useState("");
  const [duelStatusFilter, setDuelStatusFilter] = useState<string>("all");

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (client) {
      try {
        supabaseClientRef.current = client;
        const channel = client.channel("dreams-live-channel");
        channel
          .on("broadcast", { event: "duel_finished" }, () => {
            fetchDuelSessions();
          })
          .on("broadcast", { event: "duel_claimed" }, () => {
            fetchDuelSessions();
          })
          .subscribe();

        supabaseChannelRef.current = channel;
      } catch (e) {
        console.warn("Admin Supabase realtime init error:", e);
      }
    }
    return () => {
      if (supabaseChannelRef.current && supabaseClientRef.current) {
        supabaseClientRef.current.removeChannel(supabaseChannelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_authenticated");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
    fetchMysteryDrop();
    const interval = setInterval(fetchMysteryDrop, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoadingAuth(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_authenticated", "true");
      } else {
        setAuthError(data.error || "Mật khẩu không chính xác");
      }
    } catch {
      setAuthError("Lỗi kết nối máy chủ");
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setPasscode("");
  };

  const fetchAllDreams = async () => {
    setLoadingDreams(true);
    try {
      const res = await fetch("/api/dreams?includeHidden=true", {
        headers: { "Cache-Control": "no-cache" },
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDreams(json.data);
      }
    } catch (err) {
      console.error("Fetch admin dreams error:", err);
    } finally {
      setLoadingDreams(false);
    }
  };

  const fetchDuelSessions = async () => {
    setLoadingDuels(true);
    try {
      const res = await fetch("/api/duel/session?type=all&limit=250", {
        headers: { "Cache-Control": "no-cache" },
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDuelSessions(json.data);
      }
    } catch (err) {
      console.error("Fetch admin duel sessions error:", err);
    } finally {
      setLoadingDuels(false);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch("/api/admin/announcement");
      const json = await res.json();
      if (json.success) {
        setActiveAnnouncement(json.data);
        if (json.data?.message) {
          setAnnouncementMsg(json.data.message);
        }
      }
    } catch (err) {
      console.error("Fetch announcement error:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllDreams();
      fetchDuelSessions();
      fetchAnnouncement();
    }
  }, [isAuthenticated]);

  const handleToggleHide = async (id: string, currentHidden: boolean) => {
    try {
      const res = await fetch(`/api/dreams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !currentHidden }),
      });
      if (res.ok) {
        setDreams((prev) =>
          prev.map((d) => (d.id === id ? { ...d, hidden: !currentHidden } : d))
        );
      }
    } catch (err) {
      console.error("Toggle hide error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ước mơ này không?")) return;

    try {
      const res = await fetch(`/api/dreams/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDreams((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleExportCSV = () => {
    const csvData = generateDreamsCSV(dreams);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Danh_Sach_Uoc_Mo_FU_DEVER_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDuelCSV = () => {
    const csvData = generateDuelCSV(duelSessions);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Buggy_Arena_Ket_Qua_FU_DEVER_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(dreams, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Backup_Uoc_Mo_FU_DEVER_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSetAnnouncement = async (clear = false) => {
    setSendingAnnouncement(true);
    const textToSend = clear ? "" : announcementMsg.trim();
    try {
      if (supabaseChannelRef.current) {
        try {
          supabaseChannelRef.current.send({
            type: "broadcast",
            event: "announcement",
            payload: clear
              ? null
              : {
                  id: `ann-${Date.now()}`,
                  message: textToSend,
                  active: true,
                  timestamp: new Date().toISOString(),
                },
          });
        } catch {
          // ignore
        }
      }

      const res = await fetch("/api/admin/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const json = await res.json();
      if (json.success) {
        setActiveAnnouncement(json.data || null);
        if (clear) setAnnouncementMsg("");
      }
    } catch (err) {
      console.error("Set announcement error:", err);
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const handleGenerateMocks = async () => {
    setGeneratingMocks(true);
    try {
      const res = await fetch("/api/admin/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5 }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchAllDreams();
      }
    } catch (err) {
      console.error("Generate mocks error:", err);
    } finally {
      setGeneratingMocks(false);
    }
  };

  const handleGenerateDuelMocks = async () => {
    setGeneratingDuelMocks(true);
    try {
      const res = await fetch("/api/admin/duel-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5 }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDuelSessions();
      }
    } catch (err) {
      console.error("Generate duel mocks error:", err);
    } finally {
      setGeneratingDuelMocks(false);
    }
  };

  const handleClearDuels = async () => {
    const confirmDelete = window.confirm(
      "⚠️ CẢNH BÁO: BẠN CÓ CHẮC MUỐN LÀM RỖNG TOÀN BỘ DỮ LIỆU ARENA?\n\nToàn bộ danh sách lượt đấu và bảng xếp hạng trên máy chủ sẽ bị xóa sạch để chuẩn bị cho sự kiện chính thức."
    );
    if (!confirmDelete) return;

    setClearingDuels(true);
    try {
      const res = await fetch("/api/duel/session", { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        alert("✅ Đã làm rỗng toàn bộ dữ liệu Đấu trường Buggy Arena thành công!");
        setDuelSessions([]);
      } else {
        alert(json.error || "Lỗi khi làm rỗng dữ liệu arena!");
      }
    } catch {
      alert("Lỗi kết nối máy chủ khi làm rỗng dữ liệu arena!");
    } finally {
      setClearingDuels(false);
    }
  };

  const handleTriggerGlitch = async () => {
    setTriggeringGlitch(true);
    try {
      await fetch("/api/duel/glitch", { method: "POST" });
    } catch (err) {
      console.error("Trigger glitch error:", err);
    } finally {
      setTimeout(() => setTriggeringGlitch(false), 1500);
    }
  };

  const handleClaimReward = async (targetCode?: string) => {
    const code = targetCode || claimCodeInput.trim();
    if (!code) return;

    setClaimingReward(true);
    setClaimFeedback(null);

    try {
      const res = await fetch("/api/duel/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeOrId: code,
          phone: claimPhoneInput.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setClaimFeedback({
          success: true,
          message: `Xác nhận trao quà thành công cho bạn ${json.data?.nickname || ""} (Mã: ${json.data?.reward_code})!`,
          session: json.data,
        });
        setClaimCodeInput("");
        setClaimPhoneInput("");
        await fetchDuelSessions();
      } else {
        setClaimFeedback({
          success: false,
          message: json.error || "Xác thực mã quà tặng thất bại!",
        });
      }
    } catch {
      setClaimFeedback({
        success: false,
        message: "Lỗi kết nối máy chủ khi xác nhận quà!",
      });
    } finally {
      setClaimingReward(false);
    }
  };

  const handleOpenZaloChat = (s: DuelSession, customPhone?: string) => {
    const rawPhone = customPhone || s.phone;
    if (!rawPhone) return;

    let cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("84")) {
      cleanPhone = "0" + cleanPhone.slice(2);
    }

    const tierName =
      s.tier_label ||
      s.tierLabel ||
      (s.tier === 2 ? "Tier 2 — Cao Thủ Hacker DEVER" : "Tier 1 — Tân Binh Xuất Sắc");

    const greetingMsg = `Chào bạn ${s.nickname || "bạn"}! 🎉\nCLB Kỹ thuật Phần mềm FU-DEVER chúc mừng bạn đã xuất sắc đạt ${s.score} điểm (${tierName}) tại thử thách Buggy AI Arena (Club Day 2026)!\n\nCLB rất vui mừng chào đón bạn gia nhập đại gia đình K22 ĐH FPT Đà Nẵng. Đừng quên theo dõi fanpage CLB tại: https://www.facebook.com/FPTUDever để cùng tham gia các workshop lập trình và không bỏ lỡ đợt Tuyển Gen Mới K22 nhé! 🚀🐞`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(greetingMsg).catch(() => {});
    }

    window.open(`https://zalo.me/${cleanPhone}`, "_blank", "noopener,noreferrer");
  };

  const fetchMysteryDrop = async () => {
    try {
      const res = await fetch("/api/mystery-drop", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setActiveMysteryDrop(json.data || null);
      }
    } catch {
      // ignore
    }
  };

  const handleTriggerMysteryDrop = async (rewardName?: string, rewardEmoji?: string) => {
    setTriggeringDrop(true);
    try {
      const res = await fetch("/api/mystery-drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trigger",
          rewardName,
          rewardEmoji,
          durationSeconds: 30,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActiveMysteryDrop(json.data);
      }
    } catch (err) {
      console.error("Trigger mystery drop error:", err);
    } finally {
      setTriggeringDrop(false);
    }
  };

  const handleCancelMysteryDrop = async () => {
    try {
      await fetch("/api/mystery-drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      setActiveMysteryDrop(null);
    } catch {
      // ignore
    }
  };

  // Filter Dreams
  const filteredDreams = dreams.filter((d) => {
    const matchesSearch =
      (d.name && d.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || d.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  // Filter Duels
  const filteredDuels = duelSessions.filter((s) => {
    const matchesSearch =
      s.nickname.toLowerCase().includes(duelSearchQuery.toLowerCase()) ||
      (s.reward_code && s.reward_code.toLowerCase().includes(duelSearchQuery.toLowerCase())) ||
      (s.phone && s.phone.includes(duelSearchQuery));

    let matchesStatus = true;
    if (duelStatusFilter === "claimed") matchesStatus = s.reward_status === "claimed";
    else if (duelStatusFilter === "pending") matchesStatus = s.reward_status === "pending";
    else if (duelStatusFilter === "expired") matchesStatus = s.reward_status === "expired" || (typeof (s.reward_code_expires_at ?? s.rewardCodeExpiresAt) === "number" && Date.now() > (s.reward_code_expires_at ?? s.rewardCodeExpiresAt ?? 0) && s.reward_status !== "claimed" && s.rewardStatus !== "claimed");

    return matchesSearch && matchesStatus;
  });

  const totalCount = dreams.length;
  const visibleCount = dreams.filter((d) => !d.hidden).length;
  const hiddenCount = dreams.filter((d) => d.hidden).length;

  const totalDuels = duelSessions.length;
  const claimedDuels = duelSessions.filter((s) => s.reward_status === "claimed").length;
  const pendingDuels = duelSessions.filter((s) => s.reward_status === "pending").length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-full flex-1 flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#12203A] text-[#fac775] flex items-center justify-center shadow-md border-2 border-[#fac775]/50">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-1">Quản Trị Viên</h2>
          <p className="text-xs text-slate-500 mb-5">
            Nhập mật khẩu để quản lý gian hàng FU-DEVER Club Day 2026
          </p>

          {authError && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              id="admin-password-input"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Nhập mật khẩu (mặc định: dever2026)"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#993c1d] focus:ring-2 focus:ring-[#993c1d]/20 outline-none text-sm"
            />

            <button
              id="btn-admin-login"
              type="submit"
              disabled={loadingAuth || !passcode.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-[#12203A] hover:bg-[#1e345e] text-[#fac775] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>{loadingAuth ? "Đang xác thực..." : "Đăng Nhập Quản Trị"}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#12203A] text-[#fac775] flex items-center justify-center border border-[#fac775]/40 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>Admin God Mode</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#0091ea]/15 text-[#0091ea] font-extrabold">LIVE</span>
              </h1>
              <p className="text-xs text-slate-500">
                FU-DEVER Club Day 2026 · Vận hành gian hàng trực tiếp
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <Link
              href="/display"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trophy className="w-4 h-4 text-[#0091ea]" />
              <span>Mở Màn Hình Display</span>
            </Link>

            <Link
              href="/standee"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-4 h-4 text-[#0091ea]" />
              <span>In Poster Standee</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </div>

        {/* TAB SELECTOR: DEPLOY ƯỚC MƠ vs BUGGY AI ARENA */}
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300 shadow-inner max-w-md">
          <button
            onClick={() => setAdminTab("dreams")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              adminTab === "dreams"
                ? "bg-[#12203A] text-[#FAC775] shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🏮 Deploy Ước Mơ</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setAdminTab("duel")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              adminTab === "duel"
                ? "bg-gradient-to-r from-[#0091EA] to-[#E14CE8] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>⚔️ Buggy AI Arena</span>
            <span className="text-[10px] bg-white/30 px-1.5 py-0.5 rounded-full font-bold">
              {totalDuels}
            </span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: DEPLOY ƯỚC MƠ MANAGEMENT
        ========================================================================= */}
        {adminTab === "dreams" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Live Broadcast & Simulation Toolkit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Live Announcement Broadcaster */}
              <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#0091ea]" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Phát thông báo trực tiếp lên màn hình Display
                    </h3>
                  </div>
                  {activeAnnouncement?.active && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      Đang phát sóng
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={announcementMsg}
                    onChange={(e) => setAnnouncementMsg(e.target.value)}
                    placeholder="VD: Minigame bốc thăm trúng quà bắt đầu sau 5 phút nữa tại gian hàng DEVER!"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0091ea] outline-none text-xs"
                  />
                  <button
                    onClick={() => handleSetAnnouncement(false)}
                    disabled={sendingAnnouncement || !announcementMsg.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#0091ea] hover:bg-[#0077c2] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {sendingAnnouncement ? "Đang gửi..." : "Phát sóng"}
                  </button>
                  {activeAnnouncement?.active && (
                    <button
                      onClick={() => handleSetAnnouncement(true)}
                      disabled={sendingAnnouncement}
                      className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Tắt</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Test Rehearsal Simulator */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Thử nghiệm ước mơ
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tạo nhanh 5 ước mơ mẫu sinh động để kiểm tra hiệu ứng Display.
                  </p>
                </div>

                <button
                  onClick={handleGenerateMocks}
                  disabled={generatingMocks}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className={`w-3.5 h-3.5 ${generatingMocks ? "animate-spin" : ""}`} />
                  <span>{generatingMocks ? "Đang tạo..." : "+ Tạo 5 ước mơ mẫu"}</span>
                </button>
              </div>
            </div>

            {/* Mystery Drop Controller Card */}
            <div className="bg-gradient-to-r from-[#12203A] via-[#1a2d4f] to-[#280505] p-5 rounded-3xl border-2 border-[#FAC775]/60 shadow-lg text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-lg">
                    🎁
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Thả Đèn Lồng Bí Ẩn (Mystery Drop)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-400/40 font-bold uppercase">
                        1 Người Săn
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Thả chiếc đèn kim cương kèm mã QR đếm ngược lên màn hình lớn gian hàng.
                    </p>
                  </div>
                </div>

                {activeMysteryDrop && (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                      activeMysteryDrop.claimed
                        ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400"
                        : "bg-amber-400/30 text-amber-300 border border-amber-400 animate-pulse"
                    }`}>
                      {activeMysteryDrop.claimed ? `🏆 Đã nhận: ${activeMysteryDrop.claimedBy}` : "⏳ Đang thả đèn trên màn hình"}
                    </span>
                    <button
                      onClick={handleCancelMysteryDrop}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  onClick={() => handleTriggerMysteryDrop("Sticker Buggy Hologram", "🐞")}
                  disabled={triggeringDrop}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-400/30 text-left transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <div className="text-xl mb-1">🐞</div>
                  <div className="text-xs font-bold text-white">Sticker Buggy</div>
                  <div className="text-[10px] text-slate-300">Hologram Giới Hạn</div>
                </button>

                <button
                  onClick={() => handleTriggerMysteryDrop("Móc Khóa Limited Edition", "🔑")}
                  disabled={triggeringDrop}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-400/30 text-left transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <div className="text-xl mb-1">🔑</div>
                  <div className="text-xs font-bold text-white">Móc Khóa Limited</div>
                  <div className="text-[10px] text-slate-300">Khắc logo DEVER</div>
                </button>

                <button
                  onClick={() => handleTriggerMysteryDrop("Ly Trà Đào Thanh Mát DEVER", "🍹")}
                  disabled={triggeringDrop}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-400/30 text-left transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <div className="text-xl mb-1">🍹</div>
                  <div className="text-xs font-bold text-white">Trà Đào Mát Lạnh</div>
                  <div className="text-[10px] text-slate-300">Tiếp năng lượng</div>
                </button>

                <button
                  onClick={() => handleTriggerMysteryDrop("Bình Giữ Nhiệt DEVER", "🥤")}
                  disabled={triggeringDrop}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-400/30 text-left transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <div className="text-xl mb-1">🥤</div>
                  <div className="text-xs font-bold text-white">Bình Giữ Nhiệt</div>
                  <div className="text-[10px] text-slate-300">Phong cách DEVER</div>
                </button>
              </div>
            </div>

            {/* Export Actions Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  id="btn-export-csv"
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-xl bg-[#993c1d] hover:bg-[#712b13] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất CSV Ước Mơ</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Xuất raw JSON backup"
                >
                  <FileJson className="w-4 h-4 text-amber-600" />
                  <span>Backup JSON</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Tổng cộng: <strong className="text-slate-800">{totalCount}</strong> ước mơ
              </div>
            </div>

            {/* Word Cloud Visualizer */}
            <WordCloudVisualizer dreams={dreams} />

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên người gửi hoặc nội dung ước mơ..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#993c1d] outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">Tất cả chủ đề</option>
                  {DREAM_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.shortLabel}
                    </option>
                  ))}
                </select>

                <button
                  onClick={fetchAllDreams}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  title="Làm mới danh sách"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingDreams ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Dreams Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Người gửi</th>
                      <th className="px-4 py-3.5">Nội dung ước mơ</th>
                      <th className="px-4 py-3.5">Chủ đề</th>
                      <th className="px-4 py-3.5">Thời gian</th>
                      <th className="px-4 py-3.5 text-center">Trạng thái</th>
                      <th className="px-4 py-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDreams.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          Không tìm thấy ước mơ nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredDreams.map((item) => {
                        const cat = DREAM_CATEGORIES.find((c) => c.id === item.tag);
                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              item.hidden ? "opacity-60 bg-slate-50/40" : ""
                            }`}
                          >
                            <td className="px-4 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                              {item.name || <span className="text-slate-400 font-normal italic">Ẩn danh</span>}
                            </td>
                            <td className="px-4 py-3.5 max-w-xs sm:max-w-md font-medium text-slate-700">
                              <p className="line-clamp-2">{item.content}</p>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                                <span>{cat?.emoji || "✨"}</span>
                                <span>{cat?.shortLabel || "Khác"}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                              {new Date(item.created_at).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              - {new Date(item.created_at).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              {item.hidden ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                                  <EyeOff className="w-3 h-3" /> Đã ẩn
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                  <Eye className="w-3 h-3" /> Đang hiện
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleToggleHide(item.id, item.hidden)}
                                  className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                    item.hidden
                                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  }`}
                                  title={item.hidden ? "Hiện lên màn hình" : "Ẩn khỏi màn hình"}
                                >
                                  {item.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  <span className="hidden md:inline">{item.hidden ? "Hiện" : "Ẩn"}</span>
                                </button>

                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                  title="Xóa ước mơ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: BUGGY AI ARENA MANAGEMENT
        ========================================================================= */}
        {adminTab === "duel" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tổng Lượt Solo
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{totalDuels}</h3>
                </div>
                <div className="p-3 rounded-2xl bg-cyan-50 text-[#0091EA] border border-cyan-200/50">
                  <Swords className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Đã Trao Quà
                  </span>
                  <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{claimedDuels}</h3>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Chờ Trao Quà
                  </span>
                  <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingDuels}</h3>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/50">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* DOCK: FAST REWARD REDEEM & PHONE NUMBER COLLECTION */}
            <div className="bg-gradient-to-r from-[#0B1220] via-[#12203A] to-[#1E293B] p-5 sm:p-6 rounded-3xl border-2 border-[#4CE0D2]/60 shadow-xl text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#4CE0D2]/20 text-[#4CE0D2] border border-[#4CE0D2]/50 flex items-center justify-center text-xl">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>Quầy Đổi Thưởng Buggy Arena</span>
                      <span className="text-[10px] bg-[#FAC775] text-[#0B1220] font-black px-2 py-0.5 rounded-full uppercase">
                        Quét 1 Chạm
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Quét mã QR từ điện thoại sinh viên, nhập SĐT để lưu data và xác nhận trao quà.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTriggerGlitch}
                    disabled={triggeringGlitch}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Kích hoạt hiệu ứng Glitch trên màn hình Display"
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-300" />
                    <span>{triggeringGlitch ? "Đang Glitch..." : "Hiệu Ứng Glitch"}</span>
                  </button>
                </div>
              </div>

              {claimFeedback && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    claimFeedback.success
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-rose-500/20 border-rose-400 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {claimFeedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{claimFeedback.message}</span>
                  </div>

                  {claimFeedback.success && claimFeedback.session?.phone && (
                    <button
                      onClick={() => handleOpenZaloChat(claimFeedback.session!)}
                      className="px-3 py-1.5 rounded-xl bg-[#0091EA] hover:bg-[#0077c2] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                      title="Sao chép lời chúc và mở Zalo chat với bạn này"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Nhắn Zalo Cho Bạn Này</span>
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Mã Token QR hoặc ID:
                  </label>
                  <input
                    type="text"
                    value={claimCodeInput}
                    onChange={(e) => setClaimCodeInput(e.target.value)}
                    placeholder="VD: DEVER-QR-A1B2C3D4 hoặc paste từ scanner"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2] text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Số Điện Thoại Nhận Quà:
                  </label>
                  <input
                    type="tel"
                    value={claimPhoneInput}
                    onChange={(e) => setClaimPhoneInput(e.target.value)}
                    placeholder="VD: 0905123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#4CE0D2] text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-3 flex items-end">
                  <button
                    onClick={() => handleClaimReward()}
                    disabled={claimingReward || !claimCodeInput.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#4CE0D2] via-[#0091EA] to-[#E14CE8] text-[#0B1220] font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {claimingReward ? (
                      <div className="w-4 h-4 border-2 border-[#0B1220] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Xác Nhận Đã Trao</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Duel Actions & Search Toolbar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={duelSearchQuery}
                  onChange={(e) => setDuelSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo nickname, mã QR hoặc số điện thoại..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0091ea] outline-none text-xs"
                />
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <select
                  value={duelStatusFilter}
                  onChange={(e) => setDuelStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ trao quà</option>
                  <option value="claimed">Đã trao quà</option>
                  <option value="expired">Hết hạn</option>
                </select>

                <button
                  onClick={handleExportDuelCSV}
                  className="px-3.5 py-2 rounded-xl bg-[#0091EA] hover:bg-[#0077c2] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Xuất danh sách sinh viên chơi Buggy Arena để tuyển Gen"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất CSV Arena</span>
                </button>

                <button
                  onClick={handleGenerateDuelMocks}
                  disabled={generatingDuelMocks}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Tạo 5 lượt chơi mẫu thử nghiệm"
                >
                  <PlusCircle className={`w-3.5 h-3.5 ${generatingDuelMocks ? "animate-spin" : ""}`} />
                  <span>+ 5 Lượt Mẫu</span>
                </button>

                <button
                  id="btn-clear-duels"
                  onClick={handleClearDuels}
                  disabled={clearingDuels || duelSessions.length === 0}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Xóa sạch toàn bộ dữ liệu đấu trường để chuẩn bị sự kiện mới"
                >
                  <Trash2 className={`w-3.5 h-3.5 ${clearingDuels ? "animate-spin" : ""}`} />
                  <span>{clearingDuels ? "Đang xóa..." : "Làm Rỗng Arena"}</span>
                </button>

                <button
                  onClick={fetchDuelSessions}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  title="Làm mới danh sách"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingDuels ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Duel Sessions Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Nickname</th>
                      <th className="px-4 py-3.5">Điểm / Số câu</th>
                      <th className="px-4 py-3.5">Tier</th>
                      <th className="px-4 py-3.5">Mã QR Quà</th>
                      <th className="px-4 py-3.5">SĐT Người Nhận</th>
                      <th className="px-4 py-3.5 text-center">Trạng Thái</th>
                      <th className="px-4 py-3.5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDuels.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                          Chưa có dữ liệu lượt chơi nào.
                        </td>
                      </tr>
                    ) : (
                      filteredDuels.map((s) => {
                        const rawExp = s.reward_code_expires_at ?? s.rewardCodeExpiresAt;
                        const isExpired = typeof rawExp === "number" && Date.now() > rawExp && (s.reward_status || s.rewardStatus) !== "claimed";

                        return (
                          <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                              {s.nickname}
                            </td>

                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="font-black text-slate-900 text-sm">{s.score}</span>{" "}
                              <span className="text-[11px] text-slate-400">
                                ({s.correct_count}/5 câu · Max x{s.streak_max})
                              </span>
                            </td>

                            <td className="px-4 py-3.5 whitespace-nowrap">
                              {s.tier === 2 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
                                  ⚡ Tier 2 (Hacker)
                                </span>
                              ) : s.tier === 1 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold text-[10px] border border-cyan-300">
                                  🐞 Tier 1 (Sticker)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                                  Tier 0
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                              {s.reward_code ? (
                                <span className="bg-slate-100 px-2 py-0.5 rounded font-bold">
                                  {s.reward_code}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Không có</span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap">
                              {s.phone ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {s.phone}
                                  </span>
                                  <button
                                    onClick={() => handleOpenZaloChat(s)}
                                    className="px-2 py-0.5 rounded-lg bg-[#0091EA] hover:bg-[#0077c2] text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                    title="Tự động sao chép lời chúc & mở Zalo chat"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span>Zalo</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Chưa nhập</span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              {s.reward_status === "claimed" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                                  <Check className="w-3 h-3" /> Đã trao quà
                                </span>
                              ) : isExpired ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px]">
                                  Hết hạn
                                </span>
                              ) : s.reward_status === "pending" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] animate-pulse">
                                  <Clock className="w-3 h-3" /> Chờ tại quầy
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Không quà</span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              {s.tier >= 1 && s.reward_status !== "claimed" ? (
                                <button
                                  onClick={() => {
                                    if (s.reward_code) {
                                      setClaimCodeInput(s.reward_code);
                                      window.scrollTo({ top: 120, behavior: "smooth" });
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#0091EA] hover:bg-[#0077c2] text-white font-bold text-[11px] transition-all cursor-pointer"
                                >
                                  Trao Quà
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400">Hoàn tất</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <StandeeQRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </div>
  );
}
