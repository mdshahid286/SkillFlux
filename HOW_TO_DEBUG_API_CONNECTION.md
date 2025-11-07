# 🔍 How to Debug API Connection (Browser Console)

## ⚠️ Important: `process.env` is NOT Available in Browser Console

`process.env` variables are **embedded at build time** and are NOT accessible in the browser console. This is normal and expected.

## ✅ Correct Way to Debug

### Method 1: Check Network Tab (Best Method)

1. Open your Netlify site
2. Open **Developer Tools** (F12)
3. Go to **Network** tab
4. Try using your app (login, resume analysis, etc.)
5. Look for API requests:
   - **What URL is being called?**
   - **Status code?** (200 = success, 404 = not found, CORS error = connection issue)
   - **Response?**

**What to look for:**
- ✅ **Good**: Requests going to `https://your-backend.onrender.com/api/...`
- ❌ **Bad**: Requests going to `https://your-app.netlify.app/api/...` (env var not set)
- ❌ **Bad**: Requests to `localhost:5000` (wrong for production)

### Method 2: Check Build Logs in Netlify

1. Go to **Netlify Dashboard** → Your Site → **Deploys**
2. Click on the latest deployment
3. Click **"View build log"**
4. Search for `REACT_APP_API_BASE_URL`
5. Should see it being used during build

### Method 3: Add Temporary Debug Code

I've added console logging to `client/src/config/api.js` that will show the API URL when the app loads.

**Check your browser console** - you should see:
```
🔗 API Base URL: https://your-backend.onrender.com
```

If you see:
```
🔗 API Base URL: ⚠️ NOT SET - API calls will fail!
```

Then the environment variable is not set or frontend wasn't redeployed.

### Method 4: Test API Call Directly

In browser console, test the actual API call:
```javascript
// Replace with your actual Render backend URL
fetch('https://your-backend-url.onrender.com/')
  .then(r => r.text())
  .then(data => console.log('✅ Backend response:', data))
  .catch(err => console.error('❌ Error:', err));
```

**Expected**: `Career Development Webapp Backend`  
**If error**: Backend is not accessible or URL is wrong

## 🐛 Common Issues

### Issue 1: API Calls Going to Netlify Domain

**Symptom**: Network tab shows requests to `your-app.netlify.app/api/...`

**Cause**: `REACT_APP_API_BASE_URL` not set or frontend not redeployed

**Fix**:
1. Set `REACT_APP_API_BASE_URL` in Netlify environment variables
2. **Redeploy frontend** (env vars only work on new builds)

### Issue 2: CORS Error

**Symptom**: `Access-Control-Allow-Origin` error in console

**Fix**:
1. Set `FRONTEND_URL` in Render to your Netlify URL
2. Redeploy backend

### Issue 3: 404 Not Found

**Symptom**: API calls return 404

**Fix**:
1. Verify backend URL is correct
2. Check if backend is running (visit Render URL directly)
3. Check Render logs for errors

### Issue 4: Network Error / Failed to Fetch

**Symptom**: `Failed to fetch` or network error

**Possible causes**:
1. Backend is down (check Render dashboard)
2. Backend URL is wrong
3. Backend cold start (wait 30-60 seconds, then retry)

## 📋 Quick Checklist

- [ ] Check Network tab - what URLs are being called?
- [ ] Check browser console - see the `🔗 API Base URL:` log message
- [ ] Test backend directly - visit Render URL in browser
- [ ] Verify env var is set in Netlify
- [ ] Verify frontend was redeployed after setting env var
- [ ] Check Render logs for errors

## 🎯 What to Share for Help

If still not working, share:
1. **Network tab screenshot** - showing what URL is being called
2. **Console log** - the `🔗 API Base URL:` message
3. **Error message** - from Network tab or console
4. **Backend URL** - your Render backend URL (to verify it's accessible)

---

**Remember**: `process.env` is NOT available in browser console. Use Network tab to see actual API calls!

