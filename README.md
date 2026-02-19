# 🔖 Smart Bookmark App

A real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.

**Live URL**: https://your-app.vercel.app  
**GitHub**: https://github.com/YOUR_USERNAME/smart-bookmark-app

---

## Tech Stack
- **Next.js 14** (App Router)
- **Supabase** (Google OAuth, PostgreSQL, Realtime)
- **Tailwind CSS**
- **Vercel** (Deployment)

## Features
- Google OAuth login (no passwords)
- Add bookmarks with title + URL
- Delete your own bookmarks
- Bookmarks are private per user (Row Level Security)
- Real-time sync across tabs without page refresh

---

## Problems I Ran Into & How I Solved Them

### 1. Bookmarks not appearing after adding
**Problem:** Bookmarks were saving to the database but not showing on screen.  
**Solution:** Added `.select().single()` after the insert query so the newly created bookmark is returned and immediately added to the local state — no refresh needed.

### 2. Delete button not working
**Problem:** Clicking ✕ did nothing.  
**Solution:** The Row Level Security delete policy was missing. Added it in Supabase SQL Editor and also updated the `handleDelete` function to update local state immediately after deletion.

### 3. Real-time sync across tabs not working
**Problem:** Adding a bookmark in one tab didn't appear in the other tab automatically.  
**Solution:** Supabase `postgres_changes` wasn't firing reliably. Fixed by setting `replica identity full` on the table and adding a polling fallback every 2 seconds using `setInterval` to keep tabs in sync.

### 4. Google OAuth auto-login without account chooser
**Problem:** After logout, clicking "Continue with Google" auto-signed in the same account without showing the account picker.  
**Solution:** Added `queryParams: { prompt: 'select_account' }` to the `signInWithOAuth` call to force Google to always show the account selection screen.

### 5. Supabase client recreating on every render
**Problem:** The realtime subscription was being reset on every render causing connection issues.  
**Solution:** Wrapped `createClient()` in `useState(() => createClient())` so the client is only created once.

---

## How to Run Locally

1. Clone the repo
```bash
   git clone https://github.com/YOUR_USERNAME/smart-bookmark-app.git
   cd smart-bookmark-app
```

2. Install dependencies
```bash
   npm install
```

3. Create `.env.local`
```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the dev server
```bash
   npm run dev
```
```

Save (Ctrl+S)!

---

## STEP 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up/login with GitHub
2. Click **"Add New Project"**
3. Import your `smart-bookmark-app` repository
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy** and wait ~2 minutes

Once deployed you'll get a URL like `https://smart-bookmark-app-xyz.vercel.app`

### After deploying — add URL to Supabase:
Go to **Supabase → Authentication → URL Configuration**:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: Add `https://your-app.vercel.app/auth/callback`

### Add URL to Google Cloud Console:
Go to **Google Cloud → Credentials → your OAuth client → Authorized redirect URIs** and make sure this is there:
```
https://YOUR_SUPABASE_REF.supabase.co/auth/v1/callback
