-- ============================================================
-- schema.sql – วาง paste ใน Supabase SQL Editor
-- ============================================================

-- Table: loans
CREATE TABLE IF NOT EXISTS loans (
  id                 uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number    text    NOT NULL UNIQUE,
  customer_name      text    NOT NULL,
  customer_phone     text,
  customer_id_card   text,
  loan_amount        numeric NOT NULL,
  interest_rate      numeric NOT NULL,
  interest_type      text    NOT NULL DEFAULT 'reducing',  -- 'reducing' | 'flat'
  installments       integer NOT NULL,
  payment_frequency  text    NOT NULL DEFAULT 'monthly',   -- 'monthly' | 'weekly' | 'daily'
  start_date         date    NOT NULL,
  total_amount       numeric NOT NULL,
  monthly_payment    numeric NOT NULL,
  status             text    NOT NULL DEFAULT 'active',    -- 'active' | 'completed' | 'overdue' | 'cancelled'
  qr_code_url        text,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- Table: payments
CREATE TABLE IF NOT EXISTS payments (
  id                 uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id            uuid    NOT NULL REFERENCES loans(id),
  installment_number integer NOT NULL,
  due_date           date    NOT NULL,
  principal_amount   numeric NOT NULL DEFAULT 0,
  interest_amount    numeric NOT NULL DEFAULT 0,
  total_amount       numeric NOT NULL,
  paid_amount        numeric DEFAULT 0,
  paid_date          date,
  payment_method     text,                                 -- 'cash' | 'transfer' | 'check'
  receipt_number     text,
  notes              text,
  status             text    NOT NULL DEFAULT 'pending',   -- 'pending' | 'paid' | 'partial' | 'overdue'
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- Index สำหรับ query เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loans_contract   ON loans(contract_number);
CREATE INDEX IF NOT EXISTS idx_loans_status     ON loans(status);

-- RLS Policies (อ่านเท่า สำหรับ anon)
ALTER TABLE loans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read loans"    ON loans    FOR SELECT USING (true);
CREATE POLICY "anon can read payments" ON payments FOR SELECT USING (true);

CREATE POLICY "auth can do all on loans"    ON loans    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth can do all on payments" ON payments FOR ALL USING (auth.role() = 'authenticated');
