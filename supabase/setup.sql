-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL DEFAULT 'https://placehold.co/600x400?text=Product+Image',
    category_id UUID REFERENCES public.categories(id),
    stock INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name TEXT,
    last_name TEXT,
    user_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO public.categories (name) VALUES
    ('Equipment'),
    ('Organic'),
    ('Produce'),
    ('General');

-- Insert sample products for Equipment category
INSERT INTO public.products (name, price, description, image, category_id, stock)
SELECT 
    'Tractor Model X', 
    '$150/day', 
    'Heavy-duty tractor suitable for large farms. Features include GPS navigation and climate-controlled cabin.',
    'https://images.unsplash.com/photo-1605002633516-bcc8fcf8c99a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    id,
    5
FROM public.categories WHERE name = 'Equipment';

INSERT INTO public.products (name, price, description, image, category_id, stock)
SELECT 
    'Harvester Pro', 
    '$200/day', 
    'Efficient harvesting machine with advanced grain separation technology. Ideal for wheat and corn.',
    'https://images.unsplash.com/photo-1591086968925-1a2e2a8e4d7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    id,
    3
FROM public.categories WHERE name = 'Equipment';

INSERT INTO public.products (name, price, description, image, category_id, stock)
SELECT 
    'Irrigation System', 
    '$75/day', 
    'Water-efficient irrigation system with smart controls. Covers up to 5 acres with adjustable spray patterns.',
    'https://images.unsplash.com/photo-1586177726072-b99c0dfd8db0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    id,
    8
FROM public.categories WHERE name = 'Equipment';

-- Insert sample products for Organic category
INSERT INTO public.products (name, price, description, image, category_id, stock)
SELECT 
    'Organic Fertilizer (50lb)', 
    '$45.99', 
    'Premium organic fertilizer made from composted plant materials. Enriches soil and promotes healthy plant growth.',
    'https://images.unsplash.com/photo-1585202732907-5ea8ab1c1b9e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    id,
    20
FROM public.categories WHERE name = 'Organic';

INSERT INTO public.products (name, price, description, image, category_id, stock)
SELECT 
    'Organic Pest Control', 
    '$29.99', 
    'Natural pest control solution that protects crops without harmful chemicals. Safe for beneficial insects.',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    id,
    15
FROM public.categories WHERE name = 'Organic';

-- Insert sample products for Produce category
INSERT INTO public.products (name, price, description, image, category_id, stock)
SELECT 
    'Fresh Tomatoes (5lb)', 
    '$12.99', 
    'Locally grown organic tomatoes. Perfect for salads, sauces, and sandwiches.',
    'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    id,
    30
FROM public.categories WHERE name = 'Produce';

INSERT INTO public.products (name, price, description, image, category_id, stock)
SELECT 
    'Organic Apples (3lb)', 
    '$8.99', 
    'Sweet and crisp apples grown without pesticides. Great for snacking or baking.',
    'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    id,
    25
FROM public.categories WHERE name = 'Produce';

-- Insert sample products for General category
INSERT INTO public.products (name, price, description, image, category_id, stock)
SELECT 
    'Gardening Tool Set', 
    '$39.99', 
    'Complete set of essential gardening tools including trowel, pruners, and gloves. Made with durable materials.',
    'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    id,
    12
FROM public.categories WHERE name = 'General';

INSERT INTO public.products (name, price, description, image, category_id, stock)
SELECT 
    'Weather Station', 
    '$89.99', 
    'Digital weather station that monitors temperature, humidity, and rainfall. Helps optimize planting and irrigation.',
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    id,
    7
FROM public.categories WHERE name = 'General';

-- Create RLS policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories and products
CREATE POLICY "Allow public read access for categories" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Allow public read access for products" 
ON public.products FOR SELECT USING (true);

-- Allow authenticated users to read their own profile
CREATE POLICY "Allow users to read own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create a trigger to create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type)
  VALUES (new.id, new.raw_user_meta_data->>'userType');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 