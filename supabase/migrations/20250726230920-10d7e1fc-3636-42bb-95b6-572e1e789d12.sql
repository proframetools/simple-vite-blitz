-- Make the customer-photos bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'customer-photos';

-- Create policies for public access to customer photos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-photos');

CREATE POLICY "Allow authenticated uploads to customer-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'customer-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates to customer-photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'customer-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated deletes from customer-photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'customer-photos' AND auth.role() = 'authenticated');