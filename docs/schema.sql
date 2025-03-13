-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if needed (reverse order due to dependencies)
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS payment_requests CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS game_rounds CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  phone_number TEXT,
  balance DECIMAL(15, 2) DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID,
  telegram_id TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add self-reference for referred_by after table creation
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_referred_by FOREIGN KEY (referred_by) 
REFERENCES profiles(id) ON DELETE SET NULL;

-- Create game_rounds table
CREATE TABLE IF NOT EXISTS game_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  result TEXT,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  game_round_id UUID REFERENCES game_rounds(id) NOT NULL,
  chosen_number TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  potential_win DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'won', 'lost', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_requests table
CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  payment_details JSONB,
  proof_url TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bet', 'win', 'referral_reward')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  reference_id UUID,
  payment_request_id UUID REFERENCES payment_requests(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('system', 'transaction', 'game', 'admin')),
  is_read BOOLEAN DEFAULT FALSE,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) NOT NULL,
  referred_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  reward_amount DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
-- Bets indexes
CREATE INDEX IF NOT EXISTS idx_bets_profile_id ON bets(profile_id);
CREATE INDEX IF NOT EXISTS idx_bets_game_round_id ON bets(game_round_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_profile_id ON transactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Payment requests indexes
CREATE INDEX IF NOT EXISTS idx_payment_requests_profile_id ON payment_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_type ON payment_requests(type);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Game rounds indexes
CREATE INDEX IF NOT EXISTS idx_game_rounds_status ON game_rounds(status);
CREATE INDEX IF NOT EXISTS idx_game_rounds_start_time ON game_rounds(start_time);

-- Referrals indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Cập nhật bảng profiles để thêm trường notification_settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "game_notifications": true, "transaction_notifications": true, "system_notifications": true}';

-- Bảng admin_logs cho việc ghi log các thao tác của admin
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thêm cột is_blocked vào bảng profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
-- Thêm cột bio vào bảng profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;


-- Real-time notifications
-- Create notification_changes publication for notifications table
CREATE PUBLICATION notification_changes FOR TABLE notifications 
WITH (publish = 'insert');


-- Thêm bảng admin_sessions cho quản lý phiên đăng nhập
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  device_info JSONB,
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thêm bảng admin_preferences cho lưu trữ tùy chỉnh
CREATE TABLE IF NOT EXISTS admin_preferences (
  admin_id UUID REFERENCES profiles(id) PRIMARY KEY,
  theme TEXT DEFAULT 'system',
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  date_format TEXT DEFAULT 'dd/MM/yyyy',
  notification_settings JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "game_notifications": true, "transaction_notifications": true, "system_notifications": true}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_last_active ON admin_sessions(last_active);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);