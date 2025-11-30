# Database Configuration Guide

This guide will help you set up your MySQL database for the MyTracker application.

## Option 1: Railway (Cloud Database - Recommended)

Railway provides a free MySQL database that's easy to set up and doesn't require local installation.

### Steps:

1. **Sign up for Railway**
   - Go to [https://railway.app](https://railway.app)
   - Sign up with GitHub (free)

2. **Create a New Project**
   - Click "New Project"
   - Select "Provision MySQL"

3. **Get Your Connection String**
   - Click on the MySQL service
   - Go to the "Connect" or "Variables" tab
   - Copy the `DATABASE_URL` or `MYSQL_URL`
   - It will look like: `mysql://root:password@containers-us-west-54.railway.app:3306/railway`

4. **Create .env File**
   - In your project root, create a file named `.env`
   - Add the connection string:
   ```env
   DATABASE_URL="mysql://root:YOUR_PASSWORD@containers-us-west-54.railway.app:3306/railway"
   ```
   - Replace `YOUR_PASSWORD` with the actual password from Railway

5. **Test Connection**
   ```bash
   npx prisma db pull
   ```
   If this works, your connection is good!

---

## Option 2: Local MySQL Database

If you prefer to run MySQL on your local machine.

### Prerequisites:
- MySQL installed on your computer
- MySQL server running

### Steps:

1. **Install MySQL** (if not already installed)
   - **Windows:** Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
   - **Mac:** `brew install mysql` or download installer
   - **Linux:** `sudo apt-get install mysql-server` (Ubuntu/Debian)

2. **Start MySQL Server**
   - **Windows:** Start MySQL service from Services
   - **Mac/Linux:** `sudo systemctl start mysql` or `brew services start mysql`

3. **Create Database**
   ```sql
   mysql -u root -p
   ```
   Then in MySQL prompt:
   ```sql
   CREATE DATABASE mytracker;
   EXIT;
   ```

4. **Create .env File**
   - In your project root, create a file named `.env`
   - Add your connection string:
   ```env
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/mytracker"
   ```
   - Replace:
     - `root` with your MySQL username (if different)
     - `YOUR_PASSWORD` with your MySQL root password
     - `3306` with your MySQL port (default is 3306)
     - `mytracker` with your database name

5. **Test Connection**
   ```bash
   npx prisma db pull
   ```

---

## Complete .env File Template

Create a `.env` file in the root directory with:

```env
# Database Connection
# For Railway:
# DATABASE_URL="mysql://root:password@containers-us-west-54.railway.app:3306/railway"

# For Local MySQL:
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/mytracker"

# Optional: Unsplash API (for board cover images)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key_here

# Optional: App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## After Setting Up .env

### 1. Run Database Migration

This will create all the tables with the new admin features:

```bash
npx prisma migrate dev --name add_admin_role_and_task_assignment
```

**What this does:**
- Creates migration files
- Applies changes to your database:
  - Adds `role` column to `User` table
  - Adds `assignedToId` column to `Card` table
  - Creates indexes and relationships

### 2. Generate Prisma Client

```bash
npx prisma generate
```

This updates the TypeScript types based on your schema.

### 3. Verify Setup

**Option A: Using Prisma Studio (Visual)**
```bash
npx prisma studio
```
- Opens a web interface at `http://localhost:5555`
- You can see all your tables and data
- Great for testing and data management

**Option B: Test Connection**
```bash
npx prisma db pull
```
- If this runs without errors, your connection works!

---

## Connection String Format

The MySQL connection string format is:

```
mysql://[username]:[password]@[host]:[port]/[database]
```

### Examples:

**Local MySQL:**
```
mysql://root:mypassword@localhost:3306/mytracker
```

**Railway:**
```
mysql://root:abc123xyz@containers-us-west-54.railway.app:3306/railway
```

**With Special Characters in Password:**
If your password has special characters, URL encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- etc.

Example:
```
mysql://root:my%40password@localhost:3306/mytracker
```

---

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"
- **Solution:** Make sure `.env` file exists in the root directory
- Check the file is named exactly `.env` (not `.env.txt` or `.env.local`)
- Restart your terminal/IDE after creating the file

### Error: "Can't reach database server"
- **Solution:** 
  - Check MySQL server is running
  - Verify host, port, and database name are correct
  - Check firewall isn't blocking the connection
  - For Railway: Make sure the service is active

### Error: "Access denied for user"
- **Solution:**
  - Verify username and password are correct
  - Check user has permissions to access the database
  - For local MySQL: Make sure root user exists and has correct password

### Error: "Unknown database"
- **Solution:**
  - Create the database first: `CREATE DATABASE mytracker;`
  - Or use an existing database name

### Error: "P1001: Can't reach database server"
- **Solution:**
  - Check if MySQL is running: `mysql -u root -p`
  - Verify the port (default is 3306)
  - Check if the host is correct (localhost vs 127.0.0.1)

---

## Quick Setup Checklist

- [ ] MySQL installed and running (or Railway account set up)
- [ ] Database created (if using local MySQL)
- [ ] `.env` file created in project root
- [ ] `DATABASE_URL` added to `.env` with correct format
- [ ] Connection tested with `npx prisma db pull`
- [ ] Migration run: `npx prisma migrate dev --name add_admin_role_and_task_assignment`
- [ ] Prisma client generated: `npx prisma generate`

---

## Next Steps

After database is configured:

1. **Create an Admin User:**
   ```bash
   npx prisma studio
   ```
   - Open User table
   - Change a user's `role` to "admin"

2. **Start the Server:**
   ```bash
   npm run dev
   ```

3. **Test the Features:**
   - Log in as admin
   - Navigate to `/admin`
   - Test all admin features

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git (it's already in `.gitignore`)
- Don't share your database password
- Use strong passwords for production
- For production, use environment variables from your hosting platform

---

## Need Help?

- **Prisma Docs:** https://www.prisma.io/docs
- **MySQL Docs:** https://dev.mysql.com/doc/
- **Railway Docs:** https://docs.railway.app

