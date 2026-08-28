import { CategoryInfo, BuggyMood } from "@/types/dream";

export const DREAM_CATEGORIES: CategoryInfo[] = [
  {
    id: "career",
    label: "Sự nghiệp / Công việc mơ ước",
    emoji: "💻",
    shortLabel: "Sự nghiệp",
    colorHex: "#0091EA",
  },
  {
    id: "study",
    label: "Học tập / Thành tích",
    emoji: "🎓",
    shortLabel: "Học tập",
    colorHex: "#FAC775",
  },
  {
    id: "travel",
    label: "Trải nghiệm / Du lịch",
    emoji: "🌏",
    shortLabel: "Trải nghiệm",
    colorHex: "#10B981",
  },
  {
    id: "family",
    label: "Gia đình / Tình cảm",
    emoji: "❤️",
    shortLabel: "Gia đình",
    colorHex: "#E63946",
  },
  {
    id: "big_dream",
    label: "Ước mơ lớn / Thay đổi thế giới",
    emoji: "🚀",
    shortLabel: "Ước mơ lớn",
    colorHex: "#8B5CF6",
  },
  {
    id: "other",
    label: "Khác",
    emoji: "✨",
    shortLabel: "Khác",
    colorHex: "#FAC775",
  },
];

export const BUGGY_MOODS: BuggyMood[] = [
  { index: "11", label: "Thả Tim", emoji: "❤️", image: "/assets/buggy/11.png" },
  { index: "19", label: "Bắn Tim", emoji: "🥰", image: "/assets/buggy/19.png" },
  { index: "trung-thu/04_buggy_chu_cuoi_coder.png", label: "Chú Cuội Coder", emoji: "🌙", image: "/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png" },
  { index: "trung-thu/10_buggy_hang_nga_fairy.png", label: "Hằng Nga Tiên Nữ", emoji: "🧝‍♀️", image: "/assets/buggy/trung-thu/10_buggy_hang_nga_fairy.png" },
  { index: "trung-thu/01_buggy_lantern_parade.png", label: "Rước Đèn", emoji: "🏮", image: "/assets/buggy/trung-thu/01_buggy_lantern_parade.png" },
  { index: "trung-thu/02_buggy_mooncake_feast.png", label: "Bánh Trung Thu", emoji: "🥮", image: "/assets/buggy/trung-thu/02_buggy_mooncake_feast.png" },
  { index: "trung-thu/03_buggy_lion_dance.png", label: "Múa Lân", emoji: "🦁", image: "/assets/buggy/trung-thu/03_buggy_lion_dance.png" },
  { index: "trung-thu/05_buggy_moon_rabbit_hug.png", label: "Ôm Thỏ Ngọc", emoji: "🐰", image: "/assets/buggy/trung-thu/05_buggy_moon_rabbit_hug.png" },
  { index: "6", label: "Cool Ngầu", emoji: "😎", image: "/assets/buggy/6.png" },
  { index: "8", label: "Cà Phê Code", emoji: "☕", image: "/assets/buggy/8.png" },
  { index: "4", label: "Ý Tưởng", emoji: "💡", image: "/assets/buggy/4.png" },
  { index: "9", label: "Ăn Mừng", emoji: "🎉", image: "/assets/buggy/9.png" },
];

export function getBuggyMascotUrl(mascot: number | string | undefined): string {
  if (!mascot) return "/assets/buggy/11.png";
  const m = String(mascot).trim();
  if (m.startsWith("/")) return m;
  if (m.startsWith("trung-thu/")) return `/assets/buggy/${m}`;
  if (m.includes("buggy_") || m.includes("dever_logo_")) {
    const filename = m.endsWith(".png") ? m : `${m}.png`;
    return `/assets/buggy/trung-thu/${filename}`;
  }
  // Check if it's the old invalid "1" sheet, map to 11
  if (m === "1" || m === "1.png") return "/assets/buggy/11.png";
  const numStr = m.endsWith(".png") ? m : `${m}.png`;
  return `/assets/buggy/${numStr}`;
}

export interface MidAutumnBuggyReward {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  rarity: "Đặc Biệt" | "Cực Hiếm" | "Hiếm";
  badgeColor: string;
  downloadUrl: string;
  printablePdf?: string;
}

export const MID_AUTUMN_BUGGY_REWARDS: MidAutumnBuggyReward[] = [
  {
    id: "chu_cuoi",
    name: "Buggy Chú Cuội Coder",
    subtitle: "Ngồi gốc cây đa Code Tree gõ code thâu đêm",
    image: "/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png",
    rarity: "Đặc Biệt",
    badgeColor: "#FAC775",
    downloadUrl: "/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png",
  },
  {
    id: "hang_nga",
    name: "Buggy Tiên Nữ Hằng Nga",
    subtitle: "Lướt mây ngũ sắc mang lời chúc may mắn đến Tân Sinh Viên",
    image: "/assets/buggy/trung-thu/10_buggy_hang_nga_fairy.png",
    rarity: "Đặc Biệt",
    badgeColor: "#00F5D4",
    downloadUrl: "/assets/buggy/trung-thu/10_buggy_hang_nga_fairy.png",
  },
  {
    id: "sheet_3x3",
    name: "Trọn Bộ 9 Sticker Buggy Trung Thu A4",
    subtitle: "Bộ quà tặng in ấn chất lượng cao 300 DPI độc quyền gian hàng",
    image: "/assets/buggy/trung-thu/buggy_midautumn_stickers_sheet_3x3.png",
    rarity: "Đặc Biệt",
    badgeColor: "#0091EA",
    downloadUrl: "/assets/buggy/trung-thu/buggy_midautumn_stickers_sheet_3x3.png",
    printablePdf: "/assets/buggy/trung-thu/buggy_midautumn_stickers_sheet_A4.pdf",
  },
  {
    id: "ruoc_den",
    name: "Buggy Rước Đèn Tai Thỏ",
    subtitle: "Rước đèn ngôi sao rực rỡ trăng rằm",
    image: "/assets/buggy/trung-thu/01_buggy_lantern_parade.png",
    rarity: "Cực Hiếm",
    badgeColor: "#FFD166",
    downloadUrl: "/assets/buggy/trung-thu/01_buggy_lantern_parade.png",
  },
  {
    id: "banh_trung_thu",
    name: "Buggy Thưởng Bánh Nướng",
    subtitle: "Bánh trung thu trăng tròn siêu to khổng lồ",
    image: "/assets/buggy/trung-thu/02_buggy_mooncake_feast.png",
    rarity: "Cực Hiếm",
    badgeColor: "#FFAA00",
    downloadUrl: "/assets/buggy/trung-thu/02_buggy_mooncake_feast.png",
  },
  {
    id: "mua_lan",
    name: "Buggy Múa Lân Sư Rồng",
    subtitle: "Đội đầu lân khai hội rộn ràng tưng bừng",
    image: "/assets/buggy/trung-thu/03_buggy_lion_dance.png",
    rarity: "Cực Hiếm",
    badgeColor: "#E63946",
    downloadUrl: "/assets/buggy/trung-thu/03_buggy_lion_dance.png",
  },
  {
    id: "tho_ngoc",
    name: "Buggy Ôm Thỏ Ngọc",
    subtitle: "Ấm áp yêu thương cùng sứ giả cung trăng",
    image: "/assets/buggy/trung-thu/05_buggy_moon_rabbit_hug.png",
    rarity: "Hiếm",
    badgeColor: "#85B7EB",
    downloadUrl: "/assets/buggy/trung-thu/05_buggy_moon_rabbit_hug.png",
  },
  {
    id: "logo_lantern",
    name: "Huy Hiệu Logo DEVER Đèn Lồng",
    subtitle: "Biểu tượng CLB kết hợp hoa văn đèn lồng Trung Thu",
    image: "/assets/buggy/trung-thu/07_dever_logo_midautumn_lantern.png",
    rarity: "Hiếm",
    badgeColor: "#993C1D",
    downloadUrl: "/assets/buggy/trung-thu/07_dever_logo_midautumn_lantern.png",
  },
];

export const INSPIRATION_PROMPTS = [
  "Trở thành Fullstack Developer tại tập đoàn công nghệ lớn 🚀",
  "Đạt học bổng kỳ đầu tiên và qua môn với GPA xuất sắc 🎓",
  "Tìm được nhóm bạn chí cốt cùng làm đồ án và tham gia Hackathon 🤝",
  "Gia nhập ban chuyên môn CLB FU-DEVER và code project triệu view 💻",
  "Tự tin thuyết trình tiếng Anh trước toàn trường 🌏",
  "Deploy thành công một ứng dụng AI giải quyết vấn đề thực tế ✨",
];

export const EVENT_INFO = {
  eventName: "Deploy Ước Mơ",
  clubName: "FU-DEVER",
  university: "FPT University Da Nang",
  eventDate: "12/09/2026",
  eventTime: "08:15 — 12:00",
  eventLocation: "Gian hàng FU-DEVER · Club Day 2026",
  hashtags: ["#FUDEVER", "#ClubDay2026", "#DeployUocMo", "#DEVER_K22"],
  defaultAdminPasscode: "dever2026",
  brandColors: {
    night: "#12203A",
    nightDark: "#0B132B",
    crimson: "#993C1D",
    crimsonDark: "#712B13",
    amberGold: "#FAC775",
    amberLight: "#FAEEDA",
    deverCyan: "#0091EA",
    deverCyanLight: "#85B7EB",
    techGlow: "#00F5D4",
  },
};
