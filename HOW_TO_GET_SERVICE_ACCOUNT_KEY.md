# 🔑 How to Get Firebase Service Account Key

## What You Have vs What You Need

### ✅ What You Have (Client Config)
The file `client/src/firebase.js` contains your **Firebase Client Config**:
```javascript
{
  apiKey: "AIzaSyCFgGF33CfFeSVFdOVDmorsHhj2Y_Py-1E",
  authDomain: "skillflux-e432d.firebaseapp.com",
  projectId: "skillflux-e432d",
  // ... etc
}
```
**This is for the frontend** - already in your code ✅

### 🔑 What You Need (Service Account Key)
The **Service Account Key** is a different JSON file for the **backend server**.

## Step-by-Step: Get Service Account Key

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **skillflux-e432d**

### Step 2: Navigate to Service Accounts
1. Click the **⚙️ Settings** icon (top left)
2. Select **"Project settings"**
3. Click on the **"Service accounts"** tab

### Step 3: Generate New Private Key
1. You'll see a section titled **"Firebase Admin SDK"**
2. Make sure **"Node.js"** is selected
3. Click the button **"Generate new private key"**
4. A popup will appear - click **"Generate key"**

### Step 4: Download the JSON File
1. A JSON file will automatically download
2. The file will be named something like: `skillflux-e432d-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`
3. **DO NOT commit this file to GitHub** (it's already in .gitignore)

### Step 5: What the File Looks Like
The service account key JSON will look like this:
```json
{
  "type": "service_account",
  "project_id": "skillflux-e432d",
  "private_key_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@skillflux-e432d.iam.gserviceaccount.com",
  "client_id": "xxxxxxxxxxxxxxxxxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Step 6: Use for Deployment
For **Render deployment**, you need to:
1. Open the downloaded JSON file
2. Copy the **entire content**
3. Paste it as the value for `FIREBASE_SERVICE_ACCOUNT` environment variable in Render

**Important Notes:**
- ⚠️ **Never commit this file to GitHub** (it contains sensitive credentials)
- ⚠️ **Keep it secure** - treat it like a password
- ✅ It's already in your `.gitignore` file

## Quick Comparison

| Feature | Client Config (firebase.js) | Service Account Key |
|---------|----------------------------|---------------------|
| **Used by** | Frontend (React app) | Backend (Node.js server) |
| **Location** | `client/src/firebase.js` | Downloaded JSON file |
| **Purpose** | Client-side Firebase operations | Server-side admin operations |
| **Contains** | apiKey, authDomain, etc. | private_key, client_email, etc. |
| **Public?** | Yes (safe to expose) | No (keep secret!) |

## For Local Development

If you have the file locally as `server/serviceAccountKey.json`, you can use it for local development. The server code will automatically use it if `GOOGLE_APPLICATION_CREDENTIALS` is set.

## For Production (Render)

You'll paste the entire JSON content as an environment variable in Render:
```
FIREBASE_SERVICE_ACCOUNT = {"type":"service_account","project_id":"skillflux-e432d",...}
```

---

**Need Help?** If you can't find the Service Accounts tab, make sure you're in the correct Firebase project and have the right permissions.

