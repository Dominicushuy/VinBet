#!/bin/bash

# Script tạo cấu trúc thư mục cho dự án VinBet (chỉ phần src)
# Với file page.tsx và route.ts cho các thư mục tương ứng

# Tạo cấu trúc thư mục src cho pages
mkdir -p "src/app/(admin)/admin/dashboard"
mkdir -p "src/app/(admin)/admin/games"
mkdir -p "src/app/(admin)/admin/payments"
mkdir -p "src/app/(admin)/admin/users"

mkdir -p "src/app/(auth)/login"
mkdir -p "src/app/(auth)/register"
mkdir -p "src/app/(auth)/forgot-password"
mkdir -p "src/app/(auth)/reset-password"

mkdir -p "src/app/(main)/games/[id]"
mkdir -p "src/app/(main)/finance/deposit"
mkdir -p "src/app/(main)/finance/withdrawal"
mkdir -p "src/app/(main)/finance/transactions"
mkdir -p "src/app/(main)/profile"
mkdir -p "src/app/(main)/referrals"

# Tạo thư mục API routes
mkdir -p src/app/api/auth/login
mkdir -p src/app/api/auth/register
mkdir -p src/app/api/auth/logout
mkdir -p src/app/api/auth/session
mkdir -p src/app/api/auth/verify-email
mkdir -p src/app/api/auth/reset-password
mkdir -p src/app/api/auth/forgot-password
mkdir -p src/app/api/auth/callback

mkdir -p "src/app/api/game-rounds/[id]/bets"
mkdir -p "src/app/api/game-rounds/[id]/results"
mkdir -p "src/app/api/game-rounds/[id]/winners"
mkdir -p src/app/api/game-rounds/active

mkdir -p src/app/api/profile/avatar
mkdir -p src/app/api/profile/change-password
mkdir -p src/app/api/profile/stats

mkdir -p src/app/api/payment-requests/upload-proof
mkdir -p src/app/api/payment-requests/withdraw

mkdir -p src/app/api/transactions/summary

mkdir -p src/app/api/notifications/count
mkdir -p "src/app/api/notifications/[id]/read"
mkdir -p src/app/api/notifications/telegram
mkdir -p src/app/api/notifications/settings

mkdir -p src/app/api/referrals/code
mkdir -p src/app/api/referrals/stats
mkdir -p src/app/api/referrals/list

# Tạo thư mục components
mkdir -p src/components/admin
mkdir -p src/components/auth
mkdir -p src/components/finance
mkdir -p src/components/game
mkdir -p src/components/layout
mkdir -p src/components/notification
mkdir -p src/components/profile
mkdir -p src/components/referral
mkdir -p src/components/ui

# Tạo các thư mục khác
mkdir -p src/hooks/queries
mkdir -p src/lib/supabase
mkdir -p src/providers
mkdir -p src/services
mkdir -p src/types

# Tạo các file page.tsx cho các pages
# Admin pages
touch "src/app/(admin)/admin/page.tsx"
touch "src/app/(admin)/admin/dashboard/page.tsx"
touch "src/app/(admin)/admin/games/page.tsx"
touch "src/app/(admin)/admin/payments/page.tsx"
touch "src/app/(admin)/admin/users/page.tsx"

# Auth pages
touch "src/app/(auth)/login/page.tsx"
touch "src/app/(auth)/register/page.tsx"
touch "src/app/(auth)/forgot-password/page.tsx"
touch "src/app/(auth)/reset-password/page.tsx"

# Main pages
touch "src/app/(main)/page.tsx"
touch "src/app/(main)/games/page.tsx"
touch "src/app/(main)/games/[id]/page.tsx"
touch "src/app/(main)/finance/page.tsx"
touch "src/app/(main)/finance/deposit/page.tsx"
touch "src/app/(main)/finance/withdrawal/page.tsx"
touch "src/app/(main)/finance/transactions/page.tsx"
touch "src/app/(main)/profile/page.tsx"
touch "src/app/(main)/referrals/page.tsx"

# Tạo các file layout
touch "src/app/(admin)/layout.tsx"
touch "src/app/(auth)/layout.tsx"
touch "src/app/(main)/layout.tsx"

# Tạo các file chính
touch "src/app/globals.css"
touch "src/app/layout.tsx"
touch "src/app/page.tsx"

# Tạo route.ts cho API routes
# Auth routes
touch "src/app/api/auth/login/route.ts"
touch "src/app/api/auth/register/route.ts"
touch "src/app/api/auth/logout/route.ts"
touch "src/app/api/auth/session/route.ts"
touch "src/app/api/auth/verify-email/route.ts"
touch "src/app/api/auth/reset-password/route.ts"
touch "src/app/api/auth/forgot-password/route.ts"
touch "src/app/api/auth/callback/route.ts"

# Game routes
touch "src/app/api/game-rounds/route.ts"
touch "src/app/api/game-rounds/[id]/route.ts"
touch "src/app/api/game-rounds/[id]/bets/route.ts"
touch "src/app/api/game-rounds/[id]/results/route.ts"
touch "src/app/api/game-rounds/[id]/winners/route.ts"
touch "src/app/api/game-rounds/active/route.ts"

# Profile routes
touch "src/app/api/profile/route.ts"
touch "src/app/api/profile/avatar/route.ts"
touch "src/app/api/profile/change-password/route.ts"
touch "src/app/api/profile/stats/route.ts"

# Payment request routes
touch "src/app/api/payment-requests/route.ts"
touch "src/app/api/payment-requests/upload-proof/route.ts"
touch "src/app/api/payment-requests/withdraw/route.ts"

# Transaction routes
touch "src/app/api/transactions/route.ts"
touch "src/app/api/transactions/summary/route.ts"

# Notification routes
touch "src/app/api/notifications/route.ts"
touch "src/app/api/notifications/count/route.ts"
touch "src/app/api/notifications/[id]/read/route.ts"
touch "src/app/api/notifications/telegram/route.ts"
touch "src/app/api/notifications/settings/route.ts"

# Referral routes
touch "src/app/api/referrals/route.ts"
touch "src/app/api/referrals/code/route.ts"
touch "src/app/api/referrals/stats/route.ts"
touch "src/app/api/referrals/list/route.ts"

# Tạo các file hook và service quan trọng
touch "src/hooks/useAuth.ts"
touch "src/hooks/queries/useAuthQueries.ts"
touch "src/hooks/queries/useGameQueries.ts"
touch "src/hooks/queries/useFinanceQueries.ts"
touch "src/hooks/queries/useProfileQueries.ts"
touch "src/hooks/queries/useReferralQueries.ts"

# Tạo các file lib và utils
touch "src/lib/utils.ts"
touch "src/lib/supabase/client.ts"
touch "src/lib/supabase/server.ts"
touch "src/lib/supabase/admin.ts"

# Tạo các file service
touch "src/services/api.service.ts"
touch "src/services/auth.service.ts"

# Tạo các file provider
touch "src/providers/QueryProvider.tsx"
touch "src/providers/ComponentsProvider.tsx"

# Tạo các file types
touch "src/types/supabase.ts"
touch "src/types/database.ts"

echo "Cấu trúc thư mục src cho VinBet đã được tạo thành công!"