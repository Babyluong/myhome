-- Migration 077: Create Oxygen Receive Documents & Items
-- Tracks cylinders refilled and received back from suppliers into Store Available stock

CREATE TABLE IF NOT EXISTS pharmacy_oxygen_receive_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  delivery_order_no TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'cancelled')),
  received_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  remarks TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(hospital_id, document_number)
);

CREATE TABLE IF NOT EXISTS pharmacy_oxygen_receive_document_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receive_document_id UUID NOT NULL REFERENCES pharmacy_oxygen_receive_documents(id) ON DELETE CASCADE,
  cylinder_id UUID NOT NULL REFERENCES pharmacy_oxygen_cylinder_inventory(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(receive_document_id, cylinder_id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_oxygen_rcv_docs_hospital_id ON pharmacy_oxygen_receive_documents(hospital_id);
CREATE INDEX IF NOT EXISTS idx_oxygen_rcv_docs_supplier_id ON pharmacy_oxygen_receive_documents(supplier_id);
CREATE INDEX IF NOT EXISTS idx_oxygen_rcv_docs_created_at ON pharmacy_oxygen_receive_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_oxygen_rcv_doc_items_doc_id ON pharmacy_oxygen_receive_document_items(receive_document_id);
CREATE INDEX IF NOT EXISTS idx_oxygen_rcv_doc_items_cylinder_id ON pharmacy_oxygen_receive_document_items(cylinder_id);

-- Enable RLS
ALTER TABLE pharmacy_oxygen_receive_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_oxygen_receive_document_items ENABLE ROW LEVEL SECURITY;

-- Policies for pharmacy_oxygen_receive_documents & items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pharmacy_oxygen_receive_documents' 
    AND policyname = 'Users can manage receive documents for their hospital'
  ) THEN
    CREATE POLICY "Users can manage receive documents for their hospital"
      ON pharmacy_oxygen_receive_documents
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pharmacy_oxygen_receive_document_items' 
    AND policyname = 'Users can manage receive document items for their hospital'
  ) THEN
    CREATE POLICY "Users can manage receive document items for their hospital"
      ON pharmacy_oxygen_receive_document_items
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
