# Yêu cầu Phát triển VinBet: Quản lý Giao dịch

## Nhiệm vụ Hiện tại

Theo file `plan.md`, cần phát triển hệ thống quản lý giao dịch với các công việc cụ thể:

### 4.2 Quản lý giao dịch (2 ngày)

#### Backend - 0.5 ngày

- [ ] Tạo function get_transaction_history
  - [ ] Lấy lịch sử giao dịch với filters
- [ ] Tạo function get_transaction_summary
  - [ ] Tính toán tổng hợp giao dịch

#### Frontend Components - 1.5 ngày

- [ ] Tạo TransactionHistory component
  - [ ] Hiển thị lịch sử giao dịch
  - [ ] Pagination và filters
- [ ] Tạo TransactionFilters component
  - [ ] Bộ lọc theo loại và thời gian
- [ ] Tạo TransactionDetail component
  - [ ] Hiển thị chi tiết giao dịch
- [ ] Tạo FinancialSummary component
  - [ ] Hiển thị tổng hợp tài chính

#### API Routes - 0.5 ngày

- [ ] Tạo route /api/transactions
  - [ ] GET lịch sử giao dịch với filters
- [ ] Tạo route /api/transactions/summary
  - [ ] GET tổng hợp giao dịch

## Cấu trúc dự án hiện tại

- Database Schema: Xem file `schema.sql` để hiểu cấu trúc dữ liệu, đặc biệt là các bảng liên quan đến transactions
- API Services: Sử dụng @tanstack/react-query cho client-side data fetching
- UI: TailwindCSS + Shadcn/UI components
- Authentication: Supabase Auth
- Database: Supabase PostgreSQL với RLS policies

## Mô tả cụ thể yêu cầu

1. **Luồng quản lý giao dịch**:

   - Hệ thống ghi nhận các loại giao dịch: nạp tiền, rút tiền, đặt cược, thắng cược
   - Người dùng xem lịch sử giao dịch cá nhân với các bộ lọc
   - Admin xem tất cả giao dịch hệ thống và báo cáo tổng hợp
   - Báo cáo tài chính đơn giản với thống kê theo loại giao dịch và thời gian

2. **Quy định code**:
   - Frontend: Tạo hooks riêng cho mỗi API call, sử dụng react-query
   - Backend: Viết Supabase functions tối ưu cho việc query dữ liệu lớn
   - Phân quyền: User chỉ xem được giao dịch của mình, Admin xem được tất cả
   - UI: Sử dụng Data Table của Shadcn/UI cho hiển thị giao dịch

## Yêu cầu trả lời

- Tập trung vào code trực tiếp, hạn chế giải thích dài dòng
- Phân chia rõ ràng theo cấu trúc file
- Ưu tiên tích hợp với code hiện có (kiểm tra file `trigger_functions.sql`)
- Bao gồm RLS policies cần thiết cho bảo mật giao dịch
- Implement pagination server-side cho hiệu suất tốt với dữ liệu lớn
- Đảm bảo độ chính xác của các tính toán tài chính

## Tham khảo Code Pattern hiện tại hiện có trong Github
