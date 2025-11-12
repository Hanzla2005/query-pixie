-- Add preprocessing columns to datasets table
ALTER TABLE public.datasets
ADD COLUMN IF NOT EXISTS preprocessing_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS preprocessing_metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS original_row_count integer,
ADD COLUMN IF NOT EXISTS processed_row_count integer;