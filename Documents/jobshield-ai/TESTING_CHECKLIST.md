# JobShield AI - Testing Checklist

## 🚀 Server Started!

The development server should now be running at: **http://localhost:5173**

Open this URL in your browser to start testing.

---

## 📋 Quick Test Sequence

### 1️⃣ Test Landing Page (/)

**What to check:**
- [ ] Page loads without errors
- [ ] "JobShield AI" logo visible
- [ ] Hero text displays correctly
- [ ] Two CTA buttons visible ("Analyze an Opportunity" and "Compare Two Opportunities")
- [ ] Platform Metrics section shows (may show 0 for new database)
- [ ] Features section displays three cards
- [ ] Footer links work
- [ ] Mobile responsive (resize browser)

**Expected Result:** Clean, professional dark navy page with electric blue accents

---

### 2️⃣ Test Single Job Analyzer (/analyze)

**Steps:**
1. Click "Analyze an Opportunity" button from landing page
2. Select a country (e.g., Nigeria)
3. Paste this test job listing:

```
Software Engineer - Remote
Company: TechCorp Solutions Nigeria

We are urgently hiring a Software Engineer for immediate start.
Salary: $150,000/year USD (paid upfront after training)

Requirements:
- Bachelor's degree in Computer Science
- 2+ years experience
- Must pay $500 training fee to secure position
- Send copy of your ID and bank details

Contact: recruiter@techcorp-jobs.com
Apply now! Only 3 positions left. Decision needed within 24 hours.
```

4. Click "Analyze This Opportunity"

**What to check:**
- [ ] Loading state appears with three progress indicators
- [ ] Progress indicators animate
- [ ] Analysis completes (may take 30-60 seconds)
- [ ] Redirects to Result page

**Expected Result:** Should detect HIGH scam risk due to payment request, urgency, and document requests

---

### 3️⃣ Test Trust Assessment Screen (/result/:id)

**What to check:**

✅ **Section 1: Overall Verdict**
- [ ] Large verdict message displays (e.g., "⛔ High Risk — Proceed With Extreme Caution")
- [ ] Disclaimer text: "AI advises. You decide. Always verify independently."

✅ **Section 2: Three Score Cards**
- [ ] Scam Risk card shows percentage (should be high, 70%+)
- [ ] Ghost Job Risk card shows percentage
- [ ] Application ROI card shows percentage
- [ ] Each card shows confidence level (HIGH/MEDIUM/LOW)
- [ ] Progress bars display correctly
- [ ] Top 2 signals listed for each

✅ **Section 3: Verification Matrix**
- [ ] Table displays with flagged signals
- [ ] Evidence column shows specific quotes from listing
- [ ] Status icons visible (⚠️ Confirmed, etc.)

✅ **Section 4: Trust Graph**
- [ ] SVG graph displays with nodes
- [ ] Nodes are colored (red/yellow/green)
- [ ] Can click on nodes
- [ ] Clicking node shows details panel
- [ ] Legend displays at bottom

✅ **Section 5: AI Reasoning Panel**
- [ ] "Why AI and not a keyword filter" explanation shows
- [ ] Signal breakdown displays with progress bars
- [ ] Confidence basis explains signal counts

✅ **Section 6: Human Review Checklist**
- [ ] Title: "Before You Decide"
- [ ] Contextual checklist displays (based on risk level)
- [ ] Checkboxes are interactive
- [ ] Progress bar updates when checking items
- [ ] Footer message: "JobShield AI provides decision support, not decisions"

✅ **Section 7: Community Feedback**
- [ ] "What was your experience" section visible
- [ ] Five buttons for feedback types
- [ ] Can submit a report

**Additional Checks:**
- [ ] "Add to Application Tracker" button works
- [ ] "Analyze Another Listing" link works
- [ ] "Compare with Another" link works

---

### 4️⃣ Test Compare Opportunities (/compare)

**Steps:**
1. Go to /compare or click "Compare Two Opportunities"
2. Select country
3. Paste two different job listings (use the test listing above for A, and a legitimate one for B)

**Legitimate listing for Opportunity B:**
```
Senior Software Engineer
Google Nigeria

We're looking for a Senior Software Engineer to join our Lagos office.

Requirements:
- 5+ years of software development experience
- Strong knowledge of Python, Java, or Go
- Experience with distributed systems

Benefits:
- Competitive salary
- Health insurance
- Professional development budget

Apply through our careers page: careers.google.com
```

4. Click "Compare These Opportunities"

**What to check:**
- [ ] Both listings analyzed in parallel
- [ ] AI Recommendation displays (should recommend B)
- [ ] Score Comparison table shows side-by-side
- [ ] Advantage column indicates which is better
- [ ] Tradeoff Analysis section displays
- [ ] Hidden Considerations section shows
- [ ] Likely Outcomes for both options display
- [ ] "Why AI Beat Rules" explanation shows

**Expected Result:** Should clearly recommend Opportunity B (Google) over A (TechCorp scam)

---

### 5️⃣ Test Application Tracker (/tracker)

**Steps:**
1. After analyzing a job, click "Add to Application Tracker"
2. Navigate to /tracker

**What to check:**
- [ ] Stats display at top (Total Tracked, Applied, etc.)
- [ ] Application card shows with job details
- [ ] Scores display (Scam, Ghost, ROI)
- [ ] Status dropdown works
- [ ] Can change status (Applied, Interviewing, etc.)
- [ ] "View Analysis" link works
- [ ] Filter buttons work

---

### 6️⃣ Test Employer Dashboard (/dashboard)

**Steps:**
1. Navigate to /dashboard
2. Submit a community report from a Result page first (to have data)

**What to check:**
- [ ] Page loads
- [ ] Disclaimer visible
- [ ] Country filter works
- [ ] Table displays (may be empty initially)
- [ ] After submitting reports, companies appear
- [ ] Risk levels display correctly
- [ ] Report counts show

---

## 🐛 Common Issues & Quick Fixes

### Issue: Blank white screen
**Fix:** Check browser console (F12) for errors. Likely missing environment variable.

### Issue: "Failed to load stats"
**Fix:** Verify Supabase connection. Check that views were created in database.

### Issue: Analysis fails with error
**Fix:** 
1. Check Groq API key is valid
2. Check Serper API key is valid
3. Look at browser console for specific error

### Issue: Scores show as NaN
**Fix:** AI response may not be valid JSON. Check browser console for parsing errors.

### Issue: Trust Graph not visible
**Fix:** SVG may not be rendering. Check browser console for errors.

---

## ✅ Success Criteria

Your application is working correctly if:

1. ✅ Landing page loads and looks professional
2. ✅ Can analyze a job listing end-to-end
3. ✅ Result page shows all 7 sections
4. ✅ Scores are numbers (not NaN)
5. ✅ Trust Graph is interactive
6. ✅ Human Review checklist is interactive
7. ✅ Can compare two opportunities
8. ✅ Can track applications
9. ✅ Dashboard displays community data
10. ✅ Mobile responsive (test by resizing browser)

---

## 📸 Screenshot Checklist for Demo

Take screenshots of:
1. Landing page (full view)
2. Analyze page with job listing pasted
3. Result page showing high scam score
4. Trust Graph with node details open
5. Human Review checklist
6. Compare page with two opportunities
7. Comparison results showing tradeoffs
8. Application Tracker with tracked jobs
9. Employer Dashboard with reported companies
10. Mobile view of key pages

---

## 🎥 Video Demo Script (2-3 minutes)

1. **Intro (15 sec)**: "JobShield AI - A career decision intelligence system"
2. **Problem (20 sec)**: Show landing page, explain the problem
3. **Demo Analysis (45 sec)**: 
   - Paste scam job listing
   - Show loading states
   - Walk through Trust Assessment screen
   - Highlight Trust Graph interaction
4. **Compare Feature (30 sec)**:
   - Show two opportunities
   - Highlight tradeoff analysis
   - Show likely outcomes
5. **Human Review (15 sec)**: Emphasize mandatory verification layer
6. **Closing (15 sec)**: "AI advises. You decide."

---

## 🚀 Next Steps After Testing

1. ✅ Test all features
2. 📸 Take screenshots
3. 🎥 Record demo video
4. 📝 Update README with any findings
5. 🌐 Deploy to Vercel
6. 🎓 Submit to hackathon

---

## 💡 Pro Tips

- **Use real job listings** from LinkedIn or Indeed for more realistic testing
- **Test on mobile** - resize browser to 360px width
- **Check all navigation links** - make sure nothing is broken
- **Test error states** - try submitting empty forms
- **Monitor browser console** - watch for any errors or warnings

---

**Remember**: This is a decision intelligence system, not a scam checker. The AI never gives absolute verdicts - it always routes through confidence levels and human verification.

Good luck with testing! 🎉