-- ============================================================
-- Aryan Blendz — Seed Data
-- PostgreSQL / Supabase
--
-- Run this AFTER schema.sql has been applied.
-- Uses hardcoded UUIDs so foreign key references are stable.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- BARBERS
-- ────────────────────────────────────────────────────────────

INSERT INTO barbers (id, name, bio, specialties, is_active, instagram, years_experience, rating, total_reviews, display_order)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'Aryan',
    'Founder of Aryan Blendz with over 8 years of experience. A true craftsman behind the chair — specializes in flawless skin fades, razor-sharp tapers, and intricate hair designs that set the standard.',
    '["Skin Fades", "Tapers", "Hair Designs", "Beard Sculpting"]',
    TRUE,
    '@aryanblendz',
    8,
    4.9,
    312,
    1
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    'Marcus',
    'A master of classic cuts and modern styles with 6 years of precision work. Marcus has a deep passion for curly and textured hair — every client leaves with a cut that suits their natural texture and lifestyle.',
    '["Classic Cuts", "Textured Fades", "Curly Hair", "Hot Towel Shave"]',
    TRUE,
    '@marcus_cuts',
    6,
    4.8,
    228,
    2
  ),
  (
    'b3000000-0000-0000-0000-000000000003',
    'Jordan',
    'Jordan brings 5 years of premium grooming expertise to every appointment. Known for immaculate straight razor shaves and low fades with surgical precision, Jordan is the go-to for the complete grooming experience.',
    '["Straight Razor Shave", "Low Fades", "Beard Grooming", "Kids Cuts"]',
    TRUE,
    '@jordan_shaves',
    5,
    4.8,
    184,
    3
  )
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- SERVICES
-- ────────────────────────────────────────────────────────────

INSERT INTO services (id, name, description, duration, price, category, is_active, display_order)
VALUES
  (
    's1000000-0000-0000-0000-000000000001',
    'Classic Haircut',
    'A precision cut tailored to your face shape and personal style. Includes a wash, cut, and styling finish with product.',
    45,
    35.00,
    'haircut',
    TRUE,
    1
  ),
  (
    's2000000-0000-0000-0000-000000000002',
    'Beard Trim & Shape',
    'Expert beard sculpting, trimming, and lining to give your beard a clean, defined look. Finished with beard oil.',
    30,
    25.00,
    'beard',
    TRUE,
    2
  ),
  (
    's3000000-0000-0000-0000-000000000003',
    'Lineup / Edge Up',
    'Sharp, clean lines on your hairline, temples, and neck for a fresh, polished finish between full cuts.',
    20,
    20.00,
    'haircut',
    TRUE,
    3
  ),
  (
    's4000000-0000-0000-0000-000000000004',
    'Haircut + Beard Combo',
    'The full package — precision haircut combined with a beard trim and lineup. Walk out looking completely dialed in.',
    70,
    55.00,
    'combo',
    TRUE,
    4
  ),
  (
    's5000000-0000-0000-0000-000000000005',
    'Kids Cut (12 & Under)',
    'Gentle, patient haircuts for the little ones. We make sure every kid leaves happy, styled, and looking sharp.',
    30,
    25.00,
    'kids',
    TRUE,
    5
  ),
  (
    's6000000-0000-0000-0000-000000000006',
    'Premium Grooming Package',
    'The ultimate experience: precision haircut, hot towel straight razor shave, beard sculpting, scalp massage, and professional styling. The pinnacle of the Aryan Blendz experience.',
    90,
    75.00,
    'premium',
    TRUE,
    6
  )
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- CUSTOMERS
-- ────────────────────────────────────────────────────────────

INSERT INTO customers (id, name, email, phone, notes, total_visits, last_visit)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'James Carter',   'james.carter@gmail.com',    '(555) 201-4411', 'Prefers skin fades. Sensitive scalp — use gentle products.',       12, '2026-03-10'),
  ('c2000000-0000-0000-0000-000000000002', 'Marcus Webb',    'marcus.webb@outlook.com',   '(555) 312-8823', 'Monthly regular. Always books the combo cut.',                    8,  '2026-03-05'),
  ('c3000000-0000-0000-0000-000000000003', 'Devon Price',    'devon.price@gmail.com',     '(555) 447-9934', 'Curly hair, goes to Marcus exclusively.',                          5,  '2026-02-28'),
  ('c4000000-0000-0000-0000-000000000004', 'Khalil Nasser',  'khalil.n@icloud.com',       '(555) 518-6671', 'Requests a hot towel shave every time. Very punctual.',            3,  '2026-03-15'),
  ('c5000000-0000-0000-0000-000000000005', 'Tyler Brooks',   'tyler.brooks@yahoo.com',    '(555) 623-0045', 'Brings his son for kids cuts too.',                               6,  '2026-03-01'),
  ('c6000000-0000-0000-0000-000000000006', 'Anthony Silva',  'anthony.silva@gmail.com',   '(555) 734-5522', 'New client. Referred by James Carter.',                           1,  '2026-03-20'),
  ('c7000000-0000-0000-0000-000000000007', 'Reuben Grant',   'reuben.grant@proton.me',    '(555) 845-7890', 'Premium package only. Tips generously.',                          4,  '2026-03-12'),
  ('c8000000-0000-0000-0000-000000000008', 'Simone Jackson', 'simone.j@gmail.com',        '(555) 956-3310', 'Lineup and beard trim combo. Books 2 weeks in advance.',         7,  '2026-03-18')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- APPOINTMENTS
-- ────────────────────────────────────────────────────────────
-- Statuses: pending | confirmed | completed | cancelled | no_show

INSERT INTO appointments (id, confirmation_code, customer_id, barber_id, service_id, date, time, end_time, status, notes, total_price, deposit_paid)
VALUES
  -- Completed appointments (past)
  (
    'a1000000-0000-0000-0000-000000000001',
    'AB-JCART1',
    'c1000000-0000-0000-0000-000000000001', -- James Carter
    'b1000000-0000-0000-0000-000000000001', -- Aryan
    's1000000-0000-0000-0000-000000000001', -- Classic Haircut
    '2026-03-10', '10:00', '10:45',
    'completed',
    'Skin fade, 1.5 on sides blending to a 3 on top.',
    35.00, TRUE
  ),
  (
    'a2000000-0000-0000-0000-000000000002',
    'AB-MWEBB2',
    'c2000000-0000-0000-0000-000000000002', -- Marcus Webb
    'b1000000-0000-0000-0000-000000000001', -- Aryan
    's4000000-0000-0000-0000-000000000004', -- Combo
    '2026-03-05', '14:00', '15:10',
    'completed',
    NULL,
    55.00, TRUE
  ),
  (
    'a3000000-0000-0000-0000-000000000003',
    'AB-DPRIC3',
    'c3000000-0000-0000-0000-000000000003', -- Devon Price
    'b2000000-0000-0000-0000-000000000002', -- Marcus
    's1000000-0000-0000-0000-000000000001', -- Classic Haircut
    '2026-02-28', '11:30', '12:15',
    'completed',
    'Texture cut on curly hair, keep length on top.',
    35.00, FALSE
  ),
  (
    'a4000000-0000-0000-0000-000000000004',
    'AB-RGRNT4',
    'c7000000-0000-0000-0000-000000000007', -- Reuben Grant
    'b3000000-0000-0000-0000-000000000003', -- Jordan
    's6000000-0000-0000-0000-000000000006', -- Premium Package
    '2026-03-12', '13:00', '14:30',
    'completed',
    'Full premium package. Client left a $20 cash tip.',
    75.00, TRUE
  ),

  -- Confirmed appointments (upcoming)
  (
    'a5000000-0000-0000-0000-000000000005',
    'AB-KNASR5',
    'c4000000-0000-0000-0000-000000000004', -- Khalil Nasser
    'b3000000-0000-0000-0000-000000000003', -- Jordan
    's4000000-0000-0000-0000-000000000004', -- Combo
    '2026-03-28', '09:00', '10:10',
    'confirmed',
    'Wants a hot towel finish on the beard.',
    55.00, TRUE
  ),
  (
    'a6000000-0000-0000-0000-000000000006',
    'AB-SJAKC6',
    'c8000000-0000-0000-0000-000000000008', -- Simone Jackson
    'b1000000-0000-0000-0000-000000000001', -- Aryan
    's3000000-0000-0000-0000-000000000003', -- Lineup
    '2026-03-27', '16:30', '16:50',
    'confirmed',
    NULL,
    20.00, FALSE
  ),

  -- Pending appointments
  (
    'a7000000-0000-0000-0000-000000000007',
    'AB-TBRKS7',
    'c5000000-0000-0000-0000-000000000005', -- Tyler Brooks
    'b2000000-0000-0000-0000-000000000002', -- Marcus
    's1000000-0000-0000-0000-000000000001', -- Classic Haircut
    '2026-04-02', '10:00', '10:45',
    'pending',
    NULL,
    35.00, FALSE
  ),
  (
    'a8000000-0000-0000-0000-000000000008',
    'AB-ASILV8',
    'c6000000-0000-0000-0000-000000000006', -- Anthony Silva
    'b1000000-0000-0000-0000-000000000001', -- Aryan
    's4000000-0000-0000-0000-000000000004', -- Combo
    '2026-04-05', '12:00', '13:10',
    'pending',
    'First visit — referred by James Carter.',
    55.00, FALSE
  ),

  -- Cancelled appointment
  (
    'a9000000-0000-0000-0000-000000000009',
    'AB-DPRIC9',
    'c3000000-0000-0000-0000-000000000003', -- Devon Price
    'b2000000-0000-0000-0000-000000000002', -- Marcus
    's2000000-0000-0000-0000-000000000002', -- Beard Trim
    '2026-03-22', '15:00', '15:30',
    'cancelled',
    'Client called ahead to cancel.',
    25.00, FALSE
  ),

  -- No-show
  (
    'a0000000-0000-0000-0000-000000000010',
    'AB-MWBBA',
    'c2000000-0000-0000-0000-000000000002', -- Marcus Webb
    'b3000000-0000-0000-0000-000000000003', -- Jordan
    's3000000-0000-0000-0000-000000000003', -- Lineup
    '2026-03-14', '11:00', '11:20',
    'no_show',
    'Did not show or call. Sent follow-up message.',
    20.00, FALSE
  )
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- AVAILABILITY  (Mon–Sat 9am–7pm, closed Sunday)
-- day_of_week: 0=Sunday, 1=Monday, ..., 6=Saturday
-- ────────────────────────────────────────────────────────────

INSERT INTO availability (barber_id, day_of_week, start_time, end_time, is_available)
VALUES
  -- Aryan
  ('b1000000-0000-0000-0000-000000000001', 0, '09:00', '19:00', FALSE), -- Sunday closed
  ('b1000000-0000-0000-0000-000000000001', 1, '09:00', '19:00', TRUE),
  ('b1000000-0000-0000-0000-000000000001', 2, '09:00', '19:00', TRUE),
  ('b1000000-0000-0000-0000-000000000001', 3, '09:00', '19:00', TRUE),
  ('b1000000-0000-0000-0000-000000000001', 4, '09:00', '19:00', TRUE),
  ('b1000000-0000-0000-0000-000000000001', 5, '09:00', '19:00', TRUE),
  ('b1000000-0000-0000-0000-000000000001', 6, '09:00', '19:00', TRUE),

  -- Marcus
  ('b2000000-0000-0000-0000-000000000002', 0, '09:00', '19:00', FALSE), -- Sunday closed
  ('b2000000-0000-0000-0000-000000000002', 1, '09:00', '19:00', TRUE),
  ('b2000000-0000-0000-0000-000000000002', 2, '09:00', '19:00', TRUE),
  ('b2000000-0000-0000-0000-000000000002', 3, '09:00', '19:00', TRUE),
  ('b2000000-0000-0000-0000-000000000002', 4, '09:00', '19:00', TRUE),
  ('b2000000-0000-0000-0000-000000000002', 5, '09:00', '19:00', TRUE),
  ('b2000000-0000-0000-0000-000000000002', 6, '09:00', '19:00', TRUE),

  -- Jordan
  ('b3000000-0000-0000-0000-000000000003', 0, '09:00', '19:00', FALSE), -- Sunday closed
  ('b3000000-0000-0000-0000-000000000003', 1, '09:00', '19:00', TRUE),
  ('b3000000-0000-0000-0000-000000000003', 2, '09:00', '19:00', TRUE),
  ('b3000000-0000-0000-0000-000000000003', 3, '09:00', '19:00', TRUE),
  ('b3000000-0000-0000-0000-000000000003', 4, '09:00', '19:00', TRUE),
  ('b3000000-0000-0000-0000-000000000003', 5, '09:00', '19:00', TRUE),
  ('b3000000-0000-0000-0000-000000000003', 6, '09:00', '19:00', TRUE)
ON CONFLICT (barber_id, day_of_week) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- BLOCKED DATES
-- barber_id NULL = entire shop is closed
-- ────────────────────────────────────────────────────────────

INSERT INTO blocked_dates (barber_id, date, reason)
VALUES
  (NULL, '2026-12-25', 'Christmas Day — shop closed'),
  (NULL, '2027-01-01', 'New Year''s Day — shop closed')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- BUSINESS SETTINGS
-- ────────────────────────────────────────────────────────────

INSERT INTO settings (key, value)
VALUES
  ('shop_name',           '"Aryan Blendz"'),
  ('shop_address',        '"123 Main Street, New York, NY 10001"'),
  ('shop_phone',          '"(555) 012-3456"'),
  ('shop_email',          '"hello@aryanblendz.com"'),
  ('shop_instagram',      '"@aryanblendz"'),
  ('slot_duration',       '30'),
  ('max_advance_days',    '60'),
  ('cancellation_hours',  '24'),
  ('deposit_required',    'true'),
  ('deposit_amount',      '10'),
  ('email_notifications', 'true'),
  ('sms_reminders',       'false'),
  ('reminder_hours',      '24')
ON CONFLICT (key) DO NOTHING;
