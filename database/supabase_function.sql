-- Create a function to get all feedback (bypassing RLS)
CREATE OR REPLACE FUNCTION get_all_feedback()
RETURNS SETOF feedback
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the creator
AS $$
BEGIN
  -- Log the user attempting to access the function
  RAISE NOTICE 'User % is accessing get_all_feedback()', auth.uid();
  
  -- Check if the user is a seller
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'seller'
  ) THEN
    -- Return all feedback entries
    RETURN QUERY SELECT * FROM public.feedback ORDER BY created_at DESC;
  ELSE
    -- If not a seller, return empty set
    RETURN;
  END IF;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_all_feedback() TO authenticated;

-- Insert some test feedback data if the table is empty
DO $$
DECLARE
  feedback_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO feedback_count FROM public.feedback;
  
  IF feedback_count = 0 THEN
    INSERT INTO public.feedback (user_email, feedback, rating, created_at)
    VALUES 
      ('test1@example.com', 'Great products! The vegetables were very fresh.', 5, now() - interval '1 day'),
      ('test2@example.com', 'Good service but delivery was a bit late.', 4, now() - interval '2 days'),
      ('test3@example.com', 'The quality of produce is excellent.', 5, now() - interval '3 days');
    
    RAISE NOTICE 'Added test feedback data';
  ELSE
    RAISE NOTICE 'Feedback table already has data, skipping test data insertion';
  END IF;
END;
$$; 