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

-- Check if there are any feedback entries
SELECT COUNT(*) FROM public.feedback;

-- List all feedback entries (for debugging)
SELECT * FROM public.feedback ORDER BY created_at DESC LIMIT 10; 