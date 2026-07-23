# Petrus FOH — Firebase Setup Guide

## Overview

The site now uses Firebase Authentication for individual user logins and Firestore for access tracking.

---

## Step 1: Firebase Project

You can reuse your existing "fiorella-petrus-password" project or create a new one.

### Option A: Reuse existing project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Open the "fiorella-petrus-password" project
3. Go to **Project Settings** > **General** > scroll to "Your apps"
4. Copy the `firebaseConfig` values

### Option B: Create new project
1. Go to Firebase Console > **Add Project**
2. Name it `petrus-foh` (or whatever you prefer)
3. Disable Google Analytics (not needed)
4. Once created, click **Web** (</>) to add a web app
5. Name it "Petrus FOH"
6. Copy the config values

---

## Step 2: Update auth.js

Open `auth.js` and replace the placeholder config with your actual values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 3: Enable Authentication

1. In Firebase Console > **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Click Save

---

## Step 4: Create Users

In Firebase Console > **Authentication** > **Users** > **Add user**

For each team member, create an account with:
- **Email**: `firstname.lastname@petrus.local` (e.g., `marco.rossi@petrus.local`)
- **Password**: A personal code they'll use to log in (e.g., `4521`)

After creating the user, click on them and set their **Display Name** to their real name (e.g., "Marco Rossi").

### Example team:
| Name | Email | Code |
|------|-------|------|
| Fiorella | fiorella@petrus.local | (your code) |
| Marco | marco@petrus.local | 3847 |
| Sophie | sophie@petrus.local | 2956 |

**How login works for users:** They type their first name (or first.last) and their personal code. The system converts the name to an email format automatically.

---

## Step 5: Set Up Firestore

1. In Firebase Console > **Firestore Database** > **Create database**
2. Choose **Start in production mode**
3. Select a location close to London (e.g., `europe-west2`)
4. Once created, go to **Rules** tab and set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Access logs: any authenticated user can write
    match /access_logs/{log} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
    }
    
    // Admins collection: only readable by authenticated users
    match /admins/{userId} {
      allow read: if request.auth != null;
      allow write: if false; // Only editable via Console
    }
  }
}
```

5. Click **Publish**

---

## Step 6: Set Yourself as Admin

1. In Firestore Console > **access_logs** will appear after first login
2. Create a new collection called `admins`
3. Add a document with:
   - **Document ID**: your Firebase user UID (find it in Authentication > Users)
   - **Field**: `name` (string) = "Fiorella"
   - **Field**: `role` (string) = "admin"

---

## Step 7: Add Authorized Domain

Since you're hosting on GitHub Pages:
1. Firebase Console > **Authentication** > **Settings** > **Authorized domains**
2. Add: `fatencioj-rgb.github.io`

---

## Step 8: Deploy

Push all files to your GitHub repo. The site is ready.

---

## File Structure

```
petrus-site/
├── index.html          ← Landing page with login modal
├── auth.js             ← Firebase config & auth functions
├── guard.js            ← Protection script for restricted pages
├── winelist.html       ← Public (no auth needed)
├── sommeliers.html     ← Protected
├── menus.html          ← Protected
├── training.html       ← Protected
├── admin.html          ← Admin panel (access logs)
└── SETUP.md            ← This file
```

---

## How It Works

1. **User visits site** → sees navigation buttons
2. **Clicks a protected page** → login modal appears (if not already logged in)
3. **Enters name + personal code** → Firebase authenticates
4. **Access is logged** in Firestore with timestamp, page, and user info
5. **Admin visits /admin.html** → sees full access log with filters

---

## Useful Notes

- Users stay logged in across browser sessions (Firebase persistence)
- The login converts names to email format: "Marco Rossi" → `marco.rossi@petrus.local`
- Wine List remains public (no login required)
- Admin page checks the `admins` collection — only UIDs listed there can view logs
- Access logs track: login, logout, page views, and navigation events
