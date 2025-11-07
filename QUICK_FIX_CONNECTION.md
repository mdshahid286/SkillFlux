# ⚡ Quick Fix: Connect Netlify Frontend to Render Backend

## 🔴 Critical Steps (Do These First!)

### 1. Get Your URLs

**Backend URL (Render):**
- Go to Render Dashboard → Your service
- Copy the URL (e.g., `https://skillflux-api.onrender.com`)

**Frontend URL (Netlify):**
- Go to Netlify Dashboard → Your site  
- Copy the URL (e.g., `https://your-app.netlify.app`)

### 2. Set Environment Variable in Netlify ⚠️ CRITICAL

1. **Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add:
   ```
   Key: REACT_APP_API_BASE_URL
   Value: https://your-backend-url.onrender.com
   ```
   ⚠️ **IMPORTANT**: 
   - Use your actual Render backend URL
   - Include `https://`
   - NO trailing slash
   - NO quotes

4. Click **"Save"**

### 3. Redeploy Frontend ⚠️ REQUIRED

**Environment variables ONLY work on NEW builds!**

**Option A: Trigger Deploy in Netlify**
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

**Option B: Push Empty Commit**
```bash
git commit --allow-empty -m "Redeploy with API URL"
git push origin main
```

### 4. Set CORS in Render

1. **Render Dashboard** → Your Backend Service → **Environment** tab
2. Add/Update:
   ```
   Key: FRONTEND_URL
   Value: https://your-app-name.netlify.app
   ```
   ⚠️ **IMPORTANT**: Use your actual Netlify URL

3. Click **"Save Changes"**
4. Render will auto-redeploy

### 5. Test Connection

1. Wait for both deployments to complete
2. Visit your Netlify site
3. Open browser console (F12)
4. Run this test:
   ```javascript
   console.log('API URL:', process.env.REACT_APP_API_BASE_URL);
   fetch(process.env.REACT_APP_API_BASE_URL + '/')
     .then(r => r.text())
     .then(console.log)
     .catch(console.error);
   ```

## 🐛 Debugging

### Check 1: Is Environment Variable Set?

In browser console on your Netlify site:
```javascript
console.log(process.env.REACT_APP_API_BASE_URL);
```

**Expected**: Your Render backend URL  
**If undefined**: Environment variable not set or frontend not redeployed

### Check 2: Is Backend Running?

Visit your Render backend URL directly:
```
https://your-backend-url.onrender.com/
```

**Expected**: `Career Development Webapp Backend`  
**If error**: Backend is not running

### Check 3: Check Network Tab

1. Open browser DevTools → **Network** tab
2. Try using your app
3. Look for API requests
4. Check:
   - What URL is being called?
   - What's the status code?
   - What's the error?

### Check 4: CORS Error?

If you see `Access-Control-Allow-Origin` error:
1. Verify `FRONTEND_URL` in Render matches your Netlify URL exactly
2. Redeploy backend
3. Check Render logs

## ✅ Verification Checklist

- [ ] `REACT_APP_API_BASE_URL` set in Netlify = Render backend URL
- [ ] Frontend redeployed after setting env var
- [ ] `FRONTEND_URL` set in Render = Netlify frontend URL
- [ ] Backend redeployed after setting CORS
- [ ] Backend URL accessible (test in browser)
- [ ] No trailing slashes in URLs
- [ ] URLs include `https://` protocol

## 🚨 Common Mistakes

1. **Forgot to redeploy frontend** - Env vars only apply to new builds
2. **Wrong URL format** - Must include `https://`, no trailing slash
3. **CORS not set** - Backend must allow your frontend domain
4. **Typo in URL** - Double-check both URLs are correct

---

**Still not working?** Share:
1. What `process.env.REACT_APP_API_BASE_URL` shows in console
2. Error message from Network tab
3. Your Render backend URL (to verify it's accessible)

