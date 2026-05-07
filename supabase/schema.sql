-- ============================================================
-- Snapp.frame Studio — Supabase Schema + Seed
-- Paste ini ke Supabase SQL Editor dan klik Run
-- ============================================================

-- ─── Tabel: bookings ─────────────────────────────────────────

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

-- Siapa saja boleh insert (booking baru)
CREATE POLICY "anon can insert bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- User hanya bisa lihat booking miliknya sendiri (by phone)
CREATE POLICY "user can select own bookings"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (customer_phone = current_setting('request.jwt.claims', true)::json->>'phone');

-- Admin (service role) bisa select/update semua — service role bypass RLS otomatis


-- ─── Tabel: referral_codes ───────────────────────────────────

CREATE TABLE IF NOT EXISTS referral_codes (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text        UNIQUE NOT NULL,
  discount_pct  integer     NOT NULL CHECK (discount_pct BETWEEN 1 AND 100),
  owner_name    text        NOT NULL,
  is_active     boolean     NOT NULL DEFAULT true,
  usage_count   integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- RLS: referral_codes
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Siapa saja boleh lihat kode aktif
CREATE POLICY "anon can select active referral codes"
  ON referral_codes FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Hanya service role yang bisa insert/update (admin)


-- ─── Seed: referral_codes ────────────────────────────────────

INSERT INTO referral_codes (code, discount_pct, owner_name, is_active) VALUES
  ('SNAPP10',   10, 'Snapp.frame Official',  true),
  ('TEMAN15',   15, 'Partner Referral',      true),
  ('SPESIAL20', 20, 'VIP Member',            true),
  ('FOTO10',    10, 'Influencer Kolaborasi', true),
  ('PROMO15',   15, 'Promo Seasonal',        false)
ON CONFLICT (code) DO NOTHING;


-- ─── RPC: increment_referral_usage ──────────────────────────
-- Dipanggil dari client setelah booking berhasil disimpan.
-- Aman karena hanya increment counter — tidak expose data sensitif.

CREATE OR REPLACE FUNCTION increment_referral_usage(p_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE referral_codes
  SET usage_count = usage_count + 1
  WHERE UPPER(code) = UPPER(p_code);
$$;
