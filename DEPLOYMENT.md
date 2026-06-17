# Deployment Guide - English Around the World Evaluation

## 🚀 Quick Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

```bash
# In PowerShell, from C:\Users\super\Documents\english-around-evaluation

git remote add origin https://github.com/YOUR_USERNAME/english-around-evaluation.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 2: Deploy on Vercel

**Option A: Via CLI (Recommended)**
```bash
vercel --prod
```

You'll be prompted to:
- Login to Vercel
- Link to existing project or create new
- Add environment variables when asked

**Option B: Via Web UI**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Select your GitHub repo `english-around-evaluation`
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
5. Click Deploy

### Step 3: Set Custom Domain

In Vercel dashboard:
1. Go to your project settings
2. Domains → Add Domain
3. Enter: `english-around-the-world-evaluation.vercel.app`
4. Vercel auto-assigns it

### Step 4: Configure Supabase

1. Go to Supabase → your project → Settings → API
2. Copy:
   - Project URL
   - Anon Key (public)
3. Add to Vercel environment variables
4. Redeploy (automatic or manual)

---

## ✅ Verification

After deployment, visit:
```
https://english-around-the-world-evaluation.vercel.app
```

You should see:
- ✅ "English Around the World" header
- ✅ Name + Email form
- ✅ No errors in browser console

---

## 🔧 Local Testing (Before Deploy)

```bash
npm run dev
# Visit http://localhost:3000
```

**Test without Supabase:**
- Fill out docent form → should work
- Submit evaluation → will fail (no Supabase), but that's OK for UI testing

**Test with Supabase:**
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- Restart dev server: `npm run dev`
- Now evaluations should save to database

---

## 📊 After Deployment

Teachers can now visit your app and:
1. Enter their name + email
2. Evaluate countries one at a time
3. Export CSV with all evaluations

CSV will contain all columns for analysis in Excel/Sheets.

---

## 🆘 Troubleshooting

**"Supabase URL is missing"**
- Check Vercel environment variables are set
- Redeploy project after adding env vars

**"Can't save evaluations"**
- Verify Supabase table `evaluations` exists
- Check Supabase API key is correct
- Check Supabase RLS (Row Level Security) allows inserts

**Build fails**
- Run `npm run build` locally to see full error
- Check all `.tsx` files are syntactically correct
- Verify all imports resolve

---

## 📝 Next Steps

After launch:
1. Share URL with teachers
2. Monitor Supabase dashboard for incoming evaluations
3. Export CSV weekly for analysis
4. Consider adding admin dashboard for real-time stats
