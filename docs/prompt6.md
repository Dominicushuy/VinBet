Tôi đang phát triển dự án VinBet - nền tảng game cá cược sử dụng Next.js và Supabase, với 90% code tạo bởi AI. Tôi đã cung cấp cho bạn toàn bộ code của trang chủ Admin (`src/app/(admin)/admin/dashboard/page.jsx`, `src/app/(admin)/layout.jsx`) trong Github. Hãy giúp tôi review kỹ lưỡng và tự động chỉnh sửa code để đảm bảo chất lượng tối ưu.

1. **Phân tích tổng quan module**:

   - Liệt kê các components/API routes và mối quan hệ giữa chúng
   - Phân tích luồng hoạt động của module
   - Đánh giá sơ bộ về chất lượng code của module

2. **Tìm và sửa lỗi tự động**:

   - Phát hiện lỗi logic, validation, null/undefined
   - Phát hiện lỗi bảo mật (XSS, CSRF, SQL Injection)
   - Tự động chỉnh sửa các lỗi tìm được bằng cách cung cấp code đã được sửa

3. **Kiểm tra và tối ưu hiệu suất**:

   - Phát hiện code dư thừa, lặp lại
   - Tối ưu queries và API calls
   - Tối ưu logic xử lý và re-renders không cần thiết
   - Tất cả UI Components đều phải đáp ứng được Responsive trên màn hình điện thoại, iPad

4. **Đánh giá về SOLID & DRY**:

   - Kiểm tra tuân thủ nguyên tắc SOLID và DRY
   - Tự động chỉnh sửa hoặc đề xuất cải tiến
   - Phát hiện các components quá phức tạp cần tách nhỏ

5. **Tự động cải tiến code**:

   - Cung cấp phiên bản code được cải tiến
   - Gợi ý pattern phù hợp hơn cho module
   - Bổ sung chức năng thiếu hoặc chưa hoàn thiện

6. **Kiểm tra đặc biệt các file Supabase**:
   - Chỉ kiểm tra những phần có liên quan, còn không thì bỏ qua.
   - Kiểm tra kỹ `schema.sql` để đảm bảo thiết kế database hợp lý
   - Kiểm tra `trigger_functions.sql` - đặc biệt chú ý đến việc dư thừa hoặc sai logic so với API routes
   - Kiểm tra `policies.sql` để đảm bảo bảo mật và quyền truy cập dữ liệu phù hợp
   - Nếu phát hiện vấn đề trong `trigger_functions.sql` và conflict với API routes, hãy sửa lại cả hai để đồng bộ
   - Nếu các file SQL đã hoàn thiện và không có vấn đề, hãy ghi chú và bỏ qua

## Hướng dẫn đặc biệt

- Nếu phát hiện thấy code đã hoàn thiện, chất lượng tốt, hãy đánh giá và ghi chú "Code đã hoàn thiện" mà không cần chỉnh sửa.
- Tập trung vào những vấn đề nghiêm trọng, ưu tiên theo mức độ ảnh hưởng đến hiệu suất và bảo mật.
- Cung cấp đánh giá tổng thể về module theo thang điểm 1-10 về tính hoàn thiện, hiệu suất, bảo mật và khả năng mở rộng.
- Đặc biệt chú ý đến sự đồng bộ giữa business logic trong API routes và trigger functions ở Supabase - đây là nơi dễ xảy ra mâu thuẫn.

## Định dạng phản hồi

Hãy trả lời với format sau:
1. Vấn đề và giải pháp: Liệt kê vấn đề theo mức độ nghiêm trọng kèm code đã sửa
2. Đề xuất phiên bản cải tiến nếu cần.

Trả lời bằng tiếng Việt và cung cấp code cụ thể đã được chỉnh sửa hoặc cải tiến.
