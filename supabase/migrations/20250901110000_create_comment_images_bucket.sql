-- Create storage bucket for comment images
INSERT INTO storage.buckets (id, name, public) VALUES ('comment_images', 'comment_images', true);

-- Set up RLS policies for the new bucket
CREATE POLICY "Allow public read access to comment images" ON storage.objects FOR SELECT USING (bucket_id = 'comment_images');
CREATE POLICY "Allow authenticated users to upload comment images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'comment_images' AND auth.role() = 'authenticated');
