-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_bet_created ON bets;
DROP TRIGGER IF EXISTS on_game_round_completed ON game_rounds;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_balance_on_bet();
DROP FUNCTION IF EXISTS complete_game_round();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate unique referral code
  new_referral_code := LOWER(SUBSTRING(MD5(NEW.id::TEXT || RANDOM()::TEXT) FOR 8));
  
  -- Create a new profile for the user
  INSERT INTO profiles (
    id, 
    username, 
    email, 
    referral_code,
    balance
  ) VALUES (
    NEW.id, 
    NEW.email, 
    NEW.email, 
    new_referral_code,
    0
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

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