export default function Recruiter() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-2xl font-bold text-primary">JobShield AI</a>
            <div className="flex space-x-6">
              <a href="/analyze" className="text-text-secondary hover:text-text-primary">Analyze</a>
              <a href="/compare" className="text-text-secondary hover:text-text-primary">Compare</a>
              <a href="/tracker" className="text-text-secondary hover:text-text-primary">Tracker</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Recruiter Legitimacy Checker</h1>
        <p className="text-xl text-text-secondary mb-8">Verify recruiter identity before sharing personal information</p>
        
        <div className="card">
          <p className="text-text-secondary mb-4">Coming soon: Verify recruiter LinkedIn profiles, email domains, and company affiliations.</p>
          <a href="/analyze" className="btn-primary inline-block">Use Main Analyzer</a>
        </div>
      </div>
    </div>
  );
}
