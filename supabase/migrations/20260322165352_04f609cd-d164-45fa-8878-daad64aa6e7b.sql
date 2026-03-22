UPDATE profiles
SET 
  first_name = CASE WHEN first_name IS NULL AND display_name IS NOT NULL AND position(' ' in display_name) > 0 
    THEN split_part(display_name, ' ', 1) ELSE first_name END,
  last_name = CASE WHEN last_name IS NULL AND display_name IS NOT NULL AND position(' ' in display_name) > 0 
    THEN substr(display_name, position(' ' in display_name) + 1) ELSE last_name END
WHERE first_name IS NULL AND display_name IS NOT NULL AND position(' ' in display_name) > 0;