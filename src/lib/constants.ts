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
