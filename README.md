# Aryan Blendz — Premium Barber Booking App

A full-featured, premium barbershop booking application built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase.

---

## Overview

Aryan Blendz is a premium barbershop booking platform that allows customers to browse services, pick their barber, choose a date and time, and book appointments — all in one seamless flow. The app includes a fully featured admin dashboard for managing appointments, services, customers, barber availability, and shop settings.

---

## Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Framework   | Next.js 16 (App Router)                   |
| Language    | TypeScript                                |
| Styling     | Tailwind CSS v4 + custom design system    |
| UI Library  | shadcn/ui (Radix UI primitives)           |
| Database    | Supabase (PostgreSQL)                     |
| Auth        | Supabase Auth                             |
| Payments    | Stripe                                    |
| Forms       | react-hook-form + zod                     |
| Fonts       | Playfair Display (display) + Inter (body) |
| Toasts      | sonner                                    |
| Icons       | lucide-react                              |

---

## Prerequisites

- **Node.js** 18.17 or later
- **npm** 9+ (or pnpm / yarn)
- A [Supabase](https://supabase.com) account (free tier works)
- A [Stripe](https://stripe.com) account (optional, for deposit payments)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/aryanblendz.git
cd aryanblendz
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in all required values (see the [Environment Variables](#environment-variables) table below).

### 4. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to **SQL Editor** and run the schema file:
   ```
   supabase/schema.sql
   ```
   This creates all tables, enums, indexes, triggers, and RLS policies.
3. (Optional) Load sample data for local development:
   ```
   supabase/seed.sql
   ```
   This inserts 3 barbers, 6 services, 8 customers, 10 appointments, availability schedules, and business settings.
4. In **Authentication → Providers**, enable the Email provider.
5. Copy your **Project URL** and **anon key** from **Project Settings → API** into `.env.local`.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key for client-side |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for server-side API calls |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | No | Full URL of the app (defaults to localhost:3000) |

---

## Folder Structure

```
src/
├── app/
│   ├── (auth)/            # Auth group layout (no navbar)
│   ├── about/             # About page
│   ├── account/           # Customer account page (protected)
│   ├── admin/             # Admin dashboard + sub-pages
│   │   ├── layout.tsx     # Admin sidebar layout
│   │   ├── page.tsx       # Dashboard
│   │   ├── appointments/  # Appointment management
│   │   ├── availability/  # Barber availability/blocked dates
│   │   ├── customers/     # Customer management
│   │   ├── services/      # Service management
│   │   └── settings/      # App settings
│   ├── booking/           # Multi-step booking flow
│   ├── contact/           # Contact page
│   ├── login/             # Login page
│   ├── manage/            # Manage booking by code
│   ├── services/          # Public services page
│   ├── globals.css        # Design tokens + utility classes
│   ├── layout.tsx         # Root layout
│   ├── not-found.tsx      # 404 page
│   └── page.tsx           # Homepage
├── components/
│   ├── booking/           # Booking flow components
│   ├── layout/            # Navbar, Footer
│   ├── sections/          # Homepage sections
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── constants.ts       # Services, barbers, hours data
│   ├── supabase/          # Supabase client helpers
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # All TypeScript types
supabase/
├── schema.sql             # Full database schema, triggers, and RLS policies
└── seed.sql               # Sample data for local development
```

---

## Pages Overview

| Route                     | Description                              | Auth     |
|---------------------------|------------------------------------------|----------|
| `/`                       | Homepage with hero, services, team, CTA  | Public   |
| `/booking`                | Multi-step booking flow                  | Public   |
| `/services`               | All services listing                     | Public   |
| `/about`                  | Story, team, values                      | Public   |
| `/contact`                | Contact form + info                      | Public   |
| `/login`                  | Sign in page                             | Public   |
| `/account`                | Customer appointment history + profile   | Customer |
| `/manage?code=AB-XXXX`    | Manage booking by confirmation code      | Public   |
| `/admin`                  | Admin dashboard                          | Admin    |
| `/admin/appointments`     | All appointments with filters            | Admin    |
| `/admin/services`         | CRUD services                            | Admin    |
| `/admin/availability`     | Weekly schedules + blocked dates         | Admin    |
| `/admin/customers`        | Customer list + detail panel             | Admin    |
| `/admin/settings`         | Shop, booking, notifications config      | Admin    |

---

## Admin Login

> For demo purposes, authentication is simulated without a real Supabase call.

| Field    | Value                    |
|----------|--------------------------|
| Email    | admin@aryanblendz.com    |
| Password | admin123                 |

On successful login, a cookie `admin-session=true` is set and the middleware grants access to `/admin/*` routes.

For production, replace the simulated auth in `src/app/login/page.tsx` with a real Supabase auth call and issue a proper session.

---

## Design System

The app uses a custom Tailwind CSS v4 design system defined in `globals.css`:

- **Colors:** `charcoal-950` (bg), `charcoal-800/900` (cards), `gold-500` (#C9A84C), `gold-400/300`
- **Utilities:** `text-gradient-gold`, `bg-gradient-gold`, `glass`, `gold-border`, `animate-fade-in`, `animate-slide-up`
- **Fonts:** `font-display` (Playfair Display), `font-sans` (Inter)
- **Shadows:** `shadow-[var(--shadow-gold)]`, `shadow-[var(--shadow-dark)]`

---

## Stripe Setup (Optional)

Stripe is used to collect a deposit at booking time. To enable it:

1. Create a [Stripe](https://stripe.com) account and retrieve your test API keys.
2. Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` to `.env.local`.
3. Set up a webhook endpoint pointing to `https://your-domain.com/api/webhooks/stripe` in the Stripe Dashboard.
4. Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
5. To test locally, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

If Stripe keys are not provided, the booking flow will skip the deposit step and confirm appointments directly.

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local.example`
4. Deploy

### Important production checklist

- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Use Stripe live keys (not test keys)
- [ ] Set up Supabase Auth with email/SMTP provider
- [ ] Replace demo admin auth with real Supabase auth
- [ ] Configure Stripe webhooks to `/api/webhooks/stripe`
- [ ] Set up a custom domain in Supabase Auth settings
- [ ] Enable Supabase RLS on all tables (already in schema)

---

## License

MIT — Built for Aryan Blendz.
