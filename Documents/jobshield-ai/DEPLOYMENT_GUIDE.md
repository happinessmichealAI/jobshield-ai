# JobShield AI - Deployment & Testing Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd c:/Users/USER/Documents/jobshield-ai
npm install
```

### 2. Set Up Environment Variables

Create `.env` file in the root directory:

```env
# Groq API (Required)
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here

# Serper.dev API (Required)
VITE_SERPER_API_KEY=your_serper_api_key_here

# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Resend API (Optional - for email features)
VITE_RESEND_API_KEY=re_your_resend_api_key_here
```

### 3. Set Up Supabase Database

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `sql/schema.sql`
4. Run the SQL script
5. Verify tables were created in Table Editor

### 4. Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:5173`

## 🧪 Testing Checklist

### Core Features to Test

#### ✅ Landing Page (/)
- [ ] Page loads without errors
- [ ] Platform metrics display (may show 0 initially)
- [ ] Navigation links work
- [ ] CTAs navigate to correct pages
- [ ] Mobile responsive

#### ✅ Single Job Analyzer (/analyze)
- [ ] Country selector works
- [ ] Can paste job listing text
- [ ] Submit button triggers analysis
- [ ] Loading states show correctly
- [ ] Three progress indicators animate
- [ ] Navigates to result page after analysis

**Test with this sample job listing:**
```
Software Engineer - Remote
Company: TechCorp Solutions

We are hiring a Software Engineer for immediate start.
Salary: $150,000/year (paid upfront after training)

Requirements:
- Bachelor's degree
- 2+ years experience
- Must pay $500 training fee

Contact: recruiter@techcorp-jobs.com
Apply now! Limited positions available.
```

#### ✅ Trust Assessment Screen (/result/:id)
- [ ] All 7 sections display:
  1. Overall Verdict
  2. Three Score Cards (Scam, Ghost, ROI)
  3. Verification Matrix
  4. Trust Graph (interactive)
  5. AI Reasoning Panel
  6. Human Review Checklist
  7. Community Feedback
- [ ] Scores are numbers (not NaN)
- [ ] Confidence badges show (HIGH/MEDIUM/LOW)
- [ ] Trust Graph nodes are clickable
- [ ] Human Review checklist is interactive
- [ ] Can submit community report
- [ ] "Add to Tracker" button works

#### ✅ Compare Opportunities (/compare)
- [ ] Two text areas for job listings
- [ ] Country selector works
- [ ] Submit triggers parallel analysis
- [ ] Results show side-by-side comparison
- [ ] Tradeoff analysis displays
- [ ] Hidden considerations show
- [ ] Likely outcomes for both options
- [ ] Can reset and compare different jobs

#### ✅ Application Tracker (/tracker)
- [ ] Shows tracked applications
- [ ] Stats display correctly
- [ ] Can filter by status
- [ ] Can update application status
- [ ] "View Analysis" links work
- [ ] Empty state shows when no applications

#### ✅ Employer Dashboard (/dashboard)
- [ ] Table loads (may be empty initially)
- [ ] Country filter works
- [ ] Risk levels display correctly
- [ ] Report counts show
- [ ] Disclaimer is visible

## 🔧 Common Issues & Solutions

### Issue: "Failed to load stats"
**Solution**: Check Supabase connection and ensure `platform_stats` view was created

### Issue: "Analysis failed"
**Solution**: 
1. Verify Groq API key is correct
2. Check API key has credits
3. Ensure Serper.dev API key is valid

### Issue: Scores show as NaN
**Solution**: Check that AI responses are returning valid JSON with signal values between 0-1

### Issue: Trust Graph not displaying
**Solution**: Ensure SVG viewBox is correct and nodes have valid x,y coordinates

### Issue: Community reports not saving
**Solution**: 
1. Check Supabase RLS policies
2. Verify `community_reports` table exists
3. Check browser console for errors

## 📦 Production Build

### Build for Production
```bash
npm run build
```

Output will be in `dist/` folder.

### Test Production Build Locally
```bash
npm run preview
```

## 🌐 Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit - JobShield AI"
git branch -M main
git remote add origin https://github.com/yourusername/jobshield-ai.git
git push -u origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect Vite

3. **Add Environment Variables**
In Vercel project settings → Environment Variables, add:
- `VITE_GROQ_API_KEY`
- `VITE_SERPER_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_RESEND_API_KEY` (optional)

4. **Deploy**
- Click "Deploy"
- Wait for build to complete
- Visit your live URL

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add VITE_GROQ_API_KEY
vercel env add VITE_SERPER_API_KEY
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

## 🔐 Security Checklist

- [ ] All API keys are in `.env` (not committed to git)
- [ ] `.env` is in `.gitignore`
- [ ] Supabase RLS policies are enabled
- [ ] CORS is configured in Supabase
- [ ] Rate limiting considered for production
- [ ] Input validation on all forms

## 📊 Monitoring

### What to Monitor

1. **Groq API Usage**
   - Check daily API calls
   - Monitor token usage
   - Set up billing alerts

2. **Serper.dev Usage**
   - Track search queries
   - Monitor monthly quota

3. **Supabase**
   - Database size
   - Number of rows in tables
   - API requests

4. **Vercel**
   - Build times
   - Function execution time
   - Bandwidth usage

## 🐛 Debugging

### Enable Debug Mode

Add to `.env`:
```env
VITE_DEBUG=true
```

### Check Logs

**Browser Console**:
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

**Vercel Logs**:
- Go to Vercel dashboard
- Click on your project
- View "Functions" tab for serverless function logs

### Common Debug Commands

```bash
# Check if all dependencies installed
npm list

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors (even though we use JS)
npm run build

# Test API connections
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $VITE_GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"test"}]}'
```

## 🎯 Performance Optimization

### For Production

1. **Enable Compression**
   - Vercel does this automatically

2. **Optimize Images**
   - Use WebP format
   - Lazy load images

3. **Code Splitting**
   - Vite handles this automatically
   - Check bundle size: `npm run build`

4. **Caching Strategy**
   - Cache Groq responses for identical listings
   - Cache Serper search results (24 hours)
   - Use Supabase caching for stats

## 📱 Mobile Testing

Test on:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad)
- [ ] Small screens (360px width)

## ✅ Pre-Launch Checklist

- [ ] All environment variables set
- [ ] Database schema deployed
- [ ] Test analysis with real job listing
- [ ] Test comparison feature
- [ ] Verify all navigation links work
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Verify API keys have sufficient credits
- [ ] Set up error monitoring
- [ ] Create backup of database schema
- [ ] Document any custom configurations
- [ ] Test community reporting
- [ ] Verify email notifications (if enabled)

## 🎓 Hackathon Submission

### What to Include

1. **Live Demo URL**: Your Vercel deployment
2. **GitHub Repository**: Public repo with code
3. **Video Demo**: 2-3 minute walkthrough
4. **README.md**: Clear setup instructions
5. **Screenshots**: Key features in action

### Demo Script

1. Show landing page and explain mission
2. Paste a job listing in analyzer
3. Walk through Trust Assessment screen
4. Highlight Trust Graph interaction
5. Show Compare feature with two jobs
6. Demonstrate Application Tracker
7. Show Employer Dashboard
8. Explain Human Review Layer importance

## 🆘 Support

If you encounter issues:

1. Check this guide first
2. Review error messages in browser console
3. Verify all environment variables are set
4. Check API service status pages
5. Review Supabase logs

## 📈 Post-Deployment

### Analytics to Track

- Number of analyses performed
- Most common scam patterns detected
- Countries with most usage
- Response time for analyses
- User retention (returning visitors)

### Future Enhancements

- User authentication
- Saved analyses
- Email notifications
- Mobile app
- API for third-party integrations
- More country-specific patterns
- Machine learning model training on community data

---

**Remember**: This is a decision intelligence system, not a scam checker. The AI advises, users decide.