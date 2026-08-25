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
│   └── admin                # Holds all pages related to the admin view (admins are automatically redirected to page.tsx here
│   └── api                  # API endpoints
│   └── modules              # Holds all pages for each module
│   └── globals.css          
│   └── layout.tsx           # Sets the nav bar
│   └── moduleConfigs.ts     
│   └── page                 # the main landing page (students are automatically directed here)
│   └── progressConfig.ts     
├── components               # Shared/reusable React components
│   └── admin                # Admin specific components
│   └── binary               
│   └── caching              
│   └── hazards              # Module specific components
│   └── machine-instructions 
│   └── pipeline             
│   └── single-cycle         
│   └── Badge.tsx            
│   └── Card.tsx             
│   └── InfoNote.tsx         # App-wide components
│   └── ModuleCard.tsx       
│   └── PracticeQuestion.tsx    
│   └── types.ts             

├── lib                      
│   └── auth                 
│        └── rate-limit.ts   #
│        └── session.ts      #
│   └── supabase             #
│        └── admin.ts        #
│        └── public.ts       #
│   └── moduleIcons.tsx      #
├── public
│   └── images                # Static image assets
├── src
│   └── utils                # Additional utility functions for analytics and processor simulations
│        └── analytics.ts    
│        └── constants.ts   
│        └── pipeline-processor.ts   
│        └── pipeline-types.ts       
│        └── return-types.ts         
│        └── single-processor.ts     
├── supabase                 
│   └── schema.sql           # Supabase schema
├── .env.local               # To be configured                 
├── proxy.ts                 # Proxy/middleware configuration
├── next.config.ts           
├── tsconfig.json           
├── eslint.config.mjs        
├── postcss.config.mjs       
├── package.json
├── LICENSE
└── README.md                # You are here!
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
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Admin access
ADMIN_SHIBBOLETH_ALLOWED_USERS="jane.doe@mail.utoronto.ca,john.doe@mail.utoronto.ca"
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

2. Run the development server:

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

> **Known limitation:** true local testing of the full app is difficult because Shibboleth authentication is only hosted on the production VM — there's currently no local Shibboleth stand-in. In practice, most local development happens without being able to fully exercise the login flow. If you're picking this project up and need to test auth-gated features, you'll likely need to either test directly against the VM or figure out a way to stub the Shibboleth-provided identity locally.

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

> **Note for future contributors:** environment variables on the VM are set outside of this repo (not committed to Git). If you add a new environment variable to the code, make sure it also gets added on the VM — otherwise the reload in step 6 will run against a stale/incomplete config.

---

### For Future Contributors

- Check the [Admin Access](#admin-access) section carefully before making any auth-related changes — remember env-var admins and UI/Supabase admins are managed differently, and it's easy to assume removing someone in the UI revokes all their access when it doesn't.
- The `supabase/` directory should reflect the current database schema. If you make schema changes, keep migrations there in sync with your live Supabase project.
- Since there's no local Shibboleth setup, be extra careful testing auth-related changes before pushing — the VM is effectively your only real testing ground for the login flow.
