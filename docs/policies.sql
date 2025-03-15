-- ==============================
-- XÓA TẤT CẢ POLICIES HIỆN TẠI
-- ==============================

-- Xóa policies trên bảng profiles
DROP POLICY IF EXISTS profiles_select_policy ON profiles;
DROP POLICY IF EXISTS profiles_insert_policy ON profiles;
DROP POLICY IF EXISTS profiles_update_policy ON profiles;
DROP POLICY IF EXISTS profiles_delete_policy ON profiles;

-- Xóa policies trên bảng game_rounds
DROP POLICY IF EXISTS game_rounds_select_policy ON game_rounds;
DROP POLICY IF EXISTS game_rounds_insert_policy ON game_rounds;
DROP POLICY IF EXISTS game_rounds_update_policy ON game_rounds;
DROP POLICY IF EXISTS game_rounds_delete_policy ON game_rounds;

-- Xóa policies trên bảng bets
DROP POLICY IF EXISTS bets_select_policy ON bets;
DROP POLICY IF EXISTS bets_insert_policy ON bets;
DROP POLICY IF EXISTS bets_update_policy ON bets;
DROP POLICY IF EXISTS bets_delete_policy ON bets;

-- Xóa policies trên bảng payment_requests
DROP POLICY IF EXISTS payment_requests_select_policy ON payment_requests;
DROP POLICY IF EXISTS payment_requests_insert_policy ON payment_requests;
DROP POLICY IF EXISTS payment_requests_update_policy ON payment_requests;
DROP POLICY IF EXISTS payment_requests_delete_policy ON payment_requests;

-- Xóa policies trên bảng transactions
DROP POLICY IF EXISTS transactions_select_policy ON transactions;
DROP POLICY IF EXISTS transactions_insert_policy ON transactions;
DROP POLICY IF EXISTS transactions_update_policy ON transactions;
DROP POLICY IF EXISTS transactions_delete_policy ON transactions;

-- Xóa policies trên bảng notifications
DROP POLICY IF EXISTS notifications_select_policy ON notifications;
DROP POLICY IF EXISTS notifications_insert_policy ON notifications;
DROP POLICY IF EXISTS notifications_update_policy ON notifications;
DROP POLICY IF EXISTS notifications_delete_policy ON notifications;

-- Xóa policies trên bảng referrals
DROP POLICY IF EXISTS referrals_select_policy ON referrals;
DROP POLICY IF EXISTS referrals_insert_policy ON referrals;
DROP POLICY IF EXISTS referrals_update_policy ON referrals;
DROP POLICY IF EXISTS referrals_delete_policy ON referrals;

-- Xóa policies trên bảng admin_logs
DROP POLICY IF EXISTS admin_logs_select_policy ON admin_logs;
DROP POLICY IF EXISTS admin_logs_insert_policy ON admin_logs;
DROP POLICY IF EXISTS admin_logs_update_policy ON admin_logs;
DROP POLICY IF EXISTS admin_logs_delete_policy ON admin_logs;

-- Xóa policies trên bảng admin_sessions
DROP POLICY IF EXISTS admin_sessions_select_policy ON admin_sessions;
DROP POLICY IF EXISTS admin_sessions_insert_policy ON admin_sessions;
DROP POLICY IF EXISTS admin_sessions_update_policy ON admin_sessions;
DROP POLICY IF EXISTS admin_sessions_delete_policy ON admin_sessions;

-- Xóa policies trên bảng admin_preferences
DROP POLICY IF EXISTS admin_preferences_select_policy ON admin_preferences;
DROP POLICY IF EXISTS admin_preferences_insert_policy ON admin_preferences;
DROP POLICY IF EXISTS admin_preferences_update_policy ON admin_preferences;
DROP POLICY IF EXISTS admin_preferences_delete_policy ON admin_preferences;

-- Xóa policies trên bảng telegram_verification
DROP POLICY IF EXISTS telegram_verification_select_policy ON telegram_verification;
DROP POLICY IF EXISTS telegram_verification_insert_policy ON telegram_verification;
DROP POLICY IF EXISTS telegram_verification_update_policy ON telegram_verification;
DROP POLICY IF EXISTS telegram_verification_delete_policy ON telegram_verification;

-- Xóa function auth.is_admin nếu đã tồn tại
DROP FUNCTION IF EXISTS auth.is_admin();

-- ==============================
-- ENABLE ROW LEVEL SECURITY
-- ==============================

-- Bật RLS cho tất cả các bảng
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_verification ENABLE ROW LEVEL SECURITY;

-- ==============================
-- HÀM BẢO MẬT KIỂM TRA ADMIN
-- ==============================

-- Tạo function để kiểm tra nếu người dùng hiện tại là admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  _is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO _is_admin FROM profiles
  WHERE id = auth.uid();
  
  RETURN coalesce(_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================
-- PROFILES TABLE POLICIES
-- ==============================

-- CHÍNH SÁCH XEM: Người dùng chỉ có thể xem profile của họ, admin có thể xem tất cả
CREATE POLICY profiles_select_policy ON profiles 
  FOR SELECT USING (
    auth.uid() = id OR auth.is_admin()
  );

-- CHÍNH SÁCH TẠO: Người dùng chỉ có thể tạo profile cho chính họ
CREATE POLICY profiles_insert_policy ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- CHÍNH SÁCH CẬP NHẬT: Người dùng chỉ có thể cập nhật profile của họ, admin có thể cập nhật bất kỳ profile nào
CREATE POLICY profiles_update_policy ON profiles 
  FOR UPDATE USING (
    auth.uid() = id OR auth.is_admin()
  );

-- CHÍNH SÁCH XÓA: Chỉ admin mới có thể xóa profile
CREATE POLICY profiles_delete_policy ON profiles 
  FOR DELETE USING (
    auth.is_admin()
  );

-- ==============================
-- GAME_ROUNDS TABLE POLICIES
-- ==============================

-- CHÍNH SÁCH XEM: Tất cả người dùng đều có thể xem game rounds
CREATE POLICY game_rounds_select_policy ON game_rounds 
  FOR SELECT USING (TRUE);

-- CHÍNH SÁCH TẠO/CẬP NHẬT/XÓA: Chỉ admin mới có thể quản lý game rounds
CREATE POLICY game_rounds_insert_policy ON game_rounds 
  FOR INSERT WITH CHECK (
    auth.is_admin()
  );

CREATE POLICY game_rounds_update_policy ON game_rounds 
  FOR UPDATE USING (
    auth.is_admin()
  );

CREATE POLICY game_rounds_delete_policy ON game_rounds 
  FOR DELETE USING (
    auth.is_admin()
  );

-- ==============================
-- BETS TABLE POLICIES
-- ==============================

-- CHÍNH SÁCH XEM: Người dùng chỉ có thể xem cược của họ, admin có thể xem tất cả
CREATE POLICY bets_select_policy ON bets 
  FOR SELECT USING (
    profile_id = auth.uid() OR auth.is_admin()
  );

-- CHÍNH SÁCH TẠO: Người dùng chỉ có thể tạo cược cho chính họ
CREATE POLICY bets_insert_policy ON bets 
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- CHÍNH SÁCH CẬP NHẬT: Người dùng không thể cập nhật cược, chỉ admin mới có thể
CREATE POLICY bets_update_policy ON bets 
  FOR UPDATE USING (
    auth.is_admin()
  );

-- CHÍNH SÁCH XÓA: Chỉ admin mới có thể xóa cược
CREATE POLICY bets_delete_policy ON bets 
  FOR DELETE USING (
    auth.is_admin()
  );

-- ==============================
-- PAYMENT_REQUESTS TABLE POLICIES
-- ==============================

-- CHÍNH SÁCH XEM: Người dùng chỉ có thể xem yêu cầu thanh toán của họ, admin có thể xem tất cả
CREATE POLICY payment_requests_select_policy ON payment_requests 
  FOR SELECT USING (
    profile_id = auth.uid() OR auth.is_admin()
  );

-- CHÍNH SÁCH TẠO: Người dùng chỉ có thể tạo yêu cầu thanh toán cho chính họ
CREATE POLICY payment_requests_insert_policy ON payment_requests 
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- CHÍNH SÁCH CẬP NHẬT: Người dùng có thể cập nhật yêu cầu thanh toán của họ nếu đang ở trạng thái 'pending'
-- Admin có thể cập nhật bất kỳ yêu cầu nào
CREATE POLICY payment_requests_update_policy ON payment_requests 
  FOR UPDATE USING (
    (profile_id = auth.uid() AND status = 'pending') OR auth.is_admin()
  );

-- CHÍNH SÁCH XÓA: Người dùng có thể xóa yêu cầu thanh toán của họ nếu đang ở trạng thái 'pending'
-- Admin có thể xóa bất kỳ yêu cầu nào
CREATE POLICY payment_requests_delete_policy ON payment_requests 
  FOR DELETE USING (
    (profile_id = auth.uid() AND status = 'pending') OR auth.is_admin()
  );

-- ==============================
-- TRANSACTIONS TABLE POLICIES
-- ==============================

-- CHÍNH SÁCH XEM: Người dùng chỉ có thể xem giao dịch của họ, admin có thể xem tất cả
CREATE POLICY transactions_select_policy ON transactions 
  FOR SELECT USING (
    profile_id = auth.uid() OR auth.is_admin()
  );

-- CHÍNH SÁCH TẠO/CẬP NHẬT/XÓA: Chỉ admin mới có thể quản lý giao dịch
CREATE POLICY transactions_insert_policy ON transactions 
  FOR INSERT WITH CHECK (
    auth.is_admin()
  );

CREATE POLICY transactions_update_policy ON transactions 
  FOR UPDATE USING (
    auth.is_admin()
  );

CREATE POLICY transactions_delete_policy ON transactions 
  FOR DELETE USING (
    auth.is_admin()
  );

-- ==============================
-- NOTIFICATIONS TABLE POLICIES
-- ==============================

-- CHÍNH SÁCH XEM: Người dùng chỉ có thể xem thông báo của họ, admin có thể xem tất cả
CREATE POLICY notifications_select_policy ON notifications 
  FOR SELECT USING (
    profile_id = auth.uid() OR auth.is_admin()
  );

-- CHÍNH SÁCH TẠO: Chỉ admin mới có thể tạo thông báo
CREATE POLICY notifications_insert_policy ON notifications 
  FOR INSERT WITH CHECK (
    auth.is_admin()
  );

-- CHÍNH SÁCH CẬP NHẬT: Người dùng có thể cập nhật thông báo của họ (chỉ trạng thái đọc)
-- Admin có thể cập nhật bất kỳ thông báo nào
CREATE POLICY notifications_update_policy ON notifications 
  FOR UPDATE USING (
    profile_id = auth.uid() OR auth.is_admin()
  );

-- CHÍNH SÁCH XÓA: Chỉ admin mới có thể xóa thông báo
CREATE POLICY notifications_delete_policy ON notifications 
  FOR DELETE USING (
    auth.is_admin()
  );

-- ==============================
-- REFERRALS TABLE POLICIES
-- ==============================

-- CHÍNH SÁCH XEM: Người dùng chỉ có thể xem các giới thiệu liên quan đến họ, admin có thể xem tất cả
CREATE POLICY referrals_select_policy ON referrals 
  FOR SELECT USING (
    referrer_id = auth.uid() OR referred_id = auth.uid() OR auth.is_admin()
  );

-- CHÍNH SÁCH TẠO/CẬP NHẬT/XÓA: Chỉ admin mới có thể quản lý giới thiệu
CREATE POLICY referrals_insert_policy ON referrals 
  FOR INSERT WITH CHECK (
    auth.is_admin()
  );

CREATE POLICY referrals_update_policy ON referrals 
  FOR UPDATE USING (
    auth.is_admin()
  );

CREATE POLICY referrals_delete_policy ON referrals 
  FOR DELETE USING (
    auth.is_admin()
  );

-- ==============================
-- ADMIN_LOGS TABLE POLICIES
-- ==============================

-- Chỉ admin mới có thể truy cập admin_logs
CREATE POLICY admin_logs_select_policy ON admin_logs 
  FOR SELECT USING (
    auth.is_admin()
  );

CREATE POLICY admin_logs_insert_policy ON admin_logs 
  FOR INSERT WITH CHECK (
    auth.is_admin()
  );

-- Admin không thể cập nhật hoặc xóa logs (để đảm bảo tính toàn vẹn của audit)
CREATE POLICY admin_logs_update_policy ON admin_logs 
  FOR UPDATE USING (FALSE);

CREATE POLICY admin_logs_delete_policy ON admin_logs 
  FOR DELETE USING (FALSE);

-- ==============================
-- ADMIN_SESSIONS TABLE POLICIES
-- ==============================

-- Admin chỉ có thể xem các phiên của họ
CREATE POLICY admin_sessions_select_policy ON admin_sessions 
  FOR SELECT USING (
    (admin_id = auth.uid() AND auth.is_admin())
  );

-- Admin chỉ có thể tạo các phiên cho chính họ
CREATE POLICY admin_sessions_insert_policy ON admin_sessions 
  FOR INSERT WITH CHECK (
    admin_id = auth.uid() AND auth.is_admin()
  );

-- Admin chỉ có thể cập nhật các phiên của họ
CREATE POLICY admin_sessions_update_policy ON admin_sessions 
  FOR UPDATE USING (
    admin_id = auth.uid() AND auth.is_admin()
  );

-- Admin chỉ có thể xóa các phiên của họ
CREATE POLICY admin_sessions_delete_policy ON admin_sessions 
  FOR DELETE USING (
    admin_id = auth.uid() AND auth.is_admin()
  );

-- ==============================
-- ADMIN_PREFERENCES TABLE POLICIES
-- ==============================

-- Admin chỉ có thể xem, tạo và cập nhật tùy chọn của họ
CREATE POLICY admin_preferences_select_policy ON admin_preferences 
  FOR SELECT USING (
    admin_id = auth.uid() AND auth.is_admin()
  );

CREATE POLICY admin_preferences_insert_policy ON admin_preferences 
  FOR INSERT WITH CHECK (
    admin_id = auth.uid() AND auth.is_admin()
  );

CREATE POLICY admin_preferences_update_policy ON admin_preferences 
  FOR UPDATE USING (
    admin_id = auth.uid() AND auth.is_admin()
  );

CREATE POLICY admin_preferences_delete_policy ON admin_preferences 
  FOR DELETE USING (
    admin_id = auth.uid() AND auth.is_admin()
  );

-- ==============================
-- TELEGRAM_VERIFICATION TABLE POLICIES
-- ==============================

-- CHÍNH SÁCH XEM: Người dùng chỉ có thể xem xác thực của họ, admin có thể xem tất cả
CREATE POLICY telegram_verification_select_policy ON telegram_verification 
  FOR SELECT USING (
    profile_id = auth.uid() OR auth.is_admin()
  );

-- CHÍNH SÁCH TẠO: Người dùng chỉ có thể tạo xác thực cho chính họ
CREATE POLICY telegram_verification_insert_policy ON telegram_verification 
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- CHÍNH SÁCH CẬP NHẬT: Người dùng có thể cập nhật xác thực của họ
-- Admin có thể cập nhật bất kỳ xác thực nào
CREATE POLICY telegram_verification_update_policy ON telegram_verification 
  FOR UPDATE USING (
    profile_id = auth.uid() OR auth.is_admin()
  );

-- CHÍNH SÁCH XÓA: Người dùng có thể xóa xác thực của họ
-- Admin có thể xóa bất kỳ xác thực nào
CREATE POLICY telegram_verification_delete_policy ON telegram_verification 
  FOR DELETE USING (
    profile_id = auth.uid() OR auth.is_admin()
  );

-- Xóa policies nếu đã tồn tại
DROP POLICY IF EXISTS telegram_stats_select_policy ON telegram_stats;
DROP POLICY IF EXISTS telegram_stats_insert_policy ON telegram_stats;
DROP POLICY IF EXISTS telegram_stats_update_policy ON telegram_stats;
DROP POLICY IF EXISTS telegram_stats_delete_policy ON telegram_stats;

-- Chỉ admin mới có thể xem thống kê
CREATE POLICY telegram_stats_select_policy ON telegram_stats
  FOR SELECT USING (auth.is_admin());

-- Chỉ admin mới có thể thêm thống kê
CREATE POLICY telegram_stats_insert_policy ON telegram_stats
  FOR INSERT WITH CHECK (auth.is_admin());

-- Chỉ admin mới có thể cập nhật thống kê
CREATE POLICY telegram_stats_update_policy ON telegram_stats
  FOR UPDATE USING (auth.is_admin());

-- Chỉ admin mới có thể xóa thống kê
CREATE POLICY telegram_stats_delete_policy ON telegram_stats
  FOR DELETE USING (auth.is_admin());


-- Cập nhật policy hiện tại
DROP POLICY IF EXISTS bets_select_policy ON bets;
CREATE POLICY bets_select_policy ON bets 
  FOR SELECT USING (
    profile_id = auth.uid() OR auth.is_admin() OR EXISTS (
      -- Allow viewing all bets for leaderboard display
      SELECT 1 FROM game_rounds gr
      WHERE gr.id = game_round_id
    )
  );


-- Cập nhật policy cho profiles để cho phép xem thông tin cơ bản cho leaderboard
DROP POLICY IF EXISTS profiles_select_policy ON profiles;
CREATE POLICY profiles_select_policy ON profiles 
  FOR SELECT USING (
    -- Người dùng có thể thấy profile của họ
    id = auth.uid() 
    -- Admin thấy tất cả
    OR auth.is_admin() 
    -- Cho phép xem những thông tin cơ bản của các profile khác
    OR EXISTS (
      SELECT 1 FROM bets b
      WHERE b.profile_id = profiles.id
    )
  );