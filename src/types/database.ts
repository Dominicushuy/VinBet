import { Database as SupabaseDatabase } from './supabase'

// Database type từ Supabase
export type Database = SupabaseDatabase

// Table definitions
export type Tables = Database['public']['Tables']

// Profiles
export type Profile = Tables['profiles']['Row']
export type ProfileInsert = Tables['profiles']['Insert']
export type ProfileUpdate = Tables['profiles']['Update']

// Game Rounds
export type GameRound = Tables['game_rounds']['Row']
export type GameRoundInsert = Tables['game_rounds']['Insert']
export type GameRoundUpdate = Tables['game_rounds']['Update']

// Bets
export type Bet = Tables['bets']['Row']
export type BetInsert = Tables['bets']['Insert']
export type BetUpdate = Tables['bets']['Update']

// Payment Requests
export type PaymentRequest = Tables['payment_requests']['Row']
export type PaymentRequestInsert = Tables['payment_requests']['Insert']
export type PaymentRequestUpdate = Tables['payment_requests']['Update']

// Transactions
export type Transaction = Tables['transactions']['Row']
export type TransactionInsert = Tables['transactions']['Insert']
export type TransactionUpdate = Tables['transactions']['Update']

// Notifications
export type Notification = Tables['notifications']['Row']
export type NotificationInsert = Tables['notifications']['Insert']
export type NotificationUpdate = Tables['notifications']['Update']

// Referrals
export type Referral = Tables['referrals']['Row']
export type ReferralInsert = Tables['referrals']['Insert']
export type ReferralUpdate = Tables['referrals']['Update']

// Custom types for business logic
export type BetStatus = 'pending' | 'won' | 'lost' | 'cancelled'
export type GameRoundStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'
export type PaymentRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
export type PaymentRequestType = 'deposit' | 'withdrawal'
export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'bet'
  | 'win'
  | 'referral_reward'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'
export type NotificationType = 'system' | 'transaction' | 'game' | 'admin'
export type ReferralStatus = 'pending' | 'completed'
