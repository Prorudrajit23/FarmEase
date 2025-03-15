-- Add seller_id column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id);

-- Create index on seller_id for better query performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);

-- Update RLS policies for products table
DROP POLICY IF EXISTS "Allow public read access for products" ON public.products;
DROP POLICY IF EXISTS "Allow sellers to manage their own products" ON public.products;

-- Allow public read access to products
CREATE POLICY "Allow public read access for products" 
ON public.products FOR SELECT USING (true);

-- Allow sellers to insert their own products
CREATE POLICY "Allow sellers to insert their own products" 
ON public.products FOR INSERT WITH CHECK (
  auth.uid() = seller_id
);

-- Allow sellers to update their own products
CREATE POLICY "Allow sellers to update their own products" 
ON public.products FOR UPDATE USING (
  auth.uid() = seller_id
);

-- Allow sellers to delete their own products
CREATE POLICY "Allow sellers to delete their own products" 
ON public.products FOR DELETE USING (
  auth.uid() = seller_id
);

-- Add video_url column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;

-- Update sample products with video URLs
UPDATE public.products
SET video_url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
WHERE name = 'Tractor Model X';

UPDATE public.products
SET video_url = 'https://www.youtube.com/embed/jNQXAC9IVRw'
WHERE name = 'Harvester Pro';

UPDATE public.products
SET video_url = 'https://www.youtube.com/embed/8jLOx1hD3_o'
WHERE name = 'Organic Fertilizer (50lb)';

-- Update rental equipment descriptions to include structured specifications
UPDATE public.products
SET description = 'Heavy-duty tractor suitable for large farms with advanced features for efficient farming operations. 

Engine: 150HP Diesel, 
Weight: 5.2 tons, 
Transmission: 16-speed PowerShift, 
Fuel Capacity: 300L, 
Max Speed: 40 km/h, 
Hydraulic System: Closed-center load sensing, 
PTO: 540/1000 rpm'
WHERE name = 'Tractor Model X';

UPDATE public.products
SET description = 'Efficient harvesting machine with advanced grain separation technology. Ideal for wheat and corn harvesting with minimal grain loss.

Cutting Width: 7.6m, 
Grain Tank Capacity: 10,500L, 
Engine: 375HP Diesel, 
Threshing System: Rotary, 
Cleaning Area: 5.1 sq.m, 
Unloading Rate: 120L/sec, 
Fuel Consumption: 35L/hour'
WHERE name = 'Harvester Pro';

UPDATE public.products
SET description = 'Water-efficient irrigation system with smart controls. Covers up to 5 acres with adjustable spray patterns for optimal water distribution.

Coverage Area: 5 acres, 
Flow Rate: 500 GPM, 
Pressure Range: 40-60 PSI, 
Control System: Smart digital with app integration, 
Nozzle Types: Adjustable spray patterns, 
Power Source: Solar with battery backup, 
Water Conservation: 30% more efficient than standard systems'
WHERE name = 'Irrigation System'; 