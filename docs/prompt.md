# Yêu cầu Phát triển VinBet: Quản lý người dùng và game

## Nhiệm vụ Hiện tại

Theo file `plan.md`, cần phát triển hệ thống quản lý người dùng và game với các công việc cụ thể:

### 7.2 Quản lý người dùng và game (2 ngày)

#### Backend - 0.5 ngày
- [ ] Tạo function get_users_list
  - [ ] Lấy danh sách người dùng với filters
- [ ] Tạo function get_user_details
  - [ ] Lấy thông tin chi tiết người dùng
- [ ] Tạo function manage_game_rounds
  - [ ] Quản lý các lượt chơi

#### Frontend Components - 1.5 ngày
- [ ] Tạo UserManagement component
  - [ ] Quản lý danh sách người dùng
  - [ ] Search và filters
- [ ] Tạo UserDetail component
  - [ ] Chi tiết người dùng
- [ ] Tạo GameManagement component
  - [ ] Quản lý lượt chơi
- [ ] Tạo GameRoundControl component
  - [ ] Điều khiển lượt chơi
- [ ] Tạo GameResultInput component
  - [ ] Nhập kết quả lượt chơi

#### API Routes - 0.5 ngày
- [ ] Tạo route /api/admin/users
  - [ ] GET danh sách người dùng
- [ ] Tạo route /api/admin/users/[id]
  - [ ] GET/PUT thông tin người dùng
- [ ] Tạo route /api/admin/games
  - [ ] CRUD quản lý game
- [ ] Tạo route /api/admin/games/[id]/results
  - [ ] POST nhập kết quả

## Cấu trúc dự án hiện tại

- Database Schema: Xem file `schema.sql` để hiểu cấu trúc dữ liệu, đặc biệt là các bảng liên quan đến users và games
- API Services: Sử dụng @tanstack/react-query cho client-side data fetching
- UI: TailwindCSS + Shadcn/UI components
- Authentication: Supabase Auth
- Database: Supabase PostgreSQL với RLS policies

## Mô tả cụ thể yêu cầu

1. **Luồng quản lý người dùng**:

   - Admin có thể xem danh sách tất cả người dùng với khả năng lọc và tìm kiếm
   - Xem chi tiết thông tin người dùng bao gồm lịch sử giao dịch, cược, và hoạt động
   - Có thể chỉnh sửa trạng thái người dùng (khóa/mở khóa tài khoản)
   - Theo dõi lượt cược và hoạt động của người dùng cụ thể

2. **Luồng quản lý game**:
   - Admin có thể xem tất cả các lượt chơi (game rounds)
   - Điều khiển trạng thái lượt chơi (mở cược, đóng cược, công bố kết quả)
   - Nhập kết quả lượt chơi và xác nhận kết quả
   - Xem lịch sử và thống kê các lượt chơi

3. **Quy định code**:
   - Frontend: Tạo hooks riêng cho quản lý user và game
   - Backend: Đảm bảo kiểm tra quyền admin trước khi thực hiện các thao tác
   - Validation: Xác thực đầy đủ dữ liệu đầu vào, đặc biệt khi nhập kết quả game
   - Phân quyền: Chỉ admin có quyền truy cập và chỉnh sửa thông tin
   - Performance: Tối ưu hoá query để xử lý lượng dữ liệu lớn, hỗ trợ phân trang

## Yêu cầu trả lời

- Tập trung vào code trực tiếp, hạn chế giải thích dài dòng
- Phân chia rõ ràng theo cấu trúc file
- Ưu tiên tích hợp với hệ thống user và game đã có
- Bao gồm RLS policies cần thiết cho bảo mật thông tin
- Đảm bảo chỉ admin có quyền quản lý người dùng và game
- Implement UI với khả năng lọc, tìm kiếm và điều khiển hiệu quả
- Thiết kế luồng nhập và xác nhận kết quả game an toàn và có cơ chế kiểm tra

## Tham khảo Code Pattern hiện tại hiện có trong Github
