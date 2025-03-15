# FarmEase Feedback System Setup

This document provides instructions for setting up and troubleshooting the feedback system in the FarmEase application.

## Database Setup

To fix the "Failed to submit feedback" issue, you need to create the feedback table in your Supabase database. Run the following SQL commands in the Supabase SQL Editor:

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

-- Create policy to allow anyone to insert feedback
CREATE POLICY "Allow anyone to insert feedback" 
ON public.feedback 
FOR INSERT 
TO authenticated, anon
USING (true);

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

-- Create an index on user_id for better performance
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback(user_id);

-- Create an index on created_at for better sorting performance
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback(created_at);
```

## Changes Made

The following changes have been made to fix the feedback system:

1. **Footer Component**:
   - Added a check to ensure the feedback table exists before submitting
   - Improved error handling with specific error messages
   - Added validation for the rating field
   - Hidden the feedback button for sellers
   - Updated the Quick Links section to show different links for buyers and sellers

2. **Feedback Page**:
   - Improved the empty state display when there's no feedback
   - Added better error handling
   - Enhanced the user experience with a helpful tips section
   - Ensured only sellers can access this page

3. **Database**:
   - Created the feedback table with proper structure
   - Set up Row Level Security (RLS) to control access
   - Added appropriate indexes for better performance

## Troubleshooting

If you still encounter issues with the feedback system:

1. Check the browser console for specific error messages
2. Verify that the SQL commands were executed successfully
3. Ensure that the user_type field is correctly set in the profiles table
4. Check that the RLS policies are working as expected

For any further assistance, please contact the development team. 