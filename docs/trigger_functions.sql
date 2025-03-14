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
  reward_settings RECORD;
  reward_amount DECIMAL(15, 2) := 10.00; -- Giá trị mặc định
BEGIN
  -- Check if user was referred (has referred_by)
  IF NEW.referred_by IS NOT NULL THEN
    referrer_id := NEW.referred_by;
    
    -- Check if referrer exists
    PERFORM id FROM profiles WHERE id = referrer_id;
    IF NOT FOUND THEN
      RAISE WARNING 'Người giới thiệu với ID % không tồn tại', referrer_id;
      RETURN NEW;
    END IF;
    
    -- Prevent self-referral
    IF referrer_id = NEW.id THEN
      RAISE WARNING 'Tự giới thiệu không được cho phép: %', NEW.id;
      RETURN NEW;
    END IF;
    
    -- Try to get custom reward amount from settings (if exists)
    BEGIN
      SELECT value::jsonb->>'amount' INTO reward_amount 
      FROM settings 
      WHERE key = 'referral_reward_amount' 
      LIMIT 1;
      
      -- Validate reward amount is a valid number
      IF reward_amount IS NULL OR reward_amount <= 0 THEN
        reward_amount := 10.00; -- Giá trị mặc định nếu thiết lập không hợp lệ
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Sử dụng giá trị mặc định nếu có lỗi
      reward_amount := 10.00;
    END;
    
    -- Create referral record
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
  p_profile_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  total_deposit DECIMAL(15, 2),
  total_withdrawal DECIMAL(15, 2),
  total_bet DECIMAL(15, 2),
  total_win DECIMAL(15, 2),
  total_referral_reward DECIMAL(15, 2),
  net_balance DECIMAL(15, 2)
) AS $$
BEGIN
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
    END), 0) AS net_balance
  FROM 
    transactions
  WHERE
    profile_id = p_profile_id
    AND (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
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

-- Function to get system-wide transaction summary for admin
CREATE OR REPLACE FUNCTION get_admin_transaction_summary(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  total_deposit DECIMAL(15, 2),
  total_withdrawal DECIMAL(15, 2),
  total_bet DECIMAL(15, 2),
  total_win DECIMAL(15, 2),
  total_referral_reward DECIMAL(15, 2),
  system_profit DECIMAL(15, 2),
  total_users_count BIGINT,
  active_users_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_deposit,
    COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_withdrawal,
    COALESCE(SUM(CASE WHEN type = 'bet' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_bet,
    COALESCE(SUM(CASE WHEN type = 'win' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_win,
    COALESCE(SUM(CASE WHEN type = 'referral_reward' AND status = 'completed' THEN amount ELSE 0 END), 0) AS total_referral_reward,
    (COALESCE(SUM(CASE WHEN type = 'bet' AND status = 'completed' THEN amount ELSE 0 END), 0) - 
     COALESCE(SUM(CASE WHEN type = 'win' AND status = 'completed' THEN amount ELSE 0 END), 0)) AS system_profit,
    (SELECT COUNT(DISTINCT profile_id) FROM transactions) AS total_users_count,
    (SELECT COUNT(DISTINCT profile_id) FROM transactions 
     WHERE created_at >= COALESCE(p_start_date, NOW() - INTERVAL '30 days')) AS active_users_count
  FROM 
    transactions
  WHERE
    (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
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

-- Function to get admin dashboard summary
CREATE OR REPLACE FUNCTION get_admin_dashboard_summary()
RETURNS JSON AS $$
DECLARE
  user_stats JSON;
  game_stats JSON;
  transaction_stats JSON;
  betting_stats JSON;
BEGIN
  -- Get user statistics
  SELECT json_build_object(
    'total_users', COUNT(*),
    'new_users_today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE),
    'new_users_week', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'new_users_month', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'active_users', COUNT(*) FILTER (WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days')
  ) INTO user_stats
  FROM profiles;

  -- Get game statistics
  SELECT json_build_object(
    'total_games', COUNT(*),
    'active_games', COUNT(*) FILTER (WHERE status = 'active'),
    'completed_games', COUNT(*) FILTER (WHERE status = 'completed'),
    'games_today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE),
    'games_week', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')
  ) INTO game_stats
  FROM game_rounds;

  -- Get transaction statistics
  SELECT json_build_object(
    'total_deposits', SUM(amount) FILTER (WHERE type = 'deposit' AND status = 'completed'),
    'total_withdrawals', SUM(amount) FILTER (WHERE type = 'withdrawal' AND status = 'completed'),
    'deposits_today', SUM(amount) FILTER (WHERE type = 'deposit' AND status = 'completed' AND created_at >= CURRENT_DATE),
    'withdrawals_today', SUM(amount) FILTER (WHERE type = 'withdrawal' AND status = 'completed' AND created_at >= CURRENT_DATE),
    'pending_deposits', COUNT(*) FILTER (WHERE type = 'deposit' AND status = 'pending'),
    'pending_withdrawals', COUNT(*) FILTER (WHERE type = 'withdrawal' AND status = 'pending')
  ) INTO transaction_stats
  FROM transactions;

  -- Get betting statistics
  SELECT json_build_object(
    'total_bets', COUNT(*),
    'total_bet_amount', SUM(amount),
    'total_winnings', SUM(CASE WHEN status = 'won' THEN potential_win ELSE 0 END),
    'win_rate', (COUNT(*) FILTER (WHERE status = 'won') * 100.0 / NULLIF(COUNT(*), 0)),
    'bets_today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE),
    'bets_amount_today', SUM(amount) FILTER (WHERE created_at >= CURRENT_DATE)
  ) INTO betting_stats
  FROM bets;

  -- Return combined statistics
  RETURN json_build_object(
    'users', user_stats,
    'games', game_stats,
    'transactions', transaction_stats,
    'betting', betting_stats,
    'timestamp', NOW()
  );
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
    base_jackpot DECIMAL(15, 2) := 50000000; -- Giá trị jackpot cơ bản (50 triệu VND)
    jackpot_contribution_rate DECIMAL(5, 4) := 0.0500; -- 5% từ mỗi lượt đặt cược đóng góp vào jackpot
    active_multiplier DECIMAL(5, 4) := 1.1000; -- Hệ số nhân cho jackpot khi có nhiều người chơi (10%)
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
    
    -- Tính tổng số tiền đặt cược trong các lượt chơi đang diễn ra
    SELECT COALESCE(SUM(amount), 0) INTO total_bet_amount
    FROM bets b
    JOIN game_rounds gr ON b.game_round_id = gr.id
    WHERE gr.status = 'active';
    
    -- Đếm số lượng đặt cược đang hoạt động
    SELECT COUNT(*) INTO active_bets_count
    FROM bets b
    JOIN game_rounds gr ON b.game_round_id = gr.id
    WHERE gr.status = 'active';
    
    -- Tính tổng số tiền đã trả cho jackpot
    SELECT COALESCE(SUM(amount), 0) INTO total_jackpot_payouts
    FROM transactions
    WHERE type = 'win'
      AND status = 'completed' 
      AND description LIKE '%jackpot%';
    
    -- Tính toán jackpot dựa trên công thức:
    -- Jackpot cơ bản + (Tổng tiền đặt cược * tỷ lệ đóng góp) - Tổng đã trả
    jackpot_amount := base_jackpot + (total_bet_amount * jackpot_contribution_rate);
    
    -- Tăng jackpot dựa trên số lượng đặt cược đang hoạt động
    IF active_bets_count > 50 THEN
        jackpot_amount := jackpot_amount * active_multiplier;
    END IF;
    
    -- Nếu không có lượt chơi active, reset jackpot về giá trị cơ bản
    IF current_active_games = 0 THEN
        jackpot_amount := base_jackpot;
    END IF;
    
    -- Trừ đi số tiền jackpot đã trả 
    jackpot_amount := jackpot_amount - total_jackpot_payouts;
    
    -- Đảm bảo jackpot không âm và không nhỏ hơn giá trị cơ bản
    IF jackpot_amount < base_jackpot THEN
        jackpot_amount := base_jackpot;
    END IF;
    
    -- Random thêm một chút để tạo cảm giác jackpot đang tăng
    jackpot_amount := jackpot_amount + (random() * 10000);
    
    -- Làm tròn để không có số lẻ
    jackpot_amount := ROUND(jackpot_amount, -3);
    
    -- Trả về JSON với các thông tin chi tiết
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