-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean setup
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

DROP POLICY IF EXISTS "Everyone can read game rounds" ON game_rounds;
DROP POLICY IF EXISTS "Only admins can create and update game rounds" ON game_rounds;

DROP POLICY IF EXISTS "Users can read their own bets" ON bets;
DROP POLICY IF EXISTS "Users can create their own bets" ON bets;
DROP POLICY IF EXISTS "Admins can read all bets" ON bets;

DROP POLICY IF EXISTS "Users can read their own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can read all transactions" ON transactions;

DROP POLICY IF EXISTS "Users can read their own payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Users can create their own payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Admins can read all payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Admins can update all payment requests" ON payment_requests;

DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

DROP POLICY IF EXISTS "Users can read their referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can read all referrals" ON referrals;

-- Policies for profiles table
CREATE POLICY "Allow profile access"
ON profiles FOR SELECT
USING (true); -- Cho phép đọc tất cả profiles

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Policies for game_rounds table
CREATE POLICY "Everyone can read game rounds"
ON game_rounds FOR SELECT
USING (TRUE);

CREATE POLICY "Only admins can create and update game rounds"
ON game_rounds FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Policies for bets table
CREATE POLICY "Users can read their own bets"
ON bets FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own bets"
ON bets FOR INSERT
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Admins can read all bets"
ON bets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Policies for transactions table
CREATE POLICY "Users can read their own transactions"
ON transactions FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Admins can read all transactions"
ON transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "System can insert transactions"
ON transactions FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update transactions"
ON transactions FOR UPDATE
USING (true);

-- Policies for payment_requests table
CREATE POLICY "Users can read their own payment requests"
ON payment_requests FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own payment requests"
ON payment_requests FOR INSERT
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Admins can read all payment requests"
ON payment_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Admins can update all payment requests"
ON payment_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Policies for notifications table
CREATE POLICY "Users can read their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = profile_id);

CREATE POLICY "Admins can create notifications"
ON notifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Allow system to create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update only their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = profile_id);

CREATE POLICY "Admins can create notifications for all users"
ON notifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Policies for referrals table
CREATE POLICY "Users can read their referrals"
ON referrals FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can read all referrals"
ON referrals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Kiểm tra admin policy helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies cho admin dashboard
CREATE POLICY "Only admins can access dashboard functions"
ON profiles
FOR ALL
USING (is_admin());

CREATE POLICY "Admin can view all transactions"
ON transactions
FOR SELECT
USING (is_admin());

CREATE POLICY "Admin can view all bets"
ON bets
FOR SELECT
USING (is_admin());

CREATE POLICY "Admin can view all game rounds"
ON game_rounds
FOR SELECT
USING (is_admin());