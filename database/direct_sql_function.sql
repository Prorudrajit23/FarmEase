-- Create a function to execute direct SQL queries (for admin/debugging purposes)
CREATE OR REPLACE FUNCTION direct_sql_query(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the creator
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Log the user attempting to access the function
  RAISE NOTICE 'User % is executing direct_sql_query()', auth.uid();
  
  -- Check if the user is a seller
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'seller'
  ) THEN
    -- Only allow SELECT queries for security
    IF position('SELECT' in upper(query_text)) = 1 THEN
      -- Execute the query and return the results as JSON
      EXECUTE 'SELECT json_agg(t) FROM (' || query_text || ') t' INTO result;
      RETURN result;
    ELSE
      RAISE EXCEPTION 'Only SELECT queries are allowed';
    END IF;
  ELSE
    RAISE EXCEPTION 'Only sellers can execute direct SQL queries';
  END IF;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION direct_sql_query(TEXT) TO authenticated;

-- Create a simpler function specifically for feedback
CREATE OR REPLACE FUNCTION get_feedback_direct()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Log the user attempting to access the function
  RAISE NOTICE 'User % is executing get_feedback_direct()', auth.uid();
  
  -- Check if the user is a seller
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'seller'
  ) THEN
    -- Execute the query and return the results as JSON
    EXECUTE 'SELECT json_agg(f) FROM public.feedback f ORDER BY created_at DESC' INTO result;
    RETURN result;
  ELSE
    RAISE EXCEPTION 'Only sellers can access feedback data';
  END IF;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_feedback_direct() TO authenticated;

-- Insert test data directly if needed (bypassing RLS)
DO $$
BEGIN
  -- Check if there's any feedback data
  IF NOT EXISTS (SELECT 1 FROM public.feedback LIMIT 1) THEN
    -- Insert test data
    INSERT INTO public.feedback (user_email, feedback, rating, created_at)
    VALUES 
      ('direct_test1@example.com', 'Excellent service and product quality!', 5, now() - interval '1 day'),
      ('direct_test2@example.com', 'Very satisfied with my purchase.', 4, now() - interval '2 days'),
      ('direct_test3@example.com', 'Good products but delivery was delayed.', 3, now() - interval '3 days');
    
    RAISE NOTICE 'Added test feedback data directly';
  ELSE
    RAISE NOTICE 'Feedback table already has data, skipping direct test data insertion';
  END IF;
END;
$$; 