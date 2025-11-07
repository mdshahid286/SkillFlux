# 🔗 Connect Deployed Frontend (Netlify) and Backend (Render)

## Step-by-Step Guide

### Step 1: Get Your Backend URL from Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service (e.g., `skillflux-api`)
3. Copy the **Service URL** (looks like: `https://skillflux-api.onrender.com`)

### Step 2: Set Environment Variable in Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **"Add a variable"**
5. Add:
   - **Key**: `REACT_APP_API_BASE_URL`
   - **Value**: `https://your-backend-url.onrender.com` (your actual Render URL)
6. Click **"Save"**

### Step 3: Update CORS in Render

1. Go back to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service
3. Go to **Environment** tab
4. Find or add environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-app-name.netlify.app` (your Netlify URL)
5. Click **"Save Changes"**
6. **Redeploy** the backend (or it will auto-redeploy)

### Step 4: Redeploy Frontend

After setting the environment variable in Netlify:

1. Go to **Deploys** tab in Netlify
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
   OR
3. Push a new commit to trigger auto-deploy:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

### Step 5: Verify Connection

1. Visit your Netlify site: `https://your-app.netlify.app`
2. Open browser console (F12)
3. Try using the app (login, resume analysis, etc.)
4. Check Network tab - API calls should go to your Render backend URL

### Quick Test

Open browser console on your Netlify site and run:
```javascript
fetch('https://your-backend-url.onrender.com/')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
```

Should return: `Career Development Webapp Backend`

## Troubleshooting

### ❌ CORS Errors

**Error**: `Access-Control-Allow-Origin` error in browser console

**Solution**:
1. Verify `FRONTEND_URL` is set correctly in Render
2. Make sure it matches your exact Netlify URL (including `https://`)
3. Redeploy backend after setting the variable

### ❌ API Calls Failing

**Error**: `Failed to fetch` or `Network error`

**Solutions**:
1. **Check environment variable in Netlify**:
   - Go to Site settings → Environment variables
   - Verify `REACT_APP_API_BASE_URL` is set correctly
   - Make sure there are no extra spaces or quotes

2. **Check backend is running**:
   - Visit your Render backend URL directly
   - Should see: `Career Development Webapp Backend`

3. **Check browser console**:
   - Look for the actual API URL being called
   - Should be your Render backend URL

4. **Redeploy frontend**:
   - Environment variables only apply to new builds
   - Trigger a new deployment

### ❌ Backend Not Responding

**Error**: Backend returns 404 or timeout

**Solutions**:
1. **Check Render logs**:
   - Go to Render dashboard → Your service → Logs
   - Look for errors

2. **Verify backend is deployed**:
   - Check Render dashboard for deployment status
   - Should be "Live"

3. **Check backend URL**:
   - Make sure you're using the correct Render URL
   - Should be `https://your-service.onrender.com`

## Environment Variables Summary

### Netlify (Frontend)
```
REACT_APP_API_BASE_URL = https://your-backend-url.onrender.com
```

### Render (Backend)
```
PORT = 5000
NODE_ENV = production
FRONTEND_URL = https://your-app-name.netlify.app
FIREBASE_SERVICE_ACCOUNT = <your-firebase-json>
GEMINI_API_KEY = <your-key>
YOUTUBE_API_KEY = <your-key> (optional)
NEWS_API_KEY = <your-key> (optional)
```

## Important Notes

1. **Environment variables only apply to new builds**:
   - After setting `REACT_APP_API_BASE_URL` in Netlify, you MUST redeploy
   - Old builds won't have the new variable

2. **CORS must match exactly**:
   - `FRONTEND_URL` in Render must match your Netlify URL exactly
   - Include `https://` protocol
   - No trailing slash

3. **Backend cold starts**:
   - Render free tier spins down after 15 min inactivity
   - First request after spin-down may take 30-60 seconds
   - This is normal for free tier

## Quick Checklist

- [ ] Backend deployed on Render (get URL)
- [ ] Frontend deployed on Netlify (get URL)
- [ ] Set `REACT_APP_API_BASE_URL` in Netlify to Render URL
- [ ] Set `FRONTEND_URL` in Render to Netlify URL
- [ ] Redeployed frontend (to apply env var)
- [ ] Redeployed backend (to apply CORS)
- [ ] Tested connection in browser

---

**Need Help?** Check the browser console Network tab to see what URLs are being called and what errors you're getting.

