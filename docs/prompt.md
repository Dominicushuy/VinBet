Theo file `plan.md`, hãy giúp tôi tiếp tục phát triển dự án, hãy bắt đầu với các công việc sau:

## 3. Hệ thống Game và Cá cược (10 ngày)

### 3.1 Quản lý lượt chơi (3 ngày)

#### Backend - 1 ngày

- [ ] Tạo function create_game_round
  - [ ] Thiết lập thông tin lượt chơi
- [ ] Tạo function update_game_round_status
  - [ ] Cập nhật trạng thái lượt chơi
- [ ] Tạo function get_game_rounds
  - [ ] Lấy danh sách lượt chơi với filters

#### Frontend Components - 1.5 ngày

- [ ] Tạo GameList component
  - [ ] Hiển thị danh sách lượt chơi
  - [ ] Pagination và filters
- [ ] Tạo GameCard component
  - [ ] Hiển thị thông tin lượt chơi
  - [ ] Countdown timer
- [ ] Tạo GameFilters component
  - [ ] Bộ lọc theo trạng thái
  - [ ] Lọc theo thời gian
- [ ] Tạo GameListSkeleton component
  - [ ] Loading state cho danh sách game

#### API Routes - 0.5 ngày

- [ ] Tạo route /api/game-rounds
  - [ ] GET danh sách với filters
- [ ] Tạo route /api/game-rounds/[id]
  - [ ] GET thông tin chi tiết lượt chơi
- [ ] Tạo route /api/game-rounds/active
  - [ ] GET các lượt đang diễn ra

\*Lưu ý:

- Kết quả trả về chỉ bao gồm những mục tôi liệt kê ở trên, tôi sẽ hỏi bạn thêm sau đó.
- Kiểm tra các files code trong Github. Những phần nào hiện đã phát triển nếu cần thì có thể cập nhật thêm. Nếu đã hoàn thiện thì bỏ qua, nếu thiếu thì tạo thêm và liên kết vào các Page, Layout có sẵn.
- Đặc biệt hãy kiểm tra tất cả các functions, triggers đã tồn tại trong file `trigger_functions.sql`​ trước xem đã tồn tại chưa, nếu chưa thì hãy tạo mới, nếu có rồi thì giữ nguyên tên và cập nhật logic (nếu cần).
