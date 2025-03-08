-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_bet_created ON bets;
DROP TRIGGER IF EXISTS on_game_round_completed ON game_rounds;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_balance_on_bet();
DROP FUNCTION IF EXISTS complete_game_round();

-- Function để xử lý đăng ký người dùng mới với validation
CREATE OR REPLACE FUNCTION register_new_user(
  email TEXT,
  password TEXT,
  referral_code TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
  referrer_id UUID;
BEGIN
  -- Validate email (basic check)
  IF email IS NULL OR email = '' OR position('@' in email) = 0 THEN
    RAISE EXCEPTION 'Email không hợp lệ';
  END IF;
  
  -- Validate password
  IF password IS NULL OR length(password) < 6 THEN
    RAISE EXCEPTION 'Mật khẩu phải có ít nhất 6 ký tự';
  END IF;
  
  -- Check referral code and get referrer
  IF referral_code IS NOT NULL AND referral_code != '' THEN
    SELECT id INTO referrer_id
    FROM profiles
    WHERE referral_code = register_new_user.referral_code;
    
    IF referrer_id IS NULL THEN
      RAISE EXCEPTION 'Mã giới thiệu không hợp lệ';
    END IF;
  END IF;
  
  -- Create user and return ID (the actual user creation happens via Supabase Auth)
  -- This is just a placeholder for the function signature
  -- The real implementation will be handled by Supabase Auth API
  RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update balance when a bet is placed
CREATE OR REPLACE FUNCTION update_balance_on_bet()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify sufficient balance
  IF (SELECT balance FROM profiles WHERE id = NEW.profile_id) < NEW.amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct bet amount from user balance
  UPDATE profiles
  SET 
    balance = balance - NEW.amount,
    updated_at = NOW()
  WHERE id = NEW.profile_id;
  
  -- Create transaction record
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

-- Function to complete a game round and process results
CREATE OR REPLACE FUNCTION complete_game_round()
RETURNS TRIGGER AS $$
DECLARE
  bet_record RECORD;
  winning_amount DECIMAL(15, 2);
BEGIN
  -- Only process if status changed to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.result IS NOT NULL THEN
    -- Update bets status based on game result
    FOR bet_record IN
      SELECT * FROM bets WHERE game_round_id = NEW.id AND status = 'pending'
    LOOP
      IF bet_record.chosen_number = NEW.result THEN
        -- Player won
        winning_amount := bet_record.potential_win;
        
        -- Update bet status
        UPDATE bets
        SET 
          status = 'won',
          updated_at = NOW()
        WHERE id = bet_record.id;
        
        -- Add winnings to user balance
        UPDATE profiles
        SET 
          balance = balance + winning_amount,
          updated_at = NOW()
        WHERE id = bet_record.profile_id;
        
        -- Create transaction record
        INSERT INTO transactions (
          profile_id,
          amount,
          type,
          status,
          reference_id,
          description
        ) VALUES (
          bet_record.profile_id,
          winning_amount,
          'win',
          'completed',
          bet_record.id,
          'Win from game round ' || NEW.id
        );
        
        -- Create notification
        INSERT INTO notifications (
          profile_id,
          title,
          content,
          type,
          reference_id
        ) VALUES (
          bet_record.profile_id,
          'You won!',
          'Congratulations! You won ' || winning_amount || ' from game round.',
          'game',
          NEW.id
        );
      ELSE
        -- Player lost
        UPDATE bets
        SET 
          status = 'lost',
          updated_at = NOW()
        WHERE id = bet_record.id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for when a game round is completed
CREATE TRIGGER on_game_round_completed
AFTER UPDATE ON game_rounds
FOR EACH ROW
EXECUTE FUNCTION complete_game_round();

-- Function to handle payment request approval
CREATE OR REPLACE FUNCTION handle_payment_request_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status changed to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    IF NEW.type = 'deposit' THEN
      -- Add amount to user balance for deposits
      UPDATE profiles
      SET 
        balance = balance + NEW.amount,
        updated_at = NOW()
      WHERE id = NEW.profile_id;
      
      -- Create transaction record
      INSERT INTO transactions (
        profile_id,
        amount,
        type,
        status,
        payment_request_id,
        description
      ) VALUES (
        NEW.profile_id,
        NEW.amount,
        'deposit',
        'completed',
        NEW.id,
        'Deposit approved'
      );
      
      -- Create notification
      INSERT INTO notifications (
        profile_id,
        title,
        content,
        type,
        reference_id
      ) VALUES (
        NEW.profile_id,
        'Deposit Approved',
        'Your deposit of ' || NEW.amount || ' has been approved.',
        'transaction',
        NEW.id
      );
    ELSIF NEW.type = 'withdrawal' THEN
      -- Create transaction record for withdrawal
      INSERT INTO transactions (
        profile_id,
        amount,
        type,
        status,
        payment_request_id,
        description
      ) VALUES (
        NEW.profile_id,
        -NEW.amount,
        'withdrawal',
        'completed',
        NEW.id,
        'Withdrawal processed'
      );
      
      -- Create notification
      INSERT INTO notifications (
        profile_id,
        title,
        content,
        type,
        reference_id
      ) VALUES (
        NEW.profile_id,
        'Withdrawal Processed',
        'Your withdrawal of ' || NEW.amount || ' has been processed.',
        'transaction',
        NEW.id
      );
    END IF;
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    -- If withdrawal request is rejected, refund the balance
    IF NEW.type = 'withdrawal' THEN
      UPDATE profiles
      SET 
        balance = balance + NEW.amount,
        updated_at = NOW()
      WHERE id = NEW.profile_id;
      
      -- Create notification
      INSERT INTO notifications (
        profile_id,
        title,
        content,
        type,
        reference_id
      ) VALUES (
        NEW.profile_id,
        'Withdrawal Rejected',
        'Your withdrawal of ' || NEW.amount || ' has been rejected. The amount has been refunded to your balance.',
        'transaction',
        NEW.id
      );
    ELSIF NEW.type = 'deposit' THEN
      -- Notification for rejected deposit
      INSERT INTO notifications (
        profile_id,
        title,
        content,
        type,
        reference_id
      ) VALUES (
        NEW.profile_id,
        'Deposit Rejected',
        'Your deposit of ' || NEW.amount || ' has been rejected. Please check the notes for details.',
        'transaction',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for payment request approval/rejection
DROP TRIGGER IF EXISTS on_payment_request_status_change ON payment_requests;
CREATE TRIGGER on_payment_request_status_change
AFTER UPDATE ON payment_requests
FOR EACH ROW
EXECUTE FUNCTION handle_payment_request_approval();

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
  reward_amount DECIMAL(15, 2) := 10.00; -- Example reward amount
BEGIN
  -- Check if user was referred (has referred_by)
  IF NEW.referred_by IS NOT NULL THEN
    referrer_id := NEW.referred_by;
    
    -- Create referral record
    INSERT INTO referrals (
      referrer_id,
      referred_id,
      status,
      reward_amount,
      created_at
    ) VALUES (
      referrer_id,
      NEW.id,
      'pending',
      reward_amount,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
        'Referral reward for user ' || NEW.profile_id
      );
      
      -- Create notification for referrer
      INSERT INTO notifications (
        profile_id,
        title,
        content,
        type,
        reference_id
      ) VALUES (
        referrer_id,
        'Referral Reward',
        'You received ' || ref_record.reward_amount || ' as a referral reward!',
        'system',
        ref_record.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    gr.status, -- Sửa: chỉ định rõ gr.status thay vì status
    gr.created_by,
    gr.created_at,
    gr.updated_at,
    COUNT(*) OVER() AS total_count
  FROM 
    game_rounds gr
  WHERE
    (status_filter IS NULL OR gr.status = status_filter) -- Sửa: gr.status
    AND (from_date IS NULL OR gr.start_time >= from_date) -- Sửa: gr.start_time
    AND (to_date IS NULL OR gr.start_time <= to_date) -- Sửa: gr.start_time
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
  v_multiplier DECIMAL(15, 2) := 9.0; -- Hệ số nhân tiền thưởng, có thể điều chỉnh
BEGIN
  -- Check if game round exists and is active
  SELECT status INTO v_game_status
  FROM game_rounds
  WHERE id = p_game_round_id;
  
  IF v_game_status IS NULL THEN
    RAISE EXCEPTION 'Game round not found';
  END IF;
  
  IF v_game_status != 'active' THEN
    RAISE EXCEPTION 'Game round is not active for betting';
  END IF;
  
  -- Check if user has enough balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_profile_id;
  
  IF v_user_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Calculate potential win
  v_potential_win := p_amount * v_multiplier;
  
  -- Create bet
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
  
  -- Return the new bet ID
  RETURN v_new_bet_id;
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

-- Function để phê duyệt payment request
CREATE OR REPLACE FUNCTION approve_payment_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_request_type TEXT;
  v_profile_id UUID;
BEGIN
  -- Check if request exists and is pending
  SELECT type, profile_id INTO v_request_type, v_profile_id
  FROM payment_requests
  WHERE id = p_request_id AND status = 'pending';
  
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
  
  -- The handle_payment_request_approval trigger will handle the rest
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function để từ chối payment request
CREATE OR REPLACE FUNCTION reject_payment_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_request_type TEXT;
  v_profile_id UUID;
BEGIN
  -- Check if request exists and is pending
  SELECT type, profile_id INTO v_request_type, v_profile_id
  FROM payment_requests
  WHERE id = p_request_id AND status = 'pending';
  
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
  
  -- The handle_payment_request_approval trigger will handle the rest
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;