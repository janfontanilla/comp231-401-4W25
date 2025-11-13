# MyTracker
COMP231 Software Development Project 1 Group 4 Project

## Project Structure

- `/app` - Next.js 14 application (main application)
- `/frontend` - Homepage and auth
- `/prisma` - Database schema and migrations
- `/components` - React components
- `/actions` - Server actions for data mutations
- `/lib` - Utility functions and configurations

## Description
Fullstack NextJs 14 MyTracker app allowing users to create boards with lists and cards that can speed up process of developing software or just to create notes. This app allows users to organize lists and cards using the Drag n' Drop feature.

## Tech stack

- **NextJs 14**
- **React**
- **Typescript**
- **Tailwindcss**
- **Server Actions**
- **Prisma**
- **MySQL** (hosted on Railway)
- **Shadcn-ui**
- **Unsplash API**

## Key features

- Creating boards, lists and cards
- Organizing lists and cards via Drag n' Drop
- Unsplash API for random cover images
- Activity logs
- Boards, Lists and Cards actions
- Unlimited boards (no limits)
- Public access - no authentication required

## Getting Started

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env` file):
```env
DATABASE_URL= Please message Jan Fontanilla on teams for the database url
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
NEXT_PUBLIC_APP_URL=http://localhost:3000


```

3. Run database migrations:
```bash
npx prisma generate
npx prisma db push
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Group Members

- Kefah Abboud (301258693)
- Ryan Massey (301107847)
- Percy Osunde (301185959)
- Saeed Herzi (301317522)
- Jan Rafael Fontanilla (301380907)
