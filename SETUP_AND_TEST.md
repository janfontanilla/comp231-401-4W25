# Setup and Testing Guide

## Prerequisites Setup

### 1. Create .env File

Create a `.env` file in the root directory with your database connection:

```env
DATABASE_URL="mysql://username:password@localhost:3306/mytracker"
```

**For Railway (if using):**
```env
DATABASE_URL="mysql://root:password@containers-us-west-54.railway.app:3306/railway"
```

**For Local MySQL:**
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/mytracker"
```

### 2. Run Database Migration

```bash
npx prisma migrate dev --name add_admin_role_and_task_assignment
```

This will:
- Add `role` column to User table
- Add `assignedToId` column to Card table
- Create the relationship

### 3. Create Admin User

**Option A: Using Prisma Studio (Easiest)**
```bash
npx prisma studio
```
1. Click on "User" table
2. Find your user account
3. Click on the `role` field
4. Change from "user" to "admin"
5. Click the save icon (floppy disk)

**Option B: Using SQL**
Connect to your MySQL database and run:
```sql
UPDATE User SET role = 'admin' WHERE email = 'your-email@example.com';
```

**Option C: Create New Admin User via Registration**
1. Register a new user at `/register`
2. Then update that user's role to "admin" using Option A or B

---

## Testing Steps

### Step 1: Start Development Server

```bash
npm run dev
```

Server should start at `http://localhost:3000`

### Step 2: Test Authentication

1. **As Regular User:**
   - Log in with a user that has `role = "user"`
   - Try to navigate to `http://localhost:3000/admin`
   - **Expected:** Redirected to `/organization/default-org`
   - **Check:** No "Admin" link in sidebar

2. **As Admin User:**
   - Log in with a user that has `role = "admin"`
   - **Expected:** "Admin" link appears in sidebar under "Administration"
   - Click "Admin" link
   - **Expected:** Dashboard loads at `/admin`

### Step 3: Test Admin Dashboard (AR1)

Navigate to `http://localhost:3000/admin`

**Verify:**
- ✅ Page title: "Admin Dashboard"
- ✅ Four stat cards showing:
  - Total Boards
  - Total Cards
  - Total Users
  - Completion Rate
- ✅ Recent Activity section showing last 10 activities
- ✅ "View All" link works

**If stats show 0:**
- Create some test data first:
  - Create a board
  - Create lists in the board
  - Create cards in the lists

### Step 4: Test User Management (AR3)

Navigate to `http://localhost:3000/admin/users`

**Test Search:**
1. Type a user's name in search box
2. **Expected:** Table filters to show matching users

**Test Filter:**
1. Select "Admin" from role dropdown
2. **Expected:** Only admin users shown

**Test Add User:**
1. Click "Add User" button
2. Fill in form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Role: "User"
3. Click "Create User"
4. **Expected:**
   - Modal closes
   - New user appears in table
   - Can log in with new credentials

**Test Delete User:**
1. Click trash icon next to a user
2. Confirm deletion
3. **Expected:** User removed from table

### Step 5: Test Task Assignment (AR2)

1. Navigate to any board (or create one)
2. Click "Add a card" in any list
3. **Verify:**
   - Card form opens
   - "Assigned To" dropdown appears
   - Can select a user from dropdown
4. Enter card title: "Test Task"
5. Select a user from "Assigned To"
6. Click "Add card"
7. **Expected:**
   - Card created
   - Card displays with assignee badge (avatar icon)

**Test Change Assignee:**
1. Click on the card to open modal
2. **Verify:** "Assigned To" dropdown shows in header
3. Change assignee to different user
4. **Expected:** Assignment updates, success toast appears
5. Remove assignment (select "Unassigned")
6. **Expected:** Badge disappears

### Step 6: Test Performance Reports (AR4)

Navigate to `http://localhost:3000/admin/reports`

**Verify:**
- ✅ Stats cards display (Total Cards, Cards Created, etc.)
- ✅ "Activity by Type" chart renders
- ✅ "Activity by Action" chart renders
- ✅ Top Active Users list displays
- ✅ Export buttons visible

**Test CSV Export:**
1. Click "Export CSV"
2. **Expected:** File downloads as `mytracker-report-YYYY-MM-DD.csv`
3. Open file
4. **Expected:** Contains report data with columns

**Test PDF Export:**
1. Click "Export PDF"
2. **Expected:** File downloads as `mytracker-report-YYYY-MM-DD.pdf`
3. Open file
4. **Expected:** PDF contains report with statistics and activity

---

## Quick Verification Checklist

Run through this checklist:

- [ ] Database migration completed successfully
- [ ] Admin user created (role = "admin")
- [ ] Server starts without errors
- [ ] Can log in as admin
- [ ] Admin link appears in sidebar
- [ ] Dashboard loads and shows stats
- [ ] User management page loads
- [ ] Can add new user
- [ ] Can delete user
- [ ] Can assign task when creating card
- [ ] Assignee badge appears on cards
- [ ] Can change assignee in card modal
- [ ] Reports page loads
- [ ] Charts render correctly
- [ ] CSV export works
- [ ] PDF export works

---

## Troubleshooting

### Migration Fails
**Error:** "Environment variable not found: DATABASE_URL"
- **Solution:** Create `.env` file with DATABASE_URL

**Error:** "Can't reach database server"
- **Solution:** Check DATABASE_URL is correct, database is running

### Admin Access Denied
**Error:** "Unauthorized: Admin access required"
- **Solution:** Verify user has `role = 'admin'` in database

### Dashboard Shows Zeros
- **Solution:** Create some test data (boards, cards, users)

### Charts Don't Render
- **Solution:** Check browser console for errors
- Verify: `npm list recharts` shows package installed

### Export Doesn't Work
- **Solution:** Check browser console
- Verify: `npm list papaparse jspdf` shows packages installed

---

## Test Data Creation Script

To quickly create test data, you can use Prisma Studio or run SQL:

```sql
-- Create a test board (if you have a board creation feature)
-- Or use the UI to create boards, lists, and cards

-- Verify data exists:
SELECT COUNT(*) FROM Board;
SELECT COUNT(*) FROM Card;
SELECT COUNT(*) FROM User;
SELECT COUNT(*) FROM AuditLog;
```

---

## Next Steps

Once all tests pass:
1. ✅ Document any issues found
2. ✅ Take screenshots for documentation
3. ✅ Update README with admin features
4. ✅ Prepare for demo/presentation

