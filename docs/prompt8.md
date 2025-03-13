## Important Documents and Files
- **schema.txt**: SQL queries for creating Database Schema in Supabase
- **policies.txt**: SQL queries for creating RLS policies for all databases in Supabase
- **trigger_function.txt**: SQL queries for creating Functions and Triggers on the Supabase database
- **code.txt**: Toàn bộ source code NextJS

Tôi dự định sẽ làm thêm tính năng gửi thông báo thông qua Telegram cho người dùng đã kết nối. Liệt kê những trường hợp quan trọng cần gửi thông báo cho người dùng trên Telegram:

===========================
# Gửi thông báo qua Telegram cho người dùng VinBet:

# Các trường hợp quan trọng cần gửi thông báo cho người dùng qua Telegram

Dựa trên phân tích mã nguồn và cấu trúc dữ liệu của VinBet, dưới đây là các trường hợp quan trọng cần triển khai gửi thông báo qua Telegram cho người dùng đã kết nối:

## 1. Liên quan đến tài khoản

- **Đăng nhập từ thiết bị lạ/vị trí mới**: Thông báo khi phát hiện đăng nhập từ thiết bị hoặc địa điểm mới để tăng cường bảo mật
- **Thay đổi mật khẩu**: Khi người dùng hoặc admin reset mật khẩu
- **Cập nhật thông tin tài khoản**: Khi thông tin cá nhân quan trọng được thay đổi (email, số điện thoại)
- **Trạng thái tài khoản**: Khi tài khoản bị khóa/mở khóa

## 2. Giao dịch tài chính

- **Nạp tiền thành công**: Thông báo xác nhận khi yêu cầu nạp tiền được phê duyệt
- **Rút tiền thành công**: Xác nhận khi rút tiền thành công với chi tiết về phương thức và số tiền
- **Từ chối giao dịch**: Thông báo khi yêu cầu nạp/rút tiền bị từ chối kèm lý do
- **Thay đổi số dư bất thường**: Khi admin điều chỉnh số dư tài khoản
- **Tiền thưởng giới thiệu**: Khi người dùng nhận được thưởng từ chương trình giới thiệu

## 3. Game và cá cược

- **Thắng cược lớn**: Thông báo khi người dùng thắng số tiền lớn (vượt ngưỡng cài đặt)
- **Kết quả trò chơi**: Thông báo kết quả các vòng chơi khi kết thúc
- **Thông báo jackpot**: Cập nhật khi jackpot đạt mức cao hoặc sắp được trao
- **Game mới/sự kiện đặc biệt**: Thông báo khi có sự kiện đặc biệt hoặc trò chơi mới

## 4. Thông báo hệ thống

- **Bảo trì hệ thống**: Thông báo trước khi hệ thống bảo trì và khi hoàn tất
- **Cập nhật tính năng**: Thông báo khi có tính năng mới hoặc cập nhật quan trọng
- **Khuyến mãi/ưu đãi**: Thông báo về các chương trình khuyến mãi, ưu đãi đặc biệt
- **Cảnh báo bảo mật**: Thông báo khi phát hiện vấn đề bảo mật hoặc hoạt động đáng ngờ

## 5. Hỗ trợ và tương tác

- **Phản hồi hỗ trợ**: Thông báo khi có phản hồi từ đội ngũ hỗ trợ
- **Tin nhắn từ admin**: Thông báo khi có tin nhắn mới từ admin
- **Thay đổi điều khoản**: Thông báo khi có thay đổi về điều khoản dịch vụ hoặc chính sách

## Triển khai kỹ thuật

Để triển khai tính năng này, bạn cần:

1. **Sửa đổi các trigger function** để kiểm tra cài đặt thông báo của người dùng và gửi thông báo Telegram nếu được bật
2. **Tạo function mới** để gửi thông báo qua Telegram bằng cách sử dụng telegram_id từ bảng profiles
3. **Thêm bảng telegram_notifications** để lưu trữ lịch sử thông báo đã gửi qua Telegram
4. **Cập nhật API** để cho phép người dùng tùy chỉnh chi tiết hơn về loại thông báo họ muốn nhận qua Telegram

Hệ thống đã có cơ sở hạ tầng cần thiết (telegram_id trong profiles, cài đặt notification_settings, utils gửi tin nhắn Telegram) để triển khai tính năng này một cách hiệu quả.

# Kế hoạch triển khai tính năng thông báo Telegram