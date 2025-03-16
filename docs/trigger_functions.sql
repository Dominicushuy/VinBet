-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_bet_created ON bets;
DROP TRIGGER IF EXISTS on_game_round_completed ON game_rounds;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_balance_on_bet();
DROP FUNCTION IF EXISTS complete_game_round();

-- Function to update balance when a bet is placed
CREATE OR REPLACE FUNCTION update_balance_on_bet()
RETURNS TRIGGER AS $$
DECLARE
  v_balance DECIMAL(15, 2);
BEGIN
  -- Khóa row và đọc số dư để tránh race condition
  SELECT balance INTO v_balance FROM profiles 
  WHERE id = NEW.profile_id 
  FOR UPDATE;
  
  IF v_balance < NEW.amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Cập nhật số dư
  UPDATE profiles
  SET 
    balance = balance - NEW.amount,
    updated_at = NOW()
  WHERE id = NEW.profile_id;
  
  -- Tạo giao dịch
  INSERT INTO transactions (
    profile_id,
    amount,
    type,
    status,
    reference_id,
    description
  ) VALUES (
    NEW.profile_id,
    -NEW.amount,
    'bet',
    'completed',
    NEW.id,
    'Bet placed on game round ' || NEW.game_round_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for when a bet is created
CREATE TRIGGER on_bet_created
AFTER INSERT ON bets
FOR EACH ROW
EXECUTE FUNCTION update_balance_on_bet();

-- Function to complete a game round and process results (tối ưu hóa batch)
CREATE OR REPLACE FUNCTION complete_game_round()
RETURNS TRIGGER AS $$
BEGIN
  -- Chỉ xử lý khi trạng thái chuyển sang completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.result IS NOT NULL THEN
    -- Tạo bảng tạm để lưu thông tin các cược thắng
    CREATE TEMPORARY TABLE temp_winning_bets ON COMMIT DROP AS
    SELECT id, profile_id, potential_win
    FROM bets
    WHERE 
      game_round_id = NEW.id 
      AND status = 'pending'
      AND chosen_number = NEW.result;
      
    -- Cập nhật trạng thái cược thắng
    UPDATE bets
    SET 
      status = 'won',
      updated_at = NOW()
    WHERE id IN (SELECT id FROM temp_winning_bets);
    
    -- Cộng tiền thắng vào số dư người dùng
    UPDATE profiles p
    SET 
      balance = p.balance + twb.potential_win,
      updated_at = NOW()
    FROM temp_winning_bets twb
    WHERE p.id = twb.profile_id;

    -- Tạo giao dịch cho tất cả người thắng
    INSERT INTO transactions (
      profile_id,
      amount,
      type,
      status,
      reference_id,
      description
    )
    SELECT 
      profile_id,
      potential_win,
      'win',
      'completed',
      id,
      'Win from game round ' || NEW.id
    FROM temp_winning_bets;

    -- Tạo thông báo cho tất cả người thắng
    INSERT INTO notifications (
      profile_id,
      title,
      content,
      type,
      reference_id
    )
    SELECT 
      profile_id,
      'You won!',
      'Chúc mừng! Bạn đã thắng ' || potential_win || ' từ lượt chơi.',
      'game',
      NEW.id
    FROM temp_winning_bets;
    
    -- Cập nhật tất cả cược thua trong một query
    UPDATE bets
    SET 
      status = 'lost',
      updated_at = NOW()
    WHERE 
      game_round_id = NEW.id 
      AND status = 'pending'
      AND chosen_number != NEW.result;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for when a game round is completed
CREATE TRIGGER on_game_round_completed
AFTER UPDATE ON game_rounds
FOR EACH ROW
EXECUTE FUNCTION complete_game_round();

-- Function to handle withdrawal request creation
CREATE OR REPLACE FUNCTION process_withdrawal_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for new withdrawal requests
  IF NEW.type = 'withdrawal' AND NEW.status = 'pending' THEN
    -- Check if user has sufficient balance
    IF (SELECT balance FROM profiles WHERE id = NEW.profile_id) < NEW.amount THEN
      RAISE EXCEPTION 'Insufficient balance for withdrawal';
    END IF;
    
    -- Deduct amount from user balance
    UPDATE profiles
    SET 
      balance = balance - NEW.amount,
      updated_at = NOW()
    WHERE id = NEW.profile_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for withdrawal request creation
DROP TRIGGER IF EXISTS on_withdrawal_request_created ON payment_requests;
CREATE TRIGGER on_withdrawal_request_created
AFTER INSERT ON payment_requests
FOR EACH ROW
EXECUTE FUNCTION process_withdrawal_request();

-- Function to process referral when a user signs up with a referral code
CREATE OR REPLACE FUNCTION process_referral()
RETURNS TRIGGER AS $$
DECLARE
  referrer_id UUID;
  reward_amount DECIMAL(15, 2) := 10.00; -- Giá trị mặc định cố định
BEGIN
  -- Kiểm tra nếu người dùng được giới thiệu
  IF NEW.referred_by IS NOT NULL THEN
    referrer_id := NEW.referred_by;
    
    -- Kiểm tra người giới thiệu tồn tại
    PERFORM id FROM profiles WHERE id = referrer_id;
    IF NOT FOUND THEN
      RAISE WARNING 'Referrer with ID % does not exist', referrer_id;
      RETURN NEW;
    END IF;
    
    -- Ngăn chặn tự giới thiệu
    IF referrer_id = NEW.id THEN
      RAISE EXCEPTION 'Self-referral is not allowed: %', NEW.id;
    END IF;
    
    -- Tạo record giới thiệu
    INSERT INTO referrals (
      referrer_id,
      referred_id,
      status,
      reward_amount,
      created_at,
      updated_at
    ) VALUES (
      referrer_id,
      NEW.id,
      'pending',
      reward_amount,
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for referral processing
DROP TRIGGER IF EXISTS on_new_referred_user ON profiles;
CREATE TRIGGER on_new_referred_user
AFTER INSERT ON profiles
FOR EACH ROW
WHEN (NEW.referred_by IS NOT NULL)
EXECUTE FUNCTION process_referral();

-- Function to complete referral and give reward when referred user makes first deposit 
CREATE OR REPLACE FUNCTION complete_referral_on_deposit()
RETURNS TRIGGER AS $$
DECLARE
  ref_record RECORD;
  referrer_id UUID;
BEGIN
  -- Only process for approved deposits
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.type = 'deposit' THEN
    -- Check if this user has a pending referral
    SELECT * INTO ref_record 
    FROM referrals 
    WHERE referred_id = NEW.profile_id AND status = 'pending'
    LIMIT 1;
    
    IF FOUND THEN
      referrer_id := ref_record.referrer_id;
      
      -- Update referral status to completed
      UPDATE referrals
      SET 
        status = 'completed',
        updated_at = NOW()
      WHERE id = ref_record.id;
      
      -- Give reward to referrer
      UPDATE profiles
      SET 
        balance = balance + ref_record.reward_amount,
        updated_at = NOW()
      WHERE id = referrer_id;
      
      -- Create transaction for referral reward
      INSERT INTO transactions (
        profile_id,
        amount,
        type,
        status,
        reference_id,
        description
      ) VALUES (
        referrer_id,
        ref_record.reward_amount,
        'referral_reward',
        'completed',
        ref_record.id,
        'Thưởng giới thiệu người dùng ' || NEW.profile_id
      );
      
      -- Create notification for referrer (fixed to Vietnamese)
      INSERT INTO notifications (
        profile_id,
        title,
        content,
        type,
        reference_id
      ) VALUES (
        referrer_id,
        'Thưởng Giới Thiệu',
        'Bạn đã nhận ' || ref_record.reward_amount || '₫ tiền thưởng từ chương trình giới thiệu!',
        'system',
        ref_record.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for completing referrals on deposit
DROP TRIGGER IF EXISTS on_deposit_complete_referral ON payment_requests;
CREATE TRIGGER on_deposit_complete_referral
AFTER UPDATE ON payment_requests
FOR EACH ROW
EXECUTE FUNCTION complete_referral_on_deposit();

-- Function để validation thông tin profile trước khi update
CREATE OR REPLACE FUNCTION validate_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Validation cho username (không chứa ký tự đặc biệt)
  IF NEW.username ~ '[^a-zA-Z0-9_]' THEN
    RAISE EXCEPTION 'Username chỉ được chứa chữ cái, số và dấu gạch dưới';
  END IF;
  
  -- Validation cho phone_number (chỉ chứa số)
  IF NEW.phone_number IS NOT NULL AND NEW.phone_number ~ '[^0-9+]' THEN
    RAISE EXCEPTION 'Số điện thoại chỉ được chứa số và dấu +';
  END IF;
  
  -- Không cho phép un-admin chính mình
  IF OLD.is_admin = TRUE AND NEW.is_admin = FALSE AND auth.uid() = NEW.id THEN
    RAISE EXCEPTION 'Không thể tự bỏ quyền admin của chính mình';
  END IF;
  
  -- Cập nhật updated_at
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger cho validation profile
DROP TRIGGER IF EXISTS on_profile_update ON profiles;
CREATE TRIGGER on_profile_update
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION validate_user_profile();

-- Function để tạo game round mới
CREATE OR REPLACE FUNCTION create_game_round(
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID
) RETURNS UUID AS $$
DECLARE
  new_game_round_id UUID;
BEGIN
  -- Validate input
  IF start_time >= end_time THEN
    RAISE EXCEPTION 'End time must be after start time';
  END IF;

  -- Insert new game round
  INSERT INTO game_rounds (
    start_time,
    end_time,
    status,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    start_time,
    end_time,
    'scheduled',
    created_by,
    NOW(),
    NOW()
  ) RETURNING id INTO new_game_round_id;

  RETURN new_game_round_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để cập nhật trạng thái game round
CREATE OR REPLACE FUNCTION update_game_round_status(
  game_round_id UUID,
  new_status TEXT,
  game_result TEXT DEFAULT NULL
) RETURNS SETOF game_rounds AS $$
DECLARE
  valid_statuses TEXT[] := ARRAY['scheduled', 'active', 'completed', 'cancelled'];
BEGIN
  -- Validate status
  IF NOT (new_status = ANY(valid_statuses)) THEN
    RAISE EXCEPTION 'Invalid status. Must be one of: scheduled, active, completed, cancelled';
  END IF;

  -- Validate result when status is completed
  IF new_status = 'completed' AND game_result IS NULL THEN
    RAISE EXCEPTION 'Result is required when status is completed';
  END IF;

  -- Update game round
  RETURN QUERY
  UPDATE game_rounds
  SET 
    status = new_status,
    result = CASE WHEN new_status = 'completed' THEN game_result ELSE result END,
    updated_at = NOW()
  WHERE id = game_round_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để lấy danh sách game rounds theo bộ lọc
-- Cập nhật function để lấy danh sách game rounds với thêm thông tin về cược
CREATE OR REPLACE FUNCTION get_game_rounds(
  status_filter TEXT DEFAULT NULL,
  from_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  to_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  result TEXT,
  status TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  bets_count BIGINT,            -- Thêm trường thông tin số lượng cược
  total_amount DECIMAL(15, 2),  -- Thêm trường thông tin tổng tiền cược
  total_count BIGINT
) AS $$
DECLARE
  offset_val INTEGER;
BEGIN
  offset_val := (page_number - 1) * page_size;

  RETURN QUERY
  SELECT 
    gr.id,
    gr.start_time,
    gr.end_time,
    gr.result,
    gr.status,
    gr.created_by,
    gr.created_at,
    gr.updated_at,
    COALESCE(bets_summary.bet_count, 0) AS bets_count,   -- Lấy số lượng cược
    COALESCE(bets_summary.bet_amount, 0) AS total_amount, -- Lấy tổng tiền cược
    COUNT(*) OVER() AS total_count
  FROM 
    game_rounds gr
  -- Left join với subquery tính toán số lượng và tổng tiền cược
  LEFT JOIN (
    SELECT 
      game_round_id,
      COUNT(*) as bet_count,
      SUM(amount) as bet_amount
    FROM bets
    GROUP BY game_round_id
  ) AS bets_summary ON gr.id = bets_summary.game_round_id
  WHERE
    (status_filter IS NULL OR gr.status = status_filter)
    AND (from_date IS NULL OR gr.start_time >= from_date)
    AND (to_date IS NULL OR gr.start_time <= to_date)
  ORDER BY
    gr.start_time DESC
  LIMIT
    page_size
  OFFSET
    offset_val;
END;
$$ LANGUAGE plpgsql;

-- Function to place a bet
CREATE OR REPLACE FUNCTION place_bet(
  p_profile_id UUID,
  p_game_round_id UUID,
  p_chosen_number TEXT,
  p_amount DECIMAL(15, 2)
)
RETURNS UUID AS $$
DECLARE
  v_game_status TEXT;
  v_potential_win DECIMAL(15, 2);
  v_user_balance DECIMAL(15, 2);
  v_new_bet_id UUID;
  v_multiplier DECIMAL(15, 2) := 9.0; -- Giá trị cố định
  v_min_bet_amount DECIMAL(15, 2) := 1.00;
  v_max_bet_amount DECIMAL(15, 2) := 10000000.00;
BEGIN
  -- Validation đầu vào
  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile ID cannot be null';
  END IF;
  
  IF p_game_round_id IS NULL THEN
    RAISE EXCEPTION 'Game round ID cannot be null';
  END IF;
  
  IF p_chosen_number IS NULL OR p_chosen_number = '' THEN
    RAISE EXCEPTION 'Chosen number cannot be null or empty';
  END IF;
  
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Bet amount must be greater than zero';
  END IF;
  
  IF p_amount < v_min_bet_amount THEN
    RAISE EXCEPTION 'Bet amount must be at least %', v_min_bet_amount;
  END IF;
  
  IF p_amount > v_max_bet_amount THEN
    RAISE EXCEPTION 'Bet amount cannot exceed %', v_max_bet_amount;
  END IF;

  -- Transaction block
  BEGIN
    -- Kiểm tra game round
    SELECT status INTO v_game_status
    FROM game_rounds
    WHERE id = p_game_round_id
    FOR UPDATE;
    
    IF v_game_status IS NULL THEN
      RAISE EXCEPTION 'Game round not found';
    END IF;
    
    IF v_game_status != 'active' THEN
      RAISE EXCEPTION 'Game round is not active for betting (status: %)', v_game_status;
    END IF;
    
    -- Kiểm tra số dư
    SELECT balance INTO v_user_balance
    FROM profiles
    WHERE id = p_profile_id
    FOR UPDATE;
    
    IF v_user_balance IS NULL THEN
      RAISE EXCEPTION 'User profile not found';
    END IF;
    
    IF v_user_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient balance. Current: %, required: %', v_user_balance, p_amount;
    END IF;
    
    -- Tính tiền thắng tiềm năng
    v_potential_win := p_amount * v_multiplier;
    
    -- Tạo cược
    INSERT INTO bets (
      profile_id,
      game_round_id,
      chosen_number,
      amount,
      potential_win,
      status,
      created_at,
      updated_at
    ) VALUES (
      p_profile_id,
      p_game_round_id,
      p_chosen_number,
      p_amount,
      v_potential_win,
      'pending',
      NOW(),
      NOW()
    ) RETURNING id INTO v_new_bet_id;
    
    RETURN v_new_bet_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user bets with filters
CREATE OR REPLACE FUNCTION get_user_bets(
  p_profile_id UUID,
  p_game_round_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_page_number INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  profile_id UUID,
  game_round_id UUID,
  chosen_number TEXT,
  amount DECIMAL(15, 2),
  potential_win DECIMAL(15, 2),
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  game_status TEXT,
  game_result TEXT,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INTEGER;
BEGIN
  offset_val := (p_page_number - 1) * p_page_size;

  RETURN QUERY
  SELECT 
    b.id,
    b.profile_id,
    b.game_round_id,
    b.chosen_number,
    b.amount,
    b.potential_win,
    b.status,
    b.created_at,
    b.updated_at,
    gr.status AS game_status,
    gr.result AS game_result,
    COUNT(*) OVER() AS total_count
  FROM 
    bets b
    JOIN game_rounds gr ON b.game_round_id = gr.id
  WHERE
    b.profile_id = p_profile_id
    AND (p_game_round_id IS NULL OR b.game_round_id = p_game_round_id)
    AND (p_status IS NULL OR b.status = p_status)
  ORDER BY
    b.created_at DESC
  LIMIT
    p_page_size
  OFFSET
    offset_val;
END;
$$ LANGUAGE plpgsql;

-- Function để lấy thống kê cược cho một lượt chơi
CREATE OR REPLACE FUNCTION get_bet_statistics_for_game(
  p_game_round_id UUID
)
RETURNS TABLE (
  total_bets BIGINT,
  winning_bets BIGINT,
  total_bet_amount DECIMAL(15, 2),
  total_win_amount DECIMAL(15, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_bets,
    COUNT(CASE WHEN status = 'won' THEN 1 END)::BIGINT as winning_bets,
    COALESCE(SUM(amount), 0) as total_bet_amount,
    COALESCE(SUM(CASE WHEN status = 'won' THEN potential_win ELSE 0 END), 0) as total_win_amount
  FROM 
    bets
  WHERE
    game_round_id = p_game_round_id;
END;
$$ LANGUAGE plpgsql;

-- Function để tạo payment request
CREATE OR REPLACE FUNCTION create_payment_request(
  p_profile_id UUID,
  p_amount DECIMAL(15, 2),
  p_type TEXT,
  p_payment_method TEXT,
  p_payment_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_request_id UUID;
BEGIN
  -- Validate input
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0';
  END IF;
  
  IF p_type NOT IN ('deposit', 'withdrawal') THEN
    RAISE EXCEPTION 'Type must be either deposit or withdrawal';
  END IF;
  
  -- Validate balance for withdrawal
  IF p_type = 'withdrawal' THEN
    IF (SELECT balance FROM profiles WHERE id = p_profile_id) < p_amount THEN
      RAISE EXCEPTION 'Insufficient balance for withdrawal';
    END IF;
  END IF;
  
  -- Insert new payment request
  INSERT INTO payment_requests (
    profile_id,
    amount,
    type,
    status,
    payment_method,
    payment_details,
    created_at,
    updated_at
  ) VALUES (
    p_profile_id,
    p_amount,
    p_type,
    'pending',
    p_payment_method,
    p_payment_details,
    NOW(),
    NOW()
  ) RETURNING id INTO new_request_id;
  
  -- Create notification
  INSERT INTO notifications (
    profile_id,
    title,
    content,
    type,
    reference_id
  ) VALUES (
    p_profile_id,
    CASE WHEN p_type = 'deposit' THEN 'Yêu cầu nạp tiền đã được tạo' ELSE 'Yêu cầu rút tiền đã được tạo' END,
    CASE WHEN p_type = 'deposit' 
      THEN 'Yêu cầu nạp ' || p_amount || ' đang chờ xác nhận.' 
      ELSE 'Yêu cầu rút ' || p_amount || ' đang chờ xác nhận.' 
    END,
    'transaction',
    new_request_id
  );
  
  RETURN new_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để phê duyệt payment request với transaction
CREATE OR REPLACE FUNCTION approve_payment_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_request_type TEXT;
  v_profile_id UUID;
  v_amount DECIMAL(15, 2);
BEGIN
  -- Sử dụng transaction để đảm bảo tính nhất quán
  BEGIN
    -- Khóa row để tránh race condition
    SELECT type, profile_id, amount INTO v_request_type, v_profile_id, v_amount
    FROM payment_requests
    WHERE id = p_request_id AND status = 'pending'
    FOR UPDATE;
    
    IF v_request_type IS NULL THEN
      RAISE EXCEPTION 'Payment request not found or not in pending status';
    END IF;
    
    -- Update payment request status
    UPDATE payment_requests
    SET 
      status = 'approved',
      approved_by = p_admin_id,
      approved_at = NOW(),
      notes = p_notes,
      updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Cập nhật số dư nếu là deposit, withdrawal được handle bởi trigger
    IF v_request_type = 'deposit' THEN
      UPDATE profiles
      SET 
        balance = balance + v_amount,
        updated_at = NOW()
      WHERE id = v_profile_id;
      
      -- Tạo giao dịch
      INSERT INTO transactions (
        profile_id,
        amount,
        type,
        status,
        payment_request_id,
        description
      ) VALUES (
        v_profile_id,
        v_amount,
        'deposit',
        'completed',
        p_request_id,
        'Deposit approved'
      );
      
      -- Tạo thông báo
      INSERT INTO notifications (
        profile_id,
        title,
        content,
        type,
        reference_id
      ) VALUES (
        v_profile_id,
        'Nạp tiền thành công',
        'Yêu cầu nạp ' || v_amount || ' đã được phê duyệt.',
        'transaction',
        p_request_id
      );
    END IF;
    
    -- Commit transaction tự động nếu không có lỗi
    
    RETURN TRUE;
  EXCEPTION WHEN OTHERS THEN
    -- Rollback tự động
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để từ chối payment request với transaction
CREATE OR REPLACE FUNCTION reject_payment_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_request_type TEXT;
  v_profile_id UUID;
  v_amount DECIMAL(15, 2);
BEGIN
  -- Sử dụng transaction
  BEGIN
    -- Khóa row để tránh race condition
    SELECT type, profile_id, amount INTO v_request_type, v_profile_id, v_amount
    FROM payment_requests
    WHERE id = p_request_id AND status = 'pending'
    FOR UPDATE;
    
    IF v_request_type IS NULL THEN
      RAISE EXCEPTION 'Payment request not found or not in pending status';
    END IF;
    
    -- Update payment request status
    UPDATE payment_requests
    SET 
      status = 'rejected',
      approved_by = p_admin_id,
      approved_at = NOW(),
      notes = p_notes,
      updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Hoàn lại tiền cho user nếu là withdrawal
    IF v_request_type = 'withdrawal' THEN
      UPDATE profiles
      SET 
        balance = balance + v_amount,
        updated_at = NOW()
      WHERE id = v_profile_id;
      
      -- Tạo thông báo
      INSERT INTO notifications (
        profile_id,
        title,
        content,
        type,
        reference_id
      ) VALUES (
        v_profile_id,
        'Yêu cầu rút tiền bị từ chối',
        'Yêu cầu rút ' || v_amount || ' đã bị từ chối. Số tiền đã được hoàn lại. Lý do: ' || COALESCE(p_notes, 'Không có lý do được cung cấp'),
        'transaction',
        p_request_id
      );
    ELSE
      -- Tạo thông báo cho deposit
      INSERT INTO notifications (
        profile_id,
        title,
        content,
        type,
        reference_id
      ) VALUES (
        v_profile_id,
        'Yêu cầu nạp tiền bị từ chối',
        'Yêu cầu nạp ' || v_amount || ' đã bị từ chối. Lý do: ' || COALESCE(p_notes, 'Không có lý do được cung cấp'),
        'transaction',
        p_request_id
      );
    END IF;
    
    RETURN TRUE;
  EXCEPTION WHEN OTHERS THEN
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get transaction history with filters
CREATE OR REPLACE FUNCTION get_transaction_history(
  p_profile_id UUID,
  p_type TEXT DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_page_number INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  profile_id UUID,
  amount DECIMAL(15, 2),
  type TEXT,
  status TEXT,
  reference_id UUID,
  payment_request_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INTEGER;
BEGIN
  offset_val := (p_page_number - 1) * p_page_size;

  RETURN QUERY
  SELECT 
    t.id,
    t.profile_id,
    t.amount,
    t.type,
    t.status,
    t.reference_id,
    t.payment_request_id,
    t.description,
    t.created_at,
    t.updated_at,
    COUNT(*) OVER() AS total_count
  FROM 
    transactions t
  WHERE
    t.profile_id = p_profile_id
    AND (p_type IS NULL OR t.type = p_type)
    AND (p_status IS NULL OR t.status = p_status)
    AND (p_start_date IS NULL OR t.created_at >= p_start_date)
    AND (p_end_date IS NULL OR t.created_at <= p_end_date)
  ORDER BY
    t.created_at DESC
  LIMIT
    p_page_size
  OFFSET
    offset_val;
END;
$$ LANGUAGE plpgsql;

-- Function to get transaction summary
CREATE OR REPLACE FUNCTION get_transaction_summary(
  p_profile_id UUID DEFAULT NULL, -- NULL for admin view (all users)
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  total_deposit DECIMAL(15, 2),
  total_withdrawal DECIMAL(15, 2),
  total_bet DECIMAL(15, 2),
  total_win DECIMAL(15, 2),
  total_referral_reward DECIMAL(15, 2),
  net_balance DECIMAL(15, 2),
  -- Chỉ cho admin view
  system_profit DECIMAL(15, 2),
  total_users_count BIGINT,
  active_users_count BIGINT
) AS $$
DECLARE
  is_admin_view BOOLEAN := (p_profile_id IS NULL);
BEGIN
  -- Xác định nếu đây là admin view
  -- Truy vấn cơ bản
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_deposit,
    COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_withdrawal,
    COALESCE(SUM(CASE WHEN type = 'bet' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_bet,
    COALESCE(SUM(CASE WHEN type = 'win' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_win,
    COALESCE(SUM(CASE WHEN type = 'referral_reward' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_referral_reward,
    COALESCE(SUM(CASE 
      WHEN status = 'completed' THEN
        CASE 
          WHEN type IN ('deposit', 'win', 'referral_reward') THEN amount
          WHEN type IN ('withdrawal', 'bet') THEN -amount
          ELSE 0
        END
      ELSE 0
    END), 0) AS net_balance,
    -- Thông tin bổ sung cho admin
    CASE WHEN is_admin_view THEN
      (COALESCE(SUM(CASE WHEN type = 'bet' AND status = 'completed' THEN amount ELSE 0 END), 0) - 
       COALESCE(SUM(CASE WHEN type = 'win' AND status = 'completed' THEN amount ELSE 0 END), 0))
    ELSE 0 END AS system_profit,
    CASE WHEN is_admin_view THEN
      (SELECT COUNT(DISTINCT profile_id) FROM transactions)
    ELSE 0 END AS total_users_count,
    CASE WHEN is_admin_view THEN
      (SELECT COUNT(DISTINCT profile_id) FROM transactions 
       WHERE created_at >= COALESCE(p_start_date, NOW() - INTERVAL '30 days'))
    ELSE 0 END AS active_users_count
  FROM 
    transactions t
  WHERE
    (p_profile_id IS NULL OR t.profile_id = p_profile_id)
    AND (p_start_date IS NULL OR t.created_at >= p_start_date)
    AND (p_end_date IS NULL OR t.created_at <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- Function for admin to get all transaction history with filters
CREATE OR REPLACE FUNCTION get_admin_transaction_history(
  p_type TEXT DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_page_number INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  profile_id UUID,
  amount DECIMAL(15, 2),
  type TEXT,
  status TEXT,
  reference_id UUID,
  payment_request_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT,
  display_name TEXT,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INTEGER;
BEGIN
  offset_val := (p_page_number - 1) * p_page_size;

  RETURN QUERY
  SELECT 
    t.id,
    t.profile_id,
    t.amount,
    t.type,
    t.status,
    t.reference_id, 
    t.payment_request_id,
    t.description,
    t.created_at,
    t.updated_at,
    p.username,
    p.display_name,
    COUNT(*) OVER() AS total_count
  FROM 
    transactions t
    JOIN profiles p ON t.profile_id = p.id
  WHERE
    (p_type IS NULL OR t.type = p_type)
    AND (p_status IS NULL OR t.status = p_status)
    AND (p_start_date IS NULL OR t.created_at >= p_start_date)
    AND (p_end_date IS NULL OR t.created_at <= p_end_date)
  ORDER BY
    t.created_at DESC
  LIMIT
    p_page_size
  OFFSET
    offset_val;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new notification
CREATE OR REPLACE FUNCTION create_notification(
  p_profile_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_type TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_notification_id UUID;
BEGIN
  -- Validate input
  IF p_type NOT IN ('system', 'transaction', 'game', 'admin') THEN
    RAISE EXCEPTION 'Invalid notification type';
  END IF;

  -- Insert new notification
  INSERT INTO notifications (
    profile_id,
    title,
    content,
    type,
    reference_id,
    is_read,
    created_at
  ) VALUES (
    p_profile_id,
    p_title,
    p_content,
    p_type,
    p_reference_id,
    FALSE,
    NOW()
  ) RETURNING id INTO new_notification_id;

  RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark a notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_profile_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_notification_exists BOOLEAN;
BEGIN
  -- Check if the notification exists and belongs to the user
  SELECT EXISTS (
    SELECT 1 
    FROM notifications 
    WHERE id = p_notification_id AND profile_id = p_profile_id
  ) INTO v_notification_exists;

  IF NOT v_notification_exists THEN
    RETURN FALSE;
  END IF;

  -- Update the notification
  UPDATE notifications
  SET is_read = TRUE
  WHERE id = p_notification_id AND profile_id = p_profile_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notifications with pagination
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_profile_id UUID,
  p_page_number INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 10,
  p_type TEXT DEFAULT NULL,
  p_is_read BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  profile_id UUID,
  title TEXT,
  content TEXT,
  type TEXT,
  is_read BOOLEAN,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INTEGER;
BEGIN
  offset_val := (p_page_number - 1) * p_page_size;

  RETURN QUERY
  SELECT 
    n.id,
    n.profile_id,
    n.title,
    n.content,
    n.type,
    n.is_read,
    n.reference_id,
    n.created_at,
    COUNT(*) OVER() AS total_count
  FROM 
    notifications n
  WHERE
    n.profile_id = p_profile_id
    AND (p_type IS NULL OR n.type = p_type)
    AND (p_is_read IS NULL OR n.is_read = p_is_read)
  ORDER BY
    n.created_at DESC
  LIMIT
    p_page_size
  OFFSET
    offset_val;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_profile_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE profile_id = p_profile_id AND is_read = FALSE;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_profile_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE
  WHERE profile_id = p_profile_id AND is_read = FALSE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redefine the function with a clear JSON return type
DROP FUNCTION IF EXISTS get_admin_dashboard_summary();
CREATE OR REPLACE FUNCTION get_admin_dashboard_summary()
RETURNS JSONB AS $$
DECLARE
  v_users JSONB;
  v_games JSONB;
  v_transactions JSONB;
  v_betting JSONB;
  result_jsonb JSONB;
BEGIN
  -- Lấy thống kê người dùng
  SELECT jsonb_build_object(
    'total_users', COUNT(*),
    'new_users_today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE),
    'new_users_week', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'new_users_month', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'active_users', COUNT(*) FILTER (WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days')
  ) INTO v_users
  FROM profiles;

  -- Lấy thống kê game
  SELECT jsonb_build_object(
    'total_games', COUNT(*),
    'active_games', COUNT(*) FILTER (WHERE status = 'active'),
    'completed_games', COUNT(*) FILTER (WHERE status = 'completed'),
    'games_today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE),
    'games_week', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')
  ) INTO v_games
  FROM game_rounds;

  -- Lấy thống kê giao dịch
  SELECT jsonb_build_object(
    'total_deposits', COALESCE(SUM(amount) FILTER (WHERE type = 'deposit' AND status = 'completed'), 0),
    'total_withdrawals', COALESCE(SUM(amount) FILTER (WHERE type = 'withdrawal' AND status = 'completed'), 0),
    'deposits_today', COALESCE(SUM(amount) FILTER (WHERE type = 'deposit' AND status = 'completed' AND created_at >= CURRENT_DATE), 0),
    'withdrawals_today', COALESCE(SUM(amount) FILTER (WHERE type = 'withdrawal' AND status = 'completed' AND created_at >= CURRENT_DATE), 0),
    'pending_deposits', COUNT(*) FILTER (WHERE type = 'deposit' AND status = 'pending'),
    'pending_withdrawals', COUNT(*) FILTER (WHERE type = 'withdrawal' AND status = 'pending')
  ) INTO v_transactions
  FROM transactions;

  -- Lấy thống kê cược
  SELECT jsonb_build_object(
    'total_bets', COUNT(*),
    'total_bet_amount', COALESCE(SUM(amount), 0),
    'total_winnings', COALESCE(SUM(CASE WHEN status = 'won' THEN potential_win ELSE 0 END), 0),
    'win_rate', CASE WHEN COUNT(*) = 0 THEN 0 ELSE (COUNT(*) FILTER (WHERE status = 'won') * 100.0 / COUNT(*)) END,
    'bets_today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE),
    'bets_amount_today', COALESCE(SUM(amount) FILTER (WHERE created_at >= CURRENT_DATE), 0)
  ) INTO v_betting
  FROM bets;

  -- Tạo đối tượng JSON kết quả
  result_jsonb := jsonb_build_object(
    'users', v_users,
    'games', v_games,
    'transactions', v_transactions,
    'betting', v_betting,
    'timestamp', NOW()
  );

  RETURN result_jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get key admin metrics over time
CREATE OR REPLACE FUNCTION get_admin_metrics(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_DATE,
  p_interval TEXT DEFAULT 'day'
)
RETURNS TABLE (
  time_period TIMESTAMP WITH TIME ZONE,
  new_users BIGINT,
  active_games BIGINT,
  total_bets BIGINT,
  total_bet_amount DECIMAL(15, 2),
  total_deposits DECIMAL(15, 2),
  total_withdrawals DECIMAL(15, 2),
  revenue DECIMAL(15, 2)
) AS $$
DECLARE
  interval_sql TEXT;
BEGIN
  -- Set the appropriate date_trunc function based on interval parameter
  IF p_interval = 'day' THEN
    interval_sql := 'day';
  ELSIF p_interval = 'week' THEN
    interval_sql := 'week';
  ELSIF p_interval = 'month' THEN
    interval_sql := 'month';
  ELSE
    interval_sql := 'day';
  END IF;

  RETURN QUERY
  WITH time_series AS (
    -- Generate a series of timestamps for the requested interval
    SELECT generate_series(
      date_trunc(interval_sql, p_start_date),
      date_trunc(interval_sql, p_end_date),
      ('1 ' || interval_sql)::interval
    ) AS time_period
  ),
  -- User metrics per period
  user_metrics AS (
    SELECT
      date_trunc(interval_sql, created_at) AS period,
      COUNT(*) AS new_users
    FROM profiles
    WHERE created_at BETWEEN p_start_date AND p_end_date
    GROUP BY period
  ),
  -- Game metrics per period
  game_metrics AS (
    SELECT
      date_trunc(interval_sql, created_at) AS period,
      COUNT(*) FILTER (WHERE status = 'active' OR status = 'completed') AS active_games
    FROM game_rounds
    WHERE created_at BETWEEN p_start_date AND p_end_date
    GROUP BY period
  ),
  -- Bet metrics per period
  bet_metrics AS (
    SELECT
      date_trunc(interval_sql, created_at) AS period,
      COUNT(*) AS total_bets,
      SUM(amount) AS total_bet_amount
    FROM bets
    WHERE created_at BETWEEN p_start_date AND p_end_date
    GROUP BY period
  ),
  -- Transaction metrics per period
  transaction_metrics AS (
    SELECT
      date_trunc(interval_sql, created_at) AS period,
      SUM(amount) FILTER (WHERE type = 'deposit' AND status = 'completed') AS total_deposits,
      SUM(amount) FILTER (WHERE type = 'withdrawal' AND status = 'completed') AS total_withdrawals,
      SUM(amount) FILTER (WHERE type = 'bet' AND status = 'completed') AS total_bets_amount,
      SUM(amount) FILTER (WHERE type = 'win' AND status = 'completed') AS total_winnings
    FROM transactions
    WHERE created_at BETWEEN p_start_date AND p_end_date
    GROUP BY period
  )
  -- Combine all metrics
  SELECT
    ts.time_period,
    COALESCE(um.new_users, 0) AS new_users,
    COALESCE(gm.active_games, 0) AS active_games,
    COALESCE(bm.total_bets, 0) AS total_bets,
    COALESCE(bm.total_bet_amount, 0) AS total_bet_amount,
    COALESCE(tm.total_deposits, 0) AS total_deposits,
    COALESCE(tm.total_withdrawals, 0) AS total_withdrawals,
    COALESCE(COALESCE(bm.total_bet_amount, 0) - COALESCE(tm.total_winnings, 0), 0) AS revenue
  FROM time_series ts
  LEFT JOIN user_metrics um ON ts.time_period = um.period
  LEFT JOIN game_metrics gm ON ts.time_period = gm.period
  LEFT JOIN bet_metrics bm ON ts.time_period = bm.period
  LEFT JOIN transaction_metrics tm ON ts.time_period = tm.period
  ORDER BY ts.time_period;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_admin_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  total_bets INTEGER;
  won_bets INTEGER;
  total_bet_amount DECIMAL(15, 2);
  total_winnings DECIMAL(15, 2);
  total_deposits DECIMAL(15, 2);
  total_withdrawals DECIMAL(15, 2);
  last_login TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Count bets
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'won'),
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(CASE WHEN status = 'won' THEN potential_win ELSE 0 END), 0)
  INTO 
    total_bets, 
    won_bets, 
    total_bet_amount, 
    total_winnings
  FROM bets
  WHERE profile_id = p_user_id;

  -- Sum deposits and withdrawals
  SELECT 
    COALESCE(SUM(amount) FILTER (WHERE type = 'deposit' AND status = 'completed'), 0),
    COALESCE(SUM(amount) FILTER (WHERE type = 'withdrawal' AND status = 'completed'), 0)
  INTO 
    total_deposits, 
    total_withdrawals
  FROM transactions
  WHERE profile_id = p_user_id;

  -- Get last login from auth.users (may require Supabase admin privileges)
  -- This would require additional setup, so we'll return NULL for now

  RETURN json_build_object(
    'total_bets', total_bets,
    'won_bets', won_bets,
    'win_rate', CASE WHEN total_bets > 0 THEN (won_bets::FLOAT / total_bets) * 100 ELSE 0 END,
    'total_bet_amount', total_bet_amount,
    'total_winnings', total_winnings,
    'net_gambling', total_winnings - total_bet_amount,
    'total_deposits', total_deposits,
    'total_withdrawals', total_withdrawals,
    'last_login', last_login
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Thêm vào file trigger_functions.sql
-- Function để lấy các game rounds dạng jackpot
CREATE OR REPLACE FUNCTION get_jackpot_games(p_limit INTEGER DEFAULT 6)
RETURNS TABLE (
  id UUID,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT,
  result TEXT,
  total_bet_amount DECIMAL(15, 2)
) AS $$
BEGIN
  RETURN QUERY
  WITH game_bets AS (
    SELECT 
      game_round_id,
      SUM(amount) as total_bet_amount
    FROM bets
    GROUP BY game_round_id
  )
  SELECT 
    gr.id,
    gr.start_time,
    gr.end_time,
    gr.status,
    gr.result,
    COALESCE(gb.total_bet_amount, 0) as total_bet_amount
  FROM 
    game_rounds gr
    LEFT JOIN game_bets gb ON gr.id = gb.game_round_id
  WHERE 
    gr.status = 'active'
    AND (
      -- Điều kiện 1: Game dài hơn 24 giờ
      (gr.end_time - gr.start_time) > INTERVAL '24 hours'
      OR
      -- Điều kiện 2: Tổng tiền đặt cược lớn hơn 10,000,000
      COALESCE(gb.total_bet_amount, 0) > 10000000
    )
  ORDER BY 
    COALESCE(gb.total_bet_amount, 0) DESC,
    gr.end_time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function tính toán giá trị jackpot hiện tại dựa trên:
-- 1. Giá trị cơ bản
-- 2. Phần trăm từ tổng tiền đặt cược hiện tại
-- 3. Lịch sử giao dịch jackpot

CREATE OR REPLACE FUNCTION calculate_current_jackpot()
RETURNS JSON AS $$
DECLARE
    base_jackpot DECIMAL(15, 2) := 50000000; -- Giá trị jackpot cơ bản cố định
    jackpot_contribution_rate DECIMAL(5, 4) := 0.0500; -- 5% cố định
    active_multiplier DECIMAL(5, 4) := 1.1000; -- 10% cố định
    jackpot_amount DECIMAL(15, 2) := 0;
    active_bets_count INTEGER := 0;
    total_bet_amount DECIMAL(15, 2) := 0;
    total_jackpot_payouts DECIMAL(15, 2) := 0;
    current_active_games INTEGER := 0;
BEGIN
    -- Đếm số lượng lượt chơi active
    SELECT COUNT(*) INTO current_active_games
    FROM game_rounds
    WHERE status = 'active';
    
    -- Tính số liệu cược
    SELECT 
        COALESCE(SUM(b.amount), 0),
        COUNT(*)
    INTO 
        total_bet_amount,
        active_bets_count
    FROM bets b
    JOIN game_rounds gr ON b.game_round_id = gr.id
    WHERE gr.status = 'active';
    
    -- Tính tổng tiền jackpot đã trả
    SELECT COALESCE(SUM(amount), 0) INTO total_jackpot_payouts
    FROM transactions
    WHERE type = 'win'
      AND status = 'completed' 
      AND description LIKE '%jackpot%';
    
    -- Tính toán jackpot dựa trên công thức:
    jackpot_amount := base_jackpot + (total_bet_amount * jackpot_contribution_rate);
    
    -- Tăng jackpot khi có nhiều người chơi
    IF active_bets_count > 50 THEN
        jackpot_amount := jackpot_amount * active_multiplier;
    END IF;
    
    -- Reset jackpot khi không có game
    IF current_active_games = 0 THEN
        jackpot_amount := base_jackpot;
    END IF;
    
    -- Trừ tiền đã trả
    jackpot_amount := jackpot_amount - total_jackpot_payouts;
    
    -- Đảm bảo jackpot không dưới giá trị cơ bản
    IF jackpot_amount < base_jackpot THEN
        jackpot_amount := base_jackpot;
    END IF;
    
    -- Random nhỏ để tạo cảm giác tăng dần
    jackpot_amount := jackpot_amount + (random() * 1000);
    
    -- Làm tròn số
    jackpot_amount := ROUND(jackpot_amount, -3);
    
    -- Trả về JSON
    RETURN json_build_object(
        'jackpot_amount', jackpot_amount,
        'base_jackpot', base_jackpot,
        'total_bet_amount', total_bet_amount,
        'active_bets_count', active_bets_count,
        'current_active_games', current_active_games,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_daily_transaction_stats(
  p_profile_id UUID,
  p_days INTEGER
)
RETURNS TABLE (
  date DATE,
  type TEXT,
  status TEXT,
  total_amount DECIMAL(15, 2)
) AS $$
DECLARE
  v_start_date DATE;
BEGIN
  -- Calculate start date (today - p_days)
  v_start_date := CURRENT_DATE - (p_days || ' days')::INTERVAL;
  
  -- Return data grouped by date and transaction type
  RETURN QUERY
  SELECT 
    DATE(created_at) AS date,
    t.type,
    t.status,
    SUM(t.amount) AS total_amount
  FROM 
    transactions t
  WHERE 
    t.profile_id = p_profile_id
    AND t.status = 'completed'
    AND DATE(t.created_at) >= v_start_date
  GROUP BY 
    DATE(t.created_at),
    t.type,
    t.status
  ORDER BY
    date, type;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform statistics
CREATE OR REPLACE FUNCTION get_platform_statistics()
RETURNS TABLE (
  user_count BIGINT,
  total_reward_paid DECIMAL(15, 2),
  total_game_rounds BIGINT,
  win_rate DECIMAL(5, 2),
  active_games_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM profiles) AS user_count,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'win' AND status = 'completed') AS total_reward_paid,
    (SELECT COUNT(*) FROM game_rounds) AS total_game_rounds,
    (SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE status = 'won') * 100.0 / COUNT(*)), 2)
      END
     FROM bets) AS win_rate,
    (SELECT COUNT(*) FROM game_rounds WHERE status = 'active') AS active_games_count;
END;
$$ LANGUAGE plpgsql;

-- Cập nhật trigger khi admin đăng nhập
CREATE OR REPLACE FUNCTION record_admin_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Tạo session mới
  INSERT INTO admin_sessions (
    admin_id,
    device_info,
    ip_address,
    user_agent,
    location,
    is_current,
    last_active,
    created_at
  ) VALUES (
    NEW.id,
    jsonb_build_object(
      'os', current_setting('request.headers')::jsonb->>'user-agent',
      'browser', current_setting('request.headers')::jsonb->>'user-agent'
    ),
    current_setting('request.ip', true),
    current_setting('request.headers')::jsonb->>'user-agent',
    'Unknown', -- Cần API phân giải địa lý từ IP
    TRUE,
    NOW(),
    NOW()
  );
  
  -- Ghi log đăng nhập
  INSERT INTO admin_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    details,
    created_at
  ) VALUES (
    NEW.id,
    'LOGIN',
    'profiles',
    NEW.id,
    jsonb_build_object(
      'ip', current_setting('request.ip', true),
      'user_agent', current_setting('request.headers')::jsonb->>'user-agent',
      'timestamp', NOW()
    ),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function tạo mã xác thực Telegram mới
CREATE OR REPLACE FUNCTION create_telegram_verification_code(p_profile_id UUID)
RETURNS TEXT AS $$
DECLARE
  verification_code TEXT;
  expiry_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Tạo mã xác thực ngẫu nhiên 8 ký tự
  verification_code := upper(substring(md5(random()::text), 1, 8));
  
  -- Đặt thời gian hết hạn 30 phút từ bây giờ
  expiry_time := NOW() + INTERVAL '30 minutes';
  
  -- Hủy mã xác thực cũ nếu có
  UPDATE telegram_verification
  SET is_used = TRUE
  WHERE profile_id = p_profile_id AND is_used = FALSE;
  
  -- Tạo mã xác thực mới
  INSERT INTO telegram_verification (
    profile_id,
    code,
    expires_at,
    is_used,
    created_at
  ) VALUES (
    p_profile_id,
    verification_code,
    expiry_time,
    FALSE,
    NOW()
  );
  
  RETURN verification_code;
END;
$$ LANGUAGE plpgsql;

-- Function để cập nhật thống kê Telegram
CREATE OR REPLACE FUNCTION update_telegram_stats(p_metric TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  today DATE := CURRENT_DATE;
  v_record_exists BOOLEAN;
BEGIN
  -- Kiểm tra nếu đã có record cho ngày hôm nay
  SELECT EXISTS(SELECT 1 FROM telegram_stats WHERE date = today) INTO v_record_exists;
  
  IF v_record_exists THEN
    -- Cập nhật counter cho metric tương ứng
    EXECUTE format('
      UPDATE telegram_stats 
      SET %I = %I + 1,
          created_at = NOW()
      WHERE date = $1
    ', p_metric, p_metric) USING today;
  ELSE
    -- Tạo record mới cho ngày hôm nay
    EXECUTE format('
      INSERT INTO telegram_stats (date, %I)
      VALUES ($1, 1)
    ', p_metric) USING today;
  END IF;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để lấy thống kê Telegram theo khoảng thời gian
CREATE OR REPLACE FUNCTION get_telegram_stats(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  notifications_sent INTEGER,
  new_connections INTEGER, 
  disconnections INTEGER,
  bot_interactions INTEGER,
  total_activity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.date,
    ts.notifications_sent,
    ts.new_connections,
    ts.disconnections,
    ts.bot_interactions,
    (ts.notifications_sent + ts.new_connections + ts.disconnections + ts.bot_interactions) AS total_activity
  FROM 
    telegram_stats ts
  WHERE 
    ts.date BETWEEN p_start_date AND p_end_date
  ORDER BY 
    ts.date DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger cập nhật thống kê khi kết nối/ngắt kết nối Telegram
CREATE OR REPLACE FUNCTION track_telegram_connection_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Kết nối mới
  IF NEW.telegram_id IS NOT NULL AND (OLD.telegram_id IS NULL OR OLD.telegram_id != NEW.telegram_id) THEN
    PERFORM update_telegram_stats('new_connections');
  END IF;
  
  -- Ngắt kết nối
  IF OLD.telegram_id IS NOT NULL AND NEW.telegram_id IS NULL THEN
    PERFORM update_telegram_stats('disconnections');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger
DROP TRIGGER IF EXISTS telegram_connection_tracker ON profiles;
CREATE TRIGGER telegram_connection_tracker
AFTER UPDATE OF telegram_id ON profiles
FOR EACH ROW
EXECUTE FUNCTION track_telegram_connection_changes();

-- Trigger tự động gửi thông báo chào mừng khi kết nối Telegram thành công
CREATE OR REPLACE FUNCTION send_telegram_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Chỉ xử lý khi telegram_id được thêm mới (không phải null)
  IF NEW.telegram_id IS NOT NULL AND (OLD.telegram_id IS NULL OR OLD.telegram_id != NEW.telegram_id) THEN
    -- Tạo thông báo trong hệ thống
    INSERT INTO notifications (
      profile_id,
      title,
      content,
      type,
      is_read,
      created_at
    ) VALUES (
      NEW.id,
      'Kết nối Telegram thành công',
      'Tài khoản của bạn đã được kết nối thành công với Telegram Bot. Bạn sẽ nhận được thông báo quan trọng qua Telegram từ bây giờ.',
      'system',
      FALSE,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo lại trigger
DROP TRIGGER IF EXISTS telegram_welcome_notification ON profiles;
CREATE TRIGGER telegram_welcome_notification
AFTER UPDATE OF telegram_id ON profiles
FOR EACH ROW
EXECUTE FUNCTION send_telegram_welcome_notification();

-- Function thống kê cài đặt thông báo Telegram
CREATE OR REPLACE FUNCTION get_telegram_settings_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH connected_users AS (
    SELECT id, telegram_settings
    FROM profiles
    WHERE telegram_id IS NOT NULL
  ),
  win_notifications AS (
    SELECT
      COUNT(*) FILTER (WHERE telegram_settings->>'receive_win_notifications' IS NULL OR telegram_settings->>'receive_win_notifications' = 'true') AS win_enabled,
      COUNT(*) FILTER (WHERE telegram_settings->>'receive_win_notifications' = 'false') AS win_disabled
    FROM connected_users
  ),
  transaction_notifications AS (
    SELECT
      COUNT(*) FILTER (WHERE 
        (telegram_settings->>'receive_deposit_notifications' IS NULL OR telegram_settings->>'receive_deposit_notifications' = 'true')
        OR (telegram_settings->>'receive_withdrawal_notifications' IS NULL OR telegram_settings->>'receive_withdrawal_notifications' = 'true')
      ) AS transaction_enabled,
      COUNT(*) FILTER (WHERE 
        telegram_settings->>'receive_deposit_notifications' = 'false'
        AND telegram_settings->>'receive_withdrawal_notifications' = 'false'
      ) AS transaction_disabled
    FROM connected_users
  ),
  login_notifications AS (
    SELECT
      COUNT(*) FILTER (WHERE telegram_settings->>'receive_login_alerts' IS NULL OR telegram_settings->>'receive_login_alerts' = 'true') AS login_enabled,
      COUNT(*) FILTER (WHERE telegram_settings->>'receive_login_alerts' = 'false') AS login_disabled
    FROM connected_users
  ),
  system_notifications AS (
    SELECT
      COUNT(*) FILTER (WHERE telegram_settings->>'receive_system_notifications' IS NULL OR telegram_settings->>'receive_system_notifications' = 'true') AS system_enabled,
      COUNT(*) FILTER (WHERE telegram_settings->>'receive_system_notifications' = 'false') AS system_disabled
    FROM connected_users
  )
  SELECT json_build_object(
    'win_enabled', win_enabled,
    'win_disabled', win_disabled,
    'transaction_enabled', transaction_enabled,
    'transaction_disabled', transaction_disabled,
    'login_enabled', login_enabled,
    'login_disabled', login_disabled,
    'system_enabled', system_enabled,
    'system_disabled', system_disabled
  ) INTO result
  FROM win_notifications, transaction_notifications, login_notifications, system_notifications;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function thống kê loại thông báo đã gửi qua Telegram
CREATE OR REPLACE FUNCTION get_telegram_notification_types()
RETURNS TABLE (
  type TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  -- Đây là một giả lập vì chúng ta không lưu trữ loại thông báo đã gửi qua Telegram
  -- Trong thực tế, bạn có thể muốn thêm một bảng để lưu trữ loại thông báo đã gửi
  SELECT 'system'::TEXT, 
    (SELECT COALESCE(SUM(notifications_sent) * 0.3, 0)::BIGINT FROM telegram_stats)
  UNION ALL
  SELECT 'transaction'::TEXT,
    (SELECT COALESCE(SUM(notifications_sent) * 0.4, 0)::BIGINT FROM telegram_stats)
  UNION ALL
  SELECT 'game'::TEXT,
    (SELECT COALESCE(SUM(notifications_sent) * 0.2, 0)::BIGINT FROM telegram_stats)
  UNION ALL
  SELECT 'admin'::TEXT,
    (SELECT COALESCE(SUM(notifications_sent) * 0.1, 0)::BIGINT FROM telegram_stats);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để đếm tổng số kết nối Telegram
CREATE OR REPLACE FUNCTION count_telegram_connections()
RETURNS JSON AS $$
DECLARE
  connected_count INTEGER;
  result JSON;
BEGIN
  -- Đếm số lượng người dùng đã kết nối Telegram
  SELECT COUNT(*)
  INTO connected_count
  FROM profiles
  WHERE telegram_id IS NOT NULL;
  
  -- Tạo JSON result
  SELECT json_build_object(
    'count', connected_count
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để đếm tổng số thông báo đã gửi
CREATE OR REPLACE FUNCTION count_telegram_notifications()
RETURNS TABLE (total_notifications INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(notifications_sent)::INTEGER, 0) AS total_notifications
  FROM telegram_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để lấy số lượng thông báo theo loại
CREATE OR REPLACE FUNCTION get_telegram_notification_types()
RETURNS TABLE (type TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT n.type, COUNT(*)
  FROM notifications n
  JOIN profiles p ON n.profile_id = p.id
  WHERE p.telegram_id IS NOT NULL
  GROUP BY n.type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Thêm vào database của bạn
CREATE OR REPLACE FUNCTION public.get_game_leaderboard(p_game_id UUID)
RETURNS TABLE (
  top_bets JSONB,
  top_winners JSONB
) SECURITY DEFINER AS $$
DECLARE
  v_top_bets JSONB;
  v_top_winners JSONB;
BEGIN
  -- Lấy top người đặt cược nhiều nhất
  SELECT jsonb_agg(bet_data) INTO v_top_bets
  FROM (
    SELECT 
      b.id,
      b.amount,
      b.chosen_number,
      b.created_at,
      jsonb_build_object(
        'id', p.id,
        'username', p.username,
        'display_name', p.display_name,
        'avatar_url', p.avatar_url
      ) AS profile
    FROM bets b
    JOIN profiles p ON b.profile_id = p.id
    WHERE b.game_round_id = p_game_id
    ORDER BY b.amount DESC
    LIMIT 10
  ) AS bet_data;

  -- Lấy top người thắng cuộc
  SELECT jsonb_agg(win_data) INTO v_top_winners
  FROM (
    SELECT 
      b.id,
      b.amount,
      b.chosen_number,
      b.potential_win,
      b.created_at,
      jsonb_build_object(
        'id', p.id,
        'username', p.username,
        'display_name', p.display_name,
        'avatar_url', p.avatar_url
      ) AS profile
    FROM bets b
    JOIN profiles p ON b.profile_id = p.id
    WHERE b.game_round_id = p_game_id
    AND b.status = 'won'
    ORDER BY b.potential_win DESC
    LIMIT 10
  ) AS win_data;

  -- Đảm bảo không trả về null
  v_top_bets := COALESCE(v_top_bets, '[]'::jsonb);
  v_top_winners := COALESCE(v_top_winners, '[]'::jsonb);

  RETURN QUERY SELECT v_top_bets, v_top_winners;
END;
$$ LANGUAGE plpgsql;