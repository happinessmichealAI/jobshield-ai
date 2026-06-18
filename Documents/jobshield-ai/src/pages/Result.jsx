import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalyzedListing, submitCommunityReport, saveApplication, getUserSession } from '../services/supabase';
import TrustGraph from '../components/TrustGraph';
import ScoreCard from '../components/ScoreCard';
import HumanReviewChecklist from '../components/HumanReviewChecklist';
import ChatInterface from '../components/ChatInterface';

function Result() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

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
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-2xl font-bold text-primary">JobShield AI</a>
            <div className="flex space-x-6">
              <a href="/analyze" className="text-text-secondary hover:text-text-primary">New Analysis</a>
              <a href="/tracker" className="text-text-secondary hover:text-text-primary">Tracker</a>
            </div>
          </div>
        </div>
      </nav>

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
                    <td className="py-3 px-4 text-text-secondary text-sm">{element.evidence}</td>
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
                    <td className="py-3 px-4 text-text-secondary text-sm">{flag.evidence}</td>
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
              <h4 className="text-lg font-semibold text-text-primary mb-2">Why AI and not a keyword filter:</h4>
              <p className="text-text-secondary">{analysisData.scamAnalysis?.whyNotRules || 'Analysis in progress'}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-3">Signal breakdown:</h4>
              <div className="space-y-3">
                <div className="bg-surface rounded p-4">
                  <p className="text-sm font-mono text-text-secondary mb-2">Scam Signals (weighted):</p>
                  {Object.entries(analysisData.scamAnalysis?.signals || {}).map(([key, value = 0]) => (
                    <div key={key} className="flex justify-between items-center mb-1">
                      <span className="text-text-primary text-sm">{key}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-danger" 
                            style={{ width: `${value * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-text-secondary text-sm font-mono w-12">{(value * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
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
