Theo file `plan.md`, hãy giúp tôi tiếp tục phát triển dự án, hãy bắt đầu với các công việc sau:

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
  - [ ] GET các lượt đang diễn ra

\*Lưu ý:

- Kết quả trả về chỉ bao gồm những mục tôi liệt kê ở trên, tôi sẽ hỏi bạn thêm sau đó.
- Kiểm tra các files code trong Github. Những phần nào hiện đã phát triển nếu cần thì có thể cập nhật thêm. Nếu đã hoàn thiện thì bỏ qua, nếu thiếu thì tạo thêm và liên kết vào các Page, Layout có sẵn.
- Đặc biệt hãy kiểm tra tất cả các functions, triggers đã tồn tại trong file `trigger_functions.sql`​ trước xem đã tồn tại chưa, nếu chưa thì hãy tạo mới, nếu có rồi thì giữ nguyên tên và cập nhật logic (nếu cần).
