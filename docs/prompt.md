# Yêu cầu Phát triển VinBet: Hệ thống Nạp tiền

## Nhiệm vụ Hiện tại

Theo file `plan.md`, cần phát triển hệ thống nạp tiền với các công việc cụ thể:

### 4.1 Hệ thống nạp tiền (3 ngày)

#### Backend - 1 ngày

- [ ] Tạo function create_payment_request
  - [ ] Validation thông tin nạp tiền
- [ ] Tạo function approve_payment_request
  - [ ] Xử lý phê duyệt và cộng tiền
- [ ] Tạo function reject_payment_request
  - [ ] Xử lý từ chối nạp tiền

#### Frontend Components - 1.5 ngày

- [ ] Tạo DepositForm component
- [ ] Tạo PaymentProofUpload component
- [ ] Tạo PaymentRequestList component
- [ ] Tạo PaymentStatus component

#### API Routes - 0.5 ngày

- [ ] Tạo route /api/payment-requests
- [ ] Tạo route /api/payment-requests/upload-proof

## Cấu trúc dự án hiện tại

- Database Schema: Xem file `schema.sql` để hiểu cấu trúc dữ liệu
- API Services: Sử dụng @tanstack/react-query ở client
- UI: TailwindCSS + Shadcn/UI
- Authentication: Supabase Auth

## Mô tả cụ thể yêu cầu

1. **Luồng nạp tiền**:

   - Người dùng tạo yêu cầu nạp tiền (số tiền, phương thức, upload bằng chứng)
   - Admin xem xét và phê duyệt/từ chối
   - Nếu phê duyệt, cộng tiền vào tài khoản người dùng

2. **Quy định code**:
   - Frontend: Tạo hooks riêng cho mỗi API call
   - Backend: Viết functions rõ ràng với validation đầy đủ
   - Storage: Lưu bằng chứng nạp tiền vào Supabase Storage
   - Phân quyền: Thêm RLS policies phù hợp

## Yêu cầu trả lời

- Tập trung vào code trực tiếp, hạn chế giải thích
- Phân chia rõ ràng theo cấu trúc file
- Ưu tiên tích hợp với code hiện có (check file triggers_function.sql)
- Bao gồm RLS policies cần thiết
- Chỉ trả lời các mục được yêu cầu, không thêm phần không liên quan

## Tham khảo Code Pattern hiện tại

Tất cả files code có trong Github
