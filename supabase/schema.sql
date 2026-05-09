-- ============================================================
-- Snapp.frame Studio — Supabase Schema (Sync with Prisma)
-- ============================================================

-- 1. ENUM DEFINITIONS (Untuk sinkronisasi dengan Prisma)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReferralType') THEN
        CREATE TYPE "ReferralType" AS ENUM ('PERCENTAGE', 'FIXED');
    END IF;
END $$;

-- 2. TABEL: referral_codes (Disesuaikan dengan model Prisma)
CREATE TABLE IF NOT EXISTS referral_codes (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text          UNIQUE NOT NULL,
  label         text          DEFAULT '',
  type          "ReferralType" DEFAULT 'PERCENTAGE',
  discount_pct  numeric       NOT NULL, -- Map ke 'value' di Prisma
  expiry_date   timestamptz,
  usage_limit   integer,
  usage_count   integer       NOT NULL DEFAULT 0,
  is_active     boolean       NOT NULL DEFAULT true,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

-- RLS: referral_codes
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can select active referral codes"
  ON referral_codes FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- 3. TABEL: bookings (Khusus untuk Online Booking)
CREATE TABLE IF NOT EXISTS bookings (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no      text        UNIQUE NOT NULL,
  package_id      text        NOT NULL,
  package_name    text        NOT NULL,
  customer_name   text        NOT NULL,
  customer_phone  text        NOT NULL,
  session_date    date        NOT NULL,
  session_time    text        NOT NULL,
  notes           text,
  referral_code   text,
  discount_pct    integer     NOT NULL DEFAULT 0,
  original_price  integer     NOT NULL,
  final_price     integer     NOT NULL,
  payment_method  text        NOT NULL CHECK (payment_method IN ('qris', 'transfer')),
  status          text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- RLS: bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Siapa saja boleh insert (untuk web booking publik)
CREATE POLICY "anon can insert bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- User hanya bisa lihat booking miliknya sendiri (berdasarkan nomor telepon di metadata)
CREATE POLICY "user can select own bookings"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (
    customer_phone = (auth.jwt() -> 'user_metadata' ->> 'phone') 
    OR 
    customer_phone = (auth.jwt() ->> 'phone')
  );

-- 4. RPC: increment_referral_usage
-- Digunakan untuk menambah counter pemakaian kode promo
CREATE OR REPLACE FUNCTION increment_referral_usage(p_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE referral_codes
  SET usage_count = usage_count + 1
  WHERE UPPER(code) = UPPER(p_code);
$$;

-- 5. SEED DATA (Opsional)
INSERT INTO referral_codes (code, label, type, discount_pct, is_active) 
VALUES
  ('SNAPP10', 'Official Discount', 'PERCENTAGE', 10, true),
  ('FOTO15', 'Promo Opening', 'PERCENTAGE', 15, true)
ON CONFLICT (code) DO NOTHING;
