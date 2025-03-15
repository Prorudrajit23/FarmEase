-- Create a simplified function that doesn't check user type
CREATE OR REPLACE FUNCTION get_all_feedback_simple()
RETURNS SETOF feedback
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT * FROM public.feedback ORDER BY created_at DESC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_feedback_simple() TO authenticated;

-- Fix seller permissions for specific user
DO $$
BEGIN
  -- Ensure user_type column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_type TEXT;
  END IF;

  -- Update the user to be a seller
  UPDATE profiles 
  SET user_type = 'seller' 
  WHERE id = '7e307677-4d08-4898-b66c-a23bdaef0f7d';
  
  -- If the user doesn't exist in profiles, insert them
  IF NOT FOUND THEN
    INSERT INTO profiles (id, user_type)
    VALUES ('7e307677-4d08-4898-b66c-a23bdaef0f7d', 'seller');
  END IF;
END
$$;

-- Insert test data if the feedback table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM feedback LIMIT 1) THEN
    INSERT INTO feedback (id, product_id, user_id, rating, comment, created_at)
    VALUES 
      (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', '7e307677-4d08-4898-b66c-a23bdaef0f7d', 5, 'Great product! Very fresh vegetables.', NOW()),
      (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174001', '7e307677-4d08-4898-b66c-a23bdaef0f7d', 4, 'Good quality, but delivery was a bit late.', NOW() - INTERVAL '1 day'),
      (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174002', '7e307677-4d08-4898-b66c-a23bdaef0f7d', 5, 'Excellent service and product quality!', NOW() - INTERVAL '2 days');
  END IF;
END
$$;

-- Diagnostic queries
-- Uncomment and run these one by one to troubleshoot

-- Check if the feedback table exists
-- SELECT EXISTS (
--   SELECT FROM information_schema.tables 
--   WHERE table_schema = 'public' 
--   AND table_name = 'feedback'
-- );

-- List all feedback entries
-- SELECT * FROM feedback;

-- Check your user type
-- SELECT * FROM profiles WHERE id = '7e307677-4d08-4898-b66c-a23bdaef0f7d';

-- Test the simplified function
-- SELECT * FROM get_all_feedback_simple(); 