Tôi đang định sử dụng prompt để nhờ Chat Bot chỉnh sửa nâng cấp UI,UX của dự án, vì số lượng code của dự án vượt quán input token của Chat Bot nên tôi cần bạn giúp tôi lọc ra những files **KHÔNG** liên quan đến các phần cần nâng cấp:

Output tôi cần là 1 String bao gồm tên đường dẫn tất cả các files, folder, được cách nhau bởi dấu “,”. Những đường dẫn nào có chứa các kí tự “()“ hoặc “[]” thì thay thế thành dấu hoa thị “*” (ví dụ: src/app/(dashboard)/profile/page.tsx -> src/app/*/profile/page.tsx hoặc src/app/[id]/page.tsx -> src/app/*/page.tsx ).

(Chú ý: Đường dẫn không cần phải theo thứ tự, chỉ cần xuất hiện trong dự án là được, luôn phải có default sau: docs,scripts,public,pnpm-lock.yaml)

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

Cung cấp code TSX đầy đủ với Tailwind và radix-ui components, tập trung vào tính minh bạch, dễ sử dụng và tạo sự tin tưởng cho người dùng.
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
        │       ├── games/
        │       │   ├── [id]/
        │       │   │   └── leaderboard/
        │       │   │       └── route.ts
        │       │   ├── jackpot/
        │       │   │   └── route.ts
        │       │   ├── jackpot-games/
        │       │   │   └── route.ts
        │       │   ├── popular/
        │       │   │   └── route.ts
        │       │   ├── related/
        │       │   │   └── route.ts
        │       │   ├── upcoming/
        │       │   │   └── route.ts
        │       │   └── winners/
        │       │       └── recent/
        │       │           └── route.ts
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
        │       ├── statistics/
        │       │   └── platform/
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
        │   │   ├── BetSuccess.tsx
        │   │   └── BetSuccessAnimation.tsx
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
        │   │   ├── GameLeaderboard.tsx
        │   │   ├── GameList.tsx
        │   │   ├── GameListItem.tsx
        │   │   ├── GameListSkeleton.tsx
        │   │   ├── GameResult.tsx
        │   │   ├── GameResultAnimation.tsx
        │   │   ├── GameResultNotification.tsx
        │   │   ├── RelatedGames.tsx
        │   │   └── WinnerList.tsx
        │   ├── home/
        │   │   ├── CTACard.tsx
        │   │   ├── GameCardShowcase.tsx
        │   │   ├── JackpotCounter.tsx
        │   │   ├── StatsCounter.tsx
        │   │   ├── TestimonialSlider.tsx
        │   │   └── WinnersList.tsx
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
        │       ├── calendar.tsx
        │       ├── card.tsx
        │       ├── checkbox.tsx
        │       ├── date-picker.tsx
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
        │       ├── textarea.tsx
        │       └── tooltip.tsx
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
        │   ├── fonts.ts
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
