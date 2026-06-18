import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: 'all',
    reportType: 'all',
    dateRange: '30'
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('community_reports')
        .select('*');

      // Apply filters
      if (filters.country !== 'all') {
        query = query.eq('country', filters.country);
      }
      if (filters.reportType !== 'all') {
        query = query.eq('report_type', filters.reportType);
      }
      if (filters.dateRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(filters.dateRange));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate by company
      const companyStats = {};
      data?.forEach(report => {
        const company = report.company_name;
        if (!companyStats[company]) {
          companyStats[company] = {
            company_name: company,
            scam_reports: 0,
            ghost_reports: 0,
            no_response: 0,
            legitimate: 0,
            total: 0,
            country: report.country
          };
        }
        companyStats[company].total++;
        if (report.report_type === 'scam') companyStats[company].scam_reports++;
        if (report.report_type === 'ghost') companyStats[company].ghost_reports++;
        if (report.report_type === 'no_response') companyStats[company].no_response++;
        if (report.report_type === 'legitimate') companyStats[company].legitimate++;
      });

      // Convert to array and sort by total reports
      const sortedReports = Object.values(companyStats)
        .sort((a, b) => b.total - a.total);

      setReports(sortedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (company) => {
    const scamRatio = company.scam_reports / company.total;
    const ghostRatio = company.ghost_reports / company.total;
    
    if (scamRatio > 0.5 || company.scam_reports >= 5) return 'CRITICAL';
    if (ghostRatio > 0.6 || company.ghost_reports >= 10) return 'HIGH';
    if (company.no_response / company.total > 0.7) return 'MEDIUM';
    return 'LOW';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10';
      case 'LOW': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Employer Accountability Dashboard</h1>
          <p className="text-gray-400">Based on anonymous reports from JobShield users</p>
        </div>

        {/* Filters */}
        <div className="bg-[#111827] rounded-lg p-6 mb-8 border border-[#1F2937]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <select
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="w-full bg-[#0A0F1E] border border-[#1F2937] rounded-lg px-4 py-2 focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="all">All Countries</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Kenya">Kenya</option>
                <option value="Ghana">Ghana</option>
                <option value="South Africa">South Africa</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <select
                value={filters.reportType}
                onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
                className="w-full bg-[#0A0F1E] border border-[#1F2937] rounded-lg px-4 py-2 focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="all">All Types</option>
                <option value="scam">Scam Reports</option>
                <option value="ghost">Ghost Job Reports</option>
                <option value="no_response">No Response</option>
                <option value="legitimate">Legitimate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full bg-[#0A0F1E] border border-[#1F2937] rounded-lg px-4 py-2 focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
            <p className="mt-4 text-gray-400">Loading community reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-[#111827] rounded-lg p-12 text-center border border-[#1F2937]">
            <p className="text-gray-400 text-lg">No reports found for the selected filters.</p>
          </div>
        ) : (
          <div className="bg-[#111827] rounded-lg border border-[#1F2937] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A0F1E]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Country</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Scam Reports</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Ghost Reports</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">No Response</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Total Flags</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]">
                  {reports.map((company, index) => {
                    const riskLevel = getRiskLevel(company);
                    const riskColor = getRiskColor(riskLevel);
                    
                    return (
                      <tr key={index} className="hover:bg-[#0A0F1E] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{company.company_name}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{company.country}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 font-semibold">
                            {company.scam_reports}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 font-semibold">
                            {company.ghost_reports}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-500 font-semibold">
                            {company.no_response}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg">{company.total}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${riskColor}`}>
                            {riskLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-500 mb-1">Important Disclaimer</h3>
              <p className="text-gray-300 text-sm">
                This data reflects community reports only. Companies listed here have not been independently verified as fraudulent. 
                Use this as one signal among many. Always conduct your own verification before making career decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
