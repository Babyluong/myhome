-- Migration: Add photo_url to unit_pemantauan and create suhu-equipment bucket
-- Migration number: 079

-- 1. Add photo_url column to unit_pemantauan if not exists
ALTER TABLE unit_pemantauan 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Create public storage bucket for suhu-equipment if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('suhu-equipment', 'suhu-equipment', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage access policies for suhu-equipment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Public Access Suhu Equipment'
  ) THEN
    CREATE POLICY "Public Access Suhu Equipment" ON storage.objects
      FOR SELECT USING (bucket_id = 'suhu-equipment');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Public Insert Suhu Equipment'
  ) THEN
    CREATE POLICY "Public Insert Suhu Equipment" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'suhu-equipment');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Public Update Suhu Equipment'
  ) THEN
    CREATE POLICY "Public Update Suhu Equipment" ON storage.objects
      FOR UPDATE USING (bucket_id = 'suhu-equipment');
  END IF;
END $$;
