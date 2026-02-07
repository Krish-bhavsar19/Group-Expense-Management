-- Fix: Delete duplicate expense if it exists
-- Check for duplicates first
SELECT id, description, amount, paid_by, created_at 
FROM expenses 
WHERE group_id = 1
ORDER BY created_at DESC;

-- If you see duplicates with the same created_at time, delete one:
-- DELETE FROM expenses WHERE id = [the_duplicate_id];

-- Or delete all expenses and start fresh (if needed):
-- DELETE FROM expenses WHERE group_id = 1;
