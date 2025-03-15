-- Update categories to ensure consistency between seller and buyer views
-- First, check if we need to update any categories
SELECT * FROM public.categories;

-- If the categories are Equipment, Organic, Produce, and General, no changes needed
-- If there are Fruits and Vegetables categories instead of Produce, run the following:

/*
-- Create Produce category if it doesn't exist
INSERT INTO public.categories (name)
SELECT 'Produce'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Produce');

-- Get the ID of the Produce category
DO $$
DECLARE
    produce_id UUID;
    fruits_id UUID;
    vegetables_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO produce_id FROM public.categories WHERE name = 'Produce';
    SELECT id INTO fruits_id FROM public.categories WHERE name = 'Fruits';
    SELECT id INTO vegetables_id FROM public.categories WHERE name = 'Vegetables';
    
    -- Update products from Fruits and Vegetables categories to Produce
    IF fruits_id IS NOT NULL THEN
        UPDATE public.products 
        SET category_id = produce_id 
        WHERE category_id = fruits_id;
    END IF;
    
    IF vegetables_id IS NOT NULL THEN
        UPDATE public.products 
        SET category_id = produce_id 
        WHERE category_id = vegetables_id;
    END IF;
    
    -- Delete Fruits and Vegetables categories if they exist
    IF fruits_id IS NOT NULL THEN
        DELETE FROM public.categories WHERE id = fruits_id;
    END IF;
    
    IF vegetables_id IS NOT NULL THEN
        DELETE FROM public.categories WHERE id = vegetables_id;
    END IF;
END $$;
*/ 