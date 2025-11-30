# Admin Features Testing Guide

This guide will help you test all the admin features implemented for Iteration 2.

## Prerequisites

### 1. Run Database Migration

First, ensure your database is set up and run the migration:

```bash
# Make sure DATABASE_URL is set in your .env file
npx prisma migrate dev --name add_admin_role_and_task_assignment
```

This will:
- Add `role` field to User table (default: "user")
- Add `assignedToId` field to Card table
- Create the relationship between Card and User

### 2. Create an Admin User

You need at least one user with admin role to test the admin features. You can do this in two ways:

**Option A: Using SQL (Recommended)**
```sql
-- Connect to your MySQL database and run:
UPDATE User SET role = 'admin' WHERE email = 'your-email@example.com';
```

**Option B: Using Prisma Studio**
```bash
npx prisma studio
```
- Navigate to User table
- Find your user
- Change the `role` field from "user" to "admin"
- Save

### 3. Start the Development Server

```bash
npm run dev
```

The application should be running at `http://localhost:3000`

---

## Testing Checklist

### ✅ Phase 1: Foundation & Authentication

#### Test 1.1: Admin Route Protection
1. **As a regular user (non-admin):**
   - Log in with a user account that has `role = "user"`
   - Try to navigate to `/admin` directly
   - **Expected:** Should be redirected to `/organization/default-org`
   - **Verify:** Admin link should NOT appear in sidebar

2. **As an admin user:**
   - Log in with a user account that has `role = "admin"`
   - Navigate to `/admin`
   - **Expected:** Should see the Admin Dashboard page
   - **Verify:** Admin link should appear in sidebar under "Administration" section

---

### ✅ Phase 2: Admin Dashboard (AR1)

#### Test 2.1: Dashboard Access
1. Log in as admin
2. Click "Admin" in the sidebar
3. **Expected:** Dashboard page loads with:
   - Page title: "Admin Dashboard"
   - Subtitle: "Overview of system metrics and project progress"

#### Test 2.2: Dashboard Statistics
**Verify the stats cards display:**
1. **Total Boards** - Should show count of all boards
2. **Total Cards** - Should show count of all cards
3. **Total Users** - Should show count of all users
4. **Completion Rate** - Should show a percentage

**Test with data:**
- Create some boards, lists, and cards first
- Refresh the dashboard
- Verify numbers update correctly

#### Test 2.3: Recent Activity Feed
1. **Expected:** Should see last 10 audit log entries
2. **Verify:** Each entry shows:
   - User name
   - Action (created/updated/deleted)
   - Entity type (board/list/card)
   - Timestamp
3. Click "View All" link
   - **Expected:** Should navigate to activity page

#### Test 2.4: Loading States
1. Open browser DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Navigate to `/admin`
4. **Expected:** Should see skeleton loaders while data loads

---

### ✅ Phase 3: User Management (AR3)

#### Test 3.1: Access User Management
1. Log in as admin
2. Navigate to `/admin/users`
3. **Expected:** User Management page loads

#### Test 3.2: View Users Table
**Verify the table displays:**
- All users in the system
- Columns: Name, Email, Role, Created Date, Actions
- Role badges (purple for admin, gray for user)

#### Test 3.3: Search Functionality
1. Type a user's name in the search box
2. **Expected:** Table filters to show matching users
3. Type a user's email
4. **Expected:** Table filters correctly

#### Test 3.4: Filter by Role
1. Select "Admin" from role filter
2. **Expected:** Only admin users shown
3. Select "User" from role filter
4. **Expected:** Only regular users shown
5. Select "All Roles"
6. **Expected:** All users shown

#### Test 3.5: Add New User
1. Click "Add User" button
2. **Expected:** Modal dialog opens
3. Fill in the form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Role: Select "User" or "Admin"
4. Click "Create User"
5. **Expected:**
   - Modal closes
   - Success toast appears
   - New user appears in table
   - Can log in with new credentials

**Test validation:**
- Try submitting with empty fields → Should show validation errors
- Try duplicate email → Should show error message
- Try password < 6 characters → Should show validation error

#### Test 3.6: Delete User
1. Find a user in the table
2. Click the trash icon
3. **Expected:** Confirmation dialog appears
4. Click "Delete User"
5. **Expected:**
   - Dialog closes
   - User removed from table
   - Success message (if implemented)

**Test edge cases:**
- Try to delete your own admin account → Should show error (if implemented)
- Try to delete a user that doesn't exist → Should handle gracefully

---

### ✅ Phase 4: Task Assignment (AR2)

#### Test 4.1: Assign User During Card Creation
1. Navigate to any board
2. Click "Add a card" in any list
3. **Expected:** Card form opens with:
   - Title textarea
   - **NEW:** User selector dropdown
4. Enter card title: "Test Task"
5. Select a user from "Assigned To" dropdown
6. Click "Add card"
7. **Expected:**
   - Card created successfully
   - Card displays with assignee badge (avatar icon)

#### Test 4.2: View Assigned Cards
1. Create a card with an assignee
2. **Expected:** On the card item, you should see:
   - Card title
   - Small avatar/badge showing assignee
3. Hover over the badge
   - **Expected:** Tooltip shows assignee name (if implemented)

#### Test 4.3: Change Assignee in Card Modal
1. Click on a card to open the modal
2. **Expected:** In the header section, you should see:
   - "Assigned To" dropdown
   - Current assignee displayed (if any)
3. Change the assignee:
   - Select different user from dropdown
   - **Expected:** Assignment updates immediately
   - Success toast appears
4. Remove assignment:
   - Select "Unassigned" from dropdown
   - **Expected:** Card shows no assignee badge

#### Test 4.4: Unassigned Cards
1. Create a card without selecting an assignee
2. **Expected:** Card displays normally without assignee badge
3. **Expected:** Can assign later via card modal

---

### ✅ Phase 5: Performance Reports (AR4)

#### Test 5.1: Access Reports Page
1. Log in as admin
2. Navigate to `/admin/reports`
3. **Expected:** Reports page loads

#### Test 5.2: View Report Statistics
**Verify stats cards display:**
- Total Cards
- Cards Created (in date range)
- Boards Created (in date range)
- Completion Rate

#### Test 5.3: View Charts
**Verify charts render:**
1. **Activity by Type** chart:
   - Should show bars for BOARD, LIST, CARD
   - Hover should show tooltips with counts
2. **Activity by Action** chart:
   - Should show bars for CREATE, UPDATE, DELETE
   - Hover should show tooltips with counts

#### Test 5.4: View User Activity
**Verify top active users list:**
- Shows up to 10 most active users
- Displays user name and activity count
- Sorted by activity (most active first)

#### Test 5.5: Export CSV
1. Click "Export CSV" button
2. **Expected:**
   - File download starts
   - Filename: `mytracker-report-YYYY-MM-DD.csv`
   - File contains report data
3. Open the CSV file
4. **Expected:** Should see columns:
   - Report Type, ID, Title, Action, User, Date

#### Test 5.6: Export PDF
1. Click "Export PDF" button
2. **Expected:**
   - File download starts
   - Filename: `mytracker-report-YYYY-MM-DD.pdf`
   - PDF opens correctly
3. **Verify PDF contains:**
   - Report title
   - Date range
   - Statistics summary
   - Recent activity list

---

## Manual Testing Scenarios

### Scenario 1: Complete Admin Workflow
1. Log in as admin
2. View dashboard → Verify metrics
3. Go to User Management → Add a new user
4. Go to a board → Create a card and assign it to the new user
5. Go to Reports → View charts and export CSV
6. **Expected:** All features work seamlessly together

### Scenario 2: Non-Admin User Experience
1. Log in as regular user (role = "user")
2. **Expected:** 
   - No "Admin" link in sidebar
   - Cannot access `/admin` routes (redirected)
   - Cannot access `/admin/users` (redirected)
   - Cannot access `/admin/reports` (redirected)
3. Can still use regular features:
   - Create boards, lists, cards
   - View cards
   - See activity

### Scenario 3: Task Assignment Workflow
1. Admin creates a card and assigns it to User A
2. User A logs in and views the board
3. **Expected:** User A can see the card with their assignee badge
4. Admin changes assignment to User B
5. **Expected:** Card now shows User B's badge
6. User A views the board again
7. **Expected:** Card no longer shows their badge

---

## Browser Testing

Test in multiple browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari (if on Mac)

**Check for:**
- Layout consistency
- Button clicks work
- Forms submit correctly
- Modals open/close properly
- Charts render correctly

---

## Responsive Testing

Test on different screen sizes:
1. **Desktop** (1920x1080) - Full features visible
2. **Tablet** (768px) - Should adapt layout
3. **Mobile** (375px) - Should be usable (may need scrolling)

**Check:**
- Stats cards stack on mobile
- Tables are scrollable
- Modals are full-width on mobile
- Charts are readable

---

## Error Handling Testing

### Test Error Scenarios:

1. **Network Errors:**
   - Disable network in DevTools
   - Try to load dashboard
   - **Expected:** Error message displayed

2. **Invalid Data:**
   - Try to create user with invalid email
   - **Expected:** Validation error shown

3. **Unauthorized Access:**
   - As non-admin, try to access `/api/admin/dashboard` directly
   - **Expected:** 403 Forbidden response

4. **Missing Data:**
   - Delete all users except one
   - Try to assign task to deleted user
   - **Expected:** Error handled gracefully

---

## Performance Testing

1. **Load Time:**
   - Open DevTools → Network tab
   - Navigate to `/admin`
   - **Expected:** Dashboard loads in < 2 seconds

2. **Large Datasets:**
   - Create 100+ users
   - Navigate to User Management
   - **Expected:** Table loads and is searchable

3. **Chart Rendering:**
   - Navigate to Reports with lots of activity
   - **Expected:** Charts render smoothly

---

## Troubleshooting

### Issue: "Unauthorized: Admin access required"
**Solution:**
- Verify user has `role = 'admin'` in database
- Check that you're logged in (cookie exists)
- Try logging out and back in

### Issue: Dashboard shows 0 for all metrics
**Solution:**
- Create some test data (boards, cards, users)
- Verify database connection
- Check browser console for errors

### Issue: User selector is empty
**Solution:**
- Verify `/api/admin/users` endpoint works
- Check browser console for API errors
- Ensure users exist in database

### Issue: Charts not rendering
**Solution:**
- Check browser console for errors
- Verify recharts is installed: `npm list recharts`
- Try refreshing the page

### Issue: Export buttons don't work
**Solution:**
- Check browser console for errors
- Verify papaparse and jspdf are installed
- Check network tab for API errors

### Issue: Migration fails
**Solution:**
- Verify DATABASE_URL is correct in `.env`
- Check database connection
- Try: `npx prisma db push` instead of migrate

---

## Quick Test Script

Run through this quick checklist:

```bash
# 1. Start server
npm run dev

# 2. In browser:
# - Login as admin
# - Navigate to /admin → ✅ Dashboard loads
# - Navigate to /admin/users → ✅ User table loads
# - Click "Add User" → ✅ Modal opens
# - Create a user → ✅ User appears in table
# - Go to board → ✅ Create card with assignee → ✅ Badge appears
# - Navigate to /admin/reports → ✅ Charts render
# - Click "Export CSV" → ✅ File downloads
```

---

## Success Criteria

All features are working correctly if:

✅ Admin can access all admin routes  
✅ Non-admin users are blocked from admin routes  
✅ Dashboard displays accurate metrics  
✅ User management CRUD operations work  
✅ Task assignment works in card creation and modal  
✅ Reports generate and export correctly  
✅ No console errors in browser  
✅ All UI components render properly  

---

## Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Document any issues** for future reference
3. **Create test data** for demonstration
4. **Take screenshots** for documentation
5. **Update README** with new admin features

---

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check server logs (terminal running `npm run dev`)
3. Verify database connection
4. Ensure all migrations are applied
5. Check that admin user role is set correctly

