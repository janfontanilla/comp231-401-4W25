# 🚀 How to Run MyTracker

This guide will walk you through setting up and running the MyTracker application.

**Note:** This version has been refactored to remove authentication (Clerk) and payment (Stripe) dependencies. The app now runs publicly without login requirements.

## Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Railway Account** (for cloud database hosting) - [Sign up here](https://railway.app)
- **Unsplash API Key** (for board cover images) - [Get API key here](https://unsplash.com/developers) (optional, but recommended)

## Step-by-Step Setup

### 1. Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages and automatically run `prisma generate` (via the `postinstall` script).

### 2. Set Up Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# Unsplash API (for board cover images - optional but recommended)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### How to get these values:

- **DATABASE_URL**: See "Set Up Railway Database" section below
- **Unsplash Access Key** (optional):
  1. Go to [Unsplash Developers](https://unsplash.com/developers)
  2. Create a new application
  3. Copy the `Access Key`
  
  **Note:** If you don't provide an Unsplash key, board cover image selection may not work properly.

### 3. Set Up Railway Database

Railway is one of the easiest cloud options for hosting your MySQL database. No local database setup needed!

#### Step 1: Create a Railway Account

1. Go to [Railway.app](https://railway.app)
2. Click **"Start New Project"** → Sign in with GitHub
3. You'll be taken to your dashboard

#### Step 2: Add a MySQL Database

1. On the Railway dashboard, click **"New"** → **"Database"**
2. Choose **MySQL** (to match your current Prisma schema)
3. Wait for it to finish provisioning (takes just a few seconds)
4. Once it's ready, click on your new MySQL service

#### Step 3: Copy Your Connection URL

1. In your MySQL service, find the **"Connect"** section
2. Railway will show you a connection URL like:
   ```
   mysql://root:password@containers-us-west-54.railway.app:3306/railway
   ```
3. Copy this entire connection string

#### Step 4: Add DATABASE_URL to Your .env

Update your `.env` file with the Railway connection string:

```env
DATABASE_URL="mysql://root:password@containers-us-west-54.railway.app:3306/railway"
```

Replace the example above with your actual Railway connection string.

#### Step 5: Sync Your Database Schema

In your terminal (inside the project directory), run:

```bash
npx prisma generate
npx prisma db push
```

This will create all your tables in Railway automatically.

**Alternative:** If you prefer using migrations:

```bash
npx prisma migrate deploy
```

Your database is now set up in the cloud! 🎉

#### Option B: Using Local MySQL (Alternative)

If you prefer to use a local MySQL database:

1. Make sure your MySQL server is running
2. Update your `.env` with:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/mytracker"
   ```
3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

### 4. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Build for Production (Optional)

To create a production build:

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Troubleshooting

### Database Connection Issues
- **Railway**: Verify your `DATABASE_URL` is correct and matches the connection string from Railway dashboard
- **Local MySQL**: Make sure your MySQL server is running
- Check that your database connection string is properly formatted
- Ensure your Railway database service is running (check Railway dashboard)

### Prisma Issues
- Run `npx prisma generate` manually if needed
- Run `npx prisma migrate reset` to reset the database (⚠️ This will delete all data)

### Port Already in Use
- If port 3000 is in use, Next.js will automatically use the next available port
- Or specify a different port: `npm run dev -- -p 3001`

## Project Structure

- `/app` - Next.js 14 app directory with routes
- `/components` - React components
- `/lib` - Utility functions and configurations
- `/prisma` - Database schema
- `/actions` - Server actions for data mutations
- `/hooks` - Custom React hooks

## Important Notes

- **No Authentication Required**: The app runs publicly without login. All users share the same workspace.
- **No Payment Processing**: Stripe has been removed. All features are free and unlimited.
- **Default Organization**: All boards are created under a default organization ID (`default-org`).

## Need Help?

- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Prisma documentation](https://www.prisma.io/docs)

