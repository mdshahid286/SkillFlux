# 🔍 Debug Frontend-Backend Connection

## Step 1: Verify Environment Variable in Netlify

1. Go to **Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**
2. Check if `REACT_APP_API_BASE_URL` exists
3. **Value should be**: `https://your-backend-url.onrender.com` (your actual Render URL)
4. **Important**: No trailing slash, include `https://`

## Step 2: Check Browser Console

1. Visit your Netlify site
2. Open browser console (F12)
3. Run this command to check the environment variable:
   ```javascript
   console.log('API URL:', process.env.REACT_APP_API_BASE_URL);
   ```
4. **Expected**: Should show your Render backend URL
5. **If undefined/empty**: Environment variable not set or frontend not redeployed

## Step 3: Test Backend Directly

1. Open a new tab
2. Visit your Render backend URL: `https://your-backend-url.onrender.com/`
3. **Expected**: Should see `Career Development Webapp Backend`
4. **If error**: Backend is not running or URL is wrong

## Step 4: Test API Call from Browser

On your Netlify site, open console and run:
```javascript
const apiUrl = process.env.REACT_APP_API_BASE_URL || '';
console.log('Testing API URL:', apiUrl);
fetch(`${apiUrl}/api/user/test/plan`)
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

**Check the Network tab** to see:
- What URL is being called
- What error you're getting
- Response status code

## Step 5: Check Render CORS Settings

1. Go to **Render Dashboard** → Your Backend Service → **Environment**
2. Check if `FRONTEND_URL` is set
3. **Value should be**: `https://your-app-name.netlify.app` (your Netlify URL)
4. **Important**: Must match exactly, including `https://`

## Step 6: Check Render Logs

1. Go to **Render Dashboard** → Your Backend Service → **Logs**
2. Look for:
   - CORS errors
   - Request logs
   - Any errors

## Common Issues & Solutions

### Issue 1: Environment Variable Not Set
**Symptom**: `process.env.REACT_APP_API_BASE_URL` is `undefined` in console

**Solution**:
1. Set `REACT_APP_API_BASE_URL` in Netlify environment variables
2. **Redeploy frontend** (env vars only apply to new builds)
3. Clear browser cache

### Issue 2: CORS Error
**Symptom**: `Access-Control-Allow-Origin` error in console

**Solution**:
1. Set `FRONTEND_URL` in Render to your Netlify URL
2. Redeploy backend
3. Verify URL matches exactly (no trailing slash)

### Issue 3: 404 Not Found
**Symptom**: API calls return 404

**Solution**:
1. Verify backend URL is correct
2. Check if backend is actually deployed and running
3. Test backend URL directly in browser

### Issue 4: Network Error / Failed to Fetch
**Symptom**: `Failed to fetch` or network error

**Solution**:
1. Check if backend is running (visit Render URL directly)
2. Check Render logs for errors
3. Verify backend URL is accessible (not blocked)

### Issue 5: Backend Cold Start
**Symptom**: First request takes 30-60 seconds, then works

**Solution**: This is normal for Render free tier. Backend spins down after 15 min inactivity.

## Quick Fix Checklist

- [ ] `REACT_APP_API_BASE_URL` set in Netlify = Render backend URL
- [ ] `FRONTEND_URL` set in Render = Netlify frontend URL  
- [ ] Frontend redeployed after setting env var
- [ ] Backend redeployed after setting CORS
- [ ] Backend URL accessible (test in browser)
- [ ] No trailing slashes in URLs
- [ ] URLs include `https://` protocol

## Still Not Working?

1. **Check Network Tab**:
   - What URL is actually being called?
   - What's the response status?
   - What's the error message?

2. **Check Console**:
   - Any JavaScript errors?
   - What does `process.env.REACT_APP_API_BASE_URL` show?

3. **Check Render Logs**:
   - Are requests reaching the backend?
   - Any errors in logs?

4. **Test Backend Directly**:
   ```bash
   curl https://your-backend-url.onrender.com/
   ```

Share the error messages from browser console and Network tab for more specific help.

