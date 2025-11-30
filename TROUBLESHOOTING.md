# Troubleshooting Guide

## Error Code -102

**Error Code -102** typically means the server is not running or cannot be reached.

### Solution:

1. **Start the Development Server:**
   ```bash
   npm run dev
   ```

2. **Wait for the server to start:**
   - You should see: "✓ Ready in X seconds"
   - Look for: "Local: http://localhost:3000"

3. **Check if server is running:**
   - Open browser to `http://localhost:3000`
   - If still getting error, check terminal for error messages

### Common Issues:

#### Issue: "Port 3000 is already in use"
**Solution:**
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port:
npm run dev -- -p 3001
```

#### Issue: "Environment variable not found: DATABASE_URL"
**Solution:**
- Make sure `.env` file exists in root directory
- Verify DATABASE_URL is set correctly
- Restart the dev server after creating/updating .env

#### Issue: "Can't reach database server"
**Solution:**
- Check Railway database is active (if using Railway)
- Verify DATABASE_URL connection string is correct
- Test connection: `npx prisma db pull`

#### Issue: Server starts but page shows error
**Solution:**
- Check browser console (F12) for errors
- Check terminal/console for server errors
- Verify database connection is working

---

## Quick Fixes

### Restart Everything:
```bash
# 1. Stop the server (Ctrl+C)
# 2. Verify .env exists
# 3. Test database connection
npx prisma db pull

# 4. Start server again
npm run dev
```

### Check Database Connection:
```bash
# Test if database is accessible
npx prisma studio
# If this opens, database connection is working
```

### Verify Environment Variables:
```bash
# Windows PowerShell:
Get-Content .env

# Should show:
# DATABASE_URL="mysql://..."
```

---

## Still Having Issues?

1. **Check Terminal Output:**
   - Look for red error messages
   - Check what port the server is trying to use

2. **Check Browser Console:**
   - Press F12 in browser
   - Look at Console tab for errors
   - Check Network tab for failed requests

3. **Verify Files:**
   - `.env` file exists in root
   - `node_modules` folder exists (run `npm install` if missing)
   - Database is accessible

