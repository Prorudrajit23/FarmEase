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