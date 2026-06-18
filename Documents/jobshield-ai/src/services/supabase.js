import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations

// Community Reports
export const submitCommunityReport = async (reportData) => {
  const { data, error } = await supabase
    .from('community_reports')
    .insert([reportData])
    .select();
  
  if (error) throw error;
  return data;
};

export const getCommunityReports = async (companyName) => {
  const { data, error } = await supabase
    .from('community_reports')
    .select('*')
    .ilike('company_name', `%${companyName}%`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getCommunityReportStats = async (companyName) => {
  const { data, error } = await supabase
    .from('community_reports')
    .select('report_type')
    .ilike('company_name', `%${companyName}%`);
  
  if (error) throw error;
  
  const stats = {
    total: data.length,
    scam: data.filter(r => r.report_type === 'scam').length,
    ghost: data.filter(r => r.report_type === 'ghost').length,
    no_response: data.filter(r => r.report_type === 'no_response').length,
    legitimate: data.filter(r => r.report_type === 'legitimate').length,
  };
  
  return stats;
};

// Analyzed Listings
export const saveAnalyzedListing = async (listingData) => {
  const { data, error } = await supabase
    .from('analyzed_listings')
    .insert([listingData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getAnalyzedListing = async (id) => {
  const { data, error } = await supabase
    .from('analyzed_listings')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const getRecentAnalyses = async (limit = 10) => {
  const { data, error } = await supabase
    .from('analyzed_listings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
};

// Application Tracker
export const saveApplication = async (applicationData) => {
  const { data, error } = await supabase
    .from('application_tracker')
    .insert([applicationData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getUserApplications = async (userSession) => {
  const { data, error } = await supabase
    .from('application_tracker')
    .select(`
      *,
      analyzed_listings (
        company_name,
        job_title,
        scam_score,
        ghost_score,
        roi_score,
        verdict
      )
    `)
    .eq('user_session', userSession)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateApplicationStatus = async (id, status, notes = null) => {
  const updateData = { status };
  if (notes !== null) updateData.notes = notes;
  
  const { data, error } = await supabase
    .from('application_tracker')
    .update(updateData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
};

// Weekly Digest Subscribers
export const subscribeToDigest = async (email, country) => {
  const { data, error } = await supabase
    .from('weekly_digest_subscribers')
    .insert([{ email, country }])
    .select();
  
  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('This email is already subscribed');
    }
    throw error;
  }
  return data[0];
};

export const unsubscribeFromDigest = async (email) => {
  const { data, error } = await supabase
    .from('weekly_digest_subscribers')
    .update({ is_active: false })
    .eq('email', email)
    .select();
  
  if (error) throw error;
  return data[0];
};

// Platform Statistics
export const getPlatformStats = async () => {
  const { data, error } = await supabase
    .from('platform_stats')
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
};

// Top Reported Companies
export const getTopReportedCompanies = async (country = null, limit = 20) => {
  let query = supabase
    .from('top_reported_companies')
    .select('*')
    .order('total_reports', { ascending: false })
    .limit(limit);
  
  if (country && country !== 'Other') {
    query = query.eq('country', country);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

// Get user session ID (create if doesn't exist)
export const getUserSession = () => {
  let sessionId = localStorage.getItem('jobshield_session');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('jobshield_session', sessionId);
  }
  return sessionId;
};

// Made with Bob
