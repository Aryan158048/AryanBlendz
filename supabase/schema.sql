-- ============================================================
-- Aryan Blendz — Database Schema
-- PostgreSQL / Supabase
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

-- Users (managed by Supabase Auth, extended here)
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'barber', 'customer')),
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Barbers
CREATE TABLE IF NOT EXISTS barbers (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        REFERENCES users(id) ON DELETE SET NULL,
  name             TEXT        NOT NULL,
  bio              TEXT,
  specialties      JSONB       NOT NULL DEFAULT '[]',
  avatar_url       TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  instagram        TEXT,
  years_experience INTEGER,
  rating           NUMERIC(3,2),
  total_reviews    INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  description   TEXT,
  duration      INTEGER     NOT NULL CHECK (duration > 0), -- minutes
  price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category      TEXT        NOT NULL CHECK (category IN ('haircut', 'beard', 'combo', 'kids', 'premium', 'other')),
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  display_order INTEGER     NOT NULL DEFAULT 0,
  image_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  phone        TEXT,
  notes        TEXT,
  total_visits INTEGER     NOT NULL DEFAULT 0,
  last_visit   DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID        NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  barber_id         UUID        NOT NULL REFERENCES barbers(id) ON DELETE RESTRICT,
  service_id        UUID        NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  date              DATE        NOT NULL,
  time              TIME        NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes             TEXT,
  total_price       NUMERIC(10,2) NOT NULL,
  deposit_paid      BOOLEAN     NOT NULL DEFAULT FALSE,
  confirmation_code TEXT        NOT NULL UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date        ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_barber_date ON appointments(barber_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_customer    ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_code        ON appointments(confirmation_code);

-- Availability (recurring weekly schedule per barber)
CREATE TABLE IF NOT EXISTS availability (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id    UUID    NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
  start_time   TIME    NOT NULL,
  end_time     TIME    NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(barber_id, day_of_week)
);

-- Blocked Dates (one-off unavailability)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id  UUID        REFERENCES barbers(id) ON DELETE CASCADE, -- NULL = whole shop
  date       DATE        NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_barber ON blocked_dates(barber_id, date);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id                          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id              UUID        NOT NULL REFERENCES appointments(id) ON DELETE RESTRICT,
  amount                      NUMERIC(10,2) NOT NULL,
  status                      TEXT        NOT NULL DEFAULT 'pending'
                                          CHECK (status IN ('pending', 'paid', 'refunded')),
  stripe_payment_intent_id    TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings (key-value store for app config)
CREATE TABLE IF NOT EXISTS settings (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT        NOT NULL UNIQUE,
  value      JSONB       NOT NULL DEFAULT 'null',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ────────────────────────────────────────────────────────────

-- Auto-update updated_at on appointments
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update settings.updated_at
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability   ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings       ENABLE ROW LEVEL SECURITY;

-- Services: public read, admin write
CREATE POLICY "services_public_read"
  ON services FOR SELECT USING (is_active = TRUE);

CREATE POLICY "services_admin_all"
  ON services FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Barbers: public read (active only), admin write
CREATE POLICY "barbers_public_read"
  ON barbers FOR SELECT USING (is_active = TRUE);

CREATE POLICY "barbers_admin_all"
  ON barbers FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Availability: public read
CREATE POLICY "availability_public_read"
  ON availability FOR SELECT USING (TRUE);

CREATE POLICY "availability_admin_all"
  ON availability FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Blocked dates: public read
CREATE POLICY "blocked_dates_public_read"
  ON blocked_dates FOR SELECT USING (TRUE);

CREATE POLICY "blocked_dates_admin_all"
  ON blocked_dates FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Appointments: owner or admin
CREATE POLICY "appointments_owner_select"
  ON appointments FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
      OR auth.jwt() ->> 'role' = 'admin'
      OR auth.jwt() ->> 'role' = 'barber'
    )
  );

CREATE POLICY "appointments_insert_authenticated"
  ON appointments FOR INSERT
  WITH CHECK (TRUE); -- Allow booking without auth (guest booking via confirmation code)

CREATE POLICY "appointments_update_owner_admin"
  ON appointments FOR UPDATE
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- Customers: owner or admin
CREATE POLICY "customers_owner_select"
  ON customers FOR SELECT
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "customers_insert"
  ON customers FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "customers_update_owner_admin"
  ON customers FOR UPDATE
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Users: own row
CREATE POLICY "users_owner_select"
  ON users FOR SELECT USING (id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "users_update_owner"
  ON users FOR UPDATE USING (id = auth.uid());

-- Settings: admin only
CREATE POLICY "settings_admin_all"
  ON settings FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Payments: owner or admin
CREATE POLICY "payments_owner_select"
  ON payments FOR SELECT
  USING (
    appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      WHERE c.user_id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- ────────────────────────────────────────────────────────────
-- SEED DATA
-- ────────────────────────────────────────────────────────────

-- Seed services
INSERT INTO services (name, description, duration, price, category, is_active, display_order)
VALUES
  ('Classic Haircut',
   'Precision cut tailored to your face shape and style preference. Includes wash, cut, and styling.',
   45, 35.00, 'haircut', TRUE, 1),
  ('Beard Trim & Shape',
   'Expert beard sculpting, trimming, and lining to give your beard a clean, defined look.',
   30, 25.00, 'beard', TRUE, 2),
  ('Lineup / Edge Up',
   'Sharp, clean lines on your hairline, temples, and neck for a fresh, polished finish.',
   20, 20.00, 'haircut', TRUE, 3),
  ('Haircut + Beard Combo',
   'The full package — precision haircut combined with a beard trim and lineup for the complete look.',
   70, 55.00, 'combo', TRUE, 4),
  ('Kids Cut (12 & Under)',
   'Gentle, patient haircuts for the little ones. We make sure every kid leaves smiling.',
   30, 25.00, 'kids', TRUE, 5),
  ('Premium Grooming Package',
   'The ultimate experience: haircut, hot towel shave, beard sculpting, scalp massage, and styling.',
   90, 75.00, 'premium', TRUE, 6)
ON CONFLICT DO NOTHING;

-- Seed barbers (user_id left NULL for seed; link after auth setup)
INSERT INTO barbers (name, bio, specialties, is_active, instagram, years_experience, rating, total_reviews)
VALUES
  ('Aryan',
   'Founder of Aryan Blendz with over 8 years of experience. Specializes in fades, skin taper cuts, and creative hair designs.',
   '["Skin Fades", "Tapers", "Hair Designs", "Beard Sculpting"]',
   TRUE, '@aryanblendz', 8, 4.9, 312),
  ('Marcus',
   'A master of classic cuts and modern styles. 6 years experience with a passion for curly hair textures and textured fades.',
   '["Classic Cuts", "Textured Fades", "Curly Hair", "Hot Towel Shave"]',
   TRUE, '@marcus_cuts', 6, 4.8, 228),
  ('Jerome',
   'Jerome is the go-to guy for premium grooming and straight razor shaves. 5 years of precision work.',
   '["Straight Razor Shave", "Low Fades", "Beard Grooming", "Kids Cuts"]',
   TRUE, '@jerome_shaves', 5, 4.8, 184),
  ('Darius',
   'Trained at one of New York''s top barbering schools. Brings fresh energy, creative designs, and solid fundamentals.',
   '["Creative Designs", "High Fades", "Afro Styling", "Lineups"]',
   TRUE, '@darius_blendz', 3, 4.7, 96)
ON CONFLICT DO NOTHING;

-- Seed default availability for all barbers
DO $$
DECLARE
  barber_row barbers%ROWTYPE;
BEGIN
  FOR barber_row IN SELECT * FROM barbers LOOP
    INSERT INTO availability (barber_id, day_of_week, start_time, end_time, is_available)
    VALUES
      (barber_row.id, 0, '10:00', '17:00', TRUE),  -- Sunday
      (barber_row.id, 1, '09:00', '19:00', TRUE),  -- Monday
      (barber_row.id, 2, '09:00', '19:00', TRUE),  -- Tuesday
      (barber_row.id, 3, '09:00', '19:00', TRUE),  -- Wednesday
      (barber_row.id, 4, '09:00', '19:00', TRUE),  -- Thursday
      (barber_row.id, 5, '09:00', '20:00', TRUE),  -- Friday
      (barber_row.id, 6, '09:00', '18:00', TRUE)   -- Saturday
    ON CONFLICT (barber_id, day_of_week) DO NOTHING;
  END LOOP;
END;
$$;

-- Seed settings
INSERT INTO settings (key, value)
VALUES
  ('deposit_required',    'true'),
  ('deposit_amount',      '10'),
  ('slot_duration',       '30'),
  ('max_advance_days',    '60'),
  ('cancellation_hours',  '24'),
  ('email_notifications', 'true'),
  ('sms_reminders',       'false'),
  ('reminder_hours',      '24'),
  ('shop_name',           '"Aryan Blendz"'),
  ('shop_address',        '"123 Main Street, New York, NY 10001"'),
  ('shop_phone',          '"(555) 012-3456"'),
  ('shop_email',          '"hello@aryanblendz.com"'),
  ('shop_instagram',      '"@aryanblendz"')
ON CONFLICT (key) DO NOTHING;
