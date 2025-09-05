-- Migration: Add is_gluten_free and is_vegan columns, remove delivery_link and pickup_link from menu_items
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS is_gluten_free boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_vegan boolean DEFAULT false;

ALTER TABLE menu_items
DROP COLUMN IF EXISTS delivery_link,
DROP COLUMN IF EXISTS pickup_link;

