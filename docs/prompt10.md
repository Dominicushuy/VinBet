# Lộ trình tối thiểu triển khai thông báo Telegram cho Demo

Dưới đây là lộ trình ngắn gọn với các bước quan trọng nhất để bạn có thể nhanh chóng demo tính năng thông báo Telegram với khách hàng:

## Bước 1: Tạo Telegram Bot và thiết lập cơ bản

**Prompt chi tiết:**
```
Tôi cần hướng dẫn chính xác và chi tiết để:

1. Tạo Telegram Bot thông qua BotFather:
   - Các lệnh cụ thể để gửi cho BotFather
   - Cách lấy và lưu API Token
   - Cài đặt lệnh cơ bản (/start, /help, /verify_XXX)

2. Thiết lập các phản hồi tự động khi người dùng tương tác với bot:
   - Code chính xác cho hàm xử lý lệnh /start
   - Code chính xác cho hàm xử lý lệnh /verify_{code}
   - Một số mẫu tin nhắn thông báo (nạp tiền, thắng cược, đăng nhập)

Đảm bảo code dễ hiểu, có đầy đủ phần xử lý lỗi và giải thích để tôi có thể nhanh chóng triển khai.
```

## Bước 2: Cập nhật Database Schema trong Supabase

**Prompt chi tiết:**
```
Tôi cần SQL code chính xác để nhanh chóng cập nhật Supabase cho tính năng thông báo Telegram:

1. SQL để thêm các trường cần thiết vào bảng profiles:
   - telegram_id (TEXT)
   - telegram_username (TEXT)
   - telegram_connected_at (TIMESTAMPTZ)
   - telegram_settings (JSONB với cấu trúc mặc định)
   - telegram_verification_code (TEXT)

2. SQL để tạo function gửi thông báo Telegram (đơn giản nhất):
   - Function create_telegram_notification(user_id, message, metadata)
   - Sử dụng pg_net extension để gọi Telegram API
   - Xử lý các case cơ bản (user không có telegram_id, lỗi khi gọi API)

3. SQL để bật RLS cho các trường telegram trong profiles:
   - Policy cho phép user đọc/cập nhật trường của chính họ
   - Policy cho admin đọc/cập nhật tất cả

Đảm bảo code SQL đúng cú pháp PostgreSQL, có comments và có thể copy-paste trực tiếp vào Supabase SQL Editor.
```

## Bước 3: Xây dựng API Routes trong NextJS (phần quan trọng nhất)

**Prompt chi tiết:**
```
Tôi cần code đầy đủ cho 2 API routes quan trọng nhất để demo tính năng thông báo Telegram:

1. File `/app/api/telegram/connect/route.ts` - Tạo mã xác thực và liên kết Telegram:
   - Tạo mã xác thực ngẫu nhiên
   - Lưu vào database (telegram_verification_code)
   - Trả về deeplink để mở Telegram Bot

2. File `/app/api/telegram/webhook/route.ts` - Webhook nhận thông báo từ Telegram:
   - Xác minh request đến từ Telegram
   - Xử lý lệnh /verify_{code} từ người dùng
   - Cập nhật telegram_id trong profiles
   - Gửi xác nhận kết nối thành công

3. File `/app/api/telegram/send-test/route.ts` - Để demo gửi thông báo test:
   - Lấy telegram_id của user đăng nhập
   - Gửi thông báo test thông qua Telegram API
   - Trả về kết quả gửi

Đảm bảo code đầy đủ, chính xác, có xử lý lỗi và dễ dàng tích hợp vào dự án hiện tại.
```

## Bước 4: Tạo UI tối thiểu để demo

**Prompt chi tiết:**
```
Tôi cần code React đầy đủ để tạo UI đơn giản nhất phục vụ demo tính năng thông báo Telegram:

1. Component `TelegramConnect.tsx` - Kết nối với Telegram:
   - Nút "Kết nối Telegram" gọi API /api/telegram/connect
   - Hiển thị mã QR và deeplink sau khi gọi API
   - Hiển thị hướng dẫn kết nối
   - Hiển thị trạng thái đã kết nối khi thành công

2. Component `TelegramTest.tsx` - Gửi thông báo test:
   - Nút "Gửi thông báo test" chỉ hiển thị khi đã kết nối
   - Gọi API /api/telegram/send-test
   - Hiển thị kết quả gửi (thành công/thất bại)

3. Tích hợp vào trang cài đặt:
   - Code đơn giản để thêm tab "Telegram" vào trang cài đặt hiện tại
   - Sử dụng shadcn/ui và tailwind

Đảm bảo code có thể copy-paste và chạy ngay, bao gồm cả các hooks và states cần thiết.
```

## Bước 5: Tạo trigger function demo (để thể hiện với khách hàng)

**Prompt chi tiết:**
```
Tôi cần một SQL trigger function đơn giản để demo việc gửi thông báo tự động khi có sự kiện trong hệ thống:

1. Trigger function cho bảng payment_requests:
   - Kích hoạt khi status thay đổi thành 'approved'
   - Tạo thông báo Telegram với nội dung thông báo nạp/rút tiền thành công
   - Định dạng tin nhắn đẹp với số tiền, thời gian, ID giao dịch

2. SQL để gắn trigger vào bảng payment_requests

3. Test SQL để thử nghiệm trigger:
   - Mẫu SQL update một payment_request để kích hoạt trigger
   - Cách kiểm tra xem thông báo đã được gửi chưa

Đảm bảo code đầy đủ, có comments và có thể chạy ngay trên Supabase SQL Editor.
```

---

## Lịch trình triển khai cho demo

1. **Ngày 1 (2-3 giờ):**
   - Tạo Telegram Bot và cấu hình cơ bản
   - Cập nhật database schema Supabase

2. **Ngày 2 (3-4 giờ):**
   - Tạo API routes trong NextJS
   - Xây dựng UI tối thiểu để demo
   - Kiểm tra luồng kết nối và xác thực

3. **Ngày 3 (2-3 giờ):**
   - Tạo trigger function demo
   - Kiểm tra toàn bộ hệ thống
   - Chuẩn bị kịch bản demo

Với 3 ngày làm việc tập trung, bạn có thể có một bản demo hoạt động của tính năng thông báo Telegram để trình bày với khách hàng.