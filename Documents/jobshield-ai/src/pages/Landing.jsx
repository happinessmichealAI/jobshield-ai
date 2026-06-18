import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlatformStats } from '../services/supabase';

function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    total_analyzed: 0,
    high_risk_detected: 0,
    community_reports: 0,
    countries_covered: 6
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getPlatformStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary whitespace-nowrap">JobShield AI</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <Link to="/analyze" className="text-text-secondary hover:text-text-primary transition">
                Analyze
              </Link>
              <Link to="/compare" className="text-text-secondary hover:text-text-primary transition">
                Compare
              </Link>
              <Link to="/tracker" className="text-text-secondary hover:text-text-primary transition">
                Tracker
              </Link>
              <Link to="/dashboard" className="text-text-secondary hover:text-text-primary transition">
                Dashboard
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <Link
                to="/analyze"
                className="block px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Analyze
              </Link>
              <Link
                to="/compare"
                className="block px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Compare
              </Link>
              <Link
                to="/tracker"
                className="block px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tracker
              </Link>
              <Link
                to="/dashboard"
                className="block px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
            Every year, millions of job seekers invest their time, money, and personal data into opportunities that were never real.
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-4xl mx-auto">
            JobShield AI is a career decision intelligence system. Paste any job listing. Understand the full picture before you decide.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/analyze" className="btn-primary text-lg px-8 py-4">
              Analyze an Opportunity
            </Link>
            <Link to="/compare" className="btn-secondary text-lg px-8 py-4">
              Compare Two Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-12">
          Platform Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {stats.total_analyzed.toLocaleString()}
            </div>
            <div className="text-text-secondary">Opportunities Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-danger mb-2">
              {stats.high_risk_detected.toLocaleString()}
            </div>
            <div className="text-text-secondary">High Risk Detected</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-warning mb-2">
              {stats.community_reports.toLocaleString()}
            </div>
            <div className="text-text-secondary">Community Reports</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-success mb-2">
              {stats.countries_covered}
            </div>
            <div className="text-text-secondary">Countries Covered</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-text-primary mb-3">Multi-Signal Analysis</h3>
            <p className="text-text-secondary">
              AI analyzes scam patterns, ghost job indicators, and application ROI using weighted scoring—not keyword filtering.
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-text-primary mb-3">Web Intelligence</h3>
            <p className="text-text-secondary">
              Real-time web search verifies company history, layoffs, funding, and job posting patterns.
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-text-primary mb-3">Community Intelligence</h3>
            <p className="text-text-secondary">
              See what other job seekers reported about companies before you apply.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold text-text-primary mb-4">JobShield AI</h4>
              <p className="text-text-secondary text-sm">
                Career opportunity decision intelligence system. AI advises. You decide.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-text-primary mb-4">Tools</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/analyze" className="text-text-secondary hover:text-primary">Single Job Analyzer</Link></li>
                <li><Link to="/compare" className="text-text-secondary hover:text-primary">Compare Opportunities</Link></li>
                <li><Link to="/tracker" className="text-text-secondary hover:text-primary">Application Tracker</Link></li>
                <li><Link to="/recruiter" className="text-text-secondary hover:text-primary">Recruiter Checker</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-text-primary mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/dashboard" className="text-text-secondary hover:text-primary">Accountability Dashboard</Link></li>
                <li><Link to="/email-scan" className="text-text-secondary hover:text-primary">Email Forward Setup</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-text-secondary text-sm">
            <p>Built with Groq AI, Serper.dev, and Supabase. Powered by decision intelligence, not fear.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;

// Made with Bob
