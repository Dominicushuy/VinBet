-- ============================================================================  
-- PHẦN 1: CÀI ĐẶT EXTENSIONS VÀ KHỞI TẠO  
-- ============================================================================  

/**  
 * Bật UUID extension để hỗ trợ kiểu dữ liệu UUID  
 * UUID được sử dụng làm ID chính cho tất cả các bảng để đảm bảo tính duy nhất  
 * và an toàn hơn so với số tự tăng  
 */  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  

-- ============================================================================  
-- PHẦN 2: XÓA BẢNG HIỆN TẠI (NẾU CẦN)  
-- ============================================================================  

/**  
 * Lưu ý: Xóa các bảng theo thứ tự ngược để tránh lỗi ràng buộc khóa ngoại  
 * Chỉ sử dụng khi cần thiết kế lại database từ đầu  
 * Sẽ gây mất dữ liệu, sử dụng cẩn thận  
 */  
DROP TABLE IF EXISTS referrals CASCADE;  
DROP TABLE IF EXISTS notifications CASCADE;  
DROP TABLE IF EXISTS transactions CASCADE;  
DROP TABLE IF EXISTS payment_requests CASCADE;  
DROP TABLE IF EXISTS bets CASCADE;  
DROP TABLE IF EXISTS game_rounds CASCADE;  
DROP TABLE IF EXISTS telegram_verification CASCADE;  
DROP TABLE IF EXISTS admin_logs CASCADE;  
DROP TABLE IF EXISTS admin_sessions CASCADE;  
DROP TABLE IF EXISTS admin_preferences CASCADE;  
DROP TABLE IF EXISTS profiles CASCADE;  

-- ============================================================================  
-- PHẦN 3: TẠO CÁC BẢNG CHÍNH  
-- ============================================================================  

/**  
 * Bảng profiles - Lưu thông tin người dùng  
 * Kết nối với bảng auth.users của Supabase Auth  
 * Mỗi người dùng đăng ký sẽ có một bản ghi tương ứng trong bảng này  
 */  
CREATE TABLE IF NOT EXISTS profiles (  
  -- Thông tin cơ bản  
  id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,  
  username TEXT UNIQUE,  
  display_name TEXT,  
  email TEXT UNIQUE,  
  avatar_url TEXT,  
  phone_number TEXT,  
  bio TEXT,  
  
  -- Thông tin tài chính  
  balance DECIMAL(15, 2) DEFAULT 0,  
  
  -- Thông tin giới thiệu  
  referral_code TEXT UNIQUE,  
  referred_by UUID,  
  
  -- Thông tin Telegram  
  telegram_id TEXT,  
  telegram_username TEXT,  
  telegram_connected_at TIMESTAMPTZ,  
  
  -- Quyền và trạng thái  
  is_admin BOOLEAN DEFAULT FALSE,  
  is_blocked BOOLEAN DEFAULT FALSE,  
  
  -- Cài đặt thông báo  
  notification_settings JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "game_notifications": true, "transaction_notifications": true, "system_notifications": true}',  
  telegram_settings JSONB DEFAULT '{"receive_win_notifications": true, "receive_deposit_notifications": true, "receive_withdrawal_notifications": true, "receive_login_alerts": true, "receive_system_notifications": true}',  
  
  -- Thời gian  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);  

/**  
 * Tham chiếu tự thân cho referred_by  
 * Không thể thêm trực tiếp khi tạo bảng vì tại thời điểm đó bảng chưa tồn tại  
 */  
ALTER TABLE profiles   
ADD CONSTRAINT fk_profiles_referred_by FOREIGN KEY (referred_by)   
REFERENCES profiles(id) ON DELETE SET NULL;  

/**  
 * Bảng game_rounds - Lưu thông tin về các vòng chơi  
 * Mỗi vòng chơi sẽ có nhiều lượt cược từ người dùng  
 */  
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

/**  
 * Bảng bets - Lưu thông tin cược của người dùng  
 * Mỗi lượt cược thuộc về một vòng chơi và một người dùng  
 */  
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

/**  
 * Bảng payment_requests - Lưu thông tin yêu cầu nạp/rút tiền  
 * Người dùng có thể tạo yêu cầu nạp/rút, admin xác nhận và xử lý  
 */  
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

/**  
 * Bảng transactions - Lưu lịch sử giao dịch  
 * Theo dõi tất cả các thay đổi số dư: nạp, rút, đặt cược, thắng, thưởng giới thiệu  
 */  
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

/**  
 * Bảng notifications - Lưu thông báo cho người dùng  
 * Thông báo có thể là từ hệ thống, liên quan đến giao dịch, trò chơi hoặc từ admin  
 */  
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

/**  
 * Bảng referrals - Lưu thông tin giới thiệu  
 * Theo dõi ai đã giới thiệu ai và trạng thái thưởng  
 */  
CREATE TABLE IF NOT EXISTS referrals (  
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  referrer_id UUID REFERENCES profiles(id) NOT NULL,  
  referred_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,  
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',  
  reward_amount DECIMAL(15, 2),  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);  

/**  
 * Bảng admin_logs - Lưu nhật ký hoạt động của admin  
 * Ghi lại tất cả các hành động quan trọng của admin để kiểm tra sau này  
 */  
CREATE TABLE IF NOT EXISTS admin_logs (  
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  admin_id UUID REFERENCES profiles(id) NOT NULL,  
  action TEXT NOT NULL,  
  entity_type TEXT NOT NULL,  
  entity_id UUID NOT NULL,  
  details JSONB,  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);  

/**  
 * Bảng admin_sessions - Quản lý phiên đăng nhập của admin  
 * Theo dõi thiết bị, địa điểm, IP của admin khi đăng nhập  
 */  
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

/**  
 * Bảng admin_preferences - Lưu tùy chỉnh của admin  
 * Cho phép admin tùy chỉnh giao diện, múi giờ và cài đặt thông báo  
 */  
CREATE TABLE IF NOT EXISTS admin_preferences (  
  admin_id UUID REFERENCES profiles(id) PRIMARY KEY,  
  theme TEXT DEFAULT 'system',  
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',  
  date_format TEXT DEFAULT 'dd/MM/yyyy',  
  notification_settings JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "game_notifications": true, "transaction_notifications": true, "system_notifications": true}',  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);  

/**  
 * Bảng telegram_verification - Xác thực tài khoản Telegram  
 * Lưu mã xác thực tạm thời để liên kết tài khoản Telegram với hệ thống  
 */  
CREATE TABLE IF NOT EXISTS telegram_verification (  
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  profile_id UUID REFERENCES profiles(id) NOT NULL,  
  code VARCHAR(8) UNIQUE NOT NULL,  
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,  
  is_used BOOLEAN DEFAULT FALSE,  
  used_at TIMESTAMP WITH TIME ZONE,  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);  

-- ============================================================================  
-- PHẦN 4: TẠO CÁC CHỈ MỤC (INDEXES)  
-- ============================================================================  

-- Indexes cho bảng profiles  
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id);  
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);  
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);  

-- Indexes cho bảng bets  
CREATE INDEX IF NOT EXISTS idx_bets_profile_id ON bets(profile_id);  
CREATE INDEX IF NOT EXISTS idx_bets_game_round_id ON bets(game_round_id);  
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);  

-- Indexes cho bảng transactions  
CREATE INDEX IF NOT EXISTS idx_transactions_profile_id ON transactions(profile_id);  
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);  
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);  
CREATE INDEX IF NOT EXISTS idx_transactions_payment_request_id ON transactions(payment_request_id);  

-- Indexes cho bảng payment_requests  
CREATE INDEX IF NOT EXISTS idx_payment_requests_profile_id ON payment_requests(profile_id);  
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);  
CREATE INDEX IF NOT EXISTS idx_payment_requests_type ON payment_requests(type);  

-- Indexes cho bảng notifications  
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);  
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);  
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);  

-- Indexes cho bảng game_rounds  
CREATE INDEX IF NOT EXISTS idx_game_rounds_status ON game_rounds(status);  
CREATE INDEX IF NOT EXISTS idx_game_rounds_start_time ON game_rounds(start_time);  
CREATE INDEX IF NOT EXISTS idx_game_rounds_created_by ON game_rounds(created_by);  

-- Indexes cho bảng referrals  
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);  
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);  
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);  

-- Indexes cho bảng admin_logs  
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);  
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);  
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);  
CREATE INDEX IF NOT EXISTS idx_admin_logs_entity_type ON admin_logs(entity_type);  

-- Indexes cho bảng admin_sessions  
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);  
CREATE INDEX IF NOT EXISTS idx_admin_sessions_last_active ON admin_sessions(last_active);  
CREATE INDEX IF NOT EXISTS idx_admin_sessions_is_current ON admin_sessions(is_current);  

-- Indexes cho bảng telegram_verification  
CREATE INDEX IF NOT EXISTS idx_telegram_verification_code ON telegram_verification(code);  
CREATE INDEX IF NOT EXISTS idx_telegram_verification_profile_id ON telegram_verification(profile_id);  
CREATE INDEX IF NOT EXISTS idx_telegram_verification_expires_at ON telegram_verification(expires_at); 