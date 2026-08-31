# TASK LIST: "Buggy AI Arena" — cho Antigravity Coding Agent

Chia theo nhóm chức năng, đi kèm `spec-ai-duel.md` và `design-ai-duel.md`. Mỗi nhóm đánh dấu rõ **[LÕI]** (bắt buộc chạy được trước 09/09) hoặc **[THÊM]** (chỉ làm nếu còn thời gian, không được đánh đổi lấy thời gian của phần LÕI).

Giả định: project Deploy Ước Mơ (Nhóm 0-1 của task-list đó) đã có sẵn Next.js + Supabase + Vercel — Buggy Arena tái sử dụng cùng hạ tầng, thêm bảng dữ liệu và route riêng.

---

## Nhóm A — Data model & câu thoại/câu hỏi [LÕI]

**Việc cần làm:**
- Tạo bảng `duel_sessions`: id, nickname, score, correct_count, tier, created_at, reward_code (mã QR động), reward_code_expires_at, reward_status (`pending` / `claimed` / `expired`), phone (nullable, điền lúc đổi thưởng).
- Tạo bảng/file `duel_questions`: câu hỏi, 4 chủ đề, đáp án đúng + đáp án nhiễu (dạng JSON hoặc bảng Supabase — agent chọn theo độ tiện khi seed dữ liệu).
- Tạo file `buggy-lines.json`: ngân hàng câu thoại tĩnh của Buggy, phân theo tình huống (đúng nhanh / đúng chậm / sai / streak / thua / thắng tuyệt đối / chờ / mở đầu) — cần tối thiểu ~100 câu như đã thống nhất, nhưng có thể bắt đầu với ~30-40 câu cho MVP rồi bổ sung dần.
- Soạn tối thiểu ~40-60 câu hỏi (đủ xoay vòng nhiều lượt chơi trong 4 tiếng mà không lặp quá nhanh), chia đều 4 chủ đề.

**MVP đạt khi:** Có đủ dữ liệu câu hỏi + câu thoại nạp sẵn trong hệ thống, query/random được từ code.

---

## Nhóm B — Game loop & chấm điểm (`/duel`) [LÕI]

**Việc cần làm:**
- Màn hình nhập nickname → bắt đầu trận.
- Logic random 5 câu hỏi từ 4 chủ đề, đếm ngược 10-12s/câu.
- Tính điểm theo công thức đã chốt: `(số câu đúng × 100) + (thời gian còn lại × 10) + streak bonus`.
- Feedback tức thời đúng/sai sau mỗi câu, kèm 1 câu thoại tĩnh ngẫu nhiên từ `buggy-lines.json` đúng tình huống.
- Màn hình kết quả: điểm, số câu đúng, tier đạt được, câu thoại tổng kết.
- Lưu session vào bảng `duel_sessions`.

**MVP đạt khi:** Chơi thử end-to-end trên điện thoại thật, hoàn thành 1 trận 5 câu, điểm tính đúng công thức, tier xác định đúng theo bảng ở spec.

---

## Nhóm C — QR đổi thưởng động [LÕI]

**Việc cần làm:**
- Sinh mã token (HMAC hoặc UUID ký kèm timestamp) khi kết thúc trận và đạt tier ≥ 1, gắn với `duel_sessions.id`.
- Hiện QR code + đồng hồ đếm ngược hết hạn (60-120s) trên màn hình kết quả.
- Nút "Tạo lại mã" khi hết hạn (sinh token mới, cùng session).
- API xác thực mã: kiểm tra còn hạn + chưa `claimed` khi admin quét/nhập.

**MVP đạt khi:** Tạo mã → hết hạn đúng thời gian → tạo lại được → admin xác thực đúng mã hợp lệ, từ chối mã hết hạn/đã dùng.

---

## Nhóm D — Buggy Live Arena trên `/display` [LÕI cho phần cơ bản, THÊM cho phần nâng cao]

**[LÕI]**
- Chia layout `/display` thành 2 vùng: 65% trái (route/component Deploy Ước Mơ hiện có), 35% phải (Buggy Arena).
- Vùng phải subscribe realtime bảng `duel_sessions`: hiện trạng thái trận đang diễn ra (nickname, câu hỏi hiện tại, điểm live) khi có người chơi.
- Leaderboard Top 10 trong ngày, cập nhật realtime khi có session mới hoàn thành.

**[THÊM]**
- Bình luận Buggy live cập nhật theo diễn biến từng câu (thay vì chỉ hiện sau khi kết thúc trận).
- Hiệu ứng chuyển động/animation mượt hơn cho phần chuyển trạng thái.

**MVP đạt khi (phần LÕI):** Mở `/display`, chơi thử 1 trận từ điện thoại khác, thấy trạng thái + kết quả cập nhật đúng ở vùng Buggy Arena, leaderboard cập nhật đúng thứ hạng.

---

## Nhóm E — Admin God Mode (mở rộng `/admin`) [LÕI cho phần trao quà, THÊM cho phần vui]

**[LÕI]**
- Tab/section riêng "Buggy Arena" trong `/admin` đã có (dùng chung đăng nhập mật khẩu).
- Danh sách lượt chơi: nickname, điểm, tier, trạng thái mã (chưa dùng/đã trao/hết hạn), nút **[Xác nhận đã trao quà]** — cập nhật `reward_status = claimed`.
- Form nhập SĐT khi xác nhận trao quà (lưu vào `duel_sessions.phone`).
- Export CSV bao gồm dữ liệu Buggy Arena (nickname, điểm, tier, SĐT) — có thể gộp chung nút export với Deploy Ước Mơ hoặc tách riêng, agent chọn theo cách nào dễ maintain hơn.

**[THÊM]**
- Nút **[Tặng thêm lượt chơi]** cho 1 nickname cụ thể.
- Nút **[Kích hoạt Glitch Effect]** trên `/display` (hiệu ứng vui, không ảnh hưởng logic nghiệp vụ).

**MVP đạt khi (phần LÕI):** Từ `/admin`, xác nhận trao quà cho 1 lượt chơi thật, nhập SĐT, mã chuyển trạng thái đã dùng ngay, không thể dùng lại mã đó, xuất CSV thấy đúng dữ liệu.

---

## Nhóm F — Lớp "gia vị" AI thật (Gemini) [THÊM — hoàn toàn không bắt buộc]

**Việc cần làm (chỉ nếu nhóm A-E đã xong và ổn định):**
- Tích hợp Gemini API cho tính năng "đoán ước mơ" ở màn hình kết quả — gọi API sau khi có kết quả trận, không chặn phần hiển thị chính.
- Fallback bắt buộc: nếu API lỗi/timeout >1.5s → bỏ qua đoạn cà khịa này, không hiện lỗi cho người chơi.
- Cần xác định trước cách match dữ liệu giữa `duel_sessions.nickname` và dữ liệu ước mơ đã gửi (theo tên trùng khớp là cách đơn giản nhất, chấp nhận có thể không khớp 100%).

**MVP đạt khi:** Test thử với vài trường hợp có/không có ước mơ trùng tên, hệ thống xử lý mượt cả 2 trường hợp, không bao giờ hiện lỗi ra màn hình người chơi.

---

## Nhóm G — Deploy & test tải [LÕI]

**Việc cần làm:**
- Deploy chung với Vercel project của Deploy Ước Mơ (hoặc project riêng nếu agent thấy tách bạch dễ quản lý hơn).
- Test với nhiều thiết bị chơi gần như đồng thời (mô phỏng 10-15 người) để kiểm tra realtime trên `/display` không bị lag/xung đột dữ liệu.
- Test toàn bộ luồng trên URL thật (không phải localhost): nhập nickname → chơi → nhận QR → admin xác nhận → leaderboard cập nhật đúng.

**MVP đạt khi:** Test tải với nhiều thiết bị thật, hệ thống ổn định, dữ liệu nhất quán giữa `/duel`, `/display`, `/admin`.

---

**Thứ tự khuyến nghị:** A → B → C → E (phần lõi) → D (phần lõi) → G → (nếu còn thời gian) D/E phần thêm → F.

Ưu tiên tuyệt đối: **một trận đấu chơi được, tính điểm đúng, đổi được quà** — quan trọng hơn mọi hiệu ứng hình ảnh hay tính năng AI thật.
