
-- Create storage bucket for member avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('member-avatars', 'member-avatars', true);

-- Allow authenticated users to upload files to the bucket
CREATE POLICY "Authenticated users can upload member avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'member-avatars');

-- Allow anyone to view member avatars (public bucket)
CREATE POLICY "Anyone can view member avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'member-avatars');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update member avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'member-avatars');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete member avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'member-avatars');
