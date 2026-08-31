# EFA Institute of Computer Academy — Repository

This repository now contains two parallel website fronts:

- `website/` — the original static, mobile-friendly brochure site (kept intact). Do not delete or replace until the React app is validated.
- `frontend/` — the new React + TypeScript + Vite + Tailwind frontend scaffold. This is intended for future development and Vercel deployment.

Tech stack (Step 3 foundation)
- React 18 + TypeScript (Vite)
- Tailwind CSS (configured with EFA colors)
- Supabase client integration (auth, storage, database)
- PostgreSQL migrations under `db/migrations` (for use with Supabase)

Local setup (frontend)
1. cd frontend
2. npm ci
3. cp .env.example .env (and set VITE_SUPABASE_* env vars)
4. npm run typecheck
5. npm run dev

Build for production
- npm run build
- Build output: `dist/` (ready for Vercel deployment)

Database migrations
- SQL migration files are in `db/migrations/` — do not apply them to production without review.
- Seeds (academy settings) are under `db/seeds/` (contains protected fields, do not remove or modify 'Yasir Ali' without authorization).

Protected data & governance
- The instructor name "Yasir Ali" is stored in `academy_settings.protected_instructor_name` and must not be editable via normal admin UI.
- No fake students, certificates, or other fabricated data have been added.

Next steps
- Configure Supabase project and add environment variables to Vercel (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_STORAGE_URL).
- Run migrations in a staging Supabase project and implement RLS policies.

