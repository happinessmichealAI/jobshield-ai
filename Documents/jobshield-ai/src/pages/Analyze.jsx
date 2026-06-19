import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeScamSignals, analyzeApplicationROI, analyzeGhostJobSignals, calculateScores, generateVerdict } from '../services/groq';
import ChatInterface from '../components/ChatInterface';
import Navigation from '../components/Navigation';
import { searchCompanyInfo, extractCompanyName, extractJobTitle } from '../services/serper';
import { saveAnalyzedListing, getCommunityReportStats } from '../services/supabase';

function Analyze() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    country: 'Nigeria',
    listingText: '',
    jobUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [error, setError] = useState('');
  const [rateLimitResetTime, setRateLimitResetTime] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const countries = [
    'Nigeria',
    'Kenya',
    'Ghana',
    'South Africa',
    'Côte d\'Ivoire',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.listingText.trim()) {
      setError('Please paste a job listing');
      return;
    }

    setLoading(true);
    setError('');
    setCompletedSteps([]);

    try {
      // Step 1: Checking recruiter identity
      setLoadingStage('Checking recruiter identity...');
      await new Promise(resolve => setTimeout(resolve, 400));
      setCompletedSteps(['recruiter']);
      
      // Clean and preprocess the listing text
      let cleanedText = formData.listingText;
      
      // Remove common webpage elements
      cleanedText = cleanedText
        .replace(/Skip to content/gi, '')
        .replace(/Apply Now/gi, '')
        .replace(/Job Details/gi, '')
        .replace(/First Name \*/gi, '')
        .replace(/Last Name \*/gi, '')
        .replace(/Email \*/gi, '')
        .replace(/Phone \*/gi, '')
        .replace(/Resume\/CV \*/gi, '')
        .replace(/\(File types:.*?\)/gi, '')
        .replace(/Please select/gi, '')
        .replace(/© .*? Inc\./gi, '')
        .replace(/Get in touch/gi, '')
        .replace(/Thank you for your time\./gi, '');
      
      // Limit to reasonable length (first 10000 characters)
      if (cleanedText.length > 10000) {
        cleanedText = cleanedText.substring(0, 10000) + '... [truncated for analysis]';
      }
      
      // Extract company and job title
      const companyName = extractCompanyName(cleanedText);
      const jobTitle = extractJobTitle(cleanedText);

      // Step 2: Cross-referencing domain age
      setLoadingStage('Cross-referencing domain age...');
      await new Promise(resolve => setTimeout(resolve, 400));
      setCompletedSteps(['recruiter', 'domain']);

      // Stage 1: Scam Detection
      setLoadingStage('Scanning for fraud signals...');
      const scamAnalysis = await analyzeScamSignals(cleanedText, formData.country);
      setCompletedSteps(['recruiter', 'domain', 'fraud']);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Scanning community reports
      setLoadingStage('Scanning community reports...');
      const communityStats = await getCommunityReportStats(companyName);
      setCompletedSteps(['recruiter', 'domain', 'fraud', 'community']);

      // Stage 2: Application ROI
      setLoadingStage('Analyzing application value...');
      const roiAnalysis = await analyzeApplicationROI(cleanedText);
      setCompletedSteps(['recruiter', 'domain', 'fraud', 'community', 'roi']);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 3: Web Search + Ghost Job Detection
      setLoadingStage('Investigating company history...');
      const webSearchResults = await searchCompanyInfo(companyName, jobTitle);
      
      setLoadingStage('Calculating risk signals...');
      const ghostAnalysis = await analyzeGhostJobSignals(companyName, jobTitle, webSearchResults.summary);
      setCompletedSteps(['recruiter', 'domain', 'fraud', 'community', 'roi', 'risk']);

      // Calculate scores using weighted engine
      const scores = calculateScores(
        scamAnalysis.signals,
        ghostAnalysis.signals,
        roiAnalysis.signals,
        communityStats
      );

      // Generate verdict
      const verdict = generateVerdict(scores.scamScore, scores.ghostScore, scores.roiScore);

      // Save to database
      const savedListing = await saveAnalyzedListing({
        company_name: companyName,
        job_title: jobTitle,
        job_description: cleanedText,
        scam_score: scores.scamScore,
        ghost_score: scores.ghostScore,
        roi_score: scores.roiScore,
        scam_confidence: scores.scamConfidence,
        ghost_confidence: scores.ghostConfidence,
        roi_confidence: scores.roiConfidence,
        verdict: verdict,
        analysis_data: {
          scamAnalysis,
          roiAnalysis,
          ghostAnalysis,
          webSearchResults,
          communityStats
        },
        country: formData.country
      });

      // Store analysis data for chat
      setAnalysisData({
        company_name: companyName,
        job_title: jobTitle,
        scam_score: scores.scamScore,
        ghost_score: scores.ghostScore,
        roi_score: scores.roiScore,
        country: formData.country,
        listing_text: cleanedText
      });
      
      setAnalysisComplete(true);
      setLoading(false);

      // Automatically navigate to results page
      navigate(`/result/${savedListing.id}`);

    } catch (err) {
      console.error('Analysis error:', err);
      
      // Check if it's a rate limit error
      if (err.message && err.message.startsWith('RATE_LIMIT:')) {
        const resetTime = new Date(err.message.split(':')[1]);
        setRateLimitResetTime(resetTime);
        setError('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        setError(err.message || 'Analysis failed. Please try again.');
      }
      
      setLoading(false);
      setCompletedSteps([]);
    }
  };

  // Countdown timer for rate limit
  useEffect(() => {
    if (!rateLimitResetTime) {
      setCountdown('');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const diff = rateLimitResetTime - now;

      if (diff <= 0) {
        setCountdown('');
        setRateLimitResetTime(null);
        setError('');
        clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitResetTime]);

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Single Job Analyzer
          </h1>
          <p className="text-xl text-text-secondary">
            Paste any job listing. Get a full Trust Assessment in 60 seconds.
          </p>
        </div>

        {/* Analysis Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Country Selector */}
          <div>
            <label htmlFor="country-selector" className="block text-sm font-medium text-text-primary mb-2">
              Country Context
            </label>
            <select
              id="country-selector"
              name="country-selector"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="input-field"
              disabled={loading}
            >
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <p className="text-sm text-text-secondary mt-1">
              Helps detect region-specific scam patterns
            </p>
          </div>

          {/* Job Listing Text */}
          <div>
            <label htmlFor="job-listing" className="block text-sm font-medium text-text-primary mb-2">
              Job Listing <span className="text-danger">*</span>
            </label>
            <textarea
              id="job-listing"
              name="job-listing"
              value={formData.listingText}
              onChange={(e) => setFormData({ ...formData, listingText: e.target.value })}
              placeholder="Paste the full job listing here...

Include:
- Job title and company name
- Job description and requirements
- Application instructions
- Contact information
- Any other details from the posting"
              className="input-field min-h-[300px] font-mono text-sm"
              disabled={loading}
              required
            />
          </div>

          {/* Optional Job URL */}
          <div>
            <label htmlFor="job-url" className="block text-sm font-medium text-text-primary mb-2">
              Job URL (Optional)
            </label>
            <input
              type="url"
              id="job-url"
              name="job-url"
              value={formData.jobUrl}
              onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
              placeholder="https://..."
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-danger/10 border border-danger/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-danger text-sm">{error}</p>
                {countdown && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-danger"></div>
                    <span className="text-danger font-mono font-bold text-lg">{countdown}</span>
                  </div>
                )}
              </div>
              {countdown && (
                <p className="text-danger/70 text-xs mt-2">
                  You can try again in {countdown} minutes. The rate limit will reset automatically.
                </p>
              )}
            </div>
          )}

          {/* Loading State - Sequential Reveal */}
          {loading && (
            <div className="bg-primary/10 border border-primary/50 rounded-lg p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  {completedSteps.includes('recruiter') ? (
                    <span className="text-success text-lg">✓</span>
                  ) : (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  )}
                  <span className={completedSteps.includes('recruiter') ? 'text-text-primary' : 'text-primary font-medium'}>
                    Checking recruiter identity...
                  </span>
                </div>

                {completedSteps.includes('recruiter') && (
                  <div className="flex items-center space-x-3">
                    {completedSteps.includes('domain') ? (
                      <span className="text-success text-lg">✓</span>
                    ) : (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                    <span className={completedSteps.includes('domain') ? 'text-text-primary' : 'text-primary font-medium'}>
                      Cross-referencing domain age...
                    </span>
                  </div>
                )}

                {completedSteps.includes('domain') && (
                  <div className="flex items-center space-x-3">
                    {completedSteps.includes('fraud') ? (
                      <span className="text-success text-lg">✓</span>
                    ) : (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                    <span className={completedSteps.includes('fraud') ? 'text-text-primary' : 'text-primary font-medium'}>
                      Scanning for fraud signals...
                    </span>
                  </div>
                )}

                {completedSteps.includes('fraud') && (
                  <div className="flex items-center space-x-3">
                    {completedSteps.includes('community') ? (
                      <span className="text-success text-lg">✓</span>
                    ) : (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                    <span className={completedSteps.includes('community') ? 'text-text-primary' : 'text-primary font-medium'}>
                      Scanning community reports...
                    </span>
                  </div>
                )}

                {completedSteps.includes('community') && (
                  <div className="flex items-center space-x-3">
                    {completedSteps.includes('roi') ? (
                      <span className="text-success text-lg">✓</span>
                    ) : (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                    <span className={completedSteps.includes('roi') ? 'text-text-primary' : 'text-primary font-medium'}>
                      Analyzing application value...
                    </span>
                  </div>
                )}

                {completedSteps.includes('roi') && (
                  <div className="flex items-center space-x-3">
                    {completedSteps.includes('risk') ? (
                      <span className="text-success text-lg">✓</span>
                    ) : (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                    <span className={completedSteps.includes('risk') ? 'text-text-primary' : 'text-primary font-medium'}>
                      Calculating risk signals...
                    </span>
                  </div>
                )}

                {completedSteps.includes('risk') && (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-primary font-medium">
                      Generating assessment...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze This Opportunity'}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 card bg-surface/50">
          <h3 className="text-lg font-bold text-text-primary mb-3">What happens next?</h3>
          <ul className="space-y-2 text-text-secondary text-sm">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>AI analyzes the listing using 16 weighted signals (not keyword filtering)</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Web search verifies company history, layoffs, and funding</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Community reports are checked for this company</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>You receive a Trust Assessment with scores, confidence levels, and human verification steps</span>
            </li>
          </ul>
        </div>

        {/* Chat Interface - Shows after analysis */}
        {analysisComplete && analysisData && (
          <div id="chat-section" className="mt-8">
            <ChatInterface
              context="analyze"
              listingData={analysisData}
            />
            
            {/* View Full Report Button */}
            <div className="mt-6 text-center">
              <p className="text-text-secondary mb-4">
                Ready to see the complete Trust Assessment?
              </p>
              <button
                onClick={() => navigate(`/result/${analysisData.id}`)}
                className="btn-primary px-8 py-3"
              >
                View Full Trust Assessment Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analyze;

// Made with Bob
