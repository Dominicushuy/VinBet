# Yêu cầu Phát triển VinBet: Quản lý thanh toán

## Nhiệm vụ Hiện tại

Theo file `plan.md`, cần phát triển hệ thống quản lý thanh toán với các công việc cụ thể:

### 7.3 Quản lý thanh toán (2 ngày)

#### Backend - 0.5 ngày
- [ ] Tạo function approve_payment_request
  - [ ] Xử lý phê duyệt nạp tiền
- [ ] Tạo function reject_payment_request
  - [ ] Xử lý từ chối nạp tiền
- [ ] Tạo function get_payment_requests
  - [ ] Lấy danh sách yêu cầu với filters

#### Frontend Components - 1.5 ngày
- [ ] Tạo PaymentRequestsManagement component
  - [ ] Quản lý yêu cầu thanh toán
  - [ ] Filters theo trạng thái
- [ ] Tạo PaymentApproval component
  - [ ] UI phê duyệt thanh toán
- [ ] Tạo PaymentProofViewer component
  - [ ] Xem bằng chứng thanh toán
- [ ] Tạo WithdrawalRequestsManagement component
  - [ ] Quản lý yêu cầu rút tiền

#### API Routes - 0.5 ngày
- [ ] Tạo route /api/admin/payment-requests
  - [ ] GET danh sách với filters
- [ ] Tạo route /api/admin/payment-requests/[id]/approve
  - [ ] POST phê duyệt
- [ ] Tạo route /api/admin/payment-requests/[id]/reject
  - [ ] POST từ chối

## Cấu trúc dự án hiện tại

- Database Schema: Xem file `schema.sql` để hiểu cấu trúc dữ liệu, đặc biệt là các bảng liên quan đến payments và transactions
- API Services: Sử dụng @tanstack/react-query cho client-side data fetching
- UI: TailwindCSS + Shadcn/UI components
- Authentication: Supabase Auth
- Database: Supabase PostgreSQL với RLS policies

## Mô tả cụ thể yêu cầu

1. **Luồng quản lý thanh toán**:

   - Admin xem danh sách các yêu cầu nạp tiền/rút tiền đang chờ xử lý
   - Admin có thể lọc yêu cầu theo trạng thái, loại (nạp/rút), thời gian
   - Xem chi tiết yêu cầu thanh toán bao gồm thông tin người dùng, số tiền, bằng chứng thanh toán
   - Phê duyệt hoặc từ chối yêu cầu với lý do cụ thể
   - Khi phê duyệt, tài khoản người dùng được cập nhật số dư tự động

2. **Quy định code**:
   - Frontend: Tạo hooks riêng cho quản lý thanh toán
   - Backend: Đảm bảo kiểm tra quyền admin trước khi thực hiện các thao tác
   - Validation: Xác thực đầy đủ dữ liệu đầu vào, đặc biệt khi phê duyệt/từ chối yêu cầu
   - Transaction Safety: Sử dụng database transactions để đảm bảo tính toàn vẹn khi cập nhật số dư
   - Logging: Ghi lại đầy đủ lịch sử các thao tác phê duyệt/từ chối
   - Notification: Tích hợp thông báo cho người dùng khi yêu cầu được xử lý

## Yêu cầu trả lời

- Tập trung vào code trực tiếp, hạn chế giải thích dài dòng
- Phân chia rõ ràng theo cấu trúc file
- Ưu tiên tích hợp với hệ thống payment hiện có
- Bao gồm RLS policies cần thiết cho bảo mật thông tin thanh toán
- Đảm bảo chỉ admin có quyền xử lý yêu cầu thanh toán
- Implement UI với khả năng lọc, tìm kiếm và xem chi tiết hiệu quả
- Thiết kế luồng phê duyệt/từ chối an toàn với kiểm tra chéo

## Tham khảo Code Pattern hiện tại hiện có trong Github
