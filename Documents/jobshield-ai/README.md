# 🛡️ JobShield AI

**A Career Opportunity Decision Intelligence System**

> Every year, millions of job seekers invest their time, money, and personal data into opportunities that were never real. JobShield AI is a career decision intelligence system that helps you understand the full picture before you decide.

[![Built for USAII Global Hackathon](https://img.shields.io/badge/USAII-Global%20Hackathon-blue)](https://usaii.org)
[![Powered by Groq](https://img.shields.io/badge/Powered%20by-Groq-orange)](https://groq.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev)

## 🎯 Problem Statement

Job seekers face three critical risks when applying for opportunities:

1. **Scam Jobs** - Fraudulent listings designed to steal personal information or money
2. **Ghost Jobs** - Real companies posting roles they never intend to fill
3. **Low ROI Applications** - Legitimate jobs with extremely low acceptance rates

Traditional keyword filtering fails because scammers adapt their language. JobShield AI uses multi-signal reasoning to detect patterns that rules-based systems miss.

## ✨ Key Features

### 🔍 Core Analysis Engine

#### **Single Job Analyzer** (`/analyze`)
- Paste any job listing and get a comprehensive Trust Assessment in 60 seconds
- Three parallel AI analyses:
  - **Scam Detection** - Identifies fraud signals using country-specific patterns
  - **Ghost Job Detection** - Web search + AI reasoning to verify company legitimacy
  - **Application ROI** - Calculates your realistic chances of success

#### **Compare Opportunities** (`/compare`)
- Side-by-side analysis of two job listings
- Tradeoff analysis showing which opportunity has advantages in each factor
- Hidden considerations you might not have thought about
- Likely outcomes for each choice
- AI recommendation with reasoning

#### **Trust Assessment Screen** (`/result/:id`)
The centerpiece of the application with 7 mandatory sections:

1. **Overall Verdict** - Clear risk assessment with confidence level
2. **Three Score Cards** - Scam Risk, Ghost Job Risk, Application ROI (each 0-100%)
3. **Verification Matrix** - Table of all detected signals with evidence
4. **Trust Graph** - Visual relationship diagram showing connections between job, recruiter, company, domain
5. **AI Reasoning Panel** - Explains why AI reasoning beats keyword filtering for this specific case
6. **Human Review Layer** - Contextual checklist of steps YOU should verify independently
7. **Community Intelligence** - Reports from other users about this company

### 🤖 AI-Powered Features

#### **Chat Interface**
- Conversational AI assistant available on all analysis pages
- Ask questions about the job listing after analysis
- Context-aware responses referencing specific scores
- Suggested starter questions
- Maintains conversation history

#### **Additional Analyzers**
- **Resume Match Analyzer** - Compare your CV against job requirements
- **Job Offer Red Flag Detector** - Analyze offer letters for predatory clauses
- **Interview Invitation Analyzer** - Verify interview legitimacy
- **Recruiter Legitimacy Checker** - Verify recruiter identity
- **Salary Intelligence** - Compare stated salary against market rates
- **Follow-Up Timeline Predictor** - Know when silence is concerning

### 📊 Tracking & Community

#### **Application Tracker** (`/tracker`)
- Personal dashboard of all analyzed listings
- Status tracking: Analyzing → Applied → Interviewing → Offer/Ghosted/Rejected
- Response rate analytics
- Notes and reminders

#### **Employer Accountability Dashboard** (`/dashboard`)
- Public database of most-reported companies
- Filter by country, report type, date range
- Community-driven transparency

### 🌍 Multi-Country Support

Specialized scam pattern detection for:
- 🇳🇬 **Nigeria** - Oil company impersonation, BVN/NIN requests
- 🇰🇪 **Kenya** - M-Pesa scams, NGO impersonation
- 🇬🇭 **Ghana** - Mining company fraud, Ghana Card requests
- 🇿🇦 **South Africa** - Recruiter cloning, WhatsApp redirects
- 🇨🇮 **Côte d'Ivoire** - French-language NGO scams, "frais de dossier"
- 🌐 **Other** - General international patterns

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18.3 + Vite 5.4
- TailwindCSS for styling
- React Router for navigation

**AI & Search:**
- Groq API (LLaMA 3.3 70B Versatile)
- Serper.dev API for web search

**Database:**
- Supabase (PostgreSQL)
- Tables: `analyzed_listings`, `community_reports`, `application_tracker`, `weekly_digest_subscribers`

**Deployment:**
- Vercel (recommended)
- Environment variables via `.env`

### Weighted Scoring Engine

All percentages are **mathematically derived**, never AI-generated:

```javascript
// Scam Score (0-100%)
scamScore = (
  emailMismatch * 0.25 +
  paymentLanguage * 0.30 +
  domainAge * 0.20 +
  communityReports * 0.25
) * 100

// Ghost Job Score (0-100%)
ghostScore = (
  repostFrequency * 0.25 +
  headcountRatio * 0.25 +
  recentLayoffs * 0.30 +
  fundingMismatch * 0.20
) * 100

// Application ROI Score (0-100%)
roiScore = (
  applicantVolume * 0.30 +
  listingAge * 0.25 +
  skillMatch * 0.25 +
  roleCompanyFit * 0.20
) * 100
```

**Confidence Levels:**
- **HIGH** - 3+ strong signals detected (>0.6 value)
- **MEDIUM** - 1-2 signals detected
- **LOW** - Signals weak or insufficient data

### Analysis Pipeline

```
INPUT → SIGNAL EXTRACTION → WEIGHTED SCORING → 
AI REASONING → CONFIDENCE CALCULATION → 
COMPARISON ENGINE → TRUST ASSESSMENT OUTPUT → 
HUMAN REVIEW LAYER
```

The AI **never outputs absolute verdicts**. Every output routes through confidence levels and human verification steps.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Groq API key ([get one here](https://console.groq.com))
- Serper.dev API key ([get one here](https://serper.dev))
- Supabase project ([create one here](https://supabase.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/happinessmichealAI/jobshield-ai.git
cd jobshield-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_SERPER_API_KEY=your_serper_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase database**

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy the contents of sql/schema.sql and run in Supabase
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Building for Production

```bash
npm run build
npm run preview
```

## 📖 Usage Examples

### Analyzing a Job Listing

1. Navigate to `/analyze`
2. Select your country
3. Paste the full job listing text
4. Click "Analyze This Opportunity"
5. Wait 60 seconds for analysis
6. Review Trust Assessment with all 7 sections
7. Use chat interface to ask follow-up questions

### Comparing Two Opportunities

1. Navigate to `/compare`
2. Paste both job listings side by side
3. Click "Compare These Opportunities"
4. Review side-by-side scores
5. Read tradeoff analysis
6. Consider hidden factors
7. Review likely outcomes for each choice

### Tracking Applications

1. After analyzing a job, click "Add to Application Tracker"
2. Navigate to `/tracker`
3. Update status as you progress
4. Add notes and reminders
5. Monitor response rates

## 🎨 Design System

**Colors:**
- Background: `#0A0F1E` (deep navy)
- Surface: `#111827` (dark card)
- Primary: `#3B82F6` (electric blue)
- Success: `#10B981` (green)
- Warning: `#F59E0B` (amber)
- Danger: `#EF4444` (red)

**Typography:**
- Headings: Inter Bold
- Body: Inter Regular
- Mono (scores): JetBrains Mono

**Mobile-First:**
- Minimum width: 360px
- Responsive navigation with hamburger menu
- Touch-friendly buttons
- Accessible form labels

## 🔒 Privacy & Security

- **No login required** - Session-based tracking using localStorage
- **Environment variables** - API keys never exposed to client
- **Community reports** - Anonymous by default
- **Data retention** - Analysis results stored for transparency counter only
- **.env in .gitignore** - Credentials never committed to repository

## 🧪 Testing

### Rate Limiting

Groq API free tier has strict limits. The application includes:
- Exponential backoff retry logic
- Sequential processing (not parallel)
- 1-2 second delays between API calls
- User-friendly error messages

**Expected analysis time:** 60-120 seconds per job listing

### Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Project Statistics

- **15 Core Features** implemented
- **10 Application Screens** built
- **7 Trust Assessment Sections** (mandatory)
- **6 Countries** supported
- **3 AI Analysis Engines** running in parallel
- **16 Weighted Signals** for scoring
- **1 Chat Interface** for conversational AI

## 🤝 Contributing

This project was built for the USAII Global Hackathon. Contributions are welcome after the hackathon period.

### Development Guidelines

1. Follow the existing code structure
2. Maintain the weighted scoring engine (no hardcoded scores)
3. Always include Human Review Layer in results
4. Test on mobile devices
5. Ensure accessibility compliance

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **Groq** - For providing the LLaMA 3.3 70B API
- **Serper.dev** - For web search capabilities
- **Supabase** - For database infrastructure
- **USAII Global Hackathon** - For the opportunity to build this solution
- **IBM watsonx (Bob)** - For development assistance

## 📧 Contact

**Developer:** Happiness Micheal  
**GitHub:** [@happinessmichealAI](https://github.com/happinessmichealAI)  
**Project:** [JobShield AI](https://github.com/happinessmichealAI/jobshield-ai)

## 🎯 Hackathon Submission

**Event:** USAII Global Hackathon  
**Track:** Life Decision Simulator  
**Challenge:** Compare major life or career paths by modeling tradeoffs, surfacing hidden considerations, and knowing likely outcomes

**How JobShield AI Addresses the Challenge:**
- ✅ Models tradeoffs between job opportunities
- ✅ Surfaces hidden considerations (ghost jobs, scam patterns, ROI factors)
- ✅ Provides likely outcomes based on multi-signal analysis
- ✅ Helps users make high-stakes career decisions under uncertainty

---

**Built with ❤️ for job seekers worldwide**

*"AI advises. You decide. Always verify independently."*
