# Kế hoạch phát triển tinh gọn dự án Game Cá Cược - NextJS + Supabase (40 ngày)

## 1. Thiết lập nền tảng và cơ sở hạ tầng (5 ngày)

### 1.1 Thiết lập dự án và môi trường phát triển (3 ngày)

#### Backend (Supabase) - 1.5 ngày
- [ ] Tạo dự án Supabase mới
  - [ ] Đăng ký tài khoản Supabase (nếu chưa có)
  - [ ] Tạo dự án với tên "VinBet"
  - [ ] Lưu credentials vào file .env
- [ ] Cấu hình authentication
  - [ ] Kích hoạt Email provider
  - [ ] Tạo templates email xác thực và quên mật khẩu
  - [ ] Cấu hình redirects URL
- [ ] Thiết lập security policies
  - [ ] Tạo file .env.local với biến môi trường
  - [ ] Cấu hình CORS
- [ ] Cấu hình storage buckets
  - [ ] Tạo bucket "user_avatars"
  - [ ] Tạo bucket "payment_proofs"
  - [ ] Thiết lập RLS policies

#### Frontend (Next.js) - 1.5 ngày
- [ ] Khởi tạo dự án Next.js 14 với App Router
  - [ ] Chạy lệnh create-next-app
  - [ ] Thiết lập cấu hình cơ bản
- [ ] Cài đặt dependencies
  - [ ] TailwindCSS và plugins
  - [ ] HeadlessUI / shadcn/ui
  - [ ] React Query
  - [ ] Supabase Client
  - [ ] React Hook Form + Zod
  - [ ] React Hot Toast
- [ ] Thiết lập cấu trúc thư mục
  - [ ] Tạo cấu trúc thư mục cơ bản
  - [ ] Tạo thư mục components
  - [ ] Tạo thư mục hooks, lib, providers, services, types
- [ ] Cấu hình ESLint, TypeScript
  - [ ] Thiết lập eslintrc.js
  - [ ] Cấu hình tsconfig.json
- [ ] Tạo providers chính
  - [ ] Auth provider
  - [ ] Toast provider
  - [ ] Query provider

### 1.2 Thiết lập Database Schema và RLS Policies (2 ngày)

#### Database Schema - 1 ngày
- [ ] Tạo bảng profiles
  - [ ] Tạo quan hệ với auth.users
  - [ ] Thiết lập các trường cần thiết
- [ ] Tạo bảng game_rounds
  - [ ] Thiết lập các trường trạng thái, thời gian, kết quả
- [ ] Tạo bảng bets
  - [ ] Tạo quan hệ với profiles và game_rounds
  - [ ] Thiết lập các trường số tiền, số chọn, trạng thái
- [ ] Tạo bảng transactions
  - [ ] Thiết lập các trường loại giao dịch, số tiền, trạng thái
- [ ] Tạo bảng payment_requests
  - [ ] Thiết lập các trường yêu cầu nạp/rút tiền
- [ ] Tạo bảng notifications
  - [ ] Thiết lập các trường thông báo
- [ ] Tạo bảng referrals
  - [ ] Thiết lập các trường mã giới thiệu, người giới thiệu

#### Triggers và Functions - 0.5 ngày
- [ ] Tạo function handle_new_user
  - [ ] Thiết lập tự động tạo profile khi có user mới
- [ ] Tạo trigger on_auth_user_created
  - [ ] Gắn với function handle_new_user
- [ ] Tạo function update_balance_on_bet
  - [ ] Cập nhật balance khi đặt cược
- [ ] Tạo function complete_game_round
  - [ ] Xử lý kết quả và phân phối tiền thưởng

#### RLS Policies - 0.5 ngày
- [ ] Thiết lập RLS cho profiles
  - [ ] Chỉ người dùng có thể đọc/sửa profile của mình
- [ ] Thiết lập RLS cho bets
  - [ ] Chỉ người dùng có thể đặt cược cho mình
- [ ] Thiết lập RLS cho transactions
  - [ ] Người dùng chỉ xem được giao dịch của mình
- [ ] Thiết lập RLS cho notifications
  - [ ] Người dùng chỉ xem được thông báo của mình
- [ ] Thiết lập RLS cho payment_requests
  - [ ] Người dùng chỉ xem được yêu cầu của mình

## 2. Hệ thống xác thực và quản lý người dùng (6 ngày)

### 2.1 Xây dựng hệ thống Authentication (3 ngày)

#### Backend - 1 ngày
- [ ] Cấu hình Email authentication
  - [ ] Tùy chỉnh email templates
  - [ ] Thiết lập flow xác thực
- [ ] Tạo function register_new_user
  - [ ] Thêm validation cơ bản
  - [ ] Xử lý referral code (nếu có)

#### Frontend Components - 1 ngày
- [ ] Tạo AuthLayout
  - [ ] Thiết kế layout với logo, background
  - [ ] Đảm bảo responsive
- [ ] Tạo LoginForm component
  - [ ] Form đăng nhập với validation
  - [ ] Xử lý lỗi đăng nhập
- [ ] Tạo RegisterForm component
  - [ ] Form đăng ký với các trường cần thiết
  - [ ] Validate email và password
- [ ] Tạo ForgotPasswordForm component
  - [ ] Form email recovery
  - [ ] Thông báo xác nhận
- [ ] Tạo ResetPasswordForm component
  - [ ] Form reset password
  - [ ] Validation matching passwords

#### API Routes - 0.5 ngày
- [ ] Tạo route /api/auth/register
  - [ ] Xử lý đăng ký mới
- [ ] Tạo route /api/auth/login
  - [ ] Xử lý đăng nhập
- [ ] Tạo route /api/auth/verify-email
  - [ ] Xác minh email
- [ ] Tạo route /api/auth/reset-password
  - [ ] Xử lý reset password

#### Services & Hooks - 0.5 ngày
- [ ] Tạo AuthService
  - [ ] Implement login, register, resetPassword
- [ ] Tạo hook useAuth
  - [ ] Quản lý auth state
  - [ ] Expose auth methods
- [ ] Tạo middleware auth
  - [ ] Bảo vệ routes yêu cầu đăng nhập

### 2.2 Quản lý hồ sơ người dùng (3 ngày)

#### Backend - 1 ngày
- [ ] Tạo function update_user_profile
  - [ ] Validation thông tin profile
- [ ] Tạo function upload_avatar
  - [ ] Xử lý upload và lưu ảnh

#### Frontend Components - 1.5 ngày
- [ ] Tạo ProfileForm component
  - [ ] Form cập nhật thông tin cá nhân
  - [ ] Validation các trường
- [ ] Tạo AvatarUpload component
  - [ ] Upload và preview avatar
  - [ ] Hiển thị progress
- [ ] Tạo UserStatistics component
  - [ ] Hiển thị thống kê cơ bản
  - [ ] Hiển thị win/loss ratio

#### API Routes - 0.5 ngày
- [ ] Tạo route /api/profile
  - [ ] GET và PUT thông tin profile
- [ ] Tạo route /api/profile/avatar
  - [ ] Upload và cập nhật avatar
- [ ] Tạo route /api/profile/change-password
  - [ ] Đổi mật khẩu

## 3. Hệ thống Game và Cá cược (10 ngày)

### 3.1 Quản lý lượt chơi (3 ngày)

#### Backend - 1 ngày
- [ ] Tạo function create_game_round
  - [ ] Thiết lập thông tin lượt chơi
- [ ] Tạo function update_game_round_status
  - [ ] Cập nhật trạng thái lượt chơi
- [ ] Tạo function get_game_rounds
  - [ ] Lấy danh sách lượt chơi với filters

#### Frontend Components - 1.5 ngày
- [ ] Tạo GameList component
  - [ ] Hiển thị danh sách lượt chơi
  - [ ] Pagination và filters
- [ ] Tạo GameCard component
  - [ ] Hiển thị thông tin lượt chơi
  - [ ] Countdown timer
- [ ] Tạo GameFilters component
  - [ ] Bộ lọc theo trạng thái
  - [ ] Lọc theo thời gian
- [ ] Tạo GameListSkeleton component
  - [ ] Loading state cho danh sách game

#### API Routes - 0.5 ngày
- [ ] Tạo route /api/game-rounds
  - [ ] GET danh sách với filters
- [ ] Tạo route /api/game-rounds/[id]
  - [ ] GET thông tin chi tiết lượt chơi
- [ ] Tạo route /api/game-rounds/active
  - [ ] GET các lượt đang diễn ra

### 3.2 Hệ thống đặt cược (4 ngày)

#### Backend - 1.5 ngày
- [ ] Tạo function place_bet
  - [ ] Validation thông tin cược
  - [ ] Cập nhật số dư
- [ ] Tạo trigger update_balance_on_bet
  - [ ] Trừ tiền khi đặt cược
- [ ] Tạo function get_user_bets
  - [ ] Lấy danh sách cược của user

#### Frontend Components - 2 ngày
- [ ] Tạo BetForm component
  - [ ] Form chọn số và số tiền
  - [ ] Validation số tiền cược
- [ ] Tạo BetConfirmation component
  - [ ] Dialog xác nhận đặt cược
  - [ ] Hiển thị thông tin tóm tắt
- [ ] Tạo BetSuccess component
  - [ ] Thông báo đặt cược thành công
- [ ] Tạo BetList component
  - [ ] Hiển thị danh sách cược đã đặt
  - [ ] Filter theo lượt chơi

#### API Routes - 0.5 ngày
- [ ] Tạo route /api/game-rounds/[id]/bets
  - [ ] POST đặt cược mới
  - [ ] GET lấy cược của game
- [ ] Tạo route /api/game-rounds/[id]/my-bets
  - [ ] GET lấy cược của user

### 3.3 Xử lý kết quả (3 ngày)

#### Backend - 1 ngày
- [ ] Tạo function complete_game_round
  - [ ] Xử lý kết quả lượt chơi
  - [ ] Cập nhật trạng thái cược
- [ ] Tạo function distribute_rewards
  - [ ] Phân phối tiền thưởng cho người thắng
- [ ] Tạo function notify_winners
  - [ ] Tạo thông báo cho người thắng

#### Frontend Components - 1.5 ngày
- [ ] Tạo GameResult component
  - [ ] Hiển thị kết quả lượt chơi
  - [ ] Animation hiển thị số trúng
- [ ] Tạo WinnerList component
  - [ ] Hiển thị danh sách người thắng
- [ ] Tạo GameResultNotification component
  - [ ] Thông báo kết quả

#### API Routes - 0.5 ngày
- [ ] Tạo route /api/game-rounds/[id]/results
  - [ ] GET kết quả lượt chơi
- [ ] Tạo route /api/game-rounds/[id]/winners
  - [ ] GET danh sách người thắng

## 4. Quản lý tài chính (7 ngày)

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
  - [ ] Form nhập số tiền và phương thức
  - [ ] Upload bằng chứng thanh toán
- [ ] Tạo PaymentProofUpload component
  - [ ] Upload và preview ảnh
- [ ] Tạo PaymentRequestList component
  - [ ] Hiển thị lịch sử nạp tiền
  - [ ] Filter theo trạng thái
- [ ] Tạo PaymentStatus component
  - [ ] Hiển thị trạng thái yêu cầu

#### API Routes - 0.5 ngày
- [ ] Tạo route /api/payment-requests
  - [ ] POST tạo yêu cầu nạp tiền
  - [ ] GET lấy danh sách
- [ ] Tạo route /api/payment-requests/upload-proof
  - [ ] POST upload bằng chứng thanh toán

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

## 5. Hệ thống thông báo (3 ngày)

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

## 6. Hệ thống Referral (3 ngày)

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

## 7. Quản trị hệ thống (Admin) (6 ngày)

### 7.1 Dashboard Admin (2 ngày)

#### Backend - 0.5 ngày
- [ ] Tạo function get_dashboard_summary
  - [ ] Lấy thống kê tổng quan
- [ ] Tạo function get_key_metrics
  - [ ] Lấy các chỉ số quan trọng

#### Frontend Components - 1.5 ngày
- [ ] Tạo AdminLayout component
  - [ ] Layout chung cho admin
- [ ] Tạo AdminDashboard component
  - [ ] Dashboard tổng quan
- [ ] Tạo AdminStats component
  - [ ] Cards hiển thị thống kê
- [ ] Tạo AdminCharts component
  - [ ] Biểu đồ thống kê cơ bản

#### API Routes - 0.5 ngày
- [ ] Tạo route /api/admin/dashboard-summary
  - [ ] GET dữ liệu tổng quan
- [ ] Tạo route /api/admin/metrics
  - [ ] GET các chỉ số quan trọng

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

## 8. Đảm bảo chất lượng và Triển khai (5 ngày)

### 8.1 Testing cơ bản (2 ngày)
- [ ] Unit testing utils
  - [ ] Test validation helpers
  - [ ] Test formatting functions
- [ ] Testing auth flow
  - [ ] Test đăng nhập/đăng ký
- [ ] Testing betting flow
  - [ ] Test đặt cược
  - [ ] Test xử lý kết quả
- [ ] Testing payment flow
  - [ ] Test nạp/rút tiền

### 8.2 Deployment (3 ngày)
- [ ] Cấu hình Supabase Production
  - [ ] Migrate schema
  - [ ] Thiết lập RLS
- [ ] Deploy Next.js lên Vercel
  - [ ] Cấu hình build
  - [ ] Thiết lập environment variables
- [ ] Thiết lập domain
  - [ ] Cấu hình DNS
  - [ ] Thiết lập SSL
- [ ] Cấu hình logging
  - [ ] Thiết lập error tracking

## 9. Tài liệu cơ bản (2 ngày)
- [ ] Tài liệu kỹ thuật
  - [ ] Mô tả API endpoints
  - [ ] Mô tả database schema
- [ ] Hướng dẫn người dùng
  - [ ] Hướng dẫn đặt cược
  - [ ] Hướng dẫn nạp/rút tiền
- [ ] Hướng dẫn admin
  - [ ] Hướng dẫn quản lý game
  - [ ] Hướng dẫn quản lý thanh toán

## Tổng quan toàn bộ dự án

Kế hoạch chi tiết này bao gồm **40 ngày** làm việc (khoảng 2 tháng), phân chia theo các giai đoạn sau:

1. **Thiết lập nền tảng và cơ sở hạ tầng**: 5 ngày
2. **Hệ thống xác thực và quản lý người dùng**: 6 ngày
3. **Hệ thống Game và Cá cược**: 10 ngày
4. **Quản lý tài chính**: 7 ngày
5. **Hệ thống thông báo**: 3 ngày
6. **Hệ thống Referral**: 3 ngày
7. **Quản trị hệ thống (Admin)**: 6 ngày
8. **Đảm bảo chất lượng và Triển khai**: 5 ngày
9. **Tài liệu cơ bản**: 2 ngày

### Các mốc quan trọng:

1. **Milestone 1 (Tuần 2)**: Hoàn thành nền tảng và xác thực
   - Demo: Authentication system và profile management
   - Deliverables: Đăng nhập, đăng ký, quản lý profile

2. **Milestone 2 (Tuần 4)**: Hoàn thành hệ thống Game và Cá cược
   - Demo: Game system và betting functionality
   - Deliverables: Danh sách game, đặt cược, xử lý kết quả

3. **Milestone 3 (Tuần 6)**: Hoàn thành quản lý tài chính và thông báo
   - Demo: Financial transactions và notification system
   - Deliverables: Nạp/rút tiền, lịch sử giao dịch, thông báo

4. **Milestone 4 (Tuần 8)**: Hoàn thành Admin và triển khai
   - Demo: Admin functionality và platform hoàn chỉnh
   - Deliverables: Admin dashboard, quản lý hệ thống, deployment

### Lưu ý quan trọng:

1. Kế hoạch tập trung vào các tính năng thiết yếu, loại bỏ các phần phức tạp như:
   - Realtime subscriptions (thay bằng client-side polling)
   - Hệ thống VIP và phần thưởng phức tạp
   - Multiple authentication methods (chỉ dùng Email)
   - Animations phức tạp và UI/UX cao cấp

2. Các phần được ưu tiên:
   - Game cá cược core functionality
   - Hệ thống nạp/rút tiền
   - Admin dashboard quản lý cơ bản
   - Thông báo trong ứng dụng và qua Telegram
   - Hệ thống referral đơn giản

Kế hoạch này đảm bảo phát triển một nền tảng game cá cược đầy đủ chức năng cơ bản trong thời gian hợp lý, có thể mở rộng thêm tính năng trong tương lai sau khi đã có người dùng và feedback.