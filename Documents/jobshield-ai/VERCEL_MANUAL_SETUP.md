# Vercel Manual Configuration Guide

## Why Manual Configuration?

The `vercel.json` configuration file was causing deployment failures because Vercel couldn't locate the `package.json` file. Manual configuration through the dashboard UI is more reliable and takes precedence over file-based configuration.

## Step-by-Step Setup Instructions

### 1. Access Project Settings
1. Go to https://vercel.com/dashboard
2. Click on your **jobshield-ai** project
3. Click **Settings** (top navigation)
4. Navigate to **General** section

### 2. Configure Build & Development Settings

Scroll down to **Build & Development Settings** and configure:

#### Framework Preset
- Select: **Vite**

#### Root Directory
- Leave as: **.** (current directory)
- Do NOT change this - the package.json is in the root

#### Build Command
- Override with: `npm run build`
- This ensures npm runs the build script properly

#### Output Directory
- Set to: `dist`
- This is where Vite outputs the built files

#### Install Command
- Override with: `npm install`
- This installs all dependencies including devDependencies

### 3. Environment Variables (Already Configured ✅)

These are already set up in your project:
- ✅ VITE_GROQ_API_KEY
- ✅ VITE_SERPER_API_KEY
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY
- ✅ VITE_RESEND_API_KEY

### 4. Save and Redeploy

1. Click **Save** at the bottom of the settings page
2. Go back to **Deployments** tab
3. Click the **⋯** (three dots) on the latest failed deployment
4. Select **Redeploy**
5. Confirm the redeployment

### 5. Monitor the Build

Watch the build logs in real-time:
- The build should now find `package.json` correctly
- npm install should complete successfully
- `npm run build` should execute and create the `dist` folder
- Deployment should complete with status: **Ready**

## Expected Build Output

```
✓ Cloning completed
✓ Running "vercel build"
✓ Running "install" command: npm install
✓ Dependencies installed
✓ Running "build" command: npm run build
✓ Build completed
✓ Deployment ready
```

## If Build Still Fails

### Check These Common Issues:

1. **Node Version**
   - Vercel uses Node 18.x by default
   - Your package.json specifies compatible versions

2. **Build Command Syntax**
   - Must be exactly: `npm run build`
   - NOT: `vite build` (this won't work)

3. **Output Directory**
   - Must be exactly: `dist`
   - This matches Vite's default output

4. **Environment Variables**
   - All 5 variables must be present
   - Check they don't have trailing spaces

### Alternative: Redeploy from GitHub

If manual redeploy doesn't work:
1. Make a small change to README.md
2. Commit and push to GitHub
3. Vercel will auto-deploy with new settings

## Success Indicators

When deployment succeeds, you'll see:
- ✅ Green "Ready" status badge
- ✅ Live URL: `jobshield-ai.vercel.app`
- ✅ All pages load correctly
- ✅ API calls work (Groq, Serper, Supabase)

## Post-Deployment Testing

Test these critical features:
1. Landing page loads
2. Analyze page accepts job listings
3. Results page shows all 3 scores
4. Compare page works with 2 listings
5. Trust Graph renders correctly
6. Community reports display

## Troubleshooting

### Build succeeds but site shows errors:
- Check browser console for API key issues
- Verify environment variables are set correctly
- Test API endpoints individually

### Build fails with different error:
- Copy the full error message
- Check if it's a dependency issue
- May need to update package versions

---

**Current Status:** vercel.json and build.sh removed. Ready for manual dashboard configuration.

**Next Step:** Follow the instructions above to configure Vercel through the dashboard UI.