import { useState, useEffect } from 'react';
import { analyzeScamSignals, analyzeApplicationROI, analyzeGhostJobSignals, calculateScores, compareOpportunities } from '../services/groq';
import { searchCompanyInfo, extractCompanyName, extractJobTitle } from '../services/serper';
import { getCommunityReportStats } from '../services/supabase';
import ChatInterface from '../components/ChatInterface';
import TypewriterText from '../components/TypewriterText';
import Navigation from '../components/Navigation';

function Compare() {
  const [formData, setFormData] = useState({
    country: 'Nigeria',
    listingA: '',
    listingB: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [rateLimitResetTime, setRateLimitResetTime] = useState(null);
  const [countdown, setCountdown] = useState('');

  const countries = ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Côte d\'Ivoire', 'Other'];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.listingA.trim() || !formData.listingB.trim()) {
      setError('Please paste both job listings');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Analyze listings sequentially to avoid rate limiting
      setLoadingStage('Analyzing Opportunity A...');
      const analysisA = await analyzeListing(formData.listingA, formData.country, 'A');
      
      // Delay between listings
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLoadingStage('Analyzing Opportunity B...');
      const analysisB = await analyzeListing(formData.listingB, formData.country, 'B');

      // Delay before comparison
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get comparison from AI
      setLoadingStage('Comparing opportunities...');
      const comparison = await compareOpportunities(analysisA, analysisB);

      setResults({
        analysisA,
        analysisB,
        comparison
      });

    } catch (err) {
      console.error('Comparison error:', err);
      
      // Check if it's a rate limit error
      if (err.message && err.message.startsWith('RATE_LIMIT:')) {
        const resetTime = new Date(err.message.split(':')[1]);
        setRateLimitResetTime(resetTime);
        setError('Rate limit exceeded. Please wait...');
      } else {
        setError(err.message || 'Comparison failed. Please try again.');
      }
    } finally {
      setLoading(false);
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

  const analyzeListing = async (listingText, country, label) => {
    const companyName = extractCompanyName(listingText);
    const jobTitle = extractJobTitle(listingText);

    // Sequential API calls with delays to avoid rate limiting
    console.log(`Analyzing Opportunity ${label}...`);
    
    const scamAnalysis = await analyzeScamSignals(listingText, country);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const roiAnalysis = await analyzeApplicationROI(listingText);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const webSearchResults = await searchCompanyInfo(companyName, jobTitle);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const ghostAnalysis = await analyzeGhostJobSignals(companyName, jobTitle, webSearchResults.summary);
    const communityStats = await getCommunityReportStats(companyName);
    const scores = calculateScores(scamAnalysis.signals, ghostAnalysis.signals, roiAnalysis.signals, communityStats);

    return {
      companyName,
      jobTitle,
      scores,
      scamAnalysis,
      roiAnalysis,
      ghostAnalysis,
      communityStats
    };
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Compare Two Opportunities
          </h1>
          <p className="text-xl text-text-secondary">
            Model tradeoffs, surface hidden considerations, and understand likely outcomes
          </p>
        </div>

        {!results ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Country Selector */}
            <div className="card">
              <label htmlFor="compare-country-selector" className="block text-sm font-medium text-text-primary mb-2">
                Country Context
              </label>
              <select
                id="compare-country-selector"
                name="compare-country-selector"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="input-field"
                disabled={loading}
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Two Listings Side by Side */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <label htmlFor="opportunity-a" className="text-xl font-bold text-text-primary mb-4 block">
                  Opportunity A
                </label>
                <textarea
                  id="opportunity-a"
                  name="opportunity-a"
                  value={formData.listingA}
                  onChange={(e) => setFormData({ ...formData, listingA: e.target.value })}
                  placeholder="Paste first job listing here..."
                  className="input-field min-h-[400px] font-mono text-sm"
                  disabled={loading}
                  required
                />
              </div>

              <div className="card">
                <label htmlFor="opportunity-b" className="text-xl font-bold text-text-primary mb-4 block">
                  Opportunity B
                </label>
                <textarea
                  id="opportunity-b"
                  name="opportunity-b"
                  value={formData.listingB}
                  onChange={(e) => setFormData({ ...formData, listingB: e.target.value })}
                  placeholder="Paste second job listing here..."
                  className="input-field min-h-[400px] font-mono text-sm"
                  disabled={loading}
                  required
                />
              </div>
            </div>

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

            {loading && (
              <div className="bg-primary/10 border border-primary/50 rounded-lg p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-primary font-medium">{loadingStage}</p>
                <p className="text-text-secondary text-sm mt-2">This may take up to 2 minutes</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50"
            >
              {loading ? 'Comparing...' : 'Compare These Opportunities'}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            {/* AI Recommendation */}
            <div className="card border-2 border-primary">
              <h2 className="text-2xl font-bold text-text-primary mb-4">AI Recommendation</h2>
              <div className="bg-primary/10 rounded-lg p-6 mb-4">
                <p className="text-2xl font-bold text-primary mb-2">
                  {results.comparison.recommendation === 'A' ? 'Opportunity A' :
                   results.comparison.recommendation === 'B' ? 'Opportunity B' :
                   results.comparison.recommendation === 'neither' ? 'Neither Opportunity' :
                   'Both Worth Pursuing'}
                </p>
                <p className="text-text-primary text-lg">{results.comparison.primaryReason}</p>
              </div>
              <p className="text-text-secondary italic text-sm">
                Remember: AI advises. You decide. Review all factors below.
              </p>
            </div>

            {/* Side by Side Scores */}
            <div className="card">
              <h3 className="text-2xl font-bold text-text-primary mb-6">Score Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b-2 border-border">
                    <tr>
                      <th className="py-3 px-4 text-text-primary font-semibold">Metric</th>
                      <th className="py-3 px-4 text-text-primary font-semibold">Opportunity A</th>
                      <th className="py-3 px-4 text-text-primary font-semibold">Opportunity B</th>
                      <th className="py-3 px-4 text-text-primary font-semibold">Advantage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-4 px-4 font-medium text-text-primary">Scam Risk</td>
                      <td className="py-4 px-4">
                        <span className={`text-2xl font-bold ${
                          results.analysisA.scores.scamScore > 70 ? 'text-danger' :
                          results.analysisA.scores.scamScore > 40 ? 'text-warning' : 'text-success'
                        }`}>
                          {results.analysisA.scores.scamScore}%
                        </span>
                        <span className="text-text-secondary text-sm ml-2">
                          ({results.analysisA.scores.scamConfidence})
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-2xl font-bold ${
                          results.analysisB.scores.scamScore > 70 ? 'text-danger' :
                          results.analysisB.scores.scamScore > 40 ? 'text-warning' : 'text-success'
                        }`}>
                          {results.analysisB.scores.scamScore}%
                        </span>
                        <span className="text-text-secondary text-sm ml-2">
                          ({results.analysisB.scores.scamConfidence})
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {results.analysisA.scores.scamScore < results.analysisB.scores.scamScore ? 
                          <span className="text-success font-semibold">A (Lower Risk)</span> :
                          results.analysisA.scores.scamScore > results.analysisB.scores.scamScore ?
                          <span className="text-success font-semibold">B (Lower Risk)</span> :
                          <span className="text-text-secondary">Equal</span>
                        }
                      </td>
                    </tr>

                    <tr className="border-b border-border/50">
                      <td className="py-4 px-4 font-medium text-text-primary">Ghost Job Risk</td>
                      <td className="py-4 px-4">
                        <span className={`text-2xl font-bold ${
                          results.analysisA.scores.ghostScore > 70 ? 'text-danger' :
                          results.analysisA.scores.ghostScore > 40 ? 'text-warning' : 'text-success'
                        }`}>
                          {results.analysisA.scores.ghostScore}%
                        </span>
                        <span className="text-text-secondary text-sm ml-2">
                          ({results.analysisA.scores.ghostConfidence})
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-2xl font-bold ${
                          results.analysisB.scores.ghostScore > 70 ? 'text-danger' :
                          results.analysisB.scores.ghostScore > 40 ? 'text-warning' : 'text-success'
                        }`}>
                          {results.analysisB.scores.ghostScore}%
                        </span>
                        <span className="text-text-secondary text-sm ml-2">
                          ({results.analysisB.scores.ghostConfidence})
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {results.analysisA.scores.ghostScore < results.analysisB.scores.ghostScore ? 
                          <span className="text-success font-semibold">A (Lower Risk)</span> :
                          results.analysisA.scores.ghostScore > results.analysisB.scores.ghostScore ?
                          <span className="text-success font-semibold">B (Lower Risk)</span> :
                          <span className="text-text-secondary">Equal</span>
                        }
                      </td>
                    </tr>

                    <tr className="border-b border-border/50">
                      <td className="py-4 px-4 font-medium text-text-primary">Application ROI</td>
                      <td className="py-4 px-4">
                        <span className={`text-2xl font-bold ${
                          results.analysisA.scores.roiScore > 70 ? 'text-success' :
                          results.analysisA.scores.roiScore > 40 ? 'text-warning' : 'text-danger'
                        }`}>
                          {results.analysisA.scores.roiScore}%
                        </span>
                        <span className="text-text-secondary text-sm ml-2">
                          ({results.analysisA.scores.roiConfidence})
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-2xl font-bold ${
                          results.analysisB.scores.roiScore > 70 ? 'text-success' :
                          results.analysisB.scores.roiScore > 40 ? 'text-warning' : 'text-danger'
                        }`}>
                          {results.analysisB.scores.roiScore}%
                        </span>
                        <span className="text-text-secondary text-sm ml-2">
                          ({results.analysisB.scores.roiConfidence})
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {results.analysisA.scores.roiScore > results.analysisB.scores.roiScore ? 
                          <span className="text-success font-semibold">A (Higher ROI)</span> :
                          results.analysisA.scores.roiScore < results.analysisB.scores.roiScore ?
                          <span className="text-success font-semibold">B (Higher ROI)</span> :
                          <span className="text-text-secondary">Equal</span>
                        }
                      </td>
                    </tr>

                    <tr>
                      <td className="py-4 px-4 font-medium text-text-primary">Community Reports</td>
                      <td className="py-4 px-4">
                        <span className="text-xl font-bold text-text-primary">
                          {results.analysisA.communityStats.total || 0}
                        </span>
                        <span className="text-text-secondary text-sm ml-2">reports</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xl font-bold text-text-primary">
                          {results.analysisB.communityStats.total || 0}
                        </span>
                        <span className="text-text-secondary text-sm ml-2">reports</span>
                      </td>
                      <td className="py-4 px-4">
                        {(results.analysisA.communityStats.total || 0) < (results.analysisB.communityStats.total || 0) ? 
                          <span className="text-success font-semibold">A (Fewer Reports)</span> :
                          (results.analysisA.communityStats.total || 0) > (results.analysisB.communityStats.total || 0) ?
                          <span className="text-success font-semibold">B (Fewer Reports)</span> :
                          <span className="text-text-secondary">Equal</span>
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tradeoffs */}
            <div className="card">
              <h3 className="text-2xl font-bold text-text-primary mb-6">Tradeoff Analysis</h3>
              <div className="space-y-4">
                {(results.comparison.tradeoffs || []).map((tradeoff, idx) => (
                  <div key={idx} className="bg-surface/50 rounded-lg p-4 border-l-4 border-primary">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-text-primary">{tradeoff.factor}</h4>
                      <span className="badge-low">
                        Advantage: {tradeoff.advantageGoes}
                      </span>
                    </div>
                    <p className="text-text-secondary">
                      <TypewriterText text={tradeoff.explanation} speed={25} />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Considerations */}
            <div className="card bg-warning/5 border-warning">
              <h3 className="text-2xl font-bold text-text-primary mb-4">Hidden Considerations</h3>
              <p className="text-text-secondary mb-4">
                Factors you might not have thought about:
              </p>
              <ul className="space-y-3">
                {(results.comparison.hiddenConsiderations || []).map((consideration, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <span className="text-warning text-xl">💡</span>
                    <span className="text-text-primary">
                      <TypewriterText text={consideration} speed={25} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Likely Outcomes */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h4 className="text-lg font-bold text-text-primary mb-3">
                  If you choose Opportunity A:
                </h4>
                <p className="text-text-secondary">
                  <TypewriterText text={results.comparison.likelyOutcomeA} speed={25} />
                </p>
              </div>
              <div className="card">
                <h4 className="text-lg font-bold text-text-primary mb-3">
                  If you choose Opportunity B:
                </h4>
                <p className="text-text-secondary">
                  <TypewriterText text={results.comparison.likelyOutcomeB} speed={25} />
                </p>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="mt-8">
              <ChatInterface
                context="compare"
                listingData={{
                  companyA: results.analysisA.companyName,
                  companyB: results.analysisB.companyName,
                  jobTitleA: results.analysisA.jobTitle,
                  jobTitleB: results.analysisB.jobTitle,
                  scores: {
                    scamScoreA: results.analysisA.scores.scamScore,
                    scamScoreB: results.analysisB.scores.scamScore,
                    ghostScoreA: results.analysisA.scores.ghostScore,
                    ghostScoreB: results.analysisB.scores.ghostScore,
                    roiScoreA: results.analysisA.scores.roiScore,
                    roiScoreB: results.analysisB.scores.roiScore
                  },
                  recommendation: results.comparison.recommendation,
                  country: formData.country
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button 
                onClick={() => setResults(null)}
                className="btn-secondary flex-1"
              >
                Compare Different Opportunities
              </button>
              <a href="/tracker" className="btn-primary flex-1 text-center">
                Track Your Decision
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Compare;

// Made with Bob
