
# Deployment Guide - React Native App to Netlify

## 🚀 Successfully Deployed React Native App to Web

This document outlines the complete process we followed to deploy our React Native productivity app to Netlify.

## 📋 Prerequisites

- Node.js and npm installed
- Expo CLI (`npm install -g @expo/cli`)
- Netlify CLI (`npm install -g netlify-cli`)
- React Native app built with Expo

## 🛠️ Deployment Process

### Step 1: Configure App for Web Export

Ensure your `app.json` is configured for web export:

```json
{
  "expo": {
    "name": "NaMaane!",
    "platforms": ["ios", "android", "web"],
    "web": {
      "bundler": "metro"
    }
  }
}
```

### Step 2: Export React Native App for Web

```bash
npx expo export --platform web
```

This command:
- Builds the app specifically for web platform
- Creates a `dist` folder with static web assets
- Bundles all JavaScript, CSS, and assets
- Generates optimized production files

**Output:** Creates a `dist` directory with exportable web files.

### Step 3: Initial Netlify Setup

```bash
# Login to Netlify (first time only)
npx netlify login

# Initialize Netlify in your project
npx netlify init
```

During initialization:
- Choose "Create & configure a new site"
- Select your team/account
- Choose a site name (we used `namaane-app`)
- Set build directory to `dist`

### Step 4: Configure Netlify Build Settings

Create `netlify.toml` in project root:

```toml
[build]
  publish = "dist"
  command = "npx expo export --platform web"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This configuration:
- Sets the publish directory to `dist`
- Defines the build command
- Handles client-side routing with redirects

### Step 5: Deploy to Production

```bash
npx netlify deploy --prod --dir=dist
```

This command:
- Runs the build command automatically
- Uploads the `dist` folder to Netlify
- Deploys to production URL

## 📱 Final Deployment

**Live URL:** https://namaane-app.netlify.app

## 🔄 Redeployment Process

For future updates:

```bash
# 1. Export updated app
npx expo export --platform web

# 2. Deploy to production
npx netlify deploy --prod --dir=dist
```

The build command in `netlify.toml` ensures the export happens automatically during deployment.

## ✅ Verification Steps

After deployment:
1. Navigate to the live URL
2. Test all core functionality:
   - Activity tracking
   - Mood tracking
   - Calendar view
   - CSV export (web-specific blob download)
   - Task management and deletion
3. Check browser console for any errors
4. Test on different devices and browsers


