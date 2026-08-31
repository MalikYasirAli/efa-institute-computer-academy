# frontend README

This folder contains the React + TypeScript + Vite + Tailwind frontend scaffold for EFA Institute of Computer Academy.

Quick start (local)
1. cd frontend
2. cp .env.example .env
   - Set the VITE_SUPABASE_* variables if you plan to use Supabase features. Do NOT put any service_role or secret keys here.
3. npm ci
4. npm run typecheck
5. npm run dev

Build (production)
- npm run build
- Output directory: dist/

Notes
- This project is intentionally minimal. The `website/` directory (original static site) was left unchanged and must remain until the new app is validated.
- The seed file in db/seeds/ contains protected academy data ("Yasir Ali"). Do not modify or remove that value via the normal admin UI.
- Do not expose Supabase service_role or other secret keys in this repo or in frontend envs.

If you run into build or type-check errors, paste the logs here and I will provide fixes and commit them.
