Theo file `plan.md`, hãy giúp tôi tiếp tục phát triển dự án, hãy bắt đầu với các công việc sau:

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

*Lưu ý:
- Kết quả trả về chỉ bao gồm những mục tôi liệt kê ở trên, tôi sẽ hỏi bạn thêm sau đó.
- Kiểm tra các files code trong Github. Những phần nào hiện đã phát triển nếu cần thì có thể cập nhật thêm. Nếu đã hoàn thiện thì bỏ qua, nếu thiếu thì tạo thêm và liên kết vào các Page, Layout có sẵn.
- Đặc biệt hãy kiểm tra tất cả các functions, triggers đã tồn tại trong file `trigger_functions.sql`​ trước xem đã tồn tại chưa, nếu chưa thì hãy tạo mới, nếu có rồi thì giữ nguyên tên và cập nhật logic (nếu cần).
