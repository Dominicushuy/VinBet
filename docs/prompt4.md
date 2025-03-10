Tôi đã hoàn thành các tính năng chính của dự án,  tôi muốn nâng cấp nó bằng cách chỉnh sửa các UI,UX một cách đẹp hơn bắt mắt người dùng hơn. Tôi sẽ cung cấp cho bạn plan và cấu trúc thư mục dự án của tôi. Bạn hãy gợi ý prompt chuẩn để tôi có thể dùng nó cho Chat Bot của tôi để làm việc đó tốt nhất có thể:

Dự án có khá nhiều tính năng và mỗi tính năng Chat Bot sẽ tạo ra kết quả rất nhiều kết quả code TSX,...
Hãy chia nhỏ từng phần riêng biệt và cấu trúc prompt để tôi có thể làm theo nhiều công đoạn
(Đưa file `plan.md` và cấu trúc thư mục dự án vào)

# Prompt Framework cho Cải thiện UI/UX theo từng Phần của Vinbet

Tôi hiểu dự án của bạn có nhiều tính năng và việc cải thiện tất cả cùng lúc sẽ tạo ra quá nhiều code khó quản lý. Dưới đây là kế hoạch chia nhỏ việc cải thiện UI/UX thành các prompt riêng biệt theo từng phần, giúp bạn thực hiện từng bước có kiểm soát:

## 1. Prompt Thiết lập Theme & Design System

```
Tôi đang phát triển nền tảng cá cược Vinbet sử dụng Next.js, TypeScript, Tailwind CSS và shadcn/ui. Tôi cần thiết lập design system làm nền tảng cho toàn bộ dự án.

Hãy giúp tôi:
1. Xây dựng color palette chuyên nghiệp cho nền tảng cá cược (primary, secondary, accent, warning, success, error)
2. Đề xuất typography system (font, size, weight cho headings và body text)
3. Thiết kế card, button và input styles nhất quán
4. Tạo các class utilities chung

Cung cấp:
- Color palette dưới dạng biến Tailwind (trong tailwind.config.js)
- Các class utility Tailwind tái sử dụng
- Mẫu CSS global nếu cần
- Ví dụ về các component shadcn/ui đã tùy chỉnh theo theme mới

Phong cách mong muốn: hiện đại, chuyên nghiệp, tạo cảm giác đáng tin cậy và sang trọng phù hợp với nền tảng cá cược.
```

## 2. Prompt Cải thiện Navigation & Layout

```
Dựa trên design system đã thiết lập cho Vinbet, tôi cần cải thiện navigation và layout chính của ứng dụng.

Hãy thiết kế:
1. Header/Navbar chuyên nghiệp với:
   - Logo
   - Menu chính (trang chủ, trò chơi, tài chính, giới thiệu)
   - User dropdown (avatar, thông báo, số dư)
   - Responsive behavior

2. Sidebar cho phần (main):
   - Các mục chính và submenu
   - Collapsed state cho mobile
   - Cách hiển thị số dư và thông tin người dùng

3. Footer hiện đại:
   - Links chính
   - Thông tin liên hệ
   - Chứng nhận & Badges

Cung cấp code TSX đầy đủ cho các components với Tailwind CSS, có responsive và các trạng thái (active, hover).
```

## 3. Prompt Cải thiện Trang Chủ (Homepage)

```
Tôi cần thiết kế lại trang chủ của Vinbet để tạo ấn tượng mạnh và trải nghiệm hấp dẫn.

Hãy thiết kế:
1. Hero section hấp dẫn:
   - Banner chính với CTA rõ ràng
   - Hiển thị promotion/welcome bonus

2. Game showcase:
   - Grid hiển thị các trò chơi nổi bật
   - Filters và category navigation
   - Card design cho game items

3. Stats & Social proof:
   - Hiển thị số liệu (người chơi, giải thưởng lớn)
   - Testimonials hoặc winners gần đây

4. Quick actions:
   - Shortcuts để deposit/withdrawal
   - Truy cập nhanh đến features chính

Cung cấp code TSX đầy đủ với Tailwind CSS. Tập trung vào trải nghiệm visual hấp dẫn, dễ điều hướng và tối ưu tỷ lệ chuyển đổi (đăng ký, deposit).
```

## 4. Prompt Cải thiện Game Interface

```
Tôi cần nâng cấp UI/UX cho phần trò chơi của Vinbet, bao gồm danh sách trò chơi và trang chi tiết trò chơi.

Hãy thiết kế:
1. Game listing page:
   - Bố cục grid/list view với chuyển đổi
   - Filters nâng cao (loại game, tìm kiếm)
   - Game cards với animation tinh tế
   - Skeleton loading states
   - Pagination hoặc infinite scroll

2. Game detail page:
   - Game header với thông tin chính
   - Betting interface trực quan
   - Game stats và lịch sử
   - Related games
   - Mobile-friendly controls

3. BetForm component:
   - Input số tiền với validation
   - Xem trước kết quả tiềm năng
   - Confirmation flow
   - Success/error states

Cung cấp code TSX đầy đủ với Tailwind và components từ shadcn/ui, đảm bảo UX mượt mà và hấp dẫn người dùng tham gia.
```

## 5. Prompt Cải thiện Finance Interface

```
Tôi cần nâng cấp UI/UX cho phần tài chính của Vinbet, bao gồm nạp tiền, rút tiền và lịch sử giao dịch.

Hãy thiết kế:
1. Finance dashboard:
   - Hiển thị số dư
   - Stats và charts tổng quan
   - Quick actions (deposit, withdraw)

2. Deposit interface:
   - Form với các phương thức thanh toán
   - Step-by-step flow
   - QR code/payment details
   - Upload proof component

3. Withdrawal interface:
   - Form với validation
   - Method selection
   - Status tracking
   - Confirmation steps

4. Transaction history:
   - Bảng/list với filtering
   - Visual indicators cho trạng thái
   - Chi tiết giao dịch
   - Export options

Cung cấp code TSX đầy đủ với Tailwind và shadcn/ui components, tập trung vào tính minh bạch, dễ sử dụng và tạo sự tin tưởng cho người dùng.
```

## 6. Prompt Cải thiện Authentication UI

```
Tôi cần cải thiện UI/UX cho phần xác thực của Vinbet, bao gồm đăng nhập, đăng ký và quên mật khẩu.

Hãy thiết kế:
1. Login form hiện đại:
   - Input fields với validation
   - Social login options
   - Remember me và "forgot password" link
   - Error handling trực quan

2. Registration form:
   - Multi-step form nếu có nhiều fields
   - Referral code integration
   - Terms and conditions checkbox
   - Password strength indicator

3. Forgot/Reset password flow:
   - Email/Phone input
   - Verification step
   - New password creation
   - Success confirmation

Cung cấp code TSX đầy đủ với Tailwind và shadcn/ui, tập trung vào UX mượt mà, responsive và giảm thiểu friction trong quá trình đăng ký/đăng nhập.
```

## 7. Prompt Cải thiện Profile & User Settings

```
Tôi cần nâng cấp UI/UX cho phần hồ sơ người dùng và cài đặt trong Vinbet.

Hãy thiết kế:
1. Profile dashboard:
   - Avatar và thông tin cá nhân
   - Stats và thành tích người dùng
   - Account verification status

2. Edit profile interface:
   - Form với inline validation
   - Avatar upload/cropping
   - Field grouping hợp lý

3. Security settings:
   - Password change
   - Two-factor authentication
   - Login history/devices

4. Notification preferences:
   - Toggle controls cho các loại thông báo
   - Telegram integration UI
   - Email/SMS preferences

Cung cấp code TSX đầy đủ với Tailwind và shadcn/ui components, tập trung vào organization hợp lý, dễ sử dụng và bảo mật trực quan.
```

## 8. Prompt Cải thiện Notification System

```
Tôi cần nâng cấp UI/UX cho hệ thống thông báo của Vinbet.

Hãy thiết kế:
1. Notification dropdown trong header:
   - Badge hiển thị số lượng unread
   - List các thông báo với visual hierarchy
   - Read/unread states
   - Quick actions

2. Notification center page:
   - Categorized tabs (System, Game, Promotions)
   - Filter và search
   - Bulk actions (mark all read)
   - Infinite scroll hoặc pagination

3. Notification toast/popups:
   - Real-time alerts design
   - Various types (success, warning, info)
   - Animation và positioning
   - Mobile-friendly behavior

4. Empty states và skeletons:
   - Visually appealing empty state
   - Loading indicators

Cung cấp code TSX đầy đủ với Tailwind và shadcn/ui components, tập trung vào real-time feel và không làm gián đoạn trải nghiệm người dùng.
```

## 9. Prompt Cải thiện Admin Dashboard

```
Tôi cần nâng cấp UI/UX cho phần Admin Dashboard của Vinbet.

Hãy thiết kế:
1. Admin overview dashboard:
   - KPIs và metrics chính
   - Charts và graphs (users, bets, revenue)
   - Quick actions và shortcuts

2. User management interface:
   - Data table với advanced filters
   - User detail view
   - Bulk actions và inline editing
   - Status indicators

3. Game management:
   - Game rounds list/grid
   - Result input interface
   - Stats và analytics

4. Payment requests handling:
   - Workflow view cho approval process
   - Filtering và sorting
   - Detail view với proof validation

Cung cấp code TSX đầy đủ với Tailwind và shadcn/ui components, tập trung vào data density phù hợp, quản lý hiệu quả và trải nghiệm admin mượt mà.
```

## 10. Prompt Cải thiện Mobile Experience

```
Tôi cần đảm bảo Vinbet có trải nghiệm mobile tuyệt vời. Hãy review và cải thiện responsive design cho các phần chính.

Hãy thiết kế:
1. Mobile navigation:
   - Bottom bar navigation thay vì sidebar
   - Collapsed header với essential actions
   - Touch-friendly controls

2. Mobile-specific layouts:
   - Điều chỉnh game grid/cards
   - Simplified forms cho deposit/withdraw
   - Stacked layouts thay vì tables

3. Touch optimizations:
   - Larger tap targets
   - Swipe actions
   - Pull-to-refresh

4. Performance enhancements:
   - Lazy loading strategies
   - Simplified visuals cho low-bandwidth

Cung cấp code TSX đầy đủ với Tailwind media queries và responsive utilities, tập trung vào touch-first experience và mobile performance.
```

## Lộ trình triển khai đề xuất:

1. **Bắt đầu với Design System** (Prompt #1) - Thiết lập nền tảng chung trước
2. **Cải thiện Navigation & Layout** (Prompt #2) - Khung giao diện chính 
3. **Trang chủ & Game Interface** (Prompt #3 & #4) - Tập trung vào trải nghiệm người dùng chính
4. **Xác thực & Tài chính** (Prompt #5 & #6) - Tối ưu các luồng chuyển đổi quan trọng
5. **Các phần còn lại** theo thứ tự ưu tiên của bạn

Mỗi prompt được thiết kế để nhận được phản hồi có thể triển khai ngay, với code TSX và Tailwind CSS đầy đủ. Bạn có thể điều chỉnh các prompt theo nhu cầu cụ thể hoặc theo phản hồi từ người dùng trong quá trình cải thiện.
