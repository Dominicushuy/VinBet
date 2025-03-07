Tôi dự định sẽ xây dựng phần tính năng sau, dưới đây là danh sách cấu trúc thư mục của dự án, hãy giúp tôi lấy ra những folders, files liên quan đến phần tính năng cần làm, Luôn luôn giữ lại những Layout, Page , Share components.

Output tôi cần là 1 String bao gồm tên đường dẫn tất cả các files, folder, được cách nhau bởi dấu “,”. Những đường dẫn nào có chứa “(...)“ hoặc “[…]” thì thay thế thành “*” (ví dụ: src/app/(dashboard)/profile/page.tsx -> src/app/*/profile/page.tsx)

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

Directory structure:
└── dominicushuy-bets-nextjs/
    ├── README.md
    ├── eslint.config.mjs
    ├── middleware.ts
    ├── next.config.mjs
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── public/
    └── src/
        ├── app/
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── (admin)/
        │   │   └── admin/
        │   │       ├── layout.tsx
        │   │       ├── dashboard/
        │   │       │   └── page.tsx
        │   │       ├── games/
        │   │       │   ├── page.tsx
        │   │       │   ├── [id]/
        │   │       │   │   ├── page.tsx
        │   │       │   │   └── edit/
        │   │       │   │       └── page.tsx
        │   │       │   └── new/
        │   │       │       └── page.tsx
        │   │       ├── logs/
        │   │       │   └── page.tsx
        │   │       ├── payment-requests/
        │   │       │   └── page.tsx
        │   │       ├── promotions/
        │   │       │   └── page.tsx
        │   │       ├── rewards/
        │   │       │   └── page.tsx
        │   │       └── users/
        │   │           └── page.tsx
        │   ├── (auth)/
        │   │   ├── layout.tsx
        │   │   ├── forgot-password/
        │   │   │   └── page.tsx
        │   │   ├── login/
        │   │   │   └── page.tsx
        │   │   ├── register/
        │   │   │   └── page.tsx
        │   │   └── reset-password/
        │   │       └── page.tsx
        │   ├── (dashboard)/
        │   │   ├── layout.tsx
        │   │   ├── dashboard/
        │   │   │   └── page.tsx
        │   │   ├── games/
        │   │   │   ├── page.tsx
        │   │   │   └── [id]/
        │   │   │       └── page.tsx
        │   │   ├── history/
        │   │   │   └── page.tsx
        │   │   ├── payment-request/
        │   │   │   └── page.tsx
        │   │   ├── profile/
        │   │   │   ├── page.tsx
        │   │   │   ├── change-password/
        │   │   │   │   └── page.tsx
        │   │   │   └── preferences/
        │   │   │       └── page.tsx
        │   │   ├── promotions/
        │   │   │   └── page.tsx
        │   │   ├── rewards/
        │   │   │   └── page.tsx
        │   │   └── statistics/
        │   │       └── page.tsx
        │   └── api/
        │       ├── admin/
        │       │   ├── dashboard-summary/
        │       │   │   └── route.ts
        │       │   ├── games/
        │       │   │   ├── route.ts
        │       │   │   └── [id]/
        │       │   │       └── route.ts
        │       │   ├── payment-requests/
        │       │   │   ├── route.ts
        │       │   │   └── [id]/
        │       │   │       └── route.ts
        │       │   ├── rewards/
        │       │   │   └── route.ts
        │       │   └── users/
        │       │       └── route.ts
        │       ├── auth/
        │       │   ├── change-password/
        │       │   │   └── route.ts
        │       │   ├── login/
        │       │   │   └── route.ts
        │       │   ├── phone-login/
        │       │   │   └── route.ts
        │       │   ├── register/
        │       │   │   └── route.ts
        │       │   ├── resend-verification/
        │       │   │   └── route.ts
        │       │   ├── reset-password/
        │       │   │   └── route.ts
        │       │   ├── update-user/
        │       │   │   └── route.ts
        │       │   └── verify-email/
        │       │       └── route.ts
        │       ├── game-rounds/
        │       │   ├── route.ts
        │       │   ├── [id]/
        │       │   │   ├── route.ts
        │       │   │   ├── bet-stats/
        │       │   │   │   └── route.ts
        │       │   │   ├── bets/
        │       │   │   │   └── route.ts
        │       │   │   ├── complete/
        │       │   │   │   └── route.ts
        │       │   │   ├── my-bets/
        │       │   │   │   └── route.ts
        │       │   │   ├── number-distribution/
        │       │   │   │   └── route.ts
        │       │   │   └── results/
        │       │   │       └── route.ts
        │       │   ├── active/
        │       │   │   └── route.ts
        │       │   └── bets/
        │       │       └── route.ts
        │       ├── history/
        │       │   └── route.ts
        │       ├── notifications/
        │       │   └── route.ts
        │       ├── payment-requests/
        │       │   ├── route.ts
        │       │   └── [id]/
        │       │       └── route.ts
        │       ├── profile/
        │       │   ├── route.ts
        │       │   ├── avatar/
        │       │   │   └── route.ts
        │       │   └── level-progress/
        │       │       └── route.ts
        │       ├── rewards/
        │       │   ├── route.ts
        │       │   └── [code]/
        │       │       ├── route.ts
        │       │       └── redeem/
        │       │           └── route.ts
        │       ├── statistics/
        │       │   ├── activities/
        │       │   │   └── route.ts
        │       │   ├── level-benefits/
        │       │   │   └── route.ts
        │       │   └── user/
        │       │       └── route.ts
        │       └── upload/
        │           └── route.ts
        ├── components/
        │   ├── admin/
        │   │   ├── admin-header.tsx
        │   │   ├── admin/
        │   │   │   ├── admin-dashboard-content.tsx
        │   │   │   └── admin-sidebar.tsx
        │   │   ├── games/
        │   │   │   ├── admin-game-control.tsx
        │   │   │   ├── admin-game-detail.tsx
        │   │   │   ├── admin-game-form.tsx
        │   │   │   ├── admin-game-list.tsx
        │   │   │   └── admin-games-content.tsx
        │   │   ├── payment-requests/
        │   │   │   ├── payment-request-approval.tsx
        │   │   │   └── payment-request-list.tsx
        │   │   └── users/
        │   │       ├── user-form.tsx
        │   │       └── user-list.tsx
        │   ├── auth/
        │   │   ├── change-password-form.tsx
        │   │   ├── forgot-password-form.tsx
        │   │   ├── login-form.tsx
        │   │   └── register-form.tsx
        │   ├── dashboard/
        │   │   ├── activity-feed.tsx
        │   │   ├── dashboard-content.tsx
        │   │   ├── featured-games.tsx
        │   │   ├── statistics-charts.tsx
        │   │   └── statistics-widget.tsx
        │   ├── game/
        │   │   ├── bet-form.tsx
        │   │   ├── bet-list.tsx
        │   │   ├── bet-success-dialog.tsx
        │   │   ├── confetti-effect.ts
        │   │   ├── game-activity.tsx
        │   │   ├── game-card.tsx
        │   │   ├── game-countdown.tsx
        │   │   ├── game-detail-skeleton.tsx
        │   │   ├── game-detail.tsx
        │   │   ├── game-list-skeleton.tsx
        │   │   ├── game-list.tsx
        │   │   ├── game-result-banner.tsx
        │   │   ├── game-result-detail.tsx
        │   │   ├── game-result-stats.tsx
        │   │   ├── game-reward-card.tsx
        │   │   ├── game-status-checker.tsx
        │   │   └── winner-animation.tsx
        │   ├── history/
        │   │   └── history-content.tsx
        │   ├── layouts/
        │   │   ├── footer.tsx
        │   │   └── main-layout.tsx
        │   ├── notifications/
        │   │   ├── notification-dropdown.tsx
        │   │   └── notification-helper.ts
        │   ├── payment/
        │   │   ├── payment-request-form.tsx
        │   │   └── upload-proof.tsx
        │   ├── profile/
        │   │   ├── avatar-upload.tsx
        │   │   ├── bet-history-list.tsx
        │   │   ├── preferences-form.tsx
        │   │   ├── profile-form.tsx
        │   │   ├── statistics-card.tsx
        │   │   ├── user-level-progress.tsx
        │   │   └── user-statistics.tsx
        │   ├── rewards/
        │   │   ├── reward-card.tsx
        │   │   ├── reward-detail-dialog.tsx
        │   │   ├── reward-qr.tsx
        │   │   └── rewards-content.tsx
        │   ├── statistics/
        │   │   ├── activity-feed.tsx
        │   │   ├── statistics-chart.tsx
        │   │   └── user-statistics-content.tsx
        │   ├── ui/
        │   │   ├── accordion.tsx
        │   │   ├── alert.tsx
        │   │   ├── avatar.tsx
        │   │   ├── badge.tsx
        │   │   ├── button.tsx
        │   │   ├── card.tsx
        │   │   ├── checkbox.tsx
        │   │   ├── dialog.tsx
        │   │   ├── dropdown.tsx
        │   │   ├── form.tsx
        │   │   ├── input.tsx
        │   │   ├── loading.tsx
        │   │   ├── notification.tsx
        │   │   ├── pagination.tsx
        │   │   ├── progress.tsx
        │   │   ├── radio-group.tsx
        │   │   ├── select.tsx
        │   │   ├── skeleton.tsx
        │   │   ├── switch.tsx
        │   │   ├── tabs.tsx
        │   │   └── textarea.tsx
        │   └── user/
        │       ├── level-badge.tsx
        │       ├── user-level-details.tsx
        │       └── user-stats-cards.tsx
        ├── hooks/
        │   ├── auth-hooks.ts
        │   ├── game-hooks.ts
        │   ├── history-hooks.ts
        │   ├── notification-hooks.ts
        │   ├── payment-hooks.ts
        │   ├── profile-hooks.ts
        │   ├── promotion-hooks.ts
        │   ├── reward-hooks.ts
        │   ├── statistics-hooks.ts
        │   └── use-click-outside.ts
        ├── lib/
        │   ├── utils.ts
        │   └── supabase/
        │       ├── admin.ts
        │       ├── client.ts
        │       ├── server.ts
        │       └── storage.ts
        ├── providers/
        │   ├── auth-provider.tsx
        │   ├── notification-provider.tsx
        │   ├── query-provider.tsx
        │   └── toast-provider.tsx
        ├── services/
        │   ├── auth-service.ts
        │   ├── game-service.ts
        │   ├── notification-service.ts
        │   ├── payment-service.ts
        │   ├── profile-service.ts
        │   ├── promotion-service.ts
        │   ├── reward-service.ts
        │   └── statistics-service.ts
        ├── styles/
        │   └── globals.css
        └── types/
            ├── database.ts
            └── supabase.ts

