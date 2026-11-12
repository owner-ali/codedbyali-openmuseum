# CodedByAli OpenMuseum

**Discover Art. Experience History. Explore Creativity.**

A futuristic digital art museum and artist community. React + Vite + Tailwind + Three.js (React Three Fiber) + Supabase. Free tools only: no paid APIs, libraries or subscriptions.

---

## 1. Run it on your computer

You need Node.js 18 or newer (https://nodejs.org, the LTS version is fine).

```bash
cd codedbyali-openmuseum
npm install
npm run check      # optional: quick sanity check of every source file
npm run dev
```

Open the address it prints (usually http://localhost:5173). It also prints a network address, so you can open the site on your Android phone while it is on the same Wi-Fi.

Without any setup the site runs in **demo mode**: all pages work, artwork is generated sample art, favorites are saved in your browser. Accounts, uploads and the admin panel need Supabase (next section).

```bash
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

> **Honest note:** this project was written and checked without being able to install packages or run the build in the authoring environment. It passed static checks, a render test of all generated artwork, and a 72-test security suite against a real PostgreSQL 16 database (see "What was tested"). But `npm run build` and the browser itself were not run, so **do a first run and send me any error you see**. Most fixes are one-line.

---

## 2. Connect Supabase (accounts, uploads, community, admin)

1. Create a free project at https://supabase.com (choose a region near your visitors).
2. Open **SQL Editor** and run these files **in this order** (paste each, press Run):
   1. `supabase/migrations/0001_schema.sql`
   2. `supabase/migrations/0002_functions_triggers.sql`
   3. `supabase/migrations/0003_rls.sql`
   4. `supabase/migrations/0004_storage.sql`
   5. `supabase/seed.sql` (adds the 12 categories and default homepage text)
3. **Authentication > URL Configuration**: set *Site URL* to your site address (`http://localhost:5173` while testing, your real domain later). Under *Redirect URLs* add `http://localhost:5173/**` and your real domain with `/**`.
4. **Authentication > Providers > Email**: leave email sign-in on. For fast local testing you may turn *Confirm email* off; for a public site keep it on.
5. **Project Settings > API**: copy the *Project URL* and the *anon public* key.
6. Copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
   Restart `npm run dev`. The demo banners disappear and the site now uses your database.

The `anon` key is designed to be public. Security comes from Row Level Security in the database, not from hiding the key. **Never** put the `service_role` key anywhere in this project.

### Create your first admin (safe procedure)

1. Open the site and **register** with the email you want as admin (confirm the email if asked).
2. In Supabase **SQL Editor**, open `supabase/admin_setup.sql`, replace `YOUR_EMAIL_HERE` with that email and run it.
3. Log out and in again. An **Admin** link appears in the menu.

Only someone with access to your Supabase project can do step 2. A database trigger stops anyone else from changing their own role, even by calling the API directly. Further admins can be made from Admin > Users.

---

## 3. What each part does

| Area | What you get |
|---|---|
| Home | Real-time 3D marble bust hero (cyan and purple lights follow the pointer), animated sections, live counts from the database (or honest structure counts in demo mode) |
| Explore | Search by title / artist / tag, 12 category filters, sort by newest / popular (likes) / title, masonry grid, load more, preview modal, full-screen viewer |
| Virtual Museum | Real 3D gallery hall: six themed rooms, framed artwork on walls, camera glides between pieces, tap the glowing **+** to inspect, swipe / arrows / keyboard, full-screen mode. Falls back to a lightweight CSS gallery if WebGL is unavailable |
| Store | Free downloads with licence and attribution, download counter, collections. **No payments** |
| Exhibitions | Published exhibitions with cover, dates, artists, featured artwork |
| Artists / Profile | Profiles with avatar, bio, country, social links, follow button, follower count |
| Artwork page | Like, favorite, share, download, comments, report |
| Upload | Validation (JPG/PNG/WebP/GIF only, 10 MB), preview, real upload progress, auto-resize to WebP, goes to **pending** until an admin approves it |
| Artist dashboard | Overview (real numbers), My Artwork (status, edit, delete), upload, favorites, followers, following, comments on your work, profile and account settings |
| Admin panel | Analytics, approve/reject (with reason), edit/delete artwork, feature artwork, users (suspend, make admin), artists, categories, exhibitions (cover upload, dates, draft/published), homepage text, reports, comment moderation, site settings, logo upload, audit log |

### Security summary

- Every table has Row Level Security. The public only sees **approved** artwork and **published** exhibitions.
- Owners can edit or delete only their own artwork. Any edit sends it back to review. Users cannot change `status`, `featured`, `download_count`, `owner_id`, their own `role`, or their suspension flag (database triggers).
- Suspended users cannot upload, comment, like, follow or favorite.
- Admin checks happen in the database (`is_admin()`), never only in the browser.
- The audit log is written by database triggers; nobody can insert into it from the website.
- Storage: users can only write inside a folder named after their own user id. Buckets enforce size limits and image-only MIME types, so executables and SVG are rejected by the server.
- `public/_headers` adds security headers and a Content-Security-Policy (used by Cloudflare Pages).

---

## 4. Deploy for free on Cloudflare Pages

1. Put the project on GitHub (`.env` is already git-ignored).
2. Cloudflare dashboard > **Workers & Pages** > **Create** > **Pages** > connect your repo.
3. Build command `npm run build`, output directory `dist`, add the **Environment variables** `VITE_SITE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (and optionally `VITE_CONTACT_EMAIL`).
4. Deploy. Then in Supabase set *Site URL* and *Redirect URLs* to your new domain (section 2, step 3).
5. Replace `https://your-site.pages.dev` in `public/sitemap.xml` and `public/robots.txt` with your real domain.

`public/_redirects` makes page refreshes and direct links work. If something looks blocked after deploy (fonts, images, 3D), open the browser console: a Content-Security-Policy message means you need to allow that address in `public/_headers`.

---

## 5. Test checklist (please go through this on your phone and desktop)

- [ ] Home loads, loading screen plays once, 3D statue appears and follows the pointer
- [ ] Menu (hamburger on phone) opens, every link works, no horizontal scrolling
- [ ] Explore: search, category chips, sort, open an artwork, full-screen, next/previous
- [ ] Virtual Museum: switch rooms, arrows and swipe work, **+** opens the artwork, full-screen works
- [ ] Register, confirm email, log in, log out, forgot password
- [ ] Edit profile + picture, upload artwork (see progress), it shows **pending** in My Artwork
- [ ] Log in as admin, approve it, it appears on Home / Explore
- [ ] Like, favorite, comment, report, follow, download
- [ ] Admin: reject with reason (artist sees it), feature, create exhibition, change homepage text, upload logo

## 6. What was tested (and what was not)

| Checked | How |
|---|---|
| All 103 source files parse; every import and named export resolves | esbuild + custom script (`npm run check`) + TypeScript name/export check |
| All 12 generated art styles, artists and exhibitions render; upload validator rejects SVG / .exe / double extensions / oversized / empty files | React render test |
| Database schema, triggers, RLS, storage policies, audit log | 72 automated scenarios on PostgreSQL 16 (members, admin, suspended user, anonymous visitor). Supabase's `auth` and `storage` schemas were stubbed, so real Supabase may differ slightly |
| **Not run:** `npm run build`, the 3D scenes in a real browser, mobile layouts at each width, real Supabase email flows | Needs `npm install` and a browser |

If the statue's lighting looks off, tune the `LIGHTS` object at the top of `src/components/3d/Statue3D.jsx`. If a phone struggles, the 3D scenes already switch to a low-quality mode on small screens; you can force it by editing `isLowPower()` in `src/lib/device.js`.

## 7. Project structure

```
src/
  admin/            admin panel and its sections
  artist/           artist dashboard
  components/       common, layout, gallery, artwork, dashboard, home, 3d
  context/          auth, catalog (database or demo), favorites/likes/follows, artwork modal
  data/demo.js      demo content (used only when Supabase is not configured)
  lib/              helpers (supabase client, validators, images, device, share)
  pages/ routes/ services/ styles/
supabase/           migrations 0001-0004, seed.sql, admin_setup.sql
public/             favicon, robots, sitemap, _redirects, _headers
scripts/check.mjs   source sanity check
```

## 8. Known limits (honest list)

- Artwork in the 3D museum rooms is chosen by category in live mode. Rooms with fewer than three matching pieces are filled with recent artwork.
- Deleting an account entirely needs a server-side admin action (Supabase dashboard > Authentication). The dashboard tells users how to request it.
- The sitemap is static. Add artwork and artist URLs yourself or generate them at build time later.
- The newsletter section was intentionally not added (it needs an email service to be honest).
- There is no light theme; the museum is dark by design.
- Statue is an original procedural model (no downloaded asset needed). You can swap in a real GLB later with drei's `useGLTF` in `Statue3D.jsx`.

Created with passion by CodedByAli.
