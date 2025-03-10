Tôi đang định sử dụng prompt để nhờ Chat Bot chỉnh sửa nâng cấp UI,UX của dự án, vì số lượng code của dự án vượt quán input token của Chat Bot nên tôi cần bạn giúp tôi lọc ra những folders, files liên quan đến các phần cần nâng cấp:

Output tôi cần là 1 String bao gồm tên đường dẫn tất cả các files, folder, được cách nhau bởi dấu “,”. Những đường dẫn nào có chứa “(...)“ hoặc “[…]” thì thay thế thành “*” (ví dụ: src/app/(dashboard)/profile/page.tsx -> src/app/*/profile/page.tsx)

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

Directory structure:
└── dominicushuy-vinbet/
    ├── README.md
    ├── components.json
    ├── eslint.config.mjs
    ├── middleware.ts
    ├── next.config.mjs
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── (admin)/
        │   │   ├── layout.tsx
        │   │   └── admin/
        │   │       ├── page.tsx
        │   │       ├── dashboard/
        │   │       │   └── page.tsx
        │   │       ├── games/
        │   │       │   └── page.tsx
        │   │       ├── notifications/
        │   │       │   └── route.tsx
        │   │       ├── payments/
        │   │       │   └── page.tsx
        │   │       └── users/
        │   │           ├── page.tsx
        │   │           └── [id]/
        │   │               └── page.tsx
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
        │   ├── (main)/
        │   │   ├── layout.tsx
        │   │   ├── page.tsx
        │   │   ├── finance/
        │   │   │   ├── layout.tsx
        │   │   │   ├── page.tsx
        │   │   │   ├── deposit/
        │   │   │   │   └── page.tsx
        │   │   │   ├── transactions/
        │   │   │   │   └── page.tsx
        │   │   │   └── withdrawal/
        │   │   │       └── page.tsx
        │   │   ├── games/
        │   │   │   ├── page.tsx
        │   │   │   └── [id]/
        │   │   │       └── page.tsx
        │   │   ├── notifications/
        │   │   │   ├── page.tsx
        │   │   │   ├── settings/
        │   │   │   │   └── page.tsx
        │   │   │   └── telegram/
        │   │   │       └── page.tsx
        │   │   ├── profile/
        │   │   │   └── page.tsx
        │   │   └── referrals/
        │   │       └── page.tsx
        │   └── api/
        │       ├── admin/
        │       │   ├── dashboard-summary/
        │       │   │   └── route.ts
        │       │   ├── games/
        │       │   │   └── [id]/
        │       │   │       └── results/
        │       │   │           └── route.ts
        │       │   ├── metrics/
        │       │   │   └── route.ts
        │       │   ├── notifications/
        │       │   │   └── send/
        │       │   │       └── route.ts
        │       │   ├── payment-requests/
        │       │   │   ├── route.ts
        │       │   │   └── [id]/
        │       │   │       └── [action]/
        │       │   │           └── route.ts
        │       │   ├── transactions/
        │       │   │   ├── route.ts
        │       │   │   └── summary/
        │       │   │       └── route.ts
        │       │   └── users/
        │       │       ├── route.ts
        │       │       └── [id]/
        │       │           └── route.ts
        │       ├── auth/
        │       │   ├── callback/
        │       │   │   └── route.ts
        │       │   ├── forgot-password/
        │       │   │   └── route.ts
        │       │   ├── login/
        │       │   │   └── route.ts
        │       │   ├── logout/
        │       │   │   └── route.ts
        │       │   ├── register/
        │       │   │   └── route.ts
        │       │   ├── reset-password/
        │       │   │   └── route.ts
        │       │   ├── session/
        │       │   │   └── route.ts
        │       │   └── verify-email/
        │       │       └── route.ts
        │       ├── game-rounds/
        │       │   ├── route.ts
        │       │   ├── [id]/
        │       │   │   ├── route.ts
        │       │   │   ├── bets/
        │       │   │   │   └── route.ts
        │       │   │   ├── my-bets/
        │       │   │   │   └── route.ts
        │       │   │   ├── results/
        │       │   │   │   └── route.ts
        │       │   │   └── winners/
        │       │   │       └── route.ts
        │       │   └── active/
        │       │       └── route.ts
        │       ├── notifications/
        │       │   ├── route.ts
        │       │   ├── [id]/
        │       │   │   └── read/
        │       │   │       └── route.ts
        │       │   ├── count/
        │       │   │   └── route.ts
        │       │   ├── read-all/
        │       │   │   └── route.ts
        │       │   ├── settings/
        │       │   │   └── route.ts
        │       │   └── telegram/
        │       │       └── route.ts
        │       ├── payment-requests/
        │       │   ├── route.ts
        │       │   ├── upload-proof/
        │       │   │   └── route.ts
        │       │   └── withdraw/
        │       │       ├── route.ts
        │       │       └── [id]/
        │       │           └── route.ts
        │       ├── profile/
        │       │   ├── route.ts
        │       │   ├── avatar/
        │       │   │   └── route.ts
        │       │   ├── change-password/
        │       │   │   └── route.ts
        │       │   └── stats/
        │       │       └── route.ts
        │       ├── referrals/
        │       │   ├── route.ts
        │       │   ├── code/
        │       │   │   └── route.ts
        │       │   ├── list/
        │       │   │   └── route.ts
        │       │   └── stats/
        │       │       └── route.ts
        │       └── transactions/
        │           ├── route.ts
        │           └── summary/
        │               └── route.ts
        ├── components/
        │   ├── admin/
        │   │   ├── Charts.tsx
        │   │   ├── Dashboard.tsx
        │   │   ├── GameResultInput.tsx
        │   │   ├── GameRoundManagement.tsx
        │   │   ├── NotificationSender.tsx
        │   │   ├── PaymentRequestsManagement.tsx
        │   │   ├── Stats.tsx
        │   │   ├── UserDetail.tsx
        │   │   └── UserManagement.tsx
        │   ├── auth/
        │   │   ├── ForgotPasswordForm.tsx
        │   │   ├── LoginForm.tsx
        │   │   ├── RegisterForm.tsx
        │   │   └── ResetPasswordForm.tsx
        │   ├── bet/
        │   │   ├── BetConfirmation.tsx
        │   │   ├── BetForm.tsx
        │   │   ├── BetList.tsx
        │   │   └── BetSuccess.tsx
        │   ├── finance/
        │   │   ├── DepositForm.tsx
        │   │   ├── FinancialSummary.tsx
        │   │   ├── PaymentProofUpload.tsx
        │   │   ├── PaymentRequestList.tsx
        │   │   ├── PaymentStatus.tsx
        │   │   ├── TransactionDetail.tsx
        │   │   ├── TransactionFilters.tsx
        │   │   ├── TransactionHistory.tsx
        │   │   ├── WithdrawalForm.tsx
        │   │   ├── WithdrawalHistory.tsx
        │   │   └── WithdrawalMethodSelect.tsx
        │   ├── game/
        │   │   ├── ActiveGames.tsx
        │   │   ├── GameCard.tsx
        │   │   ├── GameFilters.tsx
        │   │   ├── GameList.tsx
        │   │   ├── GameListSkeleton.tsx
        │   │   ├── GameResult.tsx
        │   │   ├── GameResultNotification.tsx
        │   │   └── WinnerList.tsx
        │   ├── layout/
        │   │   └── MainLayout.tsx
        │   ├── notifications/
        │   │   ├── NotificationBadge.tsx
        │   │   ├── NotificationDropdown.tsx
        │   │   ├── NotificationItem.tsx
        │   │   ├── NotificationList.tsx
        │   │   ├── NotificationSettings.tsx
        │   │   └── TelegramConnect.tsx
        │   ├── profile/
        │   │   ├── AvatarUpload.tsx
        │   │   ├── ChangePasswordForm.tsx
        │   │   ├── ProfileForm.tsx
        │   │   └── UserStatistics.tsx
        │   ├── referrals/
        │   │   ├── ReferralCodeCard.tsx
        │   │   ├── ReferralShareLinks.tsx
        │   │   ├── ReferralStatistics.tsx
        │   │   └── ReferralsList.tsx
        │   └── ui/
        │       ├── alert-dialog.tsx
        │       ├── alert.tsx
        │       ├── avatar.tsx
        │       ├── badge.tsx
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── checkbox.tsx
        │       ├── dialog.tsx
        │       ├── dropdown-menu.tsx
        │       ├── form.tsx
        │       ├── input.tsx
        │       ├── label.tsx
        │       ├── pagination.tsx
        │       ├── popover.tsx
        │       ├── progress.tsx
        │       ├── select.tsx
        │       ├── separator.tsx
        │       ├── sheet.tsx
        │       ├── skeleton.tsx
        │       ├── sonner.tsx
        │       ├── switch.tsx
        │       ├── table.tsx
        │       ├── tabs.tsx
        │       └── textarea.tsx
        ├── hooks/
        │   ├── useAuth.ts
        │   └── queries/
        │       ├── useAdminQueries.ts
        │       ├── useAuthQueries.ts
        │       ├── useBetQueries.ts
        │       ├── useFinanceQueries.ts
        │       ├── useGameQueries.ts
        │       ├── useNotificationQueries.ts
        │       ├── useProfileQueries.ts
        │       ├── useReferralQueries.ts
        │       └── useTransactionQueries.ts
        ├── lib/
        │   ├── utils.ts
        │   ├── auth/
        │   │   └── session.ts
        │   └── supabase/
        │       ├── admin.ts
        │       ├── client.ts
        │       └── server.ts
        ├── providers/
        │   ├── ComponentsProvider.tsx
        │   └── QueryProvider.tsx
        ├── services/
        │   ├── api.service.ts
        │   └── auth.service.ts
        ├── types/
        │   ├── database.ts
        │   └── supabase.ts
        └── utils/
            └── telegram.ts
