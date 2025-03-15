# FarmEase Feedback System Fix

This document provides instructions for fixing the feedback system in the FarmEase application.

## Issue: Customer Feedbacks Not Showing for Seller Accounts

The main issues with the feedback system are:
1. Feedback submissions are failing
2. Sellers cannot view feedback
3. Buyers should not have access to the feedback page

## Solution

### 1. Fix Database Permissions

Run the following SQL commands in your Supabase SQL Editor to fix the feedback table permissions:

```sql
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

-- Make sure the profiles table has the user_type column and it's properly set
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type TEXT;

-- Update the user_type in profiles table for existing users if needed
-- This ensures that seller accounts have the correct user_type value
UPDATE public.profiles
SET user_type = auth.users.raw_user_meta_data->>'userType'
FROM auth.users
WHERE profiles.id = auth.users.id
AND (profiles.user_type IS NULL OR profiles.user_type = '');
```

### 2. Verify User Types in Profiles Table

After running the SQL commands, check if the user types are correctly set in the profiles table:

```sql
-- Check user types in profiles table
SELECT profiles.id, profiles.user_type, auth.users.raw_user_meta_data->>'userType' as metadata_user_type
FROM public.profiles
JOIN auth.users ON profiles.id = auth.users.id;
```

### 3. Check Feedback Table

Verify that the feedback table exists and has the correct structure:

```sql
-- Check if feedback table exists and has the correct structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'feedback';

-- Check if there are any feedback entries
SELECT COUNT(*) FROM public.feedback;
```

### 4. Test Feedback Submission

After applying these fixes:
1. Log in as a buyer and submit feedback through the footer dialog
2. Log in as a seller and check if you can see the feedback on the Feedback page
3. Verify that buyers cannot access the Feedback page

## Changes Made to the Application

1. **Feedback Page**:
   - Added better error handling and debugging information
   - Improved loading states and user experience
   - Enhanced security to ensure only sellers can access the page

2. **Index Page**:
   - Updated to hide testimonials section for sellers

3. **Database**:
   - Fixed Row Level Security (RLS) policies for the feedback table
   - Ensured user types are correctly set in the profiles table

## Troubleshooting

If you still encounter issues:

1. Check the browser console for specific error messages
2. Look at the debug information displayed on the Feedback page
3. Verify that your user account has the correct user type in the profiles table
4. Ensure that the SQL commands were executed successfully

For any further assistance, please contact the development team. 