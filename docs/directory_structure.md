Directory structure:
└── dominicushuy-vinbet/
    ├── components.json
    ├── eslint.config.mjs
    ├── jsconfig.json
    ├── middleware.js
    ├── next.config.mjs
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── .prettierrc.json
    └── src/
        ├── app/
        │   ├── config.js
        │   ├── globals.css
        │   ├── layout.jsx
        │   ├── (admin)/
        │   │   ├── layout.jsx
        │   │   └── admin/
        │   │       ├── dashboard/
        │   │       │   └── page.jsx
        │   │       ├── games/
        │   │       │   ├── page.jsx
        │   │       │   └── [id]/
        │   │       │       └── page.jsx
        │   │       ├── notifications/
        │   │       │   └── page.jsx
        │   │       ├── payments/
        │   │       │   └── page.jsx
        │   │       └── users/
        │   │           ├── page.jsx
        │   │           └── [id]/
        │   │               └── page.jsx
        │   ├── (auth)/
        │   │   ├── layout.jsx
        │   │   ├── forgot-password/
        │   │   │   └── page.jsx
        │   │   ├── login/
        │   │   │   └── page.jsx
        │   │   ├── register/
        │   │   │   └── page.jsx
        │   │   └── reset-password/
        │   │       └── page.jsx
        │   ├── (main)/
        │   │   ├── layout.jsx
        │   │   ├── page.jsx
        │   │   ├── finance/
        │   │   │   ├── layout.jsx
        │   │   │   ├── page.jsx
        │   │   │   ├── deposit/
        │   │   │   │   └── page.jsx
        │   │   │   ├── transactions/
        │   │   │   │   └── page.jsx
        │   │   │   └── withdrawal/
        │   │   │       └── page.jsx
        │   │   ├── games/
        │   │   │   ├── page.jsx
        │   │   │   └── [id]/
        │   │   │       └── page.jsx
        │   │   ├── notifications/
        │   │   │   ├── page.jsx
        │   │   │   ├── settings/
        │   │   │   │   └── page.jsx
        │   │   │   └── telegram/
        │   │   │       └── page.jsx
        │   │   ├── profile/
        │   │   │   └── page.jsx
        │   │   └── referrals/
        │   │       └── page.jsx
        │   └── api/
        │       ├── admin/
        │       │   ├── dashboard-summary/
        │       │   │   └── route.js
        │       │   ├── games/
        │       │   │   └── [id]/
        │       │   │       └── results/
        │       │   │           └── route.js
        │       │   ├── metrics/
        │       │   │   └── route.js
        │       │   ├── notifications/
        │       │   │   └── send/
        │       │   │       └── route.js
        │       │   ├── payment-requests/
        │       │   │   ├── route.js
        │       │   │   └── [id]/
        │       │   │       └── [action]/
        │       │   │           └── route.js
        │       │   ├── transactions/
        │       │   │   ├── route.js
        │       │   │   └── summary/
        │       │   │       └── route.js
        │       │   └── users/
        │       │       ├── route.js
        │       │       └── [id]/
        │       │           └── route.js
        │       ├── auth/
        │       │   ├── callback/
        │       │   │   └── route.js
        │       │   ├── forgot-password/
        │       │   │   └── route.js
        │       │   ├── login/
        │       │   │   └── route.js
        │       │   ├── logout/
        │       │   │   └── route.js
        │       │   ├── register/
        │       │   │   └── route.js
        │       │   ├── reset-password/
        │       │   │   └── route.js
        │       │   ├── session/
        │       │   │   └── route.js
        │       │   └── verify-email/
        │       │       └── route.js
        │       ├── game-rounds/
        │       │   ├── route.js
        │       │   ├── [id]/
        │       │   │   ├── route.js
        │       │   │   ├── bets/
        │       │   │   │   └── route.js
        │       │   │   ├── my-bets/
        │       │   │   │   └── route.js
        │       │   │   ├── results/
        │       │   │   │   └── route.js
        │       │   │   └── winners/
        │       │   │       └── route.js
        │       │   └── active/
        │       │       └── route.js
        │       ├── games/
        │       │   ├── [id]/
        │       │   │   └── leaderboard/
        │       │   │       └── route.js
        │       │   ├── jackpot/
        │       │   │   └── route.js
        │       │   ├── jackpot-games/
        │       │   │   └── route.js
        │       │   ├── popular/
        │       │   │   └── route.js
        │       │   ├── related/
        │       │   │   └── route.js
        │       │   ├── upcoming/
        │       │   │   └── route.js
        │       │   └── winners/
        │       │       └── recent/
        │       │           └── route.js
        │       ├── notifications/
        │       │   ├── route.js
        │       │   ├── [id]/
        │       │   │   ├── route.js
        │       │   │   └── read/
        │       │   │       └── route.js
        │       │   ├── count/
        │       │   │   └── route.js
        │       │   ├── delete-all/
        │       │   │   └── route.js
        │       │   ├── read-all/
        │       │   │   └── route.js
        │       │   ├── settings/
        │       │   │   └── route.js
        │       │   └── telegram/
        │       │       └── route.js
        │       ├── payment-requests/
        │       │   ├── route.js
        │       │   ├── upload-proof/
        │       │   │   └── route.js
        │       │   └── withdraw/
        │       │       ├── route.js
        │       │       └── [id]/
        │       │           └── route.js
        │       ├── profile/
        │       │   ├── route.js
        │       │   ├── avatar/
        │       │   │   └── route.js
        │       │   ├── change-password/
        │       │   │   └── route.js
        │       │   └── stats/
        │       │       └── route.js
        │       ├── referrals/
        │       │   ├── route.js
        │       │   ├── code/
        │       │   │   └── route.js
        │       │   ├── list/
        │       │   │   └── route.js
        │       │   └── stats/
        │       │       └── route.js
        │       ├── statistics/
        │       │   └── platform/
        │       │       └── route.js
        │       └── transactions/
        │           ├── route.js
        │           ├── chart/
        │           │   └── route.js
        │           ├── export/
        │           │   └── route.js
        │           └── summary/
        │               └── route.js
        ├── components/
        │   ├── admin/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── AdminGameDetail.jsx
        │   │   ├── AdminGameManagement.jsx
        │   │   ├── AdminUserDetail.jsx
        │   │   ├── AdminUserManagement.jsx
        │   │   ├── NotificationSender.jsx
        │   │   ├── PaymentRequestDetail.jsx
        │   │   ├── PaymentRequestsManagement.jsx
        │   │   ├── dashboard/
        │   │   │   ├── ActiveGamesList.jsx
        │   │   │   ├── MetricsCharts.jsx
        │   │   │   ├── QuickActions.jsx
        │   │   │   ├── RecentTransactions.jsx
        │   │   │   └── StatsCard.jsx
        │   │   └── layout/
        │   │       ├── AdminBreadcrumb.jsx
        │   │       ├── AdminFooter.jsx
        │   │       ├── AdminHeader.jsx
        │   │       ├── AdminPageHeader.jsx
        │   │       ├── AdminSidebar.jsx
        │   │       └── ResponsiveAdminMenu.jsx
        │   ├── auth/
        │   │   ├── ForgotPasswordForm.jsx
        │   │   ├── LoginForm.jsx
        │   │   ├── RegisterForm.jsx
        │   │   └── ResetPasswordForm.jsx
        │   ├── bet/
        │   │   ├── BetConfirmation.jsx
        │   │   ├── BetForm.jsx
        │   │   ├── BetList.jsx
        │   │   └── BetSuccessAnimation.jsx
        │   ├── finance/
        │   │   ├── DepositFlowSteps.jsx
        │   │   ├── ExportTransactions.jsx
        │   │   ├── FinancialOverviewChart.jsx
        │   │   ├── FinancialSummary.jsx
        │   │   ├── FinancialSummaryCards.jsx
        │   │   ├── PaymentMethodCard.jsx
        │   │   ├── PaymentProofUpload.jsx
        │   │   ├── PaymentRequestList.jsx
        │   │   ├── PaymentStatus.jsx
        │   │   ├── RecentTransactionsList.jsx
        │   │   ├── TransactionAdvancedFilters.jsx
        │   │   ├── TransactionChartView.jsx
        │   │   ├── TransactionDashboard.jsx
        │   │   ├── TransactionDetailModal.jsx
        │   │   ├── TransactionHistoryTable.jsx
        │   │   ├── WithdrawalFlowSteps.jsx
        │   │   └── WithdrawalHistory.jsx
        │   ├── game/
        │   │   ├── GameCard.jsx
        │   │   ├── GameFilters.jsx
        │   │   ├── GameLeaderboard.jsx
        │   │   ├── GameListItem.jsx
        │   │   ├── GameListSkeleton.jsx
        │   │   ├── GameResultAnimation.jsx
        │   │   ├── RelatedGames.jsx
        │   │   └── WinnerList.jsx
        │   ├── home/
        │   │   ├── CTACard.jsx
        │   │   ├── GameCardShowcase.jsx
        │   │   ├── JackpotCounter.jsx
        │   │   ├── StatsCounter.jsx
        │   │   ├── TestimonialSlider.jsx
        │   │   └── WinnersList.jsx
        │   ├── layout/
        │   │   └── MainLayout.jsx
        │   ├── notifications/
        │   │   ├── EmptyNotifications.jsx
        │   │   ├── NotificationBadge.jsx
        │   │   ├── NotificationDetail.jsx
        │   │   ├── NotificationDropdown.jsx
        │   │   ├── NotificationItem.jsx
        │   │   ├── NotificationSettings.jsx
        │   │   ├── NotificationSkeleton.jsx
        │   │   ├── NotificationSkeletonItem.jsx
        │   │   ├── NotificationToast.jsx
        │   │   └── TelegramConnect.jsx
        │   ├── profile/
        │   │   ├── AccountStatus.jsx
        │   │   ├── AvatarUploader.jsx
        │   │   ├── LoginHistory.jsx
        │   │   ├── PasswordChangeForm.jsx
        │   │   ├── ProfileDashboard.jsx
        │   │   ├── ProfileForm.jsx
        │   │   ├── ProfileHeader.jsx
        │   │   └── ProfileStats.jsx
        │   ├── referrals/
        │   │   ├── ReferralCodeCard.jsx
        │   │   ├── ReferralShareLinks.jsx
        │   │   ├── ReferralsList.jsx
        │   │   └── ReferralStatistics.jsx
        │   └── ui/
        │       ├── alert-dialog.jsx
        │       ├── alert.jsx
        │       ├── avatar.jsx
        │       ├── badge.jsx
        │       ├── button.jsx
        │       ├── calendar.jsx
        │       ├── card.jsx
        │       ├── checkbox.jsx
        │       ├── collapsible.jsx
        │       ├── date-picker.jsx
        │       ├── date-range-picker.jsx
        │       ├── dialog.jsx
        │       ├── dropdown-menu.jsx
        │       ├── form.jsx
        │       ├── hover-card.jsx
        │       ├── input.jsx
        │       ├── label.jsx
        │       ├── lightbox.jsx
        │       ├── pagination.jsx
        │       ├── popover.jsx
        │       ├── progress.jsx
        │       ├── radio-group.jsx
        │       ├── scroll-area.jsx
        │       ├── select.jsx
        │       ├── separator.jsx
        │       ├── sheet.jsx
        │       ├── skeleton.jsx
        │       ├── slider.jsx
        │       ├── steps.jsx
        │       ├── switch.jsx
        │       ├── table.jsx
        │       ├── tabs.jsx
        │       ├── textarea.jsx
        │       ├── toast.jsx
        │       ├── toaster.jsx
        │       └── tooltip.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useNotificationListener.jsx
        │   ├── useToast.js
        │   └── queries/
        │       ├── useAdminQueries.js
        │       ├── useAuthQueries.js
        │       ├── useBetQueries.js
        │       ├── useFinanceQueries.js
        │       ├── useGameQueries.js
        │       ├── useNotificationQueries.js
        │       ├── useProfileQueries.js
        │       ├── useReferralQueries.js
        │       └── useTransactionQueries.js
        ├── lib/
        │   ├── fonts.js
        │   ├── utils.js
        │   ├── auth/
        │   │   └── session.js
        │   └── supabase/
        │       ├── admin.js
        │       ├── client.js
        │       └── server.js
        ├── providers/
        │   ├── ComponentsProvider.jsx
        │   └── QueryProvider.jsx
        ├── services/
        │   ├── api.service.js
        │   └── auth.service.js
        └── utils/
            └── telegram.js
