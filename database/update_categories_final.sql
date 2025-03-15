-- First, check if the General category exists and has any products
DO $$
DECLARE
    general_id UUID;
    equipment_id UUID;
    organic_id UUID;
    produce_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO general_id FROM public.categories WHERE name = 'General';
    SELECT id INTO equipment_id FROM public.categories WHERE name = 'Equipment';
    SELECT id INTO organic_id FROM public.categories WHERE name = 'Organic';
    SELECT id INTO produce_id FROM public.categories WHERE name = 'Produce';
    
    -- If General category exists, move its products to appropriate categories
    IF general_id IS NOT NULL THEN
        -- Move general products to Produce by default (can be changed by sellers later)
        UPDATE public.products 
        SET category_id = produce_id 
        WHERE category_id = general_id;
        
        -- Delete the General category
        DELETE FROM public.categories WHERE id = general_id;
    END IF;
    
    -- Update category names
    UPDATE public.categories 
    SET name = 'Rental Equipment' 
    WHERE name = 'Equipment';
    
    UPDATE public.categories 
    SET name = 'Organic Produce' 
    WHERE name = 'Organic';
    
    UPDATE public.categories 
    SET name = 'Fruits and Vegetables' 
    WHERE name = 'Produce';
END $$; 