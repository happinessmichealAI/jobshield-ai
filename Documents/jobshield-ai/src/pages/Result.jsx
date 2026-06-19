import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalyzedListing, submitCommunityReport, saveApplication, getUserSession } from '../services/supabase';
import { analyzeCVMatch, calculateDecisionConfidence, analyzeSalaryIntelligence } from '../services/groq';
import { searchSalaryData } from '../services/serper';
import TrustGraph from '../components/TrustGraph';
import ScoreCard from '../components/ScoreCard';
import HumanReviewChecklist from '../components/HumanReviewChecklist';
import ChatInterface from '../components/ChatInterface';
import TypewriterText from '../components/TypewriterText';
import Navigation from '../components/Navigation';

function Result() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  
  // CV Match Analysis state
  const [showCVUpload, setShowCVUpload] = useState(false);
  const [cvText, setCvText] = useState('');
  const [cvAnalyzing, setCvAnalyzing] = useState(false);
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [cvError, setCvError] = useState('');
  
  // Salary Intelligence state
  const [showSalaryInput, setShowSalaryInput] = useState(false);
  const [statedSalary, setStatedSalary] = useState('');
  const [salaryAnalyzing, setSalaryAnalyzing] = useState(false);
  const [salaryAnalysis, setSalaryAnalysis] = useState(null);
  const [salaryError, setSalaryError] = useState('');

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const data = await getAnalyzedListing(id);
      setListing(data);
    } catch (error) {
      console.error('Failed to load listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommunityReport = async (type) => {
    setReportType(type);
    setShowReportForm(true);
  };

  const submitReport = async () => {
    try {
      await submitCommunityReport({
        company_name: listing.company_name,
        job_title: listing.job_title,
        report_type: reportType,
        details: reportDetails,
        country: listing.country
      });
      setReportSubmitted(true);
      setShowReportForm(false);
      setTimeout(() => setReportSubmitted(false), 3000);
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const handleTrackApplication = async () => {
    try {
      const userSession = getUserSession();
      await saveApplication({
        user_session: userSession,
        company_name: listing.company_name,
        job_title: listing.job_title,
        analysis_id: listing.id,
        status: 'analyzing',
        applied_date: new Date().toISOString().split('T')[0]
      });
      alert('Added to your Application Tracker!');
    } catch (error) {
      console.error('Failed to track application:', error);
    }
  };

  const handleCVAnalysis = async () => {
    if (!cvText.trim()) {
      setCvError('Please paste your CV/resume text');
      return;
    }

    setCvAnalyzing(true);
    setCvError('');
    
    try {
      const listingText = listing.listing_text || `${listing.job_title} at ${listing.company_name}`;
      const analysis = await analyzeCVMatch(cvText, listingText);
      setCvAnalysis(analysis);
    } catch (error) {
      console.error('CV analysis failed:', error);
      setCvError(error.message || 'Failed to analyze CV. Please try again.');
    } finally {
      setCvAnalyzing(false);
    }
  };

  const handleSalaryAnalysis = async () => {
    if (!statedSalary.trim()) {
      setSalaryError('Please enter the stated salary');
      return;
    }

    setSalaryAnalyzing(true);
    setSalaryError('');
    
    try {
      // Search for market data using Serper
      const searchResults = await searchSalaryData(listing.job_title, listing.country);
      
      // Analyze salary against market data using Groq
      const analysis = await analyzeSalaryIntelligence(
        statedSalary,
        listing.job_title,
        listing.country,
        searchResults.summary
      );
      
      // Add raw search results to analysis
      analysis.rawResults = searchResults.results.organic || [];
      
      setSalaryAnalysis(analysis);
    } catch (error) {
      console.error('Salary analysis failed:', error);
      setSalaryError(error.message || 'Failed to analyze salary. Please try again.');
    } finally {
      setSalaryAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary text-xl mb-4">Analysis not found</p>
          <Link to="/analyze" className="btn-primary">Analyze a New Listing</Link>
        </div>
      </div>
    );
  }

  const analysisData = listing.analysis_data || {};
  const communityStats = analysisData.communityStats || { total: 0 };

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Job Info Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">{listing.job_title}</h1>
          <p className="text-xl text-text-secondary">{listing.company_name}</p>
          <p className="text-sm text-text-secondary mt-1">Analyzed on {new Date(listing.created_at).toLocaleDateString()}</p>
        </div>

        {/* SECTION 1: Community Alert (if exists) */}
        {communityStats.total > 0 && (
          <div className="mb-8 bg-warning/10 border-2 border-warning rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">🚨</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-warning mb-2">Community Alert</h3>
                <p className="text-text-primary mb-3">
                  <strong>{communityStats.total}</strong> users reported this company
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-danger font-bold">{communityStats.scam || 0}</span>
                    <span className="text-text-secondary"> scam reports</span>
                  </div>
                  <div>
                    <span className="text-warning font-bold">{communityStats.ghost || 0}</span>
                    <span className="text-text-secondary"> ghost reports</span>
                  </div>
                  <div>
                    <span className="text-text-secondary font-bold">{communityStats.no_response || 0}</span>
                    <span className="text-text-secondary"> never heard back</span>
                  </div>
                  <div>
                    <span className="text-success font-bold">{communityStats.legitimate || 0}</span>
                    <span className="text-text-secondary"> legitimate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Overall Verdict */}
        <div className="mb-8 card border-2 border-primary">
          <div className="text-center py-6">
            <h2 className="text-3xl font-bold text-text-primary mb-4">{listing.verdict}</h2>
            <p className="text-lg text-text-secondary italic">
              AI advises. You decide. Always verify independently.
            </p>
          </div>
        </div>

        {/* SECTION 2.5: Decision Confidence Band */}
        {(() => {
          const decisionConfidence = calculateDecisionConfidence(
            listing.scam_score,
            listing.ghost_score,
            listing.roi_score,
            listing.scam_confidence,
            listing.ghost_confidence,
            listing.roi_confidence,
            communityStats
          );

          const confidenceColors = {
            HIGH: 'border-danger bg-danger/10',
            MEDIUM: 'border-warning bg-warning/10',
            LOW: 'border-border bg-surface'
          };

          const confidenceBadgeColors = {
            HIGH: 'bg-danger text-white',
            MEDIUM: 'bg-warning text-white',
            LOW: 'bg-border text-text-primary'
          };

          return (
            <div className={`mb-8 card border-2 ${confidenceColors[decisionConfidence.confidenceBand]}`}>
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-text-primary">🎯 Decision Confidence</h3>
                <span className={`px-4 py-2 rounded-full font-bold ${confidenceBadgeColors[decisionConfidence.confidenceBand]}`}>
                  {decisionConfidence.confidenceBand}
                </span>
              </div>

              <div className="space-y-6">
                {/* Based on Real Signals */}
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-4">Based on Real Signals:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      {listing.scam_score > 70 ? (
                        <span className="text-danger text-2xl">⚠️</span>
                      ) : (
                        <span className="text-success text-2xl">✓</span>
                      )}
                      <div>
                        <p className="text-text-primary font-medium">
                          Scam Risk: {listing.scam_score}% ({listing.scam_confidence})
                        </p>
                        <p className="text-text-secondary text-sm">
                          {Object.values(analysisData.scamAnalysis?.signals || {}).filter(v => v > 0.6).length} signals detected
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      {listing.ghost_score > 70 ? (
                        <span className="text-warning text-2xl">⚠️</span>
                      ) : (
                        <span className="text-success text-2xl">✓</span>
                      )}
                      <div>
                        <p className="text-text-primary font-medium">
                          Ghost Risk: {listing.ghost_score}% ({listing.ghost_confidence})
                        </p>
                        <p className="text-text-secondary text-sm">
                          {Object.values(analysisData.ghostAnalysis?.signals || {}).filter(v => v > 0.6).length} signals detected
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      {listing.roi_score > 50 ? (
                        <span className="text-success text-2xl">✓</span>
                      ) : (
                        <span className="text-warning text-2xl">⚠️</span>
                      )}
                      <div>
                        <p className="text-text-primary font-medium">
                          Application ROI: {listing.roi_score}% ({listing.roi_confidence})
                        </p>
                        <p className="text-text-secondary text-sm">
                          {Object.values(analysisData.roiAnalysis?.signals || {}).filter(v => v > 0.6).length} strong signals
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      {communityStats.total > 0 ? (
                        <span className="text-primary text-2xl">📊</span>
                      ) : (
                        <span className="text-text-secondary text-2xl">✓</span>
                      )}
                      <div>
                        <p className="text-text-primary font-medium">
                          Community: {decisionConfidence.communitySignal}
                        </p>
                        <p className="text-text-secondary text-sm italic">
                          {decisionConfidence.communityNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overall Assessment */}
                <div className="border-t border-border pt-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-3">Overall Assessment:</h4>
                  <p className="text-text-secondary leading-relaxed">
                    <TypewriterText text={decisionConfidence.assessment} speed={20} />
                  </p>
                </div>

                {/* Recommended Action */}
                <div className="bg-surface rounded-lg p-6 border border-border">
                  <h4 className="text-lg font-semibold text-text-primary mb-3">Recommended Action:</h4>
                  <p className="text-text-secondary leading-relaxed">
                    <TypewriterText text={decisionConfidence.recommendedAction} speed={20} />
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* SECTION 3: Three Score Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ScoreCard
            title="Scam Risk"
            score={listing.scam_score}
            confidence={listing.scam_confidence}
            type="scam"
            signals={analysisData.scamAnalysis?.signals || {}}
          />
          <ScoreCard
            title="Ghost Job Risk"
            score={listing.ghost_score}
            confidence={listing.ghost_confidence}
            type="ghost"
            signals={analysisData.ghostAnalysis?.signals || {}}
          />
          <ScoreCard
            title="Application ROI"
            score={listing.roi_score}
            confidence={listing.roi_confidence}
            type="roi"
            signals={analysisData.roiAnalysis?.signals || {}}
          />
        </div>

        {/* SECTION 4: Trust Graph */}
        <div className="mb-8 card">
          <h3 className="text-2xl font-bold text-text-primary mb-6">Trust Graph</h3>
          <p className="text-text-secondary mb-6">
            Visual relationship diagram showing how different signals connect. Node colors indicate risk level.
          </p>
          <TrustGraph
            companyName={listing.company_name}
            scamScore={listing.scam_score}
            ghostScore={listing.ghost_score}
            roiScore={listing.roi_score}
            analysisData={analysisData}
          />
        </div>

        {/* SECTION 5: Verification Matrix */}
        <div className="mb-8 card">
          <h3 className="text-2xl font-bold text-text-primary mb-6">Verification Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border">
                <tr>
                  <th className="py-3 px-4 text-text-primary font-semibold">Signal</th>
                  <th className="py-3 px-4 text-text-primary font-semibold">Finding</th>
                  <th className="py-3 px-4 text-text-primary font-semibold">Impact</th>
                  <th className="py-3 px-4 text-text-primary font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {(analysisData.scamAnalysis?.flaggedElements || []).map((element, idx) => (
                  <tr key={`scam-${idx}`} className="border-b border-border/50">
                    <td className="py-3 px-4 text-text-primary font-medium">{element.signal}</td>
                    <td className="py-3 px-4 text-text-secondary text-sm">
                      <TypewriterText text={element.explanation || element.evidence} speed={20} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge-high">High Risk</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-danger">⚠️ Confirmed</span>
                    </td>
                  </tr>
                ))}
                {(analysisData.ghostAnalysis?.ghostRedFlags || []).map((flag, idx) => (
                  <tr key={`ghost-${idx}`} className="border-b border-border/50">
                    <td className="py-3 px-4 text-text-primary font-medium">{flag.signal}</td>
                    <td className="py-3 px-4 text-text-secondary text-sm">
                      <TypewriterText text={flag.evidence} speed={20} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge-medium">Medium Risk</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-warning">⚠️ Detected</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 6: AI Reasoning Panel */}
        <div className="mb-8 card bg-surface/50">
          <h3 className="text-2xl font-bold text-text-primary mb-6">AI Reasoning Panel</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-3">Signal breakdown:</h4>
              <div className="space-y-4">
                <div className="bg-surface rounded p-4">
                  <p className="text-sm font-semibold text-text-secondary mb-3">Scam Signals:</p>
                  <div className="space-y-2">
                    {Object.entries(analysisData.scamAnalysis?.signals || {}).map(([key, value = 0]) => {
                      const isDetected = value > 0.3;
                      const signalName = key.replace(/([A-Z])/g, ' $1').trim();
                      return (
                        <div key={key} className="flex items-start space-x-2 text-sm">
                          {isDetected ? (
                            <>
                              <span className="text-warning text-lg leading-none">⚠️</span>
                              <span className="text-text-primary capitalize">{signalName} detected</span>
                            </>
                          ) : (
                            <>
                              <span className="text-success text-lg leading-none">✓</span>
                              <span className="text-text-secondary capitalize">{signalName} clear</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-surface rounded p-4">
                  <p className="text-sm font-semibold text-text-secondary mb-3">Ghost Job Signals:</p>
                  <div className="space-y-2">
                    {Object.entries(analysisData.ghostAnalysis?.signals || {}).map(([key, value = 0]) => {
                      const isDetected = value > 0.3;
                      const signalName = key.replace(/([A-Z])/g, ' $1').trim();
                      return (
                        <div key={key} className="flex items-start space-x-2 text-sm">
                          {isDetected ? (
                            <>
                              <span className="text-warning text-lg leading-none">⚠️</span>
                              <span className="text-text-primary capitalize">{signalName} detected</span>
                            </>
                          ) : (
                            <>
                              <span className="text-success text-lg leading-none">✓</span>
                              <span className="text-text-secondary capitalize">{signalName} clear</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-surface rounded p-4">
                  <p className="text-sm font-semibold text-text-secondary mb-3">ROI Signals:</p>
                  <div className="space-y-2">
                    {Object.entries(analysisData.roiAnalysis?.signals || {}).map(([key, value = 0]) => {
                      const isPositive = value > 0.5;
                      const signalName = key.replace(/([A-Z])/g, ' $1').trim();
                      return (
                        <div key={key} className="flex items-start space-x-2 text-sm">
                          {isPositive ? (
                            <>
                              <span className="text-success text-lg leading-none">✓</span>
                              <span className="text-text-primary capitalize">{signalName} favorable</span>
                            </>
                          ) : (
                            <>
                              <span className="text-warning text-lg leading-none">⚠️</span>
                              <span className="text-text-secondary capitalize">{signalName} concerning</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">Confidence basis:</h4>
              <p className="text-text-secondary">
                Scam: <strong className="text-text-primary">{listing.scam_confidence}</strong> confidence 
                ({Object.values(analysisData.scamAnalysis?.signals || {}).filter(v => v > 0.6).length} strong signals detected)
              </p>
              <p className="text-text-secondary">
                Ghost: <strong className="text-text-primary">{listing.ghost_confidence}</strong> confidence 
                ({Object.values(analysisData.ghostAnalysis?.signals || {}).filter(v => v > 0.6).length} strong signals detected)
              </p>
              <p className="text-text-secondary">
                ROI: <strong className="text-text-primary">{listing.roi_confidence}</strong> confidence 
                ({Object.values(analysisData.roiAnalysis?.signals || {}).filter(v => v > 0.6).length} strong signals detected)
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 7: Human Review Layer (MANDATORY) */}
        <HumanReviewChecklist
          scamScore={listing.scam_score}
          ghostScore={listing.ghost_score}
          roiScore={listing.roi_score}
          companyName={listing.company_name}
        />

        {/* SECTION 8: CV Match Analysis */}
        <div className="mt-8 card">
          <h3 className="text-2xl font-bold text-text-primary mb-4">📄 CV Match Analysis</h3>
          <p className="text-text-secondary mb-6">
            Upload your CV to see how it matches this specific job listing. We'll show you what skills are present,
            what's missing, and provide actionable improvement suggestions.
          </p>

          {!showCVUpload && !cvAnalysis && (
            <button
              onClick={() => setShowCVUpload(true)}
              className="btn-primary"
            >
              Analyze My CV for This Job
            </button>
          )}

          {showCVUpload && !cvAnalysis && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Paste your CV/Resume text below:
                </label>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste your full CV or resume text here..."
                  className="input-field min-h-[200px] font-mono text-sm"
                  disabled={cvAnalyzing}
                />
              </div>

              {cvError && (
                <div className="bg-danger/10 border border-danger rounded-lg p-4 text-danger">
                  {cvError}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleCVAnalysis}
                  className="btn-primary"
                  disabled={cvAnalyzing}
                >
                  {cvAnalyzing ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⏳</span>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze CV Match'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCVUpload(false);
                    setCvText('');
                    setCvError('');
                  }}
                  className="btn-secondary"
                  disabled={cvAnalyzing}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {cvAnalysis && (
            <div className="space-y-6">
              {/* Skills Present */}
              <div className="bg-success/10 border border-success rounded-lg p-6">
                <h4 className="text-lg font-semibold text-success mb-4">✓ Skills Present in Your CV</h4>
                {cvAnalysis.skillsPresent && cvAnalysis.skillsPresent.length > 0 ? (
                  <div className="space-y-3">
                    {cvAnalysis.skillsPresent.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <span className="text-success text-xl">✓</span>
                        <div className="flex-1">
                          <p className="text-text-primary font-medium">{item.skill}</p>
                          <p className="text-text-secondary text-sm mt-1">
                            <TypewriterText text={item.evidence} speed={15} />
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary">No matching skills detected</p>
                )}
              </div>

              {/* Skills Missing */}
              <div className="bg-warning/10 border border-warning rounded-lg p-6">
                <h4 className="text-lg font-semibold text-warning mb-4">✗ Skills Missing from Your CV</h4>
                {cvAnalysis.skillsMissing && cvAnalysis.skillsMissing.length > 0 ? (
                  <div className="space-y-3">
                    {cvAnalysis.skillsMissing.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <span className="text-warning text-xl">✗</span>
                        <div className="flex-1">
                          <p className="text-text-primary font-medium">
                            {item.skill}
                            {item.required && <span className="ml-2 text-xs bg-danger text-white px-2 py-1 rounded">REQUIRED</span>}
                          </p>
                          <p className="text-text-secondary text-sm mt-1">{item.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary">All required skills are present</p>
                )}
              </div>

              {/* Experience Analysis */}
              {cvAnalysis.experienceAnalysis && (
                <div className="bg-surface rounded-lg p-6 border border-border">
                  <h4 className="text-lg font-semibold text-text-primary mb-4">Experience Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-text-secondary">
                      <strong className="text-text-primary">Listing requires:</strong> {cvAnalysis.experienceAnalysis.listingRequires}
                    </p>
                    <p className="text-text-secondary">
                      <strong className="text-text-primary">Your CV shows:</strong> {cvAnalysis.experienceAnalysis.cvShows}
                    </p>
                    <p className="text-text-secondary">
                      <strong className="text-text-primary">Gap:</strong> {cvAnalysis.experienceAnalysis.gap}
                    </p>
                  </div>
                </div>
              )}

              {/* Keyword Match */}
              {cvAnalysis.keywordMatch && (
                <div className="bg-surface rounded-lg p-6 border border-border">
                  <h4 className="text-lg font-semibold text-text-primary mb-4">Keyword Match</h4>
                  <p className="text-text-primary text-2xl font-bold mb-4">{cvAnalysis.keywordMatch.total}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-success mb-2">Present:</p>
                      <div className="flex flex-wrap gap-2">
                        {cvAnalysis.keywordMatch.present.map((keyword, idx) => (
                          <span key={idx} className="bg-success/20 text-success px-3 py-1 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-warning mb-2">Missing:</p>
                      <div className="flex flex-wrap gap-2">
                        {cvAnalysis.keywordMatch.missing.map((keyword, idx) => (
                          <span key={idx} className="bg-warning/20 text-warning px-3 py-1 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Red Flags */}
              {cvAnalysis.redFlags && cvAnalysis.redFlags.length > 0 && (
                <div className="bg-danger/10 border border-danger rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-danger mb-4">⚠️ Red Flags Detected</h4>
                  <div className="space-y-3">
                    {cvAnalysis.redFlags.map((flag, idx) => (
                      <div key={idx} className="border-l-4 border-danger pl-4">
                        <p className="text-text-primary font-medium">{flag.flag}</p>
                        <p className="text-text-secondary text-sm mt-1">
                          <TypewriterText text={flag.detail} speed={15} />
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvement Suggestions */}
              {cvAnalysis.improvementSuggestions && cvAnalysis.improvementSuggestions.length > 0 && (
                <div className="bg-primary/10 border border-primary rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-primary mb-4">💡 Improvement Suggestions</h4>
                  <ol className="space-y-3 list-decimal list-inside">
                    {cvAnalysis.improvementSuggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-text-secondary">
                        <TypewriterText text={suggestion} speed={15} />
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setCvAnalysis(null);
                    setShowCVUpload(true);
                  }}
                  className="btn-secondary"
                >
                  Analyze Different CV
                </button>
                <button
                  onClick={() => {
                    setCvAnalysis(null);
                    setShowCVUpload(false);
                    setCvText('');
                  }}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 9: Salary Intelligence */}
        <div className="mt-8 card">
          <h3 className="text-2xl font-bold text-text-primary mb-4">💰 Salary Intelligence</h3>
          <p className="text-text-secondary mb-6">
            Enter the stated salary from the job listing to see how it compares to market data.
            We'll search real salary information from Glassdoor, LinkedIn, and other sources.
          </p>

          {!showSalaryInput && !salaryAnalysis && (
            <button
              onClick={() => setShowSalaryInput(true)}
              className="btn-primary"
            >
              Check Salary Market Rate
            </button>
          )}

          {showSalaryInput && !salaryAnalysis && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Stated Salary (e.g., "₦500,000/month" or "$60,000/year"):
                </label>
                <input
                  type="text"
                  value={statedSalary}
                  onChange={(e) => setStatedSalary(e.target.value)}
                  placeholder="Enter the salary from the job listing..."
                  className="input-field"
                  disabled={salaryAnalyzing}
                />
              </div>

              {salaryError && (
                <div className="bg-danger/10 border border-danger rounded-lg p-4 text-danger">
                  {salaryError}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleSalaryAnalysis}
                  className="btn-primary"
                  disabled={salaryAnalyzing}
                >
                  {salaryAnalyzing ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⏳</span>
                      Searching Market Data...
                    </>
                  ) : (
                    'Analyze Salary'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowSalaryInput(false);
                    setStatedSalary('');
                    setSalaryError('');
                  }}
                  className="btn-secondary"
                  disabled={salaryAnalyzing}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {salaryAnalysis && (
            <div className="space-y-6">
              {/* Stated Salary */}
              <div className="bg-surface rounded-lg p-6 border border-border">
                <h4 className="text-lg font-semibold text-text-primary mb-2">Stated in Listing:</h4>
                <p className="text-3xl font-bold text-primary">{statedSalary}</p>
              </div>

              {/* Market Research */}
              <div className="bg-surface rounded-lg p-6 border border-border">
                <h4 className="text-lg font-semibold text-text-primary mb-4">Market Research (Web Search Results):</h4>
                {salaryAnalysis.marketData && salaryAnalysis.marketData.length > 0 ? (
                  <div className="space-y-4">
                    {salaryAnalysis.marketData.map((data, idx) => (
                      <div key={idx} className="border-l-4 border-primary pl-4">
                        <p className="text-text-primary font-semibold">{data.source}</p>
                        <p className="text-text-secondary text-lg mt-1">{data.range}</p>
                        {data.link && (
                          <a
                            href={data.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-sm hover:underline mt-1 inline-block"
                          >
                            View Source →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary">No specific market data found in search results.</p>
                )}
              </div>

              {/* Assessment */}
              <div className={`rounded-lg p-6 border-2 ${
                salaryAnalysis.assessment === 'within range' ? 'bg-success/10 border-success' :
                salaryAnalysis.assessment === 'above market' ? 'bg-primary/10 border-primary' :
                salaryAnalysis.assessment === 'below market' ? 'bg-warning/10 border-warning' :
                'bg-surface border-border'
              }`}>
                <h4 className="text-lg font-semibold text-text-primary mb-3">Assessment:</h4>
                <p className="text-xl font-bold text-text-primary mb-2 capitalize">{salaryAnalysis.assessment}</p>
                <p className="text-text-secondary leading-relaxed">
                  <TypewriterText text={salaryAnalysis.explanation} speed={20} />
                </p>
              </div>

              {/* Red Flags */}
              {salaryAnalysis.redFlags && salaryAnalysis.redFlags.length > 0 && (
                <div className="bg-danger/10 border border-danger rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-danger mb-4">⚠️ Red Flags:</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    {salaryAnalysis.redFlags.map((flag, idx) => (
                      <li key={idx} className="text-text-secondary">
                        <TypewriterText text={flag} speed={15} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Note */}
              <div className="bg-surface/50 rounded-lg p-4 border border-border">
                <p className="text-text-secondary text-sm italic">
                  {salaryAnalysis.note}
                </p>
              </div>

              {/* Raw Search Results (Optional - for transparency) */}
              {salaryAnalysis.rawResults && salaryAnalysis.rawResults.length > 0 && (
                <details className="bg-surface rounded-lg p-6 border border-border">
                  <summary className="text-text-primary font-semibold cursor-pointer hover:text-primary">
                    View All Search Results ({salaryAnalysis.rawResults.length} sources)
                  </summary>
                  <div className="mt-4 space-y-3">
                    {salaryAnalysis.rawResults.slice(0, 5).map((result, idx) => (
                      <div key={idx} className="border-l-2 border-border pl-4">
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          {result.title}
                        </a>
                        <p className="text-text-secondary text-sm mt-1">{result.snippet}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSalaryAnalysis(null);
                    setShowSalaryInput(true);
                  }}
                  className="btn-secondary"
                >
                  Check Different Salary
                </button>
                <button
                  onClick={() => {
                    setSalaryAnalysis(null);
                    setShowSalaryInput(false);
                    setStatedSalary('');
                  }}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Community Feedback Section */}
        <div className="mt-8 card">
          <h3 className="text-xl font-bold text-text-primary mb-4">What was your experience with this listing?</h3>
          
          {reportSubmitted ? (
            <div className="bg-success/10 border border-success rounded-lg p-4 text-center">
              <p className="text-success font-semibold">Thank you for your report! It helps the community.</p>
            </div>
          ) : showReportForm ? (
            <div className="space-y-4">
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Share details about your experience (optional)..."
                className="input-field min-h-[100px]"
              />
              <div className="flex space-x-3">
                <button onClick={submitReport} className="btn-primary">Submit Report</button>
                <button onClick={() => setShowReportForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button onClick={() => handleCommunityReport('analyzing')} className="btn-secondary text-sm py-3">
                Still waiting
              </button>
              <button onClick={() => handleCommunityReport('legitimate')} className="btn-secondary text-sm py-3">
                Got interview
              </button>
              <button onClick={() => handleCommunityReport('no_response')} className="btn-secondary text-sm py-3">
                Never heard back
              </button>
              <button onClick={() => handleCommunityReport('scam')} className="btn-secondary text-sm py-3">
                It was a scam
              </button>
              <button onClick={() => handleCommunityReport('legitimate')} className="btn-secondary text-sm py-3">
                It was legitimate
              </button>
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="mt-8">
          <ChatInterface
            context="result"
            listingData={{
              company_name: listing.company_name,
              job_title: listing.job_title,
              scam_score: listing.scam_score,
              ghost_score: listing.ghost_score,
              roi_score: listing.roi_score,
              scam_confidence: listing.scam_confidence,
              ghost_confidence: listing.ghost_confidence,
              roi_confidence: listing.roi_confidence,
              verdict: listing.verdict,
              country: listing.country
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button onClick={handleTrackApplication} className="btn-primary flex-1">
            Add to Application Tracker
          </button>
          <Link to="/analyze" className="btn-secondary flex-1 text-center">
            Analyze Another Listing
          </Link>
          <Link to="/compare" className="btn-secondary flex-1 text-center">
            Compare with Another
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Result;

// Made with Bob
