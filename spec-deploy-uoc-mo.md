# SPEC: Website "Deploy Ước Mơ" — FU-DEVER Club Day 2026

**Sự kiện:** Club Day 12/09/2026, 08:15–12:00
**Deadline hoàn thiện:** 09/09/2026 (để kịp test trước sự kiện)
**Vận hành tại gian hàng:** Nhật (chủ nhiệm CLB)

---

## 1. Mục tiêu

- Tạo trải nghiệm/kỷ niệm đáng nhớ cho tân sinh viên K22 tại gian hàng FU-DEVER.
- Thu thập thông tin liên hệ của sinh viên quan tâm để CLB follow-up (mời vào CLB, gửi thư cảm ơn...).
- Tăng nhận diện thương hiệu FU-DEVER khi sinh viên đăng "dream card" lên story cá nhân.

## 2. Luồng người dùng (User flow)

1. Sinh viên đến gian hàng, thấy standee/bảng "Deploy Ước Mơ" với **QR code**.
2. Quét QR bằng điện thoại cá nhân → mở trang web (chạy trên mạng riêng của CLB tại gian hàng, không cần internet ngoài).
3. Điền form:
   - **Tên** (có thể để trống — cho phép ẩn danh)
   - **Nội dung ước mơ** (không giới hạn ký tự)
   - **Chủ đề gợi ý** (tag chọn nhanh, xem mục 4)
4. Bấm gửi → ước mơ được lưu vào hệ thống và **hiện ngay lập tức** lên màn hình laptop tại gian hàng dưới dạng đèn lồng bay lên "bầu trời".
5. Sau khi gửi, sinh viên nhận được một **"Dream Card"** — ảnh cá nhân hoá có nội dung ước mơ, tên (nếu có), logo FU-DEVER + hashtag CLB — để lưu về máy/đăng story.

## 3. Hai màn hình (2 "mặt" của web)

Vì chỉ dùng 1 laptop, web cần **2 chế độ hiển thị**:

| Chế độ | Thiết bị | Nội dung |
|---|---|---|
| **Form nhập** | Điện thoại sinh viên (qua QR) | Form điền tên + ước mơ + chọn tag |
| **Bảng hiển thị công khai (Public Display)** | Màn hình laptop tại gian hàng | Hiệu ứng "bầu trời đèn lồng" — các ước mơ mới gửi hiện lên real-time, trôi/bay nhẹ nhàng, tự động cập nhật liên tục suốt sự kiện |

Cả hai chạy trên cùng 1 web app, chỉ khác route/URL (VD: `/` = form nhập trên điện thoại, `/display` = màn hình public trên laptop).

## 4. Chủ đề gợi ý (tag chọn nhanh)

Vài gợi ý ban đầu (Nhật có thể chỉnh lại):
- 💻 Sự nghiệp / Công việc mơ ước
- 🎓 Học tập / Thành tích
- 🌏 Trải nghiệm / Du lịch
- ❤️ Gia đình / Tình cảm
- 🚀 Ước mơ lớn / Thay đổi thế giới
- ✨ Khác

## 5. "Bầu trời đèn lồng" — ý tưởng thiết kế hiệu ứng hiển thị

- Nền tối nhẹ (xanh đêm đậm hoặc gradient đỏ-vàng trầm) để đèn lồng nổi bật.
- Mỗi ước mơ mới gửi → xuất hiện thành một **chiếc đèn lồng nhỏ** (hình tròn/lục giác, màu đỏ-vàng, có ánh sáng phát ra nhẹ) từ phía dưới màn hình, **bay từ từ lên trên** rồi biến mất hoặc dạt sang một bên khi đầy màn hình.
- Trên đèn lồng: hiện **tên** (nếu có) + vài từ đầu của ước mơ (rút gọn để không vỡ layout); chạm/hover (nếu có chuột) có thể phóng to xem đầy đủ — nhưng vì đây là public display không tương tác trực tiếp, có thể bỏ qua phần này.
- Có thể thêm hiệu ứng nền: sao lấp lánh nhẹ, hoặc silhouette mặt trăng Trung Thu góc màn hình.
- Logo FU-DEVER đặt góc trên/dưới màn hình, không che nội dung chính.
- Hiệu ứng cần nhẹ (không giật/lag) vì chạy liên tục 4 tiếng trên 1 laptop.

## 6. Dream Card (ảnh cá nhân)

- Kích thước phù hợp để đăng Instagram/Facebook story (dọc, tỉ lệ 9:16).
- Nội dung: tên (nếu có) + ước mơ + ngày 12/09/2026 + logo FU-DEVER + hashtag CLB (VD: #FUDEVER #ClubDay2026 #DeployUocMo).
- Nền theo tông đỏ-vàng Trung Thu, có thể có hoạ tiết đèn lồng/hoa văn nhẹ, điểm nhấn logo xanh FU-DEVER.
- Cho phép tải ảnh về máy trực tiếp từ trình duyệt điện thoại (không cần app thêm).

## 7. Bảng màu & thương hiệu

- **Chủ đạo:** Đỏ - Vàng (tinh thần Trung Thu).
- **Điểm nhấn:** Xanh dương thương hiệu FU-DEVER (#0091EA hoặc tương đương từ logo) dùng cho nút bấm, tiêu đề, hoặc chi tiết công nghệ.
- Logo FU-DEVER xuất hiện ở cả form nhập và bảng hiển thị công khai.
- Font: có thể kết hợp font hiện đại/công nghệ cho tiêu đề + font mềm mại hơn cho phần nội dung ước mơ.

## 8. Dữ liệu & lưu trữ

- Lưu toàn bộ ước mơ vào hệ thống (không cần kiểm duyệt trước khi hiển thị).
- Sau sự kiện, cần **xuất được dữ liệu dạng CSV/Excel** (tên, ước mơ, tag, thời gian gửi) để:
  - Làm recap
  - Gửi email cảm ơn
  - Đăng lại (chọn lọc) lên fanpage
- Vì chạy local tại gian hàng (không cần domain public), dữ liệu lưu trực tiếp trên laptop vận hành — cần đảm bảo có backup (VD: export định kỳ trong lúc sự kiện) để tránh mất dữ liệu nếu laptop gặp sự cố.

## 9. Yêu cầu kỹ thuật

- Chạy được **hoàn toàn local** trên mạng riêng của CLB (không phụ thuộc internet trường) — điện thoại sinh viên và laptop hiển thị phải cùng mạng để truy cập qua QR.
- Là **web hoàn chỉnh** (không phải chỉ demo/artifact tạm) — Nhật sẽ dùng coding agent để build, tự host bằng laptop tại gian hàng.
- Giao diện responsive tốt trên điện thoại (form nhập) và trên laptop (display).
- Cần ổn định để chạy liên tục ~4 tiếng không bị lỗi/crash.

## 10. Timeline

| Mốc | Ngày |
|---|---|
| Hoàn thiện web, sẵn sàng test | 09/09/2026 |
| Test thử tại gian hàng / dry-run | trước 12/09/2026 |
| Sự kiện chính thức | 12/09/2026, 08:15–12:00 |

---

*File này dùng làm brief cho coding agent để bắt đầu build website.*
