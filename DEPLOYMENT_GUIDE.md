# 🚀 SkillFlux Deployment Guide - Free Hosting

This guide will help you deploy your SkillFlux application for free using modern cloud platforms.

## 📋 Project Overview

- **Frontend**: React app (Create React App)
- **Backend**: Express.js API server
- **Database**: Firebase (Firestore, Storage, Auth)
- **Deployment Options**:
  - **Frontend**: Vercel or Netlify (Recommended: Vercel)
  - **Backend**: Render or Railway (Recommended: Render)

---

## 🔧 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Firebase Project** - Already configured ✅
3. **Node.js** - For local testing (v16+)
4. **Environment Variables** - You'll need to set these up

---

## 📝 Step 1: Prepare Your Code for Deployment

### 1.1 Create API Configuration Utility

Create a file to handle API URLs dynamically:

**File: `client/src/config/api.js`**
```javascript
// API Configuration - automatically uses environment variable or defaults
const getApiUrl = () => {
  // In production, use environment variable
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // In development, use proxy or localhost
  if (process.env.NODE_ENV === 'development') {
    return ''; // Uses proxy from package.json
  }
  // Fallback (will be set by deployment platform)
  return 'https://your-backend-url.onrender.com';
};

export const API_BASE_URL = getApiUrl();

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
```

### 1.2 Update Hardcoded API Calls

Replace all `http://localhost:5000` references in your code:

**Files to update:**
- `client/src/App.js`
- `client/src/pages/Roadmap.js`
- `client/src/pages/OnboardingPage.js` (in App.js)
- `client/src/pages/ResumeAnalysis.js`
- Any other files using the API

**Example replacement:**
```javascript
// OLD:
const res = await fetch(`http://localhost:5000/api/user/${user.uid}/plan`);

// NEW:
import { API_BASE_URL } from '../config/api';
const res = await fetch(`${API_BASE_URL}/api/user/${user.uid}/plan`);
```

---

## 🌐 Step 2: Deploy Backend (Render.com - FREE)

### 2.1 Prepare Backend for Deployment

1. **Update `server/package.json`** - Add start script:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  }
}
```

2. **Create `server/.env.example`** (template):

```env
PORT=5000
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

3. **Update `server/index.js`** to handle Firebase Admin credentials from environment:

```javascript
// Add this after dotenv.config()
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // For production (Render/Railway) - use environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // For local development
  serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  admin.firestore().settings({ ignoreUndefinedProperties: true });
  console.log('Firebase Admin initialized');
}
```

### 2.2 Deploy to Render

1. **Sign up** at [render.com](https://render.com) (free account)

2. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure the service**:
   - **Name**: `skillflux-api` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: Leave empty (or set to `server`)

4. **Set Environment Variables** in Render dashboard:
   ```
   PORT = 5000
   NODE_ENV = production
   FIREBASE_SERVICE_ACCOUNT = <paste entire serviceAccountKey.json content as string>
   ```

   **To get Firebase Service Account JSON**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Copy the entire JSON content
   - Paste it as a single-line string in Render (you may need to escape quotes)

5. **Deploy** - Render will automatically deploy when you push to main branch

6. **Get your backend URL**: `https://your-service-name.onrender.com`

---

## 🎨 Step 3: Deploy Frontend (Vercel - FREE)

### 3.1 Prepare Frontend

1. **Create `.env.production`** in `client/` folder:

```env
REACT_APP_API_BASE_URL=https://your-service-name.onrender.com
```

2. **Update `client/package.json`** (remove proxy for production):

The proxy in package.json only works in development, so it's fine to keep it.

### 3.2 Deploy to Vercel

1. **Sign up** at [vercel.com](https://vercel.com) (free account)

2. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm i -g vercel
   ```

3. **Deploy via Web Interface**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Set Environment Variables** in Vercel:
   ```
   REACT_APP_API_BASE_URL = https://your-service-name.onrender.com
   ```

5. **Deploy** - Vercel will automatically deploy

6. **Get your frontend URL**: `https://your-app.vercel.app`

---

## 🔄 Alternative: Deploy to Netlify (FREE)

If you prefer Netlify:

1. **Sign up** at [netlify.com](https://netlify.com)

2. **Create `client/netlify.toml`**:
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  REACT_APP_API_BASE_URL = "https://your-service-name.onrender.com"
```

3. **Deploy**:
   - Connect GitHub repository
   - Set base directory to `client`
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variable: `REACT_APP_API_BASE_URL`

---

## 🚂 Alternative Backend: Railway (FREE)

Railway offers a free tier with better performance:

1. **Sign up** at [railway.app](https://railway.app)

2. **Create New Project** → Deploy from GitHub

3. **Configure**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Set Environment Variables**:
   - `PORT` = 5000 (auto-set by Railway)
   - `FIREBASE_SERVICE_ACCOUNT` = (paste JSON as string)

5. **Get URL**: Railway provides a URL like `https://your-app.up.railway.app`

---

## ✅ Step 4: Update CORS in Backend

Make sure your backend allows requests from your frontend domain:

**Update `server/index.js`**:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000', // Local development
    'https://your-app.vercel.app', // Vercel
    'https://your-app.netlify.app', // Netlify
    // Add any other domains you use
  ],
  credentials: true
}));
```

Or for development (allow all origins):
```javascript
app.use(cors()); // Allows all origins (OK for free tier)
```

---

## 🔐 Step 5: Firebase Configuration

Your Firebase is already configured, but verify:

1. **Firebase Console** → Authentication → Settings
   - Add authorized domains:
     - `your-app.vercel.app`
     - `your-app.netlify.app`
     - `your-service-name.onrender.com`

2. **Firestore Rules** (if you have security rules):
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

## 📊 Step 6: Test Deployment

1. **Test Backend**:
   ```bash
   curl https://your-service-name.onrender.com/
   # Should return: "Career Development Webapp Backend"
   ```

2. **Test Frontend**:
   - Visit your Vercel/Netlify URL
   - Try logging in
   - Test API calls in browser console

3. **Check Logs**:
   - Render: Dashboard → Your Service → Logs
   - Vercel: Dashboard → Your Project → Deployments → View Function Logs

---

## 🆓 Free Tier Limits

### Render (Backend)
- ✅ **Free tier**: 750 hours/month
- ⚠️ **Spins down** after 15 minutes of inactivity (cold start ~30-60s)
- ✅ **Unlimited** deployments
- 💡 **Tip**: Use Railway for better free tier (no spin-down)

### Vercel (Frontend)
- ✅ **Free tier**: Unlimited
- ✅ **Bandwidth**: 100GB/month
- ✅ **Builds**: 6000 minutes/month
- ✅ **Auto HTTPS & CDN**

### Netlify (Frontend Alternative)
- ✅ **Free tier**: 300 build minutes/month
- ✅ **Bandwidth**: 100GB/month
- ✅ **Auto HTTPS & CDN**

### Railway (Backend Alternative)
- ✅ **Free tier**: $5 credit/month (usually enough for small apps)
- ✅ **No spin-down** (always on)
- ✅ **Better performance**

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- **Solution**: Check logs in Render dashboard
- Verify environment variables are set correctly
- Ensure `npm start` script exists in package.json

**Problem**: Firebase Admin not initializing
- **Solution**: Verify `FIREBASE_SERVICE_ACCOUNT` env var is set correctly
- Ensure JSON is valid and escaped properly

**Problem**: CORS errors
- **Solution**: Update CORS configuration in server/index.js
- Add your frontend domain to allowed origins

### Frontend Issues

**Problem**: API calls failing
- **Solution**: Verify `REACT_APP_API_BASE_URL` is set in Vercel/Netlify
- Check browser console for actual API URL being used
- Verify backend is running and accessible

**Problem**: Build fails
- **Solution**: Check build logs in Vercel/Netlify
- Ensure all dependencies are in package.json
- Check for TypeScript/ESLint errors

---

## 🚀 Quick Deployment Checklist

- [ ] Create API configuration utility (`client/src/config/api.js`)
- [ ] Replace all hardcoded `localhost:5000` with API_BASE_URL
- [ ] Update server to handle Firebase credentials from env vars
- [ ] Deploy backend to Render/Railway
- [ ] Get backend URL and update CORS
- [ ] Set environment variables in Render/Railway
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Set `REACT_APP_API_BASE_URL` in Vercel/Netlify
- [ ] Add authorized domains in Firebase Console
- [ ] Test login and API calls
- [ ] Monitor logs for errors

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Firebase Hosting](https://firebase.google.com/docs/hosting) (alternative frontend hosting)

---

## 💡 Pro Tips

1. **Use Railway for Backend** - Better free tier, no cold starts
2. **Enable Auto-Deploy** - Deploys on every git push to main
3. **Set up Custom Domains** - Both platforms support free custom domains
4. **Monitor Usage** - Keep track of free tier limits
5. **Use Environment Variables** - Never hardcode URLs or secrets
6. **Test Locally First** - Use `.env.local` to test production config

---

## 🎉 You're Done!

Your SkillFlux app should now be live and accessible to users worldwide! 

**Next Steps**:
- Share your deployed URL
- Set up custom domain (optional)
- Monitor performance and errors
- Scale as needed

Good luck with your deployment! 🚀
