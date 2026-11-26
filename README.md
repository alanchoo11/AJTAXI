# AJLOGIST

AJLOGIST rents cars in Astana for taxi work, including work with Yandex Go. The company does not onboard drivers into a taxi fleet. Vehicle owners can offer their cars for rental; the owner's share and other terms are agreed individually before handover.

## Site

- Public pages: home, vehicle catalog, vehicle owners, about, FAQ, contacts, and privacy.
- Russian, Kazakh, and English interface.
- Public pages show no sample vehicle inventory, prices, rental percentages, earnings estimates, or decorative statistics.
- Only published, non-sample vehicles from the optional Netlify and Supabase backend can appear in the catalog.
- The supplied AJLOGIST phone number is used for calls and WhatsApp.
- GitHub Pages serves the static site. Netlify Functions and Supabase are optional for live inventory and the private admin area.

## Local development

Requires Node.js 20 and pnpm 10.

    pnpm install
    cp .env.example .env
    pnpm dev

The GitHub Pages build can be reproduced with the same environment values used by the workflow:

    GITHUB_ACTIONS=true GITHUB_REPOSITORY=alanchoo11/AJTAXI VITE_SITE_URL=https://alanchoo11.github.io/AJTAXI/ VITE_WHATSAPP_NUMBER=77017446622 pnpm build

## Optional Netlify and Supabase setup

1. Create a Supabase project and apply both files in supabase/migrations in filename order.
2. Provision an administrator through Supabase Auth and grant the user an admin role in public.profiles.
3. Configure the Supabase URL and public anon key for browser authentication. Keep the service role key server-side in Netlify.
4. Deploy from this repository with the build command pnpm build and publish directory dist.

The database migration removes old sample vehicles, outdated driver-onboarding FAQ entries, and calculator assumptions. Add only real vehicles and confirm their details before publishing them.

## GitHub Pages

The workflow deploys main to [alanchoo11.github.io/AJTAXI](https://alanchoo11.github.io/AJTAXI/). GitHub Pages does not run Netlify Functions; without the optional backend the catalog asks visitors to contact AJLOGIST directly.

## Available checks

    pnpm build
    pnpm test
