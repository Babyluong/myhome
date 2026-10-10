-- ====================================================================================
-- Migration: 084_create_system_announcements_table.sql
-- Module: System Admin & Hub - System Maintenance, Announcements & Update Logs
-- ====================================================================================

CREATE TABLE IF NOT EXISTS system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('maintenance', 'system_update', 'advisory', 'incident')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical', 'urgent')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'resolved', 'archived')),
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  version_tag TEXT,
  affected_modules TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_announcements_status ON system_announcements(status);
CREATE INDEX IF NOT EXISTS idx_system_announcements_type ON system_announcements(type);
CREATE INDEX IF NOT EXISTS idx_system_announcements_is_active ON system_announcements(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_system_announcements_created_at ON system_announcements(created_at DESC);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_system_announcements_updated_at ON system_announcements;
CREATE TRIGGER update_system_announcements_updated_at
  BEFORE UPDATE ON system_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "allow_read_system_announcements" ON system_announcements;
CREATE POLICY "allow_read_system_announcements"
  ON system_announcements
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "allow_insert_system_announcements" ON system_announcements;
CREATE POLICY "allow_insert_system_announcements"
  ON system_announcements
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "allow_update_system_announcements" ON system_announcements;
CREATE POLICY "allow_update_system_announcements"
  ON system_announcements
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "allow_delete_system_announcements" ON system_announcements;
CREATE POLICY "allow_delete_system_announcements"
  ON system_announcements
  FOR DELETE
  USING (true);

-- Grants
GRANT ALL ON system_announcements TO authenticated;
GRANT ALL ON system_announcements TO anon;
GRANT ALL ON system_announcements TO service_role;

-- Realtime Publication
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE system_announcements;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Seed genuine baseline system release record
INSERT INTO system_announcements (
  title,
  content,
  type,
  severity,
  status,
  version_tag,
  affected_modules,
  created_by_name,
  is_active
) VALUES (
  'Peningkatan Sistem & Portal Operasi Hospital Lawas v2.4.0',
  'Penstrukturan semula rekabentuk paparan desktop hab operasi, pengaktifan sistem notis penyelenggaraan berjadual secara langsung, dan log kemaskini sistem bersepadu.',
  'system_update',
  'info',
  'published',
  'v2.4.0',
  ARRAY['Semua Modul'],
  'Pentadbir Sistem',
  true
);

INSERT INTO system_announcements (
  title,
  content,
  type,
  severity,
  status,
  version_tag,
  affected_modules,
  created_by_name,
  is_active
) VALUES (
  'Peningkatan Antaramuka Hab Operasi & Pembaikan Tipografi v2.4.1',
  '• Penyingkiran bar carian di Hab Modul untuk navigasi yang lebih kemas, teratur dan pantas.
• Pembaikan tipografi ikon modul mobile: Nama modul (MyPrepacking, MyPriviledging, MyTransporter dll.) kini kekal 1 baris kemas tanpa sebarang pecahan huruf ke baris kedua.
• Penyelarasan log kemaskini sistem dinamik bagi setiap pelepasan produksi (Vercel production).
• Pengoptimuman prestasi muat turun komponen dan pembersihan cache sistem.',
  'system_update',
  'info',
  'published',
  'v2.4.1',
  ARRAY['Hab Modul', 'Sistem Keseluruhan'],
  'Pentadbir Sistem H.O.M.E.',
  true
);
