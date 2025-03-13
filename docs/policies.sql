-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean setup
DROP POLICY IF EXISTS "Only admin can view admin logs" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can only insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "System can insert transactions" ON transactions;
DROP POLICY IF EXISTS "System can update transactions" ON transactions;
DROP POLICY IF EXISTS "Users can read their own bets" ON bets;
DROP POLICY IF EXISTS "Users can create their own bets" ON bets;
DROP POLICY IF EXISTS "Allow system to create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update only their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications for all users" ON notifications;
DROP POLICY IF EXISTS "Admin can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admin can view all bets" ON bets;
DROP POLICY IF EXISTS "Admin can view all game rounds" ON game_rounds;
DROP POLICY IF EXISTS "Everyone can read game rounds" ON game_rounds;
DROP POLICY IF EXISTS "Only admins can create and update game rounds" ON game_rounds;
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
DROP POLICY IF EXISTS "Only admin can update game results" ON game_results;
DROP POLICY IF EXISTS "Only admin can insert admin logs" ON admin_logs;

-- Policies for profiles table
CREATE POLICY "Only admin can view admin logs" ON profiles FOR SELECT TO public USING (EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))));
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT TO public USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO public USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE TO public USING (is_admin_direct());
CREATE POLICY "Users can only insert their own profile" ON profiles FOR INSERT TO public WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can insert any profile" ON profiles FOR INSERT TO public WITH CHECK (is_admin_direct());
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE TO public USING (is_admin_direct());
CREATE POLICY "System can insert transactions" ON transactions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "System can update transactions" ON transactions FOR UPDATE TO public USING (true);
CREATE POLICY "Users can read their own bets" ON bets FOR SELECT TO public USING (auth.uid() = profile_id);
CREATE POLICY "Users can create their own bets" ON bets FOR INSERT TO public WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Allow system to create notifications" ON notifications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users can update only their own notifications" ON notifications FOR UPDATE TO public USING (auth.uid() = profile_id);
CREATE POLICY "Admins can create notifications for all users" ON notifications FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))));
CREATE POLICY "Admin can view all transactions" ON transactions FOR SELECT TO public USING (is_admin());
CREATE POLICY "Admin can view all bets" ON bets FOR SELECT TO public USING (is_admin());
CREATE POLICY "Admin can view all game rounds" ON game_rounds FOR SELECT TO public USING (is_admin());
CREATE POLICY "Everyone can read game rounds" ON game_rounds FOR SELECT TO public USING (true);
CREATE POLICY "Only admins can create and update game rounds" ON game_rounds FOR ALL TO public USING (EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))));
CREATE POLICY "Admins can read all bets" ON bets FOR SELECT TO public USING (EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))));
CREATE POLICY "Users can read their own transactions" ON transactions FOR SELECT TO public USING (auth.uid() = profile_id);
CREATE POLICY "Admins can read all transactions" ON transactions FOR SELECT TO public USING (EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))));
CREATE POLICY "Users can read their own payment requests" ON payment_requests FOR SELECT TO public USING (auth.uid() = profile_id);
CREATE POLICY "Users can create their own payment requests" ON payment_requests FOR INSERT TO public WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Admins can read all payment requests" ON payment_requests FOR SELECT TO public USING (EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))));
CREATE POLICY "Admins can update all payment requests" ON payment_requests FOR UPDATE TO public USING (EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))));
CREATE POLICY "Users can read their own notifications" ON notifications FOR SELECT TO public USING (auth.uid() = profile_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE TO public USING (auth.uid() = profile_id);
CREATE POLICY "Admins can create notifications" ON notifications FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))));
CREATE POLICY "Users can read their referrals" ON referrals FOR SELECT TO public USING (auth.uid() = referrer_id);
CREATE POLICY "Admins can read all referrals" ON referrals FOR SELECT TO public USING (EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))));
CREATE POLICY "Only admin can update game results" ON game_results FOR UPDATE TO public USING (EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))));
CREATE POLICY "Only admin can insert admin logs" ON admin_logs FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))));

-- This policy allows users to subscribe to their own notifications
CREATE POLICY "Users can subscribe to their own notifications" ON notifications
FOR SELECT TO authenticated
USING (auth.uid() = profile_id);