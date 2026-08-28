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
  study: [
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
  travel: [
    {
      title: "Khám Phá Muôn Nơi",
      lines: [
        "Trời thu bát ngát mây bay,",
        "Hành trang tri thức mỗi ngày vươn xa.",
        "Chinh phục thế giới bao la,",
        "Dấu chân in khắp muôn vàn kỳ quan!",
      ],
      badge: "🌏 Chinh Phục Thế Giới",
    },
    {
      title: "Khát Vọng Bay Xa",
      lines: [
        "Đèn lồng gửi gió ngàn phương,",
        "Bước đi trải nghiệm dặm trường phong ba.",
        "Tự tin vững bước tiến xa,",
        "Mang danh DEVER rạng ngời năm châu!",
      ],
      badge: "✈️ Trải Nghiệm Thanh Xuân",
    },
  ],
  family: [
    {
      title: "Gia Đình Sum Vầy",
      lines: [
        "Trăng rằm soi bóng bình an,",
        "Gia đình hạnh phúc ngập tràn yêu thương.",
        "Dẫu cho cách trở muôn phương,",
        "Mùa thu đoàn tụ vấn vương nụ cười!",
      ],
      badge: "❤️ Trọn Vẹn Yêu Thương",
    },
    {
      title: "Hiếu Nghĩa Thâm Sâu",
      lines: [
        "Đèn lồng thắp sáng tâm thành,",
        "Cầu cho cha mẹ an lành ấm êm.",
        "Học hành đỗ đạt ngày đêm,",
        "Đáp đền công dưỡng ấm êm gia đình!",
      ],
      badge: "🌸 Hiếu Thảo Bình An",
    },
  ],
  big_dream: [
    {
      title: "Ước Mơ Vĩ Đại",
      lines: [
        "Nuôi chí lớn, chạm ngàn sao,",
        "Tự tay kiến tạo đỉnh cao nhiệm màu.",
        "Cùng nhau chung sức đồng lòng,",
        "Thay đổi thế giới, thỏa lòng ước mơ!",
      ],
      badge: "🚀 Thay Đổi Thế Giới",
    },
    {
      title: "Khát Vọng Kỷ Nguyên Số",
      lines: [
        "Đèn lồng chở vạn ước mơ,",
        "Vào nhà DEVER dệt nên sử vàng.",
        "Sáng tạo công nghệ vẻ vang,",
        "Vươn tầm quốc tế đàng hoàng vinh quang!",
      ],
      badge: "⚡ Kỳ Tích DEVER",
    },
  ],
  other: [
    {
      title: "Phúc Lành Mùa Trăng",
      lines: [
        "Đèn lồng soi sáng đêm thu,",
        "Bình an may mắn tựa như trăng rằm.",
        "Vui tươi rạng rỡ quanh năm,",
        "Vạn sự như ý trăm phần hanh thông!",
      ],
      badge: "✨ May Mắn Cát Tường",
    },
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
  ],
};

export function generatePoem(name?: string, category: DreamCategory = "career"): PoemResult {
  const templates = POEM_TEMPLATES[category] || POEM_TEMPLATES.career;
  const picked = templates[Math.floor(Math.random() * templates.length)];

  const personalizedLines = [...picked.lines];
  if (name && name.trim()) {
    const trimmed = name.trim();
    personalizedLines[0] = `Mừng ${trimmed} thắp ước mơ,`;
  }

  return {
    title: picked.title,
    lines: personalizedLines,
    meaning: "Chúc bạn vững bước kiên cường trên con đường chinh phục đỉnh cao công nghệ cùng FU-DEVER!",
    badge: picked.badge,
  };
}
