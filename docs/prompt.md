Theo file `plan.md`, hãy giúp tôi tiếp tục phát triển dự án, hãy bắt đầu với các công việc sau:

## 3. Phát triển hệ thống Game và Cá cược

### 3.3 Xử lý kết quả và thông báo (4 ngày)

#### Backend
- [ ] Phát triển function complete_game_round xử lý hoàn thành game
- [ ] Tạo function phân phối tiền thưởng cho người thắng
- [ ] Thiết lập triggers cập nhật user_statistics khi game kết thúc
- [ ] Cấu hình notifications khi có kết quả

#### Frontend Components
- [ ] Xây dựng GameResult component (hiển thị kết quả lượt chơi)
- [ ] Tạo WinnerAnimation component (hiệu ứng khi thắng)
- [ ] Phát triển GameResultDetails component (chi tiết kết quả)
- [ ] Xây dựng GameResultNotification component (thông báo kết quả)

#### API Routes
- [ ] Tạo API route `/api/game-rounds/[id]/complete` (hoàn thành lượt chơi - admin)
- [ ] Tạo API route `/api/game-rounds/[id]/results` (lấy kết quả)
- [ ] Tạo API route `/api/game-rounds/[id]/winners` (danh sách người thắng)

#### Services & Hooks
- [ ] Phát triển GameResultService (getResults, getWinners)
- [ ] Xây dựng hook useGameResults để quản lý kết quả game
- [ ] Tạo hook useWinCheck để kiểm tra người dùng có thắng không
- [ ] Phát triển hook useConfetti cho hiệu ứng animation khi thắng

*Lưu ý:
- File `code.txt` tôi cung cấp đây bao gồm những phần code có liên quan tôi đang xây dựng từ trước. Những phần nào hiện đã phát triển nếu cần thì có thể cập nhật thêm. Nếu đã hoàn thiện thì bỏ qua, nếu thiếu thì tạo thêm và liên kết vào các Page, Layout có sẵn.
- Kết quả trả về chỉ bao gồm những mục tôi liệt kê ở trên, tôi sẽ hỏi bạn thêm sau đó.
- Đặc biệt hãy kiểm tra tất cả các functions, triggers đã tồn tại trong files file `trigger_functions.sql`​ trước xem đã tồn tại chưa, nếu chưa thì hãy tạo mới, nếu có rồi thì giữ nguyên tên và cập nhật logic (nếu cần).
- Đặc biệt kiểm tra tổng thể cấu trúc dự án đã tồn tại được mô tả trong file `core.md`, `components.md`, `app.md` để hiểu hơn về tổng thể của dự án
