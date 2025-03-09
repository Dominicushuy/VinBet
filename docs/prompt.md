# Yêu cầu Phát triển VinBet: Quản lý Rút tiền

## Nhiệm vụ Hiện tại

Theo file `plan.md`, cần phát triển hệ thống quản lý rút tiền với các công việc cụ thể:

### 4.3 Quản lý rút tiền (2 ngày)

#### Backend - 0.5 ngày

- [ ] Tạo function create_withdrawal_request
  - [ ] Validation thông tin rút tiền
  - [ ] Kiểm tra đủ số dư
- [ ] Tạo function approve_withdrawal_request
  - [ ] Xử lý phê duyệt rút tiền
- [ ] Tạo function reject_withdrawal_request
  - [ ] Xử lý từ chối rút tiền

#### Frontend Components - 1.5 ngày

- [ ] Tạo WithdrawalForm component
  - [ ] Form nhập số tiền và thông tin
  - [ ] Validation số dư
- [ ] Tạo WithdrawalMethodSelect component
  - [ ] Chọn phương thức rút tiền
- [ ] Tạo WithdrawalHistory component
  - [ ] Hiển thị lịch sử rút tiền
- [ ] Tạo WithdrawalStatus component
  - [ ] Hiển thị trạng thái yêu cầu

#### API Routes - 0.5 ngày

- [ ] Tạo route /api/payment-requests/withdraw
  - [ ] POST tạo yêu cầu rút tiền
  - [ ] GET lấy danh sách
- [ ] Tạo route /api/payment-requests/withdraw/[id]
  - [ ] GET chi tiết yêu cầu

## Cấu trúc dự án hiện tại

- Database Schema: Xem file `schema.sql` để hiểu cấu trúc dữ liệu, đặc biệt là các bảng liên quan đến user balance và payment requests
- API Services: Sử dụng @tanstack/react-query cho client-side data fetching
- UI: TailwindCSS + Shadcn/UI components
- Authentication: Supabase Auth
- Database: Supabase PostgreSQL với RLS policies

## Mô tả cụ thể yêu cầu

1. **Luồng rút tiền**:

   - Người dùng tạo yêu cầu rút tiền (số tiền, phương thức, thông tin tài khoản nhận)
   - Hệ thống kiểm tra số dư và trừ tạm thời
   - Admin xem xét và phê duyệt/từ chối
   - Nếu phê duyệt, ghi nhận giao dịch hoàn tất
   - Nếu từ chối, hoàn lại số tiền đã trừ tạm thời

2. **Quy định code**:
   - Frontend: Tạo hooks riêng cho mỗi API call, sử dụng react-query
   - Backend: Xử lý transaction để đảm bảo tính nhất quán dữ liệu
   - Validation: Kiểm tra số dư, hạn mức rút tiền, thông tin người dùng đầy đủ
   - Phân quyền: Người dùng chỉ thao tác với yêu cầu của mình, Admin quản lý tất cả

## Yêu cầu trả lời

- Tập trung vào code trực tiếp, hạn chế giải thích dài dòng
- Phân chia rõ ràng theo cấu trúc file
- Ưu tiên tích hợp với code hiện có (kiểm tra file `trigger_functions.sql`)
- Bao gồm RLS policies cần thiết cho bảo mật giao dịch
- Đảm bảo xử lý đồng bộ giữa yêu cầu rút tiền và số dư người dùng
- Implement các trạng thái rút tiền: pending, approved, rejected

## Tham khảo Code Pattern hiện tại hiện có trong Github
