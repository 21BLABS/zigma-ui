# How to Enable Supabase Authentication

## Current Status
The system is currently using **fallback authentication** (localStorage) to avoid Supabase errors.

## To Enable Supabase:

### 1. Set Up Supabase Database
Run these 5 migration files in your Supabase dashboard:
1. `supabase/migrations/001_create_users_table.sql`
2. `supabase/migrations/002_create_watchlist_table.sql`
3. `supabase/migrations/003_create_user_signals_table.sql`
4. `supabase/migrations/004_create_user_preferences_table.sql`
5. `supabase/migrations/005_create_functions_and_views.sql`

### 2. Configure Supabase Auth
In your Supabase dashboard:
- Go to Authentication > Settings
- Enable email/password signup
- Configure redirect URLs: `http://localhost:8080`

### 3. Update Environment Variables
Make sure your `.env` file has:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Enable Supabase in Code
In `src/contexts/AuthContext.tsx`:
1. Change `useState(true)` to `useState(false)` on line 44
2. Uncomment the Supabase initialization code (lines 49-105)
3. Uncomment the login, signup, and wallet functions

### 5. Test
- Refresh the page
- Try email signup/login
- Check console for "Using fallback authentication" message

## Notes
- Fallback auth works perfectly for development
- Switch to Supabase when you need real database persistence
- All user data will migrate seamlessly when enabled
