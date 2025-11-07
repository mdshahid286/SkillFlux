# 🚀 SkillFlux Deployment Guide - Step by Step

This guide will walk you through deploying SkillFlux to **Render (Backend)** and **Netlify/Vercel (Frontend)**.

---

## 📋 Prerequisites

1. ✅ **GitHub Account** - Your code should be in a GitHub repository
2. ✅ **Firebase Project** - Already configured
3. ✅ **Node.js** - For local testing (v16+)
4. ✅ **API Keys Ready**:
   - Google Gemini API Key
   - YouTube Data API Key (optional)
   - News API Key (optional)

---

## 🔧 Step 1: Prepare Your Code

### ✅ Already Done:
- ✅ API configuration utility created (`client/src/config/api.js`)
- ✅ Server package.json updated with start script
- ✅ Server Firebase credentials handling updated
- ✅ CORS configuration updated
- ✅ All hardcoded `localhost:5000` references replaced

### 📝 What You Need to Do:

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Get your Firebase Service Account Key**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to **Project Settings** → **Service Accounts**
   - Click **"Generate new private key"**
   - Save the JSON file (you'll need its contents)

---

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up for a free account (use GitHub to sign in)

### 2.2 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository

### 2.3 Configure the Service

Fill in the following settings:

- **Name**: `skillflux-api` (or any name you prefer)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2.4 Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

```
PORT = 5000
NODE_ENV = production
FRONTEND_URL = https://your-app.netlify.app
```

**For Firebase Service Account:**
1. Open the service account JSON file you downloaded
2. Copy the **entire JSON content**
3. In Render, add environment variable:
   ```
   FIREBASE_SERVICE_ACCOUNT = <paste entire JSON as single line>
   ```
   
   **Important**: You may need to escape quotes. Better approach:
   - Copy the JSON
   - Use an online JSON to string converter
   - Or manually escape: replace `"` with `\"`

**For API Keys:**
```
GEMINI_API_KEY = your-gemini-api-key
YOUTUBE_API_KEY = your-youtube-api-key (optional)
NEWS_API_KEY = your-news-api-key (optional)
```

### 2.5 Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (usually 2-5 minutes)
4. **Copy your backend URL**: `https://skillflux-api.onrender.com` (or your service name)

### 2.6 Test Backend

Open your browser and visit:
```
https://your-backend-url.onrender.com/
```

You should see: `Career Development Webapp Backend`

---

## 🎨 Step 3: Deploy Frontend to Netlify

### 3.1 Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up for a free account (use GitHub to sign in)

### 3.2 Create Netlify Configuration

Create a file `client/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "build"
  base = "client"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3.3 Deploy via Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`

### 3.4 Set Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add:
   ```
   REACT_APP_API_BASE_URL = https://your-backend-url.onrender.com
   ```
   (Replace with your actual Render backend URL)

### 3.5 Deploy

1. Click **"Deploy site"**
2. Wait for build to complete (usually 3-5 minutes)
3. **Copy your frontend URL**: `https://random-name-123.netlify.app`

### 3.6 Update Backend CORS

Go back to Render and update the `FRONTEND_URL` environment variable:
```
FRONTEND_URL = https://your-app.netlify.app
```

Then redeploy the backend (or it will auto-redeploy).

---

## 🔄 Alternative: Deploy Frontend to Vercel

### 3.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up for a free account (use GitHub to sign in)

### 3.2 Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)

### 3.3 Set Environment Variables

1. In project settings, go to **Environment Variables**
2. Add:
   ```
   REACT_APP_API_BASE_URL = https://your-backend-url.onrender.com
   ```

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for deployment (usually 2-3 minutes)
3. **Copy your frontend URL**: `https://your-app.vercel.app`

### 3.5 Update Backend CORS

Update `FRONTEND_URL` in Render to your Vercel URL and redeploy.

---

## 🔐 Step 4: Configure Firebase

### 4.1 Add Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"** and add:
   - `your-app.netlify.app` (or your Vercel URL)
   - `your-backend-url.onrender.com`

### 4.2 Verify Firestore Rules

Go to **Firestore Database** → **Rules** and ensure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## ✅ Step 5: Test Your Deployment

### 5.1 Test Frontend

1. Visit your frontend URL
2. Try logging in
3. Test features:
   - Resume Builder
   - Resume Analysis
   - Roadmap generation
   - Aptitude tests

### 5.2 Test Backend

Check backend logs in Render dashboard for any errors.

### 5.3 Common Issues

**CORS Errors:**
- Verify `FRONTEND_URL` is set correctly in Render
- Check that frontend URL matches exactly (including https://)

**API Calls Failing:**
- Verify `REACT_APP_API_BASE_URL` is set in Netlify/Vercel
- Check browser console for actual API URL being used
- Verify backend is running (check Render logs)

**Firebase Errors:**
- Verify `FIREBASE_SERVICE_ACCOUNT` is set correctly in Render
- Check that JSON is properly escaped
- Verify authorized domains in Firebase Console

---

## 📊 Step 6: Monitor & Maintain

### 6.1 Monitor Logs

- **Render**: Dashboard → Your Service → Logs
- **Netlify**: Site → Deploys → Click deployment → View logs
- **Vercel**: Project → Deployments → Click deployment → View logs

### 6.2 Set Up Auto-Deploy

Both platforms auto-deploy on git push to main branch by default.

### 6.3 Free Tier Limits

**Render (Backend):**
- ⚠️ **750 hours/month** (enough for 24/7)
- ⚠️ **Spins down after 15 min inactivity** (cold start ~30-60s)
- ✅ **Unlimited deployments**

**Netlify (Frontend):**
- ✅ **300 build minutes/month**
- ✅ **100GB bandwidth/month**
- ✅ **Auto HTTPS & CDN**

**Vercel (Frontend):**
- ✅ **Unlimited builds**
- ✅ **100GB bandwidth/month**
- ✅ **Auto HTTPS & CDN**

---

## 🎉 You're Done!

Your SkillFlux app is now live! 🚀

**Your URLs:**
- Frontend: `https://your-app.netlify.app` (or Vercel)
- Backend: `https://your-backend-url.onrender.com`

**Next Steps:**
- Share your deployed URL
- Set up custom domain (optional)
- Monitor performance
- Scale as needed

---

## 🆘 Troubleshooting

### Backend Not Starting
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `npm start` script exists in package.json

### Frontend Build Fails
- Check build logs in Netlify/Vercel
- Verify all dependencies are in package.json
- Check for TypeScript/ESLint errors

### API Calls Not Working
- Verify `REACT_APP_API_BASE_URL` is set
- Check browser console for CORS errors
- Verify backend URL is accessible

### Firebase Not Working
- Verify service account JSON is correct
- Check authorized domains in Firebase Console
- Verify Firestore rules allow authenticated users

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Good luck with your deployment! 🎊**

