import { useState, useEffect } from 'react';
import { getUserApplications, updateApplicationStatus, getUserSession } from '../services/supabase';
import { Link } from 'react-router-dom';

function Tracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const userSession = getUserSession();
      const data = await getUserApplications(userSession);
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      loadApplications();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredApps = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offer: applications.filter(a => a.status === 'offer').length,
    ghosted: applications.filter(a => a.status === 'ghosted').length,
    responseRate: applications.length > 0 
      ? Math.round((applications.filter(a => ['interviewing', 'offer'].includes(a.status)).length / applications.length) * 100)
      : 0
  };

  const statusColors = {
    analyzing: 'bg-gray-600',
    applied: 'bg-primary',
    interviewing: 'bg-warning',
    offer: 'bg-success',
    ghosted: 'bg-danger',
    rejected: 'bg-danger'
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-2xl font-bold text-primary">JobShield AI</a>
            <div className="flex space-x-6">
              <a href="/analyze" className="text-text-secondary hover:text-text-primary">Analyze</a>
              <a href="/compare" className="text-text-secondary hover:text-text-primary">Compare</a>
              <a href="/dashboard" className="text-text-secondary hover:text-text-primary">Dashboard</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-text-primary mb-8">Application Tracker</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <div className="text-text-secondary text-sm">Total Tracked</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary">{stats.applied}</div>
            <div className="text-text-secondary text-sm">Applied</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-warning">{stats.interviewing}</div>
            <div className="text-text-secondary text-sm">Interviewing</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-success">{stats.offer}</div>
            <div className="text-text-secondary text-sm">Offers</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-danger">{stats.ghosted}</div>
            <div className="text-text-secondary text-sm">Ghosted</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-success">{stats.responseRate}%</div>
            <div className="text-text-secondary text-sm">Response Rate</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'analyzing', 'applied', 'interviewing', 'offer', 'ghosted', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status 
                  ? 'bg-primary text-white' 
                  : 'bg-surface text-text-secondary hover:bg-gray-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-text-secondary text-lg mb-4">No applications tracked yet</p>
            <Link to="/analyze" className="btn-primary inline-block">
              Analyze Your First Opportunity
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map(app => (
              <div key={app.id} className="card hover:border-primary transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-primary mb-1">
                      {app.job_title}
                    </h3>
                    <p className="text-text-secondary mb-2">{app.company_name}</p>
                    {app.analyzed_listings && (
                      <div className="flex gap-4 text-sm">
                        <span className="text-danger">Scam: {app.analyzed_listings.scam_score}%</span>
                        <span className="text-warning">Ghost: {app.analyzed_listings.ghost_score}%</span>
                        <span className="text-success">ROI: {app.analyzed_listings.roi_score}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`px-4 py-2 rounded-lg font-medium text-white ${statusColors[app.status]}`}
                    >
                      <option value="analyzing">Analyzing</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offer">Offer</option>
                      <option value="ghosted">Ghosted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    
                    {app.analysis_id && (
                      <Link 
                        to={`/result/${app.analysis_id}`}
                        className="btn-secondary text-sm py-2"
                      >
                        View Analysis
                      </Link>
                    )}
                  </div>
                </div>
                
                {app.applied_date && (
                  <p className="text-text-secondary text-sm mt-3">
                    Applied: {new Date(app.applied_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tracker;

// Made with Bob
