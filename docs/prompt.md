Theo file `plan.md`, hãy giúp tôi tiếp tục phát triển dự án, hãy bắt đầu với các công việc sau:

## 1. Thiết lập nền tảng và cơ sở hạ tầng (5 ngày)

### 1.1 Thiết lập dự án và môi trường phát triển (3 ngày)

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

*Lưu ý:
- Kiểm tra các files code trong Github. Những phần nào hiện đã phát triển nếu cần thì có thể cập nhật thêm. Nếu đã hoàn thiện thì bỏ qua, nếu thiếu thì tạo thêm và liên kết vào các Page, Layout có sẵn.
- Kết quả trả về chỉ bao gồm những mục tôi liệt kê ở trên, tôi sẽ hỏi bạn thêm sau đó.
- Đặc biệt hãy kiểm tra tất cả các functions, triggers đã tồn tại trong files file `trigger_functions.sql`​ trước xem đã tồn tại chưa, nếu chưa thì hãy tạo mới, nếu có rồi thì giữ nguyên tên và cập nhật logic (nếu cần).
- Đặc biệt kiểm tra tổng thể cấu trúc dự án đã tồn tại được mô tả trong file `core.md`, `components.md`, `app.md` để hiểu hơn về tổng thể của dự án
