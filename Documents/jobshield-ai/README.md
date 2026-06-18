# JobShield AI

**A Career Opportunity Decision Intelligence System**

JobShield AI helps job seekers make high-stakes career decisions under uncertainty using multi-signal AI reasoning. This is not a scam checker—it's a decision intelligence system for career choices.

## 🎯 What It Does

- **Multi-Signal Analysis**: Analyzes job listings using 16 weighted signals (not keyword filtering)
- **Scam Detection**: Identifies fraud patterns specific to African and global job markets
- **Ghost Job Detection**: Investigates whether companies actually intend to fill posted roles
- **Application ROI**: Calculates the probability of getting a response
- **Compare Opportunities**: Models tradeoffs between two job opportunities
- **Community Intelligence**: Aggregates reports from other job seekers
- **Trust Graph**: Visual reasoning engine showing how signals connect

## 🏗️ Architecture

```
INPUT → SIGNAL EXTRACTION → WEIGHTED SCORING → 
AI REASONING → CONFIDENCE CALCULATION → 
COMPARISON ENGINE → TRUST ASSESSMENT OUTPUT → 
HUMAN REVIEW LAYER
```

**Key Principle**: The AI never outputs absolute verdicts. Every output routes through confidence levels and human verification steps.

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **AI Engine**: Groq API (LLaMA 3.3 70B)
- **Web Search**: Serper.dev API
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend API
- **Hosting**: Vercel

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Groq API key
- Serper.dev API key

### Setup

1. **Clone and Install**
```bash
cd c:/Users/USER/Documents/jobshield-ai
npm install
```

2. **Environment Variables**

Create `.env` file:
```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_SERPER_API_KEY=your_serper_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
```

3. **Database Setup**

Run the SQL schema in your Supabase SQL editor:
```bash
# File: sql/schema.sql
```

This creates:
- `community_reports` - User-submitted company reports
- `analyzed_listings` - All analyzed jobs with scores
- `application_tracker` - Personal application tracking
- `weekly_digest_subscribers` - Email subscriptions

4. **Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:5173`

## 🎨 Design System

### Colors
- Background: `#0A0F1E` (deep navy)
- Surface: `#111827` (dark card)
- Primary: `#3B82F6` (electric blue)
- Success: `#10B981` (green)
- Warning: `#F59E0B` (amber)
- Danger: `#EF4444` (red)

### Typography
- Headings: Inter Bold
- Body: Inter Regular
- Mono (scores): JetBrains Mono

## 📊 Weighted Scoring Engine

Every percentage shown is mathematically derived:

### Scam Score
```javascript
scamScore = (
  emailMismatch * 0.25 +
  paymentLanguage * 0.30 +
  domainAge * 0.20 +
  urgencyPressure * 0.15 +
  identityVague * 0.05 +
  documentRequest * 0.05
) * 100
```

### Ghost Score
```javascript
ghostScore = (
  repostFrequency * 0.25 +
  headcountRatio * 0.25 +
  recentLayoffs * 0.30 +
  fundingMismatch * 0.20
) * 100
```

### ROI Score
```javascript
roiScore = (
  applicantVolume * 0.30 +
  listingAge * 0.25 +
  skillClarity * 0.25 +
  roleCompanyFit * 0.20
) * 100
```

### Confidence Levels
- **HIGH**: 3+ strong signals (>0.6) detected
- **MEDIUM**: 1-2 strong signals detected
- **LOW**: Signals weak or insufficient data

## 🌍 Country-Specific Intelligence

The system injects region-specific scam patterns:

- **Nigeria**: Oil company impersonation, NIN/BVN requests
- **Kenya**: M-Pesa scams, NGO impersonation
- **Ghana**: Mining company fraud, Ghana Card requests
- **South Africa**: Recruiter cloning, WhatsApp redirects
- **Côte d'Ivoire**: French-language NGO scams

## 🚀 Key Features

### 1. Single Job Analyzer (`/analyze`)
- Paste any job listing
- Get Trust Assessment in 60 seconds
- Three parallel AI analyses + web search

### 2. Compare Opportunities (`/compare`)
- Side-by-side analysis of two jobs
- Tradeoff modeling
- Hidden considerations
- Likely outcomes for each choice

### 3. Trust Assessment Screen (`/result/:id`)
Seven mandatory sections:
1. Overall Verdict
2. Three Score Cards (Scam, Ghost, ROI)
3. Verification Matrix
4. Trust Graph (interactive)
5. AI Reasoning Panel
6. Human Review Layer (always shown)
7. Community Intelligence

### 4. Application Tracker (`/tracker`)
- Track all analyzed opportunities
- Update status (Applied, Interviewing, Offer, Ghosted)
- Response rate analytics

### 5. Employer Accountability Dashboard (`/dashboard`)
- Most reported companies
- Community intelligence aggregation
- Filter by country

## 🔒 Behavioral Rules (Never Violated)

1. ✅ AI never outputs "This is a scam" as final verdict
2. ✅ Every percentage is mathematically derived
3. ✅ Human Review Layer appears on EVERY result
4. ✅ Trust Graph nodes are coupled to scores
5. ✅ Confidence level always accompanies scores
6. ✅ Community reports queried BEFORE AI analysis
7. ✅ Compare feature always outputs tradeoffs + outcomes

## 📱 Browser Extension

Located in `/extension` folder:

```javascript
// Detects job listings on:
- LinkedIn Jobs
- Jobberman
- MyJobMag
- Indeed

// Adds JobShield badge next to Apply button
// Click badge → instant Trust Assessment
```

## 📧 Email Forward Analyzer

Forward job emails to `analyze@jobshield.ai` → receive Trust Assessment reply in 60 seconds.

Implementation: Vercel serverless function + Resend webhook

## 🗓️ Weekly Digest

Users subscribe to receive:
- Top 5 most-reported scam companies in their country
- Most common scam patterns detected
- One actionable safety tip

Sent every Sunday 9AM WAT via Vercel cron + Resend

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Manual Build

```bash
npm run build
# Output: dist/
```

## 📁 Project Structure

```
jobshield-ai/
├── src/
│   ├── pages/           # React pages
│   │   ├── Landing.jsx
│   │   ├── Analyze.jsx
│   │   ├── Result.jsx
│   │   ├── Compare.jsx
│   │   ├── Tracker.jsx
│   │   └── Dashboard.jsx
│   ├── components/      # Reusable components
│   │   ├── ScoreCard.jsx
│   │   ├── TrustGraph.jsx
│   │   └── HumanReviewChecklist.jsx
│   ├── services/        # API integrations
│   │   ├── groq.js      # AI prompts + scoring
│   │   ├── serper.js    # Web search
│   │   └── supabase.js  # Database
│   └── utils/           # Helper functions
├── sql/                 # Database schema
├── api/                 # Serverless functions
├── extension/           # Browser extension
└── public/              # Static assets
```

## 🎓 Hackathon Submission

**Challenge**: Life Decision Simulator — Undergraduate Track

**What Makes This Different**:
- Not a scam checker—it's a decision intelligence system
- Weighted scoring (not AI-generated percentages)
- Trust Graph with node-score coupling
- Mandatory Human Review Layer
- Compare feature models tradeoffs and outcomes
- Community intelligence integration

**Tools Used**:
- Groq API (LLaMA 3.3 70B)
- Serper.dev Search API
- Supabase
- Resend API
- React + Vite + TailwindCSS
- Vercel
- IBM watsonx (Bob) for development assistance

## 📄 License

MIT License - Built for the Groq x Lablab.ai Hackathon

## 🤝 Contributing

This is a hackathon project. For production use, additional features needed:
- User authentication
- Rate limiting
- Caching layer
- More comprehensive testing
- Additional country patterns
- Resume analyzer
- Salary intelligence
- Interview analyzer

## 📞 Contact

Built with decision intelligence, not fear.

**Tagline**: "AI advises. You decide. Always verify independently."
