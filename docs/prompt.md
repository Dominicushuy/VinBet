# Yêu cầu Phát triển VinBet: Thông báo Telegram

## Nhiệm vụ Hiện tại

Theo file `plan.md`, cần phát triển hệ thống thông báo Telegram với các công việc cụ thể:

### 5.2 Thông báo Telegram (1 ngày)

#### Backend - 0.5 ngày

- [ ] Tạo function send_telegram_notification
  - [ ] Gửi thông báo quan trọng qua Telegram
- [ ] Tạo function connect_telegram
  - [ ] Liên kết tài khoản với Telegram

#### Frontend Components - 0.5 ngày

- [ ] Tạo TelegramConnect component
  - [ ] UI kết nối Telegram
  - [ ] Hiển thị trạng thái kết nối

#### API Routes - 0.5 ngày

- [ ] Tạo route /api/notifications/telegram/connect
  - [ ] POST kết nối Telegram
- [ ] Tạo route /api/notifications/settings
  - [ ] GET/PUT cài đặt thông báo

## Cấu trúc dự án hiện tại

- Database Schema: Xem file `schema.sql` để hiểu cấu trúc dữ liệu, đặc biệt là các bảng liên quan đến users và notification_settings
- API Services: Sử dụng @tanstack/react-query cho client-side data fetching
- UI: TailwindCSS + Shadcn/UI components
- Authentication: Supabase Auth
- Database: Supabase PostgreSQL với RLS policies

## Mô tả cụ thể yêu cầu

1. **Luồng thông báo Telegram**:

   - Người dùng kết nối tài khoản Telegram với hệ thống
   - Hệ thống lưu chat_id để gửi thông báo
   - Thông báo quan trọng (rút tiền, đặt cược lớn, thay đổi bảo mật) được gửi qua Telegram
   - Người dùng có thể tùy chỉnh loại thông báo nhận qua Telegram

2. **Quy định code**:
   - Frontend: Tạo hooks riêng cho kết nối Telegram và cài đặt thông báo
   - Backend: Sử dụng Telegram Bot API, đảm bảo bảo mật token
   - Validation: Kiểm tra kết nối Telegram hợp lệ
   - Phân quyền: Người dùng chỉ quản lý kết nối Telegram của mình

## Yêu cầu trả lời

- Tập trung vào code trực tiếp, hạn chế giải thích dài dòng
- Phân chia rõ ràng theo cấu trúc file
- Ưu tiên tích hợp với hệ thống thông báo trong ứng dụng đã có
- Bao gồm cơ chế xử lý lỗi khi gửi thông báo Telegram
- Đảm bảo bảo mật thông tin kết nối Telegram của người dùng
- Implement các loại cài đặt thông báo: security_alerts, deposit_notifications, withdrawal_notifications, large_bet_notifications

## Tham khảo Code Pattern hiện tại hiện có trong Github
