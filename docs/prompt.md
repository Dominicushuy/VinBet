Theo file `plan.md`, hãy giúp tôi tiếp tục phát triển dự án, hãy bắt đầu với các công việc sau:

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

\*Lưu ý:

- Kết quả trả về chỉ bao gồm những mục tôi liệt kê ở trên, tôi sẽ hỏi bạn thêm sau đó.
- Kiểm tra các files code trong Github. Những phần nào hiện đã phát triển nếu cần thì có thể cập nhật thêm. Nếu đã hoàn thiện thì bỏ qua, nếu thiếu thì tạo thêm và liên kết vào các Page, Layout có sẵn.
- Đặc biệt hãy kiểm tra tất cả các functions, triggers đã tồn tại trong file `trigger_functions.sql`​ trước xem đã tồn tại chưa, nếu chưa thì hãy tạo mới, nếu có rồi thì giữ nguyên tên và cập nhật logic (nếu cần).
