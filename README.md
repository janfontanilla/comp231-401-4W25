# MyTracker

COMP231 Software Development Project 1 — Group 4 Project

Fullstack Next.js 14 application that lets users create boards, lists, and cards for project planning or quick note organization. Drag-and-drop makes reordering effortless. Cards support **file attachments** and **due dates with email deadline reminders**.

## Description

MyTracker is a Trello-style board app: create boards with lists and cards to organize work or notes, and reorder them with drag-and-drop. Cards can be assigned to users, given due dates, and have files (PDFs, images, notes) attached.

- `/app` – Next.js 14 app directory and routes (incl. API route handlers)
- `/frontend` – Marketing/homepage assets
- `/prisma` – Prisma schema
- `/components` – Reusable UI components
- `/actions` – Server actions for CRUD operations
- `/hooks` – Custom hooks
- `/lib` – Utilities and configs (db, auth, cloudinary, email, notifications)

## Tech Stack

- **Next.js 14** + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Server Actions** + **Prisma**
- **PostgreSQL** (Neon / Vercel Postgres / Supabase — any Postgres)
- **Cloudinary** – file/attachment storage
- **Resend** – deadline reminder emails
- **Unsplash API** – board cover images (optional)

## Key Features

- Create boards, lists, and cards with drag-and-drop reordering
- Assign cards to users
- **Due dates** on cards
- **File attachments** on cards (stored in Cloudinary)
- **Email deadline reminders** (sent by a daily cron job)
- In-app notifications and activity logs
- **Email-to-Board**: forwarded emails become cards (with their PDF attachments saved)
- Admin dashboard, guest invites/feedback

## Prerequisites

- **Node.js 18+** (includes npm)
- A **PostgreSQL** database (free: [Neon](https://neon.tech) or Vercel Postgres)
- A **Cloudinary** account (free tier) — for file uploads
- A **Resend** account (free tier) — for deadline emails
- An **Unsplash** access key (optional) — for cover images

## Local Setup

### 1. Install dependencies

```bash
npm install
```

`postinstall` automatically runs `prisma generate`.

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `NEXT_PUBLIC_APP_URL` | Base URL for links in emails/notifications |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | File uploads |
| `RESEND_API_KEY` / `EMAIL_FROM` | Deadline reminder emails |
| `CRON_SECRET` | Protects the cron endpoint (`openssl rand -hex 32`) |
| `INBOUND_EMAIL_SECRET` | Protects the email-to-board webhook (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Cover images (optional) |

### 3. Create the database schema

Push the Prisma schema to your Postgres database:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Deploying to Vercel (free)

1. Push this repo to GitHub.
2. Create a free **Postgres** database — e.g. [Neon](https://neon.tech) — and copy its connection string.
3. Create free **Cloudinary** and **Resend** accounts and grab their credentials.
4. Import the GitHub repo into [Vercel](https://vercel.com).
5. In **Project → Settings → Environment Variables**, add every variable from the table above. Set `NEXT_PUBLIC_APP_URL` to your Vercel production URL.
6. Deploy. Vercel runs `npm run build` automatically.
7. After the first deploy, run the schema push against the production DB (locally with the prod `DATABASE_URL`, or via a one-off):
   ```bash
   npx prisma db push
   ```

### Deadline reminder cron

`vercel.json` registers a cron job that calls `/api/cron/check-deadlines`:

```json
{ "crons": [ { "path": "/api/cron/check-deadlines", "schedule": "0 8 * * *" } ] }
```

> **Note:** Vercel's free Hobby plan only allows **daily** cron jobs. The job runs once a day and notifies anyone with a deadline in the next 24 hours. The endpoint is protected by `CRON_SECRET` (Vercel sends it as a Bearer token automatically). For more frequent checks, either upgrade to Vercel Pro or ping the endpoint from a free external cron service (e.g. cron-job.org) with the `Authorization: Bearer <CRON_SECRET>` header.

You can trigger a check manually for testing:

```bash
curl -X POST https://<your-app>/api/cron/check-deadlines
```

## Email-to-Board (auto-import emails as cards)

Forwarded emails are turned into cards on an auto-created **"Email Inbox"** board
(in an **"Inbox"** list), and any attachments (PDFs, etc.) are saved to Cloudinary
and attached to the card. Imports are deduplicated by the email's `Message-ID`.

Setup uses a free inbound-email provider so you don't need your own domain:

1. **Sign up at [CloudMailin](https://www.cloudmailin.com)** (free tier; alternatives:
   Postmark, Pingram). You'll get a ready-to-use parse address, e.g.
   `something@cloudmailin.net`.
2. **Point the provider at the webhook.** Set its POST target to:
   ```
   https://<your-app>/api/inbound-email?secret=<INBOUND_EMAIL_SECRET>
   ```
   Use the **multipart (normalized)** format. (The webhook also accepts JSON.)
3. **Generate `INBOUND_EMAIL_SECRET`** (`openssl rand -hex 32`) and add it to your
   `.env` and Vercel env vars.
4. **Forward your course emails to the parse address.** In Outlook (Centennial
   M365), create a rule: *from contains `brightspace` (or `luminate`) → forward to*
   the CloudMailin address.
   > If your school disables external auto-forwarding, just forward the emails you
   > want manually — the webhook treats both the same way.

Test it locally without a provider (multipart POST with a file):

```bash
curl -X POST "http://localhost:3000/api/inbound-email?secret=$INBOUND_EMAIL_SECRET" \
  -F "from=Brightspace <noreply@brightspace.com>" \
  -F "subject=Week 1 Lecture Notes" \
  -F "plain=See attached." \
  -F "headers=Message-ID: <test-123@brightspace.com>" \
  -F "attachments[0]=@/path/to/notes.pdf"
```

A card titled "Week 1 Lecture Notes" should appear in the Email Inbox board with
the PDF attached. Re-running the same command returns `{ "skipped": true }`.

## Available Scripts

- `npm run dev` – Start the dev server
- `npm run build` – Production build
- `npm start` – Run the production server
- `npm run lint` – ESLint
- `npm test` – Jest test suite

## Troubleshooting

- **Database fails to connect** – confirm `DATABASE_URL` and that the Postgres instance is reachable (Neon requires `?sslmode=require`).
- **Prisma issues** – rerun `npx prisma generate`; reset with `npx prisma db push --force-reset` (clears data).
- **Uploads return 503** – the Cloudinary env vars are missing.
- **No reminder emails** – check `RESEND_API_KEY`/`EMAIL_FROM` and that the assignee has email + deadline notifications enabled; inspect the Resend dashboard logs.

## Group Members

- Kefah Abboud (301258693)
- Ryan Massey (301107847)
- Percy Osunde (301185959)
- Jan Rafael Fontanilla (301380907)
