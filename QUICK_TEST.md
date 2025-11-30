# Quick Testing Steps

## Step 1: Verify Database Setup

Make sure you have a `.env` file in the root directory with:
```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

If you don't have a `.env` file, create one now.

## Step 2: Run Migration

Once DATABASE_URL is set, run:
```bash
npx prisma migrate dev --name add_admin_role_and_task_assignment
```

## Step 3: Create Admin User

After migration, you need to set a user as admin. You can use Prisma Studio:

```bash
npx prisma studio
```

Then:
1. Open User table
2. Find your user
3. Change `role` from "user" to "admin"
4. Save

## Step 4: Start Server

```bash
npm run dev
```

## Step 5: Test Features

1. Log in with your admin account
2. Check sidebar for "Admin" link
3. Navigate to `/admin` - should see dashboard
4. Test each feature as described in TESTING_GUIDE.md

