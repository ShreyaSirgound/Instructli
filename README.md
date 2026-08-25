<h1>
  <p>Instructli</p>
</h1>

<p>
  An interactive Next.js + Supabase web-app to learn computer organization concepts from CSC258.
</p>

<p>
  <a href="#installation">Installation</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#admin-access">Admin Access</a> •
  <a href="#running-the-app-locally">Running the App (Locally)</a> •
  <a href="#deploying--updating-the-app">Deploying / Updating the App</a>

</p>

### Installation

1. Install the following requirements

- Node.js (LTS recommended)
- npm, yarn, pnpm, or bun (any one package manager)
- A [Supabase](https://supabase.com) project (for the database/backend)

2. Clone the repo and install dependencies

```
git clone https://github.com/ShreyaSirgound/Instructli.git
cd Instructli
npm install
```

### Project Structure
Note: Only the core files & directories are listed below

```
├── app
│   ├── admin                    # Admin-only UI (rendered for identities on the admin list)
│   │   ├── admins               # "Manage Admins" page — add/remove UI-managed admins (see Admin Access)
│   │   ├── login                # Landing page users hit when proxy.ts redirects an unauthenticated /admin/* request here
│   │   ├── page.tsx             # Main admin dashboard
│   │   └── stats                # Analytics/usage stats view
│   ├── api
│   │   ├── admin
│   │   │   ├── admins           # CRUD for UI-managed admins (stored in Supabase)
│   │   │   ├── login            # Verifies Shibboleth identity against the allowlist, sets the session cookie
│   │   │   ├── session          # Reads/validates the current admin session
│   │   │   └── view-mode        # Toggles admin's student/admin view
│   │   ├── analytics            # Records module/practice-question activity events
│   │   ├── modules              # Returns module metadata (used by app/page.tsx to render the module list)
│   │   └── user                 # Non-admin user-facing endpoint(s)
│   ├── modules                  # One route per learning module (student-facing)
│   │   ├── binary-arithmetic
│   │   ├── caching
│   │   ├── hazards
│   │   ├── machine-instructions
│   │   ├── pipeline
│   │   └── single-cycle
│   ├── globals.css              # Global styles, imported by layout.tsx
│   ├── layout.tsx               # Root layout (handles the nav bar)
│   ├── page.tsx                 # Homepage — lists modules via /api/modules
│   └── progressConfig.ts        # Shared progress-tracking types/helpers, used by module pages to persist completion in localStorage
├── components
│   ├── admin
│   │   └── AdminMenu.tsx        # Nav menu shown in the admin dashboard
│   ├── binary                   # Tab components for the binary-arithmetic module
│   ├── caching                  # Tab components + CacheTracer for the caching module
│   ├── hazards                  # Interactive pipeline-hazard/stall exercise
│   ├── machine-instructions     # R/I/S-format sections + simulation for that module
│   ├── pipeline                 # Datapath SVG, processor logic, quiz, and terminal for the pipeline module
│   ├── single-cycle             # Datapath SVG, processor logic, quiz, and terminal for the single-cycle module
│   ├── Badge.tsx                # Small colored label, used across modules/admin stats
│   ├── Card.tsx                 # Generic content card wrapper
│   ├── InfoNote.tsx             # Callout/info box used inside module tabs
│   ├── ModuleCard.tsx           # Card shown on the homepage for each module
│   └── types.ts                 # Shared design tokens (the `colors` palette) used across components
├── lib
│   ├── auth
│   │   ├── rate-limit.ts        # Rate limiting for the admin login endpoint
│   │   └── session.ts           # Shibboleth identity parsing, admin allowlist checks, session cookie creation (see Admin Access)
│   ├── moduleIcons.tsx          # Icon lookup used on the homepage module list
│   └── supabase
│       ├── admin.ts             # Server-side Supabase client (elevated privileges — admin CRUD, etc.)
│       └── public.ts            # Client-safe Supabase client
├── public
│   └── images                   # Static image assets
├── src
│   └── utils
│       ├── analytics.ts         # Records student activity/progress events (called from modules + PracticeQuestion)
│       ├── pipeline-processor.ts # Core simulation logic for the pipeline module
│       ├── pipeline-types.ts     # Types shared by the pipeline module/components
│       ├── return-types.ts       # Shared return-value types used across module simulations
│       └── single-processor.ts   # Core simulation logic for the single-cycle module
├── supabase
│   └── schema.sql               # Database schema
├── LICENSE
├── next.config.ts               
├── proxy.ts                     # Next.js 16 request interceptor (formerly middleware.ts) — redirects unauthenticated /admin/* requests to /admin/login
└── README.md                    # You are here!
```

### Architecture

General Flow:
1. Users access the app through the Next.js frontend (App Router), which handles both pages and API routes.
2. Admin/instructor access is gated behind **Shibboleth** authentication, which is hosted on the UofT VM the app runs on.
3. Once authenticated, a user's UTORid or email is checked against the combined admin list — the `ADMIN_SHIBBOLETH_ALLOWED_USERS` env var plus any admins added via the app UI (see [Admin Access](#admin-access)).
4. Application data, including UI-managed admins, is stored in **Supabase** (Postgres + auth/storage as configured in the `supabase` directory).
5. `proxy.ts` handles routing/middleware concerns between the frontend and backend services.
6. In production, the app is built and run with **PM2** on a UofT-hosted VM (see [Deploying / Updating the App](#deploying--updating-the-app)).

### Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Generite with `openssl rand -hex 16` or `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` in the terminal
SESSION_SECRET=your-random-32-character-string

# Admin access
ADMIN_SHIBBOLETH_ALLOWED_USERS=jane.doe@mail.utoronto.ca,john.doe@mail.utoronto.ca

# Local dev only — see "Running the App (Locally)" below
# Use a valid UofT email or UTORid here
DEV_SHIB_IDENTITY=jane.doe@mail.utoronto.ca
```

### Admin Access

Admin/instructor login is protected by Shibboleth. There are **two layers** of admins, and they are managed **separately**:

1. **Env var admins** — set via `ADMIN_SHIBBOLETH_ALLOWED_USERS`. This is a comma-separated list of allowed utorids or email addresses, and it's how the *initial* admin(s) get access.
   - Example value: `jane.doe@mail.utoronto.ca`
   - These admins **cannot be removed from the app UI** — the only way to revoke them is to manually edit the env var (and redeploy), and so they are unaffected by Supabase.

2. **UI-managed admins** — additional admins can be added *and* deleted through the app's admin interface, and are stored in Supabase rather than the env var.
   - These can be freely added/removed without touching the deployment.

### Running the App (Locally)

1. Set up your `.env.local` file as described in [Environment Variables](#environment-variables).

2. **To log in locally without a real Shibboleth SP**, set `DEV_SHIB_IDENTITY` to the UTORid or email you want to be treated as (e.g. `DEV_SHIB_IDENTITY=jane.doe@mail.utoronto.ca`) in `.env.local`. This is handled in `lib/auth/session.ts`, in `getShibbolethIdentity()`:
   - It first checks for the real Shibboleth identity headers (as in production).
   - If those aren't present, it falls back to `DEV_SHIB_IDENTITY` — but **only** when `NODE_ENV !== 'production'`. This fallback is hardcoded to never activate on a real deployment, even if the env var is accidentally set there.
   - To test as an admin, set `DEV_SHIB_IDENTITY` to a value that's also in `ADMIN_SHIBBOLETH_ALLOWED_USERS` (or one added via the UI/Supabase — see [Admin Access](#admin-access)). To test as a non-admin, use any other value.

3. Run the development server:

```
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

The page auto-updates as you edit files under `app/`.

### Deploying / Updating the App

The app is deployed on a UofT-hosted VM and run with **PM2**. Pushing a new version means SSHing into the VM and pulling the latest code.

1. SSH into the VM.

2. Navigate to the project directory:

```
cd Instructli
```

3. Pull the latest changes from `main`:

```
git pull
```

4. Install any new dependencies:

```
npm install
```

5. Build the app:

```
npm run build
```

6. Reload the app under PM2:

```
pm2 reload instructli
```

> **Note:** environment variables on the VM are set outside of this repo (not committed to Git). If you add a new environment variable to the code, make sure it also gets added on the VM — otherwise the reload in step 6 will run against a stale/incomplete config.

---

### For Future Contributors

- Check the [Admin Access](#admin-access) section carefully before making any auth-related changes — remember env-var admins and UI/Supabase admins are managed differently, and it's easy to assume removing someone in the UI revokes all their access when it doesn't.
- The `supabase/` directory should reflect the current database schema. If you make schema changes, keep migrations there in sync with your live Supabase project.
- Since there's no local Shibboleth setup, be extra careful testing auth-related changes before pushing — use the `DEV_SHIB_IDENTITY` bypass (see [Running the App (Locally)](#running-the-app-locally)) to test as different users/admins
