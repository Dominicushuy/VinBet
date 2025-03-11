# Phân chia Module theo Chức năng - VinBet Platform

## A. Module Người dùng (User)

### 1. Module Xác thực (Authentication)
- **Đăng nhập**
  - Form đăng nhập với validation
  - Xử lý lỗi đăng nhập không thành công
  - Duy trì phiên đăng nhập
- **Đăng ký**
  - Form đăng ký với validation
  - Nhập mã giới thiệu (nếu có)
  - Xác minh email
- **Quản lý mật khẩu**
  - Quên mật khẩu
  - Đặt lại mật khẩu
  - Flow gửi email xác nhận

### 2. Module Hồ sơ Người dùng (Profile)
- **Thông tin cá nhân**
  - Xem thông tin người dùng
  - Cập nhật thông tin cá nhân
  - Đổi mật khẩu
- **Quản lý tài khoản**
  - Tải lên và cập nhật avatar
  - Xem lịch sử đăng nhập
  - Xem trạng thái tài khoản
- **Thống kê cá nhân** 
  - Tỷ lệ thắng/thua
  - Tổng số tiền thắng
  - Hoạt động gần đây

### 3. Module Game và Cá cược
- **Danh sách Game**
  - Hiển thị các game có sẵn
  - Bộ lọc và tìm kiếm game
  - Game đang diễn ra và sắp diễn ra
- **Chi tiết Game**
  - Thông tin lượt chơi
  - Bảng xếp hạng
  - Lịch sử kết quả
- **Đặt cược**
  - Form đặt cược với validation
  - Xác nhận đặt cược
  - Animation thành công
- **Kết quả**
  - Xem kết quả lượt chơi
  - Hiển thị danh sách người thắng
  - Animation hiển thị kết quả

### 4. Module Tài chính
- **Nạp tiền**
  - Chọn phương thức nạp tiền
  - Nhập số tiền nạp
  - Tải lên bằng chứng thanh toán
- **Rút tiền**
  - Yêu cầu rút tiền
  - Nhập thông tin tài khoản
  - Theo dõi trạng thái yêu cầu
- **Giao dịch**
  - Lịch sử giao dịch
  - Bộ lọc theo loại giao dịch
  - Xuất báo cáo giao dịch
- **Báo cáo tài chính**
  - Biểu đồ tổng quan
  - Thống kê theo thời gian
  - Tóm tắt tài chính

### 5. Module Thông báo
- **Thông báo trong ứng dụng**
  - Hiển thị danh sách thông báo
  - Đánh dấu đã đọc
  - Xóa thông báo
- **Cài đặt thông báo**
  - Tùy chỉnh loại thông báo
  - Bật/tắt thông báo
- **Tích hợp Telegram**
  - Kết nối tài khoản Telegram
  - Cài đặt thông báo qua Telegram

### 6. Module Giới thiệu (Referral)
- **Mã giới thiệu**
  - Xem và tạo mã giới thiệu
  - Sao chép và chia sẻ mã
- **Người được giới thiệu**
  - Danh sách người đã giới thiệu
  - Trạng thái và thông tin
- **Thống kê giới thiệu**
  - Số lượng giới thiệu thành công
  - Hoa hồng đã nhận
  - Biểu đồ hoạt động giới thiệu

## B. Module Quản trị (Admin)

### 1. Module Tổng quan (Dashboard)
- **Thống kê chính**
  - Tổng số người dùng
  - Tổng số tiền giao dịch
  - Doanh thu của nền tảng
- **Biểu đồ thống kê**
  - Người dùng mới theo thời gian
  - Doanh thu theo thời gian
  - Tỷ lệ thắng/thua
- **Hoạt động gần đây**
  - Các game đang diễn ra
  - Giao dịch gần đây
  - Đăng ký mới

### 2. Module Quản lý Người dùng
- **Danh sách người dùng**
  - Xem tất cả người dùng
  - Tìm kiếm và lọc người dùng
  - Xem thông tin tóm tắt
- **Chi tiết người dùng**
  - Thông tin cá nhân
  - Lịch sử giao dịch
  - Lịch sử cược
- **Hành động**
  - Chỉnh sửa thông tin người dùng
  - Khóa/mở khóa tài khoản
  - Điều chỉnh số dư

### 3. Module Quản lý Game
- **Danh sách game**
  - Xem tất cả game
  - Lọc theo trạng thái
  - Các game đang diễn ra
- **Chi tiết game**
  - Thông tin lượt chơi
  - Danh sách cược
  - Kết quả và người thắng
- **Quản lý lượt chơi**
  - Tạo lượt chơi mới
  - Cập nhật trạng thái
  - Nhập kết quả
  - Phân phối tiền thưởng

### 4. Module Quản lý Thanh toán
- **Yêu cầu nạp tiền**
  - Danh sách yêu cầu nạp tiền
  - Xem bằng chứng thanh toán
  - Duyệt/từ chối yêu cầu
- **Yêu cầu rút tiền**
  - Danh sách yêu cầu rút tiền
  - Xem thông tin tài khoản
  - Duyệt/từ chối yêu cầu
- **Quản lý giao dịch**
  - Xem tất cả giao dịch
  - Xuất báo cáo
  - Thống kê theo thời gian

### 5. Module Quản lý Thông báo
- **Gửi thông báo**
  - Gửi thông báo cho người dùng cụ thể
  - Gửi thông báo hàng loạt
  - Lên lịch thông báo
- **Quản lý thông báo**
  - Xem thông báo đã gửi
  - Chỉnh sửa/xóa thông báo

## C. Module Hệ thống chung

### 1. Module Bảo mật & Xác thực
- **Middleware Authentication**
  - Kiểm tra phiên đăng nhập
  - Bảo vệ các route cần xác thực
  - Phân quyền user/admin
- **Supabase RLS Policies**
  - Policies cho các bảng dữ liệu
  - Kiểm soát quyền truy cập dữ liệu

### 2. Module API Endpoints
- **User APIs**
  - Endpoints cho các chức năng người dùng
  - Validation dữ liệu đầu vào
- **Admin APIs**
  - Endpoints cho các chức năng quản trị
  - Xác thực quyền admin

### 3. Module Giao diện chung (UI)
- **Layout components**
  - Main layout
  - Admin layout
  - Auth layout
- **UI Components**
  - Shadcn UI components
  - Custom components

### 4. Module Quản lý trạng thái
- **React Query**
  - Quản lý cache API
  - Invalidation queries
- **Authentication State**
  - Quản lý trạng thái đăng nhập
  - Session và token

Mỗi module được thiết kế để độc lập nhưng vẫn có thể tương tác với nhau. Cấu trúc này giúp việc manual testing và code review trở nên có hệ thống, dễ theo dõi, và bạn có thể kiểm tra từng chức năng một cách độc lập.