# Yêu cầu Phát triển VinBet: Quản trị hệ thống (Admin)

## Nhiệm vụ Hiện tại

Theo file `plan.md`, cần phát triển hệ thống quản trị (admin) với các công việc cụ thể:

### 7. Quản trị hệ thống (Admin) (6 ngày)

#### 7.1 Dashboard Admin (2 ngày)

##### Backend - 0.5 ngày
- [ ] Tạo function get_dashboard_summary
  - [ ] Lấy thống kê tổng quan
- [ ] Tạo function get_key_metrics
  - [ ] Lấy các chỉ số quan trọng

##### Frontend Components - 1.5 ngày
- [ ] Tạo AdminLayout component
  - [ ] Layout chung cho admin
- [ ] Tạo AdminDashboard component
  - [ ] Dashboard tổng quan
- [ ] Tạo AdminStats component
  - [ ] Cards hiển thị thống kê
- [ ] Tạo AdminCharts component
  - [ ] Biểu đồ thống kê cơ bản

##### API Routes - 0.5 ngày
- [ ] Tạo route /api/admin/dashboard-summary
  - [ ] GET dữ liệu tổng quan
- [ ] Tạo route /api/admin/metrics
  - [ ] GET các chỉ số quan trọng

## Cấu trúc dự án hiện tại

- Database Schema: Xem file `schema.sql` để hiểu cấu trúc dữ liệu, đặc biệt là các bảng liên quan đến users và admin
- API Services: Sử dụng @tanstack/react-query cho client-side data fetching
- UI: TailwindCSS + Shadcn/UI components
- Authentication: Supabase Auth
- Database: Supabase PostgreSQL với RLS policies

## Mô tả cụ thể yêu cầu

1. **Luồng hệ thống quản trị**:

   - Chỉ admin có quyền truy cập vào dashboard quản trị
   - Dashboard hiển thị thống kê tổng quan về người dùng, giao dịch, cược
   - Các chỉ số quan trọng được hiển thị dưới dạng cards, biểu đồ
   - Admin có thể xem thông tin chi tiết về hoạt động hệ thống

2. **Quy định code**:
   - Frontend: Tạo hooks riêng cho các tính năng admin
   - Backend: Đảm bảo kiểm tra quyền admin trước khi trả về dữ liệu nhạy cảm
   - Validation: Xác thực quyền truy cập tại cả frontend và backend
   - Phân quyền: Sử dụng RLS policies để giới hạn quyền truy cập
   - Metrics: Tính toán chính xác các chỉ số quan trọng (số lượng users, tổng deposit, revenue...)

## Yêu cầu trả lời

- Tập trung vào code trực tiếp, hạn chế giải thích dài dòng
- Phân chia rõ ràng theo cấu trúc file
- Ưu tiên tích hợp với hệ thống user và payment đã có
- Bao gồm RLS policies cần thiết cho bảo mật thông tin admin
- Đảm bảo chỉ admin có quyền truy cập dashboard
- Implement các biểu đồ thống kê dễ đọc và thông tin hữu ích
- Thiết kế UI dashboard chuyên nghiệp và dễ sử dụng

## Tham khảo Code Pattern hiện tại hiện có trong Github
