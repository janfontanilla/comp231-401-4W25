# MyTracker

COMP231 Software Development Project 1 Group 4 Project

Fullstack Next.js 14 application that lets users create boards, lists, and cards for project planning or quick note organization. Drag-and-drop interactions make reordering effortless. 

## Project Structure

- `/app` – Next.js 14 app directory and routes
- `/frontend` – Marketing/homepage assets
- `/prisma` – Prisma schema and migrations
- `/components` – Reusable UI components
- `/actions` – Server actions for CRUD operations
- `/hooks` – Custom hooks
- `/lib` – Utilities and configs

## Tech Stack

- **Next.js 14**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Server Actions**
- **Prisma**
- **MySQL** 
- **shadcn/ui**
- **Unsplash API**

## Key Features

- Create unlimited boards, lists, and cards
- Drag-and-drop reordering
- Unsplash-powered cover images
- Activity logs

## Prerequisites

- **Node.js 18+** (includes npm)
- **Railway account** (for hosted MySQL) or local MySQL
- **Unsplash API access key** (optional but recommended)

## Setup

### 1. Install Dependencies

```bash
npm install
```

`postinstall` automatically runs `prisma generate`.

### 2. Configure Environment Variables

Create `.env` with:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# Unsplash (optional, improves cover selection)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Helpful notes

- **DATABASE_URL** can come from Railway (see below) or a local MySQL instance.
- Without an Unsplash key, cover image selection falls back to defaults.

### 3. Railway Database (Recommended)

1. Sign up at [Railway](https://railway.app) and create a new project.
2. Add a **MySQL** database.
3. Copy the connection string from the **Connect** panel, e.g. `mysql://root:password@containers-us-west-54.railway.app:3306/railway`.
4. Paste that string into `DATABASE_URL` in `.env`.
5. Sync the schema:

```bash
npx prisma generate
npx prisma db push
```

Prefer migrations?

```bash
npx prisma migrate deploy
```

#### Local MySQL Alternative

```env
DATABASE_URL="mysql://root:password@localhost:3306/mytracker"
```

Then run:

```bash
npx prisma migrate dev
```

### 4. Run the Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 5. Production Build (Optional)

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` – Start the dev server
- `npm run build` – Create production build
- `npm start` – Run the production server
- `npm run lint` – ESLint
- `npm test` – Jest test suite
- `npm run test:watch` – Jest watch mode

## Troubleshooting

- **Database fails to connect** – confirm `DATABASE_URL`, ensure Railway service (or local MySQL) is running.
- **Prisma issues** – rerun `npx prisma generate`; reset with `npx prisma migrate reset` (clears data).
- **Port already in use** – Next.js picks another port, or run `npm run dev -- -p 3001`.


## Need Help?

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

## Group Members

- Kefah Abboud (301258693)
- Ryan Massey (301107847)
- Percy Osunde (301185959)
- Jan Rafael Fontanilla (301380907)
