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
  { index: 1, label: "Thả tim", emoji: "❤️" },
  { index: 2, label: "Hào hứng", emoji: "🔥" },
  { index: 3, label: "Lập trình", emoji: "💻" },
  { index: 5, label: "Chiến thắng", emoji: "🏆" },
  { index: 8, label: "Bay lên", emoji: "🚀" },
  { index: 10, label: "Tỏa sáng", emoji: "✨" },
  { index: 12, label: "Đáng yêu", emoji: "🥰" },
  { index: 15, label: "Học giỏi", emoji: "🎓" },
];

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
