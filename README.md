# Simple Blog (Assessment)

React 19 + TypeScript + Redux + Supabase.

## Setup

### Supabase

Create a Supabase project and grab:

- Project URL
- Anon public key

1. Install deps:

```bash
npm install
```

2. Create `.env` (Vite env vars):

```bash
cp .env.example .env
```

Then fill in:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

3. Supabase Auth reminder:

If you want registration to log in right away, disable email confirmation in Supabase Auth settings.

### Database table + RLS

Run `supabase.sql` in the Supabase SQL editor.

Notes:

- Anyone can view posts (public read)
- Only logged-in users can create posts
- Only the owner can update/delete their own post
- Username shown in posts is just the email before `@` (stored when creating the post).

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```
