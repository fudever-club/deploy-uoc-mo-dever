import { DreamCategory } from "@/types/dream";

interface PoemResult {
  title: string;
  lines: string[];
  meaning: string;
  badge: string;
}

const POEM_TEMPLATES: Record<DreamCategory, Array<{ title: string; lines: string[]; badge: string }>> = {
  career: [
    {
      title: "Vươn Xa Lập Trình",
      lines: [
        "Đèn lồng thắp sáng chân mây,",
        "Vào nhà DEVER dựng xây tương lai.",
        "Code ngày, luyện thuật đêm dài,",
        "Kỳ thi quốc tế rạng ngời bảng tên!",
      ],
      badge: "🏮 Đỗ Đạt Thành Công",
    },
    {
      title: "Chinh Phục Công Nghệ",
      lines: [
        "Mùa trăng rực rỡ trăng rằm,",
        "Nuôi hoài bão lớn quyết tâm lập trình.",
        "Dev giỏi ắt sẽ quang vinh,",
        "Kiến tạo sản phẩm muôn nghìn người mê!",
      ],
      badge: "🚀 Kiến Tạo Tương Lai",
    },
  ],
  tech: [
    {
      title: "Khát Vọng Fullstack",
      lines: [
        "Thu sang trăng sáng đỉnh đồi,",
        "Frontend, Backend cùng ngồi luyện công.",
        "Bug tan, code chạy hanh thông,",
        "Cùng nhau Deploy ước mơ nhiệm màu!",
      ],
      badge: "💻 Clean Code & Hackathon",
    },
    {
      title: "Bản Lĩnh Kỹ Sư",
      lines: [
        "Trăng soi dòng lệnh tinh anh,",
        "Server vững chãi, code thanh nhẹ nhàng.",
        "Vào DEVER học đàng hoàng,",
        "Mai sau thế giới ngỡ ngàng gọi tên!",
      ],
      badge: "⚡ Senior Tech Master",
    },
  ],
  friendship: [
    {
      title: "Tri Kỷ Đồng Đội",
      lines: [
        "Đèn lồng gắn kết muôn phương,",
        "Về cùng một mái thân thương DEVER.",
        "Bên nhau chia sẻ ước mơ,",
        "Thức đêm fix bug, làm thơ giải đề!",
      ],
      badge: "🤝 Anh Em Keo Sơn",
    },
    {
      title: "Vòng Tay Đồng Môn",
      lines: [
        "Gặp nhau ngày hội tân sinh,",
        "Tay cầm lồng gấm kết tình bạn thân.",
        "Mai ngày sánh bước xa gần,",
        "DEVER là chốn thanh xuân tuyệt vời!",
      ],
      badge: "✨ Thanh Xuân Rực Rỡ",
    },
  ],
  academic: [
    {
      title: "Vinh Danh Bảng Vàng",
      lines: [
        "Đèn lồng treo ngọn trúc đào,",
        "Học bổng thủ khoa đón chào K22.",
        "GPA cao ngất tầng trời,",
        "Bõ công đèn sách rạng ngời gia phong!",
      ],
      badge: "👑 Thủ Khoa GPA 4.0",
    },
    {
      title: "Bảng Vàng Đỗ Đạt",
      lines: [
        "Trăng thu vằng vặc sáng soi,",
        "Học hành chăm chỉ hẳn thoi bảng vàng.",
        "K22 bước hiên ngang,",
        "Bao nhiêu giải thưởng sẵn sàng đón tay!",
      ],
      badge: "🎓 Học Bổng Toàn Phần",
    },
  ],
  club: [
    {
      title: "Tự Hào DEVER",
      lines: [
        "Mascot Buggy rộn ràng,",
        "FU-DEVER đón bạn vàng năm nay.",
        "Chung tay thắp sáng chân mây,",
        "CLB hùng mạnh ngất ngây tình đồng!",
      ],
      badge: "🐞 Nhà Chung DEVER",
    },
    {
      title: "Thắp Lửa Đam Mê",
      lines: [
        "Ngôi nhà lập trình thân yêu,",
        "Trao nhau tri thức bao điều sâu xa.",
        "Cùng nhau bước tới phương xa,",
        "DEVER vững mạnh cả nhà cùng vui!",
      ],
      badge: "🔥 Nhiệt Huyết Trẻ",
    },
  ],
  love: [
    {
      title: "Duyên Lành Dưới Trăng",
      lines: [
        "Trăng rằm soi bóng hồ tây,",
        "Đèn lồng trao gửi đong đầy nhớ thương.",
        "Cùng nhau chung một giảng đường,",
        "Sánh đôi ngày hội ngát hương nụ cười!",
      ],
      badge: "❤️ Duyên Nợ Cùng Bàn",
    },
    {
      title: "Hẹn Ước Mùa Trăng",
      lines: [
        "Thu về trăng sáng lung linh,",
        "Mong tìm tri kỷ đồng hành cùng dev.",
        "Tình yêu như thuật toán êm,",
        "Trọn đời hạnh phúc ấm êm ngọt ngào!",
      ],
      badge: "🌸 Tình Đầu Sinh Viên",
    },
  ],
};

export function generatePoem(name?: string, category: DreamCategory = "career"): PoemResult {
  const templates = POEM_TEMPLATES[category] || POEM_TEMPLATES.career;
  const picked = templates[Math.floor(Math.random() * templates.length)];

  const personalizedLines = [...picked.lines];
  if (name && name.trim()) {
    personalizedLines[0] = `Đèn lồng thắp sáng tên ${name.trim()},`;
  }

  return {
    title: picked.title,
    lines: personalizedLines,
    meaning: `Bài thơ gieo quẻ Trung Thu chúc ${name || "bạn"} vạn sự hanh thông và bay cao cùng FU-DEVER!`,
    badge: picked.badge,
  };
}
