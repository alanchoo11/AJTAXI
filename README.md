# AJ Taxi Park

A responsive driver onboarding and vehicle rental platform for AJ Taxi Park in Astana. The source is ready for a Netlify + Supabase deployment; credentials and confirmed company contact details were not supplied, so external services remain unconfigured until AJ adds them.

## Included

- Public pages: home, drivers, vehicle catalog and details, about, FAQ, contacts, privacy, and request confirmation.
- Russian (default), Kazakh, and English interface, with the selected language saved in the browser.
- Driver and rental request forms that submit through Netlify Functions.
- Rental catalog filters, a vehicle enquiry flow, and replaceable demo vehicle artwork.
- Editable KZT earnings estimate with owned and rented vehicle scenarios.
- Admin area at `/admin`: Supabase Auth sign-in, role-gated dashboard, applications, vehicle management and photo upload, translated FAQ and page copy, and company/calculator settings.
- PostgreSQL migration with RLS, indexes, constraints, demo inventory labels, and database-backed rate limiting.
- Netlify SPA routing, Functions routing, security headers, metadata, robots file, and sitemap placeholder.

No partnership, company history, fleet size, verified pricing, guaranteed earnings, customer reviews, or real inventory is claimed. Catalog seed records are marked as demonstration data.

## Local development

Requirements: Node.js 20 or newer and pnpm 9+ (or npm).

```sh
pnpm install
cp .env.example .env
pnpm dev
```

The site renders with clearly labeled demo vehicle records before Supabase is configured. Forms do not pretend to persist without a database and will show a configuration message.

## Supabase setup

1. Create a Supabase project and apply `supabase/migrations/202611170001_initial.sql` in the SQL editor or with the Supabase CLI.
2. Create an administrator using Supabase Auth. Do not create a separate password table.
3. Grant the new Auth user an administrator role using their Auth user ID:

   ```sql
   insert into public.profiles (id, role, is_active)
   values ('AUTH-USER-UUID', 'admin', true)
   on conflict (id) do update set role='admin', is_active=true;
   ```

4. Copy `.env.example` into local environment configuration and fill the Supabase project URL and **public anon key** in the `VITE_` variables. Add the service role key only to server environment variables.
5. Use `/admin` to manage page copy, FAQ, demo/real vehicle records, contact values, and calculator assumptions.

The seeded vehicle records are examples, not confirmed availability. Replace images and details only after the company supplies them.

## Netlify deployment

1. Import this repository into Netlify.
2. Set the build command to `pnpm build` (or `npm run build`) and publish directory to `dist`. `netlify.toml` already configures these values and `netlify/functions`.
3. Add the variables below in Netlify's environment settings. Keep the service role key server-only and do not add a `VITE_` prefix to it.
4. Apply the Supabase migration and provision the first admin profile as above.
5. Replace `example.com` in `public/sitemap.xml` with the final public domain before launch. Set `VITE_SITE_URL` to the same canonical URL so page metadata uses the correct domain.
6. Set the real `WHATSAPP_NUMBER`, phone, address, and working hours after AJ confirms them. The WhatsApp number can instead be managed in `/admin` after the database is configured.
7. Build and deploy. Verify public forms, storage, administrator access, and all three locales with production credentials.

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Build/browser | Supabase URL for Supabase Auth sign-in only |
| `VITE_SUPABASE_ANON_KEY` | Build/browser | Public anon key for Auth; RLS still applies |
| `VITE_WHATSAPP_NUMBER` | Build/browser | Optional confirmed WhatsApp number for message links |
| `VITE_SITE_URL` | Build/browser | Public canonical domain for canonical and Open Graph URLs |
| `SUPABASE_URL` | Netlify Functions | Server-side Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Netlify Functions only | Server-side privileged database/storage access |
| `RATE_LIMIT_SECRET` | Netlify Functions | Optional secret for keyed requester-IP hashes |
| `WHATSAPP_NUMBER` | Netlify Functions | Optional confirmed WhatsApp number exposed by the public settings endpoint |

Never commit real environment values. `.env.example` contains placeholders only.

## GitHub Pages

The repository includes a GitHub Actions workflow that builds and publishes the static site at `https://alanchoo11.github.io/AJTAXI/` whenever `main` is updated. Enable GitHub Pages with **Build and deployment → GitHub Actions** in repository settings if Pages is not already enabled. Project-path assets and client routes are configured for this URL.

GitHub Pages only hosts static files. Driver and rental application submission, administrator data changes, and live Supabase-backed vehicle/contact data still require the Netlify Functions backend. The Pages build displays the labeled demo vehicles and clearly reports forms as unavailable until that backend is deployed.
## Checks

```sh
pnpm test
pnpm build
```

The calculator has unit tests for owned vehicle, rental vehicle, and invalid-input scenarios. Database, Auth, storage, and deployed form flows require a configured Supabase/Netlify environment and must be verified there.

