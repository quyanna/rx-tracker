# Rx Tracker

A personal medication refill tracker. Log your prescriptions, get push and email reminders before you run out.

**Live:** https://rx-tracker.vercel.app

## Features

- Add, edit, and delete medications with refill intervals and notify windows
- "Just filled!" button to update the last fill date in one click
- Browser push notifications when a refill is coming up
- Email reminders via Resend
- Daily cron job at 09:00 UTC checks all medications and sends notifications

## Stack

- **Next.js 14** (App Router, JavaScript)
- **Supabase** — auth and database
- **Resend** — transactional email
- **Web Push API** + **web-push** — browser push notifications
- **Vercel** — hosting and cron jobs

## Running locally

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file with the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=

   RESEND_API_KEY=
   RESEND_FROM_EMAIL=onboarding@resend.dev

   NEXT_PUBLIC_VAPID_PUBLIC_KEY=
   VAPID_PRIVATE_KEY=
   VAPID_MAILTO=mailto:you@example.com

   CRON_SECRET=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   - Supabase keys: Project Settings → API in the Supabase dashboard
   - VAPID keys: run `npx web-push generate-vapid-keys`
   - Resend key: resend.com → API Keys
   - `CRON_SECRET`: any random string (`openssl rand -base64 32`)

3. Run the Supabase SQL migrations in the dashboard SQL editor (see `supabase/` if present, or the setup notes).

4. Start the dev server:

   ```bash
   npm run dev
   ```

## Testing the cron job locally

With the dev server running:

```bash
curl -i -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/notify
```

Returns `{ processed, pushSent, emailSent, errors }`.

## Deployment

Deployed to Vercel. The cron job is configured in `vercel.json` and runs automatically at 09:00 UTC daily. All environment variables must be set in the Vercel project settings.
