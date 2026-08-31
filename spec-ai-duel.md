# SPEC: "Buggy AI Arena" — FU-DEVER Club Day 2026

**Sự kiện:** Club Day 12/09/2026, 08:15–12:00
**Deadline hoàn thiện:** 09/09/2026
**Vận hành:** Nhật từ trang `/admin` (God Mode)
**Stack:** Next.js + Vercel + Supabase (đồng bộ hạ tầng với Deploy Ước Mơ — có thể dùng chung project Supabase, khác bảng dữ liệu)
**Nhân vật chính:** Buggy — mascot bọ rùa của FU-DEVER, luôn xưng "Buggy" ở ngôi thứ ba (không dùng "tao/tôi")

---

## 1. Mục tiêu

- Thay thế cơ chế may rủi thuần tuý (vòng quay) bằng một trải nghiệm "đấu trí" có kịch tính, đúng chất CLB IT.
- Giữ chân sinh viên ở gian hàng lâu hơn qua cơ chế thưởng phân tầng.
- Thu thập SĐT/Zalo của sinh viên tiềm năng cho đợt tuyển Gen mới, tại đúng thời điểm có động lực (lúc nhận thưởng).
- Tạo hiệu ứng lan truyền tại chỗ (quay video, story) nhờ cá tính Buggy và bảng xếp hạng trực tiếp.

## 2. Nguyên tắc vận hành quan trọng (đã thống nhất)

- **Câu thoại tĩnh là nguồn chính**, không phụ thuộc real-time API cho phần lõi của trận đấu — đảm bảo chạy ổn định dù mạng yếu.
- **Form đầu trận tối giản** — chỉ hỏi nickname, không hỏi mã SV/ngành/SĐT trước khi chơi.
- **Có ranh giới rõ giữa phần lõi bắt buộc và phần thêm** — xem `task-list-ai-duel.md`.

## 3. Game loop — Trận đấu 60 giây

- 1 trận = 5 câu hỏi liên tiếp, 10–12 giây/câu, tổng ~60 giây.
- Ngân hàng câu hỏi, 4 chủ đề, xáo trộn ngẫu nhiên mỗi trận:
  1. Logic IT cơ bản
  2. Meme sinh viên FPTU
  3. Câu đố mẹo bẻ lái (câu hỏi có bẫy, không cần kiến thức chuyên môn)
  4. Văn hoá FU-DEVER (câu hỏi vui về chính CLB — tăng gắn kết)
- **Công thức tính điểm:**
  `Điểm = (Số câu đúng × 100) + (Thời gian còn lại × 10) + Streak Bonus`
  - Streak Bonus: cộng thêm khi trả lời đúng liên tiếp (ví dụ +20 điểm mỗi câu đúng liên tiếp từ câu thứ 2 trở đi — số cụ thể để Nhật/agent tinh chỉnh khi test).
- Kết thúc trận → hiện ngay điểm số + số câu đúng + tier đạt được.

## 4. AI Buggy — Persona & Trash-Talk Engine

- **Tính cách:** xéo xắt, tự tin, hài hước, không ác ý — dùng ngôn ngữ sinh viên FPT ("toang môn", "deadline dí", "PRJ301"...).
- **Luôn xưng "Buggy" ở ngôi thứ ba**, đúng quy ước mascot của CLB (VD: "Buggy thấy câu này dễ ẹc mà bạn trả lời sai nè", không dùng "tao/tôi thấy...").
- **Nguồn thoại (đã thống nhất là nguồn chính):** ngân hàng ~100+ câu thoại tĩnh, phân loại theo tình huống:
  - Khi người chơi trả lời đúng nhanh
  - Khi trả lời đúng nhưng chậm
  - Khi trả lời sai
  - Khi đạt streak
  - Khi thua/hết giờ
  - Khi thắng tuyệt đối (5/5)
  - Câu mở đầu trận / câu chờ (idle) khi chưa ai chơi
- **Lớp "gia vị" thêm (không bắt buộc cho MVP):** gọi Gemini API cho những khoảnh khắc **không cần phản hồi tức thời**, cụ thể là tính năng "đoán ước mơ" (mục 5) — vì đây là màn hình kết quả, có thể chờ 1-2 giây mà không ảnh hưởng nhịp trận đấu. Có fallback: nếu API lỗi/timeout, dùng 1 câu thoại tĩnh generic thay thế, không để trống hoặc lỗi hiển thị.

## 5. Tính năng "Đoán ước mơ" (Mind-Reading) — thêm nếu còn thời gian

- Nếu người chơi đã gửi ước mơ ở Deploy Ước Mơ trước đó (match theo tên/nickname nếu trùng, hoặc theo cách khác agent đề xuất — cần xác nhận thêm nếu build), Buggy chêm 1 câu cà khịa liên quan đến nội dung ước mơ đó ở màn hình kết quả.
- Đây là tính năng **không thuộc lõi bắt buộc** — cần cả 2 hệ dữ liệu (Deploy Ước Mơ + Buggy Arena) liên kết được với nhau, rủi ro kỹ thuật cao hơn, xếp vào nhóm "thêm nếu còn giờ".

## 6. Phân tầng phần thưởng

| Tier | Điều kiện | Phần thưởng |
|---|---|---|
| Tier 1 | Đúng 3–4/5 câu | Sticker DEVER độc quyền |
| Tier 2 | Đúng 5/5 câu | Móc khoá/Thẻ Hacker DEVER + vinh danh trên màn hình lớn |
| Tier 3 | Lọt Top 5 leaderboard trong ngày | Phần quà đặc biệt (Admin xác nhận trao tay) |

## 7. Đổi thưởng bằng QR động

- Sau khi kết thúc trận và đạt tier, hệ thống tạo **1 mã QR có token ký (HMAC hoặc tương đương), hết hạn sau 60–120 giây**, hiện ngay trên điện thoại người chơi.
- Người chơi mang điện thoại đến quầy admin, Nhật quét/nhập mã trên `/admin`.
- Admin bấm **[Xác nhận đã trao quà]** → đánh dấu mã đã dùng trong hệ thống, không cho dùng lại (chống trùng lặp/gian lận).
- Nếu mã hết hạn trước khi kịp đến quầy → có nút **"Tạo lại mã"** trên màn hình kết quả (không giới hạn số lần tạo lại trong cùng 1 kết quả trận đấu, tránh sinh viên bị mất thưởng oan).

## 8. Thu thập dữ liệu — 2 điểm chạm

1. **Đầu trận:** chỉ hỏi **nickname** (hiển thị trên leaderboard). Không hỏi gì thêm ở bước này.
2. **Cuối trận, lúc đổi thưởng tại quầy:** xin **SĐT** để nhận mã quà + thông báo kết quả qua Zalo OA. Đây là bước duy nhất thu thập thông tin liên hệ thật, đúng lúc người chơi có động lực nhất (vừa thắng, muốn nhận quà).
3. Toàn bộ dữ liệu đồng bộ để **xuất Excel** danh sách sinh viên tiềm năng cho đợt tuyển Gen mới (dùng chung cơ chế export như Deploy Ước Mơ).

## 9. Màn hình Display (`/display`) — Split-View

Chia đôi màn hình, chạy song song với Deploy Ước Mơ:

| Vùng | Tỉ lệ | Nội dung |
|---|---|---|
| Trái | 65% | Bầu trời đèn lồng "Deploy Ước Mơ" (giữ nguyên như spec cũ) |
| Phải | 35% | "Buggy Live Arena" — trận đấu đang diễn ra (câu hỏi hiện tại, đồng hồ đếm ngược, điểm số live), lời bình luận của Buggy, Top 10 leaderboard trong ngày |

- Vì đây là chung 1 máy/màn hình với Deploy Ước Mơ, cần đảm bảo hiệu năng: hiệu ứng đèn lồng bên trái không bị giật khi bên phải cập nhật trận đấu liên tục.

## 10. Trang Admin — "God Mode" (mở rộng từ `/admin` đã có)

Ngoài các chức năng quản lý Deploy Ước Mơ đã có, thêm:
- Danh sách người đang chơi/vừa chơi xong, trạng thái mã đổi thưởng (chưa dùng/đã dùng/hết hạn).
- Nút **[Xác nhận đã trao quà]** cho từng mã.
- Nút **[Tặng thêm lượt chơi]** — cấp thêm 1 lượt chơi miễn phí cho 1 nickname cụ thể (dùng khi cần giữ chân khách VIP hoặc xử lý sự cố).
- Nút **[Kích hoạt sự kiện đột xuất / Glitch Effect]** — thêm nếu còn thời gian, không thuộc lõi bắt buộc (xem task-list).

## 11. Timeline

| Mốc | Ngày |
|---|---|
| Hoàn thiện phần lõi bắt buộc, sẵn sàng test | 09/09/2026 |
| Test thử / dry-run tại gian hàng | trước 12/09/2026 |
| Sự kiện chính thức | 12/09/2026, 08:15–12:00 |

---

*File này dùng làm brief cho coding agent (Antigravity) — xem thêm `design-ai-duel.md` (thiết kế) và `task-list-ai-duel.md` (chia việc, có đánh dấu rõ lõi bắt buộc vs phần thêm).*
