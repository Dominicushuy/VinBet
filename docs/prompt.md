# Yêu cầu Phát triển VinBet: Hệ thống Thông báo

## Nhiệm vụ Hiện tại

Theo file `plan.md`, cần phát triển hệ thống thông báo với các công việc cụ thể:

### 5.1 Thông báo trong ứng dụng (2 ngày)

#### Backend - 0.5 ngày

- [ ] Tạo function create_notification
  - [ ] Tạo thông báo mới
- [ ] Tạo function mark_notification_read
  - [ ] Đánh dấu đã đọc
- [ ] Tạo function get_user_notifications
  - [ ] Lấy thông báo của user

#### Frontend Components - 1 ngày

- [ ] Tạo NotificationDropdown component
  - [ ] Dropdown hiển thị thông báo
  - [ ] Indicator số lượng chưa đọc
- [ ] Tạo NotificationList component
  - [ ] Danh sách thông báo
  - [ ] Pagination
- [ ] Tạo NotificationItem component
  - [ ] Hiển thị một thông báo
  - [ ] Action mark read
- [ ] Tạo NotificationBadge component
  - [ ] Badge hiển thị số lượng chưa đọc

#### API Routes - 0.5 ngày

- [ ] Tạo route /api/notifications
  - [ ] GET danh sách thông báo
- [ ] Tạo route /api/notifications/[id]/read
  - [ ] POST đánh dấu đã đọc
- [ ] Tạo route /api/notifications/count
  - [ ] GET số lượng chưa đọc

## Cấu trúc dự án hiện tại

- Database Schema: Xem file `schema.sql` để hiểu cấu trúc dữ liệu, đặc biệt là các bảng liên quan đến users và notifications
- API Services: Sử dụng @tanstack/react-query cho client-side data fetching
- UI: TailwindCSS + Shadcn/UI components
- Authentication: Supabase Auth
- Database: Supabase PostgreSQL với RLS policies

## Mô tả cụ thể yêu cầu

1. **Luồng thông báo**:

   - Thông báo được tạo từ nhiều nguồn (admin, system events, user interactions)
   - Người dùng nhận thông báo trong ứng dụng
   - Hiển thị số lượng thông báo chưa đọc
   - Người dùng có thể đánh dấu thông báo đã đọc
   - Hỗ trợ phân trang cho danh sách thông báo

2. **Quy định code**:
   - Frontend: Tạo hooks riêng cho mỗi API call, sử dụng react-query
   - Backend: Xử lý hiệu quả việc tạo và truy xuất thông báo
   - Validation: Kiểm tra thông tin người dùng, phân quyền
   - Phân quyền: Người dùng chỉ thấy thông báo của mình, Admin có thể tạo thông báo hệ thống

## Yêu cầu trả lời

- Tập trung vào code trực tiếp, hạn chế giải thích dài dòng
- Phân chia rõ ràng theo cấu trúc file
- Ưu tiên tích hợp với code hiện có (kiểm tra file `trigger_functions.sql`)
- Bao gồm RLS policies cần thiết cho bảo mật thông báo
- Đảm bảo hiệu suất khi số lượng thông báo tăng lên
- Implement các loại thông báo: system, user, alert, info

## Tham khảo Code Pattern hiện tại hiện có trong Github
