# Yêu cầu Phát triển VinBet: Hệ thống Referral

## Nhiệm vụ Hiện tại

Theo file `plan.md`, cần phát triển hệ thống referral (giới thiệu) với các công việc cụ thể:

### 6. Hệ thống Referral (3 ngày)

#### Backend - 1 ngày

- [ ] Tạo function generate_referral_code
  - [ ] Tạo mã giới thiệu unique
- [ ] Tạo function track_referral_signup
  - [ ] Theo dõi đăng ký qua giới thiệu
- [ ] Tạo function calculate_referral_reward
  - [ ] Tính toán thưởng giới thiệu

#### Frontend Components - 1.5 ngày

- [ ] Tạo ReferralCodeCard component
  - [ ] Hiển thị mã giới thiệu
  - [ ] Copy và share
- [ ] Tạo ReferralShareLinks component
  - [ ] Các nút chia sẻ mạng xã hội
- [ ] Tạo ReferralStatistics component
  - [ ] Thống kê giới thiệu
- [ ] Tạo ReferralsList component
  - [ ] Danh sách người được giới thiệu

#### API Routes - 0.5 ngày

- [ ] Tạo route /api/referrals/code
  - [ ] GET lấy/tạo mã giới thiệu
- [ ] Tạo route /api/referrals/stats
  - [ ] GET thống kê giới thiệu
- [ ] Tạo route /api/referrals/list
  - [ ] GET danh sách đã giới thiệu

## Cấu trúc dự án hiện tại

- Database Schema: Xem file `schema.sql` để hiểu cấu trúc dữ liệu, đặc biệt là các bảng liên quan đến users và referrals
- API Services: Sử dụng @tanstack/react-query cho client-side data fetching
- UI: TailwindCSS + Shadcn/UI components
- Authentication: Supabase Auth
- Database: Supabase PostgreSQL với RLS policies

## Mô tả cụ thể yêu cầu

1. **Luồng hệ thống referral**:

   - Mỗi người dùng có một mã giới thiệu unique
   - Người dùng mới đăng ký bằng mã giới thiệu
   - Hệ thống theo dõi liên kết giữa người giới thiệu và người được giới thiệu
   - Người giới thiệu nhận thưởng khi người được giới thiệu hoàn thành điều kiện (deposit, bet)
   - Hiển thị thống kê và danh sách người được giới thiệu

2. **Quy định code**:
   - Frontend: Tạo hooks riêng cho các tính năng referral
   - Backend: Đảm bảo tính độc nhất của mã giới thiệu, xác thực chính xác
   - Validation: Kiểm tra mã giới thiệu hợp lệ khi đăng ký
   - Phân quyền: Người dùng chỉ thấy thông tin referral của mình
   - Rewards: Tính toán chính xác thưởng theo quy định (% of deposits/bets)

## Yêu cầu trả lời

- Tập trung vào code trực tiếp, hạn chế giải thích dài dòng
- Phân chia rõ ràng theo cấu trúc file
- Ưu tiên tích hợp với hệ thống user và payment đã có
- Bao gồm RLS policies cần thiết cho bảo mật thông tin referral
- Đảm bảo tracking chính xác các referrals và rewards
- Implement các tính năng copy mã giới thiệu và chia sẻ qua mạng xã hội
- Thiết kế UI thân thiện cho việc theo dõi thống kê referral

## Tham khảo Code Pattern hiện tại hiện có trong Github
