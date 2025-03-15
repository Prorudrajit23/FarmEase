# FarmEase Feedback System Troubleshooting Guide

This guide provides comprehensive steps to troubleshoot and fix issues with the feedback system in the FarmEase application.

## Common Issues

1. **Feedback not showing up for seller accounts**
2. **"Failed to submit feedback" error when submitting feedback**
3. **Permission errors when accessing feedback**
4. **Buyers seeing feedback that should be restricted to sellers**

## Complete Fix for Feedback System

### Step 1: Run the Basic SQL Setup

Run these SQL commands in your Supabase SQL Editor to set up the feedback table and permissions:

```sql
-- Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    feedback TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security (RLS) for the feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anyone to insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Allow sellers to view feedback" ON public.feedback;

-- Create policy to allow anyone to insert feedback (using WITH CHECK for INSERT)
CREATE POLICY "Allow anyone to insert feedback" 
ON public.feedback 
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Create policy to allow only sellers to view feedback
CREATE POLICY "Allow sellers to view feedback" 
ON public.feedback 
FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'seller'
    )
);

-- Make sure the profiles table has the user_type column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type TEXT;

-- Update the user_type in profiles table for existing users
UPDATE public.profiles
SET user_type = auth.users.raw_user_meta_data->>'userType'
FROM auth.users
WHERE profiles.id = auth.users.id
AND (profiles.user_type IS NULL OR profiles.user_type = '');
```

### Step 2: Create a Database Function to Bypass RLS

If you're still having issues with RLS policies, create this function to bypass RLS:

```sql
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
```

### Step 3: Add Test Data

If you want to test the system with some sample data:

```sql
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
```

### Step 4: Verify Your Setup

Run these diagnostic queries to check your setup:

```sql
-- Check if the feedback table exists and has the correct structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'feedback';

-- Check if there are any feedback entries
SELECT COUNT(*) FROM public.feedback;

-- List all feedback entries
SELECT * FROM public.feedback ORDER BY created_at DESC LIMIT 10;

-- Check user types in profiles table
SELECT profiles.id, profiles.user_type, auth.users.raw_user_meta_data->>'userType' as metadata_user_type
FROM public.profiles
JOIN auth.users ON profiles.id = auth.users.id;

-- Check if your seller account has the correct permissions
SELECT 
    auth.uid() as current_user_id,
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) as user_type_from_profiles,
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.user_type = 'seller'
    ) as has_seller_permission;

-- Check if the RLS policy is correctly set up
SELECT * FROM pg_policies WHERE tablename = 'feedback';
```

## Using the Updated Feedback Page

The updated Feedback page includes several features to help troubleshoot issues:

1. **Debug Information**: Shows your user ID and user type
2. **Refresh Button**: Manually refreshes the feedback data
3. **Test Data Button**: Toggles between real data and mock data for testing
4. **Detailed Error Messages**: Provides more information about what's going wrong

## Common Issues and Solutions

### Issue: No Feedback Showing Up

**Possible causes and solutions:**

1. **No feedback entries exist**:
   - Check if there are any entries in the feedback table
   - Add test data using the SQL commands above

2. **RLS policies preventing access**:
   - Verify that your user account has `user_type = 'seller'` in the profiles table
   - Try using the `get_all_feedback()` function which bypasses RLS

3. **User type not set correctly**:
   - Check the debug information on the Feedback page to confirm your user type
   - Update your user type in the profiles table if needed

### Issue: Failed to Submit Feedback

**Possible causes and solutions:**

1. **Incorrect RLS policy syntax**:
   - Make sure you're using `WITH CHECK (true)` for the insert policy, not `USING (true)`

2. **Missing required fields**:
   - Ensure you're providing all required fields (feedback text and rating)

3. **Database connection issues**:
   - Check your browser console for network errors
   - Verify that your Supabase connection is working

### Issue: Permission Errors

**Possible causes and solutions:**

1. **RLS policies not set up correctly**:
   - Verify that the RLS policies are created correctly
   - Check if your user has the seller role in the profiles table

2. **Function permissions**:
   - Make sure you've granted execute permission on the `get_all_feedback()` function

## Testing the Fix

1. Log in as a seller and navigate to the Feedback page
2. Check the debug information to confirm your user type is "seller"
3. If no feedback is showing, click the "Use Test Data" button to see mock data
4. If mock data appears but real data doesn't, there's likely an issue with your database setup
5. Try clicking the "Refresh" button to fetch the data again
6. Check your browser console for any error messages

If you're still having issues after following these steps, please contact the development team for further assistance. 