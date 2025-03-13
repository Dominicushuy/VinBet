Tôi đang phát triển dự án VinBet - nền tảng game cá cược sử dụng Next.js và Supabase, với 90% code tạo bởi AI. Tôi đã cung cấp cho bạn toàn bộ code của trang **Danh sách game người dùng** (`src/app/(main)/games/page.jsx`) trong Github. Hãy giúp tôi review kỹ lưỡng và tự động chỉnh sửa code để đảm bảo chất lượng tối ưu.

1. **Phân tích tổng quan module**:

   - Liệt kê các components/API routes và mối quan hệ giữa chúng
   - Phân tích luồng hoạt động của module
   - Đánh giá sơ bộ về chất lượng code của module

2. **Tìm và sửa lỗi tự động**:

   - Phát hiện lỗi logic, validation, null/undefined
   - Tự động chỉnh sửa các lỗi tìm được bằng cách cung cấp code đã được sửa

3. **Kiểm tra và tối ưu hiệu suất**:

   - Phát hiện code dư thừa, lặp lại, sử dụng hooks, utils đã được build trước đó (nếu phù hợp)
   - Tối ưu queries và API calls
   - Tối ưu logic xử lý và re-renders không cần thiết
   - Tất cả UI Components đều phải đáp ứng được Responsive trên màn hình điện thoại, iPad

4. **Kiểm tra đặc biệt các file Supabase**:

   - Chỉ kiểm tra những phần có liên quan, còn không thì bỏ qua.
   - Kiểm tra kỹ `schema.sql` để đảm bảo thiết kế database hợp lý
   - Kiểm tra `trigger_functions.sql` - đặc biệt chú ý đến việc dư thừa hoặc sai logic so với API routes
   - Kiểm tra `policies.sql` để đảm bảo bảo mật và quyền truy cập dữ liệu phù hợp
   - Nếu phát hiện vấn đề trong `trigger_functions.sql` và conflict với API routes, hãy sửa lại cả hai để đồng bộ
   - Nếu các file SQL đã hoàn thiện và không có vấn đề, hãy ghi chú và bỏ qua

5. **Đánh giá về SOLID & DRY**:

   - Kiểm tra tuân thủ nguyên tắc SOLID và DRY
   - Tự động chỉnh sửa hoặc đề xuất cải tiến
   - Phát hiện các components quá phức tạp cần tách nhỏ

6. **Tự động cải tiến code**:
   - Cung cấp phiên bản code được cải tiến
   - Gợi ý pattern phù hợp hơn cho module
   - Bổ sung chức năng thiếu hoặc chưa hoàn thiện

## Hướng dẫn đặc biệt

- Nếu phát hiện thấy code đã hoàn thiện, chất lượng tốt, hãy bỏ qua mà không cần chỉnh sửa.
- Tập trung vào những vấn đề nghiêm trọng, ưu tiên theo mức độ ảnh hưởng đến hiệu suất và bảo mật.
- Đặc biệt chú ý đến sự đồng bộ giữa business logic trong API routes và trigger functions ở Supabase - đây là nơi dễ xảy ra mâu thuẫn.

## Định dạng phản hồi

Hãy trả lời với format sau:

1. Vấn đề và giải pháp: Liệt kê vấn đề theo mức độ nghiêm trọng kèm code đã sửa
2. Đề xuất phiên bản cải tiến nếu cần (chỉ hiển thị phần cần cải tiến, tôi sẽ hỏi bạn chi tiết sau đó).
