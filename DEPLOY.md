# ClientOS deploy (Vercel + Supabase)
1. GitHub par naya PRIVATE repo banao aur `clientos` folder push karo. `.env.local` push mat karna (.gitignore me pehle se hai).
2. vercel.com par login, "Add New > Project", repo chuno.
3. Environment Variables me daalo: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY (optional).
4. Deploy dabao. Tumhe https://tumhara-app.vercel.app milega.
5. Supabase > Authentication > URL Configuration: Site URL = apna Vercel URL, Redirect URLs me bhi wahi URL daalo.
6. Production me: Authentication > Sign In / Providers > Email me "Confirm email" ON karo, aur minimum password length 8+ rakho.
7. Supabase > Authentication > Attack Protection me leaked password protection aur captcha ON karo (available ho to).
8. Storage bucket `videos` PRIVATE hi rahe. service_role key kabhi NEXT_PUBLIC_ ke saath mat daalna.
