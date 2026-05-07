# Reel — creator + editor workspace

A shared web app between you (the creator) and your editor. Editor pitches video
ideas with scripts, you film and upload raw footage straight to Google Drive,
editor pulls it down and uploads the cut, you leave timestamped feedback,
approve, then mark it published.

Built with **Next.js 16 + Supabase + Google Drive**, deploys free on **Vercel**.
Videos go directly browser → Drive (your own 5 TB), so app hosting bandwidth
stays tiny.

---

## One-time setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, paste & run `supabase/migrations/0001_init.sql`.
3. **Authentication → Providers → Google**: enable it. (Settings filled in step 2.)
4. **Project Settings → API**: grab the URL, the `anon` key, and the
   `service_role` key.

### 2. Google Cloud project (OAuth + Drive)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create or
   pick a project.
2. **APIs & Services → Library**: enable **Google Drive API**.
3. **APIs & Services → OAuth consent screen**: configure as External, add the
   scope `https://www.googleapis.com/auth/drive.file`. Add yourself + your
   editor as test users.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Authorized redirect URI:
     `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - Save the **Client ID** and **Client secret**.
5. Back in Supabase **Authentication → Providers → Google**: paste in the
   client ID + secret, save.

### 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local

# Generate the 32-byte encryption key:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set `BOOTSTRAP_CREATOR_EMAIL` to your own Google email — whoever signs in with
that becomes the creator. Anyone else becomes the editor.

### 4. Run it

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, sign in with Google. The first sign-in (you)
becomes the creator and grants Drive access; the second (your editor) becomes
the editor.

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import in Vercel (set root directory to `web/` if you have a monorepo).
3. Paste the same env vars from `.env.local`.
4. Add the production URL's callback to your Google OAuth credentials too:
   `https://<your-supabase-project>.supabase.co/auth/v1/callback` is enough —
   Supabase handles the OAuth dance.
5. In Supabase **Authentication → URL Configuration**, add your production
   domain to *Site URL* and *Redirect URLs*.

---

## How the pipeline works

| Status | Who advances | What happens |
|---|---|---|
| `idea` | Editor | Creates card with title, caption, script, ref link |
| `ready_to_film` | Creator | "Queue for filming" |
| `raw_uploaded` | Creator | Uploads raw footage to Drive |
| `editing` | Editor | Claims the card to edit |
| `in_review` | Editor | Uploads the finished cut |
| `revisions_requested` | Creator | Sends back with a note |
| `approved` | Creator | Greenlights the cut |
| `published` | Creator | Marks it posted with the live URL |

Each transition is enforced server-side. Status changes show up live on the
other person's pipeline (Supabase Realtime).

---

## Project layout

```
src/
├─ app/
│  ├─ login/                    Google sign-in
│  ├─ auth/callback/            OAuth handler — bootstraps profile + stores Drive token
│  ├─ page.tsx                  Role-aware pipeline dashboard (3 columns)
│  ├─ video/[id]/               Video detail: script, files, edit player, comments
│  ├─ new/                      Editor-only: idea creation form
│  ├─ inbox/                    Activity feed
│  ├─ published/                Approved + published archive
│  └─ api/
│     ├─ videos/                Create idea, transition status, attach file
│     ├─ comments/              Post timestamped comments
│     └─ drive/                 Resumable upload session, stream URL
├─ components/                  AppShell, DriveUploader, EditPlayer, StatusActions, …
└─ lib/
   ├─ supabase/                 client, server, admin (service role)
   ├─ drive/                    OAuth, resumable upload, AES-GCM token encryption
   ├─ status.ts                 Pipeline state machine
   └─ utils.ts
proxy.ts                        Auth refresh + redirect when not signed in
supabase/migrations/0001_init.sql
```

---

## Verifying it works

1. Sign in as editor → `/new` → propose an idea. Creator sees it on pipeline.
2. As creator, click **Queue for filming**, then upload a small `.mp4`.
3. As editor, click **Claim & start editing** → upload a different `.mp4` as
   the cut. Creator sees it in *To review*.
4. Creator scrubs the player, clicks *Pin comment*, types a note. Editor sees
   it appear live in the comments panel.
5. Creator clicks **Request revisions** with a note → editor uploads revision 2.
6. Creator approves → marks published with a YouTube URL.
7. Both files (raw + edits) live in your Drive's `Reel Workspace` folder.
