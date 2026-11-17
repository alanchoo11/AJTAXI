# Security notes

This project reduces exposure with server-side validation, least-privilege public database access, Supabase Auth, role checks on every admin action, and row-level security. No application can guarantee that a website will never be compromised.

## Authentication and authorization

- Administrator credentials are handled by Supabase Auth; the application never stores passwords.
- `/admin` is only a user interface route. It is not treated as a security boundary.
- Each privileged Netlify Function verifies the bearer token with Supabase Auth, then reads the user's active `profiles` row on the server. Only `admin` and `super_admin` roles can proceed.
- Admin accounts are provisioned by a trusted operator in Supabase Auth and `profiles`. Public sign-up is not exposed by this application.
- Admin reads and writes use Netlify Functions with the server-only service role key. The browser only uses the public anon key for Supabase Auth.

## Database and storage

- RLS is enabled on profiles, vehicles, applications, FAQs, settings, page copy, and rate-limit records.
- Anonymous/authenticated database reads are limited to published vehicles and published FAQs. Private applications, settings, page copy, and admin notes have no public read policy.
- Public form inserts are performed by server functions after validation. The browser has no application-table insert/update permissions.
- Vehicle images are limited to JPEG, PNG, and WebP, capped at 5 MB, and uploaded through a role-checked server function. The public storage bucket is read-only for visitors.
- Rate limiting uses a database RPC and stores a keyed SHA-256 HMAC of the requester IP, not the raw IP. The default is six submissions per 15-minute window. Set `RATE_LIMIT_SECRET` to a strong random secret in production; rotate it only when clearing existing rate-limit windows.

## Input handling

- Request fields are bounded, trimmed, validated, and inserted using Supabase's parameterized client APIs.
- Forms validate consent and phone format; an unexposed honeypot field filters basic automated submissions.
- Private application responses and internal errors are not returned to public callers. Public form requests are rate limited.
- Do not collect identity documents, payment data, or other unnecessary sensitive information through these forms.

## Environment and deployment

- Keep `SUPABASE_SERVICE_ROLE_KEY` and `RATE_LIMIT_SECRET` only in Netlify server environment settings.
- `VITE_` variables are bundled into the browser. Only the Supabase URL and public anon key belong there.
- Require HTTPS for the deployed site; Netlify provides HTTPS for site and function requests.
- `netlify.toml` sets a restrictive Content Security Policy, frame protection, MIME sniffing protection, referrer policy, and limited browser permissions. Review allowed domains when adding integrations.
- Configure Supabase Auth redirect URLs for the final domain and restrict administrator account creation to trusted operators.
- Monitor function failures, Auth events, database backups, and admin access. Review retention/deletion expectations for submitted contact data before accepting production traffic.

## Limitations to verify before launch

- Supabase/Netlify credentials were not supplied in this project workspace. Authentication, database persistence, image uploads, and live WhatsApp actions are implemented but cannot be exercised until deployment configuration is added.
- The seeded vehicle rows are demonstrations. Do not treat their presence as verified inventory.
- Add spam verification such as Turnstile if operational traffic requires stronger bot protection.
- Set a real public domain in the sitemap, configure production Auth redirects, and confirm privacy/retention language with AJ before launch.

