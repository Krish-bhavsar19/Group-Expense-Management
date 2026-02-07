# Debugging Guide: "Route not found" and "Network Error"

## The Problem
- **Manual Input**: Shows "Route not found" error
- **Voice Input**: Shows "Error: network"

## Root Cause
The backend server is either:
1. Not running
2. Running on a different port
3. Has an error preventing it from starting

## Step-by-Step Fix

### 1. Check if Backend is Running

Open your backend terminal and look for:
```
🚀 Server running on port 5000
```

If you DON'T see this, the server is not running properly.

### 2. Start the Backend Server

```bash
cd backend
npm start
# OR
npm run dev
```

### 3. Check for Startup Errors

If the server crashes on startup, you might see errors about:

#### Missing GEMINI_API_KEY
```
Error: Cannot find module '@google/generative-ai'
```
**Fix**: The packages are already installed (we did this earlier).

#### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Fix**: Make sure MySQL is running.

### 4. Verify Routes are Working

Once the server is running, you should see in the console:
```
🚀 Server running on port 5000
📊 Environment: development  
🌐 Frontend URL: http://localhost:5173
```

### 5. Test the API Manually

Open browser and go to:
```
http://localhost:5000/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

If you see this, the backend is working!

### 6. Check Frontend API URL

Make sure `frontend/.env` has:
```
VITE_API_URL=http://localhost:5000
```

### 7. Restart Frontend

After confirming backend is running:
```bash
cd frontend
npm run dev
```

### 8. Test the Expense Feature

1. Go to a group
2. Click "View Expenses"
3. Click "Add Expense"
4. Try manual entry - should work now!

## Quick Checklist

- [ ] Backend server is running on port 5000
- [ ] You see "Server running" message in backend terminal
- [ ] `http://localhost:5000/health` returns JSON
- [ ] Frontend `.env` has correct `VITE_API_URL`
- [ ] Frontend is running on port 5173
- [ ] Browser console shows no CORS errors

## Still Not Working?

### Check Backend Terminal for Errors

Look for:
- `Error: listen EADDRINUSE` → Port 5000 is already in use
  - **Fix**: Kill the process or change port
- `Cannot find module` → Missing dependency
  - **Fix**: `npm install` in backend folder
- Database errors → MySQL not connected
  - **Fix**: Start MySQL service

### Check Browser Console (F12)

- `net::ERR_CONNECTION_REFUSED` → Backend not running
- `404 Not Found` → Frontend pointing to wrong URL
- `CORS error` → Backend CORS not configured (but we already set it up)

## The Likely Issue

Based on your errors, the backend server is probably **not running**.

**Solution**: Open a new terminal, navigate to the backend folder, and run:
```bash
cd backend
npm run dev
```

Leave this terminal open - the server needs to keep running!

Then try adding an expense again.
