# ClientOS — Part 1 (foundation)
1. `npx create-next-app@latest clientos --ts --tailwind --app` then copy these files in; `npm i @supabase/supabase-js lucide-react`
2. Supabase project -> SQL editor -> run `supabase/schema.sql`; create private Storage bucket `videos`.
3. Copy `.env.example` to `.env.local` and fill values (OPENAI_API_KEY optional: mock AI is used without it).
4. `npm run dev` -> http://localhost:3000
5. Deploy: push to GitHub, import in Vercel, add the 3 env vars.
Public review pages call only the RPCs (`get_review`, `add_review_comment`, `request_review_changes`, `approve_review`). Anon has zero table access.
