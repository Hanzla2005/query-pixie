-- Create storage bucket for datasets
INSERT INTO storage.buckets (id, name, public)
VALUES ('datasets', 'datasets', false);

-- Allow authenticated users to upload their own datasets
CREATE POLICY "Users can upload their own datasets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'datasets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read their own datasets
CREATE POLICY "Users can read their own datasets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'datasets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own datasets
CREATE POLICY "Users can delete their own datasets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'datasets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);