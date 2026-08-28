import { Dream, DreamInput, BroadcastAnnouncement, LiveReaction, MysteryDrop } from "@/types/dream";
import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { EventEmitter } from "events";
import fs from "fs";
import path from "path";

// Global event bus for Local SSE broadcasts
class RealtimeBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(250);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __realtimeBus: RealtimeBus | undefined;
  // eslint-disable-next-line no-var
  var __localDreams: Dream[] | undefined;
  // eslint-disable-next-line no-var
  var __activeAnnouncement: BroadcastAnnouncement | null | undefined;
  // eslint-disable-next-line no-var
  var __currentMysteryDrop: MysteryDrop | null | undefined;
  // eslint-disable-next-line no-var
  var __supabaseServerClient: SupabaseClient | undefined;
  // eslint-disable-next-line no-var
  var __supabaseBroadcastChannel: RealtimeChannel | undefined;
}

export const realtimeBus = global.__realtimeBus ?? new RealtimeBus();
if (process.env.NODE_ENV !== "production") {
  global.__realtimeBus = realtimeBus;
}

const LOCAL_STORAGE_FILE = path.join(process.cwd(), "data", "dreams.json");

// Helper to ensure data folder exists
function ensureDataDir() {
  const dir = path.dirname(LOCAL_STORAGE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Rich Initial sample dreams
const INITIAL_DREAMS: Dream[] = [
  {
    id: "dream-init-1",
    name: "Nhật Minh K22",
    content: "Trở thành Lead Software Engineer tại FPT Software và xây dựng startup AI riêng!",
    tag: "career",
    consent: true,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    hidden: false,
    mascotIndex: 3,
    theme: "tech",
    lanternShape: "cyber_dever",
  },
  {
    id: "dream-init-2",
    name: "Huyền Trang",
    content: "Đạt học bổng 100% và qua môn PRN211 với điểm 10 tuyệt đối!",
    tag: "study",
    consent: true,
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    hidden: false,
    mascotIndex: 15,
    theme: "gold",
    lanternShape: "hoian_lotus",
  },
  {
    id: "dream-init-3",
    name: "Ẩn danh",
    content: "Deploy một ứng dụng triệu người dùng và cùng FU-DEVER vô địch các giải Hackathon!",
    tag: "big_dream",
    consent: true,
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    hidden: false,
    mascotIndex: 8,
    theme: "classic",
    lanternShape: "star",
  },
  {
    id: "dream-init-4",
    name: "Gia Bảo",
    content: "Cùng gia đình đi du lịch Nhật Bản mùa hoa anh đào 🌸",
    tag: "family",
    consent: true,
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    hidden: false,
    mascotIndex: "11",
    theme: "classic",
    lanternShape: "carp_dragon",
  },
];

// Load local dreams with caching
function loadLocalDreams(): Dream[] {
  if (global.__localDreams && global.__localDreams.length > 0) {
    return global.__localDreams;
  }
  try {
    ensureDataDir();
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        global.__localDreams = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to load local dreams file, using fallback:", err);
  }
  global.__localDreams = [...INITIAL_DREAMS];
  saveLocalDreams(global.__localDreams);
  return global.__localDreams;
}

// Save local dreams
function saveLocalDreams(dreams: Dream[]) {
  global.__localDreams = dreams;
  try {
    ensureDataDir();
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(dreams, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to save local dreams to disk:", err);
  }
}

// Supabase client instance if configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

function getSupabaseClient(): SupabaseClient | null {
  if (global.__supabaseServerClient) {
    return global.__supabaseServerClient;
  }
  if (supabaseUrl && supabaseKey) {
    try {
      const client = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });
      global.__supabaseServerClient = client;
      return client;
    } catch (err) {
      console.warn("Supabase init failed, fallback to local storage:", err);
    }
  }
  return null;
}

export const DREAM_COLUMNS = "*";

export async function getDreams(includeHidden = false, limit = 150): Promise<Dream[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase
        .from("dreams")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!includeHidden) {
        query = query.eq("hidden", false);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((d) => ({
          ...d,
          mascotIndex: d.mascotIndex || "11",
          theme: d.theme || "classic",
          lanternShape: d.lanternShape || "hoian_lotus",
        })) as Dream[];
      }
      console.warn("Supabase getDreams error, falling back to local:", error);
    } catch (err) {
      console.warn("Supabase getDreams failed:", err);
    }
  }

  // Local fallback
  const dreams = loadLocalDreams();
  return includeHidden ? [...dreams] : dreams.filter((d) => !d.hidden);
}

export async function getDreamsCount(includeHidden = false): Promise<number> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase
        .from("dreams")
        .select("*", { count: "exact", head: true });

      if (!includeHidden) {
        query = query.eq("hidden", false);
      }
      const { count, error } = await query;
      if (!error && typeof count === "number") {
        return count;
      }
      console.warn("Supabase getDreamsCount error, falling back to local:", error);
    } catch (err) {
      console.warn("Supabase getDreamsCount failed:", err);
    }
  }

  // Local fallback
  const list = loadLocalDreams();
  return includeHidden ? list.length : list.filter((d) => !d.hidden).length;
}

export async function createDream(input: DreamInput): Promise<Dream> {
  const newDream: Dream = {
    id: `dream-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: input.name?.trim() || null,
    content: input.content.trim(),
    tag: input.tag || "other",
    consent: input.consent,
    created_at: new Date().toISOString(),
    hidden: false,
    mascotIndex: input.mascotIndex || "11",
    theme: input.theme || "classic",
    lanternShape: input.lanternShape || "hoian_lotus",
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Build safe payload matching Supabase schema
      const dbPayload: Record<string, unknown> = {
        id: newDream.id,
        name: newDream.name,
        content: newDream.content,
        tag: newDream.tag,
        consent: newDream.consent,
        created_at: newDream.created_at,
        hidden: newDream.hidden,
        mascotIndex: newDream.mascotIndex,
        theme: newDream.theme,
      };

      const { data, error } = await supabase
        .from("dreams")
        .insert([dbPayload])
        .select("*")
        .single();

      if (!error && data) {
        const fullDream: Dream = {
          ...newDream,
          ...data,
          lanternShape: newDream.lanternShape,
        };
        realtimeBus.emit("dream:inserted", fullDream);
        return fullDream;
      }
      console.warn("Supabase insert error, falling back to local:", error);
    } catch (err) {
      console.warn("Supabase insert exception:", err);
    }
  }

  // Local store
  const list = loadLocalDreams();
  list.unshift(newDream);
  saveLocalDreams(list);

  // Broadcast event for local SSE
  realtimeBus.emit("dream:inserted", newDream);
  return newDream;
}

export async function updateDreamVisibility(id: string, hidden: boolean): Promise<Dream | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("dreams")
        .update({ hidden })
        .eq("id", id)
        .select("*")
        .single();
      if (!error && data) {
        const fullDream: Dream = {
          ...data,
          mascotIndex: data.mascotIndex || "11",
          theme: data.theme || "classic",
          lanternShape: data.lanternShape || "hoian_lotus",
        };
        realtimeBus.emit("dream:updated", fullDream);
        return fullDream;
      }
      console.warn("Supabase update error:", error);
    } catch (err) {
      console.warn("Supabase update exception:", err);
    }
  }

  const list = loadLocalDreams();
  const index = list.findIndex((d) => d.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], hidden };
    saveLocalDreams(list);
    realtimeBus.emit("dream:updated", list[index]);
    return list[index];
  }
  return null;
}

export async function deleteDream(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("dreams").delete().eq("id", id);
      if (!error) {
        realtimeBus.emit("dream:deleted", { id });
        return true;
      }
      console.warn("Supabase delete error:", error);
    } catch (err) {
      console.warn("Supabase delete exception:", err);
    }
  }

  const list = loadLocalDreams();
  const index = list.findIndex((d) => d.id === id);
  if (index !== -1) {
    list.splice(index, 1);
    saveLocalDreams(list);
    realtimeBus.emit("dream:deleted", { id });
    return true;
  }
  return false;
}

export function broadcastReaction(emoji: string): LiveReaction {
  const reaction: LiveReaction = {
    id: `react-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    emoji,
    x: Math.random() * 80 + 10,
    timestamp: Date.now(),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      supabase.channel("dreams-live-channel").send({
        type: "broadcast",
        event: "reaction",
        payload: reaction,
      });
    } catch {
      // ignore broadcast error
    }
  }

  realtimeBus.emit("reaction:broadcast", reaction);
  return reaction;
}

// Announcements Management
export function setBroadcastAnnouncement(message: string | null): BroadcastAnnouncement | null {
  if (!message || message.trim().length === 0) {
    global.__activeAnnouncement = null;
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        supabase.channel("dreams-live-channel").send({
          type: "broadcast",
          event: "announcement",
          payload: null,
        });
      } catch {
        // ignore
      }
    }
    realtimeBus.emit("announcement:broadcast", null);
    return null;
  }

  const announcement: BroadcastAnnouncement = {
    id: `ann-${Date.now()}`,
    message: message.trim(),
    active: true,
    timestamp: new Date().toISOString(),
  };

  global.__activeAnnouncement = announcement;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      supabase.channel("dreams-live-channel").send({
        type: "broadcast",
        event: "announcement",
        payload: announcement,
      });
    } catch {
      // ignore
    }
  }

  realtimeBus.emit("announcement:broadcast", announcement);
  return announcement;
}

export function getActiveAnnouncement(): BroadcastAnnouncement | null {
  return global.__activeAnnouncement || null;
}

// Batch Mock Generator for Booth Testing
export async function generateMockBatch(count = 5): Promise<Dream[]> {
  const mockNames = ["Minh Khởi K22", "Thanh Thảo", "Gia Khiêm", "Phương Linh", "Duy Anh", "Minh Ngọc", "Hoàng Nam"];
  const mockWishes = [
    "Muốn trở thành Flutter Developer xịn sò và tham gia core team DEVER!",
    "Đạt điểm rèn luyện 100 và kết nạp nhiều người bạn tốt tại FPTU!",
    "Deploy thành công web app đầu tay phục vụ hàng ngàn sinh viên!",
    "Cùng DEVER vô địch hackathon Reshape The Future 2026!",
    "Có một kỳ học thật rực rỡ với thật nhiều kỷ niệm đáng nhớ!",
  ];
  const tags: ("career" | "study" | "travel" | "family" | "big_dream")[] = ["career", "study", "travel", "big_dream", "career"];
  const shapes = ["hoian_lotus", "star", "keoquan", "garlic_silk", "carp_dragon", "cyber_dever"];

  const created: Dream[] = [];
  for (let i = 0; i < count; i++) {
    const d = await createDream({
      name: mockNames[i % mockNames.length],
      content: mockWishes[i % mockWishes.length],
      tag: tags[i % tags.length],
      consent: true,
      mascotIndex: (i % 8) + 1,
      theme: i % 2 === 0 ? "classic" : "tech",
      lanternShape: shapes[i % shapes.length],
    });
    created.push(d);
  }
  return created;
}

// ----------------------------------------------------
// SECRET MYSTERY DROP SYSTEM (SINGLE-WINNER LOCK)
// ----------------------------------------------------

const DEFAULT_REWARDS = [
  { name: "Sticker Buggy Hologram Phiên Bản Giới Hạn", emoji: "🐞", desc: "Bộ sticker chống nước phản quang độc quyền FU-DEVER" },
  { name: "Móc Khóa FU-DEVER Cyber 2026", emoji: "🔑", desc: "Móc khóa mica dạ quang khắc logo FU-DEVER" },
  { name: "Ly Trà Sữa Phúc Long 0% Đường", emoji: "🧋", desc: "Voucher 1 ly trà sữa tiếp năng lượng code đêm" },
  { name: "Bình Giữ Nhiệt DEVER Space", emoji: "🪐", desc: "Bình giữ nhiệt kim loại khắc tên bạn tại Booth" },
  { name: "Voucher Bí Mật Bàn Check-in", emoji: "🎁", desc: "Món quà bất ngờ từ Ban Chủ Nhiệm FU-DEVER" },
];

export function getActiveMysteryDrop(): MysteryDrop | null {
  const drop = global.__currentMysteryDrop;
  if (!drop) return null;
  // If expired and not claimed, deactivate
  if (Date.now() > drop.expiresAt && !drop.claimed) {
    global.__currentMysteryDrop = null;
    return null;
  }
  return drop;
}

export function triggerMysteryDrop(customOptions?: {
  rewardName?: string;
  rewardEmoji?: string;
  description?: string;
  durationSeconds?: number;
}): MysteryDrop {
  const randomPreset = DEFAULT_REWARDS[Math.floor(Math.random() * DEFAULT_REWARDS.length)];
  const rewardName = customOptions?.rewardName || randomPreset.name;
  const rewardEmoji = customOptions?.rewardEmoji || randomPreset.emoji;
  const description = customOptions?.description || randomPreset.desc;
  const duration = (customOptions?.durationSeconds || 25) * 1000;

  const drop: MysteryDrop = {
    id: `drop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    rewardName,
    rewardCode: `DEVER-${Math.floor(1000 + Math.random() * 9000)}`,
    rewardEmoji,
    description,
    active: true,
    claimed: false,
    claimedBy: null,
    claimedAt: null,
    createdAt: Date.now(),
    expiresAt: Date.now() + duration,
  };

  global.__currentMysteryDrop = drop;

  // Broadcast to Realtime Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      supabase.channel("dreams-live-channel").send({
        type: "broadcast",
        event: "mystery_drop",
        payload: drop,
      });
    } catch {
      // ignore
    }
  }

  realtimeBus.emit("mystery:drop", drop);
  return drop;
}

export function claimMysteryDrop(
  dropId: string,
  claimantName: string
): { success: boolean; drop?: MysteryDrop; error?: string; winner?: string } {
  const drop = global.__currentMysteryDrop;

  if (!drop || drop.id !== dropId) {
    return {
      success: false,
      error: "Đợt thả đèn bí ẩn này đã kết thúc hoặc không tồn tại.",
    };
  }

  // ATOMIC LOCK: If already claimed, reject all other claim requests
  if (drop.claimed) {
    return {
      success: false,
      error: `Rất tiếc! Bạn ${drop.claimedBy || "một bạn khác"} đã nhanh tay săn thành công trước bạn! Hãy đón chờ ngọn đèn bí ẩn tiếp theo nhé!`,
      winner: drop.claimedBy || undefined,
    };
  }

  if (Date.now() > drop.expiresAt) {
    return {
      success: false,
      error: "Chiếc đèn đã bay đi mất rồi! Hẹn bạn ở đợt thả đèn tiếp theo.",
    };
  }

  // Successfully claim (First Come First Served)
  drop.claimed = true;
  drop.claimedBy = claimantName.trim() || "Tân sinh viên K22";
  drop.claimedAt = new Date().toISOString();

  // Broadcast claim victory to /display and other clients
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      supabase.channel("dreams-live-channel").send({
        type: "broadcast",
        event: "mystery_claimed",
        payload: drop,
      });
    } catch {
      // ignore
    }
  }

  realtimeBus.emit("mystery:claimed", drop);
  return { success: true, drop };
}

export function cancelMysteryDrop(): void {
  global.__currentMysteryDrop = null;
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      supabase.channel("dreams-live-channel").send({
        type: "broadcast",
        event: "mystery_cancel",
        payload: null,
      });
    } catch {
      // ignore
    }
  }
  realtimeBus.emit("mystery:cancel", null);
}
