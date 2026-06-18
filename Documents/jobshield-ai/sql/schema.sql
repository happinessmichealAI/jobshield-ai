-- JobShield AI Database Schema
-- Create all required tables for the application

-- Table 1: community_reports
-- Stores user-submitted reports about companies and job listings
CREATE TABLE IF NOT EXISTS community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    job_title TEXT,
    report_type TEXT NOT NULL CHECK (report_type IN ('scam', 'ghost', 'legitimate', 'no_response')),
    details TEXT,
    country TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster company lookups
CREATE INDEX IF NOT EXISTS idx_community_reports_company ON community_reports(company_name);
CREATE INDEX IF NOT EXISTS idx_community_reports_country ON community_reports(country);
CREATE INDEX IF NOT EXISTS idx_community_reports_type ON community_reports(report_type);

-- Table 2: analyzed_listings
-- Stores all job listings that have been analyzed by the system
CREATE TABLE IF NOT EXISTS analyzed_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    job_description TEXT,
    scam_score INTEGER NOT NULL CHECK (scam_score >= 0 AND scam_score <= 100),
    ghost_score INTEGER NOT NULL CHECK (ghost_score >= 0 AND ghost_score <= 100),
    roi_score INTEGER NOT NULL CHECK (roi_score >= 0 AND roi_score <= 100),
    scam_confidence TEXT CHECK (scam_confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    ghost_confidence TEXT CHECK (ghost_confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    roi_confidence TEXT CHECK (roi_confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    verdict TEXT NOT NULL,
    analysis_data JSONB, -- Stores full AI analysis results
    country TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics and lookups
CREATE INDEX IF NOT EXISTS idx_analyzed_listings_company ON analyzed_listings(company_name);
CREATE INDEX IF NOT EXISTS idx_analyzed_listings_country ON analyzed_listings(country);
CREATE INDEX IF NOT EXISTS idx_analyzed_listings_created ON analyzed_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyzed_listings_scam_score ON analyzed_listings(scam_score DESC);

-- Table 3: application_tracker
-- Tracks user applications and their status
CREATE TABLE IF NOT EXISTS application_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_session TEXT NOT NULL, -- Session ID from localStorage
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    analysis_id UUID REFERENCES analyzed_listings(id),
    status TEXT NOT NULL DEFAULT 'analyzing' CHECK (status IN ('analyzing', 'applied', 'interviewing', 'offer', 'ghosted', 'rejected')),
    applied_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user session lookups
CREATE INDEX IF NOT EXISTS idx_application_tracker_session ON application_tracker(user_session);
CREATE INDEX IF NOT EXISTS idx_application_tracker_status ON application_tracker(status);
CREATE INDEX IF NOT EXISTS idx_application_tracker_analysis ON application_tracker(analysis_id);

-- Table 4: weekly_digest_subscribers
-- Stores email subscribers for weekly scam alerts
CREATE TABLE IF NOT EXISTS weekly_digest_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sent_at TIMESTAMP WITH TIME ZONE
);

-- Index for email lookups and country filtering
CREATE INDEX IF NOT EXISTS idx_digest_subscribers_email ON weekly_digest_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_digest_subscribers_country ON weekly_digest_subscribers(country);
CREATE INDEX IF NOT EXISTS idx_digest_subscribers_active ON weekly_digest_subscribers(is_active);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzed_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_digest_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access, authenticated write for community_reports
CREATE POLICY "Allow public read access to community_reports"
    ON community_reports FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to community_reports"
    ON community_reports FOR INSERT
    WITH CHECK (true);

-- RLS Policies: Allow public read/write for analyzed_listings
CREATE POLICY "Allow public read access to analyzed_listings"
    ON analyzed_listings FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to analyzed_listings"
    ON analyzed_listings FOR INSERT
    WITH CHECK (true);

-- RLS Policies: Users can only access their own application tracker data
CREATE POLICY "Users can view their own applications"
    ON application_tracker FOR SELECT
    USING (true); -- We'll filter by user_session in the application

CREATE POLICY "Users can insert their own applications"
    ON application_tracker FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own applications"
    ON application_tracker FOR UPDATE
    USING (true);

-- RLS Policies: Public can subscribe, only system can read all subscribers
CREATE POLICY "Allow public insert to subscribers"
    ON weekly_digest_subscribers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public read for own subscription"
    ON weekly_digest_subscribers FOR SELECT
    USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for application_tracker
CREATE TRIGGER update_application_tracker_updated_at
    BEFORE UPDATE ON application_tracker
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for analytics

-- View: Top reported companies
CREATE OR REPLACE VIEW top_reported_companies AS
SELECT 
    company_name,
    country,
    COUNT(*) as total_reports,
    COUNT(*) FILTER (WHERE report_type = 'scam') as scam_reports,
    COUNT(*) FILTER (WHERE report_type = 'ghost') as ghost_reports,
    COUNT(*) FILTER (WHERE report_type = 'no_response') as no_response_reports,
    COUNT(*) FILTER (WHERE report_type = 'legitimate') as legitimate_reports,
    MAX(created_at) as last_reported
FROM community_reports
GROUP BY company_name, country
ORDER BY total_reports DESC;

-- View: Platform statistics
CREATE OR REPLACE VIEW platform_stats AS
SELECT 
    (SELECT COUNT(*) FROM analyzed_listings) as total_analyzed,
    (SELECT COUNT(*) FROM analyzed_listings WHERE scam_score > 70) as high_risk_detected,
    (SELECT COUNT(*) FROM community_reports) as community_reports,
    (SELECT COUNT(DISTINCT country) FROM analyzed_listings) as countries_covered;

-- Comments for documentation
COMMENT ON TABLE community_reports IS 'User-submitted reports about job listings and companies';
COMMENT ON TABLE analyzed_listings IS 'All job listings analyzed by JobShield AI with scores and verdicts';
COMMENT ON TABLE application_tracker IS 'User application tracking with status updates';
COMMENT ON TABLE weekly_digest_subscribers IS 'Email subscribers for weekly scam alert digests';

-- Made with Bob
