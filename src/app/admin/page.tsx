"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Dream, BroadcastAnnouncement } from "@/types/dream";
import { DREAM_CATEGORIES, EVENT_INFO } from "@/lib/constants";
import { generateDreamsCSV } from "@/lib/csv-export";
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
} from "lucide-react";
import { StandeeQRModal } from "@/components/StandeeQRModal";
import { WordCloudVisualizer } from "@/components/WordCloudVisualizer";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Data & Filters
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loadingDreams, setLoadingDreams] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showQRModal, setShowQRModal] = useState(false);

  // Announcement Tool State
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [activeAnnouncement, setActiveAnnouncement] = useState<BroadcastAnnouncement | null>(null);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Simulation Status
  const [generatingMocks, setGeneratingMocks] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_authenticated");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
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
      const res = await fetch("/api/dreams?includeHidden=true");
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
      const res = await fetch("/api/admin/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const json = await res.json();
      if (json.success) {
        setActiveAnnouncement(json.data);
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

  const filteredDreams = dreams.filter((d) => {
    const matchesSearch =
      (d.name && d.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || d.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const totalCount = dreams.length;
  const visibleCount = dreams.filter((d) => !d.hidden).length;
  const hiddenCount = dreams.filter((d) => d.hidden).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-full flex-1 flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#12203A] text-[#fac775] flex items-center justify-center shadow-md border-2 border-[#fac775]/50">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-1">Quản Trị Viên</h2>
          <p className="text-xs text-slate-500 mb-5">
            Nhập mật khẩu để quản lý ước mơ tại gian hàng Club Day
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
                <span>Bảng Quản Trị Ước Mơ</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#0091ea]/15 text-[#0091ea] font-extrabold">LIVE</span>
              </h1>
              <p className="text-xs text-slate-500">
                FU-DEVER Club Day 2026 · Vận hành gian hàng trực tiếp
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <Link
              href="/standee"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-4 h-4 text-[#0091ea]" />
              <span>In Poster Standee</span>
            </Link>

            <Link
              href="/admin/lucky-draw"
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Vòng Quay May Mắn</span>
            </Link>

            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-[#993c1d] hover:bg-[#712b13] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xuất raw JSON backup"
            >
              <FileJson className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </div>

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
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tắt
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
                  Thử nghiệm gian hàng
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Tạo nhanh 5 ước mơ mẫu sinh động để kiểm tra hiệu ứng Display trước sự kiện.
              </p>
            </div>

            <button
              onClick={handleGenerateMocks}
              disabled={generatingMocks}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className={`w-3.5 h-3.5 ${generatingMocks ? "animate-spin" : ""}`} />
              <span>{generatingMocks ? "Đang tạo 5 ước mơ..." : "+ Tạo 5 ước mơ mẫu thử nghiệm"}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng ước mơ</span>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{totalCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/50">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang hiển thị trên Sky</span>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{visibleCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/50">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã ẩn khỏi Display</span>
              <h3 className="text-2xl font-extrabold text-slate-400 mt-1">{hiddenCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-500">
              <EyeOff className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Category Analytics Distribution */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0091ea]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Phân bố chủ đề ước mơ của sinh viên
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {DREAM_CATEGORIES.map((c) => {
              const count = dreams.filter((d) => d.tag === c.id).length;
              const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={c.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{c.emoji} {c.shortLabel}</span>
                    <span className="font-extrabold text-slate-800">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${percent}%`, backgroundColor: c.colorHex }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-1 block">{percent}%</span>
                </div>
              );
            })}
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

      <StandeeQRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </div>
  );
}
